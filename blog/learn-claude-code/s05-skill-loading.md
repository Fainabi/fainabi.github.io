:::meta
title : Session 05: Skill Loading & Knowledge Management
quickview : "Load knowledge when you need it, not upfront" -- inject via tool_result, not the system prompt.
:::

# Session 05: Skill Loading & Knowledge Management

As we add more capabilities to an agent—Git workflows, testing standards, specialized library knowledge—the system prompt starts to bloat. If every "skill" costs 2,000 tokens and we have 10 skills, the agent starts every conversation with a 20,000-token handicap.

Session 05 introduces a **Two-Layer Skill System** to optimize context and performance.

## The Problem: The "Handicap" of Upfront Knowledge

Putting everything in the system prompt is like carrying a 500-page manual for every task, even when you only need to change a lightbulb. It’s expensive, slow, and can lead to the model "forgetting" or confusing instructions.

## The Solution: On-Demand Knowledge Injection

Instead of loading everything upfront, we provide a "menu" and let the agent order what it needs.

### Layer 1: The Menu (Cheap)
The system prompt contains only the **name** and a short **description** of each skill. This tells the agent *what* is possible without explaining *how*.

```text
System Prompt:
...
Skills available:
- git: Specialized Git workflow and commit conventions.
- test: Best practices for Python testing with pytest.
- code-review: Standard checklist for PR reviews.
...
```

### Layer 2: The Manual (On-Demand)
If the agent decides it needs to perform a Git operation, it calls the `load_skill("git")` tool. The full content of the skill is then injected as a `tool_result`.

```text
Agent -> tool_use: load_skill(name="git")
System -> tool_result: 
    <skill name="git">
    Follow these rules for commits:
    1. Use imperative mood.
    2. Reference issue numbers...
    </skill>
```

## Implementation: The `SkillLoader`

Skills are stored as simple Markdown files with YAML frontmatter in a `skills/` directory:

```markdown
---
name: git
description: Specialized Git workflow and commit conventions.
tags: vcs, workflow
---
# Git Skill
Full instructions here...
```

The `SkillLoader` scans this directory and separates the metadata (for Layer 1) from the body (for Layer 2).

### Key Code Snippet

:::subblock python : The Skill Loader Bridge
SYSTEM = f"""You are a coding agent.
Use load_skill to access specialized knowledge.

Skills available:
{SKILL_LOADER.get_descriptions()}"""
[!! 1. System Integration: Inject Layer 1 (metadata) into the persistent system prompt | SYSTEM, SKILL_LOADER ]

TOOL_HANDLERS = {
    # ...
    "load_skill": lambda **kw: SKILL_LOADER.get_content(kw["name"]),
}
[!! 2. Demand Injection: Provide a tool to fetch Layer 2 (body) into the conversation context | TOOL_HANDLERS, load_skill ]
:::

## Why This Matters

1. **Token Efficiency:** You only pay for the knowledge the agent actually uses.
2. **Contextual Relevance:** The agent's focus is sharper because its context isn't cluttered with irrelevant instructions.
3. **Scalability:** You can add hundreds of skills without hitting system prompt limits.

## Motto
> *"Don't put everything in the system prompt. Load on demand."*

---
*Next: [Session 06: Context Compaction](./s06-context-compact.md)*
