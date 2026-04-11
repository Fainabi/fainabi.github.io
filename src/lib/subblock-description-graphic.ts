/**
 * Symbolic “story” graphics for subblock notes: code-aware mini flows
 * (client → LLM, tool fork, etc.) with description fallbacks.
 */

const EMOJI_HINTS: [RegExp, string][] = [
  [/ask|brain|llm|model|create\s*\(/i, "🧠"],
  [/record|append|history|assistant|response\.content/i, "📝"],
  [/check|exit|stop|break|finished|tool_use/i, "✋"],
  [/execute|tool|bash|run|for\s+block|output/i, "⚙️"],
  [/feed|result|user\s*role|append.*user/i, "↩️"],
  [/loop|while|iterate/i, "🔁"],
  [/send|request|dispatch/i, "📤"],
  [/receive|return|parse/i, "📥"],
  [/validate|guard|ensure/i, "🛡️"],
  [/store|save|persist|write/i, "💾"],
];

function emojiFor(label: string): string {
  for (const [re, em] of EMOJI_HINTS) {
    if (re.test(label)) return em;
  }
  return "◇";
}

function shorten(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

function extractNumberedSteps(s: string): { n: string; label: string }[] {
  const trimmed = s.trim();
  if (!trimmed) return [];

  const chunks = trimmed.split(/(?=\d+\.\s)/).map((c) => c.trim()).filter(Boolean);
  const out: { n: string; label: string }[] = [];

  for (const chunk of chunks) {
    const m = chunk.match(/^(\d+)\.\s*([\s\S]+)$/);
    if (m) out.push({ n: m[1], label: m[2].trim() });
  }

  return out;
}

function flowchartVertical(steps: { n: string; label: string }[]): string {
  const labels = steps.map((s) => {
    const em = emojiFor(s.label);
    const lb = shorten(s.label, 22);
    return `${s.n}. ${em}  ${lb}`;
  });
  const innerW = Math.max(...labels.map((l) => l.length), 12);
  const bar = "─".repeat(innerW + 2);

  const lines: string[] = [];
  const boxPad = 4;
  const centerCol = boxPad + 2 + Math.floor((innerW + 2) / 2);

  for (let i = 0; i < labels.length; i++) {
    const content = labels[i].padEnd(innerW);
    lines.push(`${" ".repeat(boxPad)}╭${bar}╮`);
    lines.push(`${" ".repeat(boxPad)}│ ${content} │`);
    lines.push(`${" ".repeat(boxPad)}╰${bar}╯`);
    if (i < labels.length - 1) {
      lines.push(`${" ".repeat(centerCol)}│`);
      lines.push(`${" ".repeat(centerCol)}▼`);
    }
  }
  return lines.join("\n");
}

function singleStepNode(step: { n: string; label: string }): string {
  const em = emojiFor(step.label);
  const lb = shorten(step.label, 28);
  const row = `${step.n}. ${em}  ${lb}`;
  const innerW = Math.max(row.length, 10);
  const bar = "─".repeat(innerW + 2);
  const content = row.padEnd(innerW);
  return [`    ╭${bar}╮`, `    │ ${content} │`, `    ╰${bar}╯`].join("\n");
}

function fallbackGraphic(text: string): string {
  const em = emojiFor(text);
  const lb = shorten(text, 30);
  const innerW = Math.max(lb.length + 3, 14);
  const bar = "─".repeat(innerW);
  return [`      ${em}  gist`, `    ┌${bar}┐`, `    │ ${shorten(lb, innerW - 2)} │`, `    └${bar}┘`].join("\n");
}

/* ── Code-shaped stories (agent-loop style) ───────────────────────── */

function storyAskBrain(): string {
  return [
    "              client",
    "                │",
    "       ┌────────┴─────────┐",
    "       │  /messages       │  ← full transcript so far",
    "       │  /tools          │  ← tool JSON the model may invoke",
    "       └────────┬─────────┘",
    "                │",
    "                ╰────────────►  🧠  LLM",
    "                         one forward pass",
  ].join("\n");
}

function storyRecordResponse(): string {
  return [
    "        🧠 LLM just answered",
    "                 │",
    "                 ▼",
    "   messages.append( role: assistant , content: response )",
    "                 │",
    "                 ▼",
    "        transcript grows — next lap sees this turn",
  ].join("\n");
}

function storyCheckExit(): string {
  return [
    "           inspect stop_reason",
    "                  │",
    "         ┌────────┴────────┐",
    "         ▼                 ▼",
    "    == tool_use        anything else",
    "         │                 │",
    "         │                 └──►  break   leave while True",
    "         │",
    "         └──►  stay in loop  (still work to do)",
  ].join("\n");
}

function storyExecuteTools(): string {
  return [
    "   scan response.content for tool_use blocks",
    "                  │",
    "                  ▼",
    "            run_bash(command)",
    "                  │",
    "                  ▼",
    "     wrap stdout as tool_result { id, output }",
    "                  │",
    "                  ▼",
    "           results[]  ← this turn’s bundle",
  ].join("\n");
}

function storyFeedResults(): string {
  return [
    "      batched tool_result[]",
    "               │",
    "               ▼",
    "  messages.append( role: \"user\" , content: results )",
    "               │",
    "               ▼",
    "   the shell \"speaks\" as a user turn —",
    "   LLM reads it on the next client.messages.create lap",
  ].join("\n");
}

/**
 * Pick a story from code shape first, then from description numbering.
 */
export function graphicForSubblockSegment(description: string, code: string): string | null {
  const c = code.trim();
  const d = description.trim();

  if (c) {
    if (/client\.messages\.create/.test(c)) return storyAskBrain();
    if (
      /append\s*\(\s*\{\s*"role"\s*:\s*"assistant"/.test(c) ||
      (/"role"\s*:\s*"assistant"/.test(c) && /response\.content/.test(c))
    ) {
      return storyRecordResponse();
    }
    if (/stop_reason/.test(c) && /tool_use/.test(c) && /\bbreak\b/.test(c)) {
      return storyCheckExit();
    }
    if (/run_bash/.test(c)) return storyExecuteTools();
    if (/"role"\s*:\s*"user"/.test(c) && /results/.test(c) && /\.append\s*\(/.test(c)) {
      return storyFeedResults();
    }
  }

  if (!d) return null;

  const steps = extractNumberedSteps(d);
  if (steps.length >= 2) return flowchartVertical(steps);
  if (steps.length === 1) return singleStepNode(steps[0]);
  return fallbackGraphic(d);
}
