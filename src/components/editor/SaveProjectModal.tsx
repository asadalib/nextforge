import React from 'react';
import { X, CheckCircle2, Download, Save, Zap, Clock } from 'lucide-react';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadFile: () => void;
  projectName: string;
  lastSavedAt: string | null;
  autoSave: boolean;
  onToggleAutoSave: (val: boolean) => void;
}

export default function SaveProjectModal({
  isOpen,
  onClose,
  onDownloadFile,
  projectName,
  lastSavedAt,
  autoSave,
  onToggleAutoSave
}: SaveProjectModalProps) {
  if (!isOpen) return null;

  const formattedTime = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Just now';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col scale-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Progress Saved</h3>
              <p className="text-[11px] text-slate-400">
                Loaded Project: <span className="font-semibold text-slate-600">{projectName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {/* Loaded Project Status Notice */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-3">
            <Save className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-xs text-emerald-900 space-y-1">
              <p className="font-semibold">
                Your progress is safely saved to the loaded project!
              </p>
              <p className="text-emerald-700 text-[11px] leading-relaxed">
                All changes, pages, and element styles are saved in your workspace session and will restore automatically.
              </p>
              <div className="flex items-center space-x-1.5 pt-1 text-[10px] text-emerald-600 font-mono">
                <Clock className="w-3 h-3" />
                <span>Last saved: {formattedTime}</span>
              </div>
            </div>
          </div>

          {/* Question / Prompt: Download backup file? */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Save file again to your computer?</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Do you want to download an updated <code className="text-indigo-600 font-bold">.project.json</code> backup file to your computer, or just keep working?
            </p>
          </div>

          {/* Auto-Save Toggle Option */}
          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Auto-Save Progress</p>
                <p className="text-[10px] text-slate-400">
                  {autoSave ? 'Automatically saves edits as you build' : 'Auto-save is currently turned off'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleAutoSave(!autoSave)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                autoSave ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  autoSave ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
          >
            Keep Working (Saved)
          </button>
          <button
            type="button"
            onClick={() => {
              onDownloadFile();
              onClose();
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .project.json</span>
          </button>
        </div>
      </div>
    </div>
  );
}

