'use client';

import { Terminal } from '@/components/terminal';

export default function AgentPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Blog Agent Playground</h1>
        <p className="text-gray-400">
          An interactive deconstruction of the <code>learn-claude-code</code> patterns. 
          This terminal is running a <strong>Stateful Virtual OS</strong> in your browser's memory.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl mb-12">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
          Interactive Virtual OS
        </h2>
        <Terminal />
      </div>

      <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-blue-400">Reactive Core (s01)</h3>
          <p className="text-gray-300">
            The terminal above uses the <code>VirtualOS</code> class to simulate a real file system. 
            When you type <code>cd ..</code> or <code>mkdir test</code>, the state is persisted 
            inside the class instance just like a real OS.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Stateful <code>CWD</code> tracking</li>
            <li>Nested directory traversal</li>
            <li>Atomic tool execution via <code>execute()</code></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-purple-400">What's Next?</h3>
          <p className="text-gray-300">
            Soon, we will connect this terminal to an <strong>LLM Brain</strong>. 
            The agent will use the same <code>execute()</code> function as its "Hands" 
            to solve tasks autonomously.
          </p>
          <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 font-mono text-xs">
            $ next_step --level 2
          </div>
        </div>
      </div>
    </div>
  );
}
