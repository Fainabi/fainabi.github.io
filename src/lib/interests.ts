// ── Parser ─────────────────────────────────────────────────────────

const INTERESTS_BLOCK_RE = /^:::interests\s*\n([\s\S]*?)\n:::\s*$/gm;

/**
 * Extract `:::interests` blocks from markdown. Returns the list of
 * interest items and the markdown with the block removed.
 *
 * Each non-empty line inside the block is one interest item.
 */
export function extractInterests(md: string): {
  interests: string[];
  content: string;
} {
  const interests: string[] = [];

  const content = md.replace(INTERESTS_BLOCK_RE, (_match, body: string) => {
    const lines = (body as string)
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l !== "");

    interests.push(...lines);
    return "";
  });

  return { interests, content };
}
