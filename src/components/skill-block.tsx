"use client";

import { BrainCircuit, ChevronRight } from "lucide-react";
import type { SkillConfig } from "@/lib/skill";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface SkillBlockProps {
  config: SkillConfig;
}

export function SkillBlock({ config }: SkillBlockProps) {
  const title = config.title ?? "Skill";

  return (
    <details className="not-prose group my-4 rounded-lg border bg-muted/20 px-4 py-3">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold marker:content-none">
        <BrainCircuit className="h-4 w-4 text-primary" />
        {title}
        <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
      </summary>
      <div className="mt-2 text-sm text-foreground/90 [&_p]:my-1 [&_p]:leading-relaxed">
        <MarkdownRenderer content={config.body} skipCallouts skipSkills />
      </div>
    </details>
  );
}
