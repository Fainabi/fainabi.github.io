import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { nameToSlug } from "@/lib/blog";
import type { FeaturedPost } from "@/lib/blog";

interface FeaturedPostsProps {
  posts: FeaturedPost[];
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  return (
    <section className="mt-16">
      <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">
        Featured Posts
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const href = `/blog/${post.path.map(nameToSlug).join("/")}`;
          return (
            <Link key={href} href={href} className="group">
              <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription>{post.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1" />
                <CardFooter className="flex items-center justify-between">
                  <Badge variant="secondary">{post.date}</Badge>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                    Read More
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
