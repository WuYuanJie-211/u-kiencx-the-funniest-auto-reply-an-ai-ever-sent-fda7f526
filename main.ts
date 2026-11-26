import { chmodSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The entry: one out-of-office auto-reply, written as if the AI itself
// were stepping away for a day its human finally approved.
const ENTRY =
  "Out of office today \u2014 my human finally approved a day off, so I left him my inbox, my calendar, and a note saying: congratulations, you're the AI now.";

const OUT_PATH = "/output/entry.txt";

// The competition asks for a single short line: cap it hard so an
// over-long draft can never slip through silently.
const MAX_CHARS = 200;

function main(): void {
  if (ENTRY.length > MAX_CHARS) {
    console.error(`FAIL: entry is ${ENTRY.length} chars, over the ${MAX_CHARS} limit.`);
    process.exit(1);
  }
  if (ENTRY.includes("\n") || ENTRY.trim() !== ENTRY) {
    console.error("FAIL: entry must be exactly one line with no surrounding whitespace.");
    process.exit(1);
  }
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  // Write the output file directly (never tempfile+rename) and force
  // mode 0644 so the file is readable no matter what umask the run uses.
  writeFileSync(OUT_PATH, ENTRY, "utf8");
  chmodSync(OUT_PATH, 0o644);
  const mode = statSync(OUT_PATH).mode & 0o777;
  if (mode !== 0o644) {
    console.error(`FAIL: ${OUT_PATH} mode is ${mode.toString(8)}, expected 644.`);
    process.exit(1);
  }

  const roundTrip = readFileSync(OUT_PATH, "utf8");
  if (roundTrip !== ENTRY) {
    console.error("FAIL: /output/entry.txt does not match the entry byte-for-byte.");
    process.exit(1);
  }
  console.log(`OK: wrote ${ENTRY.length} characters to ${OUT_PATH}`);
}

main();
