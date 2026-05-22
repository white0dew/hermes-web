import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");

const files = [
  {
    source: "src/plugin.js",
    target: "dashboard/dist/index.js",
    banner:
      "// Generated from src/plugin.js by scripts/build-plugin.mjs. Do not edit dashboard/dist/index.js directly.\n",
  },
  {
    source: "src/hermes-web.css",
    target: "dashboard/dist/hermes-web.css",
    banner:
      "/* Generated from src/hermes-web.css by scripts/build-plugin.mjs. Do not edit dashboard/dist/hermes-web.css directly. */\n",
  },
];

let dirty = false;

for (const file of files) {
  const sourcePath = resolve(root, file.source);
  const targetPath = resolve(root, file.target);
  const source = await readFile(sourcePath, "utf8");
  const next = file.banner + source;
  let current = "";
  try {
    current = await readFile(targetPath, "utf8");
  } catch {
    current = "";
  }
  if (current !== next) {
    dirty = true;
    if (checkOnly) {
      console.error(`${file.target} is out of date. Run npm run build.`);
    } else {
      await writeFile(targetPath, next);
      console.log(`built ${file.target}`);
    }
  } else if (!checkOnly) {
    console.log(`up to date ${file.target}`);
  }
}

if (checkOnly && dirty) {
  process.exitCode = 1;
}
