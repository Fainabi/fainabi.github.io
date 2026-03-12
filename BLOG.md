# Blog Rule Framework

This document defines the mandatory standards and workflows for all agents (AI or human) contributing to this repository. All agents must read and adhere to these rules to maintain project integrity.

## 1. Directory Structure & Assets
- **Articles:** Markdown files located in `/blog/**/*.md`.
- **LilyPond Assets:** SVGs are generated to `/public/generated/lilypond/`.
- **Indices:** `blog/index.json` and `blog/featured.json` are the source of truth for the frontend.

## 2. Content Standards
### Metadata Block
Every article MUST start with a `:::meta` block, with the exception of `README.md` files which are exempt. Agents must ensure the `title` is present.
- **Note:** The `quickview` field is for the user to write. Agents should **not** generate or modify it unless explicitly asked, as it serves as a personal memory aid.
```markdown
:::meta
title : <Clear and descriptive title>
quickview : <Leave for user or only edit if instructed>
:::
```

### Specialized Blocks
- **Math:** Use LaTeX/KaTeX syntax for equations.
- **Music:** Use `:::lilypond` blocks for sheet music. 
  - *Note:* Modification of these blocks requires a pipeline trigger.

## 3. Automation Pipeline (`scan.py`)
To optimize performance, `python scan.py` should **NOT** be run for every minor text edit. It is only required during the following events:

1. **File Creation:** When a new `.md` file is added to the `/blog` directory.
2. **File Deletion:** When an article is removed.
3. **LilyPond Modification:** When the content inside a `:::lilypond` block is added, changed, or removed.
4. **Metadata Changes:** If the `title` in the `:::meta` block is updated (to sync the JSON indices).

## 4. Verification Protocol
Before marking a task as complete, agents should:
- Verify that `:::meta` blocks are correctly formatted (at least containing a title).
- Ensure no broken internal links were introduced.
- If a trigger event occurred, confirm `scan.py` finished without errors.
- **Build Safety:** Run `npm run build` before a `git push` to ensure the site compiles correctly for GitHub deployment.

## 5. Journaling
Every time there's a structural modification, milestone, or significant change to the blog system (e.g., adding a new feature, rule, or script), a new entry MUST be added to the `### Development Journals` section in `blog/todo.md`. This is separate from git commits and acts as a quick-view history.

## 6. Technology Stack Context
- **Frontend:** Next.js (TypeScript) with Tailwind/Vanilla CSS.
- **Legacy/Core:** Some logic remains in Elm; do not modify `.elm` files unless specifically instructed.
- **Automation:** Python 3.x is used for markdown processing and asset generation.
