"use client";

import { useEffect, useState } from "react";
import slogans from "../../blog/slogans.json";

export function Hero() {
  const [slogan, setSlogan] = useState<string | null>(null);

  useEffect(() => {
    async function getSlogan() {
      // 50% chance to pick a personal slogan vs an internet one
      const usePersonal = Math.random() > 0.5;

      if (usePersonal) {
        const personal = slogans.personal[Math.floor(Math.random() * slogans.personal.length)];
        setSlogan(personal);
      } else {
        // Load API sources dynamically from slogans.json
        const sources = (slogans as any).api_sources || [];

        for (const source of sources) {
          try {
            const response = await fetch(source.url);
            if (response.ok) {
              const data = await response.json();
              setSlogan(data[source.key]);
              return;
            }
          } catch (e) {
            continue;
          }
        }

        // Final Fallback: static list from slogans.json
        const fallback = slogans.internet[Math.floor(Math.random() * slogans.internet.length)];
        setSlogan(fallback);
      }
    }
    getSlogan();
  }, []);

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-muted/50 to-muted px-8 py-16 text-center shadow-sm">
      <h1 className="animate-in fade-in slide-in-from-top-4 duration-700 text-4xl font-bold tracking-tight sm:text-5xl">
        Welcome to My Blog
      </h1>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 mt-4 h-8 flex items-center justify-center">
        {slogan && (
          <p className="text-xl italic font-serif text-primary/80">
            &ldquo;{slogan}&rdquo;
          </p>
        )}
      </div>
      <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 mt-6 max-w-xl text-lg text-muted-foreground">
        I write about programming, technology, and my journey in software
        development. Explore my thoughts, tutorials, and experiences in the
        world of code.
      </p>
    </section>
  );
}
