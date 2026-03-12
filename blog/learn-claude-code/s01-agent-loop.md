:::meta
title : Session 01: The Reactive Core - The Agent Loop
attributes : terminal
quickview : 
:::

# Session 01: The Reactive Core - The Agent Loop

> **Motto:** *"One loop & Bash is all you need"*

The first session of `learn-claude-code` strips away all the magic of AI agents to reveal a single, elegant pattern: the **Infinite Loop**.

## The Problem: The "Copy-Paste" Bottleneck
A raw LLM is like a brain in a vat. It can reason, but it has no hands. Without an automated loop:
1. You ask the LLM to run a command.
2. The LLM says: "Please run `ls -l`."
3. **You** run the command, copy the output, and paste it back.
4. The LLM says: "Okay, now run `cat README.md`."

In this scenario, **you** are the agent's loop.

## The Solution: The `while` Loop
An agent is simply an LLM wrapped in a `while` loop that knows how to handle a specific exit condition: `stop_reason == "tool_use"`.

### Interactive Demo
Try running some commands in this virtual OS. Your changes will persist in memory for this session.

:::terminal
{
  "initialCommand": "ls"
}
:::

### The Core Logic
```python
def agent_loop(messages):
    while True:
        # 1. Ask the brain
        response = client.messages.create(
            model=MODEL, 
            messages=messages, 
            tools=TOOLS
        )
        
        # 2. Record what the brain said
        messages.append({"role": "assistant", "content": response.content})

        # 3. Check the exit condition
        if response.stop_reason != "tool_use":
            break # The brain is done thinking/acting

        # 4. Be the "hands": Execute tools and feed results back
        results = []
        for block in response.content:
            if block.type == "tool_use":
                output = run_bash(block.input["command"])
                results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": output,
                })
        
        # 5. Feed the results back as a "user" message
        messages.append({"role": "user", "content": results})
```

## Key Architectural Insights
1. **The "User" Persona for Tool Results:** Notice that tool results are appended with the role `"user"`. To the LLM, the "environment" (bash output) is just another user providing information.
2. **Atomic Tool Execution:** The loop handles multiple tool calls in a single turn. If the LLM wants to run three commands at once, the loop executes all of them before calling the LLM again.
3. **The `stop_reason` Pivot:** This is the heart of the system. The loop only terminates when the LLM returns a `stop_reason` that isn't `tool_use` (usually `end_turn`).

## My Take: "Bash is All You Need"
By giving the agent access to a single tool—`bash`—you've effectively given it access to the entire operating system. It can now:
- Read/Write files (`cat`, `echo`, `sed`)
- Manage git (`git status`, `git commit`)
- Run compilers and tests (`npm run build`, `pytest`)

At this level, the agent is **reactive**. It doesn't plan; it simply responds to the current state of the terminal until it thinks the task is done.

---
**Next Step:** [Session 02: Tool Use Dispatch](./s02-tool-use.md)
