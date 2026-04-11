"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  firstLinkIdentifierOnLine,
  subblockKwargPassSameIdRange,
  subblockLineHasAppendOnId,
  subblockLineHasLinkIdentifier,
  type SubblockConfig,
  type SubblockLinkAnchor,
} from "@/lib/subblock";
import { graphicForSubblockSegment } from "@/lib/subblock-description-graphic";
import {
  fencedCodeHighlighterCodeTagStyle,
  fencedCodeHighlighterCustomStyle,
  fencedCodeLineBoxHeight,
} from "@/lib/fenced-code-highlighter-styles";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

function firstNonEmptyLineIndex(lines: string[]): number {
  const i = lines.findIndex((l) => l.trim() !== "");
  return i === -1 ? 0 : i;
}

function subblockLineLocalData(
  lineNumber: number | undefined,
  startLine: number,
  lineCount: number,
): { "data-subblock-local-line": string } | Record<string, never> {
  if (typeof lineNumber !== "number" || lineCount === 0) return {};
  return {
    "data-subblock-local-line": String(lineNumber - startLine),
  };
}

/** Same rule as react-syntax-highlighter `getEmWidthOfNumber(largestLineNumber)`. */
function emMinWidthForMaxLineNumber(maxLine: number): string {
  const n = Math.max(1, Math.floor(maxLine));
  return `${String(n).length}.25em`;
}

/** Skip fold toggle when user selected text (e.g. copying code). */
function hasTextSelection(): boolean {
  if (typeof window === "undefined") return false;
  return (window.getSelection()?.toString() ?? "").length > 0;
}

function underLineNumber(n: Node, lineEl: HTMLElement): boolean {
  let el: HTMLElement | null =
    n.nodeType === Node.ELEMENT_NODE ? (n as HTMLElement) : n.parentElement;
  while (el && el !== lineEl) {
    if (el.classList?.contains("react-syntax-highlighter-line-number"))
      return true;
    el = el.parentElement;
  }
  return false;
}

/** Contiguous code text nodes on one highlighted line (excludes inline line number). */
function getCodeTextSegments(lineEl: HTMLElement): { node: Text; len: number }[] {
  const out: { node: Text; len: number }[] = [];
  const walk = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const tn = node as Text;
      const t = tn.textContent ?? "";
      if (!underLineNumber(tn, lineEl) && t.length > 0) {
        out.push({ node: tn, len: t.length });
      }
      return;
    }
    for (const c of node.childNodes) walk(c);
  };
  walk(lineEl);
  return out;
}

/** Range over UTF-16 offsets into concatenated code text of `lineEl` (same basis as hover hit-test). */
function getRangeForCodeSpan(
  lineEl: HTMLElement,
  start: number,
  end: number,
): Range | null {
  if (typeof document === "undefined" || start < 0 || end <= start) return null;
  const segs = getCodeTextSegments(lineEl);
  let acc = 0;
  const bounds: { node: Text; from: number; to: number }[] = [];
  for (const { node, len } of segs) {
    bounds.push({ node, from: acc, to: acc + len });
    acc += len;
  }
  if (end > acc) return null;

  let i = 0;
  while (i < bounds.length && bounds[i]!.to <= start) i++;
  const startSeg = bounds[i];
  if (!startSeg) return null;
  const sO = start - startSeg.from;

  let j = i;
  while (j < bounds.length && bounds[j]!.to < end) j++;
  const endSeg = bounds[j];
  if (!endSeg) return null;
  const eO = end - endSeg.from;

  const r = document.createRange();
  const sLen = startSeg.node.textContent?.length ?? 0;
  const eLen = endSeg.node.textContent?.length ?? 0;
  r.setStart(startSeg.node, Math.min(Math.max(0, sO), sLen));
  r.setEnd(endSeg.node, Math.min(Math.max(0, eO), eLen));
  return r;
}

type SubblockLinkHintBox = {
  kind: "from" | "to";
  key: string;
  left: number;
  top: number;
  width: number;
  height: number;
  /** Display line number (matches `lineProps` / `linkWire.line`). */
  lineNumber: number;
  id: string;
  tag: string;
};

type SegmentWithLines = SubblockConfig["segments"][number] & {
  startLine: number;
  lineCount: number;
  lines: string[];
};

function measureSubblockLinkHintBoxes(
  root: HTMLElement | null,
  segment: SegmentWithLines,
  isFolded: boolean,
  anchorLinkEnabled: boolean,
): SubblockLinkHintBox[] {
  if (!root || !anchorLinkEnabled) return [];
  const withCols = (segment.linkAnchors ?? []).filter(
    (
      a,
    ): a is SubblockLinkAnchor & { colStart: number; colEnd: number } =>
      (a.kind === "from" || a.kind === "to") &&
      a.colStart !== undefined &&
      a.colEnd !== undefined,
  );
  if (!withCols.length) return [];
  const foldedFocusLocalLine = firstNonEmptyLineIndex(segment.lines);
  const cr = root.getBoundingClientRect();
  const boxes: SubblockLinkHintBox[] = [];
  for (const a of withCols) {
    if (
      isFolded &&
      segment.lineCount > 1 &&
      a.line !== foldedFocusLocalLine
    ) {
      continue;
    }
    const el = root.querySelector(`[data-subblock-local-line="${a.line}"]`);
    if (!(el instanceof HTMLElement)) continue;
    const range = getRangeForCodeSpan(el, a.colStart, a.colEnd);
    if (!range) continue;
    const br = range.getBoundingClientRect();
    boxes.push({
      kind: a.kind,
      key: `${a.kind}-${a.line}-${a.id}-${a.tag}`,
      left: br.left - cr.left,
      top: br.top - cr.top,
      width: Math.max(br.width, 4),
      height: br.height,
      lineNumber: segment.startLine + a.line,
      id: a.id,
      tag: a.tag,
    });
  }
  return boxes;
}

/** Character offset into code text only (skip Prism inline line-number span). */
function codeTextOffsetFromPoint(
  lineEl: HTMLElement,
  clientX: number,
  clientY: number,
): number | null {
  if (typeof document === "undefined") return null;
  const caretRangeFromPoint = (
    document as Document & {
      caretRangeFromPoint?: (x: number, y: number) => Range | null;
    }
  ).caretRangeFromPoint;
  const dr = caretRangeFromPoint?.(clientX, clientY) ?? null;
  if (!dr || !lineEl.contains(dr.startContainer)) return null;

  let total = 0;
  let found = false;

  const visit = (node: Node): void => {
    if (found) return;
    if (node === dr.startContainer) {
      if (node.nodeType === Node.TEXT_NODE && !underLineNumber(node, lineEl)) {
        total += dr.startOffset;
      }
      found = true;
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      if (!underLineNumber(node, lineEl) && node.textContent) {
        total += node.textContent.length;
      }
      return;
    }
    for (const c of node.childNodes) {
      visit(c);
    }
  };

  visit(lineEl);
  return found ? total : null;
}

function pointerOverKwargPass(
  lineEl: HTMLElement,
  clientX: number,
  clientY: number,
  lineText: string,
  id: string,
): boolean {
  const range = subblockKwargPassSameIdRange(lineText, id);
  if (!range) return false;
  const o = codeTextOffsetFromPoint(lineEl, clientX, clientY);
  if (o === null) return false;
  return o >= range.start && o < range.end;
}

/** `[@from]` with columns: only that span; legacy: whole rendered line. */
function pickFromAnchorUnderPointer(
  lineEl: HTMLElement,
  clientX: number,
  clientY: number,
  lineText: string,
  fromHere: SubblockLinkAnchor[],
): SubblockLinkAnchor | null {
  const o = codeTextOffsetFromPoint(lineEl, clientX, clientY);
  if (o === null) return null;
  for (const a of fromHere) {
    if (a.colStart !== undefined && a.colEnd !== undefined) {
      if (o >= a.colStart && o < a.colEnd) return a;
    }
  }
  for (const a of fromHere) {
    if (a.colStart === undefined) return a;
  }
  return null;
}

/** Stack segments as one continuous code strip; optional `gapBefore` starts a new strip. */
function segmentCodeSurfaceStyle(opts: {
  isStripStart: boolean;
  isStripEnd: boolean;
}): CSSProperties {
  const base: CSSProperties = { ...fencedCodeHighlighterCustomStyle };
  if (opts.isStripStart && opts.isStripEnd) return base;
  if (!opts.isStripStart) {
    base.paddingTop = 0;
    base.borderTopLeftRadius = 0;
    base.borderTopRightRadius = 0;
    base.borderTop = "none";
  }
  if (!opts.isStripEnd) {
    base.paddingBottom = 0;
    base.borderBottomLeftRadius = 0;
    base.borderBottomRightRadius = 0;
    base.borderBottom = "none";
  }
  return base;
}

interface SubblockViewerProps {
  config: SubblockConfig;
}

/**
 * Structural Code Viewer V2.8
 * Focus: FORCED FONT AND LINE-HEIGHT IDENTITY.
 */
export function SubblockViewer({ config }: SubblockViewerProps) {
  const {
    language,
    title,
    segments,
    linkIdentifiers = [],
    linkKwargAppend,
  } = config;
  const kwargAppendMode =
    linkKwargAppend === true && linkIdentifiers.length === 1;
  const kwargId = kwargAppendMode ? linkIdentifiers[0]! : null;
  // Do not trim segment `code` here: preprocessSubblocks already trims; re-trimming
  // would remove an intentional leading newline from `[!!+break]`.
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === "dark";

  const [folded, setFolded] = useState<Record<number, boolean>>({});
  /** Header `@link(id)`: hover line → highlight peer lines with same id (not `obj.id`). */
  const [linkWire, setLinkWire] = useState<{
    seg: number;
    line: number;
    id: string;
    /** Set for `[@from]` / `[@to]` anchor mode; omitted for `@link` / kwarg-append. */
    tag?: string;
  } | null>(null);
  const linkClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorLinkEnabled = useMemo(
    () => segments.some((s) => (s.linkAnchors?.length ?? 0) > 0),
    [segments],
  );
  const linkHoverEnabled =
    anchorLinkEnabled || linkIdentifiers.length > 0;

  const cancelLinkClear = () => {
    if (linkClearTimer.current) {
      clearTimeout(linkClearTimer.current);
      linkClearTimer.current = null;
    }
  };

  const touchLinkWire = (seg: number, line: number, id: string, tag?: string) => {
    cancelLinkClear();
    setLinkWire(
      tag !== undefined ? { seg, line, id, tag } : { seg, line, id },
    );
  };

  const scheduleClearLinkWire = () => {
    cancelLinkClear();
    linkClearTimer.current = setTimeout(() => {
      setLinkWire(null);
      linkClearTimer.current = null;
    }, 45);
  };

  useEffect(
    () => () => {
      cancelLinkClear();
    },
    [],
  );

  useEffect(() => {
    setLinkWire(null);
  }, [folded]);

  const toggleFold = (idx: number) => {
    setFolded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAll = (fold: boolean) => {
    const newState: Record<number, boolean> = {};
    if (fold) {
      segments.forEach((s, i) => {
          if (s.description || s.context) newState[i] = true;
      });
    }
    setFolded(newState);
  };

  const explorableSegmentsCount = segments.filter(s => s.description || s.context).length;
  const allFolded = Object.keys(folded).length === explorableSegmentsCount && explorableSegmentsCount > 0;

  // Optimized Line calculation
  const segmentsWithLines = useMemo(() => {
    let currentLine = 1;
    return segments.map(s => {
        const lines = s.code.split('\n');
        const codeIsEmpty = s.code.trim() === "";
        const lineCount = codeIsEmpty ? 0 : lines.length;
        const start = currentLine;
        currentLine += lineCount;
        return { ...s, startLine: start, lineCount, lines };
    });
  }, [segments]);

  const maxLineInSubblock = useMemo(() => {
    let max = 1;
    for (const seg of segmentsWithLines) {
      if (seg.lineCount > 0) {
        max = Math.max(max, seg.startLine + seg.lineCount - 1);
      }
    }
    return max;
  }, [segmentsWithLines]);

  const lineNumberColumnMinWidth = emMinWidthForMaxLineNumber(maxLineInSubblock);

  const codePaneRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const [linkHintBoxesBySeg, setLinkHintBoxesBySeg] = useState<
    Record<number, SubblockLinkHintBox[]>
  >({});

  const remeasureLinkHints = useCallback(() => {
    const next: Record<number, SubblockLinkHintBox[]> = {};
    for (let i = 0; i < segmentsWithLines.length; i++) {
      next[i] = measureSubblockLinkHintBoxes(
        codePaneRefs.current.get(i) ?? null,
        segmentsWithLines[i]!,
        Boolean(folded[i]),
        anchorLinkEnabled,
      );
    }
    setLinkHintBoxesBySeg(next);
  }, [segmentsWithLines, folded, anchorLinkEnabled]);

  useLayoutEffect(() => {
    remeasureLinkHints();
  }, [remeasureLinkHints, isDarkTheme]);

  const remeasureLinkHintsRef = useRef(remeasureLinkHints);
  remeasureLinkHintsRef.current = remeasureLinkHints;

  useEffect(() => {
    const rows: ResizeObserver[] = [];
    for (let i = 0; i < segmentsWithLines.length; i++) {
      const el = codePaneRefs.current.get(i);
      if (!el) continue;
      const ro = new ResizeObserver(() => remeasureLinkHintsRef.current());
      ro.observe(el);
      rows.push(ro);
    }
    return () => rows.forEach((r) => r.disconnect());
  }, [segmentsWithLines.length, isDarkTheme]);

  return (
    <div className="not-prose my-10 overflow-hidden rounded-xl border bg-card shadow-sm transition-all group/container">
      {/* Integrated Minimal Utility Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border/40">
        <div className="flex items-center gap-2">
            <span className="text-[0.65rem] font-bold tracking-widest text-foreground/40 uppercase">{title}</span>
        </div>
        <div className="flex items-center gap-3">
            {explorableSegmentsCount > 0 && (
                <button
                    type="button"
                    title={allFolded ? "Expand all sections" : "Collapse all sections"}
                    onClick={() => toggleAll(!allFolded)}
                    className="rounded-md border border-border bg-background p-1.5 text-muted-foreground shadow-sm transition-all hover:border-primary/60 hover:bg-muted hover:text-foreground hover:shadow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                    {allFolded ? (
                      <Maximize2 className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                    ) : (
                      <Minimize2 className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                    )}
                </button>
            )}
            <span className="text-[0.6rem] font-mono font-bold text-muted-foreground/50 uppercase tracking-tighter">
               {language}
            </span>
        </div>
      </div>

      {/* Editor Surface — y-visible so segment hover shadows are not clipped */}
      <div className="relative overflow-x-auto overflow-y-visible bg-background">
        <div
          className="flex min-w-[800px] flex-col px-4 pb-5 pt-3"
          onMouseLeave={() => {
            if (!linkHoverEnabled) return;
            cancelLinkClear();
            setLinkWire(null);
          }}
        >
          {segmentsWithLines.map((segment, idx) => {
            const totalSeg = segmentsWithLines.length;
            const isFolded = folded[idx];
            const hasInfo = segment.description || segment.context;
            const firstLine = segment.lines.find(l => l.trim() !== "") || segment.lines[0] || "...";
            const foldedStartingLine =
              segment.startLine + firstNonEmptyLineIndex(segment.lines);
            const stripStart = idx === 0 || Boolean(segment.gapBefore);
            const stripEnd =
              idx === totalSeg - 1 ||
              Boolean(segmentsWithLines[idx + 1]?.gapBefore);
            /* Match fenced code 0.5rem radius; static strings for Tailwind JIT */
            const codeWrapRadiusClass =
              totalSeg <= 1
                ? "rounded-[0.5rem]"
                : stripStart && stripEnd
                  ? "rounded-[0.5rem]"
                  : stripStart
                    ? "rounded-t-[0.5rem]"
                    : stripEnd
                      ? "rounded-b-[0.5rem]"
                      : "rounded-none";
            const annRadiusClass =
              totalSeg <= 1
                ? "rounded-r-[0.5rem]"
                : stripStart && stripEnd
                  ? "rounded-r-[0.5rem]"
                  : stripStart
                    ? "rounded-tr-[0.5rem]"
                    : stripEnd
                      ? "rounded-br-[0.5rem]"
                      : "";

            const descriptionGraphic = hasInfo
              ? graphicForSubblockSegment(segment.description, segment.code)
              : null;

            return (
              <div
                key={idx}
                className={cn(
                  "group/seg relative flex items-start gap-2 transition-all duration-300 ease-out",
                  idx > 0 &&
                    "hover:z-[2] hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/6 dark:hover:shadow-black/35",
                  idx > 0 &&
                    segment.gapBefore &&
                    "mt-6 border-t border-dashed border-border/40 pt-6",
                )}
              >
                {/* Code + line numbers — click / keyboard to fold when section has notes */}
                <div
                  className={`subblock-syntax relative min-w-0 flex-1 overflow-hidden ring-2 ring-transparent ring-inset transition-[filter,box-shadow,ring-color] duration-300 ease-out group-hover/seg:ring-primary/30 ${codeWrapRadiusClass} ${
                    hasInfo
                      ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      : ""
                  }`}
                  style={
                    {
                      "--subblock-line-num-min": lineNumberColumnMinWidth,
                    } as CSSProperties
                  }
                  role={hasInfo ? "button" : undefined}
                  tabIndex={hasInfo ? 0 : undefined}
                  aria-expanded={hasInfo ? !isFolded : undefined}
                  aria-label={
                    hasInfo
                      ? isFolded
                        ? "Expand code section"
                        : "Fold code to first line"
                      : undefined
                  }
                  onClick={
                    hasInfo
                      ? () => {
                          if (hasTextSelection()) return;
                          toggleFold(idx);
                        }
                      : undefined
                  }
                  onKeyDown={
                    hasInfo
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleFold(idx);
                          }
                        }
                      : undefined
                  }
                >
                  {isFolded && segment.lineCount > 1 && (
                    <div className="pointer-events-none absolute right-3 top-3 z-[1] rounded-md border border-border/60 bg-card/95 px-1.5 py-0.5 font-mono text-[0.55rem] text-muted-foreground shadow-sm backdrop-blur-sm">
                      +{segment.lineCount - 1}
                    </div>
                  )}
                  <div
                    ref={(el) => {
                      if (el) codePaneRefs.current.set(idx, el);
                      else codePaneRefs.current.delete(idx);
                    }}
                    className={`relative transition-all duration-300 group-hover/seg:brightness-[1.02] dark:group-hover/seg:brightness-[1.05] ${isFolded ? "opacity-60" : ""}`}
                  >
                    <SyntaxHighlighter
                      language={language}
                      style={isDarkTheme ? oneDark : oneLight}
                      PreTag="div"
                      customStyle={segmentCodeSurfaceStyle({
                        isStripStart: stripStart,
                        isStripEnd: stripEnd,
                      })}
                      codeTagProps={{ style: fencedCodeHighlighterCodeTagStyle }}
                      showLineNumbers
                      showInlineLineNumbers
                      startingLineNumber={
                        isFolded ? foldedStartingLine : segment.startLine
                      }
                      lineNumberStyle={{
                        fontVariantNumeric: "tabular-nums",
                      }}
                      wrapLines
                      lineProps={(lineNumber) => {
                        if (
                          isFolded ||
                          typeof lineNumber !== "number" ||
                          segment.lineCount === 0 ||
                          !linkHoverEnabled
                        ) {
                          return {
                            className: "subblock-code-line",
                            style: { display: "block" },
                            ...subblockLineLocalData(
                              lineNumber,
                              segment.startLine,
                              segment.lineCount,
                            ),
                          };
                        }
                        const localIdx = lineNumber - segment.startLine;
                        const lineText = segment.lines[localIdx] ?? "";

                        if (anchorLinkEnabled) {
                          const anchorsHere =
                            segment.linkAnchors?.filter(
                              (a) => a.line === localIdx,
                            ) ?? [];
                          const fromHere = anchorsHere.filter(
                            (a) => a.kind === "from",
                          );
                          const toHere = anchorsHere.filter(
                            (a) => a.kind === "to",
                          );
                          const wire = linkWire;
                          const isSource =
                            wire !== null &&
                            wire.tag !== undefined &&
                            wire.seg === idx &&
                            wire.line === lineNumber;
                          const isPeer =
                            wire !== null &&
                            wire.tag !== undefined &&
                            toHere.some(
                              (t) =>
                                t.id === wire.id && t.tag === wire.tag,
                            ) &&
                            !(
                              wire.seg === idx && wire.line === lineNumber
                            );

                          const activateFromUnderPointer = (
                            el: HTMLElement,
                            cx: number,
                            cy: number,
                          ) => {
                            const hit = pickFromAnchorUnderPointer(
                              el,
                              cx,
                              cy,
                              lineText,
                              fromHere,
                            );
                            if (hit) {
                              touchLinkWire(
                                idx,
                                lineNumber,
                                hit.id,
                                hit.tag,
                              );
                            } else {
                              scheduleClearLinkWire();
                            }
                          };

                          return {
                            className: cn(
                              "subblock-code-line",
                              isPeer && "subblock-link-peer",
                              isSource && "subblock-link-source",
                            ),
                            style: { display: "block" },
                            ...subblockLineLocalData(
                              lineNumber,
                              segment.startLine,
                              segment.lineCount,
                            ),
                            ...(fromHere.length || toHere.length
                              ? {
                                  onMouseEnter: (e) => {
                                    if (toHere.length) cancelLinkClear();
                                    if (fromHere.length) {
                                      activateFromUnderPointer(
                                        e.currentTarget,
                                        e.clientX,
                                        e.clientY,
                                      );
                                    }
                                  },
                                }
                              : {}),
                            ...(fromHere.length
                              ? {
                                  onMouseMove: (e) => {
                                    activateFromUnderPointer(
                                      e.currentTarget,
                                      e.clientX,
                                      e.clientY,
                                    );
                                  },
                                }
                              : {}),
                            onMouseLeave: scheduleClearLinkWire,
                          };
                        }

                        if (kwargAppendMode && kwargId && !anchorLinkEnabled) {
                          const hasKwarg =
                            subblockKwargPassSameIdRange(lineText, kwargId) !==
                            null;
                          const hasAppend = subblockLineHasAppendOnId(
                            lineText,
                            kwargId,
                          );
                          const wire = linkWire;
                          const isSource =
                            wire !== null &&
                            wire.seg === idx &&
                            wire.line === lineNumber &&
                            hasKwarg &&
                            wire.id === kwargId;
                          const isPeer =
                            wire !== null &&
                            hasAppend &&
                            !(wire.seg === idx && wire.line === lineNumber);

                          const updateKwargPointer = (
                            el: HTMLElement,
                            cx: number,
                            cy: number,
                          ) => {
                            if (
                              pointerOverKwargPass(el, cx, cy, lineText, kwargId)
                            ) {
                              touchLinkWire(idx, lineNumber, kwargId);
                            } else {
                              scheduleClearLinkWire();
                            }
                          };

                          return {
                            className: cn(
                              "subblock-code-line",
                              isPeer && "subblock-link-peer",
                              isSource && "subblock-link-source",
                            ),
                            style: { display: "block" },
                            ...subblockLineLocalData(
                              lineNumber,
                              segment.startLine,
                              segment.lineCount,
                            ),
                            ...(hasKwarg
                              ? {
                                  onMouseEnter: (e) => {
                                    updateKwargPointer(
                                      e.currentTarget,
                                      e.clientX,
                                      e.clientY,
                                    );
                                  },
                                  onMouseMove: (e) => {
                                    updateKwargPointer(
                                      e.currentTarget,
                                      e.clientX,
                                      e.clientY,
                                    );
                                  },
                                }
                              : {}),
                            ...(hasAppend
                              ? {
                                  onMouseEnter: () => {
                                    cancelLinkClear();
                                  },
                                }
                              : {}),
                            onMouseLeave: scheduleClearLinkWire,
                          };
                        }

                        const activeId = firstLinkIdentifierOnLine(
                          lineText,
                          linkIdentifiers,
                        );
                        const wire = linkWire;
                        const isSource =
                          wire !== null &&
                          wire.tag === undefined &&
                          wire.seg === idx &&
                          wire.line === lineNumber &&
                          wire.id === activeId &&
                          activeId !== null;
                        const isPeer =
                          wire !== null &&
                          wire.tag === undefined &&
                          activeId !== null &&
                          subblockLineHasLinkIdentifier(lineText, wire.id) &&
                          (wire.seg !== idx || wire.line !== lineNumber);
                        return {
                          className: cn(
                            "subblock-code-line",
                            isPeer && "subblock-link-peer",
                            isSource && "subblock-link-source",
                          ),
                          style: { display: "block" },
                          ...subblockLineLocalData(
                            lineNumber,
                            segment.startLine,
                            segment.lineCount,
                          ),
                          onMouseEnter: () => {
                            if (activeId)
                              touchLinkWire(idx, lineNumber, activeId);
                          },
                          onMouseLeave: scheduleClearLinkWire,
                        };
                      }}
                    >
                      {isFolded ? firstLine : segment.code}
                    </SyntaxHighlighter>
                    {(linkHintBoxesBySeg[idx] ?? [])
                      .filter((b) => {
                        if (b.kind === "from") return true;
                        const w = linkWire;
                        return (
                          w !== null &&
                          w.tag !== undefined &&
                          w.id === b.id &&
                          w.tag === b.tag
                        );
                      })
                      .map((b) => (
                      <span
                        key={b.key}
                        className={
                          b.kind === "from"
                            ? "subblock-link-from-mark"
                            : "subblock-link-to-mark"
                        }
                        style={{
                          left: b.left,
                          top: b.top,
                          width: b.width,
                          height: b.height,
                        }}
                        aria-hidden
                        onMouseEnter={() => {
                          cancelLinkClear();
                          if (b.kind === "from") {
                            touchLinkWire(
                              idx,
                              b.lineNumber,
                              b.id,
                              b.tag,
                            );
                          }
                        }}
                        onMouseMove={() => {
                          cancelLinkClear();
                          if (b.kind === "from") {
                            touchLinkWire(
                              idx,
                              b.lineNumber,
                              b.id,
                              b.tag,
                            );
                          }
                        }}
                        onMouseLeave={scheduleClearLinkWire}
                      />
                    ))}
                  </div>
                </div>

                {hasInfo ? (
                  <div
                    className={`relative flex w-[300px] flex-shrink-0 flex-col justify-start overflow-hidden border-l border-border/30 bg-muted/20 px-6 transition-all duration-300 ease-out group-hover/seg:border-l-primary/45 group-hover/seg:bg-muted/50 dark:bg-muted/15 dark:group-hover/seg:bg-muted/40 ${annRadiusClass} cursor-pointer`}
                    onClick={() => {
                      if (hasTextSelection()) return;
                      toggleFold(idx);
                    }}
                  >
                    <div
                      className={`absolute left-[-1px] w-0.5 rounded-full bg-primary opacity-0 transition-all duration-300 group-hover/seg:opacity-100 group-hover/seg:shadow-[0_0_12px_color-mix(in_oklch,var(--primary)_45%,transparent)] ${stripStart ? "top-4" : "top-0"}`}
                      style={{ height: fencedCodeLineBoxHeight }}
                    />
                    <div
                      className={`transition-all duration-300 ${stripStart ? "pt-4" : "pt-0"} ${isFolded ? "opacity-40 group-hover/seg:opacity-70" : "opacity-100"}`}
                    >
                      {!isFolded && descriptionGraphic && (
                        <pre
                          className="mb-3 max-w-full overflow-x-auto rounded-md border border-border/40 bg-muted/25 px-2.5 py-2 font-mono text-[0.62rem] leading-snug text-muted-foreground"
                          aria-hidden
                        >
                          {descriptionGraphic}
                        </pre>
                      )}
                      <div className="mb-2 text-sm font-medium leading-relaxed text-foreground/70 transition-colors duration-300 group-hover/seg:text-foreground group-hover/seg:font-semibold">
                        {segment.description}
                      </div>
                      {segment.context && !isFolded && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {segment.context.split(",").map((c, i) => (
                            <code
                              key={i}
                              className="rounded border border-primary/10 bg-primary/5 px-1.5 py-0.5 font-mono text-[0.6rem] font-bold tracking-tight text-primary/70 transition-all duration-300 group-hover/seg:border-primary/35 group-hover/seg:bg-primary/12 group-hover/seg:text-primary"
                            >
                              {c.trim()}
                            </code>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
