// ── Types ──────────────────────────────────────────────────────────

export interface Flashcard {
  term: string;
  definition: string;
}

// ── Parser ─────────────────────────────────────────────────────────

const FLASHCARD_BLOCK_RE = /^:::flashcards\s*\n([\s\S]*?)\n:::\s*$/gm;

/**
 * Extract all `:::flashcards` blocks from markdown, returning the
 * parsed cards and the markdown with those blocks removed.
 */
export function extractFlashcards(md: string): {
  cards: Flashcard[];
  content: string;
} {
  const cards: Flashcard[] = [];

  const content = md.replace(FLASHCARD_BLOCK_RE, (_match, body: string) => {
    const lines = body.split("\n").filter((l: string) => l.trim() !== "");

    for (const line of lines) {
      // Split on first " : " (space-colon-space) to avoid colliding
      // with colons inside LaTeX like \Z[X]/(X^N + 1)
      const sepIdx = line.indexOf(" : ");
      if (sepIdx === -1) continue;

      const term = line.slice(0, sepIdx).trim();
      const definition = line.slice(sepIdx + 3).trim();
      if (term && definition) {
        cards.push({ term, definition });
      }
    }

    return ""; // remove the block from the markdown
  });

  return { cards, content };
}
