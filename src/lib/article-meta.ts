// ── Types ──────────────────────────────────────────────────────────

export interface ArticleMeta {
  title?: string;
  authors?: string;
  publication?: string;
  reference?: string;
  urls?: string[];
  tags?: string[];
}

// ── Parser ─────────────────────────────────────────────────────────

const META_BLOCK_RE = /^:::meta\s*\n([\s\S]*?)\n:::\s*$/gm;

/**
 * Extract the `:::meta` block from markdown, returning the parsed
 * metadata and the markdown with the block removed.
 */
export function extractMeta(md: string): {
  meta: ArticleMeta;
  content: string;
} {
  const meta: ArticleMeta = {};

  const content = md.replace(META_BLOCK_RE, (_match, body: string) => {
    const lines = (body as string).split("\n").filter((l) => l.trim() !== "");

    for (const line of lines) {
      const sepIdx = line.indexOf(" : ");
      if (sepIdx === -1) continue;

      const key = line.slice(0, sepIdx).trim().toLowerCase();
      const value = line.slice(sepIdx + 3).trim();
      if (!value) continue;

      switch (key) {
        case "title":
          meta.title = value;
          break;
        case "authors":
          meta.authors = value;
          break;
        case "publication":
          meta.publication = value;
          break;
        case "reference":
          meta.reference = value;
          break;
        case "url":
          meta.urls = value.split(",").map((u) => u.trim()).filter(Boolean);
          break;
        case "tags":
          meta.tags = value.split(",").map((t) => t.trim()).filter(Boolean);
          break;
      }
    }

    return ""; // remove the block from the markdown
  });

  return { meta, content };
}

/** Returns true if the meta object has at least one field set. */
export function hasMetaContent(meta: ArticleMeta): boolean {
  return !!(
    meta.title ||
    meta.authors ||
    meta.publication ||
    meta.reference ||
    (meta.urls && meta.urls.length > 0) ||
    (meta.tags && meta.tags.length > 0)
  );
}
