import React, { useEffect, useState } from 'react';
import { listSites, loadSite, saveSite, deleteSite, duplicateSite } from '../utils/storage';
import { generateCPanelZip, generateVercelNextJsZip } from '../utils/codeGenerator';
import { generateSiteFromPrompt, AI_PALETTES, AI_CATEGORIES } from '../utils/aiSiteGenerator';

interface DashboardProps {
  onOpenSite: (record: any) => void;
}

const slugify = (name: string) =>
  (name || 'site').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'site';

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
};

const OPTIONAL_PAGES: Array<{ id: string; label: string }> = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'contact', label: 'Contact' }
];

export default function Dashboard({ onOpenSite }: DashboardProps) {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingId, setExportingId] = useState<string | null>(null);

  // AI modal state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiName, setAiName] = useState('');
  const [aiCategory, setAiCategory] = useState(AI_CATEGORIES[0].id);
  const [aiDescription, setAiDescription] = useState('');
  const [aiPalette, setAiPalette] = useState(AI_PALETTES[0].id);
  const [aiSiteWidth, setAiSiteWidth] = useState<'full' | 'boxed' | '80'>('boxed');
  const [aiPages, setAiPages] = useState<string[]>(['about', 'services', 'pricing', 'contact']);

  const refresh = async () => {
    setLoading(true);
    try {
      const metas = await listSites();
      setSites(metas);
    } catch (err) {
      console.error('[NextForge Dashboard] listSites failed:', err);
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleOpen = async (id: string) => {
    const record = await loadSite(id);
    if (record) {
      onOpenSite(record);
    } else {
      alert('Could not load that site. It may have been deleted.');
      refresh();
    }
  };

  const handleNewBlank = async () => {
    const name = prompt('Name your new site:', 'Untitled website');
    if (name === null) return;
    const record = {
      id: `site-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      version: '1.0.0',
      name: name.trim() || 'Untitled website',
      siteWidth: 'boxed',
      pages: [{ id: 'page-home', name: 'Home', slug: '/', sections: [] }],
      currentPageId: 'page-home',
      globalSections: {},
      collections: [],
      submissions: [],
      savedAt: new Date().toISOString()
    };
    await saveSite(record);
    onOpenSite(record);
  };

  const handleExport = async (meta: any, kind: 'html' | 'nextjs') => {
    setExportingId(meta.id);
    try {
      const record = await loadSite(meta.id);
      if (!record || !Array.isArray(record.pages)) {
        alert('Export failed: this site could not be loaded.');
        return;
      }
      const blob =
        kind === 'html'
          ? await generateCPanelZip(record.pages, record.name)
          : await generateVercelNextJsZip(record.pages, record.name);
      triggerDownload(blob, `${slugify(record.name)}-${kind === 'html' ? 'html' : 'nextjs'}.zip`);
    } catch (err) {
      console.error('[NextForge Dashboard] export failed:', err);
      alert('Export failed. Please open the site and try exporting from the Publish dialog.');
    } finally {
      setExportingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    const clone = await duplicateSite(id);
    if (clone) refresh();
  };

  const handleRename = async (meta: any) => {
    const name = prompt('Rename site:', meta.name);
    if (name === null || !name.trim()) return;
    const record = await loadSite(meta.id);
    if (!record) return;
    record.name = name.trim();
    record.savedAt = new Date().toISOString();
    await saveSite(record);
    refresh();
  };

  const handleDelete = async (meta: any) => {
    if (!confirm(`Delete "${meta.name}"? This cannot be undone.`)) return;
    await deleteSite(meta.id);
    refresh();
  };

  const toggleAiPage = (pageId: string) => {
    setAiPages((prev) => (prev.includes(pageId) ? prev.filter((p) => p !== pageId) : [...prev, pageId]));
  };

  const handleGenerate = async () => {
    const businessName = aiName.trim();
    if (!businessName) {
      alert('Please enter a business name first.');
      return;
    }
    const record = generateSiteFromPrompt({
      businessName,
      category: aiCategory,
      description: aiDescription,
      paletteId: aiPalette,
      siteWidth: aiSiteWidth,
      pages: ['home', ...aiPages]
    });
    await saveSite(record);
    setIsAiOpen(false);
    onOpenSite(record);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-800 font-sans overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-mono font-black shadow">
              {`{}`}
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">NextForge</div>
              <div className="text-xs text-slate-500 mt-1">Visual site builder — fast, modern, no lock-in</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewBlank}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              + New Blank Site
            </button>
            <button
              onClick={() => setIsAiOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow transition-colors cursor-pointer"
            >
              ✨ Generate Site with AI
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-5">My Sites</h1>

        {/* Body states */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 text-sm">
            Loading your sites…
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-16 text-center">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-slate-700 font-bold mb-1">No sites yet</p>
            <p className="text-slate-500 text-sm mb-6">
              Generate a complete site with AI in seconds, or start from a blank canvas.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setIsAiOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow transition-colors cursor-pointer"
              >
                ✨ Generate Site with AI
              </button>
              <button
                onClick={handleNewBlank}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
              >
                + New Blank Site
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((meta) => (
              <div key={meta.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
                <div className="font-extrabold text-slate-900 text-base truncate" title={meta.name}>
                  {meta.name}
                </div>
                <div className="text-xs text-slate-500 mt-1 mb-4">
                  {meta.pageCount} {meta.pageCount === 1 ? 'page' : 'pages'} • {meta.sectionCount}{' '}
                  {meta.sectionCount === 1 ? 'section' : 'sections'} • Updated {formatDate(meta.savedAt)}
                </div>
                <button
                  onClick={() => handleOpen(meta.id)}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow transition-colors cursor-pointer mb-2"
                >
                  Open
                </button>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={() => handleExport(meta, 'html')}
                    disabled={exportingId === meta.id}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    {exportingId === meta.id ? 'Preparing…' : 'Export HTML'}
                  </button>
                  <button
                    onClick={() => handleExport(meta, 'nextjs')}
                    disabled={exportingId === meta.id}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    {exportingId === meta.id ? 'Preparing…' : 'Export Next.js'}
                  </button>
                </div>
                <div className="flex items-center space-x-3 text-xs font-semibold">
                  <button onClick={() => handleDuplicate(meta.id)} className="text-slate-500 hover:text-indigo-600 cursor-pointer">
                    Duplicate
                  </button>
                  <button onClick={() => handleRename(meta)} className="text-slate-500 hover:text-indigo-600 cursor-pointer">
                    Rename
                  </button>
                  <button onClick={() => handleDelete(meta)} className="text-slate-500 hover:text-rose-600 cursor-pointer">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Generator Modal */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-extrabold text-slate-900">✨ Generate a site with AI</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Generates a complete editable site — every section opens in the visual editor.
                </div>
              </div>
              <button
                onClick={() => setIsAiOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Business name</label>
                <input
                  type="text"
                  value={aiName}
                  onChange={(e) => setAiName(e.target.value)}
                  placeholder="e.g. Bella Italia"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:border-indigo-500"
                >
                  {AI_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Describe your business</label>
                <textarea
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="e.g. a family-run Italian restaurant serving wood-fired pizza and handmade pasta"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Colour palette</label>
                <div className="flex flex-wrap gap-2">
                  {AI_PALETTES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setAiPalette(p.id)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                        aiPalette === p.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white shadow"
                        style={{ background: `linear-gradient(135deg, ${p.primary} 50%, ${p.dark} 50%)` }}
                      />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Site width</label>
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
                  {(
                    [
                      { id: 'full', label: 'Full' },
                      { id: 'boxed', label: 'Boxed' },
                      { id: '80', label: '80%' }
                    ] as Array<{ id: 'full' | 'boxed' | '80'; label: string }>
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAiSiteWidth(opt.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        aiSiteWidth === opt.id
                          ? 'bg-white text-indigo-600 shadow border border-indigo-200'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                      title={
                        opt.id === 'full'
                          ? 'Sections span the full width'
                          : opt.id === 'boxed'
                            ? 'Sections capped at 1180px, centered'
                            : 'Sections at 80% width, centered'
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Pages to generate</label>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold">Home ✓</span>
                  {OPTIONAL_PAGES.map((p) => {
                    const active = aiPages.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleAiPage(p.id)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                          active
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-300 bg-white text-slate-500 hover:border-slate-400'
                        }`}
                      >
                        {p.label}
                        {active ? ' ✓' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsAiOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-sm font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow cursor-pointer"
              >
                Generate Site
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
