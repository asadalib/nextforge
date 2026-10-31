import React, { useRef, useState } from 'react';
import {
  Code2, Database, Download, Eye, Layers, Monitor, Redo2,
  Rocket, Smartphone, Tablet, Undo2, Upload, Sparkles, SmartphoneNfc,
  Keyboard, Save, Check, Sun, Moon, Maximize2, Square, Columns2, SlidersHorizontal
} from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';
import JSZip from 'jszip';

import ChromePageTabs from './ChromePageTabs';

interface TopToolbarProps {
  onToggleLayers: () => void;
  isLayersOpen: boolean;
  onOpenPreview: () => void;
  onOpenShortcuts?: () => void;
  onOpenSaveModal?: () => void;
  onOpenPublishModal?: (defaultTab?: 'cpanel' | 'vercel' | 'cloudflare' | 'netlify' | 'code') => void;
  onBackToDashboard?: () => void;
}

export default function TopToolbar({
  onToggleLayers,
  isLayersOpen,
  onOpenPreview,
  onOpenShortcuts,
  onOpenSaveModal,
  onOpenPublishModal,
  onBackToDashboard
}: TopToolbarProps) {
  const {
    projectName, setProjectName,
    breakpoint, setBreakpoint,
    undo, redo, past, future,
    sections, loadProjectFile,
    saveProject, autoSave, setAutoSave,
    autoSaveStatus,
    theme, toggleTheme,
    siteWidth, setSiteWidth,
    customSiteWidth
  } = useBuilderStore();

  const [localCustomWidth, setLocalCustomWidth] = useState(customSiteWidth || '1200px');
  React.useEffect(() => {
    if (customSiteWidth) setLocalCustomWidth(customSiteWidth);
  }, [customSiteWidth]);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveClick = async () => {
    setSaveStatus('saving');
    try {
      await saveProject(false);
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2500);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('idle');
    }
  };

  const handleExportZip = async () => {
    const zip = new JSZip();
    const state = useBuilderStore.getState();
    const updatedPages = state.pages.map((p) =>
      p.id === state.currentPageId ? { ...p, sections: state.sections } : p
    );
    const projectData = {
      version: '1.0.0',
      name: projectName,
      siteWidth: state.siteWidth || 'boxed',
      pages: updatedPages,
      currentPageId: state.currentPageId,
      globalSections: state.globalSections,
      sections: state.sections
    };
    zip.file('nextforge.project.json', JSON.stringify(projectData, null, 2));
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-nextforge.zip`;
    link.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        loadProjectFile(parsed);
      } catch (err) {
        alert('Invalid NextForge project JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none shadow-xs z-50 shrink-0">
      {/* Brand Identity, Project Title & Chrome-Style Page Tabs */}
      <div className="flex items-center space-x-2.5 min-w-0">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
            title="Back to My Sites dashboard"
          >
            ← My Sites
          </button>
        )}
        <div className="flex items-center space-x-2 font-bold text-sm shrink-0">
          <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-mono font-black text-xs shadow-xs">
            {`{}`}
          </div>
          <span className="text-slate-900 font-extrabold text-sm tracking-tight">NextForge</span>
          <span className="text-slate-400 font-normal text-xs pl-0.5 hidden xl:inline">Layout builder</span>
        </div>

        {/* Project Name Field */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={projectName || ''}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder="Project Name..."
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-slate-200/70 focus:border-indigo-500 rounded-lg text-xs font-bold text-slate-800 focus:outline-none transition-all w-32 sm:w-40 md:w-48 select-text cursor-text shadow-2xs"
            title="Click to rename project"
          />
        </div>

        <div className="h-4 w-px bg-slate-200 shrink-0"></div>

        {/* Concise Chrome-style Page Tabs & Dropdown Selector */}
        <ChromePageTabs />
      </div>

      {/* Center Controls: Undo/Redo + Breakpoint Switcher */}
      <div className="flex items-center space-x-2">
        <button
          onClick={undo}
          disabled={past.length === 0}
          title="Undo (Ctrl+Z)"
          className="p-1.5 text-slate-500 hover:text-indigo-600 disabled:opacity-30 rounded-lg transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={redo}
          disabled={future.length === 0}
          title="Redo (Ctrl+Y)"
          className="p-1.5 text-slate-500 hover:text-indigo-600 disabled:opacity-30 rounded-lg transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        {/* Devices */}
        <div className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setBreakpoint('desktop')}
            className={`p-1 rounded-lg transition-colors ${
              breakpoint === 'desktop' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Desktop"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setBreakpoint('tablet')}
            className={`p-1 rounded-lg transition-colors ${
              breakpoint === 'tablet' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Tablet"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setBreakpoint('mobile')}
            className={`p-1 rounded-lg transition-colors ${
              breakpoint === 'mobile' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Mobile"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        {/* Global Site Width: Full / Boxed / 80% / Custom (applies to every section) */}
        <div
          className="flex items-center space-x-0.5 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/60"
          role="group"
          aria-label="Site width"
        >
          <button
            onClick={() => setSiteWidth('full')}
            className={`p-1 rounded-md transition-colors ${
              siteWidth === 'full' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Site width: Full (sections span 100% viewport)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSiteWidth('boxed')}
            className={`p-1 rounded-md transition-colors ${
              siteWidth === 'boxed' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Site width: Boxed (1180px standard)"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSiteWidth('80')}
            className={`px-1.5 py-0.5 rounded-md transition-colors flex items-center space-x-0.5 ${
              siteWidth === '80' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Site width: 80% (sections at 80% width, centered)"
          >
            <span className="text-[10px] font-bold leading-none">80%</span>
          </button>
          <button
            onClick={() => setSiteWidth('custom', localCustomWidth)}
            className={`px-1.5 py-0.5 rounded-md transition-colors flex items-center space-x-1 ${
              siteWidth === 'custom' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Site width: Custom width"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span className="text-[10px] font-bold leading-none">Custom</span>
          </button>
          {siteWidth === 'custom' && (
            <input
              type="text"
              value={localCustomWidth}
              onChange={(e) => setLocalCustomWidth(e.target.value)}
              onBlur={() => setSiteWidth('custom', localCustomWidth)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSiteWidth('custom', localCustomWidth);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder="1200px"
              className="w-16 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white border border-indigo-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
              title="Custom width (e.g. 1200px, 1400px, 90%)"
            />
          )}
        </div>
      </div>

      {/* Right Controls: Layers, Import, Database, Preview, Export, Publish */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={onToggleLayers}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
            isLayersOpen
              ? 'bg-slate-100 text-indigo-600 border border-indigo-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Layers</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span>Import</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.zip"
            onChange={handleImportFile}
            className="hidden"
          />
        </button>

        <button
          onClick={() => alert('Database connected (SQLite / Cloudflare D1 ready)')}
          className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
        >
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span>Database</span>
        </button>

        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-3.5 h-3.5 text-slate-500" />
            <span>Shortcuts</span>
          </button>
        )}

        <button
          onClick={onOpenPreview}
          className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>Preview</span>
        </button>

        {/* Light / Dark Theme Switcher Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all border cursor-pointer select-none shadow-2xs active:scale-95 ${
            theme === 'dark'
              ? 'bg-slate-800 hover:bg-slate-700/80 text-amber-300 border-slate-700'
              : 'bg-slate-50 hover:bg-slate-100 text-indigo-700 border-slate-200'
          }`}
          title={theme === 'dark' ? 'Dark Theme active (click for Light Theme)' : 'Light Theme active (click for Dark Theme)'}
        >
          {theme === 'dark' ? (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
              <span className="hidden xl:inline text-[11px] font-medium text-slate-200">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span className="hidden xl:inline text-[11px] font-medium text-slate-700">Light</span>
            </>
          )}
        </button>

        {/* Auto-Save Toggle Pill */}
        <button
          type="button"
          onClick={() => setAutoSave(!autoSave)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all border cursor-pointer ${
            autoSave
              ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200/70 text-slate-400 border-transparent'
          }`}
          title={autoSave ? 'Auto-save is ON (click to disable)' : 'Auto-save is OFF (click to enable)'}
        >
          {autoSave ? (
            <>
              <span className={`w-2 h-2 rounded-full ${autoSaveStatus === 'saving' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="hidden lg:inline text-[11px] font-medium text-slate-600">
                {autoSaveStatus === 'saving' ? 'Saving...' : autoSaveStatus === 'saved' ? 'Saved' : 'Auto-save'}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200/60">
                ON
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="hidden lg:inline text-[11px] font-medium text-slate-400">Auto-save</span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-200/70 px-1 py-0.2 rounded">
                OFF
              </span>
            </>
          )}
        </button>

        {/* Save Progress Button */}
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={saveStatus === 'saving'}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 ${
            saveStatus === 'saved'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs ring-1 ring-emerald-400/30'
              : saveStatus === 'saving'
              ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-xs animate-pulse'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300'
          }`}
          title="Save progress to local storage (Ctrl+S)"
        >
          {saveStatus === 'saved' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saved!</span>
            </>
          ) : saveStatus === 'saving' ? (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-indigo-600" />
              <span>Save</span>
            </>
          )}
        </button>

        <button
          onClick={() => onOpenPublishModal ? onOpenPublishModal('cpanel') : handleExportZip()}
          className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
          title="Export website packages & code"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export</span>
        </button>

        <button
          onClick={() => onOpenPublishModal ? onOpenPublishModal('cpanel') : alert('Publishing...')}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
          title="Publish to cPanel, Vercel, Cloudflare, or Netlify"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Publish</span>
        </button>
      </div>
    </header>
  );
}
