:::meta
title : Session 06: Context Compaction
quickview : "Context will fill up; you need a way to make room" -- three-layer compression strategy for infinite sessions.
:::

# Session 06: Context Compaction

The context window of an LLM is a finite resource. Even with a large window (like 200k tokens), a coding agent can quickly exhaust it by reading large files, running verbose tests, and engaging in long debugging cycles.

Session 06 introduces a **Three-Layer Compaction Strategy** to enable effectively "infinite" sessions.

## The Problem: Token Exhaustion

Every tool result—especially a 50KB file read or a massive build log—stays in the active context. As the conversation grows:
1. **Cost increases:** Every subsequent message costs more.
2. **Performance decreases:** The model may struggle to attend to the most relevant information.
3. **Hard limits:** Eventually, the session simply cannot continue.

## The Solution: Strategic Forgetting

Instead of letting the context overflow, we manage it using three layers of increasing aggressiveness.

### Layer 1: Micro-Compaction (Silent & Every Turn)
Before every call to the LLM, we look at old `tool_result` blocks. If a result is older than a certain threshold (e.g., more than 3 turns old) and its content is large, we replace it with a placeholder.

- **Before:** `{"type": "tool_result", "content": "1000 lines of code..."}`
- **After:** `{"type": "tool_result", "content": "[Previous: used read_file]"}`

This keeps the *fact* that a tool was used in context, but removes the *noise* of the large output.

### Layer 2: Auto-Compaction (Threshold Triggered)
When the estimated token count exceeds a safety threshold (e.g., 50,000 tokens), we trigger a full session compression:
1. **Archive:** Save the full, uncompressed message history to a local `.transcripts/` directory.
2. **Summarize:** Ask the LLM to write a concise summary of the conversation so far (accomplishments, current state, decisions).
3. **Reset:** Replace the entire message history with just the summary.

The agent "forgets" the details but "remembers" the mission.

### Layer 3: Manual Compaction (Tool Triggered)
We provide a `compact` tool that allows the agent to trigger Layer 2 manually. This is useful when the agent knows it has just finished a major phase and wants to "clear its head" before starting the next one.

:::subblock json : The Compaction Tool
{
  "name": "compact",
  "description": "Trigger manual conversation compression.",
  "input_schema": {
    "type": "object",
    "properties": {
      "focus": {
        "type": "string", 
        "description": "What to preserve in the summary"
      }
    }
  }
}
[!! Define Compaction: Allow the agent to specify what's critical before a context wipe | name, description, focus ]
:::

## The Architecture of Infinite Memory

By saving transcripts to disk, we ensure that no information is truly lost. A future "recall" tool could even allow the agent to search through these transcripts if it needs to recover a discarded detail.

```text
Active Context (LLM) <---> Summary <---> Archived Transcripts (Disk)
```

## Key Insight: Strategic Forgetting
> *"The secret to working forever is knowing what to forget."*

---
*Next: [Session 07: Task System](./s07-task-system.md)*
