import { createHash } from "node:crypto";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const frontendRoot = resolve(import.meta.dirname, "..");
const sourceRoot = process.env.HANZI_WRITER_DATA_DIR;
const hskDatasetPath = resolve(
  frontendRoot,
  "../backend/data/hsk/hsk-3.0-vi.json",
);
const outputDirectory = join(frontendRoot, "public/hsk-strokes");

if (!sourceRoot) {
  throw new Error("HANZI_WRITER_DATA_DIR must point to hanzi-writer-data.");
}

const dataset = JSON.parse(await readFile(hskDatasetPath, "utf8"));
const characters = Array.from(
  new Set(dataset.entries.flatMap((entry) => Array.from(entry.simplified))),
).sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));

await mkdir(outputDirectory, { recursive: true });

const files = [];
for (const character of characters) {
  const sourcePath = join(sourceRoot, "data", character + ".json");
  const targetPath = join(outputDirectory, character + ".json");
  const contents = await readFile(sourcePath);
  await cp(sourcePath, targetPath);
  files.push({
    character,
    sha256: createHash("sha256").update(contents).digest("hex"),
  });
}

await cp(
  join(sourceRoot, "ARPHICPL.TXT"),
  join(outputDirectory, "ARPHICPL.TXT"),
);
await writeFile(
  join(outputDirectory, "sources.lock.json"),
  JSON.stringify(
    {
      schemaVersion: 1,
      source: {
        repository: "https://github.com/chanind/hanzi-writer-data",
        revision: "68d10a4b21150cae5e1ebbd223eed289cf32d90c",
        license: "Arphic Public License",
      },
      characterCount: files.length,
      files,
    },
    null,
    2,
  ) + "\n",
  "utf8",
);
await writeFile(
  join(outputDirectory, "NOTICE.md"),
  [
    "# HanziWriter Stroke Data Notice",
    "",
    "These selected character JSON files are derived from hanzi-writer-data",
    "(Make Me a Hanzi / Arphic font data) at revision",
    "68d10a4b21150cae5e1ebbd223eed289cf32d90c.",
    "",
    "They are distributed under the Arphic Public License. The complete",
    "license text is included unchanged in ARPHICPL.TXT.",
    "",
    "SelfHan selected only characters used by its pinned HSK vocabulary",
    "snapshot on 2026-08-27. No stroke geometry was modified.",
    "",
  ].join("\n"),
  "utf8",
);

process.stdout.write(
  "Prepared " + files.length + " local HSK stroke-data files.\n",
);
