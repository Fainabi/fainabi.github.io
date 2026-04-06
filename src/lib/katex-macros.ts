/**
 * Custom LaTeX macros for KaTeX, migrated from the MathJax config
 * in scripts/ports.js.
 * 
 * Sources are now loaded from blog/katex-macros.json for easier editing.
 */
import macroConfig from "../../blog/katex-macros.json";

// Build the full macro map
const macros: Record<string, string> = { ...macroConfig.base };

for (const [cmd, symbols] of Object.entries(macroConfig.wrapping)) {
  for (const sym of symbols) {
    macros[`\\${sym}`] = `\\${cmd}{${sym}}`;
  }
}

export { macros };
