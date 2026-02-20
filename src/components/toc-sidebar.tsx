"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List } from "lucide-react";

interface TocHeading {
  id: string;
  text: string;
  depth: number;
}

export function TocSidebar() {
  const [headings, setHeadings] = React.useState<TocHeading[]>([]);
  const [activeId, setActiveId] = React.useState<string>("");

  // Discover headings from the rendered article DOM
  React.useEffect(() => {
    const els = document.querySelectorAll(
      "article h1[id], article h2[id], article h3[id], article h4[id]"
    );

    const items: TocHeading[] = Array.from(els).map((el) => ({
      id: el.id,
      text: el.textContent ?? "",
      depth: parseInt(el.tagName[1], 10),
    }));

    setHeadings(items);
  }, []);

  // Scroll-spy: highlight the heading currently in view
  React.useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    const els = document.querySelectorAll(
      "article h1[id], article h2[id], article h3[id], article h4[id]"
    );
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <List className="h-4 w-4" />
        On this page
      </div>
      <ScrollArea className="max-h-[calc(100vh-12rem)]">
        <nav>
          <ul className="space-y-0.5 border-l text-sm">
            {headings.map((heading) => (
              <li key={heading.id}>
                <button
                  onClick={() => scrollTo(heading.id)}
                  className={cn(
                    "block w-full cursor-pointer border-l-2 py-1 text-left text-muted-foreground transition-colors hover:text-foreground",
                    heading.depth === 1 && "pl-3 font-medium",
                    heading.depth === 2 && "pl-3",
                    heading.depth === 3 && "pl-6",
                    heading.depth >= 4 && "pl-9",
                    activeId === heading.id
                      ? "border-primary text-foreground font-medium"
                      : "border-transparent"
                  )}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
    </div>
  );
}
