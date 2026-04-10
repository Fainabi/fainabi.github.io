import type { CSSProperties } from "react";

/** Single source of truth for fenced / subblock code typography (avoids gutter drift). */
export const FENCED_CODE_FONT_SIZE = "0.875rem";
export const FENCED_CODE_LINE_HEIGHT = "1.7";

/** Visual match for fenced ``` blocks (MarkdownRenderer PreBlock). */
export const fencedCodeHighlighterCustomStyle: CSSProperties = {
  margin: 0,
  borderRadius: "0.5rem",
  border: "1px solid var(--border)",
  background: "var(--muted)",
  padding: "1rem",
  overflowX: "auto",
  fontSize: FENCED_CODE_FONT_SIZE,
  lineHeight: FENCED_CODE_LINE_HEIGHT,
};

/** Typography treats `code` as semibold; `pre code` resets to 400. We use `PreTag="div"`, so this matches prose + subblocks inside `not-prose`. */
export const fencedCodeHighlighterCodeTagStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontWeight: 600,
  margin: 0,
  padding: 0,
  display: "block",
  textIndent: 0,
  whiteSpace: "pre",
};

/** One text line box height (font-size × line-height), for chevrons / accent bars. */
export const fencedCodeLineBoxHeight = `calc(${FENCED_CODE_FONT_SIZE} * ${FENCED_CODE_LINE_HEIGHT})`;
