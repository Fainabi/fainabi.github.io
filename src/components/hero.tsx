export function Hero() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-muted/50 to-muted px-8 py-16 text-center shadow-sm">
      <h1 className="animate-in fade-in slide-in-from-top-4 duration-700 text-4xl font-bold tracking-tight sm:text-5xl">
        Welcome to My Blog
      </h1>
      <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 mt-4 max-w-xl text-lg text-muted-foreground">
        I write about programming, technology, and my journey in software
        development. Explore my thoughts, tutorials, and experiences in the
        world of code.
      </p>
    </section>
  );
}
