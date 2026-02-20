import Link from "next/link";
import { getBlogIndex, separateCatBlog, nameToSlug, formatChildCounts, getArticleMetasAtPath, getDirectoryReadme } from "@/lib/blog";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, FileText } from "lucide-react";

export default function BlogIndexPage() {
  const root = getBlogIndex();
  const { categories, articles } = separateCatBlog(root.dir);
  const articleMetas = getArticleMetasAtPath([], articles);
  const readme = getDirectoryReadme([]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Blog</h1>

      {categories.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
            Categories
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/blog/${nameToSlug(cat.name)}`}>
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
                  href={`/blog/${nameToSlug(article.name)}`}
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
