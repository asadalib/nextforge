import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Editing' | 'Clipboard' | 'Navigation';
}

const SHORTCUTS: ShortcutItem[] = [
  {
    category: 'Editing',
    keys: ['Ctrl', 'S'],
    description: 'Save current progress & export project file (.json)'
  },
  {
    category: 'Editing',
    keys: ['Ctrl', 'Z'],
    description: 'Undo last change'
  },
  {
    category: 'Editing',
    keys: ['Ctrl', 'Y'],
    description: 'Redo last undone change (or Ctrl+Shift+Z)'
  },
  {
    category: 'Editing',
    keys: ['Ctrl', 'D'],
    description: 'Duplicate selected element, row, or section'
  },
  {
    category: 'Editing',
    keys: ['Del'],
    description: 'Delete selected element or section (or Backspace)'
  },
  {
    category: 'Clipboard',
    keys: ['Ctrl', 'C'],
    description: 'Copy selected element to clipboard'
  },
  {
    category: 'Clipboard',
    keys: ['Ctrl', 'V'],
    description: 'Paste element into selected column or section'
  },
  {
    category: 'Clipboard',
    keys: ['Ctrl', 'Shift', 'C'],
    description: 'Copy entire selected section to clipboard'
  },
  {
    category: 'Clipboard',
    keys: ['Ctrl', 'Shift', 'V'],
    description: 'Paste copied section into the current page tab'
  },
  {
    category: 'Navigation',
    keys: ['Esc'],
    description: 'Deselect active item or close preview / modals'
  },
  {
    category: 'Navigation',
    keys: ['?'],
    description: 'Open this keyboard shortcuts cheatsheet'
  }
];

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const categories = ['Editing', 'Clipboard', 'Navigation'] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Keyboard Shortcuts</h3>
              <p className="text-[11px] text-slate-400">Boost your design workflow with keyboard commands</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto nextforge-scrollbar">
          {categories.map((cat) => (
            <div key={cat} className="space-y-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                {cat}
              </h4>
              <div className="space-y-1.5">
                {SHORTCUTS.filter((s) => s.category === cat).map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 transition-colors border border-slate-100"
                  >
                    <span className="text-xs font-medium text-slate-700">{s.description}</span>
                    <div className="flex items-center space-x-1">
                      {s.keys.map((k, ki) => (
                        <React.Fragment key={ki}>
                          <kbd className="px-2 py-1 text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-300 rounded-md shadow-2xs">
                            {k}
                          </kbd>
                          {ki < s.keys.length - 1 && (
                            <span className="text-[10px] text-slate-400 font-bold">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tip: Mac users can use <kbd className="font-mono font-bold text-slate-600 bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px]">⌘ Command</kbd> instead of Ctrl</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
