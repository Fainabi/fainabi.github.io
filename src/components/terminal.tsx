'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VirtualOS } from '@/lib/agent/os';
import { VirtualFileSystem } from '@/lib/agent/types';
import { X } from 'lucide-react';

interface TerminalProps {
  initialFs?: VirtualFileSystem;
  initialCommand?: string;
  onClose?: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ initialFs, initialCommand, onClose }) => {
  const [os] = useState(() => new VirtualOS(initialFs));
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<{ type: 'cmd' | 'out', content: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialCommand) {
      const runInitial = async () => {
        setLogs([{ type: 'cmd', content: `${os.getCwd()}$ ${initialCommand}` }]);
        const output = await os.execute(initialCommand);
        if (output) {
          setLogs(prev => [...prev, { type: 'out', content: output }]);
        }
      };
      runInitial();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentCwd = os.getCwd();
    const command = input.trim();
    
    // Add command to logs
    setLogs(prev => [...prev, { type: 'cmd', content: `${currentCwd}$ ${command}` }]);
    
    // Execute command
    const output = await os.execute(command);
    
    // Add output to logs
    if (output) {
      setLogs(prev => [...prev, { type: 'out', content: output }]);
    }
    
    setInput('');
  };

  return (
    <div className="flex flex-col w-full h-full bg-[var(--card)] text-[var(--foreground)] font-mono text-sm rounded-lg overflow-hidden border border-[var(--border)] shadow-2xl">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--muted)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[var(--muted-foreground)] text-[10px] font-bold tracking-wider uppercase truncate">Blog Agent OS</span>
          <span className="text-[var(--muted-foreground)] text-[9px] opacity-40 whitespace-nowrap">s01_loop</span>
        </div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="ml-2 p-1 hover:bg-[var(--accent)] rounded transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)] shrink-0"
            aria-label="Close terminal"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto whitespace-pre-wrap break-all custom-scrollbar bg-[var(--background)]"
      >
        <div className="mb-2 text-[var(--muted-foreground)] opacity-70">
          * Mini Blog Agent v0.1.0 initialized.
          * Type 'ls' or 'help' to begin.
        </div>
        {logs.map((log, i) => (
          <div key={i} className={log.type === 'cmd' ? 'text-[var(--primary)] font-bold' : 'text-[var(--foreground)] mb-1 opacity-90'}>
            {log.content}
          </div>
        ))}
        
        {/* Input Line */}
        <form onSubmit={handleCommand} className="flex mt-1">
          <span className="text-[var(--primary)] mr-2 font-bold">{os.getCwd()}$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[var(--foreground)]"
            autoFocus
          />
        </form>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--muted);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--muted-foreground);
        }
      `}</style>
    </div>
  );
};
