"use client";

import * as React from "react";
import katex from "katex";
import { ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { macros } from "@/lib/katex-macros";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Flashcard } from "@/lib/flashcards";

// ── KaTeX rendering helper ─────────────────────────────────────────

/**
 * Render a string that may contain inline LaTeX ($...$) to HTML.
 * Non-math text is escaped; math fragments are rendered via KaTeX.
 */
function renderMathString(input: string): string {
  const parts = input.split(/(\$[^$]+\$)/g);

  return parts
    .map((part) => {
      if (part.startsWith("$") && part.endsWith("$")) {
        const tex = part.slice(1, -1);
        try {
          return katex.renderToString(tex, {
            throwOnError: false,
            macros,
            strict: false,
          });
        } catch {
          return part;
        }
      }
      return part
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    })
    .join("");
}

// ── Single flash card ──────────────────────────────────────────────

function FlashcardItem({ card }: { card: Flashcard }) {
  const [revealed, setRevealed] = React.useState(false);

  const termHtml = React.useMemo(() => renderMathString(card.term), [card.term]);
  const defHtml = React.useMemo(
    () => renderMathString(card.definition),
    [card.definition]
  );

  return (
    <button
      onClick={() => setRevealed((r) => !r)}
      className={cn(
        "w-full cursor-pointer rounded-md border px-3 py-2 text-left text-sm transition-colors",
        "hover:bg-muted/60",
        revealed && "bg-muted/40"
      )}
    >
      <span
        className="font-medium"
        dangerouslySetInnerHTML={{ __html: termHtml }}
      />

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          revealed ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div
            className="mt-1.5 border-t pt-1.5 text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: defHtml }}
          />
        </div>
      </div>
    </button>
  );
}

// ── Sidebar panel ──────────────────────────────────────────────────

interface FlashcardSidebarProps {
  cards: Flashcard[];
}

export function FlashcardSidebar({ cards }: FlashcardSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  if (cards.length === 0) return null;

  return (
    <div className="mt-6">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="mb-3 flex w-full cursor-pointer items-center gap-2 text-sm font-semibold transition-colors hover:text-muted-foreground"
      >
        <Layers className="h-4 w-4" />
        Flash Cards
        <ChevronDown
          className={cn(
            "ml-auto h-3.5 w-3.5 transition-transform duration-200",
            collapsed && "-rotate-90"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        )}
      >
        <div className="overflow-hidden">
          <ScrollArea className="max-h-[calc(100vh-20rem)]">
            <div className="space-y-1.5">
              {cards.map((card, i) => (
                <FlashcardItem key={i} card={card} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
