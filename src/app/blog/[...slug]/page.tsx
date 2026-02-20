import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getTopicsAtPath,
  separateCatBlog,
  getArticle,
  getAllBlogSlugs,
  nameToSlug,
  slugsToNames,
  formatChildCounts,
  getArticleMetasAtPath,
  getDirectoryReadme,
} from "@/lib/blog";
import { BlogBreadcrumb } from "@/components/blog-breadcrumb";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TocSidebar } from "@/components/toc-sidebar";
import { FlashcardSidebar } from "@/components/flashcard-sidebar";
import { ArticleMetaBanner } from "@/components/article-meta-banner";
import { extractFlashcards } from "@/lib/flashcards";
import { extractMeta } from "@/lib/article-meta";
import { extractInterests } from "@/lib/interests";
import { InterestsCard } from "@/components/interests-card";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, FileText } from "lucide-react";

interface BlogSlugPageProps {
  params: Promise<{ slug: string[] }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const allSlugs = getAllBlogSlugs();
  return allSlugs.map((slug) => ({ slug }));
}

export default async function BlogSlugPage({ params }: BlogSlugPageProps) {
  const { slug } = await params;
  const lastSegment = slug[slug.length - 1];
  const isArticle = lastSegment.endsWith(".md") || lastSegment.endsWith(".org");

  // Resolve slugs to display names for breadcrumbs / headings
  const realNames = slugsToNames(slug);

  if (isArticle) {
    // ── Article view ─────────────────────────────────────────────
    const article = getArticle(slug);
    if (!article) notFound();

    const { meta, content: contentAfterMeta } = extractMeta(article.content);
    const { cards, content: contentAfterCards } = extractFlashcards(contentAfterMeta);
    const { interests, content } = extractInterests(contentAfterCards);

    return (
      <div className="mx-auto max-w-screen-xl px-4 py-8">
        <div className="mb-6">
          <BlogBreadcrumb slugs={slug} names={realNames} />
        </div>
        <ArticleMetaBanner meta={meta} />
        <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
          <div>
            <MarkdownRenderer content={content} />
            <InterestsCard interests={interests} />
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <TocSidebar />
              <FlashcardSidebar cards={cards} />
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // ── Category view ────────────────────────────────────────────
  const topics = getTopicsAtPath(slug);
  if (topics.length === 0) notFound();

  const { categories, articles } = separateCatBlog(topics);
  const articleMetas = getArticleMetasAtPath(realNames, articles);
  const displayName = realNames.length > 0 ? realNames[realNames.length - 1] : slug[slug.length - 1];
  const readme = getDirectoryReadme(realNames);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <BlogBreadcrumb slugs={slug} names={realNames} />
      </div>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        {displayName}
      </h1>

      {categories.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
            Categories
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/blog/${[...slug, nameToSlug(cat.name)].join("/")}`}
              >
                <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <Folder className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">{cat.name}</CardTitle>
                      <CardDescription>
                        {formatChildCounts(cat)}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
            Articles
          </h2>
          <div className="space-y-2">
            {articles.map((article) => {
              const meta = articleMetas.get(article.name);
              return (
                <Link
                  key={article.name}
                  href={`/blog/${[...slug, nameToSlug(article.name)].join("/")}`}
                  className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{article.name.replace(/\.md$/, "")}</span>
                      {meta?.reference && (
                        <span className="font-mono text-xs text-muted-foreground">
                          [{meta.reference}]
                        </span>
                      )}
                    </div>
                    {meta?.tags && meta.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {meta.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {readme && (
        <section className="mt-10 border-t pt-8">
          <MarkdownRenderer content={readme} />
        </section>
      )}
    </div>
  );
}
