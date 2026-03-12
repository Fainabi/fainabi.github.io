# Reading Notes: Learn Claude Code

This directory contains a collection of reading notes and architectural analyses of the [learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) repository. 

## About the Project
`learn-claude-code` is a 0-to-1 educational project by [shareAI-lab](https://github.com/shareAI-lab) that deconstructs the mechanisms of agentic coding tools like Anthropic's Claude Code. It follows a progressive 12-session path, starting from a basic LLM loop and evolving into a multi-agent system with task isolation and background execution.

## Reference & Copyright
- **Original Repository:** [https://github.com/shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code)
- **Author/Organization:** shareAI-lab (Matt Shumer and contributors)
- **License:** MIT License (as specified in the original repository)

The notes in this directory are my personal interpretations and summaries of the teaching materials provided in the original project. All code snippets and diagrams referenced from the original repository remain the property of their respective owners.

## Teaching Plan: Deconstructing the Agent
To master the ideas in this repository, we will follow a structured path divided into four "Levels of Autonomy":

### Level 1: The Reactive Core (Sessions 1-2)
- **Goal:** Understand the "Infinite Loop" that drives every agent.
- **Key Concepts:** `stop_reason == "tool_use"`, the dispatch map (name -> handler).
- **Motto:** *"One loop & Bash is all you need."*

### Level 2: Planning & Context Management (Sessions 3-6)
- **Goal:** Moving from "guess and check" to deliberate execution.
- **Key Concepts:** The `TodoManager`, subagents for clean context, and the 3-layer compression strategy for long-running sessions.
- **Motto:** *"An agent without a plan drifts."*

### Level 3: Persistence & Background Ops (Sessions 7-8)
- **Goal:** Handling complexity that exceeds a single session's memory or time.
- **Key Concepts:** File-based task graphs (CRUD + dependencies), daemon threads for slow commands, and notification queues.
- **Motto:** *"Run slow operations in the background; the agent keeps thinking."*

### Level 4: The Multi-Agent Team (Sessions 9-12)
- **Goal:** Scaling the agent to handle large-scale, isolated projects.
- **Key Concepts:** JSONL mailboxes, plan approval FSM, autonomous task claiming, and worktree isolation.
- **Motto:** *"When the task is too big for one, delegate to teammates."*

---

## Navigation
- [Session 01: The Reactive Core - The Agent Loop](./s01-agent-loop.md)
- [Session 02: Tool Use Dispatch & Safety](./s02-tool-use.md)
- [Session 03: TodoWrite - The Power of Planning](./s03-todo-write.md) (Coming soon)
...
