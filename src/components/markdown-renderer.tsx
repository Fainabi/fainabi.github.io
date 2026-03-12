"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { macros } from "@/lib/katex-macros";
import { preprocessPlots, type PlotConfig } from "@/lib/plot";
import { preprocessSnippets, type SnippetConfig } from "@/lib/snippet";
import { preprocessCallouts, type CalloutConfig } from "@/lib/callout";
import { preprocessSkills, type SkillConfig } from "@/lib/skill";
import { preprocessTerminal } from "@/lib/terminal";
import { preprocessEquationRefs } from "@/lib/equation-ref";
import { PlotChart } from "@/components/plot-chart";
import { CodeSnippet } from "@/components/code-snippet";
import { CalloutBlock } from "@/components/callout-block";
import { SkillBlock } from "@/components/skill-block";
import { Terminal } from "@/components/terminal";
import React, { type ComponentPropsWithoutRef } from "react";

interface MarkdownRendererProps {
  content: string;
  /** Skip callout preprocessing (used internally to prevent infinite nesting). */
  skipCallouts?: boolean;
  /** Skip skill preprocessing (used internally to prevent infinite nesting). */
  skipSkills?: boolean;
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
interface PreBlockProps extends ComponentPropsWithoutRef<"pre"> {
  isDarkTheme: boolean;
}

function PreBlock({ children, isDarkTheme, ...rest }: PreBlockProps) {
  // react-markdown renders fenced blocks as <pre><code class="language-xxx">...</code></pre>
  const codeEl = React.Children.toArray(children).find(
    (child): child is React.ReactElement =>
      React.isValidElement(child) && (child as React.ReactElement).type === "code"
  ) as React.ReactElement<{ className?: string; children?: React.ReactNode }> | undefined;

  if (codeEl) {
    const lang = codeEl.props.className;
    const text = childrenToString(codeEl.props.children);
    const language = lang?.replace(/^language-/, "");

    if (text && language) {
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

      if (lang === "language-skill") {
        try {
          const config: SkillConfig = JSON.parse(text);
          return <SkillBlock config={config} />;
        } catch { /* fall through */ }
      }

      if (lang === "language-terminal") {
        try {
          const config = JSON.parse(text);
          return <Terminal {...config} />;
        } catch {
          return <Terminal />;
        }
      }

      return (
        <SyntaxHighlighter
          language={language}
          style={isDarkTheme ? oneDark : oneLight}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: "0.5rem",
            border: "1px solid var(--border)",
            background: "var(--muted)",
            padding: "1rem",
            overflowX: "auto",
            fontSize: "0.875rem",
            lineHeight: "1.7",
          }}
          codeTagProps={{
            style: {
              fontFamily: "var(--font-mono)",
              margin: 0,
              padding: 0,
              display: "block",
              textIndent: 0,
              whiteSpace: "pre",
            },
          }}
        >
          {text.replace(/\n$/, "")}
        </SyntaxHighlighter>
      );
    }
  }

  return <pre {...rest}>{children}</pre>;
}

export function MarkdownRenderer({ content, skipCallouts, skipSkills }: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === "dark";

  const withCallouts = skipCallouts ? content : preprocessCallouts(content);
  const withSkills = skipSkills ? withCallouts : preprocessSkills(withCallouts);
  const withTerminal = preprocessTerminal(withSkills);
  const withSnippets = preprocessSnippets(withTerminal);
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
          pre: (props) => <PreBlock {...props} isDarkTheme={isDarkTheme} />,
          p: ({ children }) => {
            const nodes = React.Children.toArray(children).filter(
              (node) => !(typeof node === "string" && node.trim() === "")
            );
            if (nodes.length === 1) {
              const only = nodes[0];
              const isLilypondImage =
                React.isValidElement<{ src?: unknown; alt?: unknown }>(only) &&
                only.type === "img" &&
                typeof only.props.src === "string" &&
                only.props.src.startsWith("/generated/lilypond/");
              if (
                isLilypondImage
              ) {
                const modeRaw = String(only.props.alt ?? "").split("|")[1];
                const mode = (modeRaw ?? "block").trim().toLowerCase();
                if (mode !== "inline") {
                  return <>{children}</>;
                }
              }
            }
            return <p>{children}</p>;
          },
          img: ({ src, alt, className, ...props }) => {
            const imageSrc = typeof src === "string" ? src : "";
            const isLilypond = imageSrc.startsWith("/generated/lilypond/");
            if (isLilypond) {
              const [label, modeRaw] = (alt ?? "LilyPond score|block").split("|");
              const mode =
                modeRaw === "inline" || modeRaw === "fullpage" ? modeRaw : "block";
              const modeClass =
                mode === "inline"
                  ? "lilypond-score lilypond-score-inline inline-block align-middle h-auto w-auto max-h-10"
                  : mode === "fullpage"
                    ? "lilypond-score lilypond-score-fullpage relative left-1/2 block h-auto w-screen max-w-none -translate-x-1/2"
                    : "lilypond-score lilypond-score-block mx-auto block h-auto w-auto max-w-full my-0";

              // eslint-disable-next-line @next/next/no-img-element
              return (
                <img
                  src={imageSrc}
                  alt={label}
                  className={[modeClass, className].filter(Boolean).join(" ")}
                  {...props}
                />
              );
            }

            // eslint-disable-next-line @next/next/no-img-element
            return <img src={imageSrc} alt={alt ?? ""} className={className} {...props} />;
          },
        }}
      >
        {withEqRefs}
      </ReactMarkdown>
    </article>
  );
}
