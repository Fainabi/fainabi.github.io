# fainabi.github.io

Personal web portal and blog engine, built for mathematical and technical expression.

## 🚀 Tech Stack
- **Framework:** Next.js (TypeScript)
- **Styling:** Vanilla CSS & Tailwind CSS
- **Automation:** Python 3 (Markdown processing, LilyPond SVG generation)
- **Content:** Markdown with KaTeX (Math) and LilyPond (Sheet Music) support

## ✨ Key Features
- **Mathematical Expression:** Native KaTeX support with global macros defined in `blog/katex-macros.json`.
- **Musical Integration:** Automated LilyPond rendering to SVG via `scan.py`.
- **Automated Indices:** Python-based scanner to keep the blog hierarchy and featured posts in sync.
- **Interactive Tools:** Floating terminal components, plot charts, and flashcard sidebars.

## 🤖 Agent Onboarding
If you are an AI agent helping with this project:
1. **Mandatory Reading:** Start by reading **`BLOG.md`**. It defines the core mandates for metadata, specialized blocks, and safety.
2. **Development Context:** Check **`blog/todo.md`** for the project's "Development Journals" and active focus areas.
3. **Automation Logic:** Familiarize yourself with **`scan.py`**. Run it only when articles are added/removed, metadata is updated, or LilyPond blocks are modified.
4. **Verification:** Before concluding a task, ensure `:::meta` blocks are correct and run `npm run build` to verify site integrity.

## 🛠️ Development
- `npm run dev`: Start local development server.
- `python scan.py`: Re-sync blog indices and generate LilyPond assets.
- `npm run build`: Production build and static export.

## 📌 Ongoing Goals
- [ ] **Avatar System:** Dynamic avatar engine for the blog.
- [ ] **Claw on the Blog:** Integration of the "Claw" component.
- [ ] **Mini Web Agent:** Inspired by `learn-claude-code` notes in the playground.

---
*Maintained by fainabi.*
