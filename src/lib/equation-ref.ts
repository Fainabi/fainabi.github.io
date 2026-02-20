/**
 * Equation labelling & cross-referencing preprocessor.
 *
 * Usage in markdown:
 *
 *   $$
 *   E = mc^2 \label{eq:einstein}
 *   $$
 *
 *   By $\eqref{eq:einstein}$, energy equals mass times...
 *
 * The preprocessor:
 *  1. Scans display math for \label{name}, assigns sequential numbers.
 *  2. Strips \label{name} and injects \tag{N}.
 *  3. Inserts an HTML anchor <span id="name"></span> before the equation.
 *  4. Replaces \eqref{name} (in math) with \href{#name}{\textsf{(N)}}.
 *  5. Replaces \eqref{name} (in text) with a markdown link [(N)](#name).
 */

export function preprocessEquationRefs(md: string): string {
  const labels = new Map<string, number>(); // label name → equation number
  let counter = 0;

  // ── Pass 1: collect labels & rewrite display math blocks ──────────
  // Match $$ ... $$ (possibly multiline)
  const DISPLAY_MATH_RE = /\$\$([\s\S]*?)\$\$/g;

  md = md.replace(DISPLAY_MATH_RE, (_match, body: string) => {
    const LABEL_RE = /\\label\{([^}]+)\}/g;
    const foundLabels: string[] = [];

    // Collect all labels in this block
    let m: RegExpExecArray | null;
    while ((m = LABEL_RE.exec(body)) !== null) {
      foundLabels.push(m[1]);
    }

    if (foundLabels.length === 0) {
      return _match; // no labels, return unchanged
    }

    // Assign a number to the first label (one number per block)
    counter++;
    const num = counter;
    for (const label of foundLabels) {
      labels.set(label, num);
    }

    // Strip \label{...} and add \tag{N}
    const stripped = body.replace(/\\label\{[^}]+\}/g, "").trim();
    const tagged = `${stripped} \\tag{${num}}`;

    // Insert anchor before the equation.
    // IMPORTANT: $$  must be on its own line for remark-math to parse
    // display math correctly, and a blank line is needed before $$ so
    // the HTML anchor doesn't interfere with the math block.
    const anchor = `<span id="${foundLabels[0]}" class="scroll-mt-20"></span>`;
    return `${anchor}\n\n$$\n${tagged}\n$$`;
  });

  // ── Pass 2: replace \eqref{name} references ──────────────────────
  // Inside math ($..$ or $$..$$): use \href
  // Outside math: use markdown link
  if (labels.size === 0) return md;

  // Build a regex that matches \eqref{any-known-label}
  const labelNames = [...labels.keys()].map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const EQREF_RE = new RegExp(`\\\\eqref\\{(${labelNames.join("|")})\\}`, "g");

  // We need to know whether each \eqref is inside a math context.
  // Strategy: split the markdown into math / non-math segments,
  // apply different replacements, then reassemble.
  const parts: string[] = [];
  let lastIdx = 0;
  // Match both inline $...$ and display $$...$$ (greedy for $$, then $)
  const MATH_SEGMENT_RE = /\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/g;

  let seg: RegExpExecArray | null;
  while ((seg = MATH_SEGMENT_RE.exec(md)) !== null) {
    // Non-math text before this segment
    if (seg.index > lastIdx) {
      parts.push(replaceEqrefText(md.slice(lastIdx, seg.index), EQREF_RE, labels));
    }
    // Math segment
    parts.push(replaceEqrefMath(seg[0], EQREF_RE, labels));
    lastIdx = seg.index + seg[0].length;
  }
  // Remaining non-math text
  if (lastIdx < md.length) {
    parts.push(replaceEqrefText(md.slice(lastIdx), EQREF_RE, labels));
  }

  return parts.join("");
}

function replaceEqrefMath(
  text: string,
  re: RegExp,
  labels: Map<string, number>
): string {
  return text.replace(re, (_m, name: string) => {
    const num = labels.get(name);
    if (num === undefined) return _m;
    return `\\href{#${name}}{\\textsf{(${num})}}`;
  });
}

function replaceEqrefText(
  text: string,
  re: RegExp,
  labels: Map<string, number>
): string {
  return text.replace(re, (_m, name: string) => {
    const num = labels.get(name);
    if (num === undefined) return _m;
    return `[(${num})](#${name})`;
  });
}
