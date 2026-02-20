"use client";

import { Info, Lightbulb, AlertTriangle, MessageSquareText, AlertCircle } from "lucide-react";
import type { CalloutConfig } from "@/lib/callout";
import { MarkdownRenderer } from "@/components/markdown-renderer";

const CALLOUT_STYLES: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  defaultTitle: string;
  border: string;
  bg: string;
  iconColor: string;
}> = {
  remark: {
    icon: MessageSquareText,
    defaultTitle: "Remark",
    border: "border-blue-400/50",
    bg: "bg-blue-50/50 dark:bg-blue-950/20",
    iconColor: "text-blue-500",
  },
  note: {
    icon: Info,
    defaultTitle: "Note",
    border: "border-sky-400/50",
    bg: "bg-sky-50/50 dark:bg-sky-950/20",
    iconColor: "text-sky-500",
  },
  tip: {
    icon: Lightbulb,
    defaultTitle: "Tip",
    border: "border-emerald-400/50",
    bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    iconColor: "text-emerald-500",
  },
  warning: {
    icon: AlertTriangle,
    defaultTitle: "Warning",
    border: "border-amber-400/50",
    bg: "bg-amber-50/50 dark:bg-amber-950/20",
    iconColor: "text-amber-500",
  },
  caution: {
    icon: AlertCircle,
    defaultTitle: "Caution",
    border: "border-red-400/50",
    bg: "bg-red-50/50 dark:bg-red-950/20",
    iconColor: "text-red-500",
  },
};

interface CalloutBlockProps {
  config: CalloutConfig;
}

export function CalloutBlock({ config }: CalloutBlockProps) {
  const style = CALLOUT_STYLES[config.type] ?? CALLOUT_STYLES.note;
  const Icon = style.icon;
  const title = config.title ?? style.defaultTitle;

  return (
    <aside
      className={`not-prose my-6 rounded-lg border-l-4 ${style.border} ${style.bg} px-5 py-4`}
    >
      <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${style.iconColor}`}>
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className="text-sm text-foreground/90 [&_p]:my-1 [&_p]:leading-relaxed">
        <MarkdownRenderer content={config.body} skipCallouts />
      </div>
    </aside>
  );
}
