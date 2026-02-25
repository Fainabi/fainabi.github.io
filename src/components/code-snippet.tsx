"use client";

import { useState } from "react";
import { ChevronRight, Code2, Copy, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import type { SnippetConfig } from "@/lib/snippet";

interface CodeSnippetProps {
  config: SnippetConfig;
}

export function CodeSnippet({ config }: CodeSnippetProps) {
  const { language, title, code } = config;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === "dark";
  const normalizedCode = code
    .replace(/\r\n?/g, "\n")
    .replace(/^ (?=\S)/, "")
    .replace(/\n$/, "");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(normalizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border bg-card text-sm">
      {/* Header – click to toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-medium transition-colors hover:bg-muted/60"
      >
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        />
        <Code2 className="h-4 w-4 shrink-0 text-primary" />
        <span className="truncate">{title}</span>
        <span className="ml-auto rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
          {language}
        </span>
      </button>

      {/* Collapsible body – grid-row animation */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="relative border-t">
            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              className="absolute right-2 top-2 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>

            <SyntaxHighlighter
              language={language}
              style={isDarkTheme ? oneDark : oneLight}
              PreTag="div"
              customStyle={{
                margin: 0,
                padding: "1rem",
                background: "var(--muted)",
                borderRadius: 0,
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
              {normalizedCode}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
}
