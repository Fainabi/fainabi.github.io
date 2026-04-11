/**
 * Inline anchors stripped from code; extensible for more `[@…]` actions later.
 *
 * - **`lhs=[@from lhs tag]`** → rendered `lhs=lhs`; `[@from]` marks the RHS binding (the value
 *   passed in); hover only that RHS span (`colStart`/`colEnd`).
 * - **`[@to id tag]id.`** → rendered `id.` (e.g. `messages.append`); hover targets only that `id`.
 * - **Standalone** `[@from id tag]` (legacy): whole-line activation if `colStart` omitted.
 */
export interface SubblockLinkAnchor {
  /** 0-based line index in this segment’s final `code`. */
  line: number;
  kind: "from" | "to";
  id: string;
  /** Pairs `[@from id tag]` with `[@to id tag]` for the same `id`. */
  tag: string;
  /** UTF-16 column range in the rendered line; omit = whole-line hover (legacy). */
  colStart?: number;
  colEnd?: number;
}

export interface SubblockSegment {
  code: string;
  description: string;
  context: string;
  /** True when one or more blank lines in source follow the previous `[!!]` before this segment’s code. */
  gapBefore?: boolean;
  /** From `[@from id tag]` / `[@to id tag]` in source; removed from `code`. */
  linkAnchors?: SubblockLinkAnchor[];
}

export interface SubblockConfig {
  language: string;
  title: string;
  segments: SubblockSegment[];
  /**
   * Prefer inline `[@from id tag]` / `[@to id tag]` in the block body (stripped from code;
   * see `SubblockSegment.linkAnchors`). Header `@link` is optional legacy fallback.
   */
  linkIdentifiers?: string[];
  /** Legacy: `@link(id, narrow=kwarg-append)` when not using `[@from]` / `[@to]`. */
  linkKwargAppend?: boolean;
}

const LINK_HEADER_ID_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

const LINK_STANDALONE_RE =
  /\[@(from|to)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+(\S+)\s*\]/g;

/** `lhs=[@kind lhs tag]` → `lhs=lhs` (+ optional comma). */
const LINK_ASSIGN_RE =
  /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\[@(from|to)\s+\1\s+(\S+)\s*\](\s*,)?/;

function processLineLinkAnchors(
  line: string,
  lineIndex: number,
): { text: string; anchors: SubblockLinkAnchor[] } {
  const anchors: SubblockLinkAnchor[] = [];
  let result = line;

  for (;;) {
    const m = result.match(LINK_ASSIGN_RE);
    if (!m || m.index === undefined) break;
    const id = m[1];
    const kind = m[2] as "from" | "to";
    const tag = m[3];
    const comma = m[4] ?? "";
    const start = m.index;
    const repl = `${id}=${id}${comma}`;
    const colStart = start + id.length + 1;
    const colEnd = colStart + id.length;
    anchors.push({
      line: lineIndex,
      kind,
      id,
      tag,
      colStart,
      colEnd,
    });
    result = result.slice(0, start) + repl + result.slice(start + m[0].length);
  }

  for (;;) {
    const m = result.match(
      /\[@(from|to)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+(\S+)\s*\]\2\./,
    );
    if (!m || m.index === undefined) break;
    const kind = m[1] as "from" | "to";
    const id = m[2];
    const tag = m[3];
    const start = m.index;
    const repl = `${id}.`;
    anchors.push({
      line: lineIndex,
      kind,
      id,
      tag,
      colStart: start,
      colEnd: start + id.length,
    });
    result = result.slice(0, start) + repl + result.slice(start + m[0].length);
  }

  LINK_STANDALONE_RE.lastIndex = 0;
  result = result.replace(LINK_STANDALONE_RE, (full, kind, id, tag) => {
    anchors.push({
      line: lineIndex,
      kind: kind as "from" | "to",
      id,
      tag,
    });
    return "";
  });

  return { text: result.replace(/\s+$/, ""), anchors };
}

/**
 * Strip `[@from|@to …]` forms and record anchors (with column ranges when inline).
 */
export function extractAndStripLinkAnchors(code: string): {
  code: string;
  linkAnchors: SubblockLinkAnchor[];
} {
  const lines = code.split("\n");
  const linkAnchors: SubblockLinkAnchor[] = [];
  const outLines = lines.map((line, lineIndex) => {
    const { text, anchors } = processLineLinkAnchors(line, lineIndex);
    linkAnchors.push(...anchors);
    return text;
  });
  return { code: outLines.join("\n"), linkAnchors };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Valid Python-style identifier used in `@link(...)`. */
export function subblockLineHasLinkIdentifier(
  line: string,
  name: string,
): boolean {
  if (!LINK_HEADER_ID_RE.test(name)) return false;
  const escaped = escapeRegExp(name);
  const re = new RegExp(`(?<!\\.)\\b${escaped}\\b`);
  return re.test(line);
}

/** `id=id` keyword-style pass (same identifier both sides). */
export function subblockKwargPassSameIdRange(
  line: string,
  id: string,
): { start: number; end: number } | null {
  if (!LINK_HEADER_ID_RE.test(id)) return null;
  const e = escapeRegExp(id);
  const m = line.match(new RegExp(`\\b${e}\\s*=\\s*${e}\\b`));
  if (!m || m.index === undefined) return null;
  return { start: m.index, end: m.index + m[0].length };
}

/** Receiver before `.append` (not `obj.messages.append` for `id` — still `\b` on id). */
export function subblockLineHasAppendOnId(line: string, id: string): boolean {
  if (!LINK_HEADER_ID_RE.test(id)) return false;
  const e = escapeRegExp(id);
  return new RegExp(`\\b${e}\\.append\\b`).test(line);
}

/** First declared `@link` id that appears on this line (declaration order). */
export function firstLinkIdentifierOnLine(
  line: string,
  identifiers: readonly string[],
): string | null {
  for (const id of identifiers) {
    if (subblockLineHasLinkIdentifier(line, id)) return id;
  }
  return null;
}

const SUBBLOCK_BLOCK_RE = /^:::subblock\s+(.+)\r?\n([\s\S]*?)\r?\n:::\s*$/gm;
/** Everything between `[!!` and `]`; `+gap` / `+nogap` / `+break` / `+endbreak` parsed separately. */
const MARKER_LINE_RE = /^(.*)\[!!\s*([^\]]*)\]\s*(.*)$/;

type SubblockGapDirective = "gap" | "nogap";

type ParsedMarkerInner = {
  description: string;
  context: string;
  gapDirective?: SubblockGapDirective;
  /** One leading empty line on the *next* segment (after trim). */
  injectCodeBreak?: boolean;
  /** One trailing empty line on the segment *ending* at this marker (after trim). */
  injectEndBreak?: boolean;
};

const MARKER_SUFFIX_RE = /\s*\+\s*(gap|nogap|break|endbreak)\s*$/i;

/** Strip suffixes from the right (repeatable, e.g. `[!!+endbreak+break]`). */
function parseSubblockMarkerInner(inner: string): ParsedMarkerInner {
  let rest = inner.trimEnd();
  let gapDirective: SubblockGapDirective | undefined;
  let injectCodeBreak = false;
  let injectEndBreak = false;
  for (;;) {
    const dir = rest.match(MARKER_SUFFIX_RE);
    if (!dir) break;
    const which = dir[1].toLowerCase();
    if (which === "break") injectCodeBreak = true;
    else if (which === "endbreak") injectEndBreak = true;
    else gapDirective = which as SubblockGapDirective;
    rest = rest.slice(0, dir.index).trimEnd();
  }
  const pipeIdx = rest.indexOf("|");
  if (pipeIdx === -1) {
    return {
      description: rest.trim(),
      context: "",
      gapDirective,
      injectCodeBreak: injectCodeBreak || undefined,
      injectEndBreak: injectEndBreak || undefined,
    };
  }
  return {
    description: rest.slice(0, pipeIdx).trim(),
    context: rest.slice(pipeIdx + 1).trim(),
    gapDirective,
    injectCodeBreak: injectCodeBreak || undefined,
    injectEndBreak: injectEndBreak || undefined,
  };
}

/** True only for a structural blank line (no characters). Not whitespace-only — those stay in code. */
function isStructuralBlankLine(line: string): boolean {
  return line === "";
}

/** Drop leading / trailing blank lines so subblocks and segments have no empty edge lines. */
export function trimBlankEdgeLines(s: string): string {
  const lines = s.split("\n");
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === "") start++;
  while (end > start && lines[end - 1].trim() === "") end--;
  return lines.slice(start, end).join("\n");
}

function parseHeader(header: string): {
  language: string;
  title: string;
  linkIdentifiers?: string[];
  linkKwargAppend?: boolean;
} {
  const collected: string[] = [];
  let linkKwargAppend = false;
  for (const m of header.matchAll(/@link\s*\(\s*([^)]*)\s*\)/gi)) {
    for (const raw of m[1].split(",")) {
      const t = raw.trim();
      if (!t) continue;
      if (/^narrow\s*=\s*kwarg-append$/i.test(t)) {
        linkKwargAppend = true;
        continue;
      }
      if (LINK_HEADER_ID_RE.test(t)) collected.push(t);
    }
  }
  const linkIdentifiers = [...new Set(collected)];

  const stripped = header
    .replace(/@link\s*\(\s*[^)]*\s*\)/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  const colonIdx = stripped.indexOf(":");
  if (colonIdx === -1) {
    const parts = stripped.split(/\s+/).filter(Boolean);
    return {
      language: parts[0] || "text",
      title: "Code Explanation",
      ...(linkIdentifiers.length ? { linkIdentifiers } : {}),
      ...(linkKwargAppend && linkIdentifiers.length === 1
        ? { linkKwargAppend: true }
        : {}),
    };
  }
  return {
    language: stripped.slice(0, colonIdx).trim(),
    title: stripped.slice(colonIdx + 1).trim(),
    ...(linkIdentifiers.length ? { linkIdentifiers } : {}),
    ...(linkKwargAppend && linkIdentifiers.length === 1
      ? { linkKwargAppend: true }
      : {}),
  };
}

export function preprocessSubblocks(md: string): string {
  return md.replace(SUBBLOCK_BLOCK_RE, (_match, header: string, body: string) => {
    const { language, title, linkIdentifiers, linkKwargAppend } =
      parseHeader(header);
    const lines = trimBlankEdgeLines(body).split("\n");
    const segments: SubblockSegment[] = [];
    let currentCode: string[] = [];
    let gapBeforeNextSegment = false;
    let skippingLeadingBlanksAfterMarker = false;
    /** After `+nogap`, structural blank lines before the next code line do not set `gapBefore`. */
    let suppressStructuralGap = false;
    /** Next pushed segment gets a leading newline in `code` after trim (from `+break` on prior marker). */
    let pendingInjectCodeBreak = false;

    for (const line of lines) {
      const match = line.match(MARKER_LINE_RE);

      if (match) {
        const pre = match[1];
        const post = match[3];
        const { description, context, gapDirective, injectCodeBreak, injectEndBreak } =
          parseSubblockMarkerInner(match[2] || "");

        const cleanLine = pre + post;
        currentCode.push(cleanLine);

        const seg: SubblockSegment = {
          code: currentCode.join("\n"),
          description,
          context,
        };
        if (gapBeforeNextSegment) seg.gapBefore = true;
        if (pendingInjectCodeBreak) {
          (seg as SubblockSegment & { _codeBreak?: boolean })._codeBreak = true;
          pendingInjectCodeBreak = false;
        }
        if (injectEndBreak) {
          (seg as SubblockSegment & { _codeBreakEnd?: boolean })._codeBreakEnd = true;
        }
        segments.push(seg);

        currentCode = [];
        if (gapDirective === "gap") {
          gapBeforeNextSegment = true;
          suppressStructuralGap = false;
        } else if (gapDirective === "nogap") {
          gapBeforeNextSegment = false;
          suppressStructuralGap = true;
        } else {
          gapBeforeNextSegment = false;
          suppressStructuralGap = false;
        }
        if (injectCodeBreak) pendingInjectCodeBreak = true;
        skippingLeadingBlanksAfterMarker = true;
        continue;
      }

      if (skippingLeadingBlanksAfterMarker) {
        if (isStructuralBlankLine(line)) {
          if (!suppressStructuralGap) gapBeforeNextSegment = true;
          continue;
        }
        skippingLeadingBlanksAfterMarker = false;
        suppressStructuralGap = false;
      }

      currentCode.push(line);
    }

    if (currentCode.length > 0) {
      const seg: SubblockSegment = {
        code: currentCode.join("\n"),
        description: "",
        context: "",
      };
      if (gapBeforeNextSegment) seg.gapBefore = true;
      if (pendingInjectCodeBreak) {
        (seg as SubblockSegment & { _codeBreak?: boolean })._codeBreak = true;
        pendingInjectCodeBreak = false;
      }
      segments.push(seg);
    }

    // Trim blank edge lines; `+break` / `+endbreak` add newlines after trim (viewer must not re-trim).
    const finalSegments = segments
      .map((s) => {
        const raw = s as SubblockSegment & {
          _codeBreak?: boolean;
          _codeBreakEnd?: boolean;
        };
        const withBreak = raw._codeBreak === true;
        const withEndBreak = raw._codeBreakEnd === true;
        const { _codeBreak: _b, _codeBreakEnd: _e, ...rest } = raw;
        let code = trimBlankEdgeLines(rest.code);
        if (withBreak) code = code.length > 0 ? `\n${code}` : "\n";
        if (withEndBreak) code = code.length > 0 ? `${code}\n` : "\n";
        const { code: codeNoAnchors, linkAnchors } =
          extractAndStripLinkAnchors(code);
        return {
          ...rest,
          code: codeNoAnchors,
          ...(linkAnchors.length ? { linkAnchors } : {}),
        };
      })
      .filter((s) => s.code !== "" || s.description !== "");

    const config: SubblockConfig = {
      language,
      title,
      segments: finalSegments,
      ...(linkIdentifiers?.length ? { linkIdentifiers } : {}),
      ...(linkKwargAppend && linkIdentifiers?.length === 1
        ? { linkKwargAppend: true }
        : {}),
    };
    return "```subblock\n" + JSON.stringify(config) + "\n```";
  });
}
