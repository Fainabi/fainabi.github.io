import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BlogBreadcrumbProps {
  /** URL slugs (hyphenated, URL-safe) */
  slugs: string[];
  /** Real display names (may have spaces) */
  names?: string[];
}

export function BlogBreadcrumb({ slugs, names }: BlogBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/blog">Blog</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {slugs.map((slug, index) => {
          const isLast = index === slugs.length - 1;
          const href = `/blog/${slugs.slice(0, index + 1).join("/")}`;
          const label = (names?.[index] ?? slug).replace(/\.md$/, "");

          return (
            <span key={href} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
