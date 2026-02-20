import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { extractMeta, type ArticleMeta } from "@/lib/article-meta";

// ── Types ──────────────────────────────────────────────────────────

export interface BlogTopic {
  name: string;
  dir: BlogTopic[];
}

export interface FeaturedPost {
  title: string;
  description: string;
  date: string;
  path: string[];
}

export interface ArticleData {
  content: string;
  frontmatter: Record<string, unknown>;
  headings: Heading[];
}

export interface Heading {
  depth: number;
  text: string;
  slug: string;
}

// ── Paths ──────────────────────────────────────────────────────────

const BLOG_DIR = path.join(process.cwd(), "blog");

// ── Directory README ───────────────────────────────────────────────

/**
 * Read README.md from a blog directory if it exists.
 * @param nameSegments Real folder names relative to the blog root.
 */
export function getDirectoryReadme(nameSegments: string[]): string | null {
  const readmePath = path.join(BLOG_DIR, ...nameSegments, "README.md");
  if (!fs.existsSync(readmePath)) return null;
  return fs.readFileSync(readmePath, "utf-8");
}

// ── Slug ↔ Name mapping ───────────────────────────────────────────
// URLs use hyphens; file/folder names may use spaces.

/** Convert a real file/folder name to a URL-safe slug (spaces → hyphens). */
export function nameToSlug(name: string): string {
  return name.replace(/ /g, "-");
}

/**
 * Build a lookup from slug → real name for every topic in the tree.
 * This handles the case where two names share the same slug (unlikely
 * but we keep the first match).
 */
function buildSlugMap(): Map<string, string> {
  const map = new Map<string, string>();
  const root = getBlogIndex();

  function walk(topics: BlogTopic[], prefix: string) {
    for (const topic of topics) {
      const key = prefix + nameToSlug(topic.name);
      if (!map.has(key)) map.set(key, prefix + topic.name);
      if (topic.dir.length > 0) {
        walk(topic.dir, prefix + topic.name + "/");
      }
    }
  }

  walk(root.dir, "");
  return map;
}

/** Resolve an array of URL slugs back to the real file/folder names. */
export function slugsToNames(slugs: string[]): string[] {
  const root = getBlogIndex();
  const names: string[] = [];
  let topics = root.dir;

  for (const slug of slugs) {
    const found = topics.find((t) => nameToSlug(t.name) === slug);
    if (!found) return names; // stop if no match
    names.push(found.name);
    topics = found.dir;
  }

  return names;
}

// ── Index & Featured ───────────────────────────────────────────────

export function getBlogIndex(): BlogTopic {
  const indexPath = path.join(BLOG_DIR, "index.json");
  const raw = fs.readFileSync(indexPath, "utf-8");
  return JSON.parse(raw) as BlogTopic;
}

export function getFeaturedPosts(): FeaturedPost[] {
  const featuredPath = path.join(BLOG_DIR, "featured.json");
  const raw = fs.readFileSync(featuredPath, "utf-8");
  return JSON.parse(raw) as FeaturedPost[];
}

// ── Navigate the topic tree ────────────────────────────────────────

/** Get the child topics at a given slug path. */
export function getTopicsAtPath(slugs: string[]): BlogTopic[] {
  const root = getBlogIndex();
  let topics = root.dir;

  for (const slug of slugs) {
    const found = topics.find((t) => nameToSlug(t.name) === slug);
    if (!found) return [];
    topics = found.dir;
  }

  return topics;
}

/** Separate categories (directories) from articles (.md files) */
export function separateCatBlog(topics: BlogTopic[]): {
  categories: BlogTopic[];
  articles: BlogTopic[];
} {
  const isBlog = (name: string) =>
    name.endsWith(".md") || name.endsWith(".org");
  const isReadme = (name: string) =>
    name.toLowerCase() === "readme.md";
  return {
    categories: topics.filter((t) => !isBlog(t.name)),
    articles: topics.filter((t) => isBlog(t.name) && !isReadme(t.name)),
  };
}

/** Count direct subdirectories and documents inside a topic. */
export function countChildren(topic: BlogTopic): {
  subdirs: number;
  docs: number;
} {
  const isBlog = (name: string) =>
    name.endsWith(".md") || name.endsWith(".org");
  const isReadme = (name: string) =>
    name.toLowerCase() === "readme.md";
  let subdirs = 0;
  let docs = 0;
  for (const child of topic.dir) {
    if (isBlog(child.name) && !isReadme(child.name)) docs++;
    else if (!isBlog(child.name)) subdirs++;
  }
  return { subdirs, docs };
}

/** Format a human-readable description like "2 folders, 3 articles". */
export function formatChildCounts(topic: BlogTopic): string {
  const { subdirs, docs } = countChildren(topic);
  const parts: string[] = [];
  if (subdirs > 0) parts.push(`${subdirs} folder${subdirs !== 1 ? "s" : ""}`);
  if (docs > 0) parts.push(`${docs} article${docs !== 1 ? "s" : ""}`);
  return parts.join(", ") || "empty";
}

// ── Article reading ────────────────────────────────────────────────

/** Read an article given URL slugs (will map back to real filenames). */
export function getArticle(slugs: string[]): ArticleData | null {
  const realNames = slugsToNames(slugs);
  if (realNames.length !== slugs.length) return null;

  const filePath = path.join(BLOG_DIR, ...realNames);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const headings = extractHeadings(content);

  return { content, frontmatter: data, headings };
}

function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const depth = match[1].length;
      const text = match[2].trim();
      const slug = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.push({ depth, text, slug });
    }
  }

  return headings;
}

// ── Quick meta lookup for article lists ────────────────────────────

/**
 * Read only the :::meta block from an article file, given real
 * filesystem path segments (relative to the blog directory).
 * Returns null if the file doesn't exist.
 */
export function getArticleMetaByNames(nameSegments: string[]): ArticleMeta | null {
  const filePath = path.join(BLOG_DIR, ...nameSegments);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(raw);
  const { meta } = extractMeta(content);
  return meta;
}

/**
 * For a list of article topics within a parent path, return a map
 * from article name to its ArticleMeta.
 */
export function getArticleMetasAtPath(
  parentNames: string[],
  articles: BlogTopic[]
): Map<string, ArticleMeta> {
  const map = new Map<string, ArticleMeta>();
  for (const article of articles) {
    const meta = getArticleMetaByNames([...parentNames, article.name]);
    if (meta) map.set(article.name, meta);
  }
  return map;
}

// ── Static params generation ───────────────────────────────────────

/** Returns all slug arrays with hyphens instead of spaces — URL-safe. */
export function getAllBlogSlugs(): string[][] {
  const root = getBlogIndex();
  const slugs: string[][] = [];
  const isReadme = (name: string) => name.toLowerCase() === "readme.md";

  function walk(topics: BlogTopic[], currentPath: string[]) {
    for (const topic of topics) {
      if (isReadme(topic.name)) continue;
      const newPath = [...currentPath, nameToSlug(topic.name)];
      slugs.push(newPath);
      if (topic.dir.length > 0) {
        walk(topic.dir, newPath);
      }
    }
  }

  walk(root.dir, []);
  return slugs;
}
