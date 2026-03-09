import fs from "fs";
import path from "path";
import { createHash } from "crypto";

const GENERATED_LILYPOND_DIR = path.join(
  process.cwd(),
  "public",
  "generated",
  "lilypond"
);

function lilypondHash(snippet: string): string {
  const normalized = snippet.replace(/\r\n/g, "\n").trim();
  return createHash("sha1").update(normalized).digest("hex").slice(0, 16);
}

export function replaceLilypondBlocks(markdown: string): string {
  return markdown.replace(
    /:::lilypond(?:\s+([a-zA-Z]+))?\s*\n([\s\S]*?)\n:::/g,
    (full, modeRaw: string | undefined, body: string) => {
      const snippet = body.replace(/\r\n/g, "\n").trim();
      if (!snippet) return full;

      const modeLower = (modeRaw ?? "block").trim().toLowerCase();
      const mode =
        modeLower === "inline" || modeLower === "fullpage"
          ? modeLower
          : "block";

      const hash = lilypondHash(snippet);
      const filePath = path.join(GENERATED_LILYPOND_DIR, `${hash}.svg`);
      if (!fs.existsSync(filePath)) {
        return full;
      }

      return `\n\n![LilyPond score|${mode}](/generated/lilypond/${hash}.svg)\n\n`;
    }
  );
}
