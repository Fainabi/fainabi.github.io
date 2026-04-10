:::meta
title : Session 04: Subagents & Task Isolation
quickview : "Break big tasks down; each subtask gets a clean context" -- subagents use independent messages[], keeping the main conversation clean.
:::

# Session 04: Subagents & Task Isolation

In previous sessions, we built a reactive agent loop and added basic planning. However, as the agent performs more tasks (reading files, running tests, debugging), the `messages[]` array grows indefinitely. This leads to two problems:
1. **Context Exhaustion:** We hit the token limit.
2. **Noise:** The LLM gets distracted by irrelevant details from previous subtasks.

Session 04 introduces **Subagents** as the primary mechanism for **Context Isolation**.

## The Problem: Context Bloat

Imagine asking an agent to "Fix the bug in the auth module."
- The agent reads 10 files.
- It runs tests 5 times.
- It edits 3 files.

Every single one of those `tool_use` and `tool_result` blocks stays in the parent's context. When the parent finally says "I've fixed it," it is carrying the weight of all those intermediate steps.

## The Solution: Process Isolation for Context Isolation

Instead of the parent doing everything, it "delegates" to a subagent.

```text
Parent agent                     Subagent
+------------------+             +------------------+
| messages=[...]   |             | messages=[]      | <-- Fresh Start
|                  |  dispatch   |                  |
| tool: task       | ----------> | while tool_use:  |
|   prompt="..."   |             |   call tools     |
|                  |  summary    |   append results |
|   result = "..." | <---------- | return last text |
+------------------+             +------------------+
```

### 1. Fresh Context
The subagent starts with an empty `messages` list. It only knows what the parent told it in the `prompt`. It doesn't see the parent's previous 50 messages.

### 2. Specialized System Prompts
The parent and subagent can have different system instructions:
- **Parent:** "Use the task tool to delegate exploration."
- **Subagent:** "Complete the task, then summarize your findings."

### 3. Summary-Only Return
When the subagent finishes, it returns its final textual response to the parent. All its intermediate tool calls and outputs are **discarded**. The parent's context remains clean, receiving only the "essence" of the work.

## Implementation Details

### The `task` Tool
The parent gets a special tool that triggers the subagent loop:

:::subblock python : The Delegation Tool
PARENT_TOOLS = CHILD_TOOLS + [
    {
        "name": "task",
        "description": "Spawn a subagent with fresh context.",
        "input_schema": {
            "type": "object",
            "properties": {
                "prompt": {"type": "string"},
                "description": {"type": "string"}
            },
            "required": ["prompt"]
        }
    }
]
[!! Define Subtask: Add the 'task' tool to the parent's inventory to enable delegation | PARENT_TOOLS, CHILD_TOOLS ]
:::

### The Subagent Loop
The `run_subagent` function is essentially a mini-version of our main `agent_loop`, but it's self-contained:

:::subblock python : The Subagent Loop
def run_subagent(prompt: str) -> str:
    sub_messages = [{"role": "user", "content": prompt}]
[!! 1. Fresh Start: Initialize subagent with only the specific task prompt | sub_messages ]

    for _ in range(30):
        response = client.messages.create(
            model=MODEL, system=SUBAGENT_SYSTEM,
            messages=sub_messages, tools=CHILD_TOOLS
        )
[!! 2. Isolated Execution: Run the agent loop within its own context using a restricted toolset | sub_messages, CHILD_TOOLS ]

        if response.stop_reason != "tool_use":
            break
[!! 3. Termination: Stop when the subagent finishes the work or hits a limit | stop_reason ]

    return "".join(b.text for b in response.content if hasattr(b, "text"))
[!! 4. Content Extraction: Return only the summary text, discarding the subagent's history | response.content ]
:::

## Key Insight: Recursive Scaling
While this session avoids recursion for simplicity (`CHILD_TOOLS` doesn't include `task`), the architecture allows for it. An agent can spawn a subagent, which can spawn its own subagent, creating a tree-like hierarchy of task execution where each node maintains a manageable context window.

## Motto
> *"An agent that remembers everything eventually knows nothing."*

---
*Next: [Session 05: Skill Loading](./s05-skill-loading.md)*
