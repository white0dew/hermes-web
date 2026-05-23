"""Hermes Web dashboard plugin backend.

Self-contained SQLite readers for request snapshots and usage analytics.
"""

from __future__ import annotations

import json
import os
import re
import sqlite3
from functools import lru_cache
from contextlib import contextmanager
from datetime import datetime, time, timedelta
from pathlib import Path
from typing import Any, Iterable, Iterator, Optional

from fastapi import APIRouter, HTTPException, Query
from hermes_constants import reset_hermes_home_override, set_hermes_home_override
from hermes_cli.profiles import resolve_profile_env
from tools.skills_tool import _find_all_skills

router = APIRouter()

_CONTENT_JSON_PREFIX = "\x00json:"
_SKILL_VIEW_RE = re.compile(r"^\[skill_view\]\s+name=(.+?)(?:\s+\(|\s*$)")
_SKILL_MANAGE_RE = re.compile(r"^\[skill_manage\]\s+name=(.+?)(?:\s+|\(|$)")
_SKILL_MANAGE_QUOTED_RE = re.compile(r"""skill ['"]([^'"]+)['"]""", re.IGNORECASE)
_SKILL_MANAGE_NAME_RE = re.compile(r"\bname=([^\s)]+)", re.IGNORECASE)


def _hermes_home() -> Path:
    raw = os.environ.get("HERMES_HOME")
    if raw:
        return Path(raw).expanduser()
    return Path.home() / ".hermes"


def _db_path() -> Path:
    return _hermes_home() / "state.db"


def _profile_db_map() -> dict[str, Path]:
    mapping: dict[str, Path] = {}
    default_db = _db_path()
    if default_db.exists():
        mapping["default"] = default_db
    profiles_root = _hermes_home() / "profiles"
    if profiles_root.exists():
        for child in sorted(profiles_root.iterdir(), key=lambda item: item.name.lower()):
            if not child.is_dir():
                continue
            db_path = child / "state.db"
            if db_path.exists():
                mapping[child.name] = db_path
    return mapping


def _normalize_profile_filter(value: Optional[str]) -> str:
    text = str(value or "all").strip().lower()
    return text or "all"


def _resolve_skill_profile_dbs(profile_filter: Optional[str]) -> dict[str, Path]:
    profile_map = _profile_db_map()
    normalized = _normalize_profile_filter(profile_filter)
    if normalized == "all":
        return profile_map
    if normalized in profile_map:
        return {normalized: profile_map[normalized]}
    raise HTTPException(status_code=404, detail=f"Unknown profile: {profile_filter}")


@contextmanager
def _connect() -> Iterator[sqlite3.Connection]:
    db_path = _db_path()
    if not db_path.exists():
        raise HTTPException(status_code=503, detail=f"state.db not found at {db_path}")

    conn = sqlite3.connect(
        f"file:{db_path}?mode=ro",
        uri=True,
        timeout=2.0,
    )
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    except sqlite3.DatabaseError as exc:
        raise HTTPException(status_code=500, detail=f"SQLite query failed: {exc}") from exc
    finally:
        conn.close()


def _fetch_all(query: str, params: Iterable[Any] = ()) -> list[dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(query, tuple(params)).fetchall()
    return [dict(row) for row in rows]


def _fetch_one(query: str, params: Iterable[Any] = ()) -> Optional[dict[str, Any]]:
    with _connect() as conn:
        row = conn.execute(query, tuple(params)).fetchone()
    return dict(row) if row else None


def _fetch_all_from_db(db_path: Path, query: str, params: Iterable[Any] = ()) -> list[dict[str, Any]]:
    if not db_path.exists():
        return []
    conn = sqlite3.connect(
        f"file:{db_path}?mode=ro",
        uri=True,
        timeout=2.0,
    )
    conn.row_factory = sqlite3.Row
    try:
        rows = conn.execute(query, tuple(params)).fetchall()
        return [dict(row) for row in rows]
    except sqlite3.DatabaseError as exc:
        raise HTTPException(status_code=500, detail=f"SQLite query failed: {exc}") from exc
    finally:
        conn.close()


def _parse_json_field(value: Any) -> Any:
    if value is None or value == "":
        return {}
    if isinstance(value, (dict, list)):
        return value
    if not isinstance(value, str):
        return value
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return value


def _parse_json_object(value: Any) -> dict[str, Any]:
    parsed = _parse_json_field(value)
    return parsed if isinstance(parsed, dict) else {}


def _decode_content(value: Any) -> Any:
    if isinstance(value, str) and value.startswith(_CONTENT_JSON_PREFIX):
        payload = value[len(_CONTENT_JSON_PREFIX):]
        try:
            return json.loads(payload)
        except json.JSONDecodeError:
            return value
    return value


def _previewable_text(value: Any) -> str:
    decoded = _decode_content(value)
    if decoded is None:
        return ""
    if isinstance(decoded, str):
        return decoded
    try:
        return json.dumps(decoded, ensure_ascii=False)
    except (TypeError, ValueError):
        return str(decoded)


def _get_session(session_id: str) -> Optional[dict[str, Any]]:
    return _fetch_one("SELECT * FROM sessions WHERE id = ?", (session_id,))


def _list_sessions(limit: int, offset: int, query_text: str) -> list[dict[str, Any]]:
    like = f"%{query_text}%"
    rows = _fetch_all(
        """
        WITH ranked_requests AS (
            SELECT
                r.session_id,
                r.id,
                r.request_started_at,
                r.approx_total_tokens,
                r.approx_system_tokens,
                r.approx_prefill_tokens,
                r.approx_tools_tokens,
                ROW_NUMBER() OVER (
                    PARTITION BY r.session_id
                    ORDER BY r.request_started_at ASC, r.id ASC
                ) AS first_rank,
                ROW_NUMBER() OVER (
                    PARTITION BY r.session_id
                    ORDER BY r.request_started_at DESC, r.id DESC
                ) AS last_rank
            FROM llm_request_snapshots AS r NOT INDEXED
        ),
        session_request_stats AS (
            SELECT
                session_id,
                MAX(CASE WHEN last_rank = 1 THEN request_started_at END) AS last_request_at,
                MAX(CASE WHEN first_rank = 1 THEN approx_total_tokens END) AS first_request_tokens,
                MAX(CASE WHEN first_rank = 1 THEN approx_system_tokens END) AS first_request_system_tokens,
                MAX(CASE WHEN first_rank = 1 THEN approx_prefill_tokens END) AS first_request_prefill_tokens,
                MAX(CASE WHEN first_rank = 1 THEN approx_tools_tokens END) AS first_request_tools_tokens
            FROM ranked_requests
            GROUP BY session_id
        ),
        session_rows AS (
            SELECT
                s.id,
                s.source,
                s.title,
                s.started_at,
                srs.last_request_at,
                srs.first_request_tokens,
                srs.first_request_system_tokens,
                srs.first_request_prefill_tokens,
                srs.first_request_tools_tokens,
                COALESCE(
                    (
                        SELECT m.content
                        FROM messages AS m
                        WHERE m.session_id = s.id
                          AND m.role = 'user'
                          AND m.content IS NOT NULL
                        ORDER BY m.timestamp ASC, m.id ASC
                        LIMIT 1
                    ),
                    ''
                ) AS first_user_message
            FROM session_request_stats AS srs
            JOIN sessions AS s
              ON s.id = srs.session_id
        )
        SELECT *
        FROM session_rows
        WHERE (
            ? = ''
            OR id LIKE ?
            OR COALESCE(title, '') LIKE ?
            OR first_user_message LIKE ?
        )
        ORDER BY COALESCE(last_request_at, started_at) DESC, started_at DESC
        LIMIT ? OFFSET ?
        """,
        (query_text, like, like, like, limit, offset),
    )

    for row in rows:
        row["first_user_message"] = _previewable_text(row.get("first_user_message"))
    return rows


def _list_request_snapshots(session_id: str, limit: int) -> list[dict[str, Any]]:
    return _fetch_all(
        """
        SELECT
            id,
            session_id,
            task_id,
            turn_index,
            api_call_index,
            request_started_at,
            provider,
            billing_base_url,
            api_mode,
            model,
            is_first_turn,
            approx_total_tokens,
            approx_message_tokens,
            approx_history_tokens,
            approx_system_tokens,
            approx_prefill_tokens,
            approx_tools_tokens,
            approx_injected_context_tokens,
            message_count,
            history_message_count,
            prefill_count,
            tool_count
        FROM llm_request_snapshots
        WHERE session_id = ?
        ORDER BY request_started_at DESC, id DESC
        LIMIT ?
        """,
        (session_id, limit),
    )


def _get_request_snapshot(snapshot_id: int) -> Optional[dict[str, Any]]:
    row = _fetch_one("SELECT * FROM llm_request_snapshots WHERE id = ?", (snapshot_id,))
    if not row:
        return None
    row["request_payload"] = _parse_json_field(row.get("request_payload"))
    row["request_summary"] = _parse_json_field(row.get("request_summary"))
    return row


def _usage_cutoff(days: int) -> tuple[float, str, str]:
    now = datetime.now().astimezone()
    end_day = now.date()
    start_day = end_day - timedelta(days=days - 1)
    start_dt = datetime.combine(start_day, time.min, tzinfo=now.tzinfo)
    return start_dt.timestamp(), start_day.isoformat(), end_day.isoformat()


def _usage_select_sql(day_expr: Optional[str] = None) -> str:
    pieces = []
    if day_expr:
        pieces.append(f"{day_expr} AS day")
    pieces.extend(
        [
            "COUNT(*) AS sessions_started",
            """
            SUM(
                CASE
                    WHEN (
                        COALESCE(input_tokens, 0) +
                        COALESCE(output_tokens, 0) +
                        COALESCE(cache_read_tokens, 0) +
                        COALESCE(cache_write_tokens, 0) +
                        COALESCE(reasoning_tokens, 0) +
                        COALESCE(api_call_count, 0)
                    ) > 0 THEN 1 ELSE 0
                END
            ) AS sessions_with_usage
            """,
            "COALESCE(SUM(input_tokens), 0) AS input_tokens",
            "COALESCE(SUM(output_tokens), 0) AS output_tokens",
            "COALESCE(SUM(cache_read_tokens), 0) AS cache_read_tokens",
            "COALESCE(SUM(cache_write_tokens), 0) AS cache_write_tokens",
            "COALESCE(SUM(reasoning_tokens), 0) AS reasoning_tokens",
            "COALESCE(SUM(api_call_count), 0) AS api_calls",
        ]
    )
    return ",\n".join(piece.strip() for piece in pieces)


def _finalize_usage_metrics(row: dict[str, Any]) -> dict[str, Any]:
    input_tokens = int(row.get("input_tokens") or 0)
    output_tokens = int(row.get("output_tokens") or 0)
    cache_read_tokens = int(row.get("cache_read_tokens") or 0)
    cache_write_tokens = int(row.get("cache_write_tokens") or 0)
    reasoning_tokens = int(row.get("reasoning_tokens") or 0)
    api_calls = int(row.get("api_calls") or 0)
    sessions_started = int(row.get("sessions_started") or 0)
    sessions_with_usage = int(row.get("sessions_with_usage") or 0)

    prompt_side_total = input_tokens + cache_read_tokens + cache_write_tokens
    hit_denominator = input_tokens + cache_read_tokens
    hit_write_denominator = input_tokens + cache_read_tokens + cache_write_tokens

    row.update(
        {
            "sessions_started": sessions_started,
            "sessions_with_usage": sessions_with_usage,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cache_read_tokens": cache_read_tokens,
            "cache_write_tokens": cache_write_tokens,
            "reasoning_tokens": reasoning_tokens,
            "api_calls": api_calls,
            "prompt_side_total": prompt_side_total,
            "cache_hit_rate_pct": (cache_read_tokens / hit_denominator * 100.0) if hit_denominator else 0.0,
            "cache_hit_rate_incl_write_pct": (
                cache_read_tokens / hit_write_denominator * 100.0
            ) if hit_write_denominator else 0.0,
            "cache_read_vs_input_ratio": (cache_read_tokens / input_tokens) if input_tokens else 0.0,
        }
    )
    return row


def _usage_totals(days: int) -> dict[str, Any]:
    cutoff_ts, start_day, end_day = _usage_cutoff(days)

    totals = _fetch_one(
        f"""
        SELECT
            {_usage_select_sql()}
        FROM sessions
        WHERE started_at >= ?
        """,
        (cutoff_ts,),
    ) or {}
    totals = _finalize_usage_metrics(totals)

    grouped = _fetch_all(
        f"""
        SELECT
            COALESCE(NULLIF(billing_provider, ''), 'unknown') AS provider,
            COALESCE(NULLIF(model, ''), 'unknown') AS model,
            {_usage_select_sql()}
        FROM sessions
        WHERE started_at >= ?
        GROUP BY provider, model
        ORDER BY input_tokens DESC, cache_read_tokens DESC, sessions_started DESC, provider ASC, model ASC
        """,
        (cutoff_ts,),
    )
    grouped = [_finalize_usage_metrics(row) for row in grouped]

    daily_rows = _fetch_all(
        f"""
        SELECT
            {_usage_select_sql("date(started_at, 'unixepoch', 'localtime')")}
        FROM sessions
        WHERE started_at >= ?
        GROUP BY day
        ORDER BY day ASC
        """,
        (cutoff_ts,),
    )
    daily_map = {
        row["day"]: _finalize_usage_metrics(row)
        for row in daily_rows
        if row.get("day")
    }

    by_day = []
    current = datetime.fromisoformat(start_day).date()
    last = datetime.fromisoformat(end_day).date()
    while current <= last:
        key = current.isoformat()
        row = daily_map.get(key)
        if row is None:
            row = _finalize_usage_metrics(
                {
                    "day": key,
                    "sessions_started": 0,
                    "sessions_with_usage": 0,
                    "input_tokens": 0,
                    "output_tokens": 0,
                    "cache_read_tokens": 0,
                    "cache_write_tokens": 0,
                    "reasoning_tokens": 0,
                    "api_calls": 0,
                }
            )
        by_day.append(row)
        current += timedelta(days=1)

    return {
        "days": days,
        "date_from": start_day,
        "date_to": end_day,
        "totals": totals,
        "by_model_provider": grouped,
        "by_day": by_day,
    }


def _extract_skill_name_from_view_content(content: Any) -> str:
    text = str(content or "")
    match = _SKILL_VIEW_RE.match(text)
    if match and match.group(1):
        return match.group(1).strip()

    parsed = _parse_json_object(content)
    name = parsed.get("name")
    return str(name).strip() if isinstance(name, str) else ""


def _extract_skill_name_from_manage_content(content: Any) -> str:
    text = str(content or "")
    match = _SKILL_MANAGE_RE.match(text)
    if match and match.group(1):
        return match.group(1).strip()

    parsed = _parse_json_object(content)
    message = parsed.get("message") if isinstance(parsed.get("message"), str) else text

    quoted = _SKILL_MANAGE_QUOTED_RE.search(message)
    if quoted and quoted.group(1):
        return quoted.group(1).strip()

    named = _SKILL_MANAGE_NAME_RE.search(message)
    if named and named.group(1):
        return named.group(1).strip()

    return ""


def _extract_skill_tool_call(row: dict[str, Any]) -> Optional[dict[str, str]]:
    tool_call_id = row.get("tool_call_id")
    raw_tool_calls = row.get("assistant_tool_calls")
    if not isinstance(tool_call_id, str) or not tool_call_id or not isinstance(raw_tool_calls, str) or not raw_tool_calls:
        return None

    parsed = _parse_json_field(raw_tool_calls)
    calls = parsed if isinstance(parsed, list) else [parsed]
    for call in calls:
        if not isinstance(call, dict):
            continue

        function_record = call.get("function") if isinstance(call.get("function"), dict) else {}
        ids = [
            call.get("id"),
            call.get("call_id"),
            call.get("tool_call_id"),
            function_record.get("call_id") if isinstance(function_record, dict) else None,
        ]
        ids = [value for value in ids if isinstance(value, str)]
        if tool_call_id not in ids:
            continue

        name = ""
        if isinstance(function_record, dict) and isinstance(function_record.get("name"), str):
            name = function_record["name"]
        elif isinstance(call.get("name"), str):
            name = call["name"]

        if name == "skill_view":
            action = "view"
        elif name == "skill_manage":
            action = "manage"
        else:
            return None

        args = _parse_json_object(
            function_record.get("arguments") if isinstance(function_record, dict) else call.get("arguments")
        )
        skill = args.get("name")
        if not isinstance(skill, str) or not skill.strip():
            return None
        return {"action": action, "skill": skill.strip()}

    return None


def _normalize_timestamp(value: Any) -> Optional[int]:
    try:
        number = int(float(value))
    except (TypeError, ValueError):
        return None
    return number if number >= 0 else None


def _map_skill_usage_event(row: dict[str, Any]) -> Optional[dict[str, Any]]:
    content = row.get("content") if isinstance(row.get("content"), str) else ""
    tool_name = row.get("tool_name") if isinstance(row.get("tool_name"), str) else ""
    tool_call = _extract_skill_tool_call(row)

    if tool_name == "skill_view" or content.startswith("[skill_view]"):
        action = "view"
    elif tool_name == "skill_manage" or content.startswith("[skill_manage]"):
        action = "manage"
    elif tool_call:
        action = tool_call["action"]
    else:
        action = None

    if not action:
        return None

    skill = (
        tool_call["skill"]
        if tool_call and tool_call.get("skill")
        else _extract_skill_name_from_view_content(content)
        if action == "view"
        else _extract_skill_name_from_manage_content(content)
    )
    if not skill:
        return None

    return {
        "skill": skill,
        "action": action,
        "timestamp": _normalize_timestamp(row.get("timestamp")),
    }


def _skill_usage_cutoff(days: int) -> tuple[float, str, str]:
    now = datetime.now().astimezone()
    end_day = now.date()
    start_day = end_day - timedelta(days=days - 1)
    start_dt = datetime.combine(start_day, time.min, tzinfo=now.tzinfo)
    return start_dt.timestamp(), start_day.isoformat(), end_day.isoformat()


def _format_local_day(timestamp: Optional[int]) -> Optional[str]:
    if timestamp is None:
        return None
    try:
        return datetime.fromtimestamp(timestamp).astimezone().date().isoformat()
    except (OSError, OverflowError, ValueError):
        return None


def _profile_home(profile_name: str) -> Path:
    normalized = str(profile_name or "").strip().lower()
    if normalized in ("", "default"):
        return _hermes_home()
    return Path(resolve_profile_env(normalized)).expanduser()


@lru_cache(maxsize=16)
def _list_enabled_skills_for_profile(profile_name: str) -> list[str]:
    token = set_hermes_home_override(_profile_home(profile_name))
    try:
        skills = _find_all_skills()
    finally:
        reset_hermes_home_override(token)

    discovered: dict[str, str] = {}
    for skill in skills:
        name = str(skill.get("name") or "").strip()
        if not name:
            continue
        key = name.lower()
        if key not in discovered:
            discovered[key] = name
    return sorted(discovered.values(), key=lambda item: item.lower())


def _list_enabled_skills(profile_filter: Optional[str]) -> list[str]:
    selected_profiles = _resolve_skill_profile_dbs(profile_filter)
    discovered: dict[str, str] = {}
    for profile_name in selected_profiles.keys():
        for skill_name in _list_enabled_skills_for_profile(profile_name):
            key = skill_name.lower()
            if key not in discovered:
                discovered[key] = skill_name
    return sorted(discovered.values(), key=lambda item: item.lower())


def _list_skill_profiles() -> list[dict[str, str]]:
    profile_map = _profile_db_map()
    return [
        {"id": profile_name, "label": profile_name, "db_path": str(db_path)}
        for profile_name, db_path in profile_map.items()
    ]


def _skill_usage_totals(days: int, profile_filter: Optional[str] = None) -> dict[str, Any]:
    cutoff_ts, start_day, end_day = _skill_usage_cutoff(days)
    tool_predicate = """
        m.role = 'tool'
        AND (
            m.tool_name IN ('skill_view', 'skill_manage')
            OR m.content LIKE '[skill_view]%'
            OR m.content LIKE '[skill_manage]%'
            OR m.tool_call_id IS NOT NULL
        )
    """

    recent_sql = f"""
        SELECT
            m.tool_name,
            m.tool_call_id,
            SUBSTR(m.content, 1, 300) AS content,
            COALESCE(m.timestamp, s.started_at) AS timestamp,
            (
                SELECT a.tool_calls
                FROM messages AS a
                WHERE a.session_id = m.session_id
                  AND a.role = 'assistant'
                  AND m.tool_call_id IS NOT NULL
                  AND a.tool_calls LIKE '%' || m.tool_call_id || '%'
                ORDER BY a.timestamp DESC
                LIMIT 1
            ) AS assistant_tool_calls
        FROM sessions AS s
        JOIN messages AS m ON m.session_id = s.id
        WHERE s.started_at > ?
          AND {tool_predicate}
        """

    late_sql = f"""
        SELECT
            m.tool_name,
            m.tool_call_id,
            SUBSTR(m.content, 1, 300) AS content,
            COALESCE(m.timestamp, s.started_at) AS timestamp,
            (
                SELECT a.tool_calls
                FROM messages AS a
                WHERE a.session_id = m.session_id
                  AND a.role = 'assistant'
                  AND m.tool_call_id IS NOT NULL
                  AND a.tool_calls LIKE '%' || m.tool_call_id || '%'
                ORDER BY a.timestamp DESC
                LIMIT 1
            ) AS assistant_tool_calls
        FROM sessions AS s
        JOIN messages AS m ON m.session_id = s.id
        WHERE s.started_at <= ?
          AND COALESCE(m.timestamp, s.started_at) > ?
          AND {tool_predicate}
        """

    skill_map: dict[str, dict[str, Any]] = {}
    day_map: dict[str, dict[str, Any]] = {}
    day_skill_map: dict[str, dict[str, dict[str, int | str]]] = {}
    selected_profiles = _resolve_skill_profile_dbs(profile_filter)
    profiles_summary = [
        {"id": profile_name, "label": profile_name}
        for profile_name in selected_profiles.keys()
    ]

    for profile_name, db_path in selected_profiles.items():
        recent_rows = _fetch_all_from_db(db_path, recent_sql, (cutoff_ts,))
        late_rows = _fetch_all_from_db(db_path, late_sql, (cutoff_ts, cutoff_ts))
        for row in [*recent_rows, *late_rows]:
            event = _map_skill_usage_event(row)
            if not event:
                continue

            skill_name = str(event["skill"])
            action = str(event["action"])
            timestamp = event.get("timestamp")

            entry = skill_map.get(skill_name)
            if entry is None:
                entry = {
                    "skill": skill_name,
                    "view_count": 0,
                    "manage_count": 0,
                    "last_used_at": None,
                    "profiles": {},
                }
                skill_map[skill_name] = entry
            if action == "view":
                entry["view_count"] += 1
            else:
                entry["manage_count"] += 1
            if isinstance(timestamp, int) and (entry["last_used_at"] is None or timestamp > entry["last_used_at"]):
                entry["last_used_at"] = timestamp

            profile_entry = entry["profiles"].get(profile_name)
            if profile_entry is None:
                profile_entry = {"profile": profile_name, "view_count": 0, "manage_count": 0}
                entry["profiles"][profile_name] = profile_entry
            if action == "view":
                profile_entry["view_count"] += 1
            else:
                profile_entry["manage_count"] += 1

            day_key = _format_local_day(timestamp)
            if not day_key:
                continue

            day_entry = day_map.get(day_key)
            if day_entry is None:
                day_entry = {"date": day_key, "view_count": 0, "manage_count": 0}
                day_map[day_key] = day_entry
            if action == "view":
                day_entry["view_count"] += 1
            else:
                day_entry["manage_count"] += 1

            skill_entries = day_skill_map.setdefault(day_key, {})
            skill_entry = skill_entries.get(skill_name)
            if skill_entry is None:
                skill_entry = {"skill": skill_name, "view_count": 0, "manage_count": 0, "profiles": {}}
                skill_entries[skill_name] = skill_entry
            if action == "view":
                skill_entry["view_count"] += 1
            else:
                skill_entry["manage_count"] += 1

            day_profile_entry = skill_entry["profiles"].get(profile_name)
            if day_profile_entry is None:
                day_profile_entry = {"profile": profile_name, "view_count": 0, "manage_count": 0}
                skill_entry["profiles"][profile_name] = day_profile_entry
            if action == "view":
                day_profile_entry["view_count"] += 1
            else:
                day_profile_entry["manage_count"] += 1

    total_loads = sum(int(skill["view_count"]) for skill in skill_map.values())
    total_edits = sum(int(skill["manage_count"]) for skill in skill_map.values())
    total_actions = total_loads + total_edits

    by_day: list[dict[str, Any]] = []
    current = datetime.fromisoformat(start_day).date()
    last = datetime.fromisoformat(end_day).date()
    while current <= last:
        date_key = current.isoformat()
        base = day_map.get(date_key) or {"date": date_key, "view_count": 0, "manage_count": 0}
        skills = list((day_skill_map.get(date_key) or {}).values())
        skills.sort(
            key=lambda item: (
                -(int(item["view_count"]) + int(item["manage_count"])),
                str(item["skill"]).lower(),
            )
        )
        by_day.append(
            {
                "date": date_key,
                "view_count": int(base["view_count"]),
                "manage_count": int(base["manage_count"]),
                "total_count": int(base["view_count"]) + int(base["manage_count"]),
                "skills": [
                    {
                        "skill": str(skill["skill"]),
                        "view_count": int(skill["view_count"]),
                        "manage_count": int(skill["manage_count"]),
                        "total_count": int(skill["view_count"]) + int(skill["manage_count"]),
                        "profiles": [
                            {
                                "profile": str(profile_row["profile"]),
                                "view_count": int(profile_row["view_count"]),
                                "manage_count": int(profile_row["manage_count"]),
                                "total_count": int(profile_row["view_count"]) + int(profile_row["manage_count"]),
                            }
                            for profile_row in sorted(
                                skill.get("profiles", {}).values(),
                                key=lambda item: (
                                    -(int(item["view_count"]) + int(item["manage_count"])),
                                    str(item["profile"]).lower(),
                                ),
                            )
                        ],
                    }
                    for skill in skills
                ],
            }
        )
        current += timedelta(days=1)

    top_skills = [
        {
            "skill": str(skill["skill"]),
            "view_count": int(skill["view_count"]),
            "manage_count": int(skill["manage_count"]),
            "total_count": int(skill["view_count"]) + int(skill["manage_count"]),
            "percentage": (
                (int(skill["view_count"]) + int(skill["manage_count"])) / total_actions * 100.0
                if total_actions
                else 0.0
            ),
            "last_used_at": skill["last_used_at"],
            "profiles": [
                {
                    "profile": str(profile_row["profile"]),
                    "view_count": int(profile_row["view_count"]),
                    "manage_count": int(profile_row["manage_count"]),
                    "total_count": int(profile_row["view_count"]) + int(profile_row["manage_count"]),
                }
                for profile_row in sorted(
                    skill.get("profiles", {}).values(),
                    key=lambda item: (
                        -(int(item["view_count"]) + int(item["manage_count"])),
                        str(item["profile"]).lower(),
                    ),
                )
            ],
        }
        for skill in skill_map.values()
    ]
    top_skills.sort(
        key=lambda item: (
            -int(item["total_count"]),
            -int(item["view_count"]),
            -int(item["manage_count"]),
            -(int(item["last_used_at"]) if isinstance(item["last_used_at"], int) else 0),
            str(item["skill"]).lower(),
        )
    )

    enabled_skills = _list_enabled_skills(profile_filter)
    used_skill_keys = {str(skill_name).strip().lower() for skill_name in skill_map.keys()}
    unused_skills = [
        {
            "skill": skill_name,
            "view_count": 0,
            "manage_count": 0,
            "total_count": 0,
            "percentage": 0.0,
            "last_used_at": None,
        }
        for skill_name in enabled_skills
        if skill_name.strip().lower() not in used_skill_keys
    ]

    return {
        "days": days,
        "profile": _normalize_profile_filter(profile_filter),
        "profiles": _list_skill_profiles(),
        "selected_profiles": profiles_summary,
        "date_from": start_day,
        "date_to": end_day,
        "summary": {
            "total_skill_loads": total_loads,
            "total_skill_edits": total_edits,
            "total_skill_actions": total_actions,
            "distinct_skills_used": len(skill_map),
            "distinct_skills_known": len(enabled_skills),
            "distinct_skills_unused": len(unused_skills),
        },
        "by_day": by_day,
        "top_skills": top_skills,
        "unused_skills": unused_skills,
    }


@router.get("/sessions")
def list_sessions(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    q: str = Query("", description="Search session id, title, or first user message"),
):
    rows = _list_sessions(limit=limit + 1, offset=offset, query_text=(q or "").strip())
    has_more = len(rows) > limit
    if has_more:
        rows = rows[:limit]
    return {
        "sessions": rows,
        "offset": offset,
        "limit": limit,
        "has_more": has_more,
    }


@router.get("/sessions/{session_id}/requests")
def list_requests(
    session_id: str,
    limit: int = Query(200, ge=1, le=500),
):
    session = _get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session": session,
        "requests": _list_request_snapshots(session_id, limit=limit),
    }


@router.get("/requests/{snapshot_id}")
def get_request(snapshot_id: int):
    snapshot = _get_request_snapshot(snapshot_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="Request snapshot not found")
    return snapshot


@router.get("/usage")
def get_usage(days: int = Query(7, ge=1, le=365)):
    return _usage_totals(days)


@router.get("/profiles")
def list_profiles():
    return {
        "profiles": [{"id": "all", "label": "all"}] + [
            {"id": row["id"], "label": row["label"]}
            for row in _list_skill_profiles()
        ]
    }


@router.get("/skills")
def get_skills(
    days: int = Query(7, ge=1, le=365),
    profile: str = Query("all", description="Profile id or 'all'"),
):
    return _skill_usage_totals(days, profile_filter=profile)
