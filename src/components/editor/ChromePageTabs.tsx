import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Plus, ChevronDown, Copy, Trash2,
  Edit2, Check, X, ClipboardCheck, Search
} from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';

export default function ChromePageTabs() {
  const {
    pages,
    currentPageId,
    setCurrentPageId,
    addPage,
    renamePage,
    duplicatePage,
    deletePage,
    clipboardSection,
    pasteSection
  } = useBuilderStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingSlug, setEditingSlug] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [filterQuery, setFilterQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const newPageInputRef = useRef<HTMLInputElement>(null);

  const activePage = pages.find((p) => p.id === currentPageId) || pages[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setEditingPageId(null);
        setIsCreatingNew(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartRename = (pageId: string, currentName: string, currentSlug: string) => {
    setEditingPageId(pageId);
    setEditingName(currentName);
    setEditingSlug(currentSlug);
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 50);
  };

  const handleSaveRename = (pageId: string) => {
    if (editingName.trim()) {
      renamePage(pageId, editingName.trim(), editingSlug.trim() || undefined);
    }
    setEditingPageId(null);
  };

  const handleCreateNewPage = () => {
    const name = newPageName.trim() || `Page ${pages.length + 1}`;
    const slug = '/' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    addPage(name, slug);
    setNewPageName('');
    setIsCreatingNew(false);
    setIsDropdownOpen(false);
  };

  const filteredPages = pages.filter((p) =>
    p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="relative shrink-0 select-none" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        onClick={() => {
          setIsDropdownOpen(!isDropdownOpen);
          setIsCreatingNew(false);
          setEditingPageId(null);
          setFilterQuery('');
        }}
        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
          isDropdownOpen
            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
            : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200/80 text-slate-700'
        }`}
        title="Switch, manage or add pages"
      >
        <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span className="font-bold text-slate-800 max-w-[100px] truncate">
          {activePage ? activePage.name : 'Pages'}
        </span>
        <span className="text-[10px] font-mono text-slate-400 max-w-[70px] truncate hidden sm:inline">
          {activePage?.slug}
        </span>
        <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold">
          {pages.length}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-slate-700 animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pages ({pages.length})
            </span>
            <button
              onClick={() => {
                setIsCreatingNew(true);
                setTimeout(() => newPageInputRef.current?.focus(), 50);
              }}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>New Page</span>
            </button>
          </div>

          {/* Quick inline new page creator */}
          {isCreatingNew && (
            <div className="p-2.5 bg-indigo-50/60 border-b border-indigo-100 flex items-center space-x-1.5">
              <input
                ref={newPageInputRef}
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateNewPage();
                  if (e.key === 'Escape') setIsCreatingNew(false);
                }}
                placeholder="Page name (e.g. About, Pricing)..."
                className="flex-1 px-2 py-1 text-xs bg-white border border-indigo-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
              <button
                onClick={handleCreateNewPage}
                className="p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer"
                title="Create"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 cursor-pointer"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Search filter if more than 3 pages */}
          {pages.length > 3 && (
            <div className="px-2.5 py-1.5 border-b border-slate-100">
              <div className="flex items-center px-2 py-1 bg-slate-50 rounded-lg border border-slate-200/60 text-xs">
                <Search className="w-3 h-3 text-slate-400 mr-1.5 shrink-0" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter pages..."
                  className="bg-transparent text-slate-700 placeholder-slate-400 focus:outline-none w-full text-[11px]"
                />
              </div>
            </div>
          )}

          {/* Pages list */}
          <div className="max-h-64 overflow-y-auto py-1 nextforge-scrollbar">
            {filteredPages.map((p) => {
              const isActive = p.id === currentPageId;
              const isEditing = editingPageId === p.id;

              if (isEditing) {
                return (
                  <div
                    key={p.id}
                    className="p-2 bg-slate-50 border-b border-slate-100 flex items-center space-x-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(p.id);
                        if (e.key === 'Escape') setEditingPageId(null);
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-white border border-indigo-400 rounded-lg text-slate-800 font-semibold focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveRename(p.id)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingPageId(null)}
                      className="p-1 text-slate-400 hover:bg-slate-200 rounded-lg"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setCurrentPageId(p.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`px-3 py-1.5 flex items-center justify-between text-xs cursor-pointer group transition-colors ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isActive ? 'bg-indigo-600 ring-2 ring-indigo-200' : 'bg-slate-300'
                      }`}
                    />
                    <div className="truncate">
                      <span className="block truncate font-medium">{p.name}</span>
                      <span className="block text-[10px] text-slate-400 font-mono truncate">{p.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRename(p.id, p.name, p.slug);
                      }}
                      className="p-1 hover:bg-slate-200/70 rounded text-slate-500 hover:text-slate-800"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicatePage(p.id);
                      }}
                      className="p-1 hover:bg-slate-200/70 rounded text-slate-500 hover:text-slate-800"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {pages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete page "${p.name}"?`)) {
                            deletePage(p.id);
                          }
                        }}
                        className="p-1 hover:bg-rose-100 rounded text-rose-500 hover:text-rose-700"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paste Section Button if available */}
          {clipboardSection && (
            <div className="p-2 border-t border-slate-100 bg-slate-50/70">
              <button
                onClick={() => {
                  pasteSection(currentPageId);
                  setIsDropdownOpen(false);
                }}
                className="w-full py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">Paste "{clipboardSection.name}"</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
