"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PlotConfig } from "@/lib/plot";

// ── Colour palette (works in both light & dark themes) ──────────────
const COLORS = [
  "hsl(220, 70%, 55%)",   // blue
  "hsl(0,   70%, 55%)",   // red
  "hsl(140, 55%, 45%)",   // green
  "hsl(35,  85%, 55%)",   // orange
  "hsl(280, 60%, 55%)",   // purple
  "hsl(180, 55%, 45%)",   // teal
  "hsl(330, 65%, 55%)",   // pink
  "hsl(60,  65%, 45%)",   // olive
];

// ── Safe math evaluator ─────────────────────────────────────────────
// Expose common math functions so users can write `sin(x)` instead of
// `Math.sin(x)`.  The expression is wrapped in `with (scope) { ... }`.
const MATH_SCOPE: Record<string, unknown> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  atan2: Math.atan2,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  exp: Math.exp,
  log: Math.log,
  log2: Math.log2,
  log10: Math.log10,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  ceil: Math.ceil,
  floor: Math.floor,
  round: Math.round,
  sign: Math.sign,
  pow: Math.pow,
  min: Math.min,
  max: Math.max,
  PI: Math.PI,
  E: Math.E,
  Infinity,
};

/**
 * Build a function `(x: number) => number` from a JS expression string.
 * Falls back to returning NaN for any parse / runtime errors.
 */
function buildEvaluator(expr: string): (x: number) => number {
  try {
    // Also allow `Math.*` explicitly
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(
      "x",
      "scope",
      `with(scope){ return (${expr}); }`
    ) as (x: number, scope: Record<string, unknown>) => number;

    return (x: number) => {
      try {
        const y = fn(x, MATH_SCOPE);
        return Number.isFinite(y) ? y : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return () => NaN;
  }
}

// ── Component ───────────────────────────────────────────────────────

interface PlotChartProps {
  config: PlotConfig;
}

export function PlotChart({ config }: PlotChartProps) {
  const { title, xmin, xmax, ymin, ymax, steps, sub, functions: fns } = config;

  const data = useMemo(() => {
    const evaluators = fns.map((f) => ({
      label: f.label,
      eval: buildEvaluator(f.expr),
    }));

    // Optional x-substitution: when `sub` is set, every function
    // receives sub(x) instead of x.  e.g. sub = "2 * PI * x"
    const xTransform = sub ? buildEvaluator(sub) : null;

    const dx = (xmax - xmin) / steps;
    const points: Record<string, number | null>[] = [];

    // When explicit y-bounds are given, clamp values so lines stay within
    // the visible area instead of shooting off to extreme values.
    const lo = ymin !== undefined ? ymin : -Infinity;
    const hi = ymax !== undefined ? ymax : Infinity;

    for (let i = 0; i <= steps; i++) {
      const x = xmin + i * dx;
      const tx = xTransform ? xTransform(x) : x;
      const point: Record<string, number | null> = { x: Math.round(x * 1e6) / 1e6 };
      for (const ev of evaluators) {
        const y = ev.eval(tx);
        if (Number.isNaN(y)) {
          point[ev.label] = null;
        } else if (y < lo || y > hi) {
          // Outside visible range – null out to break the line
          point[ev.label] = null;
        } else {
          point[ev.label] = Math.round(y * 1e6) / 1e6;
        }
      }
      points.push(point);
    }

    return points;
  }, [xmin, xmax, ymin, ymax, steps, sub, fns]);

  // Compute nice tick values for x-axis
  const xTicks = useMemo(() => {
    const range = xmax - xmin;
    const rawStep = range / 6;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;
    let tickStep: number;
    if (normalized <= 1.5) tickStep = magnitude;
    else if (normalized <= 3.5) tickStep = 2 * magnitude;
    else if (normalized <= 7.5) tickStep = 5 * magnitude;
    else tickStep = 10 * magnitude;

    const ticks: number[] = [];
    const start = Math.ceil(xmin / tickStep) * tickStep;
    for (let t = start; t <= xmax + tickStep * 0.01; t += tickStep) {
      ticks.push(Math.round(t * 1e6) / 1e6);
    }
    return ticks;
  }, [xmin, xmax]);

  return (
    <figure className="not-prose my-8 rounded-lg border bg-card p-4">
      {title && (
        <figcaption className="mb-4 text-center text-sm font-semibold text-card-foreground">
          {title}
        </figcaption>
      )}
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="x"
            type="number"
            domain={[xmin, xmax]}
            ticks={xTicks}
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) =>
              Number.isInteger(v) ? String(v) : v.toFixed(2)
            }
          />
          <YAxis
            type="number"
            domain={[
              ymin !== undefined ? ymin : "auto",
              ymax !== undefined ? ymax : "auto",
            ]}
            allowDataOverflow={ymin !== undefined || ymax !== undefined}
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) =>
              Number.isInteger(v) ? String(v) : v.toFixed(2)
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: 12,
            }}
            formatter={(value: number | undefined) => value?.toFixed(4) ?? ""}
            labelFormatter={(label: unknown) => `x = ${label}`}
          />
          <Legend
            wrapperStyle={{ fontSize: 13 }}
            {...{ payload: fns.map((f, i) => ({
              value: f.label,
              type: "line" as const,
              color: COLORS[i % COLORS.length],
            })) }}
          />
          {fns.map((f, i) => (
            <Line
              key={f.label}
              type="monotone"
              dataKey={f.label}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}
