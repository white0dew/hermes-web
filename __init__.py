"""Hermes Web plugin hooks.

Keeps request snapshot capture co-located with the Hermes Web dashboard plugin.
"""

from __future__ import annotations

import json
import logging
import os
import sqlite3
import threading
import time
from pathlib import Path
from typing import Any

_WRITE_LOCK = threading.Lock()
_LOG = logging.getLogger("hermes_web.request_snapshots")


def register(ctx) -> None:
    ctx.register_hook("pre_api_request", _record_request_snapshot)


def _record_request_snapshot(**kwargs: Any) -> None:
    session_id = str(kwargs.get("session_id") or "").strip()
    if not session_id:
        return

    request_messages = _coerce_message_list(kwargs.get("request_messages"))
    conversation_history = _coerce_message_list(kwargs.get("conversation_history"))
    message_count = _safe_int(kwargs.get("message_count"), default=len(request_messages))
    tool_count = _safe_int(kwargs.get("tool_count"))
    approx_total_tokens = _safe_int(kwargs.get("approx_input_tokens"))
    history_message_count = len(conversation_history)
    turn_index = _infer_turn_index(conversation_history, request_messages)
    system_chars = _message_chars(
        msg for msg in request_messages if _message_role(msg) in {"system", "developer"}
    )
    request_chars = _message_chars(
        msg for msg in request_messages if _message_role(msg) not in {"system", "developer"}
    )
    history_chars = _message_chars(conversation_history)
    approx_system_tokens = _chars_to_tokens(system_chars)
    approx_history_tokens = _chars_to_tokens(history_chars)
    approx_message_tokens = _chars_to_tokens(request_chars)
    payload = {
        "messages": request_messages,
        "meta": {
            "provider": kwargs.get("provider"),
            "model": kwargs.get("model"),
            "api_mode": kwargs.get("api_mode"),
            "base_url": kwargs.get("base_url"),
            "max_tokens": kwargs.get("max_tokens"),
            "api_call_count": kwargs.get("api_call_count"),
            "captured_by": "hermes-web",
        },
    }
    summary = {
        "has_system_prompt": system_chars > 0,
        "has_prefill_messages": False,
        "has_memory_context": False,
        "has_plugin_context": False,
        "effective_system_chars": system_chars,
        "memory_context_chars": 0,
        "plugin_context_chars": 0,
        "message_count": message_count,
        "history_message_count": history_message_count,
        "prefill_count": 0,
        "tool_count": tool_count,
        "current_user_turn": turn_index,
        "approx_total_tokens": approx_total_tokens,
        "approx_message_tokens": approx_message_tokens,
        "approx_history_tokens": approx_history_tokens,
        "approx_system_tokens": approx_system_tokens,
        "approx_prefill_tokens": 0,
        "approx_tools_tokens": 0,
        "approx_injected_context_tokens": 0,
    }
    row = (
        session_id,
        _nullable_text(kwargs.get("task_id")),
        turn_index,
        _safe_int(kwargs.get("api_call_count")),
        time.time(),
        _nullable_text(kwargs.get("provider")),
        _nullable_text(kwargs.get("base_url")),
        _nullable_text(kwargs.get("api_mode")),
        _nullable_text(kwargs.get("model")),
        1 if turn_index <= 1 else 0,
        approx_total_tokens,
        approx_message_tokens,
        approx_history_tokens,
        approx_system_tokens,
        0,
        0,
        0,
        message_count,
        history_message_count,
        0,
        tool_count,
        _json_text(payload),
        _json_text(summary),
    )

    try:
        _ensure_schema()
        with _WRITE_LOCK:
            with sqlite3.connect(_state_db_path(), timeout=5.0) as conn:
                conn.execute(
                    """
                    INSERT INTO llm_request_snapshots (
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
                        tool_count,
                        request_payload,
                        request_summary
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    row,
                )
                conn.commit()
    except Exception:
        _LOG.exception("Failed to write llm_request_snapshots row for session %s", session_id)


def _ensure_schema() -> None:
    with _WRITE_LOCK:
        with sqlite3.connect(_state_db_path(), timeout=5.0) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS llm_request_snapshots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL REFERENCES sessions(id),
                    task_id TEXT,
                    turn_index INTEGER,
                    api_call_index INTEGER,
                    request_started_at REAL NOT NULL,
                    provider TEXT,
                    billing_base_url TEXT,
                    api_mode TEXT,
                    model TEXT,
                    is_first_turn INTEGER DEFAULT 0,
                    approx_total_tokens INTEGER,
                    approx_message_tokens INTEGER,
                    approx_history_tokens INTEGER,
                    approx_system_tokens INTEGER,
                    approx_prefill_tokens INTEGER,
                    approx_tools_tokens INTEGER,
                    approx_injected_context_tokens INTEGER,
                    message_count INTEGER DEFAULT 0,
                    history_message_count INTEGER DEFAULT 0,
                    prefill_count INTEGER DEFAULT 0,
                    tool_count INTEGER DEFAULT 0,
                    request_payload TEXT,
                    request_summary TEXT
                )
                """
            )
            conn.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_llm_request_snapshots_session
                ON llm_request_snapshots(session_id, request_started_at DESC)
                """
            )
            conn.commit()


def _state_db_path() -> str:
    hermes_home = os.environ.get("HERMES_HOME")
    if hermes_home:
        return str(Path(hermes_home).expanduser() / "state.db")
    return str(Path(__file__).resolve().parents[2] / "state.db")


def _coerce_message_list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def _message_role(message: Any) -> str:
    if isinstance(message, dict):
        role = message.get("role")
        if isinstance(role, str):
            return role
        msg_type = message.get("type")
        if isinstance(msg_type, str):
            return msg_type
    return ""


def _message_chars(messages: Any) -> int:
    total = 0
    for message in messages:
        total += len(_content_text(message))
    return total


def _content_text(value: Any) -> str:
    if isinstance(value, dict):
        if "content" in value:
            return _content_text(value.get("content"))
        if value.get("type") == "text":
            return str(value.get("text") or "")
        return _json_text(value)
    if isinstance(value, list):
        return "\n".join(_content_text(item) for item in value)
    if value is None:
        return ""
    return str(value)


def _chars_to_tokens(char_count: int) -> int:
    if char_count <= 0:
        return 0
    return max(1, (char_count + 3) // 4)


def _infer_turn_index(conversation_history: list[Any], request_messages: list[Any]) -> int:
    history_users = sum(1 for item in conversation_history if _message_role(item) == "user")
    request_users = sum(1 for item in request_messages if _message_role(item) == "user")
    if request_users > history_users:
        return request_users
    if history_users > 0:
        return history_users
    return 1


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        if value is None:
            return default
        return int(value)
    except (TypeError, ValueError):
        return default


def _nullable_text(value: Any) -> str | None:
    text = str(value or "").strip()
    return text or None


def _json_text(value: Any) -> str:
    try:
        return json.dumps(value, ensure_ascii=False)
    except TypeError:
        return json.dumps(str(value), ensure_ascii=False)
