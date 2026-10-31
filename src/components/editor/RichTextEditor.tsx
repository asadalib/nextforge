import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Undo, Redo, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Outdent, Indent, Link as LinkIcon, Unlink,
  Image as ImageIcon, Table as TableIcon, Minus, Code,
  Maximize2, Minimize2, Search, X, Check, Droplet,
  Highlighter, HelpCircle, ChevronDown, Plus, Trash2,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownRight,
  Sparkles, Upload
} from 'lucide-react';

interface RichTextEditorProps {
  initialHtml?: string;
  initialText?: string;
  onChange: (data: { html: string; text: string }) => void;
  title?: string;
  styles?: Record<string, any>;
  onUpdateStyles?: (styles: Record<string, any>) => void;
}

const FONT_FAMILIES = [
  { label: 'Inter (Default)', value: 'Inter, sans-serif' },
  { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Outfit', value: 'Outfit, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Playfair Display (Serif)', value: "'Playfair Display', serif" },
  { label: 'Space Grotesk (Tech)', value: "'Space Grotesk', sans-serif" },
  { label: 'JetBrains Mono (Code)', value: "'JetBrains Mono', monospace" },
  { label: 'Lato', value: "'Lato', sans-serif" },
  { label: 'Open Sans', value: "'Open Sans', sans-serif" },
  { label: 'Raleway', value: "'Raleway', sans-serif" },
  { label: 'Oswald (Headline)', value: "'Oswald', sans-serif" },
  { label: 'Merriweather (Editorial)', value: "'Merriweather', serif" },
  { label: 'Nunito (Rounded)', value: "'Nunito', sans-serif" },
  { label: 'DM Sans', value: "'DM Sans', sans-serif" },
  { label: 'Syne (Artistic)', value: "'Syne', sans-serif" },
  { label: 'Cormorant Garamond', value: "'Cormorant Garamond', serif" },
  { label: 'Cinzel (Classical)', value: "'Cinzel', serif" },
  { label: 'Work Sans', value: "'Work Sans', sans-serif" },
  { label: 'Bebas Neue', value: "'Bebas Neue', sans-serif" },
  { label: 'Fira Code', value: "'Fira Code', monospace" },
  { label: 'System UI', value: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }
];

const FONT_WEIGHTS = [
  { label: '300 Light', value: '300' },
  { label: '400 Regular', value: '400' },
  { label: '500 Medium', value: '500' },
  { label: '600 Semi Bold', value: '600' },
  { label: '700 Bold', value: '700' },
  { label: '800 Extra Bold', value: '800' },
  { label: '900 Black', value: '900' }
];

const FONT_SIZES = [
  { label: '12px', value: '1' },
  { label: '14px', value: '2' },
  { label: '16px (Normal)', value: '3' },
  { label: '18px', value: '4' },
  { label: '24px (Large)', value: '5' },
  { label: '32px (Huge)', value: '6' },
  { label: '48px (Title)', value: '7' }
];

const PARAGRAPH_FORMATS = [
  { label: 'Paragraph (p)', tag: 'p' },
  { label: 'Heading 1 (h1)', tag: 'h1' },
  { label: 'Heading 2 (h2)', tag: 'h2' },
  { label: 'Heading 3 (h3)', tag: 'h3' },
  { label: 'Heading 4 (h4)', tag: 'h4' },
  { label: 'Blockquote', tag: 'blockquote' },
  { label: 'Preformatted Code', tag: 'pre' }
];

const PALETTE_COLORS = [
  '#000000', '#334155', '#64748b', '#94a3b8', '#ffffff',
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'
];

const HIGHLIGHT_COLORS = [
  'transparent', '#fef08a', '#bbf7d0', '#bfdbfe',
  '#fbcfe8', '#fed7aa', '#ddd6fe', '#e2e8f0'
];

const SPECIAL_CHARS = [
  '©', '®', '™', '€', '£', '¥', '§', '°', '±', '×', '÷',
  '←', '→', '↑', '↓', '↔', '•', '–', '—', '…', '★', '✔', '❤'
];

export default function RichTextEditor({
  initialHtml = '',
  initialText = '',
  onChange,
  title = 'Article body',
  styles,
  onUpdateStyles
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rawHtml, setRawHtml] = useState(initialHtml || initialText || '<p></p>');

  // Popover menus state
  const [activeFormatDropdown, setActiveFormatDropdown] = useState(false);
  const [activeFontDropdown, setActiveFontDropdown] = useState(false);
  const [activeSizeDropdown, setActiveSizeDropdown] = useState(false);
  const [activeWeightDropdown, setActiveWeightDropdown] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState(false);
  const [activeHighlightPicker, setActiveHighlightPicker] = useState(false);
  const [activeTablePicker, setActiveTablePicker] = useState(false);
  const [tableGridHover, setTableGridHover] = useState({ r: 3, c: 3 });
  const [activeSpecialChars, setActiveSpecialChars] = useState(false);
  const [activeLinkModal, setActiveLinkModal] = useState(false);
  const [activeImageModal, setActiveImageModal] = useState(false);
  const [showCaseMenu, setShowCaseMenu] = useState(false);
  const [activeFindReplace, setActiveFindReplace] = useState(false);

  // Link & Image state
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  // Find & Replace state
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');

  // Floating Table Contextual Toolbar State
  const [selectedCell, setSelectedCell] = useState<HTMLTableCellElement | null>(null);
  const [tableToolbarPos, setTableToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [showCellBgPicker, setShowCellBgPicker] = useState(false);

  // Stats & Breadcrumb
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['P']);

  // Sync initial content once
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      const content = initialHtml || (initialText ? `<p>${initialText}</p>` : '<p></p>');
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
        updateStats();
      }
    }
  }, []);

  const updateStats = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    setCharCount(text.trim().length);
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  }, []);

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText;
    setRawHtml(html);
    updateStats();
    onChange({ html, text });
  };

  // Execute standard formatting commands
  const execCmd = (cmd: string, value: string | undefined = undefined) => {
    if (isHtmlMode) return;
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    handleEditorInput();
  };

  // Change text case (uppercase, lowercase, capitalize each word, sentence case)
  const changeCase = (mode: 'uppercase' | 'lowercase' | 'capitalize' | 'sentence') => {
    if (isHtmlMode) return;
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const text = sel.toString();
    if (!text) {
      if (onUpdateStyles) {
        onUpdateStyles({
          ...styles,
          textTransform: mode === 'sentence' ? 'none' : mode
        });
      }
      return;
    }
    let transformed = text;
    if (mode === 'uppercase') transformed = text.toUpperCase();
    else if (mode === 'lowercase') transformed = text.toLowerCase();
    else if (mode === 'capitalize') {
      transformed = text.replace(/\b([a-zA-Z])/g, (c) => c.toUpperCase());
    } else if (mode === 'sentence') {
      transformed = text.toLowerCase().replace(/(^\s*|\.\s+|\?\s+|\!\s+)([a-zA-Z])/g, (match, sep, c) => `${sep}${c.toUpperCase()}`);
    }
    document.execCommand('insertText', false, transformed);
    handleEditorInput();
  };

  // Inspect selection on cursor move or click to update breadcrumbs & contextual table toolbar
  const handleSelectionChange = () => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode || !editorRef.current) return;
    if (!editorRef.current.contains(sel.anchorNode)) {
      setTableToolbarPos(null);
      setSelectedCell(null);
      return;
    }

    // Trace breadcrumb tags up to editor root
    const tags: string[] = [];
    let curr: Node | null = sel.anchorNode;
    let cellFound: HTMLTableCellElement | null = null;

    while (curr && curr !== editorRef.current) {
      if (curr.nodeType === Node.ELEMENT_NODE) {
        const el = curr as HTMLElement;
        tags.unshift(el.tagName.toUpperCase());
        if (el.tagName === 'TD' || el.tagName === 'TH') {
          cellFound = el as HTMLTableCellElement;
        }
      }
      curr = curr.parentNode;
    }

    setBreadcrumbs(tags.length ? tags : ['P']);

    // Check if user is inside a table cell
    if (cellFound) {
      setSelectedCell(cellFound);
      const rect = cellFound.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();
      setTableToolbarPos({
        top: Math.max(10, rect.top - editorRect.top + cellFound.offsetHeight + 6),
        left: Math.max(10, Math.min(editorRect.width - 240, rect.left - editorRect.left))
      });
    } else {
      setSelectedCell(null);
      setTableToolbarPos(null);
      setShowCellBgPicker(false);
    }
  };

  // Table manipulation helpers
  const insertTable = (rows: number, cols: number) => {
    setActiveTablePicker(false);
    editorRef.current?.focus();

    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #cbd5e1;"><tbody>`;
    for (let r = 0; r < rows; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < cols; c++) {
        const isHeader = r === 0;
        const tag = isHeader ? 'th' : 'td';
        const bg = isHeader ? 'background-color: #f8fafc;' : '';
        tableHtml += `<${tag} style="border: 1px solid #cbd5e1; padding: 8px 12px; min-width: 50px; ${bg}">Cell</${tag}>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br></p>`;

    execCmd('insertHTML', tableHtml);
  };

  const getParentTable = (cell: HTMLTableCellElement | null) => {
    let p: HTMLElement | null = cell;
    while (p && p.tagName !== 'TABLE' && p !== editorRef.current) {
      p = p.parentElement;
    }
    return p && p.tagName === 'TABLE' ? (p as HTMLTableElement) : null;
  };

  const addTableRow = (direction: 'above' | 'below') => {
    if (!selectedCell) return;
    const row = selectedCell.closest('tr');
    if (!row) return;
    const colCount = row.cells.length;
    const newRow = document.createElement('tr');

    for (let i = 0; i < colCount; i++) {
      const newCell = document.createElement('td');
      newCell.style.border = '1px solid #cbd5e1';
      newCell.style.padding = '8px 12px';
      newCell.innerHTML = '&nbsp;';
      newRow.appendChild(newCell);
    }

    if (direction === 'above') {
      row.parentNode?.insertBefore(newRow, row);
    } else {
      row.parentNode?.insertBefore(newRow, row.nextSibling);
    }
    handleEditorInput();
  };

  const addTableColumn = (direction: 'left' | 'right') => {
    if (!selectedCell) return;
    const cellIndex = selectedCell.cellIndex;
    const table = getParentTable(selectedCell);
    if (!table) return;

    Array.from(table.rows).forEach((row) => {
      const isHeader = row.parentElement?.tagName === 'THEAD' || row.rowIndex === 0;
      const newCell = document.createElement(isHeader ? 'th' : 'td');
      newCell.style.border = '1px solid #cbd5e1';
      newCell.style.padding = '8px 12px';
      if (isHeader) newCell.style.backgroundColor = '#f8fafc';
      newCell.innerHTML = '&nbsp;';

      const targetCell = row.cells[cellIndex];
      if (direction === 'left') {
        row.insertBefore(newCell, targetCell);
      } else {
        row.insertBefore(newCell, targetCell.nextSibling);
      }
    });
    handleEditorInput();
  };

  const deleteTableRow = () => {
    if (!selectedCell) return;
    const row = selectedCell.closest('tr');
    const table = getParentTable(selectedCell);
    if (row && table) {
      if (table.rows.length <= 1) {
        table.remove();
        setSelectedCell(null);
        setTableToolbarPos(null);
      } else {
        row.remove();
        setSelectedCell(null);
        setTableToolbarPos(null);
      }
      handleEditorInput();
    }
  };

  const deleteTableColumn = () => {
    if (!selectedCell) return;
    const cellIndex = selectedCell.cellIndex;
    const table = getParentTable(selectedCell);
    if (!table) return;

    const rowCount = table.rows.length;
    const colCount = table.rows[0]?.cells.length || 0;

    if (colCount <= 1) {
      table.remove();
      setSelectedCell(null);
      setTableToolbarPos(null);
    } else {
      for (let i = 0; i < rowCount; i++) {
        table.rows[i]?.deleteCell(cellIndex);
      }
      setSelectedCell(null);
      setTableToolbarPos(null);
    }
    handleEditorInput();
  };

  const deleteTableEntirely = () => {
    if (!selectedCell) return;
    const table = getParentTable(selectedCell);
    if (table) {
      table.remove();
      setSelectedCell(null);
      setTableToolbarPos(null);
      handleEditorInput();
    }
  };

  const setCellBackground = (color: string) => {
    if (!selectedCell) return;
    selectedCell.style.backgroundColor = color;
    setShowCellBgPicker(false);
    handleEditorInput();
  };

  const setCellVerticalAlign = (align: 'top' | 'middle' | 'bottom') => {
    if (!selectedCell) return;
    selectedCell.style.verticalAlign = align;
    handleEditorInput();
  };

  const setCellTextAlign = (align: 'left' | 'center' | 'right') => {
    if (!selectedCell) return;
    selectedCell.style.textAlign = align;
    handleEditorInput();
  };

  // Link Insertion
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    editorRef.current?.focus();

    const targetAttr = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    const textToUse = linkText.trim() || linkUrl;
    const linkHtml = `<a href="${linkUrl}"${targetAttr} style="color: #6366f1; text-decoration: underline;">${textToUse}</a>`;
    execCmd('insertHTML', linkHtml);

    setLinkUrl('');
    setLinkText('');
    setActiveLinkModal(false);
  };

  // Image Insertion
  const handleInsertImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    editorRef.current?.focus();

    const imgHtml = `<img src="${imageUrl}" alt="${imageAlt || 'Image'}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; display: inline-block;" />`;
    execCmd('insertHTML', imgHtml);

    setImageUrl('');
    setImageAlt('');
    setActiveImageModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const base64 = loadEvt.target?.result as string;
      if (base64) {
        editorRef.current?.focus();
        const imgHtml = `<img src="${base64}" alt="${file.name}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; display: inline-block;" />`;
        execCmd('insertHTML', imgHtml);
        setActiveImageModal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Find and Replace
  const handleFindReplace = (replaceAll = false) => {
    if (!findQuery || !editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;

    if (replaceAll) {
      const regex = new RegExp(findQuery, 'gi');
      const updated = currentHtml.replace(regex, replaceQuery);
      editorRef.current.innerHTML = updated;
    } else {
      const regex = new RegExp(findQuery, 'i');
      const updated = currentHtml.replace(regex, replaceQuery);
      editorRef.current.innerHTML = updated;
    }
    handleEditorInput();
  };

  // Switch between WYSIWYG and Raw HTML mode
  const toggleHtmlMode = () => {
    if (!isHtmlMode) {
      // Switching to HTML code mode
      if (editorRef.current) {
        setRawHtml(editorRef.current.innerHTML);
      }
      setIsHtmlMode(true);
    } else {
      // Switching back to WYSIWYG mode
      setIsHtmlMode(false);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = rawHtml;
          updateStats();
        }
      }, 50);
    }
  };

  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col transition-all overflow-hidden ${
        isFullscreen
          ? 'fixed inset-4 z-50 shadow-2xl border-indigo-500 ring-4 ring-indigo-500/20'
          : 'relative w-full'
      }`}
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/90 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-800 tracking-tight">{title}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
            Rich Editor
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* HTML Code Toggle */}
          <button
            type="button"
            onClick={toggleHtmlMode}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
              isHtmlMode
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
            title="Toggle HTML Source Code (</>)"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono">{isHtmlMode ? 'WYSIWYG' : 'HTML'}</span>
          </button>

          {/* Fullscreen Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Rich Toolbar (2 Rows matching user screenshot) */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 space-y-1.5 select-none">
        {/* ROW 1 */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => execCmd('undo')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('redo')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />

          {/* Paragraph Format Dropdown (¶) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveFormatDropdown(!activeFormatDropdown)}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 flex items-center space-x-1"
              title="Paragraph Format"
            >
              <span>¶</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {activeFormatDropdown && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1">
                {PARAGRAPH_FORMATS.map((fmt) => (
                  <button
                    key={fmt.tag}
                    type="button"
                    onClick={() => {
                      execCmd('formatBlock', fmt.tag);
                      setActiveFormatDropdown(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Family Dropdown (A) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveFontDropdown(!activeFontDropdown)}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 flex items-center space-x-1"
              title="Font Family"
            >
              <span className="font-serif">A</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {activeFontDropdown && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1">
                {FONT_FAMILIES.map((font) => (
                  <button
                    key={font.value}
                    type="button"
                    onClick={() => {
                      execCmd('fontName', font.value);
                      setActiveFontDropdown(false);
                    }}
                    style={{ fontFamily: font.value }}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size Dropdown (↕) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveSizeDropdown(!activeSizeDropdown)}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 flex items-center space-x-1"
              title="Font Size"
            >
              <span className="text-[11px] font-mono">14px</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {activeSizeDropdown && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => {
                      execCmd('fontSize', size.value);
                      setActiveSizeDropdown(false);
                    }}
                    className="w-full px-3 py-1 text-left text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Weight Dropdown (W) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveWeightDropdown(!activeWeightDropdown)}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 flex items-center space-x-1"
              title="Font Weight"
            >
              <span className="text-[10px] font-bold">W: {styles?.fontWeight || '400'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {activeWeightDropdown && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1">
                {FONT_WEIGHTS.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => {
                      if (onUpdateStyles) {
                        onUpdateStyles({ fontWeight: w.value });
                      }
                      setActiveWeightDropdown(false);
                    }}
                    style={{ fontWeight: w.value }}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-between"
                  >
                    <span>{w.label}</span>
                    {(styles?.fontWeight || '400') === w.value && (
                      <Check className="w-3 h-3 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />

          {/* Bold, Italic, Underline, Strikethrough */}
          <button
            type="button"
            onClick={() => execCmd('bold')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-700 font-bold transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('italic')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-700 italic transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('underline')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-700 underline transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('strikeThrough')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-700 line-through transition-colors"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => execCmd('removeFormat')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-500 transition-colors text-xs font-bold"
            title="Clear Formatting"
          >
            Tx
          </button>

          {/* Text Case Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCaseMenu(!showCaseMenu)}
              className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-700 font-bold transition-colors flex items-center space-x-0.5 text-xs"
              title="Change Text Case (Uppercase, Lowercase, Title Case)"
            >
              <span className="font-mono text-xs font-black">aA</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </button>
            {showCaseMenu && (
              <div className="absolute top-full left-0 mt-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xl z-40 w-44 space-y-0.5">
                <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Transform Selection
                </div>
                <button
                  type="button"
                  onClick={() => {
                    changeCase('uppercase');
                    setShowCaseMenu(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md font-semibold flex items-center justify-between"
                >
                  <span>UPPERCASE</span>
                  <span className="font-mono text-[10px] text-slate-400">AA</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    changeCase('lowercase');
                    setShowCaseMenu(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md font-semibold flex items-center justify-between"
                >
                  <span>lowercase</span>
                  <span className="font-mono text-[10px] text-slate-400">aa</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    changeCase('capitalize');
                    setShowCaseMenu(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md font-semibold flex items-center justify-between"
                >
                  <span>Capitalize Each Word</span>
                  <span className="font-mono text-[10px] text-slate-400">Ab</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    changeCase('sentence');
                    setShowCaseMenu(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md font-semibold flex items-center justify-between"
                >
                  <span>Sentence case</span>
                  <span className="font-mono text-[10px] text-slate-400">A...</span>
                </button>
                {onUpdateStyles && (
                  <>
                    <div className="border-t border-slate-100 my-1 pt-1 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Block Default Style
                    </div>
                    <div className="grid grid-cols-4 gap-1 px-1 pb-1">
                      {[
                        { id: 'none', label: 'None' },
                        { id: 'uppercase', label: 'UPPER' },
                        { id: 'lowercase', label: 'lower' },
                        { id: 'capitalize', label: 'Title' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            onUpdateStyles({ ...styles, textTransform: m.id });
                            setShowCaseMenu(false);
                          }}
                          className={`py-0.5 text-[9px] font-bold rounded border ${
                            (styles?.textTransform || 'none') === m.id
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />

          {/* Text Color Picker (Droplet) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveColorPicker(!activeColorPicker)}
              className="p-1.5 hover:bg-slate-200/80 rounded-md text-indigo-600 transition-colors flex items-center space-x-0.5"
              title="Text Color"
            >
              <Droplet className="w-3.5 h-3.5" />
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </button>
            {activeColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-slate-200 rounded-xl shadow-lg z-30 grid grid-cols-5 gap-1.5 w-44">
                {PALETTE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      execCmd('foreColor', c);
                      setActiveColorPicker(false);
                    }}
                    style={{ backgroundColor: c }}
                    className="w-6 h-6 rounded-md border border-slate-300 hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight Color Picker (Highlighter) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveHighlightPicker(!activeHighlightPicker)}
              className="p-1.5 hover:bg-slate-200/80 rounded-md text-amber-600 transition-colors flex items-center space-x-0.5"
              title="Highlight Color"
            >
              <Highlighter className="w-3.5 h-3.5" />
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </button>
            {activeHighlightPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-slate-200 rounded-xl shadow-lg z-30 grid grid-cols-4 gap-1.5 w-40">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      execCmd('hiliteColor', c);
                      setActiveHighlightPicker(false);
                    }}
                    style={{ backgroundColor: c }}
                    className="w-6 h-6 rounded-md border border-slate-300 hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Superscript & Subscript */}
          <button
            type="button"
            onClick={() => execCmd('superscript')}
            className="p-1 hover:bg-slate-200/80 rounded-md text-slate-600 font-mono text-[11px]"
            title="Superscript (x²)"
          >
            x²
          </button>
          <button
            type="button"
            onClick={() => execCmd('subscript')}
            className="p-1 hover:bg-slate-200/80 rounded-md text-slate-600 font-mono text-[11px]"
            title="Subscript (x₂)"
          >
            x₂
          </button>
        </div>

        {/* ROW 2 */}
        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-200/60">
          {/* Lists */}
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertOrderedList')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          {/* Indent / Outdent */}
          <button
            type="button"
            onClick={() => execCmd('outdent')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
            title="Decrease Indent"
          >
            <Outdent className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('indent')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
            title="Increase Indent"
          >
            <Indent className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />

          {/* Text Alignment */}
          <button
            type="button"
            onClick={() => execCmd('justifyLeft')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyCenter')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyRight')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyFull')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
            title="Justify"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />

          {/* Insert Link */}
          <button
            type="button"
            onClick={() => setActiveLinkModal(true)}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
            title="Insert Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          {/* Insert Image */}
          <button
            type="button"
            onClick={() => setActiveImageModal(true)}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
            title="Insert Image (URL or PC)"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>

          {/* Insert Table (Visual Grid Picker matching screenshot) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveTablePicker(!activeTablePicker)}
              className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
              title="Insert Table Grid"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            {activeTablePicker && (
              <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-slate-200 rounded-xl shadow-xl z-30 space-y-2 w-52">
                <div className="text-[11px] font-bold text-slate-700 flex justify-between">
                  <span>Insert Table</span>
                  <span className="text-indigo-600">{tableGridHover.r} × {tableGridHover.c}</span>
                </div>
                <div className="grid grid-cols-6 gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  {Array.from({ length: 6 }).map((_, rIdx) =>
                    Array.from({ length: 6 }).map((_, cIdx) => {
                      const r = rIdx + 1;
                      const c = cIdx + 1;
                      const isHighlighted = r <= tableGridHover.r && c <= tableGridHover.c;
                      return (
                        <div
                          key={`${r}-${c}`}
                          onMouseEnter={() => setTableGridHover({ r, c })}
                          onClick={() => insertTable(r, c)}
                          className={`w-5 h-5 rounded-xs border cursor-pointer transition-colors ${
                            isHighlighted
                              ? 'bg-indigo-500 border-indigo-600'
                              : 'bg-white border-slate-200 hover:border-indigo-300'
                          }`}
                        />
                      );
                    })
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block text-center">Click to place table</span>
              </div>
            )}
          </div>

          {/* Horizontal Line */}
          <button
            type="button"
            onClick={() => execCmd('insertHorizontalRule')}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
            title="Horizontal Line (<hr>)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Special Characters (Ω) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveSpecialChars(!activeSpecialChars)}
              className="px-1.5 py-1 hover:bg-slate-200/80 rounded-md text-slate-700 font-serif text-xs font-bold"
              title="Special Characters (Ω)"
            >
              Ω
            </button>
            {activeSpecialChars && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-slate-200 rounded-xl shadow-lg z-30 grid grid-cols-6 gap-1.5 w-48">
                {SPECIAL_CHARS.map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => {
                      execCmd('insertText', char);
                      setActiveSpecialChars(false);
                    }}
                    className="w-6 h-6 rounded-md hover:bg-indigo-50 hover:text-indigo-600 text-xs font-bold text-slate-700 flex items-center justify-center transition-colors"
                  >
                    {char}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Find and Replace */}
          <button
            type="button"
            onClick={() => setActiveFindReplace(!activeFindReplace)}
            className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-600 transition-colors"
            title="Find and Replace"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Modals & Popups for Link, Image, and Find/Replace */}
      {/* Link Modal */}
      {activeLinkModal && (
        <form onSubmit={handleInsertLink} className="p-3 bg-indigo-50/50 border-b border-indigo-100 flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Link URL (https://...)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 min-w-[150px] px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
            autoFocus
          />
          <input
            type="text"
            placeholder="Anchor Text (Optional)"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            className="w-36 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none"
          />
          <label className="flex items-center space-x-1 text-[11px] text-slate-600">
            <input
              type="checkbox"
              checked={linkNewTab}
              onChange={(e) => setLinkNewTab(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span>New Tab</span>
          </label>
          <button
            type="submit"
            className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            Insert
          </button>
          <button
            type="button"
            onClick={() => setActiveLinkModal(false)}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Image Modal with PC Upload */}
      {activeImageModal && (
        <form onSubmit={handleInsertImage} className="p-3 bg-indigo-50/50 border-b border-indigo-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Insert Image</span>
            <button type="button" onClick={() => setActiveImageModal(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Image URL (https://...)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 min-w-[180px] px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Alt text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              className="w-28 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
            >
              Insert URL
            </button>
            <span className="text-xs text-slate-400">or</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1"
            >
              <Upload className="w-3 h-3 text-indigo-600" />
              <span>Upload from PC</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </form>
      )}

      {/* Find & Replace Bar */}
      {activeFindReplace && (
        <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Find text..."
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none w-36"
          />
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none w-36"
          />
          <button
            type="button"
            onClick={() => handleFindReplace(false)}
            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700"
          >
            Replace Next
          </button>
          <button
            type="button"
            onClick={() => handleFindReplace(true)}
            className="px-2.5 py-1 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold"
          >
            Replace All
          </button>
          <button
            type="button"
            onClick={() => setActiveFindReplace(false)}
            className="p-1 text-slate-400 hover:text-slate-600 ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Editor Body & Floating Contextual Table Toolbar */}
      <div className="relative flex-1 min-h-[220px] max-h-[500px] overflow-y-auto nextforge-scrollbar">
        {isHtmlMode ? (
          <textarea
            value={rawHtml}
            onChange={(e) => {
              setRawHtml(e.target.value);
              onChange({ html: e.target.value, text: e.target.value.replace(/<[^>]*>/g, '') });
            }}
            className="w-full h-full min-h-[240px] p-3 font-mono text-xs text-slate-800 bg-slate-900 text-emerald-400 focus:outline-none resize-none leading-relaxed"
            placeholder="<div>Type HTML here...</div>"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            onKeyUp={handleSelectionChange}
            onMouseUp={handleSelectionChange}
            className="w-full min-h-[240px] p-4 text-slate-800 focus:outline-none prose prose-slate max-w-none text-sm leading-relaxed"
            style={{
              minHeight: isFullscreen ? 'calc(100vh - 200px)' : '240px',
              fontFamily: styles?.fontFamily || undefined,
              fontWeight: styles?.fontWeight || '400',
              fontSize: styles?.fontSize || undefined,
              color: styles?.color || undefined,
              textShadow: styles?.textShadow || undefined,
              textAlign: styles?.textAlign || 'left',
              textTransform: styles?.textTransform || undefined
            }}
          />
        )}

        {/* Floating Contextual Table Toolbar (exactly as in screenshot media_1789020809140.png!) */}
        {selectedCell && tableToolbarPos && !isHtmlMode && (
          <div
            style={{ top: `${tableToolbarPos.top}px`, left: `${tableToolbarPos.left}px` }}
            className="absolute z-40 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 flex flex-col space-y-1 animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Table Action Buttons Row 1 */}
            <div className="flex items-center space-x-1">
              {/* Cell Background Droplet with Tooltip */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setShowCellBgPicker(!showCellBgPicker)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-indigo-600 transition-colors"
                  title="Cell Background"
                >
                  <Droplet className="w-3.5 h-3.5" />
                </button>
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                  Background
                </div>
              </div>

              {/* Vertical Align Dropdown */}
              <button
                type="button"
                onClick={() => setCellVerticalAlign('middle')}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                title="Align Middle"
              >
                ↕
              </button>

              {/* Align Left / Center */}
              <button
                type="button"
                onClick={() => setCellTextAlign('left')}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                title="Cell Align Left"
              >
                <AlignLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setCellTextAlign('center')}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                title="Cell Align Center"
              >
                <AlignCenter className="w-3 h-3" />
              </button>
            </div>

            {/* Table Action Buttons Row 2 */}
            <div className="flex items-center space-x-1 pt-1 border-t border-slate-100">
              {/* Add Row Above */}
              <button
                type="button"
                onClick={() => addTableRow('above')}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors text-[10px] font-bold"
                title="Insert Row Above"
              >
                +R^
              </button>
              {/* Add Row Below */}
              <button
                type="button"
                onClick={() => addTableRow('below')}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors text-[10px] font-bold"
                title="Insert Row Below"
              >
                +Rv
              </button>
              {/* Add Col Left */}
              <button
                type="button"
                onClick={() => addTableColumn('left')}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors text-[10px] font-bold"
                title="Insert Column Left"
              >
                +C&lt;
              </button>
              {/* Add Col Right */}
              <button
                type="button"
                onClick={() => addTableColumn('right')}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors text-[10px] font-bold"
                title="Insert Column Right"
              >
                +C&gt;
              </button>
              {/* Delete Row */}
              <button
                type="button"
                onClick={deleteTableRow}
                className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors text-[10px]"
                title="Delete Row"
              >
                -Row
              </button>
              {/* Delete Column */}
              <button
                type="button"
                onClick={deleteTableColumn}
                className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors text-[10px]"
                title="Delete Col"
              >
                -Col
              </button>
              {/* Delete Table */}
              <button
                type="button"
                onClick={deleteTableEntirely}
                className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                title="Delete Table"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cell Background Swatches Popover */}
            {showCellBgPicker && (
              <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-md grid grid-cols-4 gap-1.5 w-36">
                {[
                  'transparent',
                  '#eff6ff', // blue
                  '#dcfce7', // green (matching user screenshot!)
                  '#2563eb', // bold blue (matching user screenshot!)
                  '#fef9c3', // yellow
                  '#fee2e2', // red
                  '#f3e8ff', // purple
                  '#f1f5f9'  // slate
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCellBackground(color)}
                    style={{ backgroundColor: color }}
                    className="w-6 h-6 rounded border border-slate-300 hover:scale-110 transition-transform"
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Status Bar & Breadcrumb matching screenshot */}
      <div className="bg-slate-50 border-t border-slate-200 px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-slate-500 select-none">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-1 font-mono text-[10px] text-slate-600">
          <span className="text-slate-400">#</span>
          {breadcrumbs.map((tag, idx) => (
            <React.Fragment key={idx}>
              <span className="font-semibold">{tag}</span>
              {idx < breadcrumbs.length - 1 && <span className="text-slate-300">&gt;</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-500">
          <span>CHARS: {charCount}</span>
          <span>WORDS: {wordCount}</span>
          <span className="text-indigo-600 font-sans font-semibold">POWERED BY NEXTFORGE</span>
        </div>
      </div>

      {/* 6. Guide hint matching user screenshot text */}
      <div className="px-3 py-1.5 bg-slate-100/70 border-t border-slate-200/60 text-[10px] text-slate-500">
        Write and format directly. Use the table grid to insert a table, then select its cells to add rows, columns, or format colors. Double-click an image to edit its description and size.
      </div>
    </div>
  );
}
