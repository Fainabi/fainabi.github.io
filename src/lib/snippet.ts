/**
 * Parse `:::snippet` blocks from markdown and replace them with fenced
 * code blocks that the MarkdownRenderer can intercept.
 *
 * Syntax:
 *
 *   :::snippet python : Generate Taylor polynomial for sin(x)
 *   from math import factorial
 *
 *   def taylor_sin(degree):
 *       ...
 *   :::
 *
 * The first line after `:::snippet` contains `language : title`.
 * Everything that follows (until the closing `:::`) is the code body.
 */

export interface SnippetConfig {
  language: string;
  title: string;
  code: string;
}

const SNIPPET_BLOCK_RE = /^:::snippet\s+(.+)\r?\n([\s\S]*?)\r?\n:::\s*$/gm;

function parseHeader(header: string): { language: string; title: string } {
  const colonIdx = header.indexOf(":");
  if (colonIdx === -1) {
    return { language: header.trim(), title: "Code" };
  }
  return {
    language: header.slice(0, colonIdx).trim(),
    title: header.slice(colonIdx + 1).trim(),
  };
}

/**
 * Replace every `:::snippet` block with a fenced code block:
 *
 *   ```snippet
 *   { ...JSON config... }
 *   ```
 *
 * The MarkdownRenderer intercepts `language-snippet` code blocks and
 * renders them as collapsible panels.
 */
export function preprocessSnippets(md: string): string {
  return md.replace(SNIPPET_BLOCK_RE, (_match, header: string, body: string) => {
    const { language, title } = parseHeader(header);
    const config: SnippetConfig = {
      language,
      title,
      code: body,
    };
    const json = JSON.stringify(config);
    return "```snippet\n" + json + "\n```";
  });
}
