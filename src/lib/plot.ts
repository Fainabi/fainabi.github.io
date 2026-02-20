/**
 * Parse :::plot blocks from markdown and replace them with fenced code
 * blocks that the MarkdownRenderer can intercept and render as charts.
 *
 * Syntax:
 *
 *   :::plot
 *   title : Taylor Expansion of Sine
 *   xmin  : -3.14
 *   xmax  : 3.14
 *   ymin  : -2          (optional)
 *   ymax  : 2           (optional)
 *   steps : 200         (optional, default 200)
 *   sin(x) : Math.sin(x)
 *   T₃(x)  : x - x**3/6
 *   T₅(x)  : x - x**3/6 + x**5/120
 *   :::
 *
 * Config keys: title, xmin, xmax, ymin, ymax, steps, sub
 * All other "label : expression" lines are treated as function definitions.
 * Expressions use `x` as the variable and may use common math helpers
 * (sin, cos, tan, exp, log, sqrt, abs, pow, PI, E, etc.) without the
 * `Math.` prefix.
 *
 * The optional `sub` key defines a substitution for `x`. For example
 * `sub : 2 * PI * x` will evaluate every function as f(2πx) instead
 * of f(x).
 */

export interface PlotFunction {
  label: string;
  expr: string;
}

export interface PlotConfig {
  title?: string;
  xmin: number;
  xmax: number;
  ymin?: number;
  ymax?: number;
  steps: number;
  sub?: string;
  functions: PlotFunction[];
}

const PLOT_BLOCK_RE = /^:::plot\s*\r?\n([\s\S]*?)\r?\n:::\s*$/gm;

const CONFIG_KEYS = new Set(["title", "xmin", "xmax", "ymin", "ymax", "steps", "sub"]);

function parsePlotBlock(body: string): PlotConfig {
  const config: Partial<PlotConfig> = { steps: 200, functions: [] };
  const functions: PlotFunction[] = [];

  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();

    if (CONFIG_KEYS.has(key.toLowerCase())) {
      const k = key.toLowerCase();
      if (k === "title" || k === "sub") {
        (config as Record<string, unknown>)[k] = value;
      } else {
        const num = Number(value);
        if (!Number.isNaN(num)) {
          (config as Record<string, unknown>)[k] = num;
        }
      }
    } else {
      // It's a function definition: "label : expression"
      functions.push({ label: key, expr: value });
    }
  }

  config.functions = functions;

  return {
    title: config.title,
    xmin: (config.xmin as number) ?? -1,
    xmax: (config.xmax as number) ?? 1,
    ymin: config.ymin as number | undefined,
    ymax: config.ymax as number | undefined,
    steps: (config.steps as number) ?? 200,
    sub: config.sub as string | undefined,
    functions,
  };
}

/**
 * Replace every `:::plot` block with a fenced code block:
 *
 *   ```plot
 *   { ...JSON config... }
 *   ```
 *
 * The MarkdownRenderer intercepts `language-plot` code blocks and renders
 * them as interactive charts.
 */
export function preprocessPlots(md: string): string {
  return md.replace(PLOT_BLOCK_RE, (_match, body: string) => {
    const config = parsePlotBlock(body);
    const json = JSON.stringify(config);
    return "```plot\n" + json + "\n```";
  });
}
