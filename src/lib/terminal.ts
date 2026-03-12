/**
 * Preprocess :::terminal blocks in markdown.
 * 
 * Syntax:
 * :::terminal
 * { "initialFs": { ... }, "initialCommand": "ls" }
 * :::
 */
export function preprocessTerminal(content: string): string {
  const terminalRegex = /:::terminal\s*([\s\S]*?)\s*:::/g;
  return content.replace(terminalRegex, (match, configStr) => {
    // We wrap the config in a special language-terminal code block
    // which our MarkdownRenderer's PreBlock component will catch.
    return `\n\`\`\`language-terminal\n${configStr.trim() || "{}"}\n\`\`\`\n`;
  });
}
