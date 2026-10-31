import React, { useState } from 'react';
import {
  X, Sparkles, Download, Globe, Server, Cloud, Rocket,
  ExternalLink, Copy, Check, FileCode, CheckCircle2, ChevronRight,
  Code2, Terminal, Info, ShieldCheck, Zap, ArrowRight, Layers
} from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';
import {
  generatePageHtml,
  generateSharedCss,
  generateSharedJs,
  generateHtaccess,
  generateCPanelZip,
  generateNetlifyZip,
  generateCloudflareZip,
  generateVercelNextJsZip
} from '../../utils/codeGenerator';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'cpanel' | 'vercel' | 'cloudflare' | 'netlify' | 'code';
}

export default function PublishModal({ isOpen, onClose, defaultTab = 'cpanel' }: PublishModalProps) {
  const [activeTab, setActiveTab] = useState<'cpanel' | 'vercel' | 'cloudflare' | 'netlify' | 'code'>(defaultTab);
  const [codeTab, setCodeTab] = useState<'html' | 'css' | 'js' | 'htaccess' | 'nextjs'>('html');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const { projectName, pages, sections, currentPageId } = useBuilderStore();

  if (!isOpen) return null;

  // Prepare active page or all pages
  const allPages = pages && pages.length > 0
    ? pages.map(p => p.id === currentPageId ? { ...p, sections } : p)
    : [{ id: 'p-1', name: 'Home', slug: 'home', sections }];

  const currentPage = allPages.find(p => p.id === currentPageId) || allPages[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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

  // Download Handlers
  const handleDownloadCPanel = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateCPanelZip(allPages, projectName || 'NextForge Site');
      triggerDownload(blob, `${(projectName || 'site').toLowerCase().replace(/\s+/g, '-')}-cpanel-public_html.zip`);
      setDownloadSuccess('cpanel');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (err) {
      console.error('cPanel export failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadVercel = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateVercelNextJsZip(allPages, projectName || 'NextForge Site');
      triggerDownload(blob, `${(projectName || 'site').toLowerCase().replace(/\s+/g, '-')}-vercel-nextjs14.zip`);
      setDownloadSuccess('vercel');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (err) {
      console.error('Vercel export failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCloudflare = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateCloudflareZip(allPages, projectName || 'NextForge Site');
      triggerDownload(blob, `${(projectName || 'site').toLowerCase().replace(/\s+/g, '-')}-cloudflare-pages.zip`);
      setDownloadSuccess('cloudflare');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (err) {
      console.error('Cloudflare export failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadNetlify = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateNetlifyZip(allPages, projectName || 'NextForge Site');
      triggerDownload(blob, `${(projectName || 'site').toLowerCase().replace(/\s+/g, '-')}-netlify-drop.zip`);
      setDownloadSuccess('netlify');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (err) {
      console.error('Netlify export failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentHtmlCode = generatePageHtml(currentPage, projectName || 'My Website');
  const currentCssCode = generateSharedCss();
  const currentJsCode = generateSharedJs();
  const currentHtaccessCode = generateHtaccess();
  const currentNextJsCode = `'use client';
import React from 'react';

// NextForge - Next.js 14 App Router Page
export default function ${currentPage.name.replace(/[^a-zA-Z0-9]/g, '') || 'Home'}Page() {
  return (
    <main className="w-full min-h-screen bg-white">
      {/* Generated page layout code with Tailwind CSS */}
    </main>
  );
}
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-slate-800">Publish & Export Center</h2>
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  v1.0 Production
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target hosting: <span className="font-semibold text-slate-600">{projectName || 'Untitled Project'}</span> ({allPages.length} {allPages.length === 1 ? 'page' : 'pages'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex items-center space-x-1.5 px-6 pt-3 border-b border-slate-200 bg-white overflow-x-auto nextforge-scrollbar shrink-0">
          {[
            { id: 'cpanel', label: 'cPanel Shared Hosting', icon: Server, badge: 'HTML/CSS/.htaccess' },
            { id: 'vercel', label: 'Vercel', icon: Zap, badge: 'Next.js 14' },
            { id: 'cloudflare', label: 'Cloudflare Pages', icon: Cloud, badge: 'Edge / Free' },
            { id: 'netlify', label: 'Netlify', icon: Globe, badge: 'Drop / Git' },
            { id: 'code', label: 'Code Inspector', icon: FileCode, badge: 'Preview' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 nextforge-scrollbar space-y-5">
          {/* TAB 1: cPanel Shared Hosting */}
          {activeTab === 'cpanel' && (
            <div className="space-y-5">
              {/* Highlight Card */}
              <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-5 rounded-2xl border border-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                      cPanel / Apache / DirectAdmin Ready
                    </span>
                    <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Zero Node.js Required</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Publish to Standard Shared Hosting</h3>
                  <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                    Packages your complete website as pure HTML5, CSS3, vanilla JavaScript, and an Apache <code className="text-indigo-600 font-mono bg-indigo-50 px-1 py-0.5 rounded">.htaccess</code> file with clean URLs (removes .html), HTTPS enforcement, and Gzip compression.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadCPanel}
                  disabled={isGenerating}
                  className="w-full md:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Packaging ZIP...</span>
                    </>
                  ) : downloadSuccess === 'cpanel' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Downloaded Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download cPanel ZIP (public_html)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3 shadow-xs">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <span>How to Upload to Your cPanel Account (4 Simple Steps)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                    <p className="font-bold text-xs text-slate-800">Login to cPanel</p>
                    <p className="text-[11px] text-slate-400">Navigate to your cPanel URL (e.g. <code className="text-slate-600 font-mono">yourdomain.com:2083</code>).</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                    <p className="font-bold text-xs text-slate-800">Open File Manager</p>
                    <p className="text-[11px] text-slate-400">Click on <strong>File Manager</strong> and open the <code className="text-indigo-600 font-bold font-mono">public_html</code> folder.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                    <p className="font-bold text-xs text-slate-800">Upload ZIP</p>
                    <p className="text-[11px] text-slate-400">Click the <strong>Upload</strong> button at the top and select the downloaded ZIP file.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">&#10003;</span>
                    <p className="font-bold text-xs text-slate-800">Extract & Done!</p>
                    <p className="text-[11px] text-slate-400">Right-click the ZIP and click <strong>Extract</strong>. Your website is instantly live!</p>
                  </div>
                </div>
              </div>

              {/* Included Files Inventory */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">Files Included in the cPanel Package:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-indigo-700 font-bold">📄 index.html</div>
                  {allPages.filter(p => p.slug !== 'home' && p.slug !== 'index').map(p => (
                    <div key={p.id} className="p-2 bg-white rounded-lg border border-slate-200 text-indigo-700 font-bold">📄 {p.slug}.html</div>
                  ))}
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700">🎨 css/styles.css</div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700">⚡ js/main.js</div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-emerald-700 font-bold">⚙️ .htaccess</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Vercel */}
          {activeTab === 'vercel' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-slate-700 px-2 py-0.5 rounded-md">
                      Next.js 14 App Router
                    </span>
                    <span className="text-xs text-indigo-300 font-bold flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edge Serverless Ready</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Deploy to Vercel</h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Downloads a full production-ready Next.js 14 App Router codebase with <code className="text-indigo-300 font-mono">app/page.tsx</code>, Tailwind CSS, TypeScript, and <code className="text-indigo-300 font-mono">vercel.json</code>.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadVercel}
                    disabled={isGenerating}
                    className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-indigo-600" />
                    <span>Download Next.js 14 ZIP</span>
                  </button>
                  <a
                    href="https://vercel.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <span>Open Vercel</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* CLI & Git Instructions */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  <span>Deploy via Vercel CLI (Optional)</span>
                </h4>
                <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-xs space-y-1 relative group">
                  <p className="text-slate-400"># 1. Unzip the project and open terminal inside folder</p>
                  <p className="text-emerald-400">npm install</p>
                  <p className="text-slate-400"># 2. Deploy instantly</p>
                  <p className="text-indigo-400">npx vercel --prod</p>
                  <button
                    onClick={() => handleCopy('npm install\nnpx vercel --prod', 'vercel-cli')}
                    className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-colors"
                  >
                    {copiedKey === 'vercel-cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'vercel-cli' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Cloudflare Pages */}
          {activeTab === 'cloudflare' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-100/50 p-5 rounded-2xl border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-md">
                      Cloudflare Pages (Direct Upload)
                    </span>
                    <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Unlimited Bandwidth</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Publish to Cloudflare Pages</h3>
                  <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                    Deploy your website across Cloudflare's 300+ city edge network. Includes <code className="text-amber-800 font-mono bg-amber-100/60 px-1 py-0.5 rounded">_headers</code>, <code className="text-amber-800 font-mono bg-amber-100/60 px-1 py-0.5 rounded">_routes.json</code>, and <code className="text-amber-800 font-mono bg-amber-100/60 px-1 py-0.5 rounded">wrangler.toml</code>.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadCloudflare}
                    disabled={isGenerating}
                    className="w-full sm:w-auto px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Cloudflare ZIP</span>
                  </button>
                  <a
                    href="https://dash.cloudflare.com/?to=/:account/pages/new/upload"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <span>Cloudflare Dashboard</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                </div>
              </div>

              {/* Wrangler CLI Guide */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-amber-600" />
                  <span>Deploy with Cloudflare Wrangler CLI</span>
                </h4>
                <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-xs space-y-1 relative group">
                  <p className="text-slate-400"># Deploy extracted folder directly to Cloudflare Pages</p>
                  <p className="text-amber-400">npx wrangler pages deploy . --project-name={projectName.toLowerCase().replace(/[^a-z0-9-_]/g, '-') || 'nextforge-site'}</p>
                  <button
                    onClick={() => handleCopy(`npx wrangler pages deploy . --project-name=${projectName.toLowerCase().replace(/[^a-z0-9-_]/g, '-') || 'nextforge-site'}`, 'cf-cli')}
                    className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-colors"
                  >
                    {copiedKey === 'cf-cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cf-cli' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Netlify */}
          {activeTab === 'netlify' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-teal-50 via-emerald-50/40 to-teal-100/50 p-5 rounded-2xl border border-teal-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-200/70 px-2 py-0.5 rounded-md">
                      Netlify Drop (10-Second Deploy)
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Publish to Netlify</h3>
                  <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                    Download the pre-configured Netlify ZIP with <code className="text-teal-800 font-mono bg-teal-100/60 px-1 py-0.5 rounded">netlify.toml</code> and <code className="text-teal-800 font-mono bg-teal-100/60 px-1 py-0.5 rounded">_redirects</code>. Simply drag and drop the folder into Netlify Drop to publish immediately.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadNetlify}
                    disabled={isGenerating}
                    className="w-full sm:w-auto px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Netlify ZIP</span>
                  </button>
                  <a
                    href="https://app.netlify.com/drop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <span>Open Netlify Drop</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                </div>
              </div>

              {/* Netlify CLI Guide */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-teal-600" />
                  <span>Deploy via Netlify CLI</span>
                </h4>
                <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-xs space-y-1 relative group">
                  <p className="text-slate-400"># Deploy extracted folder to production</p>
                  <p className="text-teal-400">npx netlify deploy --prod --dir=.</p>
                  <button
                    onClick={() => handleCopy('npx netlify deploy --prod --dir=.', 'netlify-cli')}
                    className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-colors"
                  >
                    {copiedKey === 'netlify-cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'netlify-cli' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Code Inspector & Preview */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {[
                    { id: 'html', label: `${currentPage.slug || 'index'}.html` },
                    { id: 'css', label: 'styles.css' },
                    { id: 'js', label: 'main.js' },
                    { id: 'htaccess', label: '.htaccess' },
                    { id: 'nextjs', label: 'Next.js App' },
                  ].map(cTab => (
                    <button
                      key={cTab.id}
                      onClick={() => setCodeTab(cTab.id as any)}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                        codeTab === cTab.id
                          ? 'bg-white text-indigo-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {cTab.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const text = codeTab === 'html' ? currentHtmlCode
                      : codeTab === 'css' ? currentCssCode
                      : codeTab === 'js' ? currentJsCode
                      : codeTab === 'htaccess' ? currentHtaccessCode
                      : currentNextJsCode;
                    handleCopy(text, 'code-inspector');
                  }}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'code-inspector' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'code-inspector' ? 'Copied Code!' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Code viewer */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>{codeTab === 'html' ? `${currentPage.slug || 'index'}.html` : codeTab === 'css' ? 'css/styles.css' : codeTab === 'js' ? 'js/main.js' : codeTab === 'htaccess' ? '.htaccess' : 'app/page.tsx'}</span>
                  <span className="text-[10px] text-slate-500">Pure Production Output</span>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-80 nextforge-scrollbar whitespace-pre leading-relaxed">
                  <code>
                    {codeTab === 'html' ? currentHtmlCode
                      : codeTab === 'css' ? currentCssCode
                      : codeTab === 'js' ? currentJsCode
                      : codeTab === 'htaccess' ? currentHtaccessCode
                      : currentNextJsCode}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All code is generated 100% locally with zero vendor lock-in.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

