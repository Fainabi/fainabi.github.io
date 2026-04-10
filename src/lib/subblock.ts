export interface SubblockSegment {
  code: string;
  description: string;
  context: string;
  /** True when one or more blank lines in source follow the previous `[!!]` before this segment’s code. */
  gapBefore?: boolean;
}

export interface SubblockConfig {
  language: string;
  title: string;
  segments: SubblockSegment[];
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

function parseHeader(header: string): { language: string; title: string } {
  const colonIdx = header.indexOf(":");
  if (colonIdx === -1) {
    return { language: header.trim().split(" ")[0], title: "Code Explanation" };
  }
  return {
    language: header.slice(0, colonIdx).trim(),
    title: header.slice(colonIdx + 1).trim(),
  };
}

export function preprocessSubblocks(md: string): string {
  return md.replace(SUBBLOCK_BLOCK_RE, (_match, header: string, body: string) => {
    const { language, title } = parseHeader(header);
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
        return { ...rest, code };
      })
      .filter((s) => s.code !== "" || s.description !== "");

    const config: SubblockConfig = { 
        language, 
        title, 
        segments: finalSegments
    };
    return "```subblock\n" + JSON.stringify(config) + "\n```";
  });
}
