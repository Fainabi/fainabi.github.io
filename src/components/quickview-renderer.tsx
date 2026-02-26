"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { macros } from "@/lib/katex-macros";

interface QuickviewRendererProps {
  content: string;
}

function normalizeMathDelimiters(md: string): string {
  // Display math: \[ ... \] (possibly multiline) -> $$ ... $$
  const withDisplay = md.replace(/\\\[([\s\S]*?)\\\]/g, (_match, inner) => `$$${inner}$$`);
  // Inline math: \( ... \) -> $ ... $
  return withDisplay.replace(/\\\((.*?)\\\)/g, (_match, inner) => `$${inner}$`);
}

export function QuickviewRenderer({ content }: QuickviewRendererProps) {
  const normalized = normalizeMathDelimiters(content);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[[rehypeKatex, { macros, strict: false, trust: true }]]}
      components={{
        p: ({ children }) => <span>{children}</span>,
      }}
    >
      {normalized}
    </ReactMarkdown>
  );
}
