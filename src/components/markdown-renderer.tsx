"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { macros } from "@/lib/katex-macros";
import { preprocessPlots, type PlotConfig } from "@/lib/plot";
import { preprocessSnippets, type SnippetConfig } from "@/lib/snippet";
import { preprocessCallouts, type CalloutConfig } from "@/lib/callout";
import { preprocessEquationRefs } from "@/lib/equation-ref";
import { PlotChart } from "@/components/plot-chart";
import { CodeSnippet } from "@/components/code-snippet";
import { CalloutBlock } from "@/components/callout-block";
import React, { type ComponentPropsWithoutRef } from "react";

interface MarkdownRendererProps {
  content: string;
  /** Skip callout preprocessing (used internally to prevent infinite nesting). */
  skipCallouts?: boolean;
}

/**
 * Convert MathJax-style delimiters to remark-math compatible ones:
 *   \( ... \)  →  $ ... $     (inline)
 *   \[ ... \]  →  $$ ... $$   (display, may span multiple lines)
 */
function normalizeMathDelimiters(md: string): string {
  // Display math: \[ ... \]  (possibly multiline)
  md = md.replace(/\\\[([\s\S]*?)\\\]/g, (_match, inner) => `$$${inner}$$`);
  // Inline math: \( ... \)  (single line only)
  md = md.replace(/\\\((.*?)\\\)/g, (_match, inner) => `$${inner}$`);
  return md;
}

/** Flatten react-markdown children into a plain string. */
function childrenToString(children: React.ReactNode): string | null {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(String).join("");
  return null;
}

/**
 * Custom `pre` component that intercepts fenced code blocks with
 * language-plot / language-snippet and renders the appropriate widget
 * instead of a `<pre><code>` listing.
 */
function PreBlock({ children, ...rest }: ComponentPropsWithoutRef<"pre">) {
  // react-markdown renders fenced blocks as <pre><code class="language-xxx">...</code></pre>
  const codeEl = React.Children.toArray(children).find(
    (child): child is React.ReactElement =>
      React.isValidElement(child) && (child as React.ReactElement).type === "code"
  ) as React.ReactElement<{ className?: string; children?: React.ReactNode }> | undefined;

  if (codeEl) {
    const lang = codeEl.props.className;
    const text = childrenToString(codeEl.props.children);

    if (text) {
      if (lang === "language-plot") {
        try {
          const config: PlotConfig = JSON.parse(text);
          return <PlotChart config={config} />;
        } catch { /* fall through */ }
      }

      if (lang === "language-snippet") {
        try {
          const config: SnippetConfig = JSON.parse(text);
          return <CodeSnippet config={config} />;
        } catch { /* fall through */ }
      }

      if (lang === "language-callout") {
        try {
          const config: CalloutConfig = JSON.parse(text);
          return <CalloutBlock config={config} />;
        } catch { /* fall through */ }
      }
    }
  }

  return <pre {...rest}>{children}</pre>;
}

export function MarkdownRenderer({ content, skipCallouts }: MarkdownRendererProps) {
  const withCallouts = skipCallouts ? content : preprocessCallouts(content);
  const withSnippets = preprocessSnippets(withCallouts);
  const withPlots = preprocessPlots(withSnippets);
  const normalized = normalizeMathDelimiters(withPlots);
  const withEqRefs = preprocessEquationRefs(normalized);

  return (
    <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-h1:text-3xl prose-h1:font-bold prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2 prose-p:leading-7 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-img:rounded-lg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug,
          [rehypeKatex, { macros, strict: false, trust: true }],
        ]}
        components={{
          pre: PreBlock,
        }}
      >
        {withEqRefs}
      </ReactMarkdown>
    </article>
  );
}
