"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import type { SubblockConfig } from "@/lib/subblock";
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
  const { language, title, segments } = config;
  // Do not trim segment `code` here: preprocessSubblocks already trims; re-trimming
  // would remove an intentional leading newline from `[!!+break]`.
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === "dark";

  const [folded, setFolded] = useState<Record<number, boolean>>({});
  
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
        <div className="flex min-w-[800px] flex-col px-4 pb-5 pt-3">
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
                    className={`transition-all duration-300 group-hover/seg:brightness-[1.02] dark:group-hover/seg:brightness-[1.05] ${isFolded ? "opacity-60" : ""}`}
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
                      lineProps={() => ({
                        className: "subblock-code-line",
                        style: { display: "block" },
                      })}
                    >
                      {isFolded ? firstLine : segment.code}
                    </SyntaxHighlighter>
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
