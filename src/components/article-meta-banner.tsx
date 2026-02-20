"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Users,
  BookOpen,
  Tag,
  Quote,
  ChevronDown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleMeta } from "@/lib/article-meta";
import { hasMetaContent } from "@/lib/article-meta";

interface ArticleMetaBannerProps {
  meta: ArticleMeta;
}

export function ArticleMetaBanner({ meta }: ArticleMetaBannerProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  if (!hasMetaContent(meta)) return null;

  return (
    <div className="mb-8 rounded-lg border bg-muted/40 px-5 py-4 text-sm">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full cursor-pointer items-center gap-2 font-semibold transition-colors hover:text-muted-foreground"
      >
        <Info className="h-4 w-4" />
        Paper Info
        <ChevronDown
          className={cn(
            "ml-auto h-3.5 w-3.5 transition-transform duration-200",
            collapsed && "-rotate-90"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        )}
      >
        <div className="overflow-hidden">
          <dl className="mt-3 space-y-2">
            {meta.title && (
              <div className="font-medium">{meta.title}</div>
            )}

            {meta.authors && (
              <div className="flex items-start gap-2">
                <dt className="flex shrink-0 items-center gap-1.5 font-medium text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Authors
                </dt>
                <dd>{meta.authors}</dd>
              </div>
            )}

            {meta.publication && (
              <div className="flex items-start gap-2">
                <dt className="flex shrink-0 items-center gap-1.5 font-medium text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  Publication
                </dt>
                <dd>{meta.publication}</dd>
              </div>
            )}

            {meta.reference && (
              <div className="flex items-start gap-2">
                <dt className="flex shrink-0 items-center gap-1.5 font-medium text-muted-foreground">
                  <Quote className="h-3.5 w-3.5" />
                  Reference
                </dt>
                <dd className="font-mono text-xs">[{meta.reference}]</dd>
              </div>
            )}

            {meta.urls && meta.urls.length > 0 && (
              <div className="flex items-start gap-2">
                <dt className="flex shrink-0 items-center gap-1.5 font-medium text-muted-foreground">
                  <ExternalLink className="h-3.5 w-3.5" />
                  {meta.urls.length === 1 ? "Paper" : "Papers"}
                </dt>
                <dd className="flex flex-wrap gap-x-3 gap-y-1">
                  {meta.urls.map((url, i) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {meta.urls!.length === 1 ? url : `[${i + 1}]`}
                    </a>
                  ))}
                </dd>
              </div>
            )}

            {meta.tags && meta.tags.length > 0 && (
              <div className="flex items-start gap-2">
                <dt className="flex shrink-0 items-center gap-1.5 font-medium text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" />
                  Tags
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {meta.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
