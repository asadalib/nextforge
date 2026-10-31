import React, { useState, useRef } from 'react';
import TopToolbar from './components/editor/TopToolbar';
import LeftSidebar from './components/editor/LeftSidebar';
import CanvasWorkspace from './components/editor/CanvasWorkspace';
import RightInspector from './components/editor/RightInspector';
import FloatingLayersPanel from './components/editor/FloatingLayersPanel';
import ElementRenderer, { getSectionLayoutStyles } from './components/editor/ElementRenderer';
import KeyboardShortcutsModal from './components/editor/KeyboardShortcutsModal';
import SaveProjectModal from './components/editor/SaveProjectModal';
import PublishModal from './components/editor/PublishModal';
import Dashboard from './components/Dashboard';
import { useBuilderStore } from './store/useBuilderStore';
import {
  Eye, X, Monitor, Tablet, Smartphone,
  Undo2, Redo2, Copy, Trash2, Clipboard, ClipboardCheck, Info
} from 'lucide-react';

interface ToastState {
  message: string;
  type: 'undo' | 'redo' | 'duplicate' | 'delete' | 'copy' | 'paste' | 'info';
  id: number;
}

const normalizeUnit = (val?: string | number) => {
  if (!val) return undefined;
  const s = String(val).trim();
  if (/^[0-9]+$/.test(s)) return `${s}px`;
  return s;
};

export default function App() {
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [isLayersOpen, setIsLayersOpen] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishModalTab, setPublishModalTab] = useState<'cpanel' | 'vercel' | 'cloudflare' | 'netlify' | 'code'>('cpanel');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeoutRef = useRef<any>(null);
  const isFirstMount = useRef(true);
  const lastSavedSnapshotRef = useRef<string>('');

  const {
    sections,
    pages,
    currentPageId,
    setCurrentPageId,
    projectName,
    undo,
    redo,
    selectedElementId,
    selectedSectionId,
    selectedRowId,
    setSelectedElementId,
    setSelectedSectionId,
    deleteElement,
    deleteSection,
    duplicateElement,
    duplicateSection,
    duplicateRowInSection,
    copyElement,
    pasteElement,
    copySection,
    pasteSection,
    clipboardSection,
    saveProject,
    autoSave,
    setAutoSave,
    autoSaveStatus,
    setAutoSaveStatus,
    lastSavedAt,
    initFromStorage,
    theme
  } = useBuilderStore();

  // Synchronize documentElement dark mode class
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Hydrate persistent state from IndexedDB on initial mount
  React.useEffect(() => {
    initFromStorage?.().then(() => {
      const state = useBuilderStore.getState();
      lastSavedSnapshotRef.current = JSON.stringify({
        name: state.projectName,
        pages: state.pages,
        sections: state.sections,
        globalSections: state.globalSections
      });
    });
  }, []);

  // Debounced Auto-Save: background saves to loaded project after user edits
  React.useEffect(() => {
    if (!autoSave) return;

    const currentSnapshot = JSON.stringify({
      name: projectName,
      pages,
      sections,
      globalSections: useBuilderStore.getState().globalSections
    });

    if (isFirstMount.current) {
      isFirstMount.current = false;
      lastSavedSnapshotRef.current = currentSnapshot;
      return;
    }

    // Skip if nothing actually changed
    if (currentSnapshot === lastSavedSnapshotRef.current) {
      return;
    }

    setAutoSaveStatus('saving');
    const timer = setTimeout(async () => {
      await saveProject(false);
      lastSavedSnapshotRef.current = currentSnapshot;
      setAutoSaveStatus('saved');
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2500);
    }, 1000);

    return () => clearTimeout(timer);
  }, [sections, pages, projectName, autoSave]);

  const showToast = (
    message: string,
    type: 'undo' | 'redo' | 'duplicate' | 'delete' | 'copy' | 'paste' | 'info' = 'info'
  ) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type, id: Date.now() });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 1700);
  };

  // Comprehensive Keyboard Shortcuts: Undo, Redo, Delete, Duplicate, Copy, Paste, Escape, Help
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const target = e.target as HTMLElement | null;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT' ||
        activeEl?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      const isModifier = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // 1. Undo (Ctrl+Z / Cmd+Z without Shift)
      if (isModifier && key === 'z' && !e.shiftKey) {
        if (!isInput) {
          e.preventDefault();
          undo();
          showToast('Undone', 'undo');
        }
      }

      // 2. Redo (Ctrl+Y / Cmd+Y OR Ctrl+Shift+Z / Cmd+Shift+Z)
      else if ((isModifier && key === 'y') || (isModifier && key === 'z' && e.shiftKey)) {
        if (!isInput) {
          e.preventDefault();
          redo();
          showToast('Redone', 'redo');
        }
      }

      // Save Project (Ctrl+S / Cmd+S)
      else if (isModifier && key === 's') {
        e.preventDefault();
        saveProject(false).then(() => {
          showToast('Project saved successfully!', 'info');
        });
      }

      // 3. Duplicate (Ctrl+D / Cmd+D)
      else if (isModifier && key === 'd') {
        e.preventDefault(); // Always prevent browser bookmark popup!
        if (!isInput) {
          if (selectedElementId) {
            duplicateElement(selectedElementId);
            showToast('Element Duplicated', 'duplicate');
          } else if (selectedRowId && selectedSectionId) {
            const sec = sections.find((s) => s.id === selectedSectionId);
            if (sec && sec.rows && sec.rows.length > 1) {
              duplicateRowInSection(selectedSectionId, selectedRowId);
              showToast('Row Duplicated', 'duplicate');
            } else {
              duplicateSection(selectedSectionId);
              showToast('Section Duplicated', 'duplicate');
            }
          } else if (selectedSectionId) {
            duplicateSection(selectedSectionId);
            showToast('Section Duplicated', 'duplicate');
          } else if (sections.length > 0) {
            duplicateSection(sections[sections.length - 1].id);
            showToast('Section Duplicated', 'duplicate');
          }
        }
      }

      // 4. Delete (Delete or Backspace when not typing)
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!isInput) {
          if (selectedElementId) {
            e.preventDefault();
            deleteElement(selectedElementId);
            showToast('Element Deleted', 'delete');
          } else if (selectedSectionId) {
            e.preventDefault();
            deleteSection(selectedSectionId);
            showToast('Section Deleted', 'delete');
          }
        }
      }

      // 5. Copy (Ctrl+C / Cmd+C or Ctrl+Shift+C)
      else if (isModifier && key === 'c') {
        if (!isInput) {
          if (e.shiftKey || (!selectedElementId && selectedSectionId)) {
            const targetSec = selectedSectionId || (sections.length > 0 ? sections[sections.length - 1].id : null);
            if (targetSec) {
              e.preventDefault();
              copySection(targetSec);
              showToast('Section Copied to Clipboard', 'copy');
            }
          } else if (selectedElementId) {
            copyElement(selectedElementId);
            showToast('Element Copied', 'copy');
          }
        }
      }

      // 6. Paste (Ctrl+V / Cmd+V or Ctrl+Shift+V)
      else if (isModifier && key === 'v') {
        if (!isInput) {
          if (e.shiftKey || (!selectedElementId && clipboardSection)) {
            if (clipboardSection) {
              e.preventDefault();
              pasteSection();
              showToast('Section Pasted', 'paste');
            }
          } else {
            pasteElement();
            showToast('Element Pasted', 'paste');
          }
        }
      }

      // 7. Toggle Keyboard Shortcuts modal (? or Shift+/)
      else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        if (!isInput) {
          e.preventDefault();
          setIsShortcutsOpen((prev) => !prev);
        }
      }

      // 8. Escape (Deselect / Blur / Close modals)
      else if (e.key === 'Escape') {
        if (isInput) {
          (activeEl as HTMLElement)?.blur();
        } else {
          setSelectedElementId(null);
          setSelectedSectionId(null);
          setIsPreviewOpen(false);
          setIsShortcutsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    selectedElementId,
    selectedSectionId,
    selectedRowId,
    sections,
    deleteElement,
    deleteSection,
    duplicateElement,
    duplicateSection,
    duplicateRowInSection,
    copyElement,
    pasteElement,
    saveProject,
    setSelectedElementId,
    setSelectedSectionId
  ]);

  const getPreviewWidth = () => {
    if (previewDevice === 'tablet') return 'w-[768px]';
    if (previewDevice === 'mobile') return 'w-[390px]';
    return 'w-full';
  };

  const handleOpenSite = (record: any) => {
    useBuilderStore.getState().loadSiteData(record);
    setView('editor');
  };

  const handleBackToDashboard = async () => {
    try {
      await saveProject(false);
    } catch (err) {
      console.warn('[NextForge App] save before dashboard failed:', err);
    }
    setView('dashboard');
  };

  if (view === 'dashboard') {
    return <Dashboard onOpenSite={handleOpenSite} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Toolbar */}
      <TopToolbar
        onToggleLayers={() => setIsLayersOpen(!isLayersOpen)}
        isLayersOpen={isLayersOpen}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenPublishModal={(tab) => {
          if (tab) setPublishModalTab(tab);
          setIsPublishModalOpen(true);
        }}
        onBackToDashboard={handleBackToDashboard}
      />

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Elements FIRST, Layout SECOND */}
        <LeftSidebar />

        {/* Center Canvas */}
        <CanvasWorkspace />

        {/* Floating Layers Panel */}
        <FloatingLayersPanel isOpen={isLayersOpen} onClose={() => setIsLayersOpen(false)} />

        {/* Right Inspector */}
        <RightInspector />
      </div>

      {/* Full Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-fade-in">
          {/* Preview Bar */}
          <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center space-x-3 text-slate-900 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shadow-xs text-white">
                <Eye className="w-3.5 h-3.5" />
              </div>
              <span>Live Site Preview</span>
              <span className="text-xs text-slate-500 font-normal">({projectName})</span>
            </div>

            {/* Multi-Page Navigation in Preview */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {pages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setCurrentPageId(p.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    p.id === currentPageId
                      ? 'bg-white text-indigo-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="ml-1 text-[10px] font-mono opacity-60">{p.slug}</span>
                </button>
              ))}
            </div>

            {/* Responsive Device Switcher in Preview */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg transition-colors ${
                  previewDevice === 'desktop' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Desktop View (Full Screen)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded-lg transition-colors ${
                  previewDevice === 'tablet' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg transition-colors ${
                  previewDevice === 'mobile' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Mobile View (390px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Preview Mode</span>
            </button>
          </div>

          {/* Rendered Live Website Canvas */}
          <div
            id="preview-scroll-container"
            className={`flex-1 overflow-y-auto nextforge-scrollbar scroll-smooth ${
              previewDevice === 'desktop'
                ? 'w-full p-0 bg-white'
                : 'p-4 sm:p-8 flex justify-center bg-slate-100/80'
            }`}
          >
            <div
              className={`${getPreviewWidth()} nextforge-canvas-${previewDevice} ${
                previewDevice === 'desktop'
                  ? 'w-full min-h-full bg-white overflow-visible transition-all duration-300'
                  : 'bg-white shadow-xl ring-1 ring-slate-900/10 rounded-2xl overflow-visible transition-all duration-300 h-fit space-y-0'
              }`}
            >
              {sections.length === 0 ? (
                <div className="p-16 text-center text-slate-400">
                  <p>No content in this page yet.</p>
                </div>
              ) : (
                sections.map((sec) => {
                  const hasStickyNav = sec.columns?.some((c: any) =>
                    c.elements?.some((e: any) => e.type === 'navigation' && (e.styles?.isSticky ?? e.content?.isSticky))
                  );
                  const isSecSticky = Boolean(sec.styles?.isSticky || hasStickyNav);
                  const isDarkSec = sec.styles?.bgColor === '#0f172a' || sec.styles?.bgColor === '#0b0f19';
                  const isSecScreenFull = sec.styles?.widthType === 'screen';
                  const isSecCustomWidth = sec.styles?.widthType === 'custom';
                  const secLayout = getSectionLayoutStyles(sec.styles);

                  const activeBgColor = sec.styles?.bgColor || '#ffffff';
                  const activeBorderColor = sec.styles?.borderColor;
                  const activeBorderStyle = sec.styles?.borderStyle || (sec.styles?.borderWidth ? 'solid' : undefined);
                  const activeBorderWidth = normalizeUnit(sec.styles?.borderWidth);
                  const activeShadow = sec.styles?.shadow;

                  let bgImageStyle = sec.styles?.bgImage ? `url("${sec.styles.bgImage}")` : undefined;
                  let bgGradientStyle = sec.styles?.bgGradient || undefined;

                  const secVAlign = sec.styles?.contentVerticalAlign || sec.styles?.verticalAlign || 'top';
                  const secJustify = secVAlign === 'center' ? 'center' : secVAlign === 'bottom' ? 'flex-end' : 'flex-start';

                  const rows = sec.rows && sec.rows.length > 0
                    ? sec.rows
                    : [{ id: `${sec.id}-row-0`, columns: sec.columns }];

                  const hasAnyElements = sec.columns?.some((c: any) => c.elements && c.elements.length > 0) ||
                    sec.rows?.some((r: any) => r.columns?.some((c: any) => c.elements && c.elements.length > 0));

                  if (!hasAnyElements && !sec.styles?.bgImage && !sec.styles?.minHeight && !sec.styles?.bgColor) {
                    return null;
                  }

                  return (
                    <section
                      key={sec.id}
                      id={sec.customId || sec.id}
                      data-section-id={sec.id}
                      data-custom-id={sec.customId || ''}
                      className={`transition-all ${
                        isSecScreenFull ? 'w-full' : 'mx-auto'
                      } ${
                        isSecSticky ? 'sticky top-0 z-40 shadow-xs' : 'relative'
                      } ${
                        isDarkSec
                          ? 'bg-slate-950 text-white'
                          : 'bg-white text-slate-900'
                      }`}
                      style={{
                        backgroundColor: activeBgColor,
                        backgroundImage: bgImageStyle || bgGradientStyle,
                        backgroundSize: sec.styles?.bgSize || 'cover',
                        backgroundPosition: sec.styles?.bgPosition || 'center',
                        backgroundRepeat: sec.styles?.bgRepeat || 'no-repeat',
                        width: secLayout.width,
                        maxWidth: secLayout.maxWidth,
                        alignSelf: secLayout.alignSelf,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: secJustify,
                        marginTop: secLayout.marginTop,
                        marginBottom: secLayout.marginBottom,
                        marginLeft: secLayout.marginLeft,
                        marginRight: secLayout.marginRight,
                        paddingTop: normalizeUnit(sec.styles?.paddingTop) || '20px',
                        paddingBottom: normalizeUnit(sec.styles?.paddingBottom) || '20px',
                        paddingLeft: normalizeUnit(sec.styles?.paddingLeft) || '20px',
                        paddingRight: normalizeUnit(sec.styles?.paddingRight) || '20px',
                        borderRadius: normalizeUnit(sec.styles?.borderRadius) || (isSecScreenFull ? '0px' : '16px'),
                        borderColor: activeBorderColor,
                        borderWidth: activeBorderWidth,
                        borderStyle: activeBorderStyle,
                        boxShadow: activeShadow,
                        zIndex: isSecSticky ? 40 : (sec.styles?.zIndex !== undefined && sec.styles?.zIndex !== '' ? Number(sec.styles.zIndex) || sec.styles.zIndex : undefined),
                        minHeight: normalizeUnit(sec.styles?.minHeight),
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      {/* Background Overlay if image set */}
                      {sec.styles?.bgImage && (
                        <div
                          className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden transition-opacity duration-200"
                          style={{
                            backgroundColor: sec.styles.bgOverlayColor || '#000000',
                            opacity: sec.styles.bgOverlayOpacity !== undefined ? sec.styles.bgOverlayOpacity : 0.4,
                            zIndex: 1
                          }}
                        />
                      )}

                      <div className="space-y-6 relative z-10 w-full">
                        {rows.map((row) => {
                          const isStretchCols = Boolean(sec.styles?.equalHeightColumns || row.styles?.rowVerticalAlign === 'stretch');
                          const isMobileDevice = previewDevice === 'mobile';
                          const colGapRaw = row.styles?.columnGap || sec.styles?.columnGap;
                          const colGutter = colGapRaw
                            ? `${Math.max(0, parseInt(colGapRaw)) / 2}px`
                            : '8px';
                          const gutterPx = parseFloat(colGutter) || 8;

                          const rowWidthType = row.styles?.rowWidthType || 'full';
                          let rowMaxWidth: string | undefined = undefined;
                          let rowCustomW: string | undefined = undefined;
                          if (rowWidthType === 'boxed') {
                            rowMaxWidth = '1180px';
                          } else if (rowWidthType === 'contained') {
                            rowMaxWidth = '960px';
                          } else if (rowWidthType === 'compact') {
                            rowMaxWidth = '720px';
                          } else if (rowWidthType === 'custom' && row.styles?.rowCustomWidth) {
                            rowCustomW = normalizeUnit(row.styles.rowCustomWidth);
                          }

                          const rowAlign = row.styles?.rowAlign || 'center';
                          let rowAlignClass = 'mx-auto';
                          let rowMarginLeft = 'auto';
                          let rowMarginRight = 'auto';

                          if (rowAlign === 'left') {
                            rowAlignClass = 'mr-auto ml-0';
                            rowMarginLeft = row.styles?.marginLeft ? normalizeUnit(row.styles.marginLeft) || '0px' : '0px';
                            rowMarginRight = 'auto';
                          } else if (rowAlign === 'right') {
                            rowAlignClass = 'ml-auto mr-0';
                            rowMarginLeft = 'auto';
                            rowMarginRight = row.styles?.marginRight ? normalizeUnit(row.styles.marginRight) || '0px' : '0px';
                          } else {
                            rowAlignClass = 'mx-auto';
                            rowMarginLeft = 'auto';
                            rowMarginRight = 'auto';
                          }

                          return (
                          <div
                            key={row.id}
                            className={`relative rounded-xl transition-all ${rowAlignClass}`}
                            style={{
                              width: rowCustomW || '100%',
                              maxWidth: rowMaxWidth ? `min(100%, ${rowMaxWidth})` : '100%',
                              boxSizing: 'border-box',
                              backgroundColor: row.styles?.bgColor,
                              backgroundImage: row.styles?.bgImage ? `url("${row.styles.bgImage}")` : (row.styles?.bgGradient || undefined),
                              backgroundSize: row.styles?.bgSize || 'cover',
                              backgroundPosition: row.styles?.bgPosition || 'center',
                              paddingTop: normalizeUnit(row.styles?.paddingTop),
                              paddingBottom: normalizeUnit(row.styles?.paddingBottom),
                              paddingLeft: normalizeUnit(row.styles?.paddingLeft),
                              paddingRight: normalizeUnit(row.styles?.paddingRight),
                              marginTop: normalizeUnit(row.styles?.marginTop),
                              marginBottom: normalizeUnit(row.styles?.marginBottom),
                              marginLeft: rowMarginLeft,
                              marginRight: rowMarginRight,
                              borderRadius: normalizeUnit(row.styles?.borderRadius),
                              borderWidth: normalizeUnit(row.styles?.borderWidth),
                              borderColor: row.styles?.borderColor,
                              borderStyle: row.styles?.borderStyle || (row.styles?.borderWidth ? 'solid' : undefined),
                              boxShadow: row.styles?.shadow,
                              minHeight: normalizeUnit(row.styles?.minHeight),
                              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                          >
                            <div
                              className={`flex flex-wrap w-full gap-y-4 ${
                                isStretchCols
                                  ? 'items-stretch'
                                  : row.styles?.rowVerticalAlign === 'bottom'
                                  ? 'items-end'
                                  : row.styles?.rowVerticalAlign === 'center'
                                  ? 'items-center'
                                  : 'items-start'
                              }`}
                              style={{
                                marginLeft: isMobileDevice ? 0 : `-${colGutter}`,
                                marginRight: isMobileDevice ? 0 : `-${colGutter}`,
                                width: isMobileDevice ? '100%' : `calc(100% + ${gutterPx * 2}px)`
                              }}
                            >
                              {row.columns.map((col) => {
                                let effectiveColWidth = col.widthPercentage;
                                if (previewDevice === 'mobile') {
                                  effectiveColWidth = 100;
                                } else if (previewDevice === 'tablet') {
                                  if (col.widthPercentage <= 34) {
                                    effectiveColWidth = 50;
                                  } else if (col.widthPercentage < 100) {
                                    effectiveColWidth = Math.max(50, col.widthPercentage);
                                  }
                                }

                                const hasColCardStyles = Boolean(
                                  col.styles?.bgColor ||
                                  col.styles?.bgGradient ||
                                  col.styles?.bgImage ||
                                  col.styles?.borderWidth ||
                                  col.styles?.shadow
                                );

                                const colVAlign = col.styles?.contentVerticalAlign || col.styles?.verticalAlign || secVAlign;
                                const colJustify = colVAlign === 'center' ? 'center' : colVAlign === 'bottom' ? 'flex-end' : 'flex-start';

                                return (
                                  <div
                                    key={col.id}
                                    className={`min-w-0 flex-shrink-0 transition-all duration-300 ${isStretchCols ? 'flex flex-col' : ''}`}
                                    style={{
                                      width: `${effectiveColWidth}%`,
                                      paddingLeft: isMobileDevice ? 0 : colGutter,
                                      paddingRight: isMobileDevice ? 0 : colGutter,
                                      boxSizing: 'border-box'
                                    }}
                                  >
                                    <div
                                      className={`relative transition-all flex flex-col ${
                                        isStretchCols ? 'h-full flex-1' : ''
                                      } ${
                                        hasColCardStyles
                                          ? 'rounded-xl p-4'
                                          : ''
                                      }`}
                                      style={{
                                        backgroundColor: col.styles?.bgColor,
                                        backgroundImage: col.styles?.bgImage ? `url("${col.styles.bgImage}")` : (col.styles?.bgGradient || undefined),
                                        backgroundSize: col.styles?.bgSize || 'cover',
                                        backgroundPosition: col.styles?.bgPosition || 'center',
                                        paddingTop: normalizeUnit(col.styles?.paddingTop) || (hasColCardStyles ? '16px' : undefined),
                                        paddingBottom: normalizeUnit(col.styles?.paddingBottom) || (hasColCardStyles ? '16px' : undefined),
                                        paddingLeft: normalizeUnit(col.styles?.paddingLeft) || (hasColCardStyles ? '16px' : undefined),
                                        paddingRight: normalizeUnit(col.styles?.paddingRight) || (hasColCardStyles ? '16px' : undefined),
                                        borderRadius: normalizeUnit(col.styles?.borderRadius) || (hasColCardStyles ? '12px' : undefined),
                                        borderWidth: normalizeUnit(col.styles?.borderWidth),
                                        borderColor: col.styles?.borderColor,
                                        borderStyle: col.styles?.borderStyle || (col.styles?.borderWidth ? 'solid' : undefined),
                                        boxShadow: col.styles?.shadow,
                                        minHeight: normalizeUnit(col.styles?.minHeight) || (hasColCardStyles ? '140px' : undefined),
                                        height: col.styles?.height ? normalizeUnit(col.styles.height) : (isStretchCols ? '100%' : undefined),
                                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                                      }}
                                    >
                                      <div
                                        className="space-y-4 flex-1 w-full flex flex-col"
                                        style={{
                                          justifyContent: colJustify
                                        }}
                                      >
                                        {col.elements.map((el) => (
                                          <ElementRenderer
                                            key={el.id}
                                            element={el}
                                            isEditor={false}
                                            previewDevice={previewDevice}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Save Project Progress & File Download Prompt Modal */}
      <SaveProjectModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onDownloadFile={() => {
          saveProject(true);
          showToast('Project File Downloaded (.project.json)', 'info');
        }}
        projectName={projectName}
        lastSavedAt={lastSavedAt}
        autoSave={autoSave}
        onToggleAutoSave={setAutoSave}
      />

      {/* Multi-Platform Publish & Export Modal (cPanel, Vercel, Cloudflare Pages, Netlify, Code) */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        defaultTab={publishModalTab}
      />

      {/* Floating Keyboard Shortcut Action Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[200] pointer-events-none transition-all duration-200 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center space-x-2.5 px-4 py-2 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-2xl border border-slate-700/60 text-xs font-semibold">
            {toast.type === 'undo' && <Undo2 className="w-3.5 h-3.5 text-indigo-400" />}
            {toast.type === 'redo' && <Redo2 className="w-3.5 h-3.5 text-indigo-400" />}
            {toast.type === 'duplicate' && <Copy className="w-3.5 h-3.5 text-emerald-400" />}
            {toast.type === 'delete' && <Trash2 className="w-3.5 h-3.5 text-rose-400" />}
            {toast.type === 'copy' && <Clipboard className="w-3.5 h-3.5 text-amber-400" />}
            {toast.type === 'paste' && <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />}
            {toast.type === 'info' && <Info className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
