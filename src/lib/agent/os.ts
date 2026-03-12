import { FileNode, VirtualFileSystem } from './types';

export class VirtualOS {
  private fs: VirtualFileSystem;
  private cwd: string = "/home";
  private history: string[] = [];

  constructor(initialFs?: VirtualFileSystem) {
    this.fs = initialFs || {
      "home": {
        "readme.md": "# Blog Agent Workspace\nWelcome! This is your virtual environment.",
        "sandbox": {}
      },
      "blog": {} // This will be populated from the real index.json
    };
  }

  public getCwd(): string {
    return this.cwd;
  }

  public getHistory(): string[] {
    return this.history;
  }

  /**
   * The primary entry point for the Agent's "Bash" tool.
   */
  public async execute(command: string): Promise<string> {
    this.history.push(`${this.cwd}$ ${command}`);
    const [cmd, ...args] = command.trim().split(/\s+/);

    try {
      switch (cmd) {
        case "ls":
          return this.handleLs(args[0]);
        case "cd":
          return this.handleCd(args[0] || "/home");
        case "cat":
          return this.handleCat(args[0]);
        case "pwd":
          return this.cwd;
        case "mkdir":
          return this.handleMkdir(args[0]);
        case "echo":
          // Simplified echo for file writing: echo "content" > file.txt
          return this.handleEcho(args);
        default:
          return `bash: command not found: ${cmd}`;
      }
    } catch (e: any) {
      // Return error string instead of throwing, so the LLM can recover
      return `Error: ${e.message}`;
    }
  }

  private resolvePath(target: string): string {
    const absolute = target.startsWith("/") 
      ? target 
      : `${this.cwd}/${target}`.replace(/\/+/g, "/");
    
    const parts = absolute.split("/").filter(p => p !== "" && p !== ".");
    const stack: string[] = [];
    for (const part of parts) {
      if (part === "..") {
        stack.pop();
      } else {
        stack.push(part);
      }
    }
    return "/" + stack.join("/");
  }

  private getNode(path: string): FileNode {
    const parts = path.split("/").filter(p => p !== "");
    let current: FileNode = this.fs;
    for (const part of parts) {
      if (typeof current === "object" && current[part] !== undefined) {
        current = current[part];
      } else {
        throw new Error(`No such file or directory: ${path}`);
      }
    }
    return current;
  }

  private handleLs(path?: string): string {
    const targetPath = this.resolvePath(path || ".");
    const node = this.getNode(targetPath);
    if (typeof node === "string") return targetPath.split("/").pop() || "";
    return Object.keys(node).join("\n") || "(empty directory)";
  }

  private handleCd(path: string): string {
    const targetPath = this.resolvePath(path);
    const node = this.getNode(targetPath);
    if (typeof node === "string") throw new Error("Not a directory");
    this.cwd = targetPath;
    return `Changed directory to ${this.cwd}`;
  }

  private handleCat(path: string): string {
    if (!path) throw new Error("usage: cat <file>");
    const targetPath = this.resolvePath(path);
    const node = this.getNode(targetPath);
    if (typeof node !== "string") throw new Error("Is a directory");
    return node;
  }

  private handleMkdir(path: string): string {
    if (!path) throw new Error("usage: mkdir <directory>");
    const targetPath = this.resolvePath(path);
    const parts = targetPath.split("/").filter(p => p !== "");
    const dirName = parts.pop()!;
    
    // Traverse to parent
    let current: any = this.fs;
    for (const part of parts) {
      if (typeof current[part] !== "object") throw new Error("Parent path does not exist");
      current = current[part];
    }
    
    if (current[dirName]) throw new Error("File or directory already exists");
    current[dirName] = {};
    return `Created directory ${targetPath}`;
  }

  private handleEcho(args: string[]): string {
    // Very basic implementation of echo "content" > file.txt
    const joinArgs = args.join(" ");
    const redirectIndex = joinArgs.indexOf(">");
    if (redirectIndex === -1) return args.join(" ");

    const content = joinArgs.slice(0, redirectIndex).trim().replace(/^"(.*)"$/, '$1');
    const filename = joinArgs.slice(redirectIndex + 1).trim();
    
    const targetPath = this.resolvePath(filename);
    const parts = targetPath.split("/").filter(p => p !== "");
    const file = parts.pop()!;
    
    let current: any = this.fs;
    for (const part of parts) {
      if (typeof current[part] !== "object") throw new Error("Path does not exist");
      current = current[part];
    }
    
    current[file] = content;
    return `Wrote to ${targetPath}`;
  }
}
