'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Terminal } from './terminal';
import { Terminal as TerminalIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingTerminalProps {
  attributes?: string[];
}

export const FloatingTerminal: React.FC<FloatingTerminalProps> = ({ attributes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ x: 20, y: 80 });
  const [size, setSize] = useState({ width: 400, height: 400 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState<'both' | 'width' | 'height' | null>(null);
  
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragHasMoved = useRef(false);

  const hasTerminalAttribute = attributes?.includes('terminal');

  // ── Dragging Logic ───────────────────────────────────────────────
  const startDragging = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragHasMoved.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
  }, [pos]);

  const onDrag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    // Check if the mouse actually moved beyond a small threshold (3px)
    const dist = Math.sqrt(
      Math.pow(e.clientX - dragStartPos.current.x, 2) + 
      Math.pow(e.clientY - dragStartPos.current.y, 2)
    );

    if (dist > 3) {
      dragHasMoved.current = true;
      setPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  }, [isDragging, dragOffset]);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ── Resizing Logic ───────────────────────────────────────────────
  const startResizing = useCallback((mode: 'both' | 'width' | 'height') => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(mode);
  }, []);

  const onResize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const newSize = { ...size };
    if (isResizing === 'width' || isResizing === 'both') {
      newSize.width = Math.max(300, e.clientX - pos.x);
    }
    if (isResizing === 'height' || isResizing === 'both') {
      newSize.height = Math.max(200, e.clientY - pos.y);
    }
    setSize(newSize);
  }, [isResizing, size, pos]);

  const stopResizing = useCallback(() => {
    setIsResizing(null);
  }, []);

  // ── Global Listeners ─────────────────────────────────────────────
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', stopDragging);
    }
    if (isResizing) {
      window.addEventListener('mousemove', onResize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('mousemove', onResize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isDragging, isResizing, onDrag, onResize, stopDragging, stopResizing]);

  if (!hasTerminalAttribute) return null;

  return (
    <>
      {/* Toggle Button (Visible when closed) */}
      {!isOpen && (
        <button
          onMouseDown={startDragging}
          onClick={(e) => {
            // Prevent opening if we were dragging
            if (dragHasMoved.current) return;
            setIsOpen(true);
          }}
          style={{ left: pos.x, top: pos.y }}
          className="fixed z-[60] bg-[var(--card)] border border-[var(--border)] p-2.5 rounded-lg shadow-xl hover:bg-[var(--accent)] transition-colors group cursor-pointer active:cursor-grabbing"
          title="Open Blog Agent Terminal"
        >
          <TerminalIcon className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Floating Terminal Window */}
      <div 
        style={{ 
          left: pos.x, 
          top: pos.y,
          width: isOpen ? `${size.width}px` : '0px',
          height: isOpen ? `${size.height}px` : '0px',
        }}
        className={cn(
          "fixed z-50 flex flex-col border border-[var(--border)] shadow-2xl overflow-hidden rounded-xl bg-[var(--card)] transition-[width,height,opacity] duration-300 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Header acts as drag handle */}
          <div 
            onMouseDown={startDragging}
            className="cursor-grab active:cursor-grabbing"
          >
            <Terminal onClose={() => setIsOpen(false)} />
          </div>
          
          {/* Resize Handles */}
          <div 
            onMouseDown={startResizing('width')}
            className="absolute right-0 top-0 w-1.5 h-full cursor-ew-resize hover:bg-primary/20 transition-colors z-[70]"
          />
          <div 
            onMouseDown={startResizing('height')}
            className="absolute bottom-0 left-0 h-1.5 w-full cursor-ns-resize hover:bg-primary/20 transition-colors z-[70]"
          />
          <div 
            onMouseDown={startResizing('both')}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-[80] flex items-end justify-end p-0.5"
          >
            <div className="w-2 h-2 border-r-2 border-b-2 border-[var(--muted-foreground)] opacity-30" />
          </div>
        </div>
      </div>

      {/* Global overlay during drag/resize to prevent selection/iframe issues */}
      {((isDragging && dragHasMoved.current) || isResizing) && (
        <div className="fixed inset-0 z-[100] cursor-grabbing select-none" />
      )}
    </>
  );
};
