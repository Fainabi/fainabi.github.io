:::meta
title : Session 03: TodoWrite - The Power of Planning
quickview : 
:::

# Session 03: TodoWrite - The Power of Planning

> **Motto:** *"An agent without a plan drifts"*

In the first two sessions, we built a **Reactive Agent**—one that can execute commands and read/write files. But as tasks become more complex, a reactive agent begins to fail. It forgets where it is in a multi-step process, repeats work, or wanders off-track.

Session 03 introduces the first layer of **Autonomy**: the **Plan**.

## The Problem: The "Context Fog"
When an LLM performs a 10-step refactoring, the context window fills up with tool outputs (bash results, file contents). As the conversation grows:
- The original system prompt (and the high-level goal) "fades" into the background.
- The model loses its "mental map" of the project.
- It might finish steps 1-3, then start improvising because it forgot steps 4-10.

## The Solution: The `TodoManager`
Instead of relying on the model's internal memory, we give it an external, structured **Plan State**.

### 1. The Todo Structure
A plan is a list of tasks, each with a status: `pending`, `in_progress`, or `completed`. 

```python
class TodoManager:
    def update(self, items: list) -> str:
        validated, in_progress_count = [], 0
        for item in items:
            status = item.get("status", "pending")
            if status == "in_progress":
                in_progress_count += 1
            validated.append({
                "id": item["id"], 
                "text": item["text"],
                "status": status
            })
        
        # The Constraint: Focus on one thing at a time
        if in_progress_count > 1:
            raise ValueError("Only one task can be in_progress")
            
        self.items = validated
        return self.render()
```

### 2. The `todo` Tool
We add a new tool to the dispatch map. This tool doesn't touch the filesystem; it only updates the `TodoManager`.

```python
TOOL_HANDLERS = {
    # ... previous tools ...
    "todo": lambda **kw: TODO.update(kw["items"]),
}
```

### 3. The "Nag" Reminder (Accountability)
A plan is useless if the agent ignores it. To ensure the agent stays aligned, we implement a **Nag Mechanism**. If the agent goes 3 or more rounds without updating its plan, we inject a subtle nudge into the context.

```python
if rounds_since_todo >= 3 and messages:
    last_user_msg = messages[-1]
    # Inject a reminder at the start of the user's next turn
    last_user_msg["content"].insert(0, {
        "type": "text",
        "text": "<reminder>Update your todos.</reminder>",
    })
```

## What Changed: From Reactive to Proactive

| Component | Before (s02) | After (s03) |
| :--- | :--- | :--- |
| **Cognition** | Reactive (Step-by-Step) | Proactive (Plan-Ahead) |
| **State** | Stateless (History Only) | Stateful (Todo List) |
| **Safety** | Path Sandboxing | Focus Constraint (One task at a time) |
| **Interaction** | Response to User | Self-Correction (via Nag Reminder) |

## The Result: Sequential Focus
The "one `in_progress` at a time" constraint is a powerful cognitive nudge. It forces the LLM to commit to a specific sub-task and finish it before moving on. This simple mechanism dramatically increases the success rate for complex, multi-file refactorings.

---
**Next Up:** [Session 04: Subagents & Task Isolation](./s04-subagent.md)
