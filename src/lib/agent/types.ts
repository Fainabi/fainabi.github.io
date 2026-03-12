export type FileNode = string | { [key: string]: FileNode };

export interface VirtualFileSystem {
  [key: string]: FileNode;
}

export interface ToolResult {
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string | any[];
}

export interface OSState {
  cwd: string;
  history: string[];
}
