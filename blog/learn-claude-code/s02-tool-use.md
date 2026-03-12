:::meta
title : Session 02: Tool Use Dispatch & Safety
quickview : 
:::

# Session 02: Tool Use Dispatch & Safety

> **Motto:** *"Adding a tool means adding one handler"*

In Session 01, we built the "Reactive Core"—the infinite loop. Session 02 teaches us that the loop is a **constant**. When we want to give the agent more capabilities, we don't change the loop; we expand the **Dispatch Map**.

## The Problem: Bash is Too "Raw"
While "Bash is all you need," it has significant downsides:
- **Unreliable Parsing:** `cat` might truncate large files or fail on binary data.
- **Security Risks:** A raw `bash` tool can run `rm -rf /` or escape the project directory.
- **Cognitive Load:** The LLM has to remember complex shell syntax for simple file operations.

## The Solution: The Dispatch Map
Instead of hardcoding a call to `run_bash`, we create a mapping of tool names to specialized handler functions.

### 1. Path Sandboxing (Safety First)
Before adding tools, we need a "Fence." The `safe_path` utility ensures the agent can never touch files outside the project root.

```python
def safe_path(p: str) -> Path:
    path = (WORKDIR / p).resolve()
    # Ensure the resolved path is still inside our WORKDIR
    if not path.is_relative_to(WORKDIR):
        raise ValueError(f"Path escapes workspace: {p}")
    return path
```

### 2. Specialized Tool Handlers
We define clean, Pythonic functions for common tasks. This makes the agent more robust and easier to monitor.

```python
def run_read(path: str, limit: int = None) -> str:
    text = safe_path(path).read_text()
    # Logic to handle large files, line limits, etc.
    return text

def run_write(path: str, content: str) -> str:
    fp = safe_path(path)
    fp.parent.mkdir(parents=True, exist_ok=True)
    fp.write_text(content)
    return f"Wrote to {path}"
```

### 3. The Dispatch Map
This is the "switchboard" of the agent.

```python
TOOL_HANDLERS = {
    "bash":       lambda **kw: run_bash(kw["command"]),
    "read_file":  lambda **kw: run_read(kw["path"], kw.get("limit")),
    "write_file": lambda **kw: run_write(kw["path"], kw["content"]),
    "edit_file":  lambda **kw: run_edit(kw["path"], kw["old_text"], kw["new_text"]),
}
```

## How the Loop Evolves (or Doesn't)
The magic of this architecture is that the `agent_loop` remains virtually identical to Session 01. The only change is how we find the function to run:

```python
# Inside the loop...
for block in response.content:
    if block.type == "tool_use":
        # Dynamic lookup instead of hardcoded bash
        handler = TOOL_HANDLERS.get(block.name)
        if handler:
            output = handler(**block.input)
        else:
            output = f"Unknown tool: {block.name}"
```

## Key Architectural Insights
1. **The Loop is a Infrastructure Layer:** Once the loop is written, you rarely touch it. It becomes a stable delivery mechanism for tools.
2. **Encapsulation:** By moving logic into handlers like `run_read` and `run_edit`, you can add logging, permission checks, and error handling without cluttering the agent's "brain" logic.
3. **Exact Matching (`edit_file`):** Note the `edit_file` tool uses `old_text` and `new_text` for exact replacement. This is much safer and more reliable for LLMs than generating complex `sed` commands or rewriting entire files.

## My Take: The "Switchboard" Pattern
This session transforms the agent from a "Bash Bot" into a "Structured Assistant." By defining a set of safe, high-level tools, we reduce the chance of hallucinations and destructive actions while making the agent's behavior predictable.

---
**Next Step:** [Session 03: TodoWrite - The Power of Planning](./s03-todo-write.md)
