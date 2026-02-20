import { Hero } from "@/components/hero";
import { FeaturedPosts } from "@/components/featured-posts";
import { getFeaturedPosts } from "@/lib/blog";

export default function HomePage() {
  const posts = getFeaturedPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Hero />
      <FeaturedPosts posts={posts} />
    </div>
  );
}
