# Elm to Next.js Migration Plan

## Overview

This plan outlines a complete migration of the existing Elm-based personal blog to Next.js with shadcn/ui. The migration follows a "big bang" approach with a fresh design, modernizing the entire codebase while preserving all content and functionality.

## Requirements

- **Goal**: Modernize the blog platform from Elm to Next.js
- **UI Library**: shadcn/ui with fresh design (not porting existing styles)
- **Approach**: Big bang migration (complete rewrite)
- **Content**: Preserve all existing markdown blog posts and JSON data

## Current Architecture Analysis

### Elm Application Structure

The existing application is a single-page application (SPA) with:

1. **Routing** (`Route.elm`): Hash-based routing (`/#/`) with two main routes:
   - `Home` - Landing page with featured posts
   - `Blog [path]` - Blog listing and individual posts

2. **Pages**:
   - **Home** (`Home.elm`): Hero section + featured posts grid
   - **Blog listing** (`Page/Blog.elm`): Category/file browser with nested topics
   - **Blog post** (`Blog.elm`): Markdown article with table of contents sidebar

3. **Shared Components**:
   - **TopNav** (`TopNav.elm`): Navigation bar with logo, blog link, and theme toggle
   - **Toolbox** (`Toolbox.elm`): Floating action buttons (scroll to top, theme toggle)
   - **NavIdx** (`Blog/NavIdx.elm`): Breadcrumb navigation for blog paths
   - **SideNav** (`Blog/SideNav.elm`): Table of contents from markdown headings

4. **Data Models**:
   - `FeaturedPost`: `{ title, description, date, path }`
   - `Topic`: Recursive tree structure for blog categories
   - `Section`: `{ h: Int, name: String }` for TOC extraction

5. **Features**:
   - Light/Dark theme with localStorage persistence
   - MathJax rendering for LaTeX equations
   - Markdown parsing with frontmatter support (YAML tags)
   - Responsive layout with CSS Grid

### Data Sources

- `/blog/featured.json` - Featured posts for homepage
- `/blog/index.json` - Recursive tree of all blog categories/posts
- `/blog/**/*.md` - Markdown content files (16 posts across 7 categories)

### Special Features to Preserve

1. **MathJax Integration**: Custom macros for math rendering
2. **Frontmatter Parsing**: YAML tags in markdown files
3. **Table of Contents**: Auto-generated from H2/H3 headings
4. **Theme Persistence**: Dark/Light mode saved to localStorage
5. **Breadcrumb Navigation**: Collapsible path indicator

## Target Architecture

### Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **UI**: shadcn/ui components with Tailwind CSS
- **Markdown**: next-mdx-remote or react-markdown with remark/rehype plugins
- **Math**: KaTeX or MathJax via rehype-katex
- **Icons**: Lucide React (comes with shadcn/ui)

### Project Structure

```
/
├── app/
│   ├── layout.tsx              # Root layout with theme provider
│   ├── page.tsx                # Home page
│   ├── blog/
│   │   ├── page.tsx            # Blog listing (root)
│   │   └── [...slug]/
│   │       └── page.tsx        # Dynamic route for posts/categories
│   └── globals.css             # Tailwind + custom styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/
│   │   ├── header.tsx          # Navigation header
│   │   ├── footer.tsx          # Site footer (new)
│   │   └── theme-toggle.tsx    # Dark/light mode toggle
│   ├── blog/
│   │   ├── post-card.tsx       # Featured post card
│   │   ├── category-list.tsx   # Category browser
│   │   ├── toc.tsx             # Table of contents
│   │   ├── breadcrumb.tsx      # Blog path breadcrumb
│   │   └── markdown-content.tsx # MDX renderer
│   └── home/
│       ├── hero.tsx            # Hero section
│       └── featured-posts.tsx  # Featured posts grid
├── lib/
│   ├── blog.ts                 # Blog data utilities
│   ├── markdown.ts             # Markdown processing
│   └── utils.ts                # General utilities (cn helper)
├── public/
│   ├── blog/                   # Existing blog content (keep as-is)
│   └── assets/                 # Logo and icons
├── types/
│   └── blog.ts                 # TypeScript interfaces
└── config/
    └── site.ts                 # Site configuration
```

### Route Mapping

| Elm Route | Next.js Route | Description |
|-----------|---------------|-------------|
| `/#/` | `/` | Home page |
| `/#/blog` | `/blog` | Blog listing root |
| `/#/blog/category` | `/blog/category` | Category view |
| `/#/blog/path/to/post.md` | `/blog/path/to/post` | Blog post (strip .md) |

## Implementation Phases

### Phase 1: Project Setup and Infrastructure

1. Initialize Next.js project with TypeScript in the repository root
2. Install and configure shadcn/ui with Tailwind CSS
3. Set up the theme provider (next-themes) for dark/light mode
4. Configure path aliases and TypeScript settings
5. Create base layout structure with metadata

### Phase 2: Core Components and UI

1. Build the Header component with navigation and theme toggle using shadcn/ui
2. Create the Hero section for the home page with modern gradient design
3. Build PostCard component using shadcn/ui Card for featured posts
4. Implement responsive layout with Tailwind CSS grid/flexbox
5. Add footer component (new addition)

### Phase 3: Blog Infrastructure

1. Create TypeScript interfaces for blog data (FeaturedPost, Topic, BlogPost)
2. Implement blog data utilities to fetch and parse index.json and featured.json
3. Set up markdown processing with react-markdown, remark-gfm, and rehype plugins
4. Configure KaTeX/MathJax for LaTeX math rendering with custom macros
5. Implement frontmatter parsing using gray-matter

### Phase 4: Blog Pages and Navigation

1. Build the blog listing page with category/file browser
2. Create dynamic [...slug] route for nested blog paths
3. Implement the Table of Contents component extracting H2/H3 headings
4. Build breadcrumb navigation component using shadcn/ui Breadcrumb
5. Create the blog post layout with content and TOC sidebar

### Phase 5: Home Page and Featured Content

1. Assemble the home page with Hero and FeaturedPosts sections
2. Implement featured posts fetching from featured.json
3. Add animations and transitions using Tailwind/Framer Motion
4. Ensure responsive design for mobile and tablet

### Phase 6: Theme System and Polish

1. Configure CSS variables for light/dark themes
2. Implement theme persistence using next-themes and localStorage
3. Add scroll-to-top functionality
4. Polish transitions and loading states
5. Add proper meta tags and SEO optimization

### Phase 7: Testing and Cleanup

1. Test all blog posts render correctly with math equations
2. Verify responsive design across breakpoints
3. Test theme switching and persistence
4. Remove old Elm files and dependencies
5. Update README and deployment configuration

## Key Technical Decisions

### Markdown Processing Pipeline

```
markdown file
    → gray-matter (frontmatter extraction)
    → react-markdown
        → remark-gfm (GitHub Flavored Markdown)
        → rehype-katex (math rendering)
        → rehype-slug (heading IDs)
        → rehype-highlight (code syntax)
```

### Theme Implementation

Use `next-themes` with Tailwind's dark mode class strategy:

```tsx
// Tailwind config
darkMode: 'class'

// Theme provider wraps layout
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
```

### Static vs Dynamic Rendering

- Home page: Static with ISR (revalidate featured posts)
- Blog listing: Static (blog index rarely changes)
- Blog posts: Static generation from markdown files
- Consider `generateStaticParams` for all known blog routes

### MathJax Custom Macros

Port existing macros to KaTeX or MathJax config:

```javascript
const mathMacros = {
  '\\bm': '{\\boldsymbol #1}',
  '\\of': '\\left(#1\\right)',
  '\\abs': '\\left\\lvert #1 \\right\\rvert',
  '\\norm': '\\left\\| #1 \\right\\|',
  '\\Z': '\\mathbb{Z}',
  '\\R': '\\mathbb{R}',
  // ... etc
};
```

## Design Approach (Fresh Design with shadcn/ui)

### Color Palette

Use shadcn/ui's default slate-based neutral palette with a primary accent color:

- **Light mode**: Clean white backgrounds with subtle gray accents
- **Dark mode**: Rich dark backgrounds (slate-900/950)
- **Accent**: Indigo or blue for interactive elements

### Typography

- Use shadcn/ui's default Inter/system font stack
- Clear hierarchy with proper heading scales
- Improved reading experience for long-form content

### Components to Use from shadcn/ui

- `Button` - CTAs and actions
- `Card` - Post cards, category items
- `Breadcrumb` - Blog navigation path
- `NavigationMenu` - Header navigation
- `DropdownMenu` - Mobile menu, theme selector
- `Separator` - Visual dividers
- `ScrollArea` - TOC sidebar
- `Badge` - Post tags/categories

### Layout Improvements

1. **Header**: Sticky, minimal, with smooth backdrop blur
2. **Hero**: Full-width gradient with animated text
3. **Posts Grid**: Modern card design with hover effects
4. **Blog Layout**: Two-column with sticky TOC
5. **Footer**: New addition with links and copyright

## Migration Checklist

- [ ] Backup existing blog content
- [ ] Initialize Next.js project
- [ ] Set up shadcn/ui and Tailwind
- [ ] Implement core layout and theme
- [ ] Build all page components
- [ ] Set up markdown pipeline with math
- [ ] Test all existing blog posts
- [ ] Verify responsive design
- [ ] Clean up Elm artifacts
- [ ] Deploy and verify

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Math rendering differences | Medium | Test all equations, adjust KaTeX macros |
| Markdown parsing edge cases | Medium | Test each post, handle edge cases |
| Theme persistence issues | Low | Use proven next-themes library |
| SEO/routing changes | Medium | Set up redirects if needed |
| Performance regression | Low | Use Next.js static generation |

## Files to Keep

- `/blog/**/*.md` - All blog content
- `/blog/*.json` - Blog index and featured data
- `/assets/*.svg` - Logo images (may redesign)
- `/LICENSE`, `/README.md` - Repository files

## Files to Remove (After Migration)

- `/src/**/*.elm` - All Elm source files
- `/elm.json` - Elm package manifest
- `/elm.min.js` - Compiled Elm bundle
- `/css/*.css` - Old stylesheets
- `/scripts/ports.js` - Elm port handlers
- `/index.html` - Old entry point
- `/scan.py`, `/scan.hs`, `/icons.jl` - Utility scripts

## Success Criteria

1. All 16 blog posts render correctly with math equations
2. Dark/light theme works with persistence
3. Mobile responsive design
4. Improved page load performance
5. Modern, polished visual design
6. Maintainable TypeScript codebase
