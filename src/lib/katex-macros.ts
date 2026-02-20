/**
 * Custom LaTeX macros for KaTeX, migrated from the MathJax config
 * in scripts/ports.js.
 */

const baseMacros: Record<string, string> = {
  "\\bm": "\\boldsymbol{#1}",
  "\\ip": "\\left\\langle #1 \\right\\rangle",
  "\\of": "\\left(#1\\right)",
  "\\ofc": "\\left\\{#1\\right\\}",
  "\\abs": "\\left\\lvert #1 \\right\\rvert",
  "\\norm": "\\left\\| #1 \\right\\|",
  "\\round": "\\left\\lfloor #1 \\right\\rceil",
  "\\floor": "\\left\\lfloor #1 \\right\\rfloor",
  "\\binom": "\\begin{pmatrix} #1 \\\\ #2 \\end{pmatrix}",
  "\\ceil": "\\left\\lceil #1 \\right\\rceil",
};

/** Shorthand commands that wrap a symbol in a LaTeX command. */
const wrappingTypes: Record<string, string[]> = {
  mathbb: ["Z", "N", "Q", "R", "B", "C", "F", "H"],
  operatorname: ["Hom"],
  mathsf: [
    "RLWE", 
    "CRT", "ModRaise", "DFT", "iDFT", "CtS", "StC", "EvalMod", 
    "Conv", "ModUp", "ModDown", "PartialSum", "swk", "evk",
    "ct", "real", "imag",
  ],
};

// Build the full macro map
const macros: Record<string, string> = { ...baseMacros };

for (const [cmd, symbols] of Object.entries(wrappingTypes)) {
  for (const sym of symbols) {
    macros[`\\${sym}`] = `\\${cmd}{${sym}}`;
  }
}

export { macros };
