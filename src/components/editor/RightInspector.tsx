import React, { useState, useRef } from 'react';
import {
  ChevronDown, ChevronRight, ChevronUp, Layout, Palette, Sliders, Type,
  Trash2, Image as ImageIcon, Box, Star, Sparkles, Check,
  Zap, Shield, Heart, Trophy, Rocket, Code, Globe, Bell, Mail,
  ArrowRight, ArrowLeft, MoveLeft, MoveRight, Upload, Plus, SlidersHorizontal, Layers, Copy, Move,
  Phone, MapPin, Clock, HelpCircle, Table, CheckSquare, Square, FileSpreadsheet,
  GripVertical, Maximize2, Minimize2, LayoutGrid, Hash, ClipboardCopy, Link2, Unlink, Pin, Columns, SplitSquareVertical,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Eye, Compass,
  Video, Play, Pause, Repeat, Volume2, VolumeX, EyeOff, Film, CircleDot, FileText, Shapes, Code2, ExternalLink
} from 'lucide-react';
import { CollapseGroup, IconTabs, AlignGroup, CompactToggle, PresetChips } from './inspectorControls';
import { useBuilderStore } from '../../store/useBuilderStore';
import { PageModel, SectionModel, NavLinkItem } from '../../types/builder';
import RichTextEditor from './RichTextEditor';
import SectionInspector from './SectionInspector';
import ModernColorPicker from './ModernColorPicker';
import IconSelector from './IconSelector';
import AdvancedSpacingControls from './AdvancedSpacingControls';
import { applyShadowColor, TypewriterHeading } from './ElementRenderer';
import { VIDEO_MASK_SHAPES } from '../../utils/videoUtils';

const PRESET_IMAGES = [
  {
    name: 'Workspace & Charts',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Modern Dashboard',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Developer Code',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Minimal Workspace',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'
  }
];

const SECTION_STRUCTURE_PRESETS = [
  { id: 'container', label: '1 Column', desc: '100%', cols: [100] },
  { id: 'sidebar-left', label: 'Sidebar Left', desc: '30% / 70%', cols: [30, 70] },
  { id: 'sidebar-right', label: 'Sidebar Right', desc: '70% / 30%', cols: [70, 30] },
  { id: 'two-equal', label: '2 Columns', desc: '50% / 50%', cols: [50, 50] },
  { id: 'wide-left', label: 'Wide Left', desc: '65% / 35%', cols: [65, 35] },
  { id: 'wide-right', label: 'Wide Right', desc: '35% / 65%', cols: [35, 65] },
  { id: 'three-equal', label: '3 Columns', desc: '33% / 33% / 33%', cols: [33.33, 33.33, 33.34] },
  { id: 'center-focus', label: 'Center Focus', desc: '25% / 50% / 25%', cols: [25, 50, 25] },
  { id: 'wide-center', label: 'Wide Center', desc: '20% / 60% / 20%', cols: [20, 60, 20] },
  { id: 'four-equal', label: '4 Columns', desc: '4 x 25%', cols: [25, 25, 25, 25] },
  { id: 'five-equal', label: '5 Columns', desc: '5 x 20%', cols: [20, 20, 20, 20, 20] },
  { id: 'six-equal', label: '6 Columns', desc: '6 x 16.6%', cols: [16.66, 16.66, 16.66, 16.66, 16.66, 16.7] },
];

const BUTTON_PRESET_ITEMS = [
  {
    id: 'solid',
    name: 'Solid Filled',
    badge: 'Popular',
    previewClass: 'bg-indigo-600 text-white shadow-sm border border-indigo-600',
  },
  {
    id: 'outline',
    name: 'Clean Outline',
    badge: 'Classic',
    previewClass: 'bg-transparent text-indigo-600 border-2 border-indigo-600 shadow-none',
  },
  {
    id: 'soft',
    name: 'Soft Tint',
    badge: 'Modern',
    previewClass: 'bg-indigo-50 text-indigo-600 border border-transparent shadow-none',
  },
  {
    id: 'gradient',
    name: 'Vibrant Gradient',
    badge: 'Trending',
    previewClass: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md border-0',
  },
  {
    id: 'glow',
    name: 'Neon Glow',
    badge: 'Sci-Fi',
    previewClass: 'bg-indigo-600 text-white border border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.7)]',
  },
  {
    id: 'pill',
    name: 'Pill Capsule',
    badge: 'Rounded',
    previewClass: 'bg-indigo-600 text-white rounded-full shadow-sm border border-indigo-600',
  },
  {
    id: 'glass',
    name: 'Glassmorphism',
    badge: 'Frosted',
    previewClass: 'bg-slate-100/60 backdrop-blur text-slate-800 border border-white/60 shadow-sm',
  },
  {
    id: '3d',
    name: '3D Push Depth',
    badge: 'Tactile',
    previewClass: 'bg-indigo-600 text-white border-0 shadow-[0_4px_0_0_#4338ca]',
  },
  {
    id: 'minimal',
    name: 'Minimal Ghost',
    badge: 'Clean',
    previewClass: 'bg-transparent text-slate-700 border border-slate-300 shadow-none',
  },
  {
    id: 'shine',
    name: 'Metallic Shine',
    badge: 'Premium',
    previewClass: 'bg-indigo-600 bg-gradient-to-b from-white/30 to-transparent text-white border border-white/30 shadow-md',
  },
];

const PRESET_HOVER_DEFAULTS: Record<string, {
  hoverEffect: 'lift' | 'scale' | 'bounce' | 'push' | 'glow' | 'pulse' | 'shine-sweep';
  hoverShadow: 'subtle' | 'medium' | 'large' | 'glow' | 'colored' | 'sharp-3d' | 'inner-glow';
  insideEffect: 'none' | 'glass-sheen' | 'shine-sweep' | 'fill-slide' | 'neon-border';
}> = {
  solid: { hoverEffect: 'lift', hoverShadow: 'medium', insideEffect: 'shine-sweep' },
  outline: { hoverEffect: 'lift', hoverShadow: 'glow', insideEffect: 'fill-slide' },
  soft: { hoverEffect: 'scale', hoverShadow: 'colored', insideEffect: 'shine-sweep' },
  gradient: { hoverEffect: 'scale', hoverShadow: 'colored', insideEffect: 'shine-sweep' },
  glow: { hoverEffect: 'glow', hoverShadow: 'glow', insideEffect: 'neon-border' },
  pill: { hoverEffect: 'bounce', hoverShadow: 'medium', insideEffect: 'shine-sweep' },
  glass: { hoverEffect: 'lift', hoverShadow: 'large', insideEffect: 'glass-sheen' },
  '3d': { hoverEffect: 'push', hoverShadow: 'sharp-3d', insideEffect: 'none' },
  minimal: { hoverEffect: 'lift', hoverShadow: 'subtle', insideEffect: 'fill-slide' },
  shine: { hoverEffect: 'shine-sweep', hoverShadow: 'large', insideEffect: 'shine-sweep' },
};

export function parseBoxShadow(shadowStr?: string): {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color?: string;
} {
  const fallback = { x: 0, y: 4, blur: 14, spread: 0, color: undefined };
  if (!shadowStr || shadowStr === 'none') return fallback;

  // Extract color (rgba/rgb/hsla/hsl/hex)
  const colorMatch = shadowStr.match(/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]{3,8})/i);
  const color = colorMatch ? colorMatch[0] : undefined;

  // Strip color and inset keyword
  const cleanStr = shadowStr
    .replace(/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]{3,8})/gi, '')
    .replace(/\binset\b/gi, '')
    .trim();

  // Extract numbers
  const numbers = cleanStr.match(/-?\d+(?:\.\d+)?/g);
  if (!numbers || numbers.length < 2) return fallback;

  return {
    x: Math.round(parseFloat(numbers[0]) || 0),
    y: Math.round(parseFloat(numbers[1]) || 0),
    blur: numbers.length > 2 ? Math.round(parseFloat(numbers[2]) || 0) : 0,
    spread: numbers.length > 3 ? Math.round(parseFloat(numbers[3]) || 0) : 0,
    color
  };
}

export const FONT_FAMILIES = [
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
  { label: 'Oswald (Bold Headline)', value: "'Oswald', sans-serif" },
  { label: 'Merriweather (Editorial)', value: "'Merriweather', serif" },
  { label: 'Nunito (Rounded)', value: "'Nunito', sans-serif" },
  { label: 'DM Sans', value: "'DM Sans', sans-serif" },
  { label: 'Syne (Artistic / Display)', value: "'Syne', sans-serif" },
  { label: 'Cormorant Garamond (Luxury Serif)', value: "'Cormorant Garamond', serif" },
  { label: 'Cinzel (Classical)', value: "'Cinzel', serif" },
  { label: 'Work Sans', value: "'Work Sans', sans-serif" },
  { label: 'Bebas Neue (Poster Caps)', value: "'Bebas Neue', sans-serif" },
  { label: 'Fira Code (Developer Mono)', value: "'Fira Code', monospace" },
  { label: 'System UI', value: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }
];

function LinkDestinationPicker({
  value,
  onChange,
  pages,
  sections,
  label = 'Link Destination'
}: {
  value: string;
  onChange: (url: string) => void;
  pages: PageModel[];
  sections: SectionModel[];
  label?: string;
}) {
  const isKnownAnchor = sections.some((s) => `#${s.customId || s.id}` === value);
  const isKnownPage = pages.some((p) => p.slug === value);

  const [mode, setMode] = useState<'page' | 'anchor' | 'custom'>(() => {
    if (isKnownAnchor) return 'anchor';
    if (isKnownPage) return 'page';
    if (value && value !== '#') return 'custom';
    return 'page';
  });

  // Keep active mode tab synchronized when incoming value changes
  React.useEffect(() => {
    if (!value || value === '#') return;
    if (sections.some((s) => `#${s.customId || s.id}` === value)) {
      setMode('anchor');
    } else if (pages.some((p) => p.slug === value)) {
      setMode('page');
    } else {
      setMode('custom');
    }
  }, [value, pages, sections]);

  return (
    <div className="space-y-1.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-slate-700 flex items-center space-x-1">
          <Link2 className="w-3 h-3 text-indigo-600" />
          <span>{label}</span>
        </label>
        <div className="flex items-center space-x-1 text-[10px]">
          <button
            type="button"
            onClick={() => setMode('page')}
            className={`px-2 py-0.5 rounded font-semibold transition-colors ${
              mode === 'page' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Page
          </button>
          <button
            type="button"
            onClick={() => setMode('anchor')}
            className={`px-2 py-0.5 rounded font-semibold transition-colors ${
              mode === 'anchor' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            # Anchor
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`px-2 py-0.5 rounded font-semibold transition-colors ${
              mode === 'custom' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            URL
          </button>
        </div>
      </div>

      {mode === 'page' && (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
        >
          <option value="">-- Select Target Page --</option>
          {pages.map((p) => (
            <option key={p.id} value={p.slug}>
              {p.name} ({p.slug})
            </option>
          ))}
        </select>
      )}

      {mode === 'anchor' && (
        <div className="space-y-1">
          <select
            value={isKnownAnchor ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="">-- Select Section Anchor --</option>
            {sections.map((s) => {
              const anchor = s.customId || s.id;
              return (
                <option key={s.id} value={`#${anchor}`}>
                  #{anchor} &mdash; {s.name || 'Section'}
                </option>
              );
            })}
          </select>
          {!isKnownAnchor && value && value.startsWith('#') && (
            <p className="text-[10px] text-indigo-600 font-mono">
              Custom anchor: <span className="font-bold">{value}</span> (switch to URL tab to edit)
            </p>
          )}
        </div>
      )}

      {mode === 'custom' && (
        <div className="space-y-1">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. #SectionID, https://example.com, /about"
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
          />
          <p className="text-[9px] text-slate-400">
            Anchor link (e.g. <span className="font-mono text-indigo-600 font-semibold">#SectionID</span>) or external URL (https://...)
          </p>
        </div>
      )}
    </div>
  );
}

function NavigationStickyControls({
  selectedElement,
  sections,
  updateElementStyles,
  updateElementContent,
  updateSectionStyles
}: {
  selectedElement: any;
  sections: SectionModel[];
  updateElementStyles: (id: string, styles: any) => void;
  updateElementContent: (id: string, content: any) => void;
  updateSectionStyles: (id: string, styles: any) => void;
}) {
  const isSticky = Boolean(selectedElement.styles?.isSticky ?? selectedElement.content?.isSticky);
  const activeRule = selectedElement.styles?.stickyBehavior || selectedElement.content?.stickyBehavior || 'always';
  const stickyTarget = selectedElement.styles?.stickyTargetSection || selectedElement.content?.stickyTargetSection || '';

  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Pin className="w-3.5 h-3.5 text-indigo-600" />
          <label className="text-xs font-bold text-slate-800">Sticky Navigation</label>
        </div>
        <button
          type="button"
          onClick={() => {
            const nextVal = !isSticky;
            updateElementStyles(selectedElement.id, { isSticky: nextVal });
            updateElementContent(selectedElement.id, { isSticky: nextVal });
            const parentSec = sections.find(s => s.columns?.some(c => c.elements?.some(e => e.id === selectedElement.id)));
            if (parentSec) {
              updateSectionStyles(parentSec.id, { isSticky: nextVal });
            }
          }}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            isSticky ? 'bg-indigo-600' : 'bg-slate-200'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              isSticky ? 'translate-x-4' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <p className="text-[10px] text-slate-500 leading-normal">
        Pins navigation to the top while scrolling across the website with subtle elevation on scroll.
      </p>

      {isSticky && (
        <div className="pt-2 border-t border-slate-200/80 space-y-3 animate-in fade-in duration-150">
          {/* Scroll Visibility Behavior */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 block">
              Scroll Visibility Rule
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'always', label: 'Always Sticky', desc: 'Visible throughout the whole page' },
                { id: 'show-after', label: 'Show After Section', desc: 'Hidden initially, reveals after section' },
                { id: 'hide-after', label: 'Hide After Section', desc: 'Hides once reaching target section' },
                { id: 'hide-inside', label: 'Hide Inside Section', desc: 'Hides while viewing target section' }
              ].map((rule) => (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => {
                    updateElementStyles(selectedElement.id, { stickyBehavior: rule.id as any });
                    updateElementContent(selectedElement.id, { stickyBehavior: rule.id });
                    const parentSec = sections.find(s => s.columns?.some(c => c.elements?.some(e => e.id === selectedElement.id)));
                    if (parentSec) {
                      updateSectionStyles(parentSec.id, { stickyBehavior: rule.id as any });
                    }
                  }}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    activeRule === rule.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-[11px] font-bold">{rule.label}</div>
                  <div className={`text-[9px] mt-0.5 ${activeRule === rule.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {rule.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Section Picker when behavior is not 'always' */}
          {activeRule !== 'always' && (
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                <span>Target Section Threshold</span>
                <span className="text-[10px] text-indigo-600 font-mono">
                  #{stickyTarget || 'None'}
                </span>
              </label>
              <select
                value={stickyTarget}
                onChange={(e) => {
                  updateElementStyles(selectedElement.id, { stickyTargetSection: e.target.value });
                  updateElementContent(selectedElement.id, { stickyTargetSection: e.target.value });
                  const parentSec = sections.find(s => s.columns?.some(c => c.elements?.some(e => e.id === selectedElement.id)));
                  if (parentSec) {
                    updateSectionStyles(parentSec.id, { stickyTargetSection: e.target.value });
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">-- Choose Target Section --</option>
                {sections.map((s, idx) => (
                  <option key={s.id} value={s.customId || s.id}>
                    {idx + 1}. {s.name || 'Section'} {s.customId ? `(#${s.customId})` : `(${s.id.slice(0, 8)})`}
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-slate-400">
                Select the section that triggers the hide/reveal sticky transition.
              </p>
            </div>
          )}

          {/* Sticky Across Website Indicator */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-800 block">Sticky Across Website</span>
              <span className="text-[9px] text-slate-400">Syncs sticky header to every page</span>
            </div>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200">
              Global Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function NavigationLinksManager({
  selectedElement,
  updateElementContent,
  pages,
  sections
}: {
  selectedElement: any;
  updateElementContent: (id: string, content: any) => void;
  pages: PageModel[];
  sections: SectionModel[];
}) {
  const [expandedLinks, setExpandedLinks] = useState<Record<number, boolean>>({});

  const rawLinks: any[] = selectedElement.content?.links || ['Home', 'Features', 'Pricing', 'About'];
  const navLinks: NavLinkItem[] = rawLinks.map((item: any, idx: number) => {
    if (typeof item === 'object' && item !== null) {
      return {
        label: item.label !== undefined ? String(item.label) : (item.text ? String(item.text) : `Link ${idx + 1}`),
        url: item.url !== undefined ? String(item.url) : (item.href ? String(item.href) : ''),
        openInNewTab: Boolean(item.openInNewTab)
      };
    }
    const str = String(item || `Link ${idx + 1}`);
    return {
      label: str,
      url: str.toLowerCase() === 'home' ? '/' : `#${str.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`,
      openInNewTab: false
    };
  });

  const updateLinkProp = (idx: number, prop: keyof NavLinkItem, val: any) => {
    const next = [...navLinks];
    next[idx] = { ...next[idx], [prop]: val };
    updateElementContent(selectedElement.id, { links: next });
  };

  const addLink = () => {
    const next: NavLinkItem[] = [
      ...navLinks,
      { label: `Link ${navLinks.length + 1}`, url: '#', openInNewTab: false }
    ];
    updateElementContent(selectedElement.id, { links: next });
    setExpandedLinks((prev) => ({ ...prev, [navLinks.length]: true }));
  };

  const duplicateLink = (idx: number) => {
    const itemToCopy = navLinks[idx];
    const next = [...navLinks];
    next.splice(idx + 1, 0, {
      ...itemToCopy,
      label: `${itemToCopy.label} (Copy)`
    });
    updateElementContent(selectedElement.id, { links: next });
    setExpandedLinks((prev) => ({ ...prev, [idx + 1]: true }));
  };

  const deleteLink = (idx: number) => {
    if (navLinks.length <= 1) return;
    const next = navLinks.filter((_, i) => i !== idx);
    updateElementContent(selectedElement.id, { links: next });
  };

  const moveLink = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= navLinks.length) return;
    const next = [...navLinks];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    updateElementContent(selectedElement.id, { links: next });
    setExpandedLinks((prev) => {
      const updated = { ...prev };
      const wasCur = updated[idx];
      const wasTarget = updated[targetIdx];
      updated[targetIdx] = wasCur;
      updated[idx] = wasTarget;
      return updated;
    });
  };

  const toggleExpandLink = (idx: number) => {
    setExpandedLinks((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const allExpanded = navLinks.length > 0 && navLinks.every((_, i) => expandedLinks[i]);

  const toggleExpandAll = () => {
    const nextState: Record<number, boolean> = {};
    navLinks.forEach((_, i) => {
      nextState[i] = !allExpanded;
    });
    setExpandedLinks(nextState);
  };

  return (
    <div className="space-y-2">
      {/* Header with Title and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-slate-800 block">Menu Links</label>
          <span className="text-[10px] text-slate-400">Desktop horizontal / mobile drawer</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={toggleExpandAll}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-md text-[10px] font-bold transition-all"
            title={allExpanded ? 'Collapse All Links' : 'Expand All Links'}
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
          <button
            type="button"
            onClick={addLink}
            className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-md text-[11px] font-bold flex items-center space-x-1 transition-all shadow-xs"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* List of Compact Collapsible Links */}
      <div className="space-y-1.5">
        {navLinks.map((item: NavLinkItem, idx: number) => {
          const isExpanded = Boolean(expandedLinks[idx]);

          return (
            <div
              key={idx}
              className={`border rounded-xl transition-all shadow-2xs ${
                isExpanded
                  ? 'bg-slate-50/80 border-indigo-200 ring-1 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Compact Collapsed Row Bar */}
              <div className="flex items-center px-2 py-1.5 space-x-1.5">
                {/* Reorder Up/Down */}
                <div className="flex flex-col space-y-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveLink(idx, 'up')}
                    disabled={idx === 0}
                    className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:hover:text-slate-400"
                    title="Move Up"
                  >
                    <ChevronUp className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLink(idx, 'down')}
                    disabled={idx === navLinks.length - 1}
                    className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:hover:text-slate-400"
                    title="Move Down"
                  >
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Index badge */}
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 w-5 h-5 rounded flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                {/* Link Title & Destination Badge (Click to toggle expand) */}
                <div
                  className="flex-1 flex items-center justify-between min-w-0 cursor-pointer select-none px-1 py-0.5"
                  onClick={() => toggleExpandLink(idx)}
                >
                  <span className="text-xs font-bold text-slate-800 truncate" title={item.label}>
                    {item.label || `Link ${idx + 1}`}
                  </span>
                  <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                    {item.url && (
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200 truncate max-w-[85px]"
                        title={item.url}
                      >
                        {item.url}
                      </span>
                    )}
                    {item.openInNewTab && (
                      <span title="Opens in new tab" className="text-slate-400">
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => duplicateLink(idx)}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-all"
                    title="Duplicate Link"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {navLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteLink(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded transition-all"
                      title="Delete Link"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleExpandLink(idx)}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-all"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Details Body */}
              {isExpanded && (
                <div className="p-2.5 pt-1 border-t border-slate-200/70 space-y-2 animate-in fade-in duration-150">
                  {/* Link Label Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                      Link Label
                    </label>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateLinkProp(idx, 'label', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Features"
                    />
                  </div>

                  {/* Destination Picker */}
                  <LinkDestinationPicker
                    key={`dest-${idx}`}
                    value={item.url || ''}
                    onChange={(url) => updateLinkProp(idx, 'url', url)}
                    pages={pages}
                    sections={sections}
                    label="Target Destination"
                  />

                  {/* Open in New Tab & Pill */}
                  <div className="flex items-center justify-between px-0.5 pt-1 border-t border-slate-200/60">
                    <label className="text-[10px] font-medium text-slate-600 flex items-center space-x-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(item.openInNewTab)}
                        onChange={(e) => updateLinkProp(idx, 'openInNewTab', e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3 cursor-pointer"
                      />
                      <span>Open in new tab</span>
                    </label>
                    {item.url && (
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 truncate max-w-[130px]"
                        title={item.url}
                      >
                        Target: {item.url}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavigationArrowsAndDotsControls({
  selectedElement,
  updateElementContent,
  updateElementStyles
}: {
  selectedElement: any;
  updateElementContent: (id: string, content: any) => void;
  updateElementStyles: (id: string, styles: any) => void;
}) {
  // Free Position coordinates fallback calculations
  const getArrowDefaultCoords = () => {
    const pl = selectedElement.content?.arrowPlacement || 'sides';
    if (pl === 'top-left') return { x: 8, y: 8 };
    if (pl === 'top-right') return { x: 92, y: 8 };
    if (pl === 'top-center') return { x: 50, y: 8 };
    if (pl === 'bottom-left') return { x: 8, y: 92 };
    if (pl === 'bottom-right') return { x: 92, y: 92 };
    if (pl === 'bottom-center') return { x: 50, y: 92 };
    if (pl === 'sides') return { x: 3, y: 50 };
    return { x: 50, y: 50 };
  };

  const defaultArrowCoords = getArrowDefaultCoords();
  const rawArrowCustomX = selectedElement.content?.arrowCustomX !== undefined
    ? selectedElement.content.arrowCustomX
    : selectedElement.styles?.arrowCustomX;
  const arrowCustomX = rawArrowCustomX !== undefined ? Number(rawArrowCustomX) : defaultArrowCoords.x;

  const rawArrowCustomY = selectedElement.content?.arrowCustomY !== undefined
    ? selectedElement.content.arrowCustomY
    : selectedElement.styles?.arrowCustomY;
  const arrowCustomY = rawArrowCustomY !== undefined ? Number(rawArrowCustomY) : defaultArrowCoords.y;

  const getDotsDefaultCoords = () => {
    const pl = selectedElement.content?.dotsPlacement || 'bottom-center';
    if (pl === 'top-left') return { x: 8, y: 8 };
    if (pl === 'top-right') return { x: 92, y: 8 };
    if (pl === 'top-center') return { x: 50, y: 8 };
    if (pl === 'bottom-left') return { x: 8, y: 92 };
    if (pl === 'bottom-right') return { x: 92, y: 92 };
    if (pl === 'bottom-center') return { x: 50, y: 92 };
    return { x: 50, y: 92 };
  };

  const defaultDotsCoords = getDotsDefaultCoords();
  const rawDotsCustomX = selectedElement.content?.dotsCustomX !== undefined
    ? selectedElement.content.dotsCustomX
    : selectedElement.styles?.dotsCustomX;
  const dotsCustomX = rawDotsCustomX !== undefined ? Number(rawDotsCustomX) : defaultDotsCoords.x;

  const rawDotsCustomY = selectedElement.content?.dotsCustomY !== undefined
    ? selectedElement.content.dotsCustomY
    : selectedElement.styles?.dotsCustomY;
  const dotsCustomY = rawDotsCustomY !== undefined ? Number(rawDotsCustomY) : defaultDotsCoords.y;

  return (
    <div className="space-y-3 pt-1 border-t border-slate-200/70">
      {/* Navigation Arrows Toggle */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-bold text-slate-800 block">Navigation Arrows</span>
          <span className="text-[10px] text-slate-400">Next and previous slide buttons</span>
        </div>
        <button
          type="button"
          onClick={() =>
            updateElementContent(selectedElement.id, {
              showArrows: selectedElement.content?.showArrows === false ? true : false
            })
          }
          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
            selectedElement.content?.showArrows !== false
              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
              : 'bg-slate-200 text-slate-600 border-slate-300'
          }`}
        >
          {selectedElement.content?.showArrows !== false ? 'Show Arrows' : 'Hide Arrows'}
        </button>
      </div>

      {/* Navigation Arrow Style & Placement (Expanded when showArrows !== false) */}
      {selectedElement.content?.showArrows !== false && (
        <div className="p-3 bg-white border border-indigo-100 rounded-xl space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[11px] font-bold text-slate-800 flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Arrow Placement & Style</span>
            </span>
            <span className="text-[10px] font-mono text-indigo-600 font-semibold uppercase">
              {selectedElement.content?.arrowPlacement || 'sides'}
            </span>
          </div>

          {/* Arrow Placement */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Arrow Placement
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'sides', label: 'Inside Sides', desc: 'Left & Right edges' },
                { id: 'outside', label: 'Outside Sides', desc: 'Floating outside' },
                { id: 'top-right', label: 'Top Right', desc: 'Header top corner' },
                { id: 'top-left', label: 'Top Left', desc: 'Header top corner' },
                { id: 'bottom-right', label: 'Bottom Right', desc: 'Bottom corner' },
                { id: 'bottom-left', label: 'Bottom Left', desc: 'Bottom corner' },
                { id: 'bottom-center', label: 'Bottom Center', desc: 'Centered bottom' },
                { id: 'custom', label: 'Custom (Free)', desc: 'X & Y Sliders anywhere' }
              ].map((pos) => {
                const isSel = (selectedElement.content?.arrowPlacement || 'sides') === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => {
                      const coords: Record<string, { x: number; y: number }> = {
                        'sides': { x: 3, y: 50 },
                        'outside': { x: 0, y: 50 },
                        'top-right': { x: 92, y: 8 },
                        'top-left': { x: 8, y: 8 },
                        'bottom-right': { x: 92, y: 92 },
                        'bottom-left': { x: 8, y: 92 },
                        'bottom-center': { x: 50, y: 92 },
                        'custom': { x: arrowCustomX, y: arrowCustomY }
                      };
                      const target = coords[pos.id] || { x: 50, y: 50 };
                      updateElementContent(selectedElement.id, {
                        arrowPlacement: pos.id,
                        arrowCustomX: target.x,
                        arrowCustomY: target.y
                      });
                    }}
                    className={`p-2 text-left rounded-lg border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-2xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[11px] font-bold block">{pos.label}</span>
                    <span className="text-[9px] text-slate-400 block">{pos.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Arrow Free Placement (Horizontal & Vertical Sliders) */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Move className="w-3 h-3 text-indigo-600" />
                <span>Arrow Free Placement (X & Y)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  updateElementContent(selectedElement.id, {
                    arrowPlacement: 'custom',
                    arrowCustomX: 50,
                    arrowCustomY: 50
                  });
                }}
                className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Center (50/50)
              </button>
            </div>

            {/* Horizontal (X-Axis) Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-slate-600">Horizontal Position (X)</span>
                <span className="font-mono font-bold text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {arrowCustomX}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={arrowCustomX}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  updateElementContent(selectedElement.id, {
                    arrowPlacement: selectedElement.content?.arrowPlacement === 'sides' ? 'sides' : 'custom',
                    arrowCustomX: val
                  });
                }}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: 'Left (8%)', val: 8 },
                  { label: 'Center (50%)', val: 50 },
                  { label: 'Right (92%)', val: 92 }
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => {
                      updateElementContent(selectedElement.id, {
                        arrowPlacement: selectedElement.content?.arrowPlacement === 'sides' ? 'sides' : 'custom',
                        arrowCustomX: p.val
                      });
                    }}
                    className={`py-0.5 text-[9px] font-bold rounded border transition-all cursor-pointer ${
                      Math.abs(arrowCustomX - p.val) < 2
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical (Y-Axis) Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-slate-600">Vertical Position (Y)</span>
                <span className="font-mono font-bold text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {arrowCustomY}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={arrowCustomY}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  updateElementContent(selectedElement.id, {
                    arrowPlacement: selectedElement.content?.arrowPlacement === 'sides' ? 'sides' : 'custom',
                    arrowCustomY: val
                  });
                }}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: 'Top (8%)', val: 8 },
                  { label: 'Middle (50%)', val: 50 },
                  { label: 'Bottom (92%)', val: 92 }
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => {
                      updateElementContent(selectedElement.id, {
                        arrowPlacement: selectedElement.content?.arrowPlacement === 'sides' ? 'sides' : 'custom',
                        arrowCustomY: p.val
                      });
                    }}
                    className={`py-0.5 text-[9px] font-bold rounded border transition-all cursor-pointer ${
                      Math.abs(arrowCustomY - p.val) < 2
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Arrow Orientation (Row vs Column) */}
            {selectedElement.content?.arrowPlacement !== 'sides' && (
              <div className="space-y-1 pt-1 border-t border-slate-200">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-slate-600">Arrow Layout</span>
                  <span className="font-semibold text-indigo-600 uppercase">
                    {selectedElement.content?.arrowOrientation || 'horizontal'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'horizontal', label: 'Horizontal (← →)' },
                    { id: 'vertical', label: 'Vertical (↑ ↓)' }
                  ].map((or) => {
                    const isSel = (selectedElement.content?.arrowOrientation || 'horizontal') === or.id;
                    return (
                      <button
                        key={or.id}
                        type="button"
                        onClick={() => updateElementContent(selectedElement.id, { arrowOrientation: or.id })}
                        className={`py-1 text-[9px] font-bold rounded border transition-all cursor-pointer ${
                          isSel
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {or.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Arrow Gap (Spacing between buttons) */}
            {selectedElement.content?.arrowPlacement !== 'sides' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-slate-600">Arrow Spacing Gap</span>
                  <span className="font-mono font-bold text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {selectedElement.content?.arrowGap !== undefined ? selectedElement.content.arrowGap : 8}px
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  step="2"
                  value={selectedElement.content?.arrowGap !== undefined ? selectedElement.content.arrowGap : 8}
                  onChange={(e) => updateElementContent(selectedElement.id, { arrowGap: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Arrow Shape / Style */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Arrow Style & Shape
            </label>
            <div className="grid grid-cols-5 gap-1">
              {[
                { id: 'circle', label: 'Circle' },
                { id: 'rounded', label: 'Round' },
                { id: 'square', label: 'Square' },
                { id: 'glass', label: 'Glass' },
                { id: 'ghost', label: 'Ghost' }
              ].map((sh) => {
                const isSel = (selectedElement.content?.arrowShape || 'circle') === sh.id;
                return (
                  <button
                    key={sh.id}
                    type="button"
                    onClick={() => updateElementContent(selectedElement.id, { arrowShape: sh.id })}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sh.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Arrow Size */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Arrow Size
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'sm', label: 'SM (28px)' },
                { id: 'md', label: 'MD (36px)' },
                { id: 'lg', label: 'LG (44px)' },
                { id: 'xl', label: 'XL (52px)' }
              ].map((sz) => {
                const isSel = (selectedElement.content?.arrowSize || 'md') === sz.id;
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => updateElementContent(selectedElement.id, { arrowSize: sz.id })}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sz.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Arrow Icon Type */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Arrow Icon Type
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'chevron', label: 'Chevron ‹ ›' },
                { id: 'arrow', label: 'Arrow ← →' },
                { id: 'long', label: 'Long ⟵ ⟶' }
              ].map((ic) => {
                const isSel = (selectedElement.content?.arrowIcon || 'chevron') === ic.id;
                return (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => updateElementContent(selectedElement.id, { arrowIcon: ic.id })}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {ic.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hover Only vs Always Visible */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-semibold text-slate-700">Show On Hover Only</span>
            <button
              type="button"
              onClick={() => updateElementContent(selectedElement.id, { arrowHoverOnly: !selectedElement.content?.arrowHoverOnly })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                selectedElement.content?.arrowHoverOnly
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {selectedElement.content?.arrowHoverOnly ? 'On Hover' : 'Always Visible'}
            </button>
          </div>

          {/* Navigation Arrow Opacity */}
          <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-slate-700 uppercase tracking-wider">
                Arrow Opacity
              </span>
              <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                {Math.round((Number(selectedElement.content?.arrowOpacity ?? selectedElement.styles?.arrowOpacity ?? 1)) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={selectedElement.content?.arrowOpacity ?? selectedElement.styles?.arrowOpacity ?? 1}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updateElementContent(selectedElement.id, { arrowOpacity: val });
                updateElementStyles(selectedElement.id, { arrowOpacity: val });
              }}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="grid grid-cols-5 gap-1">
              {[1, 0.8, 0.6, 0.4, 0.2].map((op) => {
                const cur = Number(selectedElement.content?.arrowOpacity ?? selectedElement.styles?.arrowOpacity ?? 1);
                const isSel = Math.abs(cur - op) < 0.05;
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      updateElementContent(selectedElement.id, { arrowOpacity: op });
                      updateElementStyles(selectedElement.id, { arrowOpacity: op });
                    }}
                    className={`py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {Math.round(op * 100)}%
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pagination Dots Toggle */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-bold text-slate-800 block">Pagination Indicators</span>
          <span className="text-[10px] text-slate-400">Clickable slide dots at bottom</span>
        </div>
        <button
          type="button"
          onClick={() =>
            updateElementContent(selectedElement.id, {
              showDots: selectedElement.content?.showDots === false ? true : false
            })
          }
          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
            selectedElement.content?.showDots !== false
              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
              : 'bg-slate-200 text-slate-600 border-slate-300'
          }`}
        >
          {selectedElement.content?.showDots !== false ? 'Show Dots' : 'Hide Dots'}
        </button>
      </div>

      {/* Navigation Dots Style & Placement (Expanded when showDots !== false) */}
      {selectedElement.content?.showDots !== false && (
        <div className="p-3 bg-white border border-indigo-100 rounded-xl space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[11px] font-bold text-slate-800 flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Navigation Dots Options</span>
            </span>
            <span className="text-[10px] font-mono text-indigo-600 font-semibold uppercase">
              {selectedElement.content?.dotsPlacement || 'bottom-center'}
            </span>
          </div>

          {/* Dots Placement */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Dots Placement
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'bottom-center', label: 'Bottom Center' },
                { id: 'bottom-left', label: 'Bottom Left' },
                { id: 'bottom-right', label: 'Bottom Right' },
                { id: 'top-center', label: 'Top Center' },
                { id: 'top-left', label: 'Top Left' },
                { id: 'top-right', label: 'Top Right' },
                { id: 'custom', label: 'Custom (Free X/Y)' }
              ].map((pos) => {
                const isSel = (selectedElement.content?.dotsPlacement || 'bottom-center') === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => {
                      const coords: Record<string, { x: number; y: number }> = {
                        'bottom-center': { x: 50, y: 92 },
                        'bottom-left': { x: 8, y: 92 },
                        'bottom-right': { x: 92, y: 92 },
                        'top-center': { x: 50, y: 8 },
                        'top-left': { x: 8, y: 8 },
                        'top-right': { x: 92, y: 8 },
                        'custom': { x: dotsCustomX, y: dotsCustomY }
                      };
                      const target = coords[pos.id] || { x: 50, y: 92 };
                      updateElementContent(selectedElement.id, {
                        dotsPlacement: pos.id,
                        dotsCustomX: target.x,
                        dotsCustomY: target.y
                      });
                    }}
                    className={`py-1.5 px-1.5 text-center text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                    } ${pos.id === 'custom' ? 'col-span-3' : ''}`}
                  >
                    {pos.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dots Free Placement (Horizontal & Vertical Sliders) */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Move className="w-3 h-3 text-indigo-600" />
                <span>Dots Free Placement (X & Y)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  updateElementContent(selectedElement.id, {
                    dotsPlacement: 'custom',
                    dotsCustomX: 50,
                    dotsCustomY: 92
                  });
                }}
                className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Reset Bottom (50/92)
              </button>
            </div>

            {/* Horizontal (X-Axis) Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-slate-600">Horizontal Position (X)</span>
                <span className="font-mono font-bold text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {dotsCustomX}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={dotsCustomX}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  updateElementContent(selectedElement.id, {
                    dotsPlacement: 'custom',
                    dotsCustomX: val
                  });
                }}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: 'Left (8%)', val: 8 },
                  { label: 'Center (50%)', val: 50 },
                  { label: 'Right (92%)', val: 92 }
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => {
                      updateElementContent(selectedElement.id, {
                        dotsPlacement: 'custom',
                        dotsCustomX: p.val
                      });
                    }}
                    className={`py-0.5 text-[9px] font-bold rounded border transition-all cursor-pointer ${
                      Math.abs(dotsCustomX - p.val) < 2
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical (Y-Axis) Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-slate-600">Vertical Position (Y)</span>
                <span className="font-mono font-bold text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {dotsCustomY}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={dotsCustomY}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  updateElementContent(selectedElement.id, {
                    dotsPlacement: 'custom',
                    dotsCustomY: val
                  });
                }}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: 'Top (8%)', val: 8 },
                  { label: 'Middle (50%)', val: 50 },
                  { label: 'Bottom (92%)', val: 92 }
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => {
                      updateElementContent(selectedElement.id, {
                        dotsPlacement: 'custom',
                        dotsCustomY: p.val
                      });
                    }}
                    className={`py-0.5 text-[9px] font-bold rounded border transition-all cursor-pointer ${
                      Math.abs(dotsCustomY - p.val) < 2
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dots Orientation (Row vs Stacked Column) */}
            <div className="space-y-1 pt-1 border-t border-slate-200">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-slate-600">Dots Orientation</span>
                <span className="font-semibold text-indigo-600 uppercase">
                  {selectedElement.content?.dotsOrientation || 'horizontal'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { id: 'horizontal', label: 'Horizontal Row (···)' },
                  { id: 'vertical', label: 'Vertical Stack (⋮)' }
                ].map((or) => {
                  const isSel = (selectedElement.content?.dotsOrientation || 'horizontal') === or.id;
                  return (
                    <button
                      key={or.id}
                      type="button"
                      onClick={() => updateElementContent(selectedElement.id, { dotsOrientation: or.id })}
                      className={`py-1 text-[9px] font-bold rounded border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {or.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dots Shape & Style */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Dots Style & Shape
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'dots', label: 'Expanding Pill', desc: 'Active expands' },
                { id: 'pills', label: 'Pill Bars', desc: 'Wide capsule' },
                { id: 'lines', label: 'Progress Lines', desc: 'Minimal bars' },
                { id: 'circles', label: 'Round Dots', desc: 'Equal circles' },
                { id: 'squares', label: 'Square Tabs', desc: 'Block shape' },
                { id: 'numbers', label: 'Numbered', desc: '1, 2, 3 digits' }
              ].map((sh) => {
                const isSel = (selectedElement.content?.dotsShape || 'dots') === sh.id;
                return (
                  <button
                    key={sh.id}
                    type="button"
                    onClick={() => updateElementContent(selectedElement.id, { dotsShape: sh.id })}
                    className={`p-1.5 text-left rounded-lg border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] font-bold block">{sh.label}</span>
                    <span className={`text-[8px] block ${isSel ? 'text-indigo-200' : 'text-slate-400'}`}>{sh.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dots Size */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Dots Size
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'sm', label: 'SM (Compact)' },
                { id: 'md', label: 'MD (Default)' },
                { id: 'lg', label: 'LG (Large)' }
              ].map((sz) => {
                const isSel = (selectedElement.content?.dotsSize || 'md') === sz.id;
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => updateElementContent(selectedElement.id, { dotsSize: sz.id })}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sz.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dots Container Backdrop */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Dots Container Backdrop
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'pill', label: 'Dark Blur Pill' },
                { id: 'transparent', label: 'None (Float)' },
                { id: 'glass', label: 'Glass Frost' }
              ].map((bd) => {
                const isSel = (selectedElement.content?.dotsBackdrop || 'pill') === bd.id;
                return (
                  <button
                    key={bd.id}
                    type="button"
                    onClick={() => updateElementContent(selectedElement.id, { dotsBackdrop: bd.id })}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {bd.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dots Opacity */}
          <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-slate-700 uppercase tracking-wider">
                Dots Opacity
              </span>
              <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                {Math.round((Number(selectedElement.content?.dotsOpacity ?? selectedElement.styles?.dotsOpacity ?? 1)) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={selectedElement.content?.dotsOpacity ?? selectedElement.styles?.dotsOpacity ?? 1}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updateElementContent(selectedElement.id, { dotsOpacity: val });
                updateElementStyles(selectedElement.id, { dotsOpacity: val });
              }}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="grid grid-cols-5 gap-1">
              {[1, 0.8, 0.6, 0.4, 0.2].map((op) => {
                const cur = Number(selectedElement.content?.dotsOpacity ?? selectedElement.styles?.dotsOpacity ?? 1);
                const isSel = Math.abs(cur - op) < 0.05;
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      updateElementContent(selectedElement.id, { dotsOpacity: op });
                      updateElementStyles(selectedElement.id, { dotsOpacity: op });
                    }}
                    className={`py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {Math.round(op * 100)}%
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Slide Numbers Badge Toggle */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-bold text-slate-800 block">Slider Numbers</span>
          <span className="text-[10px] text-slate-400">Counter badge at top right (e.g. 1 / 3)</span>
        </div>
        <button
          type="button"
          onClick={() =>
            updateElementContent(selectedElement.id, {
              showSlideNumbers: selectedElement.content?.showSlideNumbers === false ? true : false
            })
          }
          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
            selectedElement.content?.showSlideNumbers !== false
              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
              : 'bg-slate-200 text-slate-600 border-slate-300'
          }`}
        >
          {selectedElement.content?.showSlideNumbers !== false ? 'Show Numbers' : 'Hide Numbers'}
        </button>
      </div>
    </div>
  );
}

const SLIDE_EFFECT_OPTIONS = [
  { id: 'slide-horizontal', label: 'Slide Horizontal', desc: 'Smooth horizontal glide', icon: MoveRight },
  { id: 'slide-vertical', label: 'Slide Vertical', desc: 'Vertical upward glide', icon: ChevronUp },
  { id: 'fade', label: 'Crossfade', desc: 'Gentle opacity blend', icon: Sparkles },
  { id: 'zoom-in', label: 'Zoom In', desc: 'Scale up from center', icon: Maximize2 },
  { id: 'zoom-out', label: 'Zoom Out', desc: 'Scale down to fit', icon: Minimize2 },
  { id: 'flip-horizontal', label: '3D Flip (H)', desc: 'Card flip horizontally', icon: Layers },
  { id: 'flip-vertical', label: '3D Flip (V)', desc: 'Card flip vertically', icon: Layers },
  { id: 'blur-fade', label: 'Cinematic Blur', desc: 'Focus in from blur', icon: Eye },
  { id: 'rotate-fade', label: 'Spin & Tilt', desc: 'Subtle twist & scale', icon: Compass },
  { id: 'ken-burns', label: 'Ken Burns', desc: 'Continuous slow drift', icon: ImageIcon },
  { id: 'bounce', label: 'Elastic Bounce', desc: 'Spring overshoot pop', icon: Zap },
  { id: 'curtain', label: 'Curtain Reveal', desc: 'Split shutter wipe', icon: SplitSquareVertical },
  { id: 'swing', label: '3D Swing Drop', desc: 'Pivoted hinge drop', icon: Box },
  { id: 'slide-fade', label: 'Drift & Fade', desc: 'Soft floating entrance', icon: ArrowRight },
];

function SlideEffectControls({
  selectedElement,
  updateElementContent
}: {
  selectedElement: any;
  updateElementContent: (id: string, content: any) => void;
}) {
  const currentEffect = selectedElement.content?.slideEffect || 'slide-horizontal';
  const currentDuration = selectedElement.content?.slideDuration !== undefined ? Number(selectedElement.content.slideDuration) : 500;

  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-[11px] font-bold text-slate-800 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Slide Transition Effect</span>
          </label>
          <span className="text-[10px] text-slate-400">14 animated styles for smooth transitions</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
          {SLIDE_EFFECT_OPTIONS.find((o) => o.id === currentEffect)?.label || 'Slide Horizontal'}
        </span>
      </div>

      {/* Grid of Slide Effects */}
      <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1 nextforge-scrollbar">
        {SLIDE_EFFECT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = currentEffect === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => updateElementContent(selectedElement.id, { slideEffect: opt.id })}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-400/40'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1">
                <div className={`p-1 rounded-md shrink-0 ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-indigo-600'}`}>
                  <Icon className="w-3 h-3" />
                </div>
                <span className="text-[11px] font-bold leading-tight truncate">{opt.label}</span>
              </div>
              <span className={`text-[9px] leading-tight line-clamp-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Animation Duration / Speed Settings */}
      <div className="pt-2 border-t border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Animation Speed / Duration</label>
          <span className="text-[10px] font-mono font-bold text-indigo-600">{currentDuration}ms</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[
            { label: 'Fast', ms: 300 },
            { label: 'Normal', ms: 500 },
            { label: 'Smooth', ms: 700 },
            { label: 'Cinematic', ms: 1000 },
          ].map((spd) => (
            <button
              key={spd.ms}
              type="button"
              onClick={() => updateElementContent(selectedElement.id, { slideDuration: spd.ms })}
              className={`py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                currentDuration === spd.ms
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              {spd.label} ({spd.ms}ms)
            </button>
          ))}
        </div>
        <input
          type="range"
          min="150"
          max="1500"
          step="50"
          value={currentDuration}
          onChange={(e) => updateElementContent(selectedElement.id, { slideDuration: Number(e.target.value) })}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
      </div>
    </div>
  );
}

export default function RightInspector() {
  const {
    sections,
    pages,
    currentPageId,
    selectedElementId,
    selectedSectionId,
    selectedRowId,
    setSelectedRowId,
    selectedColumnId,
    setSelectedColumnId,
    updateSectionStyles,
    updateRowStyles,
    updateColumnStyles,
    addRowToSection,
    deleteRowFromSection,
    duplicateRowInSection,
    updateElementContent,
    updateElementStyles,
    deleteElement,
    duplicateElement,
    updateColumnWidth,
    deleteColumn,
    addColumn,
    duplicateColumn,
    deleteSection,
    renameSection,
    duplicateSection,
    applyLayoutPresetToSection,
    setSectionCustomId,
    makeSectionDynamic,
    detachDynamicSection,
    copySection,
    updateInnerRowLayout,
    updateInnerColumnWidth,
    updateInnerColumnStyles,
    selectedInnerColumnId,
    setSelectedInnerColumnId,
    addInnerColumn,
    deleteInnerColumn,
    duplicateInnerColumn
  } = useBuilderStore();

  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');
  const [isWideInspector, setIsWideInspector] = useState(false);
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);
  const [dragOverFieldIndex, setDragOverFieldIndex] = useState<number | null>(null);
  const [draggedAccIndex, setDraggedAccIndex] = useState<number | null>(null);
  const [dragOverAccIndex, setDragOverAccIndex] = useState<number | null>(null);
  const [draggedTabIndex, setDraggedTabIndex] = useState<number | null>(null);
  const [dragOverTabIndex, setDragOverTabIndex] = useState<number | null>(null);
  const [draggedPricingIndex, setDraggedPricingIndex] = useState<number | null>(null);
  const [dragOverPricingIndex, setDragOverPricingIndex] = useState<number | null>(null);
  const [expandedImageBoxSections, setExpandedImageBoxSections] = useState<Record<number, boolean>>({ 0: true });
  const [expandedGallerySlides, setExpandedGallerySlides] = useState<Record<number, boolean>>({ 0: true });
  const [expandedFormFields, setExpandedFormFields] = useState<Record<number, boolean>>({ 0: true });
  const [iconStyleSubTab, setIconStyleSubTab] = useState<'icon' | 'heading' | 'description' | 'card'>('icon');
  const [iconContentSubTab, setIconContentSubTab] = useState<'icon' | 'heading' | 'description'>('icon');
  const [showCustomTextShadow, setShowCustomTextShadow] = useState(false);
  const [textShadowX, setTextShadowX] = useState(0);
  const [textShadowY, setTextShadowY] = useState(2);
  const [textShadowBlur, setTextShadowBlur] = useState(4);
  const [textShadowColor, setTextShadowColor] = useState('#000000');
  const [showCustomBoxShadow, setShowCustomBoxShadow] = useState(false);
  const [boxShadowX, setBoxShadowX] = useState(0);
  const [boxShadowY, setBoxShadowY] = useState(10);
  const [boxShadowBlur, setBoxShadowBlur] = useState(25);
  const [boxShadowSpread, setBoxShadowSpread] = useState(-5);
  const [videoSourceTab, setVideoSourceTab] = useState<'url' | 'upload'>('url');
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [marqueeBulkUrlsOpen, setMarqueeBulkUrlsOpen] = useState(false);
  const [marqueeBulkUrlsText, setMarqueeBulkUrlsText] = useState('');
  const [marqueeExpandedLogos, setMarqueeExpandedLogos] = useState<Record<number, boolean>>({});
  const marqueeBulkFileInputRef = useRef<HTMLInputElement>(null);

  // Collapsible Accordion States for Settings Sections (Inspector Cards)
  // Minimal icon-based chrome: every group starts COLLAPSED except the
  // FIRST group of each tab (per element/section type, groups render
  // conditionally, so each type's first group is flagged open here).
  const [openSettingCards, setOpenSettingCards] = useState<Record<string, boolean>>({
    // Section — Layout tab (first per target scope)
    sec_presets: true,
    sec_row_layout: true,
    sec_col_layout: true,
    sec_rows: false,
    sec_cols: false,
    sec_spacing: false,
    sec_padding: false,
    sec_margin: false,
    sec_valign: false,
    // Section — Styling tab (first: background type)
    sec_bg_type: true,
    sec_bg_solid: false,
    sec_bg_grad: false,
    sec_bg_img: false,
    sec_radius: false,
    sec_border: false,
    sec_shadow: false,
    sec_hover: false,
    // Section — Advanced tab (first: section properties)
    sec_props: true,
    row_props: false,
    sec_responsive: false,
    // Element Styling Cards (first per element type)
    el_form_theme: true,
    el_table_themes: true,
    el_button_presets: true,
    el_typography: true,
    el_accordion: true,
    el_form_fields: false,
    el_form_button: false,
    el_table_header: false,
    el_table_style: false,
    el_button_colors: false,
    el_button_border: false,
    el_button_hover: false,
    el_colors: false,
    el_border: false,
    el_shadow: false,
    el_caption: false,
    el_opacity: false
  });

  const toggleSettingCard = (cardKey: string) => {
    setOpenSettingCards((prev) => ({
      ...prev,
      [cardKey]: prev[cardKey] === false ? true : false
    }));
  };

  const setAllCardsState = (isOpen: boolean) => {
    setOpenSettingCards({
      sec_props: isOpen,
      sec_rows: isOpen,
      sec_row_layout: isOpen,
      sec_cols: isOpen,
      sec_col_layout: isOpen,
      sec_spacing: isOpen,
      sec_padding: isOpen,
      sec_margin: isOpen,
      sec_presets: isOpen,
      sec_valign: isOpen,
      sec_bg_type: isOpen,
      sec_bg_solid: isOpen,
      sec_bg_grad: isOpen,
      sec_bg_img: isOpen,
      sec_radius: isOpen,
      sec_border: isOpen,
      sec_shadow: isOpen,
      sec_hover: isOpen,
      row_props: isOpen,
      sec_responsive: isOpen,
      el_form_theme: isOpen,
      el_form_fields: isOpen,
      el_form_button: isOpen,
      el_typography: isOpen,
      el_colors: isOpen,
      el_border: isOpen,
      el_shadow: isOpen,
      el_accordion: isOpen,
      el_table_themes: isOpen,
      el_table_header: isOpen,
      el_table_style: isOpen,
      el_button_presets: isOpen,
      el_button_colors: isOpen,
      el_button_border: isOpen,
      el_button_hover: isOpen,
      el_caption: isOpen,
      el_opacity: isOpen
    });
  };

  const setAllElementStyleCards = (isOpen: boolean) => {
    setOpenSettingCards((prev) => ({
      ...prev,
      el_form_theme: isOpen,
      el_form_fields: isOpen,
      el_form_button: isOpen,
      el_typography: isOpen,
      el_colors: isOpen,
      el_border: isOpen,
      el_shadow: isOpen,
      el_accordion: isOpen,
      el_table_themes: isOpen,
      el_table_header: isOpen,
      el_table_style: isOpen,
      el_button_presets: isOpen,
      el_button_colors: isOpen,
      el_button_border: isOpen,
      el_button_hover: isOpen,
      el_caption: isOpen,
      el_opacity: isOpen
    }));
  };

  // Robust CSV parser function for Table Element
  const parseCsvData = (csvString: string): { headers: string[]; rows: string[][] } | null => {
    if (!csvString || !csvString.trim()) return null;
    const parsedRows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < csvString.length; i++) {
      const char = csvString[i];
      const nextChar = csvString[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // Skip escaped double quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          parsedRows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    // Append last cell & row
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      parsedRows.push(currentRow);
    }

    if (parsedRows.length === 0) return null;

    const headers = parsedRows[0];
    const dataRows = parsedRows.slice(1);

    // Normalize each row length to match header column count
    const normalizedRows = dataRows.map((r) => {
      const newRow = [...r];
      while (newRow.length < headers.length) {
        newRow.push('');
      }
      return newRow.slice(0, headers.length);
    });

    return {
      headers,
      rows: normalizedRows.length > 0 ? normalizedRows : [Array(headers.length).fill('')]
    };
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const sectionBgFileInputRef = useRef<HTMLInputElement>(null);
  const beforeImageInputRef = useRef<HTMLInputElement>(null);
  const afterImageInputRef = useRef<HTMLInputElement>(null);
  const tableCsvFileInputRef = useRef<HTMLInputElement>(null);
  const [showTableCsvModal, setShowTableCsvModal] = useState(false);
  const [tableCsvPasteText, setTableCsvPasteText] = useState('');
  const [tableCsvFeedback, setTableCsvFeedback] = useState<string | null>(null);
  const [collapsedTableRows, setCollapsedTableRows] = useState<Record<number, boolean>>({});
  const [sectionTab, setSectionTab] = useState<'layout' | 'styling' | 'advanced'>('layout');
  const [targetScope, setTargetScope] = useState<'section' | 'row' | 'column'>('section');
  const [bgMode, setBgMode] = useState<'color' | 'gradient' | 'image'>('color');

  React.useEffect(() => {
    if (selectedColumnId) {
      setTargetScope('column');
    } else if (selectedRowId) {
      setTargetScope('row');
    } else if (selectedSectionId) {
      setTargetScope('section');
    }
  }, [selectedColumnId, selectedRowId, selectedSectionId]);

  // Find target element across sections, rows, columns, and nested inner columns
  let selectedElement: any = null;
  let targetSecId: string | null = null;
  let targetColId: string | null = null;

  if (selectedElementId) {
    const scanElements = (elements: any[], secId: string, colId: string): boolean => {
      if (!Array.isArray(elements)) return false;
      for (const el of elements) {
        if (!el) continue;
        if (el.id === selectedElementId) {
          selectedElement = el;
          targetSecId = secId;
          targetColId = colId;
          return true;
        }
        if (el.type === 'innerrow') {
          const innerCols = el.content?.columns || el.content?.innerColumns || [];
          for (const innerCol of innerCols) {
            if (scanElements(innerCol?.elements || [], secId, innerCol?.id || colId)) {
              return true;
            }
          }
        }
      }
      return false;
    };

    for (const sec of sections) {
      if (sec.rows && sec.rows.length > 0) {
        for (const r of sec.rows) {
          for (const c of r.columns || []) {
            if (scanElements(c?.elements || [], sec.id, c?.id)) break;
          }
          if (selectedElement) break;
        }
      }
      if (!selectedElement && sec.columns && sec.columns.length > 0) {
        for (const c of sec.columns) {
          if (scanElements(c?.elements || [], sec.id, c?.id)) break;
        }
      }
      if (selectedElement) break;
    }
  }

  // Synchronize custom shadow sliders when active element or its shadow changes
  React.useEffect(() => {
    if (!selectedElement?.styles?.shadow || selectedElement.styles.shadow === 'none') return;
    const parsed = parseBoxShadow(selectedElement.styles.shadow);
    setBoxShadowX(parsed.x);
    setBoxShadowY(parsed.y);
    setBoxShadowBlur(parsed.blur);
    setBoxShadowSpread(parsed.spread);
  }, [selectedElement?.id, selectedElement?.styles?.shadow]);

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  if (!selectedElement && !selectedSection) {
    return (
      <aside className={`${isWideInspector ? 'w-[440px]' : 'w-96'} bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center text-center text-slate-400 select-none z-30 shadow-xs shrink-0 transition-all duration-200`}>
        <Sliders className="w-10 h-10 mb-3 text-indigo-400 opacity-40" />
        <h4 className="text-xs font-bold text-slate-700">Inspector</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
          Select a section or element on the canvas to inspect its features and styling.
        </p>
      </aside>
    );
  }

  // Handle local image file upload for single image
  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElement) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (selectedElement.type === 'testimonial') {
          updateElementContent(selectedElement.id, { avatar: dataUrl });
        } else if (selectedElement.type === 'teammember') {
          updateElementContent(selectedElement.id, { avatar: dataUrl });
        } else {
          updateElementContent(selectedElement.id, { url: dataUrl });
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBeforeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElement) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateElementContent(selectedElement.id, { beforeImage: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAfterImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElement) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateElementContent(selectedElement.id, { afterImage: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle local multiple images upload for gallery
  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedElement) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const currentImages = selectedElement.content?.images || [];
          updateElementContent(selectedElement.id, { images: [...currentImages, dataUrl] });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Handle local image file upload for background (Section, Row, or Column)
  const handleSectionBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSection) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (targetScope === 'row' && selectedRowId) {
          updateRowStyles(selectedSection.id, selectedRowId, { bgImage: dataUrl });
        } else if (targetScope === 'column' && selectedColumnId) {
          updateColumnStyles(selectedSection.id, selectedColumnId, { bgImage: dataUrl });
        } else {
          updateSectionStyles(selectedSection.id, { bgImage: dataUrl });
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Stepper helper for numeric inputs with up/down arrows
  const getNumericValue = (val?: string | number, fallback = 0): number => {
    if (val === undefined || val === null) return fallback;
    const num = parseInt(String(val).replace(/[^0-9-]/g, ''));
    return isNaN(num) ? fallback : num;
  };

  const currentFontSize = getNumericValue(selectedElement?.styles?.fontSize, 16);

  const changeFontSize = (delta: number) => {
    if (!selectedElement) return;
    const next = Math.max(8, Math.min(120, currentFontSize + delta));
    updateElementStyles(selectedElement.id, { fontSize: `${next}px` });
  };

  const currentBorderRadius = getNumericValue(selectedElement?.styles?.borderRadius, 0);

  const changeBorderRadius = (delta: number) => {
    if (!selectedElement) return;
    const next = Math.max(0, Math.min(100, currentBorderRadius + delta));
    updateElementStyles(selectedElement.id, { borderRadius: `${next}px` });
  };

  const currentInputBorderRadius = getNumericValue(selectedElement?.styles?.inputBorderRadius, 10);
  const changeInputBorderRadius = (delta: number) => {
    if (!selectedElement) return;
    const next = Math.max(0, Math.min(50, currentInputBorderRadius + delta));
    updateElementStyles(selectedElement.id, { inputBorderRadius: `${next}px` });
  };

  const currentButtonBorderRadius = getNumericValue(selectedElement?.styles?.buttonBorderRadius, 12);
  const changeButtonBorderRadius = (delta: number) => {
    if (!selectedElement) return;
    const next = Math.max(0, Math.min(50, currentButtonBorderRadius + delta));
    updateElementStyles(selectedElement.id, { buttonBorderRadius: `${next}px` });
  };

  const currentMarginTop = getNumericValue(selectedElement?.styles?.marginTop, 0);
  const currentMarginBottom = getNumericValue(selectedElement?.styles?.marginBottom, 0);

  const currentImageHeight = getNumericValue(selectedElement?.content?.imageHeight, 180);
  const changeImageHeight = (delta: number) => {
    if (!selectedElement) return;
    const next = Math.max(40, Math.min(800, currentImageHeight + delta));
    updateElementContent(selectedElement.id, { imageHeight: `${next}px` });
  };

  const currentBorderWidth = getNumericValue(selectedElement?.styles?.borderWidth, 1);
  const changeBorderWidth = (delta: number) => {
    if (!selectedElement) return;
    const next = Math.max(0, Math.min(20, currentBorderWidth + delta));
    updateElementStyles(selectedElement.id, { borderWidth: `${next}px` });
  };

  const currentPadding = getNumericValue(selectedElement?.styles?.paddingTop, 12);
  const changePadding = (delta: number) => {
    if (!selectedElement) return;
    const next = Math.max(0, Math.min(100, currentPadding + delta));
    updateElementStyles(selectedElement.id, {
      paddingTop: `${next}px`,
      paddingBottom: `${next}px`,
      paddingLeft: `${next}px`,
      paddingRight: `${next}px`
    });
  };

  return (
    <aside className={`${isWideInspector ? 'w-[440px]' : 'w-96'} bg-white border-l border-slate-200 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden select-none z-30 shadow-xs shrink-0 transition-all duration-200`}>
      {/* Inspector Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
        <div className="min-w-0 flex-1 pr-2">
          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block truncate">
            {selectedElement ? `${selectedElement.type === 'typewriterheadline' ? 'Animated Heading' : selectedElement.type} Element` : 'Section Settings'}
          </span>
          <h3 className="text-xs font-bold text-slate-800 truncate">
            {selectedElement?.label || selectedSection?.name}
          </h3>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => setIsWideInspector(!isWideInspector)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title={isWideInspector ? 'Standard Width' : 'Expand Inspector Width'}
          >
            {isWideInspector ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {selectedElement && (
            <>
              <button
                onClick={() => duplicateElement(selectedElement.id)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Duplicate Element (Ctrl+D)"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deleteElement(selectedElement.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Element (Del)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {selectedSection && (() => {
            const secRows = selectedSection.rows && selectedSection.rows.length > 0
              ? selectedSection.rows
              : [{ id: `${selectedSection.id}-row-0`, columns: selectedSection.columns }];
            const activeRowIdx = secRows.findIndex((r) => r.id === selectedRowId);
            const currentRowId = activeRowIdx >= 0 ? selectedRowId! : secRows[secRows.length - 1].id;
            const currentRowNum = activeRowIdx >= 0 ? activeRowIdx + 1 : secRows.length;

            return (
              <>
                <button
                  onClick={() => duplicateSection(selectedSection.id)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Duplicate Section (Ctrl+D)"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {/* Dedicated Delete Row Button in Header */}
                {secRows.length > 1 ? (
                  <button
                    onClick={() => deleteRowFromSection(selectedSection.id, currentRowId)}
                    className="flex items-center space-x-1 px-2 py-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-all shadow-2xs cursor-pointer"
                    title={`Delete Row ${currentRowNum} (only deletes this row)`}
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" />
                    <span>Delete Row {currentRowNum}</span>
                  </button>
                ) : null}

                {/* Dedicated Delete Entire Section Button */}
                <button
                  onClick={() => deleteSection(selectedSection.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Entire Section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            );
          })()}
        </div>
      </div>

      {/* Icon Tabs for Elements */}
      {selectedElement && (
        <IconTabs
          tabs={[
            { id: 'content', label: 'Content', icon: FileText },
            { id: 'style', label: 'Style', icon: Palette },
            { id: 'advanced', label: 'Advanced', icon: SlidersHorizontal },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
      )}

      {/* Icon Tabs for Section */}
      {selectedSection && !selectedElement && (
        <div className="border-b border-slate-200 bg-slate-100/70 shrink-0">
          <IconTabs
            tabs={[
              { id: 'layout', label: 'Layout', icon: Layout },
              { id: 'styling', label: 'Styling', icon: Palette },
              { id: 'advanced', label: 'Advanced', icon: SlidersHorizontal },
            ]}
            value={sectionTab}
            onChange={setSectionTab}
          />

          {/* Quick Expand All / Collapse All Settings Cards Bar */}
          <div className="flex items-center justify-between px-3 py-1 bg-slate-50/90 border-t border-slate-200 text-[10px] text-slate-500">
            <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">Settings Panels</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setAllCardsState(true)}
                className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Expand All
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => setAllCardsState(false)}
                className="font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspector Body */}
      <div className="p-3.5 overflow-y-auto flex-1 space-y-4 nextforge-scrollbar">
        {/* ========================================================================= */}
        {/* SECTION SPECIFIC INSPECTOR */}
        {/* ========================================================================= */}
        {selectedSection && !selectedElement && (
          <SectionInspector
            selectedSection={selectedSection}
            sectionTab={sectionTab}
            setSectionTab={setSectionTab}
            targetScope={targetScope}
            setTargetScope={setTargetScope}
            openSettingCards={openSettingCards}
            toggleSettingCard={toggleSettingCard}
          />
        )}

        {/* ========================================================================= */}
        {/* ELEMENT SPECIFIC INSPECTOR */}
        {/* ========================================================================= */}
        {selectedElement && (
          <>
            {/* --------------------------------------------------------------------- */}
            {/* TAB 1: CONTENT TAB */}
            {/* --------------------------------------------------------------------- */}
            {activeTab === 'content' && (
              <div className="space-y-3.5">
                {/* 0. INNER ROW (Nested Columns Structure & Settings) */}
                {selectedElement.type === 'innerrow' && (() => {
                  const innerCols = selectedElement.content?.columns || [];
                  const isInterlocked = selectedElement.content?.interlockWidths !== false;
                  const currentGapNum = parseInt(selectedElement.content?.gap || '10') || 10;
                  const currentAlign = selectedElement.content?.alignItems || 'stretch';

                  const presets = [
                    { id: 'two-equal', label: '2 Equal', desc: '50% / 50%', cols: [50, 50] },
                    { id: 'three-equal', label: '3 Equal', desc: '33% each', cols: [33.33, 33.33, 33.34] },
                    { id: 'sidebar-left', label: 'Sidebar L', desc: '30% / 70%', cols: [30, 70] },
                    { id: 'sidebar-right', label: 'Sidebar R', desc: '70% / 30%', cols: [70, 30] },
                    { id: 'four-equal', label: '4 Equal', desc: '25% each', cols: [25, 25, 25, 25] },
                    { id: 'container', label: '1 Column', desc: '100%', cols: [100] },
                  ];

                  return (
                    <div className="space-y-4">
                      {/* Structure Presets */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                            <Columns className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Inner Row Presets</span>
                          </label>
                          <span className="text-[10px] font-mono text-indigo-600 font-semibold">
                            {innerCols.length} Columns
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          {presets.map((p) => {
                            const isSelected = selectedElement.content?.preset === p.id ||
                              (innerCols.length === p.cols.length &&
                                innerCols.every((c: any, i: number) => Math.abs(c.widthPercentage - p.cols[i]) < 2));

                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => updateInnerRowLayout(selectedElement.id, p.id)}
                                className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-xs'
                                    : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700'
                                }`}
                              >
                                <div className="flex space-x-0.5 h-3.5 w-full mb-1.5 rounded overflow-hidden bg-slate-100 p-0.5 border border-slate-200/60">
                                  {p.cols.map((colW, idx) => (
                                    <div
                                      key={idx}
                                      style={{ width: `${colW}%` }}
                                      className={`h-full rounded-xs transition-colors ${
                                        isSelected ? 'bg-indigo-600' : 'bg-slate-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] font-bold leading-none">{p.label}</span>
                                <span className="text-[8px] text-slate-400 mt-0.5">{p.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Column Gap / Spacing */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-slate-700">Columns Gap (Spacing)</label>
                          <span className="text-xs font-mono font-bold text-indigo-600">{currentGapNum}px</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={currentGapNum}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              updateElementContent(selectedElement.id, { gap: `${val}px` });
                            }}
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                          <span className="text-xs font-bold text-slate-400">px</span>
                        </div>
                        <div className="flex items-center space-x-1 pt-1">
                          {[0, 4, 8, 12, 16, 20, 24].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => updateElementContent(selectedElement.id, { gap: `${g}px` })}
                              className={`flex-1 py-1 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer ${
                                currentGapNum === g
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-200/70 hover:bg-indigo-100 text-slate-600'
                              }`}
                            >
                              {g}px
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Vertical Alignment */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-600">Columns Vertical Align</label>
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { id: 'stretch', label: 'Stretch' },
                            { id: 'flex-start', label: 'Top' },
                            { id: 'center', label: 'Center' },
                            { id: 'flex-end', label: 'Bottom' }
                          ].map((al) => (
                            <button
                              key={al.id}
                              type="button"
                              onClick={() => updateElementContent(selectedElement.id, { alignItems: al.id })}
                              className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                currentAlign === al.id
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                              }`}
                            >
                              {al.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Inner Row Container Width & Alignment */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-700">Inner Row Width</label>
                          <span className="text-[10px] font-mono text-indigo-600 font-bold">
                            {(selectedElement.styles?.widthType || selectedElement.content?.widthType || 'full') === 'custom'
                              ? (selectedElement.styles?.customWidth || selectedElement.content?.customWidth || '80%')
                              : (selectedElement.styles?.widthType || selectedElement.content?.widthType || 'full') === 'boxed'
                              ? '1180px'
                              : '100%'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { id: 'full', label: '100% (Full)' },
                            { id: 'boxed', label: 'Boxed' },
                            { id: 'custom', label: 'Custom %' }
                          ].map((w) => {
                            const curType = selectedElement.styles?.widthType || selectedElement.content?.widthType || 'full';
                            const isWSelected = curType === w.id;
                            return (
                              <button
                                key={w.id}
                                type="button"
                                onClick={() => {
                                  updateElementStyles(selectedElement.id, { widthType: w.id as any });
                                  updateElementContent(selectedElement.id, { widthType: w.id as any });
                                }}
                                className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                                  isWSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                }`}
                              >
                                {w.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* If Custom, show input + slider */}
                        {(selectedElement.styles?.widthType === 'custom' || selectedElement.content?.widthType === 'custom') && (
                          <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-slate-600">Custom Width</span>
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  min={10}
                                  max={100}
                                  value={parseInt(selectedElement.styles?.customWidth || selectedElement.content?.customWidth || '80') || 80}
                                  onChange={(e) => {
                                    const val = Math.min(100, Math.max(10, parseInt(e.target.value) || 20));
                                    updateElementStyles(selectedElement.id, { customWidth: `${val}%` });
                                    updateElementContent(selectedElement.id, { customWidth: `${val}%` });
                                  }}
                                  className="w-14 px-1.5 py-0.5 text-right bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                                />
                                <span className="text-xs font-bold text-slate-400">%</span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min={10}
                              max={100}
                              step={1}
                              value={parseInt(selectedElement.styles?.customWidth || selectedElement.content?.customWidth || '80') || 80}
                              onChange={(e) => {
                                updateElementStyles(selectedElement.id, { customWidth: `${e.target.value}%` });
                                updateElementContent(selectedElement.id, { customWidth: `${e.target.value}%` });
                              }}
                              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                            />
                            <div className="grid grid-cols-5 gap-1">
                              {['50%', '60%', '75%', '80%', '90%'].map((pct) => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() => {
                                    updateElementStyles(selectedElement.id, { customWidth: pct });
                                    updateElementContent(selectedElement.id, { customWidth: pct });
                                  }}
                                  className={`py-0.5 text-[9px] font-bold rounded border transition-colors cursor-pointer ${
                                    (selectedElement.styles?.customWidth || selectedElement.content?.customWidth || '80%') === pct
                                      ? 'bg-indigo-600 text-white border-indigo-600'
                                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {pct}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Inner Row Alignment */}
                        <div className="space-y-1 pt-1 border-t border-slate-200/80">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Horizontal Alignment</label>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { id: 'left', label: 'Left', icon: AlignLeft },
                              { id: 'center', label: 'Center', icon: AlignCenter },
                              { id: 'right', label: 'Right', icon: AlignRight }
                            ].map((al) => {
                              const Icon = al.icon;
                              const curAlign = selectedElement.styles?.align || selectedElement.content?.align || 'center';
                              const isAlSelected = curAlign === al.id;
                              return (
                                <button
                                  key={al.id}
                                  type="button"
                                  onClick={() => {
                                    updateElementStyles(selectedElement.id, { align: al.id as any });
                                    updateElementContent(selectedElement.id, { align: al.id as any });
                                  }}
                                  className={`py-1 text-[10px] font-bold rounded-lg border flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                                    isAlSelected
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                  }`}
                                >
                                  <Icon className="w-3 h-3" />
                                  <span>{al.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Columns List & Width Manager */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-700">Columns Widths & Settings</label>
                          <button
                            type="button"
                            onClick={() => addInnerColumn(selectedElement.id)}
                            className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Column</span>
                          </button>
                        </div>

                        {/* Interlock Widths Option (Auto-balance vs Independent) */}
                        <div className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                          <label className="flex items-center space-x-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isInterlocked}
                              onChange={(e) => {
                                updateElementContent(selectedElement.id, {
                                  interlockWidths: e.target.checked
                                });
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span className="text-[11px] font-semibold text-slate-700 flex items-center space-x-1.5">
                              {isInterlocked ? (
                                <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                              ) : (
                                <Unlink className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span>Interlock Column Widths</span>
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              updateElementContent(selectedElement.id, {
                                interlockWidths: !isInterlocked
                              });
                            }}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                              isInterlocked
                                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                            title={isInterlocked ? 'Column widths interlocked (Auto-balance to 100%) - Click to unlock independent widths' : 'Independent column widths - Click to lock & auto-balance'}
                          >
                            {isInterlocked ? 'Auto-balance (100%)' : 'Independent'}
                          </button>
                        </div>

                        <div className="space-y-2">
                          {innerCols.map((col: any, cIdx: number) => {
                            const isThisInnerColSelected = selectedInnerColumnId === col.id;
                            return (
                              <div
                                key={col.id || cIdx}
                                onClick={() => setSelectedInnerColumnId(selectedElement.id, col.id)}
                                className={`border rounded-xl p-2.5 space-y-2 transition-all cursor-pointer ${
                                  isThisInnerColSelected
                                    ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-400/40 shadow-xs'
                                    : 'bg-white border-slate-200 hover:border-indigo-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1.5">
                                    <span className={`text-xs font-bold ${isThisInnerColSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                                      Column {cIdx + 1}
                                    </span>
                                    {isThisInnerColSelected && (
                                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-indigo-600 text-white rounded-full">
                                        Selected
                                      </span>
                                    )}
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      ({col.elements?.length || 0} items)
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const nextW = Math.max(5, (col.widthPercentage || 50) - 5);
                                        updateInnerColumnWidth(selectedElement.id, col.id, nextW);
                                      }}
                                      className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded text-xs font-bold text-slate-600 cursor-pointer"
                                      title="Decrease width by 5%"
                                    >
                                      -
                                    </button>
                                    <div className="flex items-center space-x-0.5">
                                      <input
                                        type="number"
                                        min={5}
                                        max={100}
                                        value={Math.round(col.widthPercentage || 50)}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                          const val = Math.min(100, Math.max(5, parseInt(e.target.value) || 5));
                                          updateInnerColumnWidth(selectedElement.id, col.id, val);
                                        }}
                                        className="w-11 px-1 py-0.5 text-center text-xs font-mono font-bold text-indigo-700 bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
                                      />
                                      <span className="text-[10px] font-bold text-slate-400">%</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const nextW = Math.min(100, (col.widthPercentage || 50) + 5);
                                        updateInnerColumnWidth(selectedElement.id, col.id, nextW);
                                      }}
                                      className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded text-xs font-bold text-slate-600 cursor-pointer"
                                      title="Increase width by 5%"
                                    >
                                      +
                                    </button>

                                    {/* Interlock toggle button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateElementContent(selectedElement.id, {
                                          interlockWidths: !isInterlocked
                                        });
                                      }}
                                      className={`p-1 rounded transition-colors ml-1 cursor-pointer ${
                                        isInterlocked
                                          ? 'text-indigo-600 bg-indigo-100 hover:bg-indigo-200 ring-1 ring-indigo-300'
                                          : 'text-slate-400 bg-slate-100 hover:bg-slate-200 hover:text-slate-600'
                                      }`}
                                      title={
                                        isInterlocked
                                          ? 'Column widths interlocked (Auto-balance to 100%) - Click to unlock independent widths'
                                          : 'Independent column widths (Unlinked) - Click to interlock & auto-balance'
                                      }
                                    >
                                      {isInterlocked ? <Link2 className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        duplicateInnerColumn(selectedElement.id, col.id);
                                      }}
                                      className="p-1 hover:text-indigo-600 hover:bg-indigo-50 rounded text-slate-400 transition-colors cursor-pointer"
                                      title="Clone / Duplicate column"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>

                                    {innerCols.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteInnerColumn(selectedElement.id, col.id);
                                        }}
                                        className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded text-slate-400 transition-colors ml-0.5 cursor-pointer"
                                        title="Delete column"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Width slider */}
                                <input
                                  type="range"
                                  min={5}
                                  max={100}
                                  step={1}
                                  value={Math.round(col.widthPercentage || 50)}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    updateInnerColumnWidth(selectedElement.id, col.id, parseInt(e.target.value));
                                  }}
                                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />

                                {/* Column Quick Presets */}
                                <div className="flex items-center space-x-1 pt-0.5">
                                  {[25, 33, 50, 66, 75, 100].map((pw) => (
                                    <button
                                      key={pw}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateInnerColumnWidth(selectedElement.id, col.id, pw);
                                      }}
                                      className={`flex-1 py-0.5 text-[9px] font-mono font-bold rounded transition-colors cursor-pointer ${
                                        Math.round(col.widthPercentage || 50) === pw
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-slate-100 hover:bg-indigo-100 text-slate-600'
                                      }`}
                                    >
                                      {pw}%
                                    </button>
                                  ))}
                                </div>

                                {/* Selected Inner Column Individual Styling */}
                                {isThisInnerColSelected && (
                                  <div className="pt-2 border-t border-indigo-100 space-y-2 mt-2" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                                        Column {cIdx + 1} Card Styling
                                      </span>
                                    </div>
                                    <ModernColorPicker
                                      label="Column Background"
                                      value={col.styles?.bgColor || selectedElement.styles?.columnBgColor || '#ffffff'}
                                      onChange={(bgColor) => updateInnerColumnStyles(selectedElement.id, col.id, { bgColor })}
                                    />
                                    <div className="flex items-center justify-between space-x-2">
                                      <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-semibold text-slate-600">Padding</label>
                                        <input
                                          type="text"
                                          placeholder="10px"
                                          value={col.styles?.padding || selectedElement.styles?.columnPadding || ''}
                                          onChange={(e) => updateInnerColumnStyles(selectedElement.id, col.id, { padding: e.target.value })}
                                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-800 focus:outline-none"
                                        />
                                      </div>
                                      <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-semibold text-slate-600">Radius</label>
                                        <input
                                          type="text"
                                          placeholder="10px"
                                          value={col.styles?.borderRadius || selectedElement.styles?.columnBorderRadius || ''}
                                          onChange={(e) => updateInnerColumnStyles(selectedElement.id, col.id, { borderRadius: e.target.value })}
                                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-800 focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 1. HEADING */}
                {selectedElement.type === 'heading' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Heading Text</label>
                      <textarea
                        rows={3}
                        value={selectedElement.content?.text || ''}
                        onChange={(e) => updateElementContent(selectedElement.id, { text: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">HTML Tag</label>
                      <select
                        value={selectedElement.content?.tag || 'h1'}
                        onChange={(e) => updateElementContent(selectedElement.id, { tag: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                      >
                        <option value="h1">H1 Heading</option>
                        <option value="h2">H2 Subheading</option>
                        <option value="h3">H3 Section Title</option>
                        <option value="h4">H4 Small Heading</option>
                      </select>
                    </div>

                    {/* Heading Text Case */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-600">Text Case</label>
                        <span className="text-[10px] font-mono font-bold text-indigo-600 capitalize">
                          {selectedElement.styles?.textTransform || selectedElement.content?.textTransform || 'none'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'none', label: 'As Typed', icon: 'Aa' },
                          { id: 'uppercase', label: 'UPPER', icon: 'AA' },
                          { id: 'lowercase', label: 'lower', icon: 'aa' },
                          { id: 'capitalize', label: 'Title', icon: 'Ab' }
                        ].map((c) => {
                          const active = (selectedElement.styles?.textTransform || selectedElement.content?.textTransform || 'none') === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                updateElementStyles(selectedElement.id, { textTransform: c.id as any });
                                updateElementContent(selectedElement.id, { textTransform: c.id });
                              }}
                              className={`py-1.5 px-1 text-xs font-mono font-bold rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                active
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600'
                              }`}
                              title={c.label}
                            >
                              <span className="font-extrabold text-xs">{c.icon}</span>
                              <span className="font-sans text-[9px] font-medium leading-none mt-0.5">{c.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Heading Line Spacing & Letter Spacing */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* Line Spacing */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-slate-600">Line Height</label>
                          <span className="text-[10px] font-mono font-bold text-indigo-600">
                            {selectedElement.styles?.lineHeight || selectedElement.content?.lineHeight || 'Default'}
                          </span>
                        </div>
                        <select
                          value={selectedElement.styles?.lineHeight || selectedElement.content?.lineHeight || 'normal'}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateElementStyles(selectedElement.id, { lineHeight: val });
                            updateElementContent(selectedElement.id, { lineHeight: val });
                          }}
                          className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                        >
                          <option value="normal">Normal (Default)</option>
                          <option value="1.0">1.0 (Ultra Tight)</option>
                          <option value="1.1">1.1 (Tight)</option>
                          <option value="1.2">1.2 (Compact)</option>
                          <option value="1.25">1.25 (Snug)</option>
                          <option value="1.35">1.35 (Comfortable)</option>
                          <option value="1.5">1.5 (Relaxed)</option>
                          <option value="1.75">1.75 (Loose)</option>
                          <option value="2.0">2.0 (Double)</option>
                        </select>
                      </div>

                      {/* Letter Spacing */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-slate-600">Letter Spacing</label>
                          <span className="text-[10px] font-mono font-bold text-indigo-600">
                            {selectedElement.styles?.letterSpacing || selectedElement.content?.letterSpacing || 'Normal'}
                          </span>
                        </div>
                        <select
                          value={selectedElement.styles?.letterSpacing || selectedElement.content?.letterSpacing || '0px'}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateElementStyles(selectedElement.id, { letterSpacing: val });
                            updateElementContent(selectedElement.id, { letterSpacing: val });
                          }}
                          className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                        >
                          <option value="-0.05em">-0.05em (Tighter)</option>
                          <option value="-1px">-1px (Compact)</option>
                          <option value="0px">0px (Normal)</option>
                          <option value="0.02em">0.02em (Slight)</option>
                          <option value="1px">1px (Wide)</option>
                          <option value="2px">2px (Wider)</option>
                          <option value="3px">3px (Widest)</option>
                          <option value="0.1em">0.1em (Spaced)</option>
                          <option value="5px">5px (Ultra Spaced)</option>
                        </select>
                      </div>
                    </div>

                    {/* HEADING DECORATION */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-2.5 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                          Heading Decoration
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {selectedElement.content?.decorationType || 'none'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'none', label: 'None' },
                          { id: 'underline', label: 'Underline' },
                          { id: 'wavy', label: 'Wavy' },
                          { id: 'double', label: 'Double' },
                          { id: 'woosh', label: 'Woosh' },
                          { id: 'slash', label: 'Slash' },
                          { id: 'gradient-text', label: 'Gradient' },
                          { id: 'highlight', label: 'Highlight' },
                          { id: 'accent-bar', label: 'Left Bar' },
                          { id: 'badge-pill', label: 'Badge' },
                          { id: 'circled', label: 'Circled' }
                        ].map((dec) => {
                          const isSel = (selectedElement.content?.decorationType || 'none') === dec.id;
                          return (
                            <button
                              key={dec.id}
                              type="button"
                              onClick={() => updateElementContent(selectedElement.id, { decorationType: dec.id })}
                              className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                isSel
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                              }`}
                            >
                              {dec.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Decoration Color & Options if not none */}
                      {(selectedElement.content?.decorationType && selectedElement.content.decorationType !== 'none') && (
                        <div className="space-y-2 pt-1 border-t border-slate-200/60">
                          {selectedElement.content?.decorationType === 'badge-pill' && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-600">Badge Prefix Text</label>
                              <input
                                type="text"
                                value={selectedElement.content?.badgeText ?? 'FEATURE'}
                                onChange={(e) => updateElementContent(selectedElement.id, { badgeText: e.target.value })}
                                placeholder="FEATURE"
                                className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                              />
                            </div>
                          )}

                          {selectedElement.content?.decorationType === 'gradient-text' ? (
                            <div className="space-y-2">
                              {/* Quick Gradient Presets */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-600">Gradient Presets</label>
                                <div className="grid grid-cols-3 gap-1">
                                  {[
                                    { label: 'Indigo / Pink', from: '#6366f1', to: '#ec4899' },
                                    { label: 'Cyber Cyan', from: '#00f0ff', to: '#a855f7' },
                                    { label: 'Sunset Fire', from: '#f97316', to: '#f43f5e' },
                                    { label: 'Emerald / Lime', from: '#10b981', to: '#39ff14' },
                                    { label: 'Gold / Amber', from: '#f59e0b', to: '#fbbf24' },
                                    { label: 'Silver Chrome', from: '#475569', to: '#e2e8f0' }
                                  ].map(p => (
                                    <button
                                      key={p.label}
                                      type="button"
                                      onClick={() => updateElementContent(selectedElement.id, { gradientFrom: p.from, gradientTo: p.to })}
                                      className="flex items-center space-x-1 p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[9px] font-semibold text-slate-700"
                                    >
                                      <span
                                        className="w-3 h-3 rounded-full shrink-0 border border-slate-300 shadow-2xs"
                                        style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                                      />
                                      <span className="truncate">{p.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <ModernColorPicker
                                label="Gradient Start"
                                value={selectedElement.content?.gradientFrom || '#6366f1'}
                                onChange={(val) => updateElementContent(selectedElement.id, { gradientFrom: val })}
                              />
                              <ModernColorPicker
                                label="Gradient End"
                                value={selectedElement.content?.gradientTo || '#ec4899'}
                                onChange={(val) => updateElementContent(selectedElement.id, { gradientTo: val })}
                              />
                            </div>
                          ) : (
                            <ModernColorPicker
                              label="Decoration Color"
                              value={selectedElement.content?.decorationColor || '#6366f1'}
                              onChange={(val) => updateElementContent(selectedElement.id, { decorationColor: val })}
                            />
                          )}

                          {(selectedElement.content?.decorationType === 'underline' || selectedElement.content?.decorationType === 'wavy' || selectedElement.content?.decorationType === 'double' || selectedElement.content?.decorationType === 'accent-bar' || selectedElement.content?.decorationType === 'woosh' || selectedElement.content?.decorationType === 'slash') && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-semibold text-slate-600">Thickness</label>
                                <span className="text-[10px] font-mono text-indigo-600 font-bold">{selectedElement.content?.decorationThickness || 3}px</span>
                              </div>
                              <input
                                type="range"
                                min={1}
                                max={10}
                                value={selectedElement.content?.decorationThickness || 3}
                                onChange={(e) => updateElementContent(selectedElement.id, { decorationThickness: Number(e.target.value) })}
                                className="w-full accent-indigo-600"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* HEADING ANIMATION EFFECT */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-2.5 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                          Animation Effect
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {selectedElement.content?.headingAnimation || 'none'}
                        </span>
                      </div>
                      <select
                        value={selectedElement.content?.headingAnimation || 'none'}
                        onChange={(e) => updateElementContent(selectedElement.id, { headingAnimation: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="none">None (Static)</option>
                        <option value="gradient-shimmer">✨ Gradient Shimmer (Light Sweep)</option>
                        <option value="neon">⚡ Neon Glow & Pulse</option>
                        <option value="typewriter">⌨️ Typewriter Cursor</option>
                        <option value="fade-slide-up">🚀 Fade & Slide Up</option>
                        <option value="pulse-glow">💫 Pulse Breathing Glow</option>
                        <option value="floating">🎈 Floating Bob</option>
                        <option value="bounce">🏀 Gentle Bounce</option>
                      </select>

                      {/* GRADIENT SHIMMER CONTROLS */}
                      {selectedElement.content?.headingAnimation === 'gradient-shimmer' && (
                        <div className="space-y-2 pt-2 border-t border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                              Shimmer Gradient Colors
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">Light Sweep</span>
                          </div>

                          {/* Quick Shimmer Presets */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-600">Palette Presets</label>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { label: 'Indigo / Pink', from: '#6366f1', mid: '#ec4899', end: '#6366f1' },
                                { label: 'Cyber Cyan', from: '#00f0ff', mid: '#a855f7', end: '#00f0ff' },
                                { label: 'Sunset Fire', from: '#f97316', mid: '#f43f5e', end: '#f97316' },
                                { label: 'Emerald / Lime', from: '#10b981', mid: '#39ff14', end: '#10b981' },
                                { label: 'Gold / Amber', from: '#d97706', mid: '#fde047', end: '#d97706' },
                                { label: 'Silver Chrome', from: '#64748b', mid: '#ffffff', end: '#64748b' }
                              ].map(p => {
                                const isCurrent =
                                  (selectedElement.content?.shimmerColorFrom || '#6366f1').toLowerCase() === p.from.toLowerCase() &&
                                  (selectedElement.content?.shimmerColorMid || '#ec4899').toLowerCase() === p.mid.toLowerCase();
                                return (
                                  <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => updateElementContent(selectedElement.id, {
                                      shimmerColorFrom: p.from,
                                      shimmerColorMid: p.mid,
                                      shimmerColorEnd: p.end
                                    })}
                                    className={`flex items-center space-x-1.5 p-1 px-1.5 rounded-md border text-left text-[9px] font-semibold transition-all ${
                                      isCurrent
                                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-2xs'
                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span
                                      className="w-3 h-3 rounded-full shrink-0 border border-slate-300 shadow-2xs"
                                      style={{ background: `linear-gradient(135deg, ${p.from}, ${p.mid})` }}
                                    />
                                    <span className="truncate">{p.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Base Color & Sweep Color with Labels on Top & NO predefined colors */}
                          <div className="grid grid-cols-2 gap-2">
                            <ModernColorPicker
                              label="Base Color"
                              labelPosition="top"
                              hidePresets={true}
                              value={selectedElement.content?.shimmerColorFrom || '#6366f1'}
                              onChange={(val) => {
                                const updates: any = { shimmerColorFrom: val };
                                if (!selectedElement.content?.shimmerColorEnd || selectedElement.content.shimmerColorEnd === selectedElement.content.shimmerColorFrom) {
                                  updates.shimmerColorEnd = val;
                                }
                                updateElementContent(selectedElement.id, updates);
                              }}
                            />
                            <ModernColorPicker
                              label="Sweep Color"
                              labelPosition="top"
                              hidePresets={true}
                              value={selectedElement.content?.shimmerColorMid || '#ec4899'}
                              onChange={(val) => updateElementContent(selectedElement.id, { shimmerColorMid: val })}
                            />
                          </div>

                          {/* Optional Loop End Color */}
                          {(selectedElement.content?.shimmerColorEnd && selectedElement.content?.shimmerColorEnd !== (selectedElement.content?.shimmerColorFrom || '#6366f1')) ? (
                            <div className="pt-0.5">
                              <ModernColorPicker
                                label="Loop End Color"
                                labelPosition="top"
                                hidePresets={true}
                                value={selectedElement.content?.shimmerColorEnd}
                                onChange={(val) => updateElementContent(selectedElement.id, { shimmerColorEnd: val })}
                                onReset={() => updateElementContent(selectedElement.id, { shimmerColorEnd: selectedElement.content?.shimmerColorFrom || '#6366f1' })}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-[9px] pt-0.5 text-slate-400">
                              <button
                                type="button"
                                onClick={() => updateElementContent(selectedElement.id, { shimmerColorEnd: '#ec4899' })}
                                className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                              >
                                + Customize loop end color
                              </button>
                              <span>Default: matches Base</span>
                            </div>
                          )}

                          {/* Mini Shimmer Sweep Preview */}
                          <div className="py-2 px-3 rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner">
                            <span
                              className="text-xs font-black tracking-wide"
                              style={{
                                background: `linear-gradient(90deg, ${selectedElement.content?.shimmerColorFrom || '#6366f1'} 0%, ${selectedElement.content?.shimmerColorMid || '#ec4899'} 50%, ${selectedElement.content?.shimmerColorEnd || selectedElement.content?.shimmerColorFrom || '#6366f1'} 100%)`,
                                backgroundSize: '200% auto',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                animation: 'nf-shimmer 2s linear infinite'
                              }}
                            >
                              ✦ Shimmer Light Sweep Preview ✦
                            </span>
                          </div>
                        </div>
                      )}

                      {/* NEON EFFECT SETTINGS */}
                      {selectedElement.content?.headingAnimation === 'neon' && (
                        <div className="space-y-3 pt-2 border-t border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                                Neon Sign & Glow Settings
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-medium">Electric Neon</span>
                          </div>

                          {/* Neon Presets */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-600">Neon Color Presets</label>
                            <div className="grid grid-cols-4 gap-1.5">
                              {[
                                { label: 'Cyan', color: '#00f0ff' },
                                { label: 'Hot Pink', color: '#ff007f' },
                                { label: 'Lime Green', color: '#39ff14' },
                                { label: 'Violet', color: '#b026ff' },
                                { label: 'Amber Gold', color: '#ffb703' },
                                { label: 'Blood Red', color: '#ff073a' },
                                { label: 'Ice Blue', color: '#7df9ff' },
                                { label: 'White Neon', color: '#f8fafc' }
                              ].map(preset => {
                                const isSelected = (selectedElement.content?.neonColor || '#00f0ff') === preset.color;
                                return (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => updateElementContent(selectedElement.id, { neonColor: preset.color })}
                                    className={`flex items-center space-x-1 p-1 rounded-md border text-[9px] font-bold transition-all ${
                                      isSelected
                                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-2xs'
                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                                      style={{ backgroundColor: preset.color, boxShadow: `0 0 5px ${preset.color}` }}
                                    />
                                    <span className="truncate">{preset.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Custom Neon Color Picker */}
                          <ModernColorPicker
                            label="Custom Neon Color"
                            value={selectedElement.content?.neonColor || '#00f0ff'}
                            onChange={(val) => updateElementContent(selectedElement.id, { neonColor: val })}
                          />

                          {/* Glow Bloom Intensity */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-600">Glow Bloom Intensity</label>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { id: 'subtle', label: 'Subtle' },
                                { id: 'medium', label: 'Medium' },
                                { id: 'intense', label: 'Intense' },
                                { id: 'cyberpunk', label: 'Cyberpunk' }
                              ].map(g => (
                                <button
                                  key={g.id}
                                  type="button"
                                  onClick={() => updateElementContent(selectedElement.id, { neonIntensity: g.id })}
                                  className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                    (selectedElement.content?.neonIntensity || 'intense') === g.id
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  {g.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Neon Style / Animation Behavior */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-600">Animation / Flicker Style</label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                { id: 'pulse', label: '💫 Breathing Pulse', desc: 'Rhythmic soft-to-bright glow' },
                                { id: 'flicker', label: '⚡ Tube Flicker', desc: 'Vintage neon tube flicker' },
                                { id: 'electric', label: '🔌 Electric Glitch', desc: 'High-voltage spark jumps' },
                                { id: 'steady', label: '💡 Steady Sign', desc: 'Constant radiant aura' }
                              ].map(s => {
                                const isSelected = (selectedElement.content?.neonStyle || 'pulse') === s.id;
                                return (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => updateElementContent(selectedElement.id, { neonStyle: s.id })}
                                    className={`p-1.5 text-left rounded-lg border transition-all ${
                                      isSelected
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="text-[10px] font-bold">{s.label}</div>
                                    <div className="text-[9px] text-slate-400 leading-tight">{s.desc}</div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Glass Tube White Core Toggle */}
                          <label className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200/90 cursor-pointer hover:bg-slate-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedElement.content?.neonWhiteCore !== false}
                              onChange={(e) => updateElementContent(selectedElement.id, { neonWhiteCore: e.target.checked })}
                              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                            />
                            <div className="flex-1">
                              <div className="text-[10px] font-bold text-slate-800">White Tube Core</div>
                              <div className="text-[9px] text-slate-400">Bright white inner tube with colored outer glow halo</div>
                            </div>
                          </label>

                          {/* Live Neon Mini Preview */}
                          <div className="p-3 rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner">
                            <span
                              className="text-xs font-black tracking-wider uppercase"
                              style={{
                                color: (selectedElement.content?.neonWhiteCore !== false) ? '#ffffff' : (selectedElement.content?.neonColor || '#00f0ff'),
                                textShadow: `0 0 4px #fff, 0 0 10px ${selectedElement.content?.neonColor || '#00f0ff'}, 0 0 25px ${selectedElement.content?.neonColor || '#00f0ff'}`
                              }}
                            >
                              ⚡ NEON SIGN PREVIEW ⚡
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedElement.content?.headingAnimation === 'typewriter' && (
                        <div className="space-y-3 pt-1 border-t border-slate-200/80">
                          {/* Header with Replay button */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                              Typewriter Settings
                            </span>
                            <button
                              type="button"
                              onClick={() => updateElementContent(selectedElement.id, { typewriterReplayKey: (selectedElement.content?.typewriterReplayKey || 0) + 1 })}
                              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold transition-all border border-indigo-200 shadow-2xs"
                              title="Replay typing animation from start"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>Replay</span>
                            </button>
                          </div>

                          {/* Live Inspector Preview Box */}
                          <div className="p-2 rounded-lg bg-slate-900 text-white font-mono text-xs flex items-center justify-between overflow-hidden shadow-inner border border-slate-800">
                            <div className="flex items-center space-x-1.5 truncate">
                              <span className="text-[9px] text-slate-400 font-sans uppercase font-bold tracking-wider shrink-0">Preview:</span>
                              <TypewriterHeading
                                text={selectedElement.content?.text || 'Heading Text'}
                                speedMs={selectedElement.content?.typewriterSpeed ?? (selectedElement.content?.animationSpeed === 'fast' ? 45 : selectedElement.content?.animationSpeed === 'slow' ? 160 : 90)}
                                pauseMs={selectedElement.content?.typewriterPause ?? 1500}
                                loop={selectedElement.content?.typewriterMode !== 'once'}
                                loopMode={selectedElement.content?.typewriterMode || 'erase'}
                                cursorChar={selectedElement.content?.typewriterCursor ?? '|'}
                                cursorBlink={selectedElement.content?.typewriterCursorBlink || 'blink'}
                                cursorColor={selectedElement.content?.typewriterCursorColor || '#a5b4fc'}
                                deleteSpeedMs={selectedElement.content?.typewriterDeleteSpeed ?? 40}
                                replayKey={selectedElement.content?.typewriterReplayKey || 0}
                              />
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0 ml-1.5" title="Live Preview Active" />
                          </div>

                          {/* Animation Mode / Behavior */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-600">Animation Mode</label>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { id: 'erase', label: 'Type & Erase' },
                                { id: 'restart', label: 'Instant Restart' },
                                { id: 'once', label: 'Play Once' }
                              ].map(m => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => updateElementContent(selectedElement.id, {
                                    typewriterMode: m.id,
                                    animationLoop: m.id !== 'once'
                                  })}
                                  className={`py-1 px-1 text-center text-[10px] font-bold rounded-lg border transition-all ${
                                    (selectedElement.content?.typewriterMode || 'erase') === m.id
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  {m.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Typing Speed Control (Presets + Live Slider) */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-semibold text-slate-600">Typing Speed</label>
                              <span className="text-[10px] font-mono font-bold text-indigo-600">
                                {selectedElement.content?.typewriterSpeed ?? (
                                  selectedElement.content?.animationSpeed === 'fast' ? 45 :
                                  selectedElement.content?.animationSpeed === 'slow' ? 160 : 90
                                )}ms / char
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { label: 'Turbo', ms: 30 },
                                { label: 'Fast', ms: 55 },
                                { label: 'Normal', ms: 90 },
                                { label: 'Slow', ms: 160 }
                              ].map(preset => {
                                const curMs = selectedElement.content?.typewriterSpeed ?? (
                                  selectedElement.content?.animationSpeed === 'fast' ? 45 :
                                  selectedElement.content?.animationSpeed === 'slow' ? 160 : 90
                                );
                                const isActive = curMs === preset.ms;
                                return (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => updateElementContent(selectedElement.id, { typewriterSpeed: preset.ms })}
                                    className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                      isActive
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    {preset.label}
                                  </button>
                                );
                              })}
                            </div>
                            <input
                              type="range"
                              min="15"
                              max="350"
                              step="5"
                              value={selectedElement.content?.typewriterSpeed ?? (
                                selectedElement.content?.animationSpeed === 'fast' ? 45 :
                                selectedElement.content?.animationSpeed === 'slow' ? 160 : 90
                              )}
                              onChange={(e) => updateElementContent(selectedElement.id, { typewriterSpeed: parseInt(e.target.value) })}
                              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                            />
                          </div>

                          {/* Pause Duration at End */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-semibold text-slate-600">Pause at End</label>
                              <span className="text-[10px] font-mono font-bold text-slate-500">
                                {((selectedElement.content?.typewriterPause ?? 1500) / 1000).toFixed(1)}s
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { label: '0.8s', ms: 800 },
                                { label: '1.5s', ms: 1500 },
                                { label: '2.5s', ms: 2500 },
                                { label: '4.0s', ms: 4000 }
                              ].map(p => {
                                const curPause = selectedElement.content?.typewriterPause ?? 1500;
                                return (
                                  <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => updateElementContent(selectedElement.id, { typewriterPause: p.ms })}
                                    className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                      curPause === p.ms
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    {p.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Cursor Symbol & Blink Effect */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-600">Cursor Symbol</label>
                              <select
                                value={selectedElement.content?.typewriterCursor ?? '|'}
                                onChange={(e) => updateElementContent(selectedElement.id, { typewriterCursor: e.target.value })}
                                className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                              >
                                <option value="|">| Pipe Line</option>
                                <option value="_">_ Underscore</option>
                                <option value="█">█ Block</option>
                                <option value="▌">▌ Half Block</option>
                                <option value="none">None (Hidden)</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-600">Cursor Blink</label>
                              <select
                                value={selectedElement.content?.typewriterCursorBlink || 'blink'}
                                onChange={(e) => updateElementContent(selectedElement.id, { typewriterCursorBlink: e.target.value })}
                                className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                              >
                                <option value="blink">Digital Blink</option>
                                <option value="pulse">Soft Pulse</option>
                                <option value="solid">Solid (Always On)</option>
                              </select>
                            </div>
                          </div>

                          {/* Cursor Color */}
                          <div className="pt-0.5">
                            <ModernColorPicker
                              label="Cursor Color"
                              value={selectedElement.content?.typewriterCursorColor || selectedElement.styles?.color || '#000000'}
                              onChange={(color) => updateElementContent(selectedElement.id, { typewriterCursorColor: color })}
                            />
                          </div>

                          {/* Erase Speed when mode is 'erase' */}
                          {(selectedElement.content?.typewriterMode || 'erase') === 'erase' && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-semibold text-slate-600">Erase Speed</label>
                                <span className="text-[10px] font-mono font-bold text-slate-500">
                                  {selectedElement.content?.typewriterDeleteSpeed ?? 40}ms / char
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                {[
                                  { label: 'Fast (25ms)', ms: 25 },
                                  { label: 'Normal (40ms)', ms: 40 },
                                  { label: 'Slow (80ms)', ms: 80 }
                                ].map(ds => {
                                  const curDel = selectedElement.content?.typewriterDeleteSpeed ?? 40;
                                  return (
                                    <button
                                      key={ds.label}
                                      type="button"
                                      onClick={() => updateElementContent(selectedElement.id, { typewriterDeleteSpeed: ds.ms })}
                                      className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                        curDel === ds.ms
                                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                      }`}
                                    >
                                      {ds.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Generic options for non-typewriter animations */}
                      {selectedElement.content?.headingAnimation && selectedElement.content.headingAnimation !== 'none' && selectedElement.content.headingAnimation !== 'typewriter' && (
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-600">Speed</label>
                            <select
                              value={selectedElement.content?.animationSpeed || 'normal'}
                              onChange={(e) => updateElementContent(selectedElement.id, { animationSpeed: e.target.value })}
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                            >
                              <option value="lightning">⚡ Ultra Fast (0.6s)</option>
                              <option value="very-fast">🏎️ Super Fast (0.9s)</option>
                              <option value="fast">🚀 Fast (1.4s)</option>
                              <option value="normal">⏱️ Normal (2.5s)</option>
                              <option value="slow">🐢 Slow (4.0s)</option>
                              <option value="very-slow">🐌 Super Slow (6.0s)</option>
                              <option value="ultra-slow">🌌 Ultra Slow (9.0s)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-600">Loop</label>
                            <select
                              value={selectedElement.content?.animationLoop !== false ? 'infinite' : 'once'}
                              onChange={(e) => updateElementContent(selectedElement.id, { animationLoop: e.target.value === 'infinite' })}
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                            >
                              <option value="infinite">Infinite Loop</option>
                              <option value="once">Once on View</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* 2. TEXT EDITOR (Full Rich WYSIWYG Editor matching screenshot) */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-2">
                    <RichTextEditor
                      key={selectedElement.id}
                      initialHtml={selectedElement.content?.html}
                      initialText={selectedElement.content?.text}
                      title={selectedElement.label || 'Article body'}
                      styles={selectedElement.styles}
                      onUpdateStyles={(newStyles) => updateElementStyles(selectedElement.id, newStyles)}
                      onChange={({ html, text }) =>
                        updateElementContent(selectedElement.id, { html, text })
                      }
                    />
                  </div>
                )}

                {/* 3. BUTTON */}
                {selectedElement.type === 'button' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Button Label</label>
                      <input
                        type="text"
                        value={selectedElement.content?.text || ''}
                        onChange={(e) => updateElementContent(selectedElement.id, { text: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Button Text Case */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-600">Text Case</label>
                        <span className="text-[10px] font-mono font-bold text-indigo-600 capitalize">
                          {selectedElement.styles?.textTransform || 'none'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'none', label: 'As Typed', icon: 'Aa' },
                          { id: 'uppercase', label: 'UPPER', icon: 'AA' },
                          { id: 'lowercase', label: 'lower', icon: 'aa' },
                          { id: 'capitalize', label: 'Title', icon: 'Ab' }
                        ].map((c) => {
                          const active = (selectedElement.styles?.textTransform || 'none') === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => updateElementStyles(selectedElement.id, { textTransform: c.id as any })}
                              className={`py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                                active
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                              title={c.label}
                            >
                              {c.icon} <span className="font-sans text-[9px] font-medium ml-0.5">{c.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <LinkDestinationPicker
                      value={selectedElement.content?.url || ''}
                      onChange={(url) => updateElementContent(selectedElement.id, { url })}
                      pages={pages}
                      sections={sections}
                      label="Button Link Destination"
                    />

                    {/* Icon & Target Options */}
                    <div className="space-y-2 pt-1 border-t border-slate-200">
                      <div className="flex items-center justify-between px-1 py-0.5">
                        <span className="text-[11px] font-semibold text-slate-600">Show Button Icon</span>
                        <input
                          type="checkbox"
                          checked={selectedElement.content?.showIcon !== false}
                          onChange={(e) => updateElementContent(selectedElement.id, { showIcon: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                      </div>

                      {selectedElement.content?.showIcon !== false && (
                        <IconSelector
                          label="Button Icon"
                          value={selectedElement.content?.iconName || 'arrowRight'}
                          onChange={(iconName) => updateElementContent(selectedElement.id, { iconName })}
                        />
                      )}

                      <div className="flex items-center justify-between px-1 py-0.5">
                        <span className="text-[11px] font-semibold text-slate-600">Open in New Tab</span>
                        <input
                          type="checkbox"
                          checked={selectedElement.content?.target === '_blank'}
                          onChange={(e) => updateElementContent(selectedElement.id, { target: e.target.checked ? '_blank' : '_self' })}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 4. IMAGE (Single Image with PC Upload & URL Support) */}
                {selectedElement.type === 'image' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-slate-600">Upload from PC or URL</label>

                      {/* Upload from PC Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-xs"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Choose Image from Your PC</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSingleImageUpload}
                        className="hidden"
                      />

                      {/* Image URL Input */}
                      <input
                        type="text"
                        value={selectedElement.content?.url || ''}
                        onChange={(e) => updateElementContent(selectedElement.id, { url: e.target.value })}
                        placeholder="Or paste image URL (https://...)"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Alt Text</label>
                      <input
                        type="text"
                        value={selectedElement.content?.alt || ''}
                        onChange={(e) => updateElementContent(selectedElement.id, { alt: e.target.value })}
                        placeholder="Image description for accessibility..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Caption</label>
                      <input
                        type="text"
                        value={selectedElement.content?.caption || ''}
                        onChange={(e) => updateElementContent(selectedElement.id, { caption: e.target.value })}
                        placeholder="Optional image caption..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {/* 5. IMAGE BOX (Each Image has its own section to modify title & description) */}
                {selectedElement.type === 'imagebox' && (() => {
                  const items: { id: string; url: string; title: string; description: string }[] =
                    selectedElement.content?.items && selectedElement.content.items.length > 0
                      ? selectedElement.content.items
                      : [
                          {
                            id: 'item-1',
                            url: selectedElement.content?.url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
                            title: selectedElement.content?.title || 'Feature Spotlight',
                            description: selectedElement.content?.description || 'Describe your visual highlight or workflow here.'
                          }
                        ];

                  const updateSection = (idx: number, patch: Partial<{ url: string; title: string; description: string }>) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], ...patch };
                    updateElementContent(selectedElement.id, {
                      items: next,
                      url: next[0].url,
                      title: next[0].title,
                      description: next[0].description
                    });
                  };

                  const addSectionItem = () => {
                    const newItem = {
                      id: 'item-' + Date.now(),
                      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
                      title: `New Section ${items.length + 1}`,
                      description: 'Highlight your feature or service workflow here.'
                    };
                    const next = [...items, newItem];
                    updateElementContent(selectedElement.id, { items: next });
                  };

                  const deleteSectionItem = (idx: number) => {
                    if (items.length <= 1) return;
                    const next = items.filter((_, i) => i !== idx);
                    updateElementContent(selectedElement.id, {
                      items: next,
                      url: next[0].url,
                      title: next[0].title,
                      description: next[0].description
                    });
                  };

                  const handleSectionPCUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const dataUrl = event.target?.result as string;
                      if (dataUrl) {
                        updateSection(idx, { url: dataUrl });
                      }
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  };

                  return (
                    <div className="space-y-4">
                      {/* Section Header with Add Button & Collapse/Expand Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold text-slate-800 block">Image Sections</label>
                          <span className="text-[10px] text-slate-400">
                            Each section has its own image, URL, title & description
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              const allOpen = items.every((_, i) => expandedImageBoxSections[i]);
                              const next: Record<number, boolean> = {};
                              items.forEach((_, i) => { next[i] = !allOpen; });
                              setExpandedImageBoxSections(next);
                            }}
                            className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            {items.every((_, i) => expandedImageBoxSections[i]) ? 'Collapse All' : 'Expand All'}
                          </button>
                          <button
                            type="button"
                            onClick={addSectionItem}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>

                      {/* Interactive Slider Info & Controls when Multiple Sections exist */}
                      {items.length > 1 && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 rounded-xl p-3 space-y-2.5 shadow-2xs">
                          <div className="flex items-center space-x-2 text-indigo-900">
                            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold block">Interactive Image Slider</span>
                              <span className="text-[10px] text-indigo-600/90 leading-tight block">
                                Multiple sections automatically slide on the page with next/prev arrows & dots.
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-indigo-100">
                            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedElement.content?.autoSlide !== false}
                                onChange={(e) => updateElementContent(selectedElement.id, { autoSlide: e.target.checked })}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-[11px]">Auto Slide</span>
                            </label>

                            <div className="flex items-center space-x-1.5 justify-end">
                              <span className="text-[10px] text-slate-500 font-medium">Interval:</span>
                              <select
                                value={selectedElement.content?.slideInterval || 3}
                                onChange={(e) => updateElementContent(selectedElement.id, { slideInterval: Number(e.target.value) })}
                                className="px-1.5 py-0.5 bg-white border border-indigo-200 rounded text-[10px] font-bold text-indigo-700 focus:outline-none"
                              >
                                <option value={2}>2s</option>
                                <option value={3}>3s</option>
                                <option value={5}>5s</option>
                                <option value={7}>7s</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Image Sections List (Collapsible & Expandable) */}
                      <div className="space-y-2.5">
                        {items.map((item, idx) => {
                          const isOpen = expandedImageBoxSections[idx] ?? (idx === 0);
                          return (
                            <div
                              key={item.id || idx}
                              className="border border-slate-200 rounded-xl bg-slate-50/70 overflow-hidden transition-all hover:border-indigo-300 shadow-xs"
                            >
                              {/* Clickable Accordion Header */}
                              <div
                                onClick={() => {
                                  setExpandedImageBoxSections((prev) => ({
                                    ...prev,
                                    [idx]: !isOpen
                                  }));
                                }}
                                className="flex items-center justify-between p-2.5 cursor-pointer select-none hover:bg-slate-100/70 transition-colors"
                              >
                                <div className="flex items-center space-x-2.5 min-w-0">
                                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-200 shrink-0">
                                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                                      Section {idx + 1}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 truncate block">
                                      {item.title || 'Untitled Section'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const clonedItem = {
                                        ...JSON.parse(JSON.stringify(item)),
                                        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                                        title: (item.title || 'Section') + ' (Copy)'
                                      };
                                      const next = [...items];
                                      next.splice(idx + 1, 0, clonedItem);
                                      updateElementContent(selectedElement.id, { items: next });
                                    }}
                                    className="text-slate-400 hover:text-indigo-600 p-1 transition-colors rounded hover:bg-indigo-50"
                                    title="Duplicate this image section"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  {items.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteSectionItem(idx);
                                      }}
                                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors rounded hover:bg-rose-50"
                                      title="Delete this section"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <span className="p-1 text-slate-400 hover:text-slate-700">
                                    {isOpen ? (
                                      <ChevronDown className="w-4 h-4 text-slate-500" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-slate-500" />
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Expanded Form Controls */}
                              {isOpen && (
                                <div className="p-3 pt-1 space-y-2.5 border-t border-slate-200/60 bg-white">
                                  {/* Image URL Input (Keeps support of adding images with URL) */}
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-600">Image URL</label>
                                    <input
                                      type="text"
                                      value={item.url}
                                      onChange={(e) => updateSection(idx, { url: e.target.value })}
                                      placeholder="Paste image URL (https://...)"
                                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>

                                  {/* Upload from PC for this specific section */}
                                  <div>
                                    <label className="w-full py-1.5 px-2.5 bg-indigo-50/50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-indigo-200/70 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors shadow-xs">
                                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                                      <span>Choose Image from Your PC</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleSectionPCUpload(idx, e)}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>

                                  {/* Title input for this section */}
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-600">Title</label>
                                    <input
                                      type="text"
                                      value={item.title}
                                      onChange={(e) => updateSection(idx, { title: e.target.value })}
                                      placeholder="Section title..."
                                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>

                                  {/* Description textarea for this section */}
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-600">Description</label>
                                    <textarea
                                      rows={2}
                                      value={item.description}
                                      onChange={(e) => updateSection(idx, { description: e.target.value })}
                                      placeholder="Section description..."
                                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add New Section Button */}
                      <button
                        type="button"
                        onClick={addSectionItem}
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-dashed border-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add New Image Section</span>
                      </button>

                      {/* Display Layout Mode (Grid vs Slider Carousel) */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                        <label className="text-[11px] font-semibold text-slate-600 block">Layout Mode</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateElementContent(selectedElement.id, { displayMode: 'grid' })}
                            className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                              (selectedElement.content?.displayMode || 'grid') === 'grid'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Multi-Card Grid
                          </button>
                          <button
                            type="button"
                            onClick={() => updateElementContent(selectedElement.id, { displayMode: 'slider' })}
                            className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                              selectedElement.content?.displayMode === 'slider'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Interactive Slider
                          </button>
                        </div>

                        {/* Slider Controls for Image Box */}
                        {selectedElement.content?.displayMode === 'slider' && (
                          <div className="pt-2 border-t border-slate-200/70 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-slate-700">Auto Slide Loop</span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateElementContent(selectedElement.id, {
                                    autoSlide: selectedElement.content?.autoSlide === false ? true : false
                                  })
                                }
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                                  selectedElement.content?.autoSlide !== false
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : 'bg-slate-200 text-slate-600 border-slate-300'
                                }`}
                              >
                                {selectedElement.content?.autoSlide !== false ? 'ON' : 'OFF'}
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[11px] font-semibold text-slate-600">Slide Speed</span>
                              <div className="flex items-center space-x-1">
                                {[2, 3, 5].map((sec) => (
                                  <button
                                    key={sec}
                                    type="button"
                                    onClick={() => updateElementContent(selectedElement.id, { slideInterval: sec })}
                                    className={`px-2 py-0.5 text-[11px] font-bold rounded border ${
                                      (selectedElement.content?.slideInterval || 3) === sec
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white border-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {sec}s
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Slide Transition Effects for Image Box */}
                        <SlideEffectControls
                          selectedElement={selectedElement}
                          updateElementContent={updateElementContent}
                        />

                        {/* Image Box Navigation Arrows & Dots Options */}
                        <NavigationArrowsAndDotsControls
                          selectedElement={selectedElement}
                          updateElementContent={updateElementContent}
                          updateElementStyles={updateElementStyles}
                        />
                      </div>

                      {/* Image Box Dimensions: Width & Height */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                          Dimensions & Sizing
                        </span>

                        {/* Image Height with Stepper */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Image Height</label>
                            <span className="text-xs font-mono font-bold text-indigo-600">
                              {selectedElement.content?.imageHeight || '180px'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                min="40"
                                max="800"
                                value={currentImageHeight}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 180;
                                  updateElementContent(selectedElement.id, { imageHeight: `${val}px` });
                                }}
                                className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                              />
                              <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center">
                                <button
                                  type="button"
                                  onClick={() => changeImageHeight(10)}
                                  className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                  title="Increase height"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => changeImageHeight(-10)}
                                  className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                  title="Decrease height"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-400">px</span>
                          </div>
                          <div className="flex items-center space-x-1 pt-0.5">
                            {['140px', '180px', '220px', '280px', 'auto'].map((h) => (
                              <button
                                key={h}
                                type="button"
                                onClick={() => updateElementContent(selectedElement.id, { imageHeight: h })}
                                className={`flex-1 py-1 text-[10px] font-mono font-bold rounded ${
                                  (selectedElement.content?.imageHeight || '180px') === h
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300'
                                }`}
                              >
                                {h}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Image Width / Container Width */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Card / Box Width</label>
                            <span className="text-xs font-mono font-bold text-indigo-600">
                              {selectedElement.content?.cardWidth || '100%'}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {['100%', '300px', '380px', 'auto'].map((w) => (
                              <button
                                key={w}
                                type="button"
                                onClick={() =>
                                  updateElementContent(selectedElement.id, {
                                    cardWidth: w,
                                    imageWidth: w === 'auto' ? '100%' : w
                                  })
                                }
                                className={`py-1 text-[10px] font-mono font-bold rounded ${
                                  (selectedElement.content?.cardWidth || '100%') === w
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300'
                                }`}
                              >
                                {w}
                              </button>
                            ))}
                          </div>

                          {/* Image Box Alignment */}
                          <div className="space-y-1 pt-1 border-t border-slate-200/80">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Box Alignment</label>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { id: 'left', label: 'Left', icon: AlignLeft },
                                { id: 'center', label: 'Center', icon: AlignCenter },
                                { id: 'right', label: 'Right', icon: AlignRight }
                              ].map((al) => {
                                const Icon = al.icon;
                                const isAlSelected = (selectedElement.styles?.align || selectedElement.content?.align || 'center') === al.id;
                                return (
                                  <button
                                    key={al.id}
                                    type="button"
                                    onClick={() => {
                                      updateElementStyles(selectedElement.id, { align: al.id as any });
                                      updateElementContent(selectedElement.id, { align: al.id as any });
                                    }}
                                    className={`py-1 text-[10px] font-bold rounded-lg border flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                                      isAlSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                    }`}
                                  >
                                    <Icon className="w-3 h-3" />
                                    <span>{al.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Image Object Fit */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">Object Fit</label>
                          <div className="grid grid-cols-3 gap-1">
                            {['cover', 'contain', 'fill'].map((fit) => (
                              <button
                                key={fit}
                                type="button"
                                onClick={() => updateElementContent(selectedElement.id, { objectFit: fit })}
                                className={`py-1 text-[11px] font-bold capitalize rounded-lg border ${
                                  (selectedElement.content?.objectFit || 'cover') === fit
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white border-slate-200 text-slate-600'
                                }`}
                              >
                                {fit}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4b. BEFORE / AFTER COMPARISON SLIDER */}
                {selectedElement.type === 'beforeafter' && (
                  <div className="space-y-4">
                    {/* Before Image Card */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Before Image</span>
                        </label>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded">
                          Left / Top
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => beforeImageInputRef.current?.click()}
                        className="w-full py-2 px-3 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Before Image (PC)</span>
                      </button>
                      <input
                        ref={beforeImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBeforeImageUpload}
                        className="hidden"
                      />

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500">Image URL</label>
                        <input
                          type="text"
                          value={selectedElement.content?.beforeImage || ''}
                          onChange={(e) => updateElementContent(selectedElement.id, { beforeImage: e.target.value })}
                          placeholder="Paste Before image URL (https://...)"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500">Badge Label</label>
                        <input
                          type="text"
                          value={selectedElement.content?.beforeLabel !== undefined ? selectedElement.content.beforeLabel : 'Before'}
                          onChange={(e) => updateElementContent(selectedElement.id, { beforeLabel: e.target.value })}
                          placeholder="Before"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* After Image Card */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                          <span>After Image</span>
                        </label>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded">
                          Right / Bottom
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => afterImageInputRef.current?.click()}
                        className="w-full py-2 px-3 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload After Image (PC)</span>
                      </button>
                      <input
                        ref={afterImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAfterImageUpload}
                        className="hidden"
                      />

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500">Image URL</label>
                        <input
                          type="text"
                          value={selectedElement.content?.afterImage || ''}
                          onChange={(e) => updateElementContent(selectedElement.id, { afterImage: e.target.value })}
                          placeholder="Paste After image URL (https://...)"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500">Badge Label</label>
                        <input
                          type="text"
                          value={selectedElement.content?.afterLabel !== undefined ? selectedElement.content.afterLabel : 'After'}
                          onChange={(e) => updateElementContent(selectedElement.id, { afterLabel: e.target.value })}
                          placeholder="After"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Slider Settings Card */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Slider Controls</span>
                      </label>

                      {/* Split Position Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-semibold text-slate-600">Starting Split Position</span>
                          <span className="font-mono text-indigo-600 font-bold">
                            {typeof selectedElement.content?.sliderPosition === 'number' ? selectedElement.content.sliderPosition : 50}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={typeof selectedElement.content?.sliderPosition === 'number' ? selectedElement.content.sliderPosition : 50}
                          onChange={(e) => updateElementContent(selectedElement.id, { sliderPosition: Number(e.target.value) })}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Orientation */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-600 block">Split Orientation</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateElementContent(selectedElement.id, { orientation: 'horizontal' })}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                              (selectedElement.content?.orientation || 'horizontal') === 'horizontal'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                            }`}
                          >
                            <MoveLeft className="w-3 h-3" />
                            <span>Horizontal</span>
                            <MoveRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateElementContent(selectedElement.id, { orientation: 'vertical' })}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                              selectedElement.content?.orientation === 'vertical'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                            }`}
                          >
                            <ChevronUp className="w-3 h-3" />
                            <span>Vertical</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Show Labels Toggle */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-600">Show Label Badges</span>
                        <input
                          type="checkbox"
                          checked={selectedElement.content?.showLabels !== false}
                          onChange={(e) => updateElementContent(selectedElement.id, { showLabels: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                      </div>

                      {/* Image Height */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Slider Height</label>
                        <div className="grid grid-cols-4 gap-1">
                          {['320px', '400px', '480px', '600px'].map((h) => (
                            <button
                              key={h}
                              type="button"
                              onClick={() => updateElementContent(selectedElement.id, { imageHeight: h })}
                              className={`py-1 text-[11px] font-bold rounded-lg border cursor-pointer ${
                                (selectedElement.content?.imageHeight || '400px') === h
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Object Fit */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Object Fit</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {['cover', 'contain'].map((fit) => (
                            <button
                              key={fit}
                              type="button"
                              onClick={() => updateElementContent(selectedElement.id, { objectFit: fit })}
                              className={`py-1 text-[11px] font-bold capitalize rounded-lg border cursor-pointer ${
                                (selectedElement.content?.objectFit || 'cover') === fit
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              {fit}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. GALLERY & CAROUSEL (Collapsible Slides, Navigation, Auto Slide Loop & PC/URL Support) */}
                {(selectedElement.type === 'gallery' || selectedElement.type === 'carousel' || selectedElement.type === 'mediacarousel') && (() => {
                  const rawSlides =
                    selectedElement.content?.items && selectedElement.content.items.length > 0
                      ? selectedElement.content.items
                      : (selectedElement.content?.images && selectedElement.content.images.length > 0
                          ? selectedElement.content.images
                          : [
                              'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
                              'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
                              'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
                            ]);

                  const slides: { id: string; url: string; title: string; caption?: string }[] = rawSlides.map((item: any, i: number) => {
                    if (typeof item === 'string') {
                      return {
                        id: `slide-${i}`,
                        url: item,
                        title: `Slide ${i + 1}`,
                        caption: ''
                      };
                    }
                    return {
                      id: item.id || `slide-${i}`,
                      url: item.url || '',
                      title: item.title || `Slide ${i + 1}`,
                      caption: item.caption || item.description || ''
                    };
                  });

                  const updateSlide = (idx: number, patch: Partial<{ url: string; title: string; caption: string }>) => {
                    const next = [...slides];
                    next[idx] = { ...next[idx], ...patch };
                    updateElementContent(selectedElement.id, {
                      items: next,
                      images: next.map((s) => s.url)
                    });
                  };

                  const addSlide = () => {
                    const newSlide = {
                      id: 'slide-' + Date.now(),
                      url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
                      title: `Slide ${slides.length + 1}`,
                      caption: 'Showcase highlight'
                    };
                    const next = [...slides, newSlide];
                    updateElementContent(selectedElement.id, {
                      items: next,
                      images: next.map((s) => s.url)
                    });
                    setExpandedGallerySlides((prev) => ({ ...prev, [slides.length]: true }));
                  };

                  const deleteSlide = (idx: number) => {
                    if (slides.length <= 1) return;
                    const next = slides.filter((_, i) => i !== idx);
                    updateElementContent(selectedElement.id, {
                      items: next,
                      images: next.map((s) => s.url)
                    });
                  };

                  const handleSlidePCUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const dataUrl = event.target?.result as string;
                      if (dataUrl) {
                        updateSlide(idx, { url: dataUrl });
                      }
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  };

                  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    const next = [...slides];
                    let processed = 0;
                    Array.from(files).forEach((file, fIdx) => {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const dataUrl = ev.target?.result as string;
                        if (dataUrl) {
                          next.push({
                            id: 'slide-' + Date.now() + '-' + fIdx,
                            url: dataUrl,
                            title: file.name.replace(/\.[^/.]+$/, ''),
                            caption: ''
                          });
                        }
                        processed++;
                        if (processed === files.length) {
                          updateElementContent(selectedElement.id, {
                            items: next,
                            images: next.map((s) => s.url)
                          });
                        }
                      };
                      reader.readAsDataURL(file);
                    });
                    e.target.value = '';
                  };

                  const isCarousel = selectedElement.type === 'carousel' || selectedElement.type === 'mediacarousel';
                  const displayMode = selectedElement.content?.displayMode || (isCarousel ? 'slider' : (selectedElement.content?.columns ? 'grid' : 'slider'));

                  return (
                    <div className="space-y-4">
                      {/* Top Header & Actions */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold text-slate-800 block">Slides & Images</label>
                          <span className="text-[10px] text-slate-400">
                            {slides.length} {slides.length === 1 ? 'slide' : 'slides'} in gallery
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              const allOpen = slides.every((_, i) => expandedGallerySlides[i]);
                              const next: Record<number, boolean> = {};
                              slides.forEach((_, i) => { next[i] = !allOpen; });
                              setExpandedGallerySlides(next);
                            }}
                            className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            {slides.every((_, i) => expandedGallerySlides[i]) ? 'Collapse All' : 'Expand All'}
                          </button>
                          <button
                            type="button"
                            onClick={addSlide}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>

                      {/* Upload Multiple from PC Button */}
                      <div>
                        <label className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-xs cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>+ Upload Multiple Photos from PC</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleBatchUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Collapsible & Expandable Slide Items */}
                      <div className="space-y-2.5">
                        {slides.map((slide, idx) => {
                          const isOpen = expandedGallerySlides[idx] ?? (idx === 0);
                          return (
                            <div
                              key={slide.id || idx}
                              className="border border-slate-200 rounded-xl bg-slate-50/70 overflow-hidden transition-all hover:border-indigo-300 shadow-xs"
                            >
                              {/* Slide Header with Thumbnail, Title & Collapse Toggle */}
                              <div
                                onClick={() => {
                                  setExpandedGallerySlides((prev) => ({
                                    ...prev,
                                    [idx]: !isOpen
                                  }));
                                }}
                                className="flex items-center justify-between p-2.5 cursor-pointer select-none hover:bg-slate-100/70 transition-colors"
                              >
                                <div className="flex items-center space-x-2.5 min-w-0">
                                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-200 shrink-0">
                                    <img src={slide.url} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                                      Slide {idx + 1}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 truncate block">
                                      {slide.title || 'Untitled Slide'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const clonedSlide = {
                                        ...JSON.parse(JSON.stringify(slide)),
                                        id: 'slide-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                                        title: (slide.title || 'Slide') + ' (Copy)'
                                      };
                                      const next = [...slides];
                                      next.splice(idx + 1, 0, clonedSlide);
                                      updateElementContent(selectedElement.id, {
                                        items: next,
                                        images: next.map((s) => s.url)
                                      });
                                    }}
                                    className="text-slate-400 hover:text-indigo-600 p-1 transition-colors rounded hover:bg-indigo-50"
                                    title="Duplicate this slide"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  {slides.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteSlide(idx);
                                      }}
                                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors rounded hover:bg-rose-50"
                                      title="Delete slide"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <span className="p-1 text-slate-400 hover:text-slate-700">
                                    {isOpen ? (
                                      <ChevronDown className="w-4 h-4 text-slate-500" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-slate-500" />
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Expanded Form Controls */}
                              {isOpen && (
                                <div className="p-3 pt-1 space-y-2.5 border-t border-slate-200/60 bg-white">
                                  {/* Image URL Input (Keeps URL support) */}
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-600">Image URL</label>
                                    <input
                                      type="text"
                                      value={slide.url}
                                      onChange={(e) => updateSlide(idx, { url: e.target.value })}
                                      placeholder="Paste image URL (https://...)"
                                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>

                                  {/* Upload from PC for this specific slide */}
                                  <div>
                                    <label className="w-full py-1.5 px-2.5 bg-indigo-50/50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-indigo-200/70 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors shadow-xs">
                                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                                      <span>Choose Photo from Your PC</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleSlidePCUpload(idx, e)}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>

                                  {/* Slide Caption / Title */}
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-600">Caption / Title</label>
                                    <input
                                      type="text"
                                      value={slide.title}
                                      onChange={(e) => updateSlide(idx, { title: e.target.value })}
                                      placeholder="Optional slide title..."
                                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add New Slide Button */}
                      <button
                        type="button"
                        onClick={addSlide}
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-dashed border-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add New Slide</span>
                      </button>

                      {/* Display Mode Selector: Slider Carousel vs Grid */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                        <label className="text-[11px] font-semibold text-slate-700 block">Display Mode</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateElementContent(selectedElement.id, { displayMode: 'slider' })}
                            className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                              displayMode === 'slider'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Slider / Carousel
                          </button>
                          <button
                            type="button"
                            onClick={() => updateElementContent(selectedElement.id, { displayMode: 'grid' })}
                            className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                              displayMode === 'grid'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Multi-Column Grid
                          </button>
                        </div>

                        {/* Grid Columns Setting when in Grid mode */}
                        {displayMode === 'grid' && (
                          <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-600">Grid Columns</label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[2, 3, 4].map((colNum) => (
                                <button
                                  key={colNum}
                                  type="button"
                                  onClick={() => updateElementContent(selectedElement.id, { columns: colNum })}
                                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                    (selectedElement.content?.columns || 3) === colNum
                                      ? 'bg-indigo-600 text-white border-indigo-600'
                                      : 'bg-white border-slate-200 text-slate-600'
                                  }`}
                                >
                                  {colNum} Columns
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Slider Controls when in Slider mode */}
                        {displayMode === 'slider' && (
                          <div className="pt-2 border-t border-slate-200/70 space-y-3">
                            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                              Slider & Loop Settings
                            </span>

                            {/* Auto Slide Loop Toggle */}
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-slate-800 block">Auto Slide Loop</span>
                                <span className="text-[10px] text-slate-400">Keep auto-sliding images in a continuous loop</span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  updateElementContent(selectedElement.id, {
                                    autoSlide: selectedElement.content?.autoSlide === false ? true : false
                                  })
                                }
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                                  selectedElement.content?.autoSlide !== false
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                                    : 'bg-slate-200 text-slate-600 border-slate-300'
                                }`}
                              >
                                {selectedElement.content?.autoSlide !== false ? 'Loop ON' : 'Loop OFF'}
                              </button>
                            </div>

                            {/* Slide Speed / Interval */}
                            {selectedElement.content?.autoSlide !== false && (
                              <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-600">Slide Speed (Loop Interval)</label>
                                <div className="grid grid-cols-5 gap-1">
                                  {[2, 3, 4, 5, 8].map((sec) => (
                                    <button
                                      key={sec}
                                      type="button"
                                      onClick={() => updateElementContent(selectedElement.id, { slideInterval: sec })}
                                      className={`py-1 text-xs font-bold rounded-lg border transition-all ${
                                        (selectedElement.content?.slideInterval || 3) === sec
                                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      {sec}s
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Slide Transition Effects for Carousel */}
                            <SlideEffectControls
                              selectedElement={selectedElement}
                              updateElementContent={updateElementContent}
                            />

                            {/* Navigation Arrows & Dots Controls */}
                            <NavigationArrowsAndDotsControls
                              selectedElement={selectedElement}
                              updateElementContent={updateElementContent}
                              updateElementStyles={updateElementStyles}
                            />

                            {/* Slide Height */}
                            <div className="space-y-1 pt-1">
                              <label className="text-[11px] font-semibold text-slate-600">Slide Height</label>
                              <div className="grid grid-cols-5 gap-1">
                                {['220px', '280px', '340px', '400px', 'auto'].map((h) => (
                                  <button
                                    key={h}
                                    type="button"
                                    onClick={() => updateElementContent(selectedElement.id, { slideHeight: h })}
                                    className={`py-1 text-[11px] font-bold rounded-lg border transition-all ${
                                      (selectedElement.content?.slideHeight || '320px') === h
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    {h}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Object Fit */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-600">Image Fit</label>
                              <div className="grid grid-cols-3 gap-1">
                                {['cover', 'contain', 'fill'].map((fit) => (
                                  <button
                                    key={fit}
                                    type="button"
                                    onClick={() => updateElementContent(selectedElement.id, { objectFit: fit })}
                                    className={`py-1 text-xs font-bold capitalize rounded-lg border transition-all ${
                                      (selectedElement.content?.objectFit || 'cover') === fit
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    {fit}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Slide Image Opacity Feature */}
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Slide Image Opacity</span>
                                </label>
                                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                  {Math.round((Number(selectedElement.content?.opacity ?? selectedElement.styles?.opacity ?? 1)) * 100)}%
                                </span>
                              </div>

                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={selectedElement.content?.opacity ?? selectedElement.styles?.opacity ?? 1}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  updateElementContent(selectedElement.id, { opacity: val });
                                  updateElementStyles(selectedElement.id, { opacity: val });
                                }}
                                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                              />

                              <div className="grid grid-cols-5 gap-1 pt-1">
                                {[1, 0.85, 0.7, 0.5, 0.25].map((op) => {
                                  const currentOp = Number(selectedElement.content?.opacity ?? selectedElement.styles?.opacity ?? 1);
                                  const isSel = Math.abs(currentOp - op) < 0.05;
                                  return (
                                    <button
                                      key={op}
                                      type="button"
                                      onClick={() => {
                                        updateElementContent(selectedElement.id, { opacity: op });
                                        updateElementStyles(selectedElement.id, { opacity: op });
                                      }}
                                      className={`py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                                        isSel
                                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      {Math.round(op * 100)}%
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 5.5 NAVIGATION BAR (Layout presets, Style themes, Links list & CTA) */}
                {selectedElement.type === 'navigation' && (() => {
                  const navLayout = selectedElement.styles?.navLayout || selectedElement.content?.navLayout || 'standard';
                  const navStyle = selectedElement.styles?.navStyle || selectedElement.content?.navStyle || 'clean';

                  return (
                    <div className="space-y-4">
                      {/* Navigation Layout Preset */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800">Navigation Layout</label>
                          <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase">{navLayout}</span>
                        </div>
                        <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg flex items-center space-x-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Responsive Autopilot: auto-formats across desktop, tablet & mobile</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'standard', label: 'Standard (Left/Right)' },
                            { id: 'brand-left', label: 'Brand & Links Left' },
                            { id: 'centered', label: 'Centered Links' },
                            { id: 'split', label: 'Split (Logo Center)' },
                            { id: 'minimal', label: 'Minimal (Right Stack)' },
                            { id: 'stacked', label: 'Stacked (2-Tier)' }
                          ].map((layout) => (
                            <button
                              key={layout.id}
                              type="button"
                              onClick={() => {
                                updateElementStyles(selectedElement.id, { navLayout: layout.id as any });
                                updateElementContent(selectedElement.id, { navLayout: layout.id });
                              }}
                              className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border text-left transition-all ${
                                navLayout === layout.id
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                              }`}
                            >
                              {layout.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Navigation Visual Style Preset */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800">Visual Theme & Style</label>
                          <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase">{navStyle}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'clean', label: 'Clean Flat' },
                            { id: 'glass', label: 'Glassmorphic' },
                            { id: 'floating', label: 'Floating Pill' },
                            { id: 'bordered', label: 'Border Bottom' },
                            { id: 'dark', label: 'Dark Sleek' },
                            { id: 'gradient', label: 'Gradient Pop' }
                          ].map((stylePreset) => (
                            <button
                              key={stylePreset.id}
                              type="button"
                              onClick={() => {
                                updateElementStyles(selectedElement.id, { navStyle: stylePreset.id as any });
                                updateElementContent(selectedElement.id, { navStyle: stylePreset.id });
                              }}
                              className={`py-1.5 px-1.5 text-[10px] font-bold rounded-lg border text-center transition-all ${
                                navStyle === stylePreset.id
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                              }`}
                            >
                              {stylePreset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sticky Navigation Info & Shortcut to Advanced */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <Pin className="w-3.5 h-3.5 text-indigo-600" />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Sticky Navigation</span>
                            <span className="text-[10px] text-slate-400">
                              {(selectedElement.styles?.isSticky ?? selectedElement.content?.isSticky) ? 'Active' : 'Disabled'} &bull; Moved to Advanced
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('advanced')}
                          className="px-2 py-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Open in Advanced</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Logo Text & Brand Name */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Brand Logo Text</label>
                        <input
                          type="text"
                          value={selectedElement.content?.logoText || 'NextForge'}
                          onChange={(e) => updateElementContent(selectedElement.id, { logoText: e.target.value })}
                          placeholder="Brand name..."
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Menu Links Manager (Compact & Collapsible) */}
                      <NavigationLinksManager
                        selectedElement={selectedElement}
                        updateElementContent={updateElementContent}
                        pages={pages}
                        sections={sections}
                      />

                      {/* CTA Button Settings */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800">CTA Action Button</label>
                          <button
                            type="button"
                            onClick={() =>
                              updateElementContent(selectedElement.id, {
                                showCta: selectedElement.content?.showCta === false ? true : false
                              })
                            }
                            className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border transition-all ${
                              selectedElement.content?.showCta !== false
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-200 text-slate-600 border-slate-300'
                            }`}
                          >
                            {selectedElement.content?.showCta !== false ? 'Enabled' : 'Hidden'}
                          </button>
                        </div>

                        {selectedElement.content?.showCta !== false && (
                          <div className="space-y-2 pt-1 border-t border-slate-200">
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-500 font-semibold">Button Text</span>
                              <input
                                type="text"
                                value={selectedElement.content?.ctaText || 'Get Started'}
                                onChange={(e) => updateElementContent(selectedElement.id, { ctaText: e.target.value })}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <LinkDestinationPicker
                              value={selectedElement.content?.ctaUrl || ''}
                              onChange={(ctaUrl) => updateElementContent(selectedElement.id, { ctaUrl })}
                              pages={pages}
                              sections={sections}
                              label="CTA Button Link"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 6. CALL TO ACTION (CTA) */}
                {selectedElement.type === 'cta' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Headline</label>
                      <input
                        type="text"
                        value={selectedElement.content?.headline || ''}
                        onChange={(e) => updateElementContent(selectedElement.id, { headline: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Subheadline</label>
                      <textarea
                        rows={2}
                        value={selectedElement.content?.subheadline || ''}
                        onChange={(e) => updateElementContent(selectedElement.id, { subheadline: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Button Label</label>
                      <input
                        type="text"
                        value={selectedElement.content?.buttonText || ''}
                        onChange={(e) => updateElementContent(selectedElement.id, { buttonText: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <LinkDestinationPicker
                      value={selectedElement.content?.url || selectedElement.content?.buttonUrl || ''}
                      onChange={(url) => updateElementContent(selectedElement.id, { url })}
                      pages={pages}
                      sections={sections}
                      label="Button Link Destination"
                    />
                  </>
                )}


                {/* 7. FORM (Dynamic fields with Add, Reorder, Delete) */}
                {/* 7. FORM (Dynamic fields with Add, Reorder, Delete, and Collapsible Cards) */}
                {selectedElement.type === 'form' && (() => {
                  const fields = selectedElement.content?.fields && selectedElement.content.fields.length > 0
                    ? selectedElement.content.fields
                    : [
                        { id: 'f-1', label: 'Full Name', type: 'text', placeholder: 'Full Name...', required: true },
                        { id: 'f-2', label: 'Email Address', type: 'email', placeholder: 'Email Address...', required: true },
                        { id: 'f-3', label: 'Message', type: 'textarea', placeholder: 'Your message or inquiry...', required: false }
                      ];

                  return (
                    <div className="space-y-3">
                      {/* Form Title & Submit Button Text */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Form Title</label>
                          <input
                            type="text"
                            value={selectedElement.content?.title || ''}
                            onChange={(e) => updateElementContent(selectedElement.id, { title: e.target.value })}
                            placeholder="e.g. Contact Us"
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Button Text</label>
                          <input
                            type="text"
                            value={selectedElement.content?.buttonText || 'Submit Form'}
                            onChange={(e) => updateElementContent(selectedElement.id, { buttonText: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Button Width & Form Width */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Button Width</label>
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              onClick={() => updateElementContent(selectedElement.id, { buttonWidth: 'full' })}
                              className={`py-1 text-[11px] font-bold rounded-lg border ${
                                (selectedElement.content?.buttonWidth || 'full') === 'full'
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              Full
                            </button>
                            <button
                              type="button"
                              onClick={() => updateElementContent(selectedElement.id, { buttonWidth: 'auto' })}
                              className={`py-1 text-[11px] font-bold rounded-lg border ${
                                selectedElement.content?.buttonWidth === 'auto'
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              Auto
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Form Width</label>
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              onClick={() => updateElementStyles(selectedElement.id, { widthType: 'boxed' })}
                              className={`py-1 text-[11px] font-bold rounded-lg border transition-all ${
                                (selectedElement.styles?.widthType || 'boxed') === 'boxed'
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              Standard
                            </button>
                            <button
                              type="button"
                              onClick={() => updateElementStyles(selectedElement.id, { widthType: 'screen' })}
                              className={`py-1 text-[11px] font-bold rounded-lg border transition-all ${
                                selectedElement.styles?.widthType === 'screen'
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              Screen
                            </button>
                          </div>

                          {/* Form Alignment */}
                          <div className="space-y-1 pt-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Form Alignment</label>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { id: 'left', label: 'Left', icon: AlignLeft },
                                { id: 'center', label: 'Center', icon: AlignCenter },
                                { id: 'right', label: 'Right', icon: AlignRight }
                              ].map((al) => {
                                const Icon = al.icon;
                                const isAlSelected = (selectedElement.styles?.align || 'center') === al.id;
                                return (
                                  <button
                                    key={al.id}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { align: al.id as any })}
                                    className={`py-1 text-[10px] font-bold rounded-lg border flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                                      isAlSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                    }`}
                                  >
                                    <Icon className="w-3 h-3" />
                                    <span>{al.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Fields List */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <label className="text-[11px] font-bold text-slate-700">
                              Form Fields ({fields.length})
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const allOpen = fields.every((_: any, i: number) => expandedFormFields[i]);
                                const next: Record<number, boolean> = {};
                                fields.forEach((_: any, i: number) => {
                                  next[i] = !allOpen;
                                });
                                setExpandedFormFields(next);
                              }}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              {fields.every((_: any, i: number) => expandedFormFields[i]) ? 'Collapse All' : 'Expand All'}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const newF = {
                                id: 'f-' + Date.now(),
                                label: 'New Field',
                                type: 'text',
                                placeholder: 'Enter text...',
                                required: false
                              };
                              const nextFields = [...fields, newF];
                              updateElementContent(selectedElement.id, { fields: nextFields });
                              setExpandedFormFields((prev) => ({ ...prev, [nextFields.length - 1]: true }));
                            }}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Field</span>
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-[520px] overflow-y-auto nextforge-scrollbar pr-0.5">
                          {fields.map((f: any, idx: number, arr: any[]) => {
                            const isFieldExpanded = expandedFormFields[idx] ?? (idx === 0);

                            return (
                              <div
                                key={f.id || idx}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', String(idx));
                                  setDraggedFieldIndex(idx);
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  if (dragOverFieldIndex !== idx) setDragOverFieldIndex(idx);
                                }}
                                onDragLeave={() => {
                                  if (dragOverFieldIndex === idx) setDragOverFieldIndex(null);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const sourceIdx = draggedFieldIndex ?? parseInt(e.dataTransfer.getData('text/plain'));
                                  if (sourceIdx !== null && !isNaN(sourceIdx) && sourceIdx !== idx) {
                                    const nextArr = [...arr];
                                    const [moved] = nextArr.splice(sourceIdx, 1);
                                    nextArr.splice(idx, 0, moved);
                                    updateElementContent(selectedElement.id, { fields: nextArr });
                                  }
                                  setDraggedFieldIndex(null);
                                  setDragOverFieldIndex(null);
                                }}
                                onDragEnd={() => {
                                  setDraggedFieldIndex(null);
                                  setDragOverFieldIndex(null);
                                }}
                                className={`bg-white border rounded-xl transition-all overflow-hidden ${
                                  dragOverFieldIndex === idx
                                    ? 'border-indigo-500 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-400'
                                    : 'border-slate-200 shadow-2xs'
                                }`}
                              >
                                {/* Field Item Header (Click to toggle collapse/expand) */}
                                <div
                                  onClick={() => {
                                    setExpandedFormFields((prev) => ({
                                      ...prev,
                                      [idx]: !isFieldExpanded
                                    }));
                                  }}
                                  className="px-2.5 py-1.5 flex items-center justify-between cursor-pointer select-none bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
                                >
                                  <div className="flex items-center space-x-1.5 min-w-0">
                                    <span
                                      className="cursor-grab active:cursor-grabbing p-0.5 text-slate-400 hover:text-indigo-600"
                                      onClick={(e) => e.stopPropagation()}
                                      title="Drag to reorder"
                                    >
                                      <GripVertical className="w-3.5 h-3.5" />
                                    </span>

                                    <span className="text-slate-400">
                                      {isFieldExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      )}
                                    </span>

                                    <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]" title={f.label}>
                                      {f.label || `Field ${idx + 1}`}
                                    </span>

                                    {f.required && (
                                      <span className="text-rose-500 font-bold text-[10px]">*</span>
                                    )}

                                    <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 bg-slate-200/80 text-slate-600 rounded">
                                      {f.type || 'text'}
                                    </span>
                                  </div>

                                  {/* Quick Actions (Up, Down, Duplicate, Delete) */}
                                  <div className="flex items-center space-x-0.5" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => {
                                        const nextArr = [...arr];
                                        const [moved] = nextArr.splice(idx, 1);
                                        nextArr.splice(idx - 1, 0, moved);
                                        updateElementContent(selectedElement.id, { fields: nextArr });
                                      }}
                                      className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                                      title="Move Up"
                                    >
                                      <ChevronUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === arr.length - 1}
                                      onClick={() => {
                                        const nextArr = [...arr];
                                        const [moved] = nextArr.splice(idx, 1);
                                        nextArr.splice(idx + 1, 0, moved);
                                        updateElementContent(selectedElement.id, { fields: nextArr });
                                      }}
                                      className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                                      title="Move Down"
                                    >
                                      <ChevronDown className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextArr = [...arr];
                                        const cloned = {
                                          ...JSON.parse(JSON.stringify(f)),
                                          id: 'field-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                                          label: (f.label || 'Field') + ' (Copy)'
                                        };
                                        nextArr.splice(idx + 1, 0, cloned);
                                        updateElementContent(selectedElement.id, { fields: nextArr });
                                      }}
                                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                      title="Duplicate Field"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextArr = arr.filter((_, i) => i !== idx);
                                        updateElementContent(selectedElement.id, { fields: nextArr });
                                      }}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                      title="Delete Field"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Collapsible Field Body (Inputs) */}
                                {isFieldExpanded && (
                                  <div className="p-2.5 pt-2 border-t border-slate-100 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-0.5">
                                        <span className="text-[10px] text-slate-500 font-semibold">Label</span>
                                        <input
                                          type="text"
                                          value={f.label}
                                          onChange={(e) => {
                                            const nextArr = [...arr];
                                            nextArr[idx] = { ...f, label: e.target.value };
                                            updateElementContent(selectedElement.id, { fields: nextArr });
                                          }}
                                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                                        />
                                      </div>
                                      <div className="space-y-0.5">
                                        <span className="text-[10px] text-slate-500 font-semibold">Field Type</span>
                                        <select
                                          value={f.type || 'text'}
                                          onChange={(e) => {
                                            const nextArr = [...arr];
                                            nextArr[idx] = { ...f, type: e.target.value };
                                            updateElementContent(selectedElement.id, { fields: nextArr });
                                          }}
                                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                                        >
                                          <option value="text">Text Input</option>
                                          <option value="email">Email</option>
                                          <option value="tel">Phone</option>
                                          <option value="textarea">Textarea</option>
                                          <option value="number">Number</option>
                                          <option value="select">Dropdown</option>
                                        </select>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-2 pt-0.5">
                                      <input
                                        type="text"
                                        value={f.placeholder || ''}
                                        onChange={(e) => {
                                          const nextArr = [...arr];
                                          nextArr[idx] = { ...f, placeholder: e.target.value };
                                          updateElementContent(selectedElement.id, { fields: nextArr });
                                        }}
                                        placeholder="Placeholder..."
                                        className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none"
                                      />
                                      <label className="flex items-center space-x-1.5 text-[10px] font-semibold text-slate-600 whitespace-nowrap cursor-pointer px-1 py-0.5 rounded hover:bg-slate-100">
                                        <input
                                          type="checkbox"
                                          checked={!!f.required}
                                          onChange={(e) => {
                                            const nextArr = [...arr];
                                            nextArr[idx] = { ...f, required: e.target.checked };
                                            updateElementContent(selectedElement.id, { fields: nextArr });
                                          }}
                                          className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                        />
                                        <span>Required</span>
                                      </label>
                                    </div>

                                    {/* Options for select/dropdown */}
                                    {f.type === 'select' && (
                                      <div className="space-y-0.5 pt-1">
                                        <span className="text-[10px] text-slate-500 font-semibold">Options (comma separated)</span>
                                        <input
                                          type="text"
                                          value={(f.options || []).join(', ')}
                                          onChange={(e) => {
                                            const nextArr = [...arr];
                                            nextArr[idx] = {
                                              ...f,
                                              options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                                            };
                                            updateElementContent(selectedElement.id, { fields: nextArr });
                                          }}
                                          placeholder="e.g. Option 1, Option 2, Option 3"
                                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 8. TESTIMONIAL (With PC Avatar Upload) */}
                {selectedElement.type === 'testimonial' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Quote Text</label>
                      <textarea
                        rows={3}
                        value={selectedElement.content?.quote || ''}
                        onChange={(e) => updateElementContent(selectedElement.id, { quote: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Author Name</label>
                      <input
                        type="text"
                        value={selectedElement.content?.author || ''}
                        onChange={(e) => updateElementContent(selectedElement.id, { author: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Author Role / Company</label>
                      <input
                        type="text"
                        value={selectedElement.content?.role || ''}
                        onChange={(e) => updateElementContent(selectedElement.id, { role: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-600">Avatar Image</label>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Avatar from PC</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSingleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </>
                )}

                {/* 9. ACCORDION (FAQ with Drag & Drop, Add, Reorder, Delete) */}
                {selectedElement.type === 'accordion' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Accordion Width</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateElementStyles(selectedElement.id, { widthType: 'boxed' })}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            (selectedElement.styles?.widthType || 'boxed') === 'boxed'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          Standard
                        </button>
                        <button
                          type="button"
                          onClick={() => updateElementStyles(selectedElement.id, { widthType: 'screen' })}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            selectedElement.styles?.widthType === 'screen'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          Screen Width
                        </button>
                      </div>

                      {/* Accordion Alignment */}
                      <div className="space-y-1 pt-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Accordion Alignment</label>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { id: 'left', label: 'Left', icon: AlignLeft },
                            { id: 'center', label: 'Center', icon: AlignCenter },
                            { id: 'right', label: 'Right', icon: AlignRight }
                          ].map((al) => {
                            const Icon = al.icon;
                            const isAlSelected = (selectedElement.styles?.align || 'center') === al.id;
                            return (
                              <button
                                key={al.id}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { align: al.id as any })}
                                className={`py-1 text-[10px] font-bold rounded-lg border flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                                  isAlSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                }`}
                              >
                                <Icon className="w-3 h-3" />
                                <span>{al.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700">
                        Accordion Items ({(selectedElement.content?.items || []).length})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const items = selectedElement.content?.items || [
                            { id: 'acc-1', q: 'Question 1', a: 'Answer 1' }
                          ];
                          updateElementContent(selectedElement.id, {
                            items: [
                              ...items,
                              { id: 'acc-' + Date.now(), q: 'New Question', a: 'New Answer description here.' }
                            ]
                          });
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[520px] overflow-y-auto nextforge-scrollbar pr-0.5">
                      {(selectedElement.content?.items || [
                        { id: 'acc-1', q: selectedElement.content?.title1 || 'Why choose NextForge?', a: 'High speed clean code.' }
                      ]).map((item: any, idx: number, arr: any[]) => (
                        <div
                          key={item.id || idx}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', String(idx));
                            setDraggedAccIndex(idx);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragOverAccIndex !== idx) setDragOverAccIndex(idx);
                          }}
                          onDragLeave={() => {
                            if (dragOverAccIndex === idx) setDragOverAccIndex(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const sourceIdx = draggedAccIndex ?? parseInt(e.dataTransfer.getData('text/plain'));
                            if (sourceIdx !== null && !isNaN(sourceIdx) && sourceIdx !== idx) {
                              const nextArr = [...arr];
                              const [moved] = nextArr.splice(sourceIdx, 1);
                              nextArr.splice(idx, 0, moved);
                              updateElementContent(selectedElement.id, { items: nextArr });
                            }
                            setDraggedAccIndex(null);
                            setDragOverAccIndex(null);
                          }}
                          onDragEnd={() => {
                            setDraggedAccIndex(null);
                            setDragOverAccIndex(null);
                          }}
                          className={`p-2.5 bg-slate-50 border rounded-xl space-y-2 transition-all ${
                            dragOverAccIndex === idx
                              ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-2 ring-indigo-400/50'
                              : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <span className="cursor-grab active:cursor-grabbing p-0.5 text-slate-400 hover:text-indigo-600 rounded" title="Drag to reorder">
                                <GripVertical className="w-3.5 h-3.5" />
                              </span>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  const nextArr = [...arr];
                                  const [moved] = nextArr.splice(idx, 1);
                                  nextArr.splice(idx - 1, 0, moved);
                                  updateElementContent(selectedElement.id, { items: nextArr });
                                }}
                                className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                                title="Move Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === arr.length - 1}
                                onClick={() => {
                                  const nextArr = [...arr];
                                  const [moved] = nextArr.splice(idx, 1);
                                  nextArr.splice(idx + 1, 0, moved);
                                  updateElementContent(selectedElement.id, { items: nextArr });
                                }}
                                className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                                title="Move Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-[10px] font-bold text-slate-700 font-mono">
                                Item #{idx + 1}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextArr = [...arr];
                                  const cloned = {
                                    ...JSON.parse(JSON.stringify(item)),
                                    id: 'acc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                                    q: (item.q || 'Question') + ' (Copy)'
                                  };
                                  nextArr.splice(idx + 1, 0, cloned);
                                  updateElementContent(selectedElement.id, { items: nextArr });
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                title="Duplicate this accordion item"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextArr = arr.filter((_, i) => i !== idx);
                                  updateElementContent(selectedElement.id, { items: nextArr });
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Delete Item"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={item.q}
                            onChange={(e) => {
                              const nextArr = [...arr];
                              nextArr[idx] = { ...item, q: e.target.value };
                              updateElementContent(selectedElement.id, { items: nextArr });
                            }}
                            placeholder="Question"
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800"
                          />
                          <textarea
                            rows={2}
                            value={item.a}
                            onChange={(e) => {
                              const nextArr = [...arr];
                              nextArr[idx] = { ...item, a: e.target.value };
                              updateElementContent(selectedElement.id, { items: nextArr });
                            }}
                            placeholder="Answer"
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. PRICING CARD */}
                {selectedElement.type === 'pricingcard' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Plan Name</label>
                      <input
                        type="text"
                        value={selectedElement.content?.planName || 'Pro Tier'}
                        onChange={(e) => updateElementContent(selectedElement.id, { planName: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Price</label>
                        <input
                          type="text"
                          value={selectedElement.content?.price || '$29'}
                          onChange={(e) => updateElementContent(selectedElement.id, { price: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Interval</label>
                        <input
                          type="text"
                          value={selectedElement.content?.interval || '/ month'}
                          onChange={(e) => updateElementContent(selectedElement.id, { interval: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Badge</label>
                        <input
                          type="text"
                          value={selectedElement.content?.badge || ''}
                          placeholder="e.g. Most Popular"
                          onChange={(e) => updateElementContent(selectedElement.id, { badge: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Button Text</label>
                        <input
                          type="text"
                          value={selectedElement.content?.buttonText || 'Get Started Now'}
                          onChange={(e) => updateElementContent(selectedElement.id, { buttonText: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Features Bullets List */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700">
                          Features ({selectedElement.content?.features?.length || 3})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const current = selectedElement.content?.features || [
                              'Unlimited dynamic pages',
                              '1-Click ZIP Next.js code export',
                              'Cloudflare D1 & SQLite Ready'
                            ];
                            updateElementContent(selectedElement.id, {
                              features: [...current, 'New feature bullet']
                            });
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Feature</span>
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-56 overflow-y-auto nextforge-scrollbar pr-0.5">
                        {(selectedElement.content?.features || [
                          'Unlimited dynamic pages',
                          '1-Click ZIP Next.js code export',
                          'Cloudflare D1 & SQLite Ready'
                        ]).map((feat: string, idx: number, arr: string[]) => (
                          <div key={idx} className="flex items-center space-x-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="flex flex-col">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  const nextArr = [...arr];
                                  const [moved] = nextArr.splice(idx, 1);
                                  nextArr.splice(idx - 1, 0, moved);
                                  updateElementContent(selectedElement.id, { features: nextArr });
                                }}
                                className="text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                                title="Move Up"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === arr.length - 1}
                                onClick={() => {
                                  const nextArr = [...arr];
                                  const [moved] = nextArr.splice(idx, 1);
                                  nextArr.splice(idx + 1, 0, moved);
                                  updateElementContent(selectedElement.id, { features: nextArr });
                                }}
                                className="text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                                title="Move Down"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={feat}
                              onChange={(e) => {
                                const nextArr = [...arr];
                                nextArr[idx] = e.target.value;
                                updateElementContent(selectedElement.id, { features: nextArr });
                              }}
                              className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800"
                            />
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextArr = [...arr];
                                  nextArr.splice(idx + 1, 0, `${feat} (Copy)`);
                                  updateElementContent(selectedElement.id, { features: nextArr });
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                title="Duplicate feature bullet"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextArr = arr.filter((_, i) => i !== idx);
                                  updateElementContent(selectedElement.id, { features: nextArr });
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Delete Bullet"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 11. TABS (With Drag & Drop, Screen Width, Add, Reorder, Delete) */}
                {selectedElement.type === 'tabs' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Tabs Width</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateElementStyles(selectedElement.id, { widthType: 'boxed' })}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            (selectedElement.styles?.widthType || 'boxed') === 'boxed'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          Standard
                        </button>
                        <button
                          type="button"
                          onClick={() => updateElementStyles(selectedElement.id, { widthType: 'screen' })}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            selectedElement.styles?.widthType === 'screen'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          Screen Width
                        </button>
                      </div>

                      {/* Tabs Alignment */}
                      <div className="space-y-1 pt-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tabs Alignment</label>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { id: 'left', label: 'Left', icon: AlignLeft },
                            { id: 'center', label: 'Center', icon: AlignCenter },
                            { id: 'right', label: 'Right', icon: AlignRight }
                          ].map((al) => {
                            const Icon = al.icon;
                            const isAlSelected = (selectedElement.styles?.align || 'center') === al.id;
                            return (
                              <button
                                key={al.id}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { align: al.id as any })}
                                className={`py-1 text-[10px] font-bold rounded-lg border flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                                  isAlSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                }`}
                              >
                                <Icon className="w-3 h-3" />
                                <span>{al.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-0.5">
                        When tab items exceed container, horizontal scrollbar appears automatically.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700">
                        Tabs ({(selectedElement.content?.tabs || []).length || 3})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = selectedElement.content?.tabs || [
                            { label: 'Architecture', content: 'Edge runtime with automatic static generation and server-side streaming.' },
                            { label: 'Database', content: 'Native SQLite local support with instant Cloudflare D1 edge replication.' },
                            { label: 'Export', content: 'Generate complete, clean Next.js 15+ repositories with one click.' }
                          ];
                          updateElementContent(selectedElement.id, {
                            tabs: [...current, { label: 'New Tab', content: 'Description content for this tab.' }]
                          });
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Tab</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[520px] overflow-y-auto nextforge-scrollbar pr-0.5">
                      {(selectedElement.content?.tabs || [
                        { label: 'Architecture', content: 'Edge runtime with automatic static generation and server-side streaming.' },
                        { label: 'Database', content: 'Native SQLite local support with instant Cloudflare D1 edge replication.' },
                        { label: 'Export', content: 'Generate complete, clean Next.js 15+ repositories with one click.' }
                      ]).map((tab: any, idx: number, arr: any[]) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', String(idx));
                            setDraggedTabIndex(idx);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragOverTabIndex !== idx) setDragOverTabIndex(idx);
                          }}
                          onDragLeave={() => {
                            if (dragOverTabIndex === idx) setDragOverTabIndex(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const sourceIdx = draggedTabIndex ?? parseInt(e.dataTransfer.getData('text/plain'));
                            if (sourceIdx !== null && !isNaN(sourceIdx) && sourceIdx !== idx) {
                              const nextArr = [...arr];
                              const [moved] = nextArr.splice(sourceIdx, 1);
                              nextArr.splice(idx, 0, moved);
                              updateElementContent(selectedElement.id, { tabs: nextArr });
                            }
                            setDraggedTabIndex(null);
                            setDragOverTabIndex(null);
                          }}
                          onDragEnd={() => {
                            setDraggedTabIndex(null);
                            setDragOverTabIndex(null);
                          }}
                          className={`p-2.5 bg-slate-50 border rounded-xl space-y-2 transition-all ${
                            dragOverTabIndex === idx
                              ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-2 ring-indigo-400/50'
                              : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <span className="cursor-grab active:cursor-grabbing p-0.5 text-slate-400 hover:text-indigo-600 rounded" title="Drag to reorder">
                                <GripVertical className="w-3.5 h-3.5" />
                              </span>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  const nextArr = [...arr];
                                  const [moved] = nextArr.splice(idx, 1);
                                  nextArr.splice(idx - 1, 0, moved);
                                  updateElementContent(selectedElement.id, { tabs: nextArr });
                                }}
                                className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                                title="Move Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === arr.length - 1}
                                onClick={() => {
                                  const nextArr = [...arr];
                                  const [moved] = nextArr.splice(idx, 1);
                                  nextArr.splice(idx + 1, 0, moved);
                                  updateElementContent(selectedElement.id, { tabs: nextArr });
                                }}
                                className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                                title="Move Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-[10px] font-bold text-slate-700 font-mono">Tab #{idx + 1}</span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextArr = [...arr];
                                  const cloned = {
                                    ...JSON.parse(JSON.stringify(tab)),
                                    id: 'tab-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                                    label: (tab.label || 'Tab') + ' (Copy)'
                                  };
                                  nextArr.splice(idx + 1, 0, cloned);
                                  updateElementContent(selectedElement.id, { tabs: nextArr });
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                title="Duplicate this tab"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextArr = arr.filter((_, i) => i !== idx);
                                  updateElementContent(selectedElement.id, { tabs: nextArr });
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Delete Tab"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={tab.label}
                            onChange={(e) => {
                              const nextArr = [...arr];
                              nextArr[idx] = { ...tab, label: e.target.value };
                              updateElementContent(selectedElement.id, { tabs: nextArr });
                            }}
                            placeholder="Tab Label"
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800"
                          />
                          <textarea
                            rows={2}
                            value={tab.content}
                            onChange={(e) => {
                              const nextArr = [...arr];
                              nextArr[idx] = { ...tab, content: e.target.value };
                              updateElementContent(selectedElement.id, { tabs: nextArr });
                            }}
                            placeholder="Tab Content"
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 12. DATA TABLE (Full Column, Header & CSV Management) */}
                {selectedElement.type === 'table' && (() => {
                  const headers: string[] = selectedElement.content?.headers && selectedElement.content.headers.length > 0
                    ? selectedElement.content.headers
                    : ['Feature', 'NextForge', 'Traditional Builders'];
                  const rows: string[][] = selectedElement.content?.rows && selectedElement.content.rows.length > 0
                    ? selectedElement.content.rows
                    : [
                      ['PageSpeed Score', '100 / 100', '65 / 100'],
                      ['Code Quality', 'Clean React 19 / Next.js', 'Vendor Bloat'],
                      ['Data Ownership', '100% (1-Click ZIP)', 'Proprietary Lock-in']
                    ];
                  const colWidths: string[] = (selectedElement.content?.colWidths as string[]) || [];

                  // Add Column
                  const handleAddColumn = () => {
                    const newColNumber = headers.length + 1;
                    const nextHeaders = [...headers, `Column ${newColNumber}`];
                    const nextRows = rows.map((r) => [...r, '']);
                    const nextWidths = [...colWidths, ''];
                    updateElementContent(selectedElement.id, {
                      headers: nextHeaders,
                      rows: nextRows,
                      colWidths: nextWidths
                    });
                  };

                  // Delete Column
                  const handleDeleteColumn = (colIdx: number) => {
                    if (headers.length <= 1) return;
                    const nextHeaders = headers.filter((_, i) => i !== colIdx);
                    const nextRows = rows.map((r) => r.filter((_, i) => i !== colIdx));
                    const nextWidths = colWidths.filter((_, i) => i !== colIdx);
                    updateElementContent(selectedElement.id, {
                      headers: nextHeaders,
                      rows: nextRows,
                      colWidths: nextWidths
                    });
                  };

                  // Rename Column Header
                  const handleUpdateHeader = (colIdx: number, val: string) => {
                    const nextHeaders = [...headers];
                    nextHeaders[colIdx] = val;
                    updateElementContent(selectedElement.id, {
                      headers: nextHeaders,
                      rows: rows
                    });
                  };

                  // Update Column Width
                  const handleUpdateColWidth = (colIdx: number, val: string) => {
                    const nextWidths = [...colWidths];
                    while (nextWidths.length < headers.length) nextWidths.push('');
                    nextWidths[colIdx] = val;
                    updateElementContent(selectedElement.id, {
                      colWidths: nextWidths
                    });
                  };

                  // Reset All Columns to Equal
                  const handleResetColWidths = () => {
                    updateElementContent(selectedElement.id, {
                      colWidths: headers.map(() => '')
                    });
                  };

                  // Add Row
                  const handleAddRow = () => {
                    const newRow = Array(headers.length).fill('');
                    updateElementContent(selectedElement.id, {
                      headers: headers,
                      rows: [...rows, newRow]
                    });
                  };

                  // Delete Row
                  const handleDeleteRow = (rowIdx: number) => {
                    const nextRows = rows.filter((_, i) => i !== rowIdx);
                    updateElementContent(selectedElement.id, {
                      headers: headers,
                      rows: nextRows.length > 0 ? nextRows : [Array(headers.length).fill('')]
                    });
                  };

                  // Update Cell
                  const handleUpdateCell = (rowIdx: number, colIdx: number, val: string) => {
                    const nextRows = rows.map((r, rI) => {
                      if (rI !== rowIdx) return r;
                      const nextRow = [...r];
                      nextRow[colIdx] = val;
                      return nextRow;
                    });
                    updateElementContent(selectedElement.id, {
                      headers: headers,
                      rows: nextRows
                    });
                  };

                  // Handle CSV File Upload
                  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      const text = evt.target?.result as string;
                      if (text) {
                        const parsed = parseCsvData(text);
                        if (parsed && parsed.headers.length > 0) {
                          updateElementContent(selectedElement.id, {
                            headers: parsed.headers,
                            rows: parsed.rows,
                            colWidths: parsed.headers.map(() => '')
                          });
                          setTableCsvFeedback(`Imported ${parsed.headers.length} columns & ${parsed.rows.length} rows successfully!`);
                          setTimeout(() => setTableCsvFeedback(null), 3000);
                          setShowTableCsvModal(false);
                        } else {
                          setTableCsvFeedback('Could not parse CSV file. Please check file format.');
                        }
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  };

                  // Handle Pasted CSV
                  const handleApplyPastedCsv = () => {
                    if (!tableCsvPasteText.trim()) return;
                    const parsed = parseCsvData(tableCsvPasteText);
                    if (parsed && parsed.headers.length > 0) {
                      updateElementContent(selectedElement.id, {
                        headers: parsed.headers,
                        rows: parsed.rows,
                        colWidths: parsed.headers.map(() => '')
                      });
                      setTableCsvPasteText('');
                      setTableCsvFeedback(`Imported ${parsed.headers.length} columns & ${parsed.rows.length} rows!`);
                      setTimeout(() => setTableCsvFeedback(null), 3000);
                      setShowTableCsvModal(false);
                    } else {
                      setTableCsvFeedback('Invalid CSV format. Please make sure data has at least one row.');
                    }
                  };

                  return (
                    <div className="space-y-3.5">
                      {/* Top Action Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div>
                          <label className="text-[11px] font-bold text-slate-800 flex items-center space-x-1.5">
                            <Table className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Table Structure</span>
                          </label>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {headers.length} Cols × {rows.length} Rows
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          {/* CSV Import Toggle Button */}
                          <button
                            type="button"
                            onClick={() => setShowTableCsvModal(!showTableCsvModal)}
                            className={`px-2 py-1 text-[11px] font-bold rounded-lg border flex items-center space-x-1 transition-all cursor-pointer ${
                              showTableCsvModal
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 shadow-xs'
                            }`}
                            title="Import table from CSV file or text"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>CSV Import</span>
                          </button>

                          {/* Add Column Button */}
                          <button
                            type="button"
                            onClick={handleAddColumn}
                            className="px-2 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
                            title="Add a new column across all rows"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Col</span>
                          </button>
                        </div>
                      </div>

                      {/* Feedback message if CSV imported */}
                      {tableCsvFeedback && (
                        <div className="p-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg animate-in fade-in">
                          {tableCsvFeedback}
                        </div>
                      )}

                      {/* CSV Import Modal / Card */}
                      {showTableCsvModal && (
                        <div className="p-3 bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 border border-indigo-200 rounded-xl space-y-2.5 shadow-sm animate-in fade-in duration-150">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                              <span className="text-xs font-bold text-slate-800">CSV Import Tool</span>
                            </div>
                            <span className="text-[10px] text-indigo-700 bg-indigo-100/80 font-bold px-2 py-0.5 rounded-full">
                              Row 1 = Header Row
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-snug">
                            Upload a <code className="text-indigo-700 font-mono bg-indigo-50 px-1 py-0.5 rounded">.csv</code> file or paste CSV text. The <strong>first row will automatically become the header columns</strong>, and subsequent rows populate the table.
                          </p>

                          <input
                            type="file"
                            ref={tableCsvFileInputRef}
                            accept=".csv,text/csv,text/plain"
                            onChange={handleCsvFileUpload}
                            className="hidden"
                          />

                          <button
                            type="button"
                            onClick={() => tableCsvFileInputRef.current?.click()}
                            className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Choose & Upload .CSV File</span>
                          </button>

                          <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-bold uppercase">Or Paste CSV</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                          </div>

                          <div className="space-y-1">
                            <textarea
                              value={tableCsvPasteText}
                              onChange={(e) => setTableCsvPasteText(e.target.value)}
                              placeholder={`Feature,NextForge,Other\nPageSpeed,100/100,60/100\nClean Code,Yes,No`}
                              rows={3}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[11px] font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                            />
                            <div className="flex justify-end space-x-1.5 pt-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setTableCsvPasteText('');
                                  setShowTableCsvModal(false);
                                }}
                                className="px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleApplyPastedCsv}
                                disabled={!tableCsvPasteText.trim()}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                              >
                                Parse & Generate Table
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SECTION 1: COLUMN HEADERS & WIDTH CUSTOMIZER */}
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                            <span>Columns & Widths</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full font-bold">
                              {headers.length}
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={handleResetColWidths}
                            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            title="Reset all column widths to equal"
                          >
                            Equal Widths
                          </button>
                        </div>

                        <div className="space-y-2 max-h-56 overflow-y-auto nextforge-scrollbar pr-0.5">
                          {headers.map((headerTitle, hIdx) => (
                            <div key={hIdx} className="p-2 bg-white border border-slate-200 rounded-lg space-y-1.5 shadow-2xs">
                              {/* Header title input & Delete */}
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-1 rounded border border-indigo-100 w-12 text-center shrink-0">
                                  Col {hIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={headerTitle}
                                  onChange={(e) => handleUpdateHeader(hIdx, e.target.value)}
                                  placeholder={`Column ${hIdx + 1}`}
                                  className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                                />
                                <button
                                  type="button"
                                  disabled={headers.length <= 1}
                                  onClick={() => handleDeleteColumn(hIdx)}
                                  className={`p-1.5 rounded text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors ${
                                    headers.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                  title={headers.length <= 1 ? "Cannot delete the only column" : `Delete Column ${hIdx + 1}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Column Width controls */}
                              <div className="flex items-center justify-between pt-0.5 text-[10px]">
                                <span className="text-slate-500 font-semibold">Width:</span>
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="text"
                                    value={colWidths[hIdx] || ''}
                                    onChange={(e) => handleUpdateColWidth(hIdx, e.target.value)}
                                    placeholder="Auto (1fr)"
                                    className="w-20 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-slate-700 focus:bg-white focus:border-indigo-500 text-center"
                                  />
                                  {['Auto', '20%', '30%', '40%', '50%'].map((wPreset) => (
                                    <button
                                      key={wPreset}
                                      type="button"
                                      onClick={() => handleUpdateColWidth(hIdx, wPreset === 'Auto' ? '' : wPreset)}
                                      className={`px-1.5 py-0.5 text-[9px] font-mono rounded border transition-colors cursor-pointer ${
                                        (wPreset === 'Auto' && (!colWidths[hIdx] || colWidths[hIdx] === 'auto')) || colWidths[hIdx] === wPreset
                                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                                          : 'bg-slate-100 text-slate-600 border-slate-200/60 hover:bg-slate-200'
                                      }`}
                                    >
                                      {wPreset}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SECTION 2: TABLE ROWS DATA (Expandable & Collapsible, Height Increased to 520px) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                              <span>Table Rows</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full font-bold">
                                {rows.length}
                              </span>
                            </label>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => setCollapsedTableRows({})}
                              className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                              Expand All
                            </button>
                            <span className="text-slate-300">/</span>
                            <button
                              type="button"
                              onClick={() => {
                                const allCollapsed: Record<number, boolean> = {};
                                rows.forEach((_, i) => (allCollapsed[i] = true));
                                setCollapsedTableRows(allCollapsed);
                              }}
                              className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                            >
                              Collapse All
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddRow}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Row</span>
                          </button>
                        </div>

                        {/* Box height increased to 520px so at least 5 expanded rows fit comfortably */}
                        <div className="space-y-2 max-h-[520px] overflow-y-auto nextforge-scrollbar pr-0.5">
                          {rows.map((row: string[], rIdx: number) => {
                            const isCollapsed = Boolean(collapsedTableRows[rIdx]);

                            return (
                              <div
                                key={rIdx}
                                className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 transition-all"
                              >
                                {/* Collapsible Row Header Bar */}
                                <div
                                  onClick={() =>
                                    setCollapsedTableRows((prev) => ({
                                      ...prev,
                                      [rIdx]: !prev[rIdx]
                                    }))
                                  }
                                  className="flex items-center justify-between text-[10px] font-bold text-slate-600 font-mono cursor-pointer select-none py-0.5 hover:text-indigo-600 transition-colors"
                                >
                                  <div className="flex items-center space-x-1.5 truncate pr-2">
                                    {isCollapsed ? (
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    )}
                                    <span className="text-slate-700 font-bold shrink-0">Row #{rIdx + 1}</span>
                                    {isCollapsed && (
                                      <span className="text-[10px] text-slate-400 font-normal truncate">
                                        — {row.filter(Boolean).slice(0, 2).join(' • ') || 'Empty row'}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteRow(rIdx);
                                    }}
                                    className="text-rose-500 hover:text-rose-700 p-0.5 rounded hover:bg-rose-50 cursor-pointer shrink-0"
                                    title="Delete Row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Row Cell Inputs (visible when not collapsed) */}
                                {!isCollapsed && (
                                  <div className="overflow-x-auto pb-1 pt-0.5">
                                    <div
                                      className="grid gap-1.5"
                                      style={{
                                        gridTemplateColumns: `repeat(${headers.length}, minmax(${
                                          headers.length > 3 ? '100px' : '1fr'
                                        }, 1fr))`
                                      }}
                                    >
                                      {headers.map((_, cIdx) => (
                                        <div key={cIdx} className="space-y-0.5">
                                          <span
                                            className="text-[9px] text-slate-400 font-mono truncate block"
                                            title={headers[cIdx] || `Col ${cIdx + 1}`}
                                          >
                                            {headers[cIdx] || `Col ${cIdx + 1}`}
                                          </span>
                                          <input
                                            type="text"
                                            value={row[cIdx] !== undefined ? row[cIdx] : ''}
                                            onChange={(e) => handleUpdateCell(rIdx, cIdx, e.target.value)}
                                            placeholder={headers[cIdx] || `Cell ${cIdx + 1}`}
                                            className="w-full p-1 bg-white border border-slate-200 rounded text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 11. ICON & ICON BOX (Unified Content on Same Page) */}
                {(selectedElement.type === 'icon' || selectedElement.type === 'iconbox') && (() => {
                  const isIconBox = selectedElement.type === 'iconbox';
                  const titleVal = isIconBox
                    ? (selectedElement.content?.title !== undefined ? selectedElement.content.title : 'Enterprise Security')
                    : (selectedElement.content?.text !== undefined ? selectedElement.content.text : 'Special Feature');
                  const descVal = isIconBox
                    ? (selectedElement.content?.description !== undefined ? selectedElement.content.description : 'Guaranteed safety and end-to-end performance.')
                    : (selectedElement.content?.subtext !== undefined ? selectedElement.content.subtext : 'Ultra-fast Next.js component');
                  const currentIcon = selectedElement.content?.iconName || selectedElement.content?.icon || 'star';

                  const iconAnim = selectedElement.styles?.iconAnimation || selectedElement.content?.iconAnimation || 'none';
                  const iconTrigger = selectedElement.styles?.iconAnimationTrigger || selectedElement.content?.iconAnimationTrigger || 'always';
                  const iconSpeed = selectedElement.styles?.iconAnimationSpeed || selectedElement.content?.iconAnimationSpeed || 'normal';

                  const LIGHT_ANIMATIONS = [
                    { id: 'none', label: 'None', icon: '⛔' },
                    { id: 'pulse', label: 'Pulse', desc: 'Breathing', icon: '💫' },
                    { id: 'float', label: 'Float', desc: 'Bobbing', icon: '🎈' },
                    { id: 'shimmer', label: 'Shimmer', desc: 'Glow Flash', icon: '✨' },
                    { id: 'spin-slow', label: 'Slow Spin', desc: 'Smooth 360°', icon: '🔄' },
                    { id: 'bounce-soft', label: 'Bounce', desc: 'Soft hop', icon: '🏀' },
                    { id: 'wiggle', label: 'Wiggle', desc: 'Gentle tilt', icon: '📳' },
                    { id: 'hover-lift', label: 'Hover Lift', desc: 'Floats on hover', icon: '🚀' },
                    { id: 'hover-spin', label: 'Hover Spin', desc: 'Spins on hover', icon: '🌪️' }
                  ];

                  return (
                    <div className="space-y-4 pb-4">
                      {/* 1. ICON SELECTION & LIGHT ANIMATION */}
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Icon & Animation</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 capitalize">
                            {iconAnim !== 'none' ? `${iconAnim} (${iconTrigger})` : 'Static'}
                          </span>
                        </div>

                        {/* Icon Picker */}
                        <IconSelector
                          value={currentIcon}
                          onChange={(iconName) => updateElementContent(selectedElement.id, { iconName })}
                        />

                        {/* Light Animation Selector */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Light Icon Animation</label>
                            <span className="text-[10px] font-mono font-bold text-indigo-600 capitalize">{iconAnim}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            {LIGHT_ANIMATIONS.map((anim) => {
                              const isActive = iconAnim === anim.id;
                              return (
                                <button
                                  key={anim.id}
                                  type="button"
                                  onClick={() => {
                                    updateElementStyles(selectedElement.id, { iconAnimation: anim.id as any });
                                    updateElementContent(selectedElement.id, { iconAnimation: anim.id });
                                  }}
                                  className={`py-1.5 px-1 text-xs font-semibold rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600'
                                  }`}
                                  title={anim.label}
                                >
                                  <span className="text-sm leading-none">{anim.icon}</span>
                                  <span className="text-[10px] font-medium leading-none mt-1 truncate max-w-full">{anim.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Animation Trigger & Speed (when an animation is active) */}
                          {iconAnim !== 'none' && !iconAnim.startsWith('hover-') && (
                            <div className="grid grid-cols-2 gap-2 pt-1.5">
                              {/* Trigger: Always vs On Hover */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-600">Trigger</label>
                                <div className="grid grid-cols-2 gap-1">
                                  {[
                                    { id: 'always', label: 'Always' },
                                    { id: 'hover', label: 'On Hover' }
                                  ].map((trig) => {
                                    const isTrigActive = iconTrigger === trig.id;
                                    return (
                                      <button
                                        key={trig.id}
                                        type="button"
                                        onClick={() => {
                                          updateElementStyles(selectedElement.id, { iconAnimationTrigger: trig.id });
                                          updateElementContent(selectedElement.id, { iconAnimationTrigger: trig.id });
                                        }}
                                        className={`py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                                          isTrigActive
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                        }`}
                                      >
                                        {trig.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Speed */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-600">Speed</label>
                                <div className="grid grid-cols-3 gap-1">
                                  {[
                                    { id: 'slow', label: 'Slow' },
                                    { id: 'normal', label: 'Norm' },
                                    { id: 'fast', label: 'Fast' }
                                  ].map((spd) => {
                                    const isSpdActive = iconSpeed === spd.id;
                                    return (
                                      <button
                                        key={spd.id}
                                        type="button"
                                        onClick={() => {
                                          updateElementStyles(selectedElement.id, { iconAnimationSpeed: spd.id });
                                          updateElementContent(selectedElement.id, { iconAnimationSpeed: spd.id });
                                        }}
                                        className={`py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                                          isSpdActive
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                        }`}
                                      >
                                        {spd.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Quick Badge Shape Presets */}
                          <div className="pt-2 border-t border-slate-200/80 space-y-1">
                            <label className="text-[10px] font-semibold text-slate-600">Badge Shape</label>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { label: 'Circle', radius: '9999px' },
                                { label: 'Rounded', radius: '14px' },
                                { label: 'Soft', radius: '8px' },
                                { label: 'Square', radius: '0px' }
                              ].map((shape) => {
                                const isShape = (selectedElement.styles?.iconBorderRadius || '14px') === shape.radius;
                                return (
                                  <button
                                    key={shape.label}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { iconBorderRadius: shape.radius })}
                                    className={`py-1 text-[10px] font-semibold rounded-md border transition-all cursor-pointer ${
                                      isShape
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'
                                    }`}
                                  >
                                    {shape.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. HEADING / TITLE TEXT */}
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2.5">
                        <div className="flex items-center space-x-1.5 text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">
                          <Type className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Title / Heading</span>
                        </div>
                        <input
                          type="text"
                          value={titleVal}
                          onChange={(e) => {
                            if (isIconBox) {
                              updateElementContent(selectedElement.id, { title: e.target.value });
                            } else {
                              updateElementContent(selectedElement.id, { text: e.target.value });
                            }
                          }}
                          placeholder="Enter title text..."
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                        />

                        {/* Text Case for Title */}
                        <div className="space-y-1 pt-0.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-semibold text-slate-600">Text Case</label>
                            <span className="text-[10px] font-mono font-bold text-indigo-600 capitalize">
                              {selectedElement.styles?.headingTextTransform || selectedElement.styles?.textTransform || 'none'}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { id: 'none', label: 'As Typed', preview: 'Aa' },
                              { id: 'uppercase', label: 'UPPER', preview: 'AA' },
                              { id: 'lowercase', label: 'lower', preview: 'aa' },
                              { id: 'capitalize', label: 'Title', preview: 'Ab' }
                            ].map((c) => {
                              const active = (selectedElement.styles?.headingTextTransform || selectedElement.styles?.textTransform || 'none') === c.id;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    updateElementStyles(selectedElement.id, {
                                      headingTextTransform: c.id as any,
                                      textTransform: c.id as any
                                    });
                                  }}
                                  className={`py-1 text-[10px] font-bold rounded-md border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                    active
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                      : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'
                                  }`}
                                >
                                  <span className="font-mono text-xs">{c.preview}</span>
                                  <span className="text-[8px] leading-none mt-0.5">{c.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* 3. DESCRIPTION / SUBTEXT */}
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">
                          <span className="flex items-center space-x-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Description / Subtext</span>
                          </span>
                          {descVal && (
                            <button
                              type="button"
                              onClick={() => {
                                if (isIconBox) {
                                  updateElementContent(selectedElement.id, { description: '' });
                                } else {
                                  updateElementContent(selectedElement.id, { subtext: '' });
                                }
                              }}
                              className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer lowercase"
                            >
                              clear
                            </button>
                          )}
                        </div>

                        {isIconBox ? (
                          <textarea
                            rows={3}
                            value={descVal}
                            onChange={(e) => updateElementContent(selectedElement.id, { description: e.target.value })}
                            placeholder="Description text..."
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
                          />
                        ) : (
                          <input
                            type="text"
                            value={descVal}
                            onChange={(e) => updateElementContent(selectedElement.id, { subtext: e.target.value })}
                            placeholder="Subtext description..."
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        )}
                      </div>

                      {/* 4. CARD ALIGNMENT & LAYOUT */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-slate-700">Card Alignment</label>
                          <span className="text-[10px] font-mono font-bold text-indigo-600 capitalize">
                            {selectedElement.styles?.textAlign || 'left'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { id: 'left', label: 'Left', icon: AlignLeft },
                            { id: 'center', label: 'Center', icon: AlignCenter },
                            { id: 'right', label: 'Right', icon: AlignRight }
                          ].map(({ id, label, icon: Icon }) => {
                            const isAlignActive = (selectedElement.styles?.textAlign || 'left') === id;
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => {
                                  updateElementStyles(selectedElement.id, { textAlign: id as any });
                                  updateElementContent(selectedElement.id, { align: id });
                                }}
                                className={`py-1.5 text-xs font-semibold rounded-lg border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                                  isAlignActive
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 12. VIDEO CONTENT SETTINGS */}
                {selectedElement.type === 'video' && (
                  <div className="space-y-4">
                    {/* Source Mode Tabs: Link vs Upload */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                        <span>Video Source</span>
                        <span className="text-[10px] text-slate-400 font-normal">YouTube, Vimeo, MP4, or Local</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-200/70 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setVideoSourceTab('url')}
                          className={`py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                            videoSourceTab === 'url'
                              ? 'bg-white text-indigo-600 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Web Link / URL</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoSourceTab('upload')}
                          className={`py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                            videoSourceTab === 'upload'
                              ? 'bg-white text-indigo-600 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                        </button>
                      </div>
                    </div>

                    {/* Mode 1: Web Link / URL */}
                    {videoSourceTab === 'url' && (
                      <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/70">
                        <label className="text-[11px] font-semibold text-slate-700 block">Video URL</label>
                        <input
                          type="text"
                          value={selectedElement.content?.url && !selectedElement.content.url.startsWith('data:') ? selectedElement.content.url : ''}
                          onChange={(e) => updateElementContent(selectedElement.id, {
                            url: e.target.value,
                            videoSource: 'url'
                          })}
                          placeholder="https://www.youtube.com/watch?v=... or .mp4"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                        <p className="text-[10px] text-slate-500 leading-tight">
                          Auto-detects YouTube (watch, embed, shorts), Vimeo, and direct MP4/WebM video links.
                        </p>

                        {/* Quick Presets for 1-Click Testing */}
                        <div className="pt-1 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Quick Sample Presets
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {[
                              { label: 'YouTube Demo', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
                              { label: 'Tech Reel (MP4)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
                              { label: 'Nature Drone (MP4)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => updateElementContent(selectedElement.id, {
                                  url: preset.url,
                                  videoSource: 'url'
                                })}
                                className="px-2 py-1 text-[10px] font-medium rounded bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mode 2: Local Video Upload */}
                    {videoSourceTab === 'upload' && (
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-3">
                        <input
                          type="file"
                          ref={videoFileInputRef}
                          accept="video/mp4,video/webm,video/ogg,video/quicktime"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 50 * 1024 * 1024) {
                              alert('Notice: Video file exceeds 50MB. For high-res videos, hosting on YouTube, Vimeo, or a video CDN is recommended.');
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              const result = reader.result as string;
                              updateElementContent(selectedElement.id, {
                                url: result,
                                fileName: file.name,
                                fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                                videoSource: 'upload'
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />

                        {selectedElement.content?.url && selectedElement.content.url.startsWith('data:') ? (
                          <div className="space-y-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Local Video Loaded</span>
                              </span>
                              {selectedElement.content?.fileSize && (
                                <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                                  {selectedElement.content.fileSize}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {selectedElement.content?.fileName || 'Uploaded video file'}
                            </p>
                            <div className="flex items-center space-x-2 pt-1">
                              <button
                                type="button"
                                onClick={() => videoFileInputRef.current?.click()}
                                className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer text-center"
                              >
                                Replace Video
                              </button>
                              <button
                                type="button"
                                onClick={() => updateElementContent(selectedElement.id, {
                                  url: '',
                                  fileName: undefined,
                                  fileSize: undefined
                                })}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => videoFileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/30 rounded-xl p-4 text-center cursor-pointer transition-colors space-y-1.5"
                          >
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                              <Upload className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-slate-700">Upload Video from Computer</p>
                            <p className="text-[10px] text-slate-400">
                              Supports MP4, WebM, OGG (Max recommended 50MB)
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* BUTTONLESS VIEW / HERO BACKGROUND MODE TOGGLE */}
                    <div className="border border-amber-200/80 bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <EyeOff className="w-4 h-4 text-amber-600" />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Buttonless View</span>
                            <span className="text-[10px] text-slate-500">Hero background reel / chromeless</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(selectedElement.content?.buttonless)}
                          onChange={(e) => updateElementContent(selectedElement.id, { buttonless: e.target.checked })}
                          className="w-4 h-4 accent-amber-600 cursor-pointer rounded"
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Hides all controls and play buttons, autoplays in an infinite loop without player chrome. Audio sound remains unmuted unless explicitly muted below.
                      </p>
                    </div>

                    {/* PLAYBACK & AUDIO CONTROLS */}
                    <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-3">
                      <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                        Playback & Audio Controls
                      </span>

                      <div className="space-y-2.5">
                        {/* Show Controls (Only when not in buttonless mode) */}
                        {!selectedElement.content?.buttonless ? (
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <Play className="w-3.5 h-3.5 text-slate-500" />
                              <div>
                                <span className="text-xs font-medium text-slate-700 block">Show Player Controls</span>
                                <span className="text-[10px] text-slate-400">Play/pause buttons, progress bar & volume</span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedElement.content?.controls !== false}
                              onChange={(e) => updateElementContent(selectedElement.id, { controls: e.target.checked })}
                              className="w-4 h-4 accent-indigo-600 cursor-pointer rounded"
                            />
                          </label>
                        ) : (
                          <div className="flex items-center justify-between opacity-60">
                            <div className="flex items-center space-x-2">
                              <Play className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs font-medium text-slate-500">Player Controls Hidden (Buttonless)</span>
                            </div>
                            <span className="text-[10px] font-mono text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Off
                            </span>
                          </div>
                        )}

                        {/* Muted Audio Toggle - ALWAYS accessible and clearly unmuted by default */}
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center space-x-2">
                            {selectedElement.content?.muted ? (
                              <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <div>
                              <span className="text-xs font-medium text-slate-700 block">
                                {selectedElement.content?.muted ? 'Mute Audio (Muted / Silent)' : 'Mute Audio (Unmuted / Audio On)'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {selectedElement.content?.muted ? 'Sound is turned off' : 'Full audio sound will play'}
                              </span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(selectedElement.content?.muted)}
                            onChange={(e) => updateElementContent(selectedElement.id, { muted: e.target.checked })}
                            className="w-4 h-4 accent-indigo-600 cursor-pointer rounded"
                          />
                        </label>

                        {/* Autoplay */}
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center space-x-2">
                            <Video className="w-3.5 h-3.5 text-slate-500" />
                            <div>
                              <span className="text-xs font-medium text-slate-700 block">Autoplay</span>
                              <span className="text-[10px] text-slate-400">Plays automatically on load</span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedElement.content?.buttonless ? true : Boolean(selectedElement.content?.autoplay)}
                            disabled={Boolean(selectedElement.content?.buttonless)}
                            onChange={(e) => updateElementContent(selectedElement.id, { autoplay: e.target.checked })}
                            className="w-4 h-4 accent-indigo-600 cursor-pointer rounded disabled:opacity-50"
                          />
                        </label>

                        {/* Loop Video */}
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center space-x-2">
                            <Repeat className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs font-medium text-slate-700">Loop Playback</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedElement.content?.buttonless ? true : Boolean(selectedElement.content?.loop)}
                            disabled={Boolean(selectedElement.content?.buttonless)}
                            onChange={(e) => updateElementContent(selectedElement.id, { loop: e.target.checked })}
                            className="w-4 h-4 accent-indigo-600 cursor-pointer rounded disabled:opacity-50"
                          />
                        </label>
                      </div>
                    </div>

                    {/* ASPECT RATIO & SIZING */}
                    <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-700">Aspect Ratio</label>
                        <span className="text-xs font-mono font-bold text-indigo-600">
                          {selectedElement.content?.aspectRatio || '16/9'}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {[
                          { id: '16/9', label: '16:9' },
                          { id: '4/3', label: '4:3' },
                          { id: '1/1', label: '1:1' },
                          { id: '21/9', label: '21:9' },
                          { id: 'custom', label: 'Custom' }
                        ].map((ar) => {
                          const isActive = (selectedElement.content?.aspectRatio || '16/9') === ar.id;
                          return (
                            <button
                              key={ar.id}
                              type="button"
                              onClick={() => updateElementContent(selectedElement.id, { aspectRatio: ar.id })}
                              className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                                isActive
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                              }`}
                            >
                              {ar.label}
                            </button>
                          );
                        })}
                      </div>

                      {selectedElement.content?.aspectRatio === 'custom' && (
                        <div className="space-y-1 pt-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 font-semibold">Custom Height</span>
                            <span className="font-mono text-indigo-600 font-bold">{selectedElement.styles?.height || '400px'}</span>
                          </div>
                          <input
                            type="range"
                            min="200"
                            max="800"
                            step="20"
                            value={parseInt(selectedElement.styles?.height || '400') || 400}
                            onChange={(e) => updateElementStyles(selectedElement.id, { height: `${e.target.value}px` })}
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 12b. ICON LIST (items editor — this type previously had no
                    content controls anywhere in the inspector) */}
                {selectedElement.type === 'iconlist' && (() => {
                  const listItems: any[] = selectedElement.content?.items && selectedElement.content.items.length > 0
                    ? selectedElement.content.items
                    : [
                        { id: 'il-1', iconName: 'check', text: 'Unlimited dynamic pages' },
                        { id: 'il-2', iconName: 'check', text: '1-Click ZIP Next.js code export' },
                        { id: 'il-3', iconName: 'check', text: 'Zero vendor lock-in' }
                      ];
                  const setItems = (next: any[]) => updateElementContent(selectedElement.id, { items: next });
                  return (
                    <CollapseGroup icon={CheckSquare} title="List Items" defaultOpen>
                      {listItems.map((item: any, idx: number) => (
                        <div key={item.id || idx} className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                          <div className="flex items-center space-x-1.5">
                            <input
                              type="text"
                              value={item.text || ''}
                              onChange={(e) => {
                                const next = [...listItems];
                                next[idx] = { ...next[idx], text: e.target.value };
                                setItems(next);
                              }}
                              placeholder="Item text..."
                              className="flex-1 min-w-0 p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => setItems(listItems.filter((_: any, i: number) => i !== idx))}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <IconSelector
                            label="Item Icon"
                            value={item.iconName || 'check'}
                            onChange={(iconName) => {
                              const next = [...listItems];
                              next[idx] = { ...next[idx], iconName };
                              setItems(next);
                            }}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setItems([...listItems, { id: `il-${Date.now()}`, iconName: 'check', text: 'New item' }])}
                        className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-[11px] font-bold"
                      >
                        + Add Item
                      </button>
                    </CollapseGroup>
                  );
                })()}

                {/* 12b2. MARQUEE (Text & Logo Strips, SVGs, Sliding & Effects) */}
                {selectedElement.type === 'marquee' && (() => {
                  const mode = selectedElement.content?.mode || 'text';
                  const mqItems: string[] = selectedElement.content?.items && selectedElement.content.items.length > 0
                    ? selectedElement.content.items
                    : ['Free shipping over $50', '30-day easy returns', 'New drops every Friday'];
                  const logos: any[] = selectedElement.content?.logos && selectedElement.content.logos.length > 0
                    ? selectedElement.content.logos
                    : [
                        { id: 'l1', name: 'Brand 1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80', svg: '' },
                        { id: 'l2', name: 'Brand 2', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80', svg: '' },
                        { id: 'l3', name: 'Brand 3', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80', svg: '' }
                      ];
                  const setMqItems = (next: string[]) => updateElementContent(selectedElement.id, { items: next });
                  const setLogos = (next: any[]) => updateElementContent(selectedElement.id, { logos: next });
                  const inputCls = "w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500";

                  return (
                    <div className="space-y-3">
                      {/* Mode Toggle: Text vs Brand Logos */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                        <label className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                          Marquee Content Mode
                        </label>
                        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => updateElementContent(selectedElement.id, { mode: 'text' })}
                            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                              mode === 'text'
                                ? 'bg-white text-indigo-600 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Scrolling Text
                          </button>
                          <button
                            type="button"
                            onClick={() => updateElementContent(selectedElement.id, { mode: 'logos' })}
                            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                              mode === 'logos'
                                ? 'bg-white text-indigo-600 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            PNG & SVG Logos
                          </button>
                        </div>
                      </div>

                      {/* TEXT MODE SETTINGS */}
                      {mode === 'text' && (
                        <CollapseGroup icon={Repeat} title="Text Items" defaultOpen>
                          {mqItems.map((item: string, idx: number) => (
                            <div key={idx} className="flex items-center space-x-1.5">
                              <input
                                type="text"
                                value={item || ''}
                                onChange={(e) => {
                                  const next = [...mqItems];
                                  next[idx] = e.target.value;
                                  setMqItems(next);
                                }}
                                placeholder="Scrolling announcement..."
                                className="flex-1 min-w-0 p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setMqItems(mqItems.filter((_: string, i: number) => i !== idx))}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setMqItems([...mqItems, 'New announcement item'])}
                            className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-[11px] font-bold"
                          >
                            + Add Text Item
                          </button>
                          <div className="space-y-1 pt-1">
                            <label className="text-[11px] font-semibold text-slate-600">Separator Character</label>
                            <input
                              type="text"
                              value={selectedElement.content?.separator ?? '✦'}
                              onChange={(e) => updateElementContent(selectedElement.id, { separator: e.target.value })}
                              placeholder="✦ or • or /"
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                            />
                          </div>
                        </CollapseGroup>
                      )}

                      {/* LOGO MODE SETTINGS */}
                      {mode === 'logos' && (
                        <CollapseGroup icon={Repeat} title={`Logo Items (${logos.length})`} defaultOpen>
                          {/* Hidden File Input for Bulk Upload */}
                          <input
                            ref={marqueeBulkFileInputRef}
                            type="file"
                            multiple
                            accept=".svg,.png,.jpg,.jpeg,.webp,image/*"
                            className="hidden"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (!files || files.length === 0) return;

                              const fileList = Array.from(files);
                              const newItems: any[] = [];
                              let remaining = fileList.length;

                              fileList.forEach((file, fileIdx) => {
                                const rawName = file.name.replace(/\.[^/.]+$/, '');
                                const cleanName = rawName
                                  .replace(/[-_]+/g, ' ')
                                  .replace(/\blogo\b|\bicon\b|\bbrand\b/gi, '')
                                  .trim();
                                const brandName = cleanName.length > 0
                                  ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
                                  : rawName;

                                const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
                                const reader = new FileReader();

                                if (isSvg) {
                                  reader.onload = (ev) => {
                                    const svgCode = String(ev.target?.result || '');
                                    newItems.push({
                                      id: 'logo-' + Date.now() + '-' + fileIdx,
                                      name: brandName,
                                      url: '',
                                      svg: svgCode,
                                      link: ''
                                    });
                                    remaining--;
                                    if (remaining === 0) {
                                      setLogos([...logos, ...newItems]);
                                    }
                                  };
                                  reader.readAsText(file);
                                } else {
                                  reader.onload = (ev) => {
                                    const dataUrl = String(ev.target?.result || '');
                                    newItems.push({
                                      id: 'logo-' + Date.now() + '-' + fileIdx,
                                      name: brandName,
                                      url: dataUrl,
                                      svg: '',
                                      link: ''
                                    });
                                    remaining--;
                                    if (remaining === 0) {
                                      setLogos([...logos, ...newItems]);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              });

                              if (e.target) e.target.value = '';
                            }}
                          />

                          {/* Quick Action Bar: Bulk Upload & Bulk URLs */}
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => marqueeBulkFileInputRef.current?.click()}
                                className="py-2 px-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                                title="Select multiple PNG, JPG, or SVG files from your device"
                              >
                                <Upload className="w-3.5 h-3.5 shrink-0" />
                                <span>Bulk Upload</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setMarqueeBulkUrlsOpen(!marqueeBulkUrlsOpen)}
                                className={`py-2 px-2.5 border rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                                  marqueeBulkUrlsOpen
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-1 ring-indigo-300'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                                title="Paste multiple image/SVG URLs at once"
                              >
                                <Link2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span>Bulk URLs</span>
                              </button>
                            </div>

                            {/* Bulk URLs Popover / Textarea */}
                            {marqueeBulkUrlsOpen && (
                              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 text-slate-800">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900">
                                    Paste Multiple Logo URLs
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setMarqueeBulkUrlsOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <p className="text-[10px] text-slate-600 leading-snug">
                                  One URL per line. Optionally format as <code className="font-mono bg-white px-1 rounded text-indigo-700">Brand | ImageURL | Link</code> or just <code className="font-mono bg-white px-1 rounded text-indigo-700">ImageURL</code>.
                                </p>
                                <textarea
                                  rows={4}
                                  value={marqueeBulkUrlsText}
                                  onChange={(e) => setMarqueeBulkUrlsText(e.target.value)}
                                  placeholder={`https://example.com/logo1.png\nNike | https://example.com/nike.png | https://nike.com\nStripe | https://example.com/stripe.svg`}
                                  className="w-full p-2 bg-white border border-indigo-200 rounded-lg text-[11px] font-mono text-slate-800 focus:outline-none focus:border-indigo-500 shadow-inner"
                                />
                                <div className="flex items-center justify-between pt-1">
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {marqueeBulkUrlsText.split('\n').filter((l) => l.trim()).length} URLs detected
                                  </span>
                                  <button
                                    type="button"
                                    disabled={!marqueeBulkUrlsText.trim()}
                                    onClick={() => {
                                      if (!marqueeBulkUrlsText.trim()) return;
                                      const lines = marqueeBulkUrlsText.split('\n').map((l) => l.trim()).filter(Boolean);
                                      const newParsed: any[] = lines.map((line, idx) => {
                                        let name = '';
                                        let url = '';
                                        let link = '';

                                        if (line.includes('|')) {
                                          const parts = line.split('|').map((p) => p.trim());
                                          if (parts.length >= 3) {
                                            name = parts[0];
                                            url = parts[1];
                                            link = parts[2];
                                          } else if (parts.length === 2) {
                                            if (parts[0].startsWith('http://') || parts[0].startsWith('https://')) {
                                              url = parts[0];
                                              link = parts[1];
                                            } else {
                                              name = parts[0];
                                              url = parts[1];
                                            }
                                          }
                                        } else if (line.includes(',') && (line.includes('http://') || line.includes('https://'))) {
                                          const parts = line.split(',').map((p) => p.trim());
                                          if (parts.length >= 2) {
                                            name = parts[0];
                                            url = parts[1];
                                          } else {
                                            url = parts[0];
                                          }
                                        } else {
                                          url = line;
                                        }

                                        if (!name && url) {
                                          try {
                                            const urlObj = new URL(url);
                                            const pathSegments = urlObj.pathname.split('/').filter(Boolean);
                                            const lastSeg = pathSegments[pathSegments.length - 1] || urlObj.hostname;
                                            name = lastSeg
                                              .replace(/\.[^/.]+$/, '')
                                              .replace(/[-_]+/g, ' ')
                                              .replace(/\blogo\b|\bicon\b/gi, '')
                                              .trim();
                                            if (name) name = name.charAt(0).toUpperCase() + name.slice(1);
                                          } catch {
                                            name = `Brand ${logos.length + idx + 1}`;
                                          }
                                        }

                                        return {
                                          id: 'logo-' + Date.now() + '-' + idx,
                                          name: name || `Brand ${logos.length + idx + 1}`,
                                          url: url,
                                          svg: '',
                                          link: link || ''
                                        };
                                      });

                                      setLogos([...logos, ...newParsed]);
                                      setMarqueeBulkUrlsText('');
                                      setMarqueeBulkUrlsOpen(false);
                                    }}
                                    className="py-1 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs"
                                  >
                                    Add All URLs
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Logos List Header with Count & Clear */}
                          <div className="flex items-center justify-between pt-1 px-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Loaded Logos ({logos.length})
                            </span>
                            {logos.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('Clear all logos from marquee?')) {
                                    setLogos([]);
                                  }
                                }}
                                className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 transition-colors"
                              >
                                Clear All
                              </button>
                            )}
                          </div>

                          {/* Logos List */}
                          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                            {logos.map((logo: any, idx: number) => {
                              const isExpanded = Boolean(marqueeExpandedLogos[idx]);
                              const hasSvg = Boolean(logo.svg && logo.svg.trim().startsWith('<'));
                              return (
                                <div key={logo.id || idx} className="p-2.5 bg-slate-50 hover:bg-slate-50/90 border border-slate-200 rounded-xl space-y-2 transition-all">
                                  {/* Top Row: Mini Preview Thumbnail, Brand Name, Expand & Delete */}
                                  <div className="flex items-center space-x-2">
                                    {/* Mini thumbnail */}
                                    <div className="w-8 h-8 shrink-0 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden p-0.5 shadow-2xs">
                                      {hasSvg ? (
                                        <div
                                          className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto"
                                          dangerouslySetInnerHTML={{ __html: logo.svg }}
                                        />
                                      ) : logo.url ? (
                                        <img src={logo.url} alt={logo.name || 'Logo'} className="max-w-full max-h-full object-contain" />
                                      ) : (
                                        <ImageIcon className="w-4 h-4 text-slate-400" />
                                      )}
                                    </div>

                                    {/* Brand Name Input */}
                                    <input
                                      type="text"
                                      value={logo.name || ''}
                                      onChange={(e) => {
                                        const next = [...logos];
                                        next[idx] = { ...next[idx], name: e.target.value };
                                        setLogos(next);
                                      }}
                                      placeholder="Brand Name (e.g. Acme Inc)"
                                      className="flex-1 min-w-0 p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                                    />

                                    {/* Expand/Collapse details */}
                                    <button
                                      type="button"
                                      onClick={() => setMarqueeExpandedLogos({ ...marqueeExpandedLogos, [idx]: !isExpanded })}
                                      className={`p-1.5 rounded-lg border text-slate-500 hover:text-slate-800 transition-colors ${
                                        isExpanded ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200'
                                      }`}
                                      title={isExpanded ? 'Collapse source details' : 'Edit image URL or SVG code'}
                                    >
                                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>

                                    {/* Delete logo */}
                                    <button
                                      type="button"
                                      onClick={() => setLogos(logos.filter((_: any, i: number) => i !== idx))}
                                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 transition-colors"
                                      title="Delete logo"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Second Row: Destination Link (Optional) */}
                                  <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                                    <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <input
                                      type="text"
                                      value={logo.link || ''}
                                      onChange={(e) => {
                                        const next = [...logos];
                                        next[idx] = { ...next[idx], link: e.target.value };
                                        setLogos(next);
                                      }}
                                      placeholder="Destination Link (optional: https://brand.com)"
                                      className="w-full text-xs text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-400"
                                    />
                                    {logo.link && (
                                      <a
                                        href={logo.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 p-0.5 shrink-0"
                                        title="Open destination link"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>

                                  {/* Expanded Source Details: Image URL & Raw SVG Code */}
                                  {isExpanded && (
                                    <div className="space-y-2 pt-1 border-t border-slate-200/80">
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-slate-600">Image URL (PNG/JPEG/WebP)</label>
                                        <input
                                          type="text"
                                          value={logo.url || ''}
                                          onChange={(e) => {
                                            const next = [...logos];
                                            next[idx] = { ...next[idx], url: e.target.value };
                                            setLogos(next);
                                          }}
                                          placeholder="https://...logo.png"
                                          className={inputCls}
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-slate-600">Or Raw SVG Code</label>
                                        <textarea
                                          rows={2}
                                          value={logo.svg || ''}
                                          onChange={(e) => {
                                            const next = [...logos];
                                            next[idx] = { ...next[idx], svg: e.target.value };
                                            setLogos(next);
                                          }}
                                          placeholder="<svg ...>...</svg>"
                                          className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Add Single Logo Button */}
                          <button
                            type="button"
                            onClick={() => setLogos([...logos, { id: 'logo-' + Date.now(), name: 'New Brand', url: '', svg: '', link: '' }])}
                            className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Single Logo</span>
                          </button>

                          {/* Logo Sizing & Auto Height */}
                          <div className="pt-2 border-t border-slate-200 space-y-2.5">
                            <div className="flex items-center justify-between p-2 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                              <div>
                                <span className="text-xs font-bold text-slate-800 block">Auto Equal Height</span>
                                <span className="text-[10px] text-slate-500">Lock all PNG & SVG logos to equal level</span>
                              </div>
                              <input
                                type="checkbox"
                                checked={selectedElement.content?.autoHeight !== false}
                                onChange={(e) => updateElementContent(selectedElement.id, { autoHeight: e.target.checked })}
                                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-semibold text-slate-600">Logo Height</label>
                                  <span className="text-[10px] font-mono font-bold text-indigo-600">{selectedElement.content?.logoHeight || '40px'}</span>
                                </div>
                                <input
                                  type="text"
                                  value={selectedElement.content?.logoHeight || '40px'}
                                  onChange={(e) => updateElementContent(selectedElement.id, { logoHeight: e.target.value })}
                                  placeholder="40px"
                                  className={inputCls}
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-semibold text-slate-600">Logo Width</label>
                                  <span className="text-[10px] font-mono font-bold text-indigo-600">{selectedElement.content?.logoWidth || 'auto'}</span>
                                </div>
                                <input
                                  type="text"
                                  value={selectedElement.content?.logoWidth || 'auto'}
                                  onChange={(e) => updateElementContent(selectedElement.id, { logoWidth: e.target.value })}
                                  placeholder="auto or 120px"
                                  className={inputCls}
                                />
                              </div>
                            </div>
                          </div>
                        </CollapseGroup>
                      )}

                      {/* SLIDING ANIMATION & CONTROLS */}
                      <CollapseGroup icon={SlidersHorizontal} title="Sliding Options & Speed" defaultOpen>
                        <div className="space-y-2.5">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600">Sliding Direction</label>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateElementContent(selectedElement.id, { direction: 'left' })}
                                className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                  (selectedElement.content?.direction || 'left') === 'left'
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-600'
                                }`}
                              >
                                ← Right to Left
                              </button>
                              <button
                                type="button"
                                onClick={() => updateElementContent(selectedElement.id, { direction: 'right' })}
                                className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                  selectedElement.content?.direction === 'right'
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-600'
                                }`}
                              >
                                Left to Right →
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-600">Scroll Duration (Speed)</label>
                              <span className="text-[10px] font-mono font-bold text-indigo-600">
                                {selectedElement.content?.speed || 22}s per loop
                              </span>
                            </div>
                            <input
                              type="range"
                              min={6}
                              max={60}
                              step={2}
                              value={selectedElement.content?.speed || 22}
                              onChange={(e) => updateElementContent(selectedElement.id, { speed: Number(e.target.value) })}
                              className="w-full accent-indigo-600"
                            />
                            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                              <span>Fast (6s)</span>
                              <span>Normal (22s)</span>
                              <span>Slow (60s)</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="text-xs font-semibold text-slate-700">Pause on Hover</span>
                            <input
                              type="checkbox"
                              checked={selectedElement.content?.pauseOnHover !== false}
                              onChange={(e) => updateElementContent(selectedElement.id, { pauseOnHover: e.target.checked })}
                              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-600">Gap Between Items</label>
                              <span className="text-[10px] font-mono font-bold text-indigo-600">{selectedElement.content?.gap ?? 32}px</span>
                            </div>
                            <input
                              type="range"
                              min={12}
                              max={80}
                              step={4}
                              value={selectedElement.content?.gap ?? 32}
                              onChange={(e) => updateElementContent(selectedElement.id, { gap: Number(e.target.value) })}
                              className="w-full accent-indigo-600"
                            />
                          </div>

                          <div className="space-y-1 pt-1">
                            <label className="text-[11px] font-semibold text-slate-600">Visual Effect</label>
                            <select
                              value={selectedElement.content?.effect || 'none'}
                              onChange={(e) => updateElementContent(selectedElement.id, { effect: e.target.value })}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                            >
                              <option value="none">None (Standard)</option>
                              <option value="blur-edges">Fade Edges (Gradient Mask)</option>
                              <option value="grayscale">Grayscale (Color on Hover)</option>
                              <option value="opacity-dim">Subtle Opacity (Brighten on Hover)</option>
                            </select>
                          </div>
                        </div>
                      </CollapseGroup>
                    </div>
                  );
                })()}

                {/* 12b3. PROCESS STEPS */}
                {selectedElement.type === 'processsteps' && (() => {
                  const steps: any[] = selectedElement.content?.steps && selectedElement.content.steps.length > 0
                    ? selectedElement.content.steps
                    : [{ iconName: 'search', title: 'Discover', description: 'Tell us your goals.' }];
                  const setSteps = (next: any[]) => updateElementContent(selectedElement.id, { steps: next });
                  const inputCls = "w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500";
                  return (
                    <CollapseGroup icon={Layers} title="Process Steps" defaultOpen>
                      {steps.map((step: any, idx: number) => (
                        <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                          <div className="flex items-center space-x-1.5">
                            <input type="text" value={step.title || ''} onChange={(e) => { const next = [...steps]; next[idx] = { ...next[idx], title: e.target.value }; setSteps(next); }} placeholder="Step title..." className={inputCls} />
                            <button type="button" onClick={() => setSteps(steps.filter((_: any, i: number) => i !== idx))} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0" title="Remove step"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                          <textarea rows={2} value={step.description || ''} onChange={(e) => { const next = [...steps]; next[idx] = { ...next[idx], description: e.target.value }; setSteps(next); }} placeholder="Step description..." className={inputCls} />
                          <IconSelector label="Step Icon" value={step.iconName || 'check'} onChange={(iconName) => { const next = [...steps]; next[idx] = { ...next[idx], iconName }; setSteps(next); }} />
                        </div>
                      ))}
                      <button type="button" onClick={() => setSteps([...steps, { iconName: 'check', title: 'New step', description: 'Describe this step...' }])} className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-[11px] font-bold">+ Add Step</button>
                    </CollapseGroup>
                  );
                })()}

                {/* 12b4. SKILL BARS */}
                {selectedElement.type === 'skillbar' && (() => {
                  const bars: any[] = selectedElement.content?.bars && selectedElement.content.bars.length > 0
                    ? selectedElement.content.bars
                    : [
                        { label: 'Frontend & UI/UX', percent: 94, tag: 'Expert' },
                        { label: 'React / Next.js', percent: 90, tag: 'Advanced' },
                        { label: 'TypeScript & Node', percent: 85, tag: 'Proficient' }
                      ];
                  const setBars = (next: any[]) => updateElementContent(selectedElement.id, { bars: next });
                  const inputCls = "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500";

                  const animationType = selectedElement.content?.animationType || 'stripes';
                  const animationSpeed = selectedElement.content?.animationSpeed || '1.4s';
                  const showTipGlow = selectedElement.content?.showTipGlow !== false;
                  const interactiveHover = selectedElement.content?.interactiveHover !== false;
                  const barStyle = selectedElement.content?.barStyle || 'pill';
                  const barHeight = selectedElement.content?.barHeight || selectedElement.styles?.barHeight || '10px';
                  const percentPosition = selectedElement.content?.percentPosition || 'header';
                  const trackBg = selectedElement.content?.trackBg || selectedElement.styles?.trackBg || '#e2e8f0';

                  const PRESET_PACKS = [
                    {
                      name: 'Full Stack Dev',
                      bars: [
                        { label: 'React / Next.js', percent: 95, tag: 'Master', color: '#0ea5e9' },
                        { label: 'Node.js / Express', percent: 88, tag: 'Advanced', color: '#22c55e' },
                        { label: 'TypeScript', percent: 90, tag: 'Expert', color: '#3b82f6' },
                        { label: 'PostgreSQL / SQL', percent: 82, tag: 'Proficient', color: '#6366f1' }
                      ]
                    },
                    {
                      name: 'Design & UI/UX',
                      bars: [
                        { label: 'Figma & Design Systems', percent: 96, tag: 'Expert', color: '#ec4899' },
                        { label: 'Wireframing & Prototyping', percent: 92, tag: 'Advanced', color: '#8b5cf6' },
                        { label: 'User Research & Testing', percent: 85, tag: 'Skilled', color: '#f59e0b' },
                        { label: 'Visual Branding', percent: 89, tag: 'Senior', color: '#06b6d4' }
                      ]
                    },
                    {
                      name: 'Performance / Cloud',
                      bars: [
                        { label: 'AWS / Cloud Architecture', percent: 88, tag: 'Senior', color: '#f97316' },
                        { label: 'Docker & Kubernetes', percent: 84, tag: 'Advanced', color: '#0284c7' },
                        { label: 'CI/CD Pipelines', percent: 91, tag: 'Expert', color: '#10b981' },
                        { label: 'Cybersecurity & Auth', percent: 80, tag: 'Pro', color: '#a855f7' }
                      ]
                    }
                  ];

                  return (
                    <div className="space-y-4">
                      {/* Skill Items List */}
                      <CollapseGroup icon={SlidersHorizontal} title="Skill Items & Values" defaultOpen>
                        <div className="space-y-3">
                          {/* Quick Pack Presets */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Starter Packs</span>
                            <div className="grid grid-cols-3 gap-1">
                              {PRESET_PACKS.map((pack) => (
                                <button
                                  key={pack.name}
                                  type="button"
                                  onClick={() => setBars(pack.bars)}
                                  className="py-1 px-1.5 text-[9px] font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors text-center truncate border border-slate-200"
                                  title={`Load ${pack.name}`}
                                >
                                  {pack.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Skill Bars List */}
                          <div className="space-y-2.5 pt-1">
                            {bars.map((bar: any, idx: number) => {
                              const pct = Math.max(0, Math.min(100, Number(bar.percent) ?? 0));
                              return (
                                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-xs">
                                  {/* Row 1: Label & Delete */}
                                  <div className="flex items-center space-x-1.5">
                                    <input
                                      type="text"
                                      value={bar.label || ''}
                                      onChange={(e) => {
                                        const next = [...bars];
                                        next[idx] = { ...next[idx], label: e.target.value };
                                        setBars(next);
                                      }}
                                      placeholder="Skill name (e.g. React)..."
                                      className="flex-1 min-w-0 p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                                    />
                                    <input
                                      type="text"
                                      value={bar.tag || ''}
                                      onChange={(e) => {
                                        const next = [...bars];
                                        next[idx] = { ...next[idx], tag: e.target.value };
                                        setBars(next);
                                      }}
                                      placeholder="Tag (e.g. Expert)"
                                      className="w-24 p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                                      title="Optional badge/subtitle (e.g. Expert, 5 yrs, 90/100)"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setBars(bars.filter((_: any, i: number) => i !== idx))}
                                      className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg shrink-0 transition-colors"
                                      title="Remove skill"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Row 2: Percentage Slider & Number Input */}
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      value={pct}
                                      onChange={(e) => {
                                        const next = [...bars];
                                        next[idx] = { ...next[idx], percent: Number(e.target.value) };
                                        setBars(next);
                                      }}
                                      className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex items-center space-x-1 shrink-0">
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={bar.percent ?? ''}
                                        onChange={(e) => {
                                          const next = [...bars];
                                          next[idx] = {
                                            ...next[idx],
                                            percent: e.target.value === '' ? '' : Math.max(0, Math.min(100, Number(e.target.value)))
                                          };
                                          setBars(next);
                                        }}
                                        className="w-14 p-1 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold text-center text-slate-800 focus:outline-none focus:border-indigo-500"
                                      />
                                      <span className="text-xs font-bold text-slate-400">%</span>
                                    </div>
                                  </div>

                                  {/* Row 3: Color override */}
                                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                                    <span className="text-[10px] font-semibold text-slate-600">Bar Color</span>
                                    <div className="flex items-center space-x-1.5">
                                      <input
                                        type="color"
                                        value={bar.color || '#6366f1'}
                                        onChange={(e) => {
                                          const next = [...bars];
                                          next[idx] = { ...next[idx], color: e.target.value };
                                          setBars(next);
                                        }}
                                        className="w-5 h-5 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                                        title="Pick custom color for this bar"
                                      />
                                      {bar.color && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const next = [...bars];
                                            const { color, ...rest } = next[idx];
                                            next[idx] = rest;
                                            setBars(next);
                                          }}
                                          className="text-[9px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                                        >
                                          Reset
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={() => setBars([...bars, { label: 'New Skill', percent: 80, tag: 'Proficient' }])}
                            className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add New Skill Bar</span>
                          </button>
                        </div>
                      </CollapseGroup>

                      {/* Loading Animations & Effects */}
                      <CollapseGroup icon={Sparkles} title="Loading Animation & Effects" defaultOpen>
                        <div className="space-y-3">
                          {/* Animation Type Presets */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600">Animation Style</label>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { id: 'stripes', label: 'Barber Stripes' },
                                { id: 'shimmer', label: 'Shimmer Sweep' },
                                { id: 'pulse', label: 'Pulse Glow' },
                                { id: 'slide', label: 'Slide Fill' },
                                { id: 'none', label: 'Static None' }
                              ].map((anim) => (
                                <button
                                  key={anim.id}
                                  type="button"
                                  onClick={() => updateElementContent(selectedElement.id, { animationType: anim.id })}
                                  className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all text-center truncate ${
                                    animationType === anim.id
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                  }`}
                                >
                                  {anim.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Animation Speed */}
                          {animationType !== 'none' && (
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-600">Animation Speed</label>
                              <div className="grid grid-cols-3 gap-1">
                                {[
                                  { label: 'Fast (0.8s)', val: '0.8s' },
                                  { label: 'Normal (1.4s)', val: '1.4s' },
                                  { label: 'Slow (2.2s)', val: '2.2s' }
                                ].map((speed) => (
                                  <button
                                    key={speed.val}
                                    type="button"
                                    onClick={() => updateElementContent(selectedElement.id, { animationSpeed: speed.val })}
                                    className={`py-1 text-[10px] font-semibold rounded-lg border transition-all ${
                                      animationSpeed === speed.val
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    {speed.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tip Glow Bulb Toggle */}
                          <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl">
                            <div>
                              <span className="text-xs font-semibold text-slate-700 block">Glowing Tip Marker</span>
                              <span className="text-[10px] text-slate-400">Radiant indicator dot at progress tip</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={showTipGlow}
                              onChange={(e) => updateElementContent(selectedElement.id, { showTipGlow: e.target.checked })}
                              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                            />
                          </div>

                          {/* Interactive Hover Lift & Glow Toggle */}
                          <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl">
                            <div>
                              <span className="text-xs font-semibold text-slate-700 block">Interactive Hover Effect</span>
                              <span className="text-[10px] text-slate-400">Slight lift &amp; vibrant shadow on hover</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={interactiveHover}
                              onChange={(e) => updateElementContent(selectedElement.id, { interactiveHover: e.target.checked })}
                              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                            />
                          </div>
                        </div>
                      </CollapseGroup>

                      {/* Bar Appearance & Layout */}
                      <CollapseGroup icon={Layout} title="Bar Shape & Appearance" defaultOpen={false}>
                        <div className="space-y-3">
                          {/* Bar Style Shape */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600">Bar Shape</label>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { id: 'pill', label: 'Pill' },
                                { id: 'rounded', label: 'Rounded' },
                                { id: 'sharp', label: 'Sharp' },
                                { id: 'segmented', label: '10-Bar' }
                              ].map((shape) => (
                                <button
                                  key={shape.id}
                                  type="button"
                                  onClick={() => updateElementContent(selectedElement.id, { barStyle: shape.id })}
                                  className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                    barStyle === shape.id
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                  }`}
                                >
                                  {shape.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Bar Thickness / Height */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600">Bar Height</label>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { label: 'Slim', val: '6px' },
                                { label: 'Medium', val: '10px' },
                                { label: 'Thick', val: '16px' },
                                { label: 'Chunky', val: '22px' }
                              ].map((h) => (
                                <button
                                  key={h.val}
                                  type="button"
                                  onClick={() => {
                                    updateElementContent(selectedElement.id, { barHeight: h.val });
                                    updateElementStyles(selectedElement.id, { barHeight: h.val });
                                  }}
                                  className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                    barHeight === h.val
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                  }`}
                                >
                                  {h.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Percentage Placement */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600">Percentage Position</label>
                            <select
                              value={percentPosition}
                              onChange={(e) => updateElementContent(selectedElement.id, { percentPosition: e.target.value })}
                              className={inputCls}
                            >
                              <option value="header">Header (Top Right)</option>
                              <option value="floating">Floating Tooltip Pill</option>
                              <option value="inside">Inside Filled Bar</option>
                              <option value="badge">Badge Beside Label</option>
                              <option value="hidden">Hidden (No Numbers)</option>
                            </select>
                          </div>

                          {/* Default Fill Color & Track Background */}
                          <div className="grid grid-cols-2 gap-2">
                            <ModernColorPicker
                              label="Default Fill Color"
                              value={selectedElement.styles?.bgColor || selectedElement.styles?.iconColor || '#6366f1'}
                              onChange={(val) => {
                                updateElementStyles(selectedElement.id, { bgColor: val, iconColor: val });
                              }}
                            />
                            <ModernColorPicker
                              label="Track Background"
                              value={trackBg}
                              onChange={(val) => {
                                updateElementContent(selectedElement.id, { trackBg: val });
                                updateElementStyles(selectedElement.id, { trackBg: val });
                              }}
                            />
                          </div>

                          {/* Spacing / Gap between skill bars */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600">Bar Spacing</label>
                            <select
                              value={selectedElement.styles?.gap || '16px'}
                              onChange={(e) => updateElementStyles(selectedElement.id, { gap: e.target.value })}
                              className={inputCls}
                            >
                              <option value="10px">Compact (10px)</option>
                              <option value="16px">Standard (16px)</option>
                              <option value="24px">Comfortable (24px)</option>
                              <option value="32px">Spacious (32px)</option>
                            </select>
                          </div>
                        </div>
                      </CollapseGroup>
                    </div>
                  );
                })()}

                {/* 12b5. COUNTDOWN */}
                {selectedElement.type === 'countdown' && (() => {
                  const labels = selectedElement.content?.labels || { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' };
                  const inputCls = "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500";
                  return (
                    <CollapseGroup icon={Clock} title="Countdown" defaultOpen>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Target Date &amp; Time</label>
                        <input type="datetime-local" value={selectedElement.content?.targetDate ? String(selectedElement.content.targetDate).slice(0, 16) : ''} onChange={(e) => { const d = e.target.value ? new Date(e.target.value) : null; updateElementContent(selectedElement.id, { targetDate: d && !isNaN(d.getTime()) ? d.toISOString() : e.target.value }); }} className={inputCls} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Finished Text</label>
                        <input type="text" value={selectedElement.content?.finishedText || ''} onChange={(e) => updateElementContent(selectedElement.id, { finishedText: e.target.value })} placeholder="The offer has ended" className={inputCls} />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['days', 'hours', 'minutes', 'seconds'] as const).map((k) => (
                          <div key={k} className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600 capitalize">{k} Label</label>
                            <input type="text" value={labels[k] || ''} onChange={(e) => updateElementContent(selectedElement.id, { labels: { ...labels, [k]: e.target.value } })} className={inputCls} />
                          </div>
                        ))}
                      </div>
                    </CollapseGroup>
                  );
                })()}

                {/* 12b6. SOCIAL ICONS */}
                {selectedElement.type === 'socialicons' && (() => {
                  const links: any[] = selectedElement.content?.links && selectedElement.content.links.length > 0
                    ? selectedElement.content.links
                    : [{ network: 'website', url: 'https://example.com/' }];
                  const setLinks = (next: any[]) => updateElementContent(selectedElement.id, { links: next });
                  const networks = ['instagram', 'youtube', 'x', 'facebook', 'linkedin', 'github', 'tiktok', 'email', 'website'];
                  return (
                    <CollapseGroup icon={Globe} title="Social Links" defaultOpen>
                      {links.map((link: any, idx: number) => (
                        <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                          <div className="flex items-center space-x-1.5">
                            <select value={link.network || 'website'} onChange={(e) => { const next = [...links]; next[idx] = { ...next[idx], network: e.target.value }; setLinks(next); }} className="flex-1 min-w-0 p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none">
                              {networks.map((n) => (<option key={n} value={n}>{n}</option>))}
                            </select>
                            <button type="button" onClick={() => setLinks(links.filter((_: any, i: number) => i !== idx))} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0" title="Remove link"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                          <input type="text" value={link.url || ''} onChange={(e) => { const next = [...links]; next[idx] = { ...next[idx], url: e.target.value }; setLinks(next); }} placeholder="https://..." className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500" />
                        </div>
                      ))}
                      <button type="button" onClick={() => setLinks([...links, { network: 'website', url: 'https://' }])} className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-[11px] font-bold">+ Add Link</button>
                    </CollapseGroup>
                  );
                })()}

                {/* 12b7. RATING */}
                {selectedElement.type === 'rating' && (
                  <CollapseGroup icon={Star} title="Rating" defaultOpen>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Value (0 - 5)</label>
                      <input type="number" min={0} max={5} step={0.1} value={selectedElement.content?.value ?? 5} onChange={(e) => updateElementContent(selectedElement.id, { value: e.target.value === '' ? '' : Math.max(0, Math.min(5, Number(e.target.value))) })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Count / Review Text</label>
                      <input type="text" value={selectedElement.content?.count || ''} onChange={(e) => updateElementContent(selectedElement.id, { count: e.target.value })} placeholder="5.0 · 212 reviews" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500" />
                    </div>
                  </CollapseGroup>
                )}

                {/* 12b8. TIMELINE (Themes, Connectors, Milestone Cards & Dots) */}
                {selectedElement.type === 'timeline' && (() => {
                  const tlTheme = selectedElement.content?.timelineTheme || 'modern';
                  const tlItems: any[] = selectedElement.content?.items && selectedElement.content.items.length > 0
                    ? selectedElement.content.items
                    : [
                        { date: 'Jan 2024', title: 'Project Kickoff', description: 'Product architecture & research complete.', tag: 'Phase 1', iconName: 'rocket' },
                        { date: 'Jun 2024', title: 'Beta Release', description: 'Shipped edge runtime to early testers.', tag: 'Milestone', iconName: 'check' },
                        { date: 'Dec 2024', title: 'Global Launch', description: '1.0 general availability worldwide.', tag: 'Live', iconName: 'star' }
                      ];
                  const setTlItems = (next: any[]) => updateElementContent(selectedElement.id, { items: next });
                  const inputCls = "w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500";

                  return (
                    <div className="space-y-3">
                      {/* Theme Selector */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                        <label className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                          Timeline Theme & Layout
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'modern', label: 'Modern Left Line' },
                            { id: 'card', label: 'Elevated Cards' },
                            { id: 'alternating', label: 'Zigzag Alternating' },
                            { id: 'minimal', label: 'Minimal Hairline' },
                            { id: 'glassmorphism', label: 'Glassmorphic' },
                            { id: 'neon', label: 'Cyber Neon' },
                            { id: 'badge-pill', label: 'Badge Pill' }
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => updateElementContent(selectedElement.id, { timelineTheme: t.id })}
                              className={`py-1.5 px-2 text-left text-[11px] font-bold rounded-lg border transition-all ${
                                tlTheme === t.id
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Items Editor */}
                      <CollapseGroup icon={FileText} title={`Milestones (${tlItems.length})`} defaultOpen>
                        <div className="space-y-2.5">
                          {tlItems.map((item: any, idx: number) => (
                            <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase">Milestone #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => setTlItems(tlItems.filter((_: any, i: number) => i !== idx))}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                  title="Delete milestone"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="text"
                                  value={item.date || ''}
                                  onChange={(e) => {
                                    const next = [...tlItems];
                                    next[idx] = { ...next[idx], date: e.target.value };
                                    setTlItems(next);
                                  }}
                                  placeholder="Date (e.g. Q1 2024)"
                                  className={inputCls}
                                />
                                <input
                                  type="text"
                                  value={item.tag || ''}
                                  onChange={(e) => {
                                    const next = [...tlItems];
                                    next[idx] = { ...next[idx], tag: e.target.value };
                                    setTlItems(next);
                                  }}
                                  placeholder="Tag (e.g. Complete)"
                                  className={inputCls}
                                />
                              </div>

                              <input
                                type="text"
                                value={item.title || ''}
                                onChange={(e) => {
                                  const next = [...tlItems];
                                  next[idx] = { ...next[idx], title: e.target.value };
                                  setTlItems(next);
                                }}
                                placeholder="Milestone Title..."
                                className={inputCls}
                              />

                              <textarea
                                rows={2}
                                value={item.description || ''}
                                onChange={(e) => {
                                  const next = [...tlItems];
                                  next[idx] = { ...next[idx], description: e.target.value };
                                  setTlItems(next);
                                }}
                                placeholder="Description / details..."
                                className={inputCls}
                              />
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setTlItems([
                                ...tlItems,
                                {
                                  date: `Year ${tlItems.length + 2024}`,
                                  title: 'New Milestone',
                                  description: 'Describe progress reached in this phase.',
                                  tag: 'Phase ' + (tlItems.length + 1)
                                }
                              ])
                            }
                            className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            + Add Milestone
                          </button>
                        </div>
                      </CollapseGroup>

                      {/* Line & Connector Styling */}
                      <CollapseGroup icon={SlidersHorizontal} title="Spine & Dot Styling" defaultOpen={false}>
                        <div className="space-y-2.5">
                          <ModernColorPicker
                            label="Spine Line Color"
                            value={selectedElement.styles?.lineColor || '#6366f1'}
                            onChange={(val) => updateElementStyles(selectedElement.id, { lineColor: val })}
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-600">Line Width</label>
                              <select
                                value={selectedElement.styles?.lineWidth || '2px'}
                                onChange={(e) => updateElementStyles(selectedElement.id, { lineWidth: e.target.value })}
                                className={inputCls}
                              >
                                <option value="1px">1px Subtle</option>
                                <option value="2px">2px Standard</option>
                                <option value="3px">3px Bold</option>
                                <option value="4px">4px Heavy</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-600">Line Pattern</label>
                              <select
                                value={selectedElement.styles?.lineStyle || 'solid'}
                                onChange={(e) => updateElementStyles(selectedElement.id, { lineStyle: e.target.value as any })}
                                className={inputCls}
                              >
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                                <option value="dotted">Dotted</option>
                              </select>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <ModernColorPicker
                              label="Marker Dot Color"
                              value={selectedElement.styles?.dotColor || '#6366f1'}
                              onChange={(val) => updateElementStyles(selectedElement.id, { dotColor: val })}
                            />

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-600">Dot Shape</label>
                                <select
                                  value={selectedElement.styles?.dotShape || 'circle'}
                                  onChange={(e) => updateElementStyles(selectedElement.id, { dotShape: e.target.value as any })}
                                  className={inputCls}
                                >
                                  <option value="circle">Circle</option>
                                  <option value="square">Square</option>
                                  <option value="diamond">Diamond</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-600">Dot Size</label>
                                <select
                                  value={selectedElement.styles?.dotSize || '14px'}
                                  onChange={(e) => updateElementStyles(selectedElement.id, { dotSize: e.target.value })}
                                  className={inputCls}
                                >
                                  <option value="10px">Small (10px)</option>
                                  <option value="14px">Medium (14px)</option>
                                  <option value="18px">Large (18px)</option>
                                  <option value="22px">Extra Large (22px)</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl">
                              <span className="text-xs font-semibold text-slate-700">Pulsing Dot Glow</span>
                              <input
                                type="checkbox"
                                checked={selectedElement.content?.pulseDots !== false}
                                onChange={(e) => updateElementContent(selectedElement.id, { pulseDots: e.target.checked })}
                                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </CollapseGroup>

                      {/* Card & Background Styling */}
                      <CollapseGroup icon={Layout} title="Card Styling & Spacing" defaultOpen={false}>
                        <div className="space-y-2.5">
                          <ModernColorPicker
                            label="Card Background"
                            value={selectedElement.styles?.cardBgColor || '#f8fafc'}
                            onChange={(val) => updateElementStyles(selectedElement.id, { cardBgColor: val })}
                          />
                          <ModernColorPicker
                            label="Card Border Color"
                            value={selectedElement.styles?.cardBorderColor || '#e2e8f0'}
                            onChange={(val) => updateElementStyles(selectedElement.id, { cardBorderColor: val })}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-600">Card Radius</label>
                              <select
                                value={selectedElement.styles?.cardBorderRadius || '14px'}
                                onChange={(e) => updateElementStyles(selectedElement.id, { cardBorderRadius: e.target.value })}
                                className={inputCls}
                              >
                                <option value="8px">Small (8px)</option>
                                <option value="14px">Medium (14px)</option>
                                <option value="20px">Large (20px)</option>
                                <option value="0px">Sharp (0px)</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-600">Item Gap</label>
                              <select
                                value={selectedElement.styles?.gap || '24px'}
                                onChange={(e) => updateElementStyles(selectedElement.id, { gap: e.target.value })}
                                className={inputCls}
                              >
                                <option value="16px">Compact (16px)</option>
                                <option value="24px">Comfortable (24px)</option>
                                <option value="36px">Spacious (36px)</option>
                                <option value="48px">Extra Spacious (48px)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </CollapseGroup>

                      {/* Date & Tag / Badge Styling */}
                      <CollapseGroup icon={Palette} title="Date & Tag / Badge Styling" defaultOpen={false}>
                        <div className="space-y-2.5">
                          <ModernColorPicker
                            label="Date Text Color"
                            value={selectedElement.styles?.dateColor || selectedElement.styles?.lineColor || selectedElement.styles?.iconColor || '#6366f1'}
                            onChange={(val) => updateElementStyles(selectedElement.id, { dateColor: val })}
                          />
                          <ModernColorPicker
                            label="Tag / Badge Text Color"
                            value={selectedElement.styles?.tagColor || selectedElement.styles?.lineColor || selectedElement.styles?.iconColor || '#6366f1'}
                            onChange={(val) => updateElementStyles(selectedElement.id, { tagColor: val })}
                          />
                          <ModernColorPicker
                            label="Tag / Badge Background"
                            value={selectedElement.styles?.tagBgColor || 'rgba(99, 102, 241, 0.1)'}
                            onChange={(val) => updateElementStyles(selectedElement.id, { tagBgColor: val })}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-600">Date Font Size</label>
                              <select
                                value={selectedElement.styles?.dateFontSize || '11px'}
                                onChange={(e) => updateElementStyles(selectedElement.id, { dateFontSize: e.target.value })}
                                className={inputCls}
                              >
                                <option value="10px">10px</option>
                                <option value="11px">11px</option>
                                <option value="12px">12px</option>
                                <option value="13px">13px</option>
                                <option value="14px">14px</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-600">Tag Font Size</label>
                              <select
                                value={selectedElement.styles?.tagFontSize || '10px'}
                                onChange={(e) => updateElementStyles(selectedElement.id, { tagFontSize: e.target.value })}
                                className={inputCls}
                              >
                                <option value="9px">9px</option>
                                <option value="10px">10px</option>
                                <option value="11px">11px</option>
                                <option value="12px">12px</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </CollapseGroup>
                    </div>
                  );
                })()}

                {/* 12b9. TYPEWRITER HEADLINE (Sentence, Rotating Words, Timing, Cursor, Styling) */}
                {selectedElement.type === 'typewriterheadline' && (() => {
                  const prefixText = selectedElement.content?.prefixText !== undefined ? selectedElement.content.prefixText : 'We deliver';
                  const rawWords: string[] = Array.isArray(selectedElement.content?.rotatingWords) && selectedElement.content.rotatingWords.length > 0
                    ? selectedElement.content.rotatingWords
                    : ['CLEAN', 'FAST', 'AFFORDABLE'];
                  const suffixText = selectedElement.content?.suffixText !== undefined ? selectedElement.content.suffixText : 'solutions.';

                  const typeSpeed = Number(selectedElement.content?.typeSpeed) || 100;
                  const deleteSpeed = Number(selectedElement.content?.deleteSpeed) || 50;
                  const pauseTime = Number(selectedElement.content?.pauseTime) || 2000;
                  const showCursor = selectedElement.content?.showCursor !== false;
                  const cursorChar = selectedElement.content?.cursorChar || '|';
                  const cursorColor = selectedElement.content?.cursorColor || selectedElement.content?.rotatingWordColor || '#6366f1';
                  const rotatingWordColor = selectedElement.content?.rotatingWordColor || '#6366f1';
                  const rotatingWordBold = selectedElement.content?.rotatingWordBold !== false;
                  const rotatingWordUppercase = selectedElement.content?.rotatingWordUppercase !== false;

                  const fontSize = selectedElement.styles?.fontSize || '36px';
                  const textAlign = selectedElement.styles?.textAlign || selectedElement.content?.textAlign || 'center';

                  const setWords = (next: string[]) => updateElementContent(selectedElement.id, { rotatingWords: next });
                  const moveWord = (from: number, to: number) => {
                    if (to < 0 || to >= rawWords.length) return;
                    const next = [...rawWords];
                    const [item] = next.splice(from, 1);
                    next.splice(to, 0, item);
                    setWords(next);
                  };

                  const inputCls = "w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors";

                  return (
                    <div className="space-y-3">
                      {/* Live Sentence Preview Badge */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-inner space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          <span className="flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Animated Heading</span>
                          </span>
                          <span className="text-[9px] text-slate-400">{rawWords.length} words loop</span>
                        </div>
                        <div className="text-xs font-bold truncate pt-1">
                          <span className="text-slate-300">{prefixText} </span>
                          <span style={{ color: rotatingWordColor, textTransform: rotatingWordUppercase ? 'uppercase' : 'none' }}>
                            {rawWords[0] || 'WORD'}
                          </span>
                          {showCursor && <span className="animate-pulse" style={{ color: cursorColor }}> {cursorChar}</span>}
                          <span className="text-slate-300"> {suffixText}</span>
                        </div>
                      </div>

                      {/* 1. Sentence Prefix & Suffix */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2.5">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                          Headline Sentence Structure
                        </span>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-600">Prefix Text</label>
                          <input
                            type="text"
                            value={prefixText}
                            onChange={(e) => updateElementContent(selectedElement.id, { prefixText: e.target.value })}
                            placeholder="e.g. We deliver"
                            className={inputCls}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-600">Suffix Text</label>
                          <input
                            type="text"
                            value={suffixText}
                            onChange={(e) => updateElementContent(selectedElement.id, { suffixText: e.target.value })}
                            placeholder="e.g. solutions."
                            className={inputCls}
                          />
                        </div>
                      </div>

                      {/* 2. Rotating Words Manager */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                            Rotating Words ({rawWords.length})
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">Plays in order</span>
                        </div>

                        <div className="space-y-1.5">
                          {rawWords.map((word, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-lg group hover:border-slate-300 transition-colors"
                            >
                              <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] font-mono font-bold text-slate-500 shrink-0">
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={word}
                                onChange={(e) => {
                                  const next = [...rawWords];
                                  next[idx] = e.target.value;
                                  setWords(next);
                                }}
                                placeholder="Word..."
                                className="flex-1 min-w-0 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                              />

                              {/* Reorder Buttons */}
                              <div className="flex items-center space-x-0.5">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveWord(idx, idx - 1)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20 rounded hover:bg-slate-200/50 transition-colors cursor-pointer"
                                  title="Move Up"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === rawWords.length - 1}
                                  onClick={() => moveWord(idx, idx + 1)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20 rounded hover:bg-slate-200/50 transition-colors cursor-pointer"
                                  title="Move Down"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Delete Word */}
                              <button
                                type="button"
                                disabled={rawWords.length <= 1}
                                onClick={() => setWords(rawWords.filter((_, i) => i !== idx))}
                                className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove word"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setWords([...rawWords, 'AWESOME'])}
                          className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Rotating Word</span>
                        </button>
                      </div>

                      {/* 3. Rotating Word Styling */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2.5">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                          Rotating Word Style
                        </span>

                        <ModernColorPicker
                          label="Word Highlight Color"
                          value={rotatingWordColor}
                          onChange={(color) => updateElementContent(selectedElement.id, { rotatingWordColor: color })}
                        />

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={rotatingWordBold}
                              onChange={(e) => updateElementContent(selectedElement.id, { rotatingWordBold: e.target.checked })}
                              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                            />
                            <span className="text-xs font-bold text-slate-700">Bold Word</span>
                          </label>

                          <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={rotatingWordUppercase}
                              onChange={(e) => updateElementContent(selectedElement.id, { rotatingWordUppercase: e.target.checked })}
                              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                            />
                            <span className="text-xs font-bold text-slate-700">UPPERCASE</span>
                          </label>
                        </div>
                      </div>

                      {/* 4. Animation Timing & Speed */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2.5">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                          Typing & Deleting Timing
                        </span>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-semibold text-slate-600">Typing Speed</label>
                            <span className="text-[10px] font-mono font-bold text-indigo-600">{typeSpeed}ms / char</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { label: 'Fast (50ms)', ms: 50 },
                              { label: 'Normal (100ms)', ms: 100 },
                              { label: 'Smooth (150ms)', ms: 150 },
                              { label: 'Slow (220ms)', ms: 220 }
                            ].map((s) => (
                              <button
                                key={s.ms}
                                type="button"
                                onClick={() => updateElementContent(selectedElement.id, { typeSpeed: s.ms })}
                                className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                  typeSpeed === s.ms
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-semibold text-slate-600">Delete Speed</label>
                            <span className="text-[10px] font-mono font-bold text-indigo-600">{deleteSpeed}ms / char</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { label: 'Fast (30ms)', ms: 30 },
                              { label: 'Normal (50ms)', ms: 50 },
                              { label: 'Smooth (80ms)', ms: 80 },
                              { label: 'Slow (120ms)', ms: 120 }
                            ].map((s) => (
                              <button
                                key={s.ms}
                                type="button"
                                onClick={() => updateElementContent(selectedElement.id, { deleteSpeed: s.ms })}
                                className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                  deleteSpeed === s.ms
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-semibold text-slate-600">Pause Time at Complete Word</label>
                            <span className="text-[10px] font-mono font-bold text-indigo-600">{(pauseTime / 1000).toFixed(1)}s</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { label: '1.0s', ms: 1000 },
                              { label: '1.5s', ms: 1500 },
                              { label: '2.0s', ms: 2000 },
                              { label: '3.0s', ms: 3000 }
                            ].map((p) => (
                              <button
                                key={p.ms}
                                type="button"
                                onClick={() => updateElementContent(selectedElement.id, { pauseTime: p.ms })}
                                className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                  pauseTime === p.ms
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 5. Blinking Cursor */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2.5">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                          Blinking Cursor
                        </span>

                        <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={showCursor}
                            onChange={(e) => updateElementContent(selectedElement.id, { showCursor: e.target.checked })}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          <span className="text-xs font-bold text-slate-700">Show Blinking Cursor</span>
                        </label>

                        {showCursor && (
                          <div className="space-y-2.5 pt-1">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-600">Cursor Symbol</label>
                              <div className="grid grid-cols-4 gap-1">
                                {[
                                  { label: '| Pipe', char: '|' },
                                  { label: '_ Line', char: '_' },
                                  { label: '█ Block', char: '█' },
                                  { label: '▌ Half', char: '▌' }
                                ].map((c) => (
                                  <button
                                    key={c.char}
                                    type="button"
                                    onClick={() => updateElementContent(selectedElement.id, { cursorChar: c.char })}
                                    className={`py-1 text-[10px] font-bold rounded-lg border font-mono transition-all ${
                                      cursorChar === c.char
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    {c.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <ModernColorPicker
                              label="Cursor Color"
                              value={cursorColor}
                              onChange={(color) => updateElementContent(selectedElement.id, { cursorColor: color })}
                            />
                          </div>
                        )}
                      </div>

                      {/* 6. Typography & Alignment */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2.5">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                          Typography & Alignment
                        </span>

                        {/* Font Size */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-600">Font Size</label>
                          <div className="grid grid-cols-5 gap-1">
                            {[
                              { label: '24px', val: '24px' },
                              { label: '32px', val: '32px' },
                              { label: '36px', val: '36px' },
                              { label: '44px', val: '44px' },
                              { label: '56px', val: '56px' }
                            ].map((sz) => (
                              <button
                                key={sz.val}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { fontSize: sz.val })}
                                className={`py-1 text-[10px] font-mono font-bold rounded-lg border transition-all ${
                                  fontSize === sz.val
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {sz.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Text Alignment */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-600">Text Alignment</label>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { id: 'left', label: 'Left', icon: AlignLeft },
                              { id: 'center', label: 'Center', icon: AlignCenter },
                              { id: 'right', label: 'Right', icon: AlignRight }
                            ].map((a) => {
                              const Icon = a.icon;
                              const isCur = textAlign === a.id;
                              return (
                                <button
                                  key={a.id}
                                  type="button"
                                  onClick={() => {
                                    updateElementStyles(selectedElement.id, { textAlign: a.id as any });
                                    updateElementContent(selectedElement.id, { textAlign: a.id });
                                  }}
                                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center space-x-1.5 ${
                                    isCur
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                  <span>{a.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Base Text Color */}
                        <ModernColorPicker
                          label="Sentence Text Color"
                          value={selectedElement.styles?.color || '#0f172a'}
                          onChange={(color) => updateElementStyles(selectedElement.id, { color })}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* 12b-2. LOTTIE ANIMATION */}
                {selectedElement.type === 'lottie' && (() => {
                  const LOTTIE_PRESETS = [
                    { name: 'Rocket Launch', url: 'https://assets5.lottiefiles.com/packages/lf20_tno6cg2w.json', icon: '🚀' },
                    { name: 'Success Check', url: 'https://assets9.lottiefiles.com/packages/lf20_jbrw3hcz.json', icon: '✅' },
                    { name: 'Confetti Boom', url: 'https://assets1.lottiefiles.com/packages/lf20_rovf9gzu.json', icon: '🎉' },
                    { name: 'Loading Pulse', url: 'https://assets8.lottiefiles.com/packages/lf20_x62chJ.json', icon: '⏳' },
                    { name: 'Coding Dev', url: 'https://assets10.lottiefiles.com/packages/lf20_w51pcehl.json', icon: '💻' },
                    { name: 'Shopping Cart', url: 'https://assets4.lottiefiles.com/packages/lf20_1yy00u3v.json', icon: '🛒' },
                    { name: 'Growth Chart', url: 'https://assets2.lottiefiles.com/packages/lf20_q5pk6p1k.json', icon: '📈' },
                    { name: 'Delivery Van', url: 'https://assets7.lottiefiles.com/packages/lf20_5tkzkblw.json', icon: '🚚' },
                  ];

                  const currentUrl = selectedElement.content?.url || 'https://assets5.lottiefiles.com/packages/lf20_tno6cg2w.json';
                  const autoplay = selectedElement.content?.autoplay ?? true;
                  const loop = selectedElement.content?.loop ?? true;
                  const hover = selectedElement.content?.hover ?? false;
                  const controls = selectedElement.content?.controls ?? false;
                  const speed = selectedElement.content?.speed ?? 1;

                  return (
                    <div className="space-y-4">
                      {/* Presets */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-slate-700">Animation Presets</label>
                          <span className="text-[10px] text-slate-400 font-mono">1-Click Apply</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {LOTTIE_PRESETS.map((preset) => {
                            const isActive = currentUrl === preset.url;
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => updateElementContent(selectedElement.id, { url: preset.url })}
                                className={`px-2 py-2 text-xs font-semibold rounded-lg border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                                  isActive
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600'
                                }`}
                              >
                                <span className="text-base leading-none">{preset.icon}</span>
                                <span className="truncate text-[11px]">{preset.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Lottie JSON URL */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Lottie JSON URL</label>
                        <input
                          type="text"
                          value={currentUrl}
                          onChange={(e) => updateElementContent(selectedElement.id, { url: e.target.value })}
                          placeholder="https://assets.../animation.json"
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                        <p className="text-[10px] text-slate-400">
                          Supports any public Lottie .json URL from LottieFiles or your CDN.
                        </p>
                      </div>

                      {/* Playback Settings */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 space-y-2.5">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                          Playback Controls
                        </span>

                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={autoplay}
                              onChange={(e) => updateElementContent(selectedElement.id, { autoplay: e.target.checked })}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="font-medium">Autoplay</span>
                          </label>

                          <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={loop}
                              onChange={(e) => updateElementContent(selectedElement.id, { loop: e.target.checked })}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="font-medium">Loop</span>
                          </label>

                          <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hover}
                              onChange={(e) => updateElementContent(selectedElement.id, { hover: e.target.checked })}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="font-medium">Play on Hover</span>
                          </label>

                          <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={controls}
                              onChange={(e) => updateElementContent(selectedElement.id, { controls: e.target.checked })}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="font-medium">Show Controls</span>
                          </label>
                        </div>

                        {/* Speed */}
                        <div className="space-y-1 pt-1 border-t border-slate-200/60">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-600">Speed</label>
                            <span className="text-[10px] font-mono font-bold text-indigo-600">{speed}x</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {[0.5, 1, 1.5, 2].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => updateElementContent(selectedElement.id, { speed: s })}
                                className={`py-1 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                                  speed === s
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'
                                }`}
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Dimensions & Alignment */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 space-y-2.5">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                          Size & Alignment
                        </span>

                        {/* Size Presets */}
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { label: 'Small (180px)', w: '180px', h: '180px' },
                            { label: 'Medium (280px)', w: '280px', h: '280px' },
                            { label: 'Large (400px)', w: '400px', h: '400px' },
                          ].map((preset) => {
                            const isMatch = selectedElement.styles?.width === preset.w;
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { width: preset.w, height: preset.h })}
                                className={`py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                                  isMatch
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'
                                }`}
                              >
                                {preset.label.split(' ')[0]}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Width & Height */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-600">Width</label>
                            <input
                              type="text"
                              value={selectedElement.styles?.width || '280px'}
                              onChange={(e) => updateElementStyles(selectedElement.id, { width: e.target.value })}
                              placeholder="280px"
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-600">Height</label>
                            <input
                              type="text"
                              value={selectedElement.styles?.height || '280px'}
                              onChange={(e) => updateElementStyles(selectedElement.id, { height: e.target.value })}
                              placeholder="280px"
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Alignment */}
                        <div className="space-y-1 pt-1 border-t border-slate-200/60">
                          <label className="text-[10px] font-semibold text-slate-600">Align</label>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { id: 'flex-start', label: 'Left', icon: AlignLeft },
                              { id: 'center', label: 'Center', icon: AlignCenter },
                              { id: 'flex-end', label: 'Right', icon: AlignRight }
                            ].map(({ id, label, icon: Icon }) => {
                              const active = (selectedElement.styles?.alignSelf || 'center') === id;
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { alignSelf: id, justifyContent: id })}
                                  className={`py-1.5 text-xs font-semibold rounded-lg border flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                                    active
                                      ? 'bg-indigo-600 text-white border-indigo-600'
                                      : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'
                                  }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                  <span>{label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Background Color */}
                      <ModernColorPicker
                        label="Background Color"
                        value={selectedElement.content?.backgroundColor || selectedElement.styles?.backgroundColor || ''}
                        onChange={(color) => {
                          updateElementContent(selectedElement.id, { backgroundColor: color });
                          updateElementStyles(selectedElement.id, { backgroundColor: color });
                        }}
                      />
                    </div>
                  );
                })()}

                {/* 12c. GENERIC CONTENT FIELDS — fallback for element types that
                    have no dedicated Content section above (their main content
                    fields were previously impossible to edit at all) */}
                {(() => {
                  const GENERIC_FIELDS: Record<string, { key: string; label: string; kind?: string; options?: string[] }[]> = {
                    contentcard: [
                      { key: 'badge', label: 'Badge' },
                      { key: 'title', label: 'Title' },
                      { key: 'description', label: 'Description', kind: 'textarea' }
                    ],
                    teammember: [
                      { key: 'name', label: 'Name' },
                      { key: 'role', label: 'Role' },
                      { key: 'avatar', label: 'Avatar Image URL' },
                      { key: 'bio', label: 'Bio', kind: 'textarea' }
                    ],
                    counter: [
                      { key: 'value', label: 'Value' },
                      { key: 'suffix', label: 'Suffix' },
                      { key: 'label', label: 'Label' }
                    ],
                    badge: [
                      { key: 'text', label: 'Badge Text' },
                      { key: 'variant', label: 'Variant', kind: 'select', options: ['pill', 'square'] }
                    ],
                    alert: [
                      { key: 'alertType', label: 'Alert Type', kind: 'select', options: ['info', 'success', 'warning', 'error'] },
                      { key: 'title', label: 'Title' },
                      { key: 'message', label: 'Message', kind: 'textarea' }
                    ],
                    divider: [
                      { key: 'thickness', label: 'Thickness (px)', kind: 'number' },
                      { key: 'style', label: 'Line Style', kind: 'select', options: ['solid', 'dashed', 'dotted'] }
                    ],
                    spacer: [
                      { key: 'height', label: 'Height (px)', kind: 'number' }
                    ],
                    contactdetails: [
                      { key: 'email', label: 'Email' },
                      { key: 'phone', label: 'Phone' },
                      { key: 'address', label: 'Address' },
                      { key: 'hours', label: 'Hours' }
                    ],
                    logocloud: [
                      { key: 'title', label: 'Title' },
                      { key: 'logos', label: 'Logo Names (comma separated)', kind: 'csv' }
                    ],
                    flipbox: [
                      { key: 'frontTitle', label: 'Front Title' },
                      { key: 'frontIcon', label: 'Front Icon Name' },
                      { key: 'backTitle', label: 'Back Title' },
                      { key: 'backDesc', label: 'Back Description', kind: 'textarea' }
                    ]
                  };
                  const fields = GENERIC_FIELDS[selectedElement.type];
                  if (!fields) return null;
                  return (
                    <CollapseGroup icon={FileText} title="Content Fields" defaultOpen>
                      {fields.map((f) => {
                        const rawVal = selectedElement.content?.[f.key];
                        return (
                          <div key={f.key} className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600">{f.label}</label>
                            {f.kind === 'textarea' ? (
                              <textarea
                                rows={2}
                                value={rawVal ?? ''}
                                onChange={(e) => updateElementContent(selectedElement.id, { [f.key]: e.target.value })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                              />
                            ) : f.kind === 'select' ? (
                              <select
                                value={rawVal ?? (f.options ? f.options[0] : '')}
                                onChange={(e) => updateElementContent(selectedElement.id, { [f.key]: e.target.value })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                              >
                                {(f.options || []).map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : f.kind === 'number' ? (
                              <input
                                type="number"
                                value={rawVal ?? ''}
                                onChange={(e) => updateElementContent(selectedElement.id, { [f.key]: e.target.value === '' ? '' : Number(e.target.value) })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                              />
                            ) : f.kind === 'csv' ? (
                              <input
                                type="text"
                                value={Array.isArray(rawVal) ? rawVal.join(', ') : (rawVal ?? '')}
                                onChange={(e) => updateElementContent(selectedElement.id, { [f.key]: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                              />
                            ) : (
                              <input
                                type="text"
                                value={rawVal ?? ''}
                                onChange={(e) => updateElementContent(selectedElement.id, { [f.key]: e.target.value })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                              />
                            )}
                          </div>
                        );
                      })}
                    </CollapseGroup>
                  );
                })()}

                {/* 13. MAP */}
                {selectedElement.type === 'map' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Address / City</label>
                    <input
                      type="text"
                      value={selectedElement.content?.address || 'San Francisco, CA'}
                      onChange={(e) => updateElementContent(selectedElement.id, { address: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* TAB 2: STYLE & TYPOGRAPHY TAB (With UP/DOWN small arrows on font size) */}
            {/* --------------------------------------------------------------------- */}
            {activeTab === 'style' && (
              <div className="space-y-3.5">
                {/* Global Expand All / Collapse All for Element Styling */}
                <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Styling Properties
                  </span>
                  <div className="flex items-center space-x-2 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setAllElementStyleCards(true)}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      Expand All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setAllElementStyleCards(false)}
                      className="text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                {/* 0. DEDICATED VIDEO STYLING SECTION */}
                {selectedElement.type === 'video' && (() => {
                  const currentBorderRadius = parseInt(selectedElement.styles?.borderRadius || '16') || 0;
                  const currentBorderWidth = parseInt(selectedElement.styles?.borderWidth || '0') || 0;
                  const overlayType = selectedElement.styles?.overlayType || 'none';
                  const overlayOpacity = selectedElement.styles?.overlayOpacity !== undefined ? Number(selectedElement.styles.overlayOpacity) : 40;
                  const gradientAngle = selectedElement.styles?.gradientAngle !== undefined ? Number(selectedElement.styles.gradientAngle) : 135;
                  const maskShape = selectedElement.styles?.maskShape || 'none';

                  return (
                    <div className="space-y-4">
                      {/* Explanatory Guide Box: Purpose of Video Styling */}
                      <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3 text-slate-700 space-y-1">
                        <div className="flex items-center space-x-1.5 text-indigo-700 font-bold text-xs">
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Purpose of Video Styles</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Video styling controls the visual frame, overlay tints, and creative shape masks around your player. Overlays tint the video so overlay text stays crisp and readable, while shape masking clips footage into artistic shapes without video editing software.
                        </p>
                      </div>

                      {/* 1. COLOR OVERLAYS & GRADIENTS */}
                      <CollapseGroup
                        icon={Palette}
                        title="Color Overlay & Tint"
                        defaultOpen
                        badge={<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">{overlayType}</span>}
                      >

                        {/* Overlay Mode Selector: None, Solid, 2-Color Gradient, 3-Color Gradient */}
                        <PresetChips
                          options={[
                            { id: 'none', label: 'None' },
                            { id: 'solid', label: 'Solid' },
                            { id: 'gradient', label: '2-Color' },
                            { id: 'gradient3', label: '3-Color' }
                          ]}
                          value={overlayType}
                          onChange={(overlayType) => updateElementStyles(selectedElement.id, { overlayType })}
                        />

                        {/* Solid Overlay Controls */}
                        {overlayType === 'solid' && (
                          <div className="space-y-3 pt-1">
                            <ModernColorPicker
                              label="Solid Overlay Color"
                              value={selectedElement.styles?.overlayColor || '#000000'}
                              onChange={(overlayColor) => updateElementStyles(selectedElement.id, { overlayColor })}
                            />
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-slate-700">Overlay Opacity</label>
                                <span className="text-xs font-mono font-bold text-indigo-600">{overlayOpacity}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={overlayOpacity}
                                onChange={(e) => updateElementStyles(selectedElement.id, { overlayOpacity: Number(e.target.value) })}
                                className="w-full accent-indigo-600 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}

                        {/* 2-Color Gradient Controls */}
                        {overlayType === 'gradient' && (
                          <div className="space-y-3 pt-1">
                            <ModernColorPicker
                              label="Gradient Color 1 (Start)"
                              value={selectedElement.styles?.gradientColor1 || '#4f46e5'}
                              onChange={(c) => updateElementStyles(selectedElement.id, { gradientColor1: c })}
                            />
                            <ModernColorPicker
                              label="Gradient Color 2 (End)"
                              value={selectedElement.styles?.gradientColor2 || '#06b6d4'}
                              onChange={(c) => updateElementStyles(selectedElement.id, { gradientColor2: c })}
                            />
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-slate-700">Gradient Angle</label>
                                <span className="text-xs font-mono font-bold text-indigo-600">{gradientAngle}&deg;</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="360"
                                value={gradientAngle}
                                onChange={(e) => updateElementStyles(selectedElement.id, { gradientAngle: Number(e.target.value) })}
                                className="w-full accent-indigo-600 cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-slate-700">Overlay Opacity</label>
                                <span className="text-xs font-mono font-bold text-indigo-600">{overlayOpacity}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={overlayOpacity}
                                onChange={(e) => updateElementStyles(selectedElement.id, { overlayOpacity: Number(e.target.value) })}
                                className="w-full accent-indigo-600 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}

                        {/* 3-Color Gradient Controls */}
                        {overlayType === 'gradient3' && (
                          <div className="space-y-3 pt-1">
                            <ModernColorPicker
                              label="Color 1 (Start)"
                              value={selectedElement.styles?.gradientColor1 || '#ec4899'}
                              onChange={(c) => updateElementStyles(selectedElement.id, { gradientColor1: c })}
                            />
                            <ModernColorPicker
                              label="Color 2 (Middle)"
                              value={selectedElement.styles?.gradientColor2 || '#8b5cf6'}
                              onChange={(c) => updateElementStyles(selectedElement.id, { gradientColor2: c })}
                            />
                            <ModernColorPicker
                              label="Color 3 (End)"
                              value={selectedElement.styles?.gradientColor3 || '#3b82f6'}
                              onChange={(c) => updateElementStyles(selectedElement.id, { gradientColor3: c })}
                            />
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-slate-700">Gradient Angle</label>
                                <span className="text-xs font-mono font-bold text-indigo-600">{gradientAngle}&deg;</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="360"
                                value={gradientAngle}
                                onChange={(e) => updateElementStyles(selectedElement.id, { gradientAngle: Number(e.target.value) })}
                                className="w-full accent-indigo-600 cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-slate-700">Overlay Opacity</label>
                                <span className="text-xs font-mono font-bold text-indigo-600">{overlayOpacity}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={overlayOpacity}
                                onChange={(e) => updateElementStyles(selectedElement.id, { overlayOpacity: Number(e.target.value) })}
                                className="w-full accent-indigo-600 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </CollapseGroup>

                      {/* 2. SHAPE MASKING (10+ SHAPES) */}
                      <CollapseGroup
                        icon={Shapes}
                        title="Shape Masking (10 Shapes)"
                        badge={<span className="text-[10px] font-bold text-slate-500 capitalize">{maskShape}</span>}
                      >
                        <p className="text-[11px] text-slate-500">
                          Clip video seamlessly into creative geometric and artistic shapes.
                        </p>

                        <div className="grid grid-cols-4 gap-2">
                          {VIDEO_MASK_SHAPES.map((shape) => {
                            const isSelected = maskShape === shape.id;
                            return (
                              <button
                                key={shape.id}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { maskShape: shape.id })}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-700 shadow-xs'
                                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <svg
                                  className={`w-6 h-6 mb-1 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}
                                  viewBox="0 0 24 24"
                                  dangerouslySetInnerHTML={{ __html: shape.previewSvg }}
                                />
                                <span className="text-[9px] font-semibold leading-tight line-clamp-1">
                                  {shape.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </CollapseGroup>

                      {/* 3. FRAME, CORNERS & BORDER */}
                      <CollapseGroup icon={Square} title="Border & Rounded Corners">

                        {/* Corner Radius */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Corner Radius</label>
                            <span className="text-xs font-mono font-bold text-indigo-600">{currentBorderRadius}px</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[0, 4, 8, 12, 16, 24, 9999].map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { borderRadius: `${r}px` })}
                                className={`flex-1 py-1 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer ${
                                  currentBorderRadius === r
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-slate-200/70 text-slate-600 hover:bg-indigo-100'
                                }`}
                              >
                                {r === 9999 ? 'Pill' : `${r}px`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Border Width */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Border Width</label>
                            <span className="text-xs font-mono font-bold text-indigo-600">{currentBorderWidth}px</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[0, 1, 2, 4, 6].map((w) => (
                              <button
                                key={w}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { borderWidth: `${w}px` })}
                                className={`flex-1 py-1 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer ${
                                  currentBorderWidth === w
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-slate-200/70 text-slate-600 hover:bg-indigo-100'
                                }`}
                              >
                                {w}px
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Border Color */}
                        {currentBorderWidth > 0 && (
                          <ModernColorPicker
                            label="Border Color"
                            value={selectedElement.styles?.borderColor || '#334155'}
                            onChange={(borderColor) => updateElementStyles(selectedElement.id, { borderColor })}
                          />
                        )}
                      </CollapseGroup>

                      {/* 4. DROP SHADOW */}
                      <CollapseGroup icon={Layers} title="Shadow & Depth">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">Drop Shadow</label>
                          <select
                            value={selectedElement.styles?.shadow || 'none'}
                            onChange={(e) => updateElementStyles(selectedElement.id, { shadow: e.target.value === 'none' ? undefined : e.target.value })}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                          >
                            <option value="none">None</option>
                            <option value="0 1px 2px 0 rgba(0, 0, 0, 0.05)">Small (sm)</option>
                            <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Medium (md)</option>
                            <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1)">Large (lg)</option>
                            <option value="0 20px 25px -5px rgba(0, 0, 0, 0.15)">Extra Large (xl)</option>
                            <option value="0 25px 50px -12px rgba(0, 0, 0, 0.25)">2X Large (2xl)</option>
                          </select>
                        </div>
                        {selectedElement.styles?.shadow && selectedElement.styles?.shadow !== 'none' && (
                          <ModernColorPicker
                            label="Shadow Color"
                            value={selectedElement.styles?.shadowColor || 'rgba(0, 0, 0, 0.25)'}
                            onChange={(shadowColor) => updateElementStyles(selectedElement.id, { shadowColor })}
                          />
                        )}
                      </CollapseGroup>
                    </div>
                  );
                })()}

                {/* 0. DEDICATED INNER ROW & COLUMN STYLING */}
                {selectedElement.type === 'innerrow' && (() => {
                  const currentBorderWidth = parseInt(selectedElement.styles?.borderWidth || '1') || 1;
                  const currentBorderRadius = parseInt(selectedElement.styles?.borderRadius || '12') || 12;
                  const currentColRadius = parseInt(selectedElement.styles?.columnBorderRadius || '10') || 10;
                  const currentColPadding = parseInt(selectedElement.styles?.columnPadding || '10') || 10;

                  return (
                    <div className="space-y-4">
                      {/* Container Styling Card */}
                      <CollapseGroup icon={Layout} title="Row Container Styling" defaultOpen>

                        {/* Background Color */}
                        <ModernColorPicker
                          label="Container Background"
                          value={selectedElement.styles?.bgColor || 'rgba(238, 242, 255, 0.25)'}
                          onChange={(bgColor) => updateElementStyles(selectedElement.id, { bgColor })}
                        />

                        {/* Border Color */}
                        <ModernColorPicker
                          label="Container Border Color"
                          value={selectedElement.styles?.borderColor || '#a5b4fc'}
                          onChange={(borderColor) => updateElementStyles(selectedElement.id, { borderColor })}
                        />

                        {/* Border Width & Style */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Border Width</label>
                            <span className="text-xs font-mono font-bold text-indigo-600">{currentBorderWidth}px</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[0, 1, 2, 3, 4].map((w) => (
                              <button
                                key={w}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { borderWidth: `${w}px` })}
                                className={`flex-1 py-1 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer ${
                                  currentBorderWidth === w ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200/70 text-slate-600 hover:bg-indigo-100'
                                }`}
                              >
                                {w}px
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Border Style */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">Border Style</label>
                          <select
                            value={selectedElement.styles?.borderStyle || 'dashed'}
                            onChange={(e) => updateElementStyles(selectedElement.id, { borderStyle: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                          >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="none">None</option>
                          </select>
                        </div>

                        {/* Border Radius */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Corner Radius</label>
                            <span className="text-xs font-mono font-bold text-indigo-600">{currentBorderRadius}px</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[0, 4, 8, 12, 16, 20].map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { borderRadius: `${r}px` })}
                                className={`flex-1 py-1 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer ${
                                  currentBorderRadius === r ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200/70 text-slate-600 hover:bg-indigo-100'
                                }`}
                              >
                                {r}px
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Box Shadow */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">Container Shadow</label>
                          <select
                            value={selectedElement.styles?.shadow || 'none'}
                            onChange={(e) => updateElementStyles(selectedElement.id, { shadow: e.target.value === 'none' ? undefined : e.target.value })}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                          >
                            <option value="none">None</option>
                            <option value="0 1px 2px 0 rgba(0, 0, 0, 0.05)">Small (sm)</option>
                            <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Medium (md)</option>
                            <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1)">Large (lg)</option>
                            <option value="0 20px 25px -5px rgba(0, 0, 0, 0.1)">Extra Large (xl)</option>
                          </select>
                        </div>
                      </CollapseGroup>

                      {/* Nested Column Cards Styling */}
                      <CollapseGroup icon={Columns} title="Nested Column Cards Styling">

                        {/* Column Card Background */}
                        <ModernColorPicker
                          label="Column Background"
                          value={selectedElement.styles?.columnBgColor || '#ffffff'}
                          onChange={(columnBgColor) => updateElementStyles(selectedElement.id, { columnBgColor })}
                        />

                        {/* Column Card Border Color */}
                        <ModernColorPicker
                          label="Column Border Color"
                          value={selectedElement.styles?.columnBorderColor || '#c7d2fe'}
                          onChange={(columnBorderColor) => updateElementStyles(selectedElement.id, { columnBorderColor })}
                        />

                        {/* Column Border Radius */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Column Radius</label>
                            <span className="text-xs font-mono font-bold text-indigo-600">{currentColRadius}px</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[0, 4, 8, 10, 14, 20].map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { columnBorderRadius: `${r}px` })}
                                className={`flex-1 py-1 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer ${
                                  currentColRadius === r ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200/70 text-slate-600 hover:bg-indigo-100'
                                }`}
                              >
                                {r}px
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Column Padding */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Column Padding</label>
                            <span className="text-xs font-mono font-bold text-indigo-600">{currentColPadding}px</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[4, 8, 10, 12, 16, 20].map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { columnPadding: `${p}px` })}
                                className={`flex-1 py-1 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer ${
                                  currentColPadding === p ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200/70 text-slate-600 hover:bg-indigo-100'
                                }`}
                              >
                                {p}px
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Column Shadow */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">Column Shadow</label>
                          <select
                            value={selectedElement.styles?.columnShadow || 'none'}
                            onChange={(e) => updateElementStyles(selectedElement.id, { columnShadow: e.target.value === 'none' ? undefined : e.target.value })}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                          >
                            <option value="none">None</option>
                            <option value="0 1px 2px 0 rgba(0, 0, 0, 0.05)">Small (sm)</option>
                            <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Medium (md)</option>
                            <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1)">Large (lg)</option>
                          </select>
                        </div>
                      </CollapseGroup>
                    </div>
                  );
                })()}

                {/* DEDICATED ICON & ICON BOX STYLING */}
                {(selectedElement.type === 'icon' || selectedElement.type === 'iconbox') && (() => {
                  const iconSize = getNumericValue(selectedElement.styles?.iconSize, selectedElement.type === 'iconbox' ? 24 : 20);
                  const iconPadding = getNumericValue(selectedElement.styles?.iconPadding, selectedElement.type === 'iconbox' ? 10 : 10);
                  const iconRadius = getNumericValue(selectedElement.styles?.iconBorderRadius, 12);
                  const iconBorderWidth = getNumericValue(selectedElement.styles?.iconBorderWidth, 0);
                  const headingSize = getNumericValue(selectedElement.styles?.headingFontSize || selectedElement.styles?.fontSize, selectedElement.type === 'iconbox' ? 15 : 14);
                  const descSize = getNumericValue(selectedElement.styles?.descFontSize, 12);
                  const cardBorderWidth = getNumericValue(selectedElement.styles?.borderWidth, selectedElement.type === 'iconbox' ? 1 : 0);
                  const cardRadius = getNumericValue(selectedElement.styles?.borderRadius, selectedElement.type === 'iconbox' ? 16 : 12);

                  return (
                    <div className="space-y-3.5 border-b border-slate-200 pb-4">
                      {/* Sub-Tabs for Icon Styling */}
                      <div className="flex items-center p-1 bg-slate-100 rounded-xl gap-1 border border-slate-200/80 mb-2">
                        <button
                          type="button"
                          onClick={() => setIconStyleSubTab('icon')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1 ${
                            iconStyleSubTab === 'icon'
                              ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Icon</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIconStyleSubTab('heading')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1 ${
                            iconStyleSubTab === 'heading'
                              ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <Type className="w-3 h-3" />
                          <span>Text</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIconStyleSubTab('description')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1 ${
                            iconStyleSubTab === 'description'
                              ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>Desc</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIconStyleSubTab('card')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1 ${
                            iconStyleSubTab === 'card'
                              ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <Palette className="w-3 h-3" />
                          <span>Card</span>
                        </button>
                      </div>

                      {/* 1. ICON CUSTOMIZATION SECTION */}
                      {iconStyleSubTab === 'icon' && (
                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-3">
                          <div className="flex items-center space-x-1.5 text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Icon Styling</span>
                          </div>

                        {/* Icon Color */}
                        <ModernColorPicker
                          label="Icon Color"
                          value={selectedElement.styles?.iconColor || selectedElement.styles?.color || '#6366f1'}
                          onChange={(color) => updateElementStyles(selectedElement.id, { iconColor: color })}
                        />

                        {/* Icon Background / Badge Color */}
                        <ModernColorPicker
                          label="Icon Badge / Background"
                          value={selectedElement.styles?.iconBgColor || '#ede9fe'}
                          onChange={(color) => updateElementStyles(selectedElement.id, { iconBgColor: color })}
                        />

                        {/* Icon Size */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Icon Size</label>
                            <span className="text-xs font-mono font-bold text-indigo-600">{iconSize}px</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                min="12"
                                max="96"
                                value={iconSize}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 20;
                                  updateElementStyles(selectedElement.id, { iconSize: `${val}px` });
                                }}
                                className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                              />
                              <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center">
                                <button
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { iconSize: `${Math.min(96, iconSize + 2)}px` })}
                                  className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { iconSize: `${Math.max(12, iconSize - 2)}px` })}
                                  className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-400">px</span>
                          </div>
                          <div className="flex items-center space-x-1 pt-1">
                            {[16, 20, 24, 32, 40, 48].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { iconSize: `${s}px` })}
                                className={`flex-1 py-1 text-[10px] font-mono font-bold rounded ${
                                  iconSize === s ? 'bg-indigo-600 text-white' : 'bg-slate-200/70 text-slate-600'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Badge Padding */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Badge Padding</label>
                            <span className="text-xs font-mono font-bold text-indigo-600">{iconPadding}px</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                min="0"
                                max="40"
                                value={iconPadding}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  updateElementStyles(selectedElement.id, { iconPadding: `${val}px` });
                                }}
                                className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                              />
                              <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center">
                                <button
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { iconPadding: `${Math.min(40, iconPadding + 2)}px` })}
                                  className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { iconPadding: `${Math.max(0, iconPadding - 2)}px` })}
                                  className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-400">px</span>
                          </div>
                          <div className="flex items-center space-x-1 pt-1">
                            {[0, 6, 10, 14, 18].map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { iconPadding: `${p}px` })}
                                className={`flex-1 py-1 text-[10px] font-mono font-bold rounded ${
                                  iconPadding === p ? 'bg-indigo-600 text-white' : 'bg-slate-200/70 text-slate-600'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Badge Corner Radius */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Badge Corner Radius</label>
                            <span className="text-xs font-mono font-bold text-indigo-600">{iconRadius}px</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                min="0"
                                max="999"
                                value={iconRadius}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  updateElementStyles(selectedElement.id, { iconBorderRadius: `${val}px` });
                                }}
                                className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                              />
                              <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center">
                                <button
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { iconBorderRadius: `${Math.min(999, iconRadius + 2)}px` })}
                                  className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { iconBorderRadius: `${Math.max(0, iconRadius - 2)}px` })}
                                  className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-400">px</span>
                          </div>
                          <div className="flex items-center space-x-1 pt-1">
                            {[0, 8, 12, 16, 9999].map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { iconBorderRadius: `${r}px` })}
                                className={`flex-1 py-1 text-[10px] font-mono font-bold rounded ${
                                  iconRadius === r ? 'bg-indigo-600 text-white' : 'bg-slate-200/70 text-slate-600'
                                }`}
                              >
                                {r === 9999 ? 'Round' : `${r}px`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Badge Border Color */}
                        <ModernColorPicker
                          label="Badge Border Color"
                          value={selectedElement.styles?.iconBorderColor || 'transparent'}
                          onChange={(color) => {
                            if (color && color !== 'transparent' && iconBorderWidth === 0) {
                              updateElementStyles(selectedElement.id, { iconBorderColor: color, iconBorderWidth: '1px' });
                            } else {
                              updateElementStyles(selectedElement.id, { iconBorderColor: color });
                            }
                          }}
                        />

                        {/* Badge Border Width */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Badge Border Width</label>
                            <span className="text-xs font-mono font-bold text-indigo-600">{iconBorderWidth}px</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                value={iconBorderWidth}
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value) || 0);
                                  const updates: any = { iconBorderWidth: `${val}px` };
                                  if (val > 0 && (!selectedElement.styles?.iconBorderColor || selectedElement.styles?.iconBorderColor === 'transparent')) {
                                    updates.iconBorderColor = selectedElement.styles?.iconColor || selectedElement.styles?.color || '#6366f1';
                                  }
                                  updateElementStyles(selectedElement.id, updates);
                                }}
                                className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                              />
                              <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = Math.min(20, iconBorderWidth + 1);
                                    const updates: any = { iconBorderWidth: `${next}px` };
                                    if (next > 0 && (!selectedElement.styles?.iconBorderColor || selectedElement.styles?.iconBorderColor === 'transparent')) {
                                      updates.iconBorderColor = selectedElement.styles?.iconColor || selectedElement.styles?.color || '#6366f1';
                                    }
                                    updateElementStyles(selectedElement.id, updates);
                                  }}
                                  className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = Math.max(0, iconBorderWidth - 1);
                                    updateElementStyles(selectedElement.id, { iconBorderWidth: `${next}px` });
                                  }}
                                  className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-400">px</span>
                          </div>
                          <div className="flex items-center space-x-1 pt-1">
                            {[0, 1, 2, 3, 4].map((w) => (
                              <button
                                key={w}
                                type="button"
                                onClick={() => {
                                  const updates: any = { iconBorderWidth: `${w}px` };
                                  if (w > 0 && (!selectedElement.styles?.iconBorderColor || selectedElement.styles?.iconBorderColor === 'transparent')) {
                                    updates.iconBorderColor = selectedElement.styles?.iconColor || selectedElement.styles?.color || '#6366f1';
                                  }
                                  updateElementStyles(selectedElement.id, updates);
                                }}
                                className={`flex-1 py-1 text-[10px] font-mono font-bold rounded ${
                                  iconBorderWidth === w ? 'bg-indigo-600 text-white' : 'bg-slate-200/70 text-slate-600'
                                }`}
                              >
                                {w}px
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Light Icon Animation in Style Tab */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Light Animation</label>
                            <span className="text-[10px] font-mono font-bold text-indigo-600 capitalize">
                              {selectedElement.styles?.iconAnimation || 'none'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { id: 'none', label: 'None', icon: '⛔' },
                              { id: 'pulse', label: 'Pulse', icon: '💫' },
                              { id: 'float', label: 'Float', icon: '🎈' },
                              { id: 'shimmer', label: 'Shimmer', icon: '✨' },
                              { id: 'spin-slow', label: 'Spin', icon: '🔄' },
                              { id: 'bounce-soft', label: 'Bounce', icon: '🏀' },
                              { id: 'wiggle', label: 'Wiggle', icon: '📳' },
                              { id: 'hover-lift', label: 'Lift', icon: '🚀' },
                              { id: 'hover-spin', label: 'H-Spin', icon: '🌪️' }
                            ].map((anim) => {
                              const isActive = (selectedElement.styles?.iconAnimation || 'none') === anim.id;
                              return (
                                <button
                                  key={anim.id}
                                  type="button"
                                  onClick={() => {
                                    updateElementStyles(selectedElement.id, { iconAnimation: anim.id as any });
                                    updateElementContent(selectedElement.id, { iconAnimation: anim.id });
                                  }}
                                  className={`py-1 text-xs font-semibold rounded-lg border flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'
                                  }`}
                                  title={anim.label}
                                >
                                  <span>{anim.icon}</span>
                                  <span className="text-[10px]">{anim.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                      {/* 2. HEADING / TITLE CUSTOMIZATION SECTION */}
                      {iconStyleSubTab === 'heading' && (
                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-3">
                          <div className="flex items-center space-x-1.5 text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">
                            <Type className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Heading Styling</span>
                          </div>

                        {/* Heading Font Family */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Font Family</label>
                          <select
                            value={selectedElement.styles?.headingFontFamily || selectedElement.styles?.fontFamily || 'Inter, sans-serif'}
                            onChange={(e) => updateElementStyles(selectedElement.id, { headingFontFamily: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                          >
                            {FONT_FAMILIES.map((font) => (
                              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                {font.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Heading Font Size */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Font Size</label>
                            <span className="text-xs font-mono font-bold text-indigo-600">{headingSize}px</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                min="10"
                                max="72"
                                value={headingSize}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 15;
                                  updateElementStyles(selectedElement.id, { headingFontSize: `${val}px` });
                                }}
                                className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                              />
                              <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center">
                                <button
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { headingFontSize: `${Math.min(72, headingSize + 1)}px` })}
                                  className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { headingFontSize: `${Math.max(10, headingSize - 1)}px` })}
                                  className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-400">px</span>
                          </div>
                          <div className="flex items-center space-x-1 pt-1">
                            {[12, 14, 16, 18, 20, 24].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { headingFontSize: `${s}px` })}
                                className={`flex-1 py-1 text-[10px] font-mono font-bold rounded ${
                                  headingSize === s ? 'bg-indigo-600 text-white' : 'bg-slate-200/70 text-slate-600'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Heading Font Weight */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Font Weight</label>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { label: 'Regular', value: '400' },
                              { label: 'Medium', value: '500' },
                              { label: 'Semi', value: '600' },
                              { label: 'Bold', value: '700' },
                            ].map((w) => (
                              <button
                                key={w.value}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { headingFontWeight: w.value })}
                                className={`py-1 text-[10px] font-semibold rounded-lg border transition-colors ${
                                  (selectedElement.styles?.headingFontWeight || selectedElement.styles?.fontWeight || '700') === w.value
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                }`}
                              >
                                {w.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Heading Text Case */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Text Case</label>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { id: 'none', label: 'Default' },
                              { id: 'uppercase', label: 'UPPER' },
                              { id: 'lowercase', label: 'lower' },
                              { id: 'capitalize', label: 'Title' }
                            ].map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { headingTextTransform: c.id as any })}
                                className={`py-1 text-[10px] font-semibold rounded-lg border transition-colors ${
                                  (selectedElement.styles?.headingTextTransform || 'none') === c.id
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                }`}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Heading Color */}
                        <ModernColorPicker
                          label="Heading Color"
                          value={selectedElement.styles?.headingColor || selectedElement.styles?.color || (selectedElement.type === 'iconbox' ? '#0f172a' : '#1e293b')}
                          onChange={(color) => updateElementStyles(selectedElement.id, { headingColor: color })}
                        />
                      </div>
                    )}

                      {/* 3. DESCRIPTION / SUBTEXT CUSTOMIZATION SECTION */}
                      {iconStyleSubTab === 'description' && (
                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-3">
                          <div className="flex items-center space-x-1.5 text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Description Styling</span>
                          </div>

                        {/* Description Font Family */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Font Family</label>
                          <select
                            value={selectedElement.styles?.descFontFamily || selectedElement.styles?.fontFamily || 'Inter, sans-serif'}
                            onChange={(e) => updateElementStyles(selectedElement.id, { descFontFamily: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                          >
                            {FONT_FAMILIES.map((font) => (
                              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                {font.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Description Font Size */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">Font Size</label>
                            <span className="text-xs font-mono font-bold text-indigo-600">{descSize}px</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                min="9"
                                max="32"
                                value={descSize}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 12;
                                  updateElementStyles(selectedElement.id, { descFontSize: `${val}px` });
                                }}
                                className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                              />
                              <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center">
                                <button
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { descFontSize: `${Math.min(32, descSize + 1)}px` })}
                                  className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { descFontSize: `${Math.max(9, descSize - 1)}px` })}
                                  className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-400">px</span>
                          </div>
                          <div className="flex items-center space-x-1 pt-1">
                            {[10, 11, 12, 13, 14, 16].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { descFontSize: `${s}px` })}
                                className={`flex-1 py-1 text-[10px] font-mono font-bold rounded ${
                                  descSize === s ? 'bg-indigo-600 text-white' : 'bg-slate-200/70 text-slate-600'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Description Font Weight */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Font Weight</label>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { label: 'Light', value: '300' },
                              { label: 'Regular', value: '400' },
                              { label: 'Medium', value: '500' },
                              { label: 'Semi', value: '600' },
                            ].map((w) => (
                              <button
                                key={w.value}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { descFontWeight: w.value })}
                                className={`py-1 text-[10px] font-semibold rounded-lg border transition-colors ${
                                  (selectedElement.styles?.descFontWeight || '400') === w.value
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                }`}
                              >
                                {w.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Description Text Case */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Text Case</label>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { id: 'none', label: 'Default' },
                              { id: 'uppercase', label: 'UPPER' },
                              { id: 'lowercase', label: 'lower' },
                              { id: 'capitalize', label: 'Title' }
                            ].map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, { descTextTransform: c.id as any })}
                                className={`py-1 text-[10px] font-semibold rounded-lg border transition-colors ${
                                  (selectedElement.styles?.descTextTransform || 'none') === c.id
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                }`}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Description Color */}
                        <ModernColorPicker
                          label="Description Color"
                          value={selectedElement.styles?.descColor || (selectedElement.type === 'iconbox' ? '#64748b' : '#94a3b8')}
                          onChange={(color) => updateElementStyles(selectedElement.id, { descColor: color })}
                        />
                      </div>
                    )}

                      {/* 4. CARD & CONTAINER STYLING */}
                      {iconStyleSubTab === 'card' && (
                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-3">
                          <div className="flex items-center space-x-1.5 text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">
                            <Palette className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Card & Container</span>
                          </div>

                          {/* Alignment */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600">Alignment</label>
                            <div className="grid grid-cols-3 gap-1">
                              {['left', 'center', 'right'].map((align) => (
                                <button
                                  key={align}
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { textAlign: align })}
                                  className={`py-1.5 text-xs font-semibold rounded-lg capitalize border ${
                                    (selectedElement.styles?.textAlign || 'left') === align
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                  }`}
                                >
                                  {align}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Card Background Color */}
                          <ModernColorPicker
                            label="Card Background"
                            value={selectedElement.styles?.bgColor || (selectedElement.type === 'iconbox' ? '#ffffff' : 'transparent')}
                            onChange={(bgColor) => updateElementStyles(selectedElement.id, { bgColor })}
                          />

                          {/* Card Border Color */}
                          <ModernColorPicker
                            label="Border Color"
                            value={selectedElement.styles?.borderColor || (selectedElement.type === 'iconbox' ? '#e2e8f0' : 'transparent')}
                            onChange={(borderColor) => {
                              if (borderColor && borderColor !== 'transparent' && cardBorderWidth === 0) {
                                updateElementStyles(selectedElement.id, { borderColor, borderWidth: '1px' });
                              } else {
                                updateElementStyles(selectedElement.id, { borderColor });
                              }
                            }}
                          />

                          {/* Border Width with Stepper */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-700">Border Width</label>
                              <span className="text-xs font-mono font-bold text-indigo-600">{cardBorderWidth}px</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  value={cardBorderWidth}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                    const updates: any = { borderWidth: `${val}px` };
                                    if (val > 0 && (!selectedElement.styles?.borderColor || selectedElement.styles?.borderColor === 'transparent')) {
                                      updates.borderColor = selectedElement.type === 'iconbox' ? '#e2e8f0' : '#cbd5e1';
                                    }
                                    updateElementStyles(selectedElement.id, updates);
                                  }}
                                  className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                                />
                                <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = Math.min(20, cardBorderWidth + 1);
                                      const updates: any = { borderWidth: `${next}px` };
                                      if (next > 0 && (!selectedElement.styles?.borderColor || selectedElement.styles?.borderColor === 'transparent')) {
                                        updates.borderColor = selectedElement.type === 'iconbox' ? '#e2e8f0' : '#cbd5e1';
                                      }
                                      updateElementStyles(selectedElement.id, updates);
                                    }}
                                    className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = Math.max(0, cardBorderWidth - 1);
                                      updateElementStyles(selectedElement.id, { borderWidth: `${next}px` });
                                    }}
                                    className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-400">px</span>
                            </div>
                            <div className="flex items-center space-x-1 pt-1">
                              {[0, 1, 2, 3, 4].map((w) => (
                                <button
                                  key={w}
                                  type="button"
                                  onClick={() => {
                                    const updates: any = { borderWidth: `${w}px` };
                                    if (w > 0 && (!selectedElement.styles?.borderColor || selectedElement.styles?.borderColor === 'transparent')) {
                                      updates.borderColor = selectedElement.type === 'iconbox' ? '#e2e8f0' : '#cbd5e1';
                                    }
                                    updateElementStyles(selectedElement.id, updates);
                                  }}
                                  className={`flex-1 py-1 text-[10px] font-mono font-bold rounded ${
                                    cardBorderWidth === w ? 'bg-indigo-600 text-white' : 'bg-slate-200/70 text-slate-600'
                                  }`}
                                >
                                  {w}px
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Border Radius with Stepper */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-700">Border Radius</label>
                              <span className="text-xs font-mono font-bold text-indigo-600">{cardRadius}px</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={cardRadius}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                    updateElementStyles(selectedElement.id, { borderRadius: `${val}px` });
                                  }}
                                  className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                                />
                                <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center">
                                  <button
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { borderRadius: `${Math.min(100, cardRadius + 1)}px` })}
                                    className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { borderRadius: `${Math.max(0, cardRadius - 1)}px` })}
                                    className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-400">px</span>
                            </div>
                            <div className="flex items-center space-x-1 pt-1">
                              {[0, 8, 12, 16, 24].map((r) => (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { borderRadius: `${r}px` })}
                                  className={`flex-1 py-1 text-[10px] font-mono font-bold rounded ${
                                    cardRadius === r ? 'bg-indigo-600 text-white' : 'bg-slate-200/70 text-slate-600'
                                  }`}
                                >
                                  {r}px
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Box Shadow */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600">Shadow</label>
                            <select
                              value={selectedElement.styles?.shadow || 'none'}
                              onChange={(e) => updateElementStyles(selectedElement.id, { shadow: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="none">None</option>
                              <option value="0 1px 2px 0 rgba(0, 0, 0, 0.05)">Extra Small (xs)</option>
                              <option value="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)">Small (sm)</option>
                              <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)">Medium (md)</option>
                              <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)">Large (lg)</option>
                              <option value="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)">Extra Large (xl)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 1. DEDICATED FORM FIELD & BUTTON STYLING */}
                {selectedElement.type === 'form' && (
                  <>
                    {/* Compact Form Theme Selection Card */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3 space-y-2">
                      <div
                        onClick={() => toggleSettingCard('el_form_theme')}
                        className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Form Theme</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                            {selectedElement.content?.theme || 'dark'}
                          </span>
                          {openSettingCards.el_form_theme !== false ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {openSettingCards.el_form_theme !== false && (
                        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                          {[
                            {
                              id: 'dark',
                              name: 'Dark',
                              tag: 'Default',
                              previewBg: '#0f172a',
                              previewBorder: '#334155',
                              previewDot: '#6366f1',
                              styles: {
                                bgColor: '#0f172a',
                                color: '#ffffff',
                                borderColor: '#1e293b',
                                labelColor: '#94a3b8',
                                inputBgColor: '#090d16',
                                inputTextColor: '#f8fafc',
                                inputBorderColor: '#334155',
                                buttonBgColor: '#6366f1',
                                buttonTextColor: '#ffffff'
                              }
                            },
                            {
                              id: 'light',
                              name: 'Light',
                              tag: 'Clean',
                              previewBg: '#ffffff',
                              previewBorder: '#cbd5e1',
                              previewDot: '#4f46e5',
                              styles: {
                                bgColor: '#ffffff',
                                color: '#0f172a',
                                borderColor: '#e2e8f0',
                                labelColor: '#475569',
                                inputBgColor: '#f8fafc',
                                inputTextColor: '#0f172a',
                                inputBorderColor: '#cbd5e1',
                                buttonBgColor: '#4f46e5',
                                buttonTextColor: '#ffffff'
                              }
                            },
                            {
                              id: 'glass',
                              name: 'Glass',
                              tag: 'Frosted',
                              previewBg: '#1e293b',
                              previewBorder: 'rgba(255,255,255,0.4)',
                              previewDot: '#818cf8',
                              styles: {
                                bgColor: 'rgba(15, 23, 42, 0.75)',
                                color: '#ffffff',
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                labelColor: '#cbd5e1',
                                inputBgColor: 'rgba(255, 255, 255, 0.08)',
                                inputTextColor: '#ffffff',
                                inputBorderColor: 'rgba(255, 255, 255, 0.2)',
                                buttonBgColor: '#6366f1',
                                buttonTextColor: '#ffffff'
                              }
                            },
                            {
                              id: 'minimal',
                              name: 'Minimal',
                              tag: 'Modern',
                              previewBg: '#fafafa',
                              previewBorder: '#d4d4d8',
                              previewDot: '#18181b',
                              styles: {
                                bgColor: '#fafafa',
                                color: '#18181b',
                                borderColor: '#e4e4e7',
                                labelColor: '#71717a',
                                inputBgColor: '#ffffff',
                                inputTextColor: '#18181b',
                                inputBorderColor: '#e4e4e7',
                                buttonBgColor: '#18181b',
                                buttonTextColor: '#ffffff'
                              }
                            }
                          ].map((th) => {
                            const isCurrent = (selectedElement.content?.theme || 'dark') === th.id;
                            return (
                              <button
                                key={th.id}
                                type="button"
                                onClick={() => {
                                  updateElementContent(selectedElement.id, { theme: th.id });
                                  updateElementStyles(selectedElement.id, th.styles);
                                }}
                                className={`p-1.5 rounded-lg border text-center transition-all flex flex-col items-center justify-between ${
                                  isCurrent
                                    ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500 shadow-2xs'
                                    : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                                }`}
                              >
                                <div
                                  className="w-full h-5 rounded border flex items-center justify-center relative overflow-hidden mb-1"
                                  style={{ backgroundColor: th.previewBg, borderColor: th.previewBorder }}
                                >
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: th.previewDot }}
                                  />
                                </div>
                                <span className={`text-[10px] font-bold leading-tight ${isCurrent ? 'text-indigo-700' : 'text-slate-700'}`}>
                                  {th.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Form Fields Styling Card */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                      <div
                        onClick={() => toggleSettingCard('el_form_fields')}
                        className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Form Fields Styling</span>
                        </div>
                        {openSettingCards.el_form_fields !== false ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      {openSettingCards.el_form_fields !== false && (
                        <div className="space-y-3 pt-1">
                          {/* Input Background Color */}
                          <ModernColorPicker
                            label="Input Background"
                            value={selectedElement.styles?.inputBgColor || '#090d16'}
                            onChange={(color) => updateElementStyles(selectedElement.id, { inputBgColor: color })}
                          />

                          {/* Input Text Color */}
                          <ModernColorPicker
                            label="Input Text Color"
                            value={selectedElement.styles?.inputTextColor || '#f8fafc'}
                            onChange={(color) => updateElementStyles(selectedElement.id, { inputTextColor: color })}
                          />

                          {/* Input Border Color */}
                          <ModernColorPicker
                            label="Input Border Color"
                            value={selectedElement.styles?.inputBorderColor || '#334155'}
                            onChange={(color) => updateElementStyles(selectedElement.id, { inputBorderColor: color })}
                          />

                          {/* Input Border Radius with Stepper */}
                          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-700">Input Border Radius</label>
                              <span className="text-xs font-mono font-bold text-indigo-600">
                                {currentInputBorderRadius}px
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  value={currentInputBorderRadius}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    updateElementStyles(selectedElement.id, { inputBorderRadius: `${val}px` });
                                  }}
                                  className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                                />
                                <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center">
                                  <button
                                    type="button"
                                    onClick={() => changeInputBorderRadius(1)}
                                    className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => changeInputBorderRadius(-1)}
                                    className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-400">px</span>
                            </div>
                            <div className="flex items-center space-x-1 pt-1">
                              {[0, 6, 10, 16].map((r) => (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { inputBorderRadius: `${r}px` })}
                                  className={`flex-1 py-1 text-[10px] font-mono font-bold rounded ${
                                    currentInputBorderRadius === r ? 'bg-indigo-600 text-white' : 'bg-slate-200/70 text-slate-600'
                                  }`}
                                >
                                  {r}px
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Field Label Color */}
                          <ModernColorPicker
                            label="Field Label Color"
                            value={selectedElement.styles?.labelColor || '#94a3b8'}
                            onChange={(color) => updateElementStyles(selectedElement.id, { labelColor: color })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Submit Button Styling Card */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                      <div
                        onClick={() => toggleSettingCard('el_form_button')}
                        className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Submit Button Styling</span>
                        </div>
                        {openSettingCards.el_form_button !== false ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      {openSettingCards.el_form_button !== false && (
                        <div className="space-y-3 pt-1">
                          {/* Submit Button Background */}
                          <ModernColorPicker
                            label="Button Background Color"
                            value={selectedElement.styles?.buttonBgColor || '#6366f1'}
                            onChange={(color) => updateElementStyles(selectedElement.id, { buttonBgColor: color })}
                          />

                          {/* Submit Button Text Color */}
                          <ModernColorPicker
                            label="Button Text Color"
                            value={selectedElement.styles?.buttonTextColor || '#ffffff'}
                            onChange={(color) => updateElementStyles(selectedElement.id, { buttonTextColor: color })}
                          />

                          {/* Submit Button Border Radius with Stepper */}
                          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-700">Button Border Radius</label>
                              <span className="text-xs font-mono font-bold text-indigo-600">
                                {currentButtonBorderRadius}px
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  value={currentButtonBorderRadius}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    updateElementStyles(selectedElement.id, { buttonBorderRadius: `${val}px` });
                                  }}
                                  className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                                />
                                <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center">
                                  <button
                                    type="button"
                                    onClick={() => changeButtonBorderRadius(1)}
                                    className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => changeButtonBorderRadius(-1)}
                                    className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-400">px</span>
                            </div>
                            <div className="flex items-center space-x-1 pt-1">
                              {[0, 8, 12, 24].map((r) => (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { buttonBorderRadius: `${r}px` })}
                                  className={`flex-1 py-1 text-[10px] font-mono font-bold rounded ${
                                    currentButtonBorderRadius === r ? 'bg-indigo-600 text-white' : 'bg-slate-200/70 text-slate-600'
                                  }`}
                                >
                                  {r}px
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* 2. DEDICATED ACCORDION STYLING */}
                {selectedElement.type === 'accordion' && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                    <div
                      onClick={() => toggleSettingCard('el_accordion')}
                      className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center space-x-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Accordion Styling</span>
                      </div>
                      {openSettingCards.el_accordion !== false ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    {openSettingCards.el_accordion !== false && (
                      <div className="space-y-3 pt-1">
                        {/* Item Background */}
                        <ModernColorPicker
                          label="Item Background"
                          value={selectedElement.styles?.bgColor || '#0f172a'}
                          onChange={(bgColor) => updateElementStyles(selectedElement.id, { bgColor })}
                        />

                        {/* Question Text Color */}
                        <ModernColorPicker
                          label="Question Text Color"
                          value={selectedElement.styles?.color || '#ffffff'}
                          onChange={(color) => updateElementStyles(selectedElement.id, { color })}
                        />

                        {/* Item Border Color */}
                        <ModernColorPicker
                          label="Item Border Color"
                          value={selectedElement.styles?.borderColor || '#1e293b'}
                          onChange={(borderColor) => updateElementStyles(selectedElement.id, { borderColor })}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 2.2 DEDICATED DATA TABLE STYLING (THEMES, HEADER ROW & BODY) */}
                {selectedElement.type === 'table' && (
                  <>
                    {/* Card 0: Table Theme Presets */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                      <div
                        onClick={() => toggleSettingCard('el_table_themes')}
                        className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Table Theme Presets</span>
                        </div>
                        {openSettingCards.el_table_themes !== false ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      {openSettingCards.el_table_themes !== false && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {[
                            {
                              id: 'dark-slate',
                              name: 'Dark Slate',
                              badge: 'Default',
                              styles: {
                                bgColor: '#0f172a',
                                tableHeaderBg: '#1e293b',
                                tableHeaderColor: '#ffffff',
                                color: '#ffffff',
                                borderColor: '#1e293b',
                                tableHeaderBorderColor: '#334155'
                              },
                              previewHeader: 'bg-slate-800 text-white',
                              previewBody: 'bg-slate-900 text-slate-200'
                            },
                            {
                              id: 'clean-light',
                              name: 'Clean Light',
                              badge: 'Light',
                              styles: {
                                bgColor: '#ffffff',
                                tableHeaderBg: '#f8fafc',
                                tableHeaderColor: '#0f172a',
                                color: '#334155',
                                borderColor: '#e2e8f0',
                                tableHeaderBorderColor: '#cbd5e1'
                              },
                              previewHeader: 'bg-slate-100 text-slate-900',
                              previewBody: 'bg-white text-slate-700'
                            },
                            {
                              id: 'indigo-pro',
                              name: 'Indigo Pro',
                              badge: 'Modern',
                              styles: {
                                bgColor: '#0f172a',
                                tableHeaderBg: '#312e81',
                                tableHeaderColor: '#ffffff',
                                color: '#e0e7ff',
                                borderColor: '#3730a3',
                                tableHeaderBorderColor: '#4338ca'
                              },
                              previewHeader: 'bg-indigo-900 text-white',
                              previewBody: 'bg-slate-900 text-indigo-200'
                            },
                            {
                              id: 'emerald-dark',
                              name: 'Emerald Dark',
                              badge: 'Fresh',
                              styles: {
                                bgColor: '#022c22',
                                tableHeaderBg: '#064e3b',
                                tableHeaderColor: '#ffffff',
                                color: '#d1fae5',
                                borderColor: '#047857',
                                tableHeaderBorderColor: '#059669'
                              },
                              previewHeader: 'bg-emerald-900 text-white',
                              previewBody: 'bg-emerald-950 text-emerald-200'
                            },
                            {
                              id: 'midnight-black',
                              name: 'Midnight OLED',
                              badge: 'Dark',
                              styles: {
                                bgColor: '#09090b',
                                tableHeaderBg: '#18181b',
                                tableHeaderColor: '#fafafa',
                                color: '#ffffff',
                                borderColor: '#27272a',
                                tableHeaderBorderColor: '#3f3f46'
                              },
                              previewHeader: 'bg-zinc-900 text-zinc-100',
                              previewBody: 'bg-black text-zinc-300'
                            },
                            {
                              id: 'soft-gray',
                              name: 'Soft Minimal',
                              badge: 'Clean',
                              styles: {
                                bgColor: '#f9fafb',
                                tableHeaderBg: '#f3f4f6',
                                tableHeaderColor: '#111827',
                                color: '#374151',
                                borderColor: '#e5e7eb',
                                tableHeaderBorderColor: '#d1d5db'
                              },
                              previewHeader: 'bg-gray-200 text-gray-900',
                              previewBody: 'bg-gray-50 text-gray-700'
                            }
                          ].map((theme) => {
                            const isSelected =
                              selectedElement.styles?.bgColor === theme.styles.bgColor &&
                              selectedElement.styles?.tableHeaderBg === theme.styles.tableHeaderBg;

                            return (
                              <button
                                key={theme.id}
                                type="button"
                                onClick={() => updateElementStyles(selectedElement.id, theme.styles)}
                                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 shadow-xs'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[11px] font-bold text-slate-800 truncate">{theme.name}</span>
                                  <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                    {theme.badge}
                                  </span>
                                </div>
                                <div className="rounded overflow-hidden border border-slate-300/40 text-[8px] font-mono">
                                  <div className={`px-1.5 py-1 font-bold ${theme.previewHeader}`}>Header</div>
                                  <div className={`px-1.5 py-1 ${theme.previewBody}`}>Data row</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Card 1: Table Header Styling */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                      <div
                        onClick={() => toggleSettingCard('el_table_header')}
                        className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Table className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Table Header Styling</span>
                        </div>
                        {openSettingCards.el_table_header !== false ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      {openSettingCards.el_table_header !== false && (
                        <div className="space-y-3 pt-1">
                          {/* Header Background */}
                          <ModernColorPicker
                            label="Header Background"
                            value={selectedElement.styles?.tableHeaderBg || '#1e293b'}
                            onChange={(tableHeaderBg) => updateElementStyles(selectedElement.id, { tableHeaderBg })}
                          />

                          {/* Header Text Color */}
                          <ModernColorPicker
                            label="Header Text Color"
                            value={selectedElement.styles?.tableHeaderColor || '#f8fafc'}
                            onChange={(tableHeaderColor) => updateElementStyles(selectedElement.id, { tableHeaderColor })}
                          />

                          {/* Header Divider Color */}
                          <ModernColorPicker
                            label="Header Divider Color"
                            value={selectedElement.styles?.tableHeaderBorderColor || '#334155'}
                            onChange={(tableHeaderBorderColor) => updateElementStyles(selectedElement.id, { tableHeaderBorderColor })}
                          />

                          {/* Header Text Alignment */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-600">Header Text Alignment</label>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { id: 'left', label: 'Left', icon: AlignLeft },
                                { id: 'center', label: 'Center', icon: AlignCenter },
                                { id: 'right', label: 'Right', icon: AlignRight }
                              ].map((opt) => {
                                const isSelected = (selectedElement.styles?.tableHeaderAlign || 'left') === opt.id;
                                const IconComp = opt.icon;
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { tableHeaderAlign: opt.id })}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                                    }`}
                                  >
                                    <IconComp className="w-3 h-3" />
                                    <span>{opt.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Header Font Size */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-600">Header Font Size</label>
                              <span className="text-[10px] font-mono font-bold text-indigo-600">
                                {selectedElement.styles?.tableHeaderFontSize || '12px'}
                              </span>
                            </div>
                            <div className="grid grid-cols-5 gap-1">
                              {['10px', '11px', '12px', '14px', '16px'].map((sz) => {
                                const isSelected = (selectedElement.styles?.tableHeaderFontSize || '12px') === sz;
                                return (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { tableHeaderFontSize: sz })}
                                    className={`py-1 text-[10px] font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Header Font Weight */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-600">Header Font Weight</label>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { label: 'Regular', value: '400' },
                                { label: 'Medium', value: '500' },
                                { label: 'Semi', value: '600' },
                                { label: 'Bold', value: '700' }
                              ].map((w) => {
                                const currentWeight = String(selectedElement.styles?.tableHeaderFontWeight || '700');
                                const isSelected = currentWeight === w.value;
                                return (
                                  <button
                                    key={w.value}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { tableHeaderFontWeight: w.value })}
                                    className={`py-1 text-[10px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                                    }`}
                                  >
                                    {w.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Header Padding */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-600">Header Padding</label>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { label: 'Compact', value: '8px 10px' },
                                { label: 'Standard', value: '12px 14px' },
                                { label: 'Spacious', value: '16px 18px' }
                              ].map((p) => {
                                const currentPadding = selectedElement.styles?.tableHeaderPadding || '12px 14px';
                                const isSelected = currentPadding === p.value;
                                return (
                                  <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { tableHeaderPadding: p.value })}
                                    className={`py-1 text-[10px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                                    }`}
                                  >
                                    {p.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card 2: Table Body & Rows Styling */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                      <div
                        onClick={() => toggleSettingCard('el_table_style')}
                        className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Palette className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Table Body & Row Styling</span>
                        </div>
                        {openSettingCards.el_table_style !== false ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      {openSettingCards.el_table_style !== false && (
                        <div className="space-y-3 pt-1">
                          {/* Table Background */}
                          <ModernColorPicker
                            label="Table Background"
                            value={selectedElement.styles?.bgColor || '#0f172a'}
                            onChange={(bgColor) => updateElementStyles(selectedElement.id, { bgColor })}
                          />

                          {/* Cell Text Color */}
                          <ModernColorPicker
                            label="Cell Text Color"
                            value={selectedElement.styles?.color || '#ffffff'}
                            onChange={(color) => updateElementStyles(selectedElement.id, { color })}
                          />

                          {/* Row Divider Color */}
                          <ModernColorPicker
                            label="Row Divider Color"
                            value={selectedElement.styles?.borderColor || '#1e293b'}
                            onChange={(borderColor) => updateElementStyles(selectedElement.id, { borderColor })}
                          />

                          {/* Cell Text Alignment */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-600">Cell Text Alignment</label>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { id: 'left', label: 'Left', icon: AlignLeft },
                                { id: 'center', label: 'Center', icon: AlignCenter },
                                { id: 'right', label: 'Right', icon: AlignRight }
                              ].map((opt) => {
                                const isSelected = (selectedElement.styles?.tableCellAlign || selectedElement.styles?.textAlign || 'left') === opt.id;
                                const IconComp = opt.icon;
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { tableCellAlign: opt.id, textAlign: opt.id })}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                                    }`}
                                  >
                                    <IconComp className="w-3 h-3" />
                                    <span>{opt.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Zebra Stripes Toggle */}
                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                              <span className="text-xs font-semibold text-slate-700 block">Zebra Stripes</span>
                              <span className="text-[10px] text-slate-400">Alternating row background</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => updateElementStyles(selectedElement.id, { tableStriped: !selectedElement.styles?.tableStriped })}
                              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                                selectedElement.styles?.tableStriped ? 'bg-indigo-600' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                                  selectedElement.styles?.tableStriped ? 'left-5' : 'left-1'
                                }`}
                              />
                            </button>
                          </div>

                          {/* Row Hover Highlight Toggle */}
                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                              <span className="text-xs font-semibold text-slate-700 block">Row Hover Highlight</span>
                              <span className="text-[10px] text-slate-400">Subtle highlight on hovered row</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => updateElementStyles(selectedElement.id, { tableHoverHighlight: selectedElement.styles?.tableHoverHighlight === false ? true : false })}
                              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                                selectedElement.styles?.tableHoverHighlight !== false ? 'bg-indigo-600' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                                  selectedElement.styles?.tableHoverHighlight !== false ? 'left-5' : 'left-1'
                                }`}
                              />
                            </button>
                          </div>

                          {/* Table Corner Radius */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-600">Table Corner Radius</label>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { label: 'Square', value: '0px' },
                                { label: 'Small', value: '8px' },
                                { label: 'Rounded', value: '12px' },
                                { label: 'Large', value: '16px' }
                              ].map((r) => {
                                const currentRadius = selectedElement.styles?.borderRadius || '12px';
                                const isSelected = currentRadius === r.value;
                                return (
                                  <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { borderRadius: r.value })}
                                    className={`py-1 text-[10px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                                    }`}
                                  >
                                    {r.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* 2.5 DEDICATED BUTTON STYLING (PRESETS, COLORS, BORDER, HOVER & TRANSITIONS) */}
                {selectedElement.type === 'button' && (
                  <>
                    {/* Button Presets Card */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                      <div
                        onClick={() => toggleSettingCard('el_button_presets')}
                        className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Button Style Presets (10 Styles)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/50">
                            {BUTTON_PRESET_ITEMS.find(p => p.id === (selectedElement.styles?.buttonPreset || 'solid'))?.name || 'Solid Filled'}
                          </span>
                          {openSettingCards.el_button_presets !== false ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                      {openSettingCards.el_button_presets !== false && (
                        <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1 pt-1">
                          {BUTTON_PRESET_ITEMS.map((item) => {
                            const isSelected = (selectedElement.styles?.buttonPreset || 'solid') === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                title={item.name}
                                onClick={() => {
                                  const defaults = PRESET_HOVER_DEFAULTS[item.id] || PRESET_HOVER_DEFAULTS.solid;
                                  const updates: any = {
                                    buttonPreset: item.id,
                                    buttonHoverEffect: defaults.hoverEffect,
                                    buttonHoverShadow: defaults.hoverShadow,
                                    buttonInsideEffect: defaults.insideEffect,
                                  };
                                  if (item.id === 'pill') updates.borderRadius = '9999px';
                                  if (item.id === 'outline' && (!selectedElement.styles?.borderWidth || selectedElement.styles?.borderWidth === '0px')) {
                                    updates.borderWidth = '2px';
                                  }
                                  updateElementStyles(selectedElement.id, updates);
                                }}
                                className={`relative flex items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/50 shadow-sm'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                                }`}
                              >
                                <div
                                  className={`w-full py-1.5 px-2 text-[10px] font-bold rounded-lg text-center truncate flex items-center justify-center space-x-1 ${item.previewClass}`}
                                >
                                  <span>Button</span>
                                  <ArrowRight className="w-2.5 h-2.5 inline shrink-0" />
                                </div>

                                {isSelected && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Button Colors & Fill Card */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                      <div
                        onClick={() => toggleSettingCard('el_button_colors')}
                        className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Palette className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Button Colors & Fill</span>
                        </div>
                        {openSettingCards.el_button_colors !== false ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      {openSettingCards.el_button_colors !== false && (
                        <div className="space-y-3 pt-1">
                          <ModernColorPicker
                            label="Button Background Color"
                            value={selectedElement.styles?.bgColor || '#6366f1'}
                            onChange={(bgColor) => updateElementStyles(selectedElement.id, { bgColor })}
                          />
                          <ModernColorPicker
                            label="Text & Icon Color"
                            value={selectedElement.styles?.color || '#ffffff'}
                            onChange={(color) => updateElementStyles(selectedElement.id, { color })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Button Border & Shape Card */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                      <div
                        onClick={() => toggleSettingCard('el_button_border')}
                        className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Square className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Border & Shape</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/50">
                            {selectedElement.styles?.borderWidth || '0px'}
                          </span>
                          {openSettingCards.el_button_border !== false ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                      {openSettingCards.el_button_border !== false && (
                        <div className="space-y-3.5 pt-1">
                          {/* Border Width Stepper + Quick Chips */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-600">Border Width</label>
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = parseInt(selectedElement.styles?.borderWidth || '0', 10) || 0;
                                    const next = Math.max(0, current - 1);
                                    updateElementStyles(selectedElement.id, { borderWidth: `${next}px` });
                                  }}
                                  className="w-6 h-6 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 font-bold text-xs shadow-2xs cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-9 text-center text-xs font-mono font-bold text-slate-800">
                                  {parseInt(selectedElement.styles?.borderWidth || '0', 10) || 0}px
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = parseInt(selectedElement.styles?.borderWidth || '0', 10) || 0;
                                    const next = Math.min(20, current + 1);
                                    updateElementStyles(selectedElement.id, { borderWidth: `${next}px` });
                                  }}
                                  className="w-6 h-6 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 font-bold text-xs shadow-2xs cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-5 gap-1">
                              {[0, 1, 2, 3, 4].map((w) => {
                                const isCurrent = (parseInt(selectedElement.styles?.borderWidth || '0', 10) || 0) === w;
                                return (
                                  <button
                                    key={w}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { borderWidth: `${w}px` })}
                                    className={`py-1 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer ${
                                      isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    {w}px
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Border Style and Border Color */}
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-600">Border Style</label>
                              <select
                                value={selectedElement.styles?.borderStyle || 'solid'}
                                onChange={(e) => updateElementStyles(selectedElement.id, { borderStyle: e.target.value })}
                                className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                              >
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                                <option value="dotted">Dotted</option>
                                <option value="double">Double</option>
                              </select>
                            </div>
                            <ModernColorPicker
                              label="Border Color"
                              value={selectedElement.styles?.borderColor || selectedElement.styles?.bgColor || '#6366f1'}
                              onChange={(borderColor) => updateElementStyles(selectedElement.id, { borderColor })}
                            />
                          </div>

                          {/* Corner Radius */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-600">Corner Radius</label>
                              <span className="text-[10px] font-mono font-bold text-slate-600">
                                {selectedElement.styles?.borderRadius || '12px'}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { label: 'Square', val: '0px' },
                                { label: 'Soft', val: '8px' },
                                { label: 'Round', val: '14px' },
                                { label: 'Pill', val: '9999px' },
                              ].map((r) => {
                                const isCurrent = (selectedElement.styles?.borderRadius || '12px') === r.val;
                                return (
                                  <button
                                    key={r.val}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { borderRadius: r.val })}
                                    className={`py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                                      isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    {r.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Button Hover & Transition Effects Card */}
                    {(() => {
                      const activePreset = selectedElement.styles?.buttonPreset || 'solid';
                      const activeDefaults = PRESET_HOVER_DEFAULTS[activePreset] || PRESET_HOVER_DEFAULTS.solid;
                      const activeHoverEffect = (selectedElement.styles?.buttonHoverEffect !== undefined && selectedElement.styles?.buttonHoverEffect !== '')
                        ? selectedElement.styles?.buttonHoverEffect
                        : activeDefaults.hoverEffect;
                      const activeHoverShadow = (selectedElement.styles?.buttonHoverShadow !== undefined && selectedElement.styles?.buttonHoverShadow !== '')
                        ? selectedElement.styles?.buttonHoverShadow
                        : activeDefaults.hoverShadow;
                      const activeInsideEffect = (selectedElement.styles?.buttonInsideEffect !== undefined && selectedElement.styles?.buttonInsideEffect !== '')
                        ? selectedElement.styles?.buttonInsideEffect
                        : activeDefaults.insideEffect;

                      return (
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                          <div
                            onClick={() => toggleSettingCard('el_button_hover')}
                            className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                          >
                            <div className="flex items-center space-x-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Hover & Transition Effects</span>
                            </div>
                            {openSettingCards.el_button_hover !== false ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </div>

                          {openSettingCards.el_button_hover !== false && (
                            <div className="space-y-4 pt-1">
                              {/* Hover Animation Presets */}
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-600">Hover Animation Preset</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {[
                                    { id: 'none', label: 'None' },
                                    { id: 'lift', label: 'Float Lift' },
                                    { id: 'scale', label: 'Scale Pop' },
                                    { id: 'bounce', label: 'Bounce' },
                                    { id: 'push', label: 'Push Click' },
                                    { id: 'glow', label: 'Glow Pulse' },
                                    { id: 'pulse', label: 'Heartbeat' },
                                    { id: 'shine-sweep', label: 'Shine Glint' },
                                  ].map((anim) => {
                                    const isCurrent = activeHoverEffect === anim.id;
                                    return (
                                      <button
                                        key={anim.id}
                                        type="button"
                                        onClick={() => updateElementStyles(selectedElement.id, { buttonHoverEffect: anim.id })}
                                        className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                                          isCurrent
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/80 hover:border-slate-300'
                                        }`}
                                      >
                                        {anim.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Hover Shadow Presets */}
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-600">Hover Shadow Effect</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {[
                                    { id: 'none', label: 'None' },
                                    { id: 'subtle', label: 'Subtle' },
                                    { id: 'medium', label: 'Medium' },
                                    { id: 'large', label: 'Deep 3D' },
                                    { id: 'glow', label: 'Neon Halo' },
                                    { id: 'colored', label: 'Ambient' },
                                    { id: 'sharp-3d', label: 'Hard Edge' },
                                    { id: 'inner-glow', label: 'Inner Glow' },
                                  ].map((sh) => {
                                    const isCurrent = activeHoverShadow === sh.id;
                                    return (
                                      <button
                                        key={sh.id}
                                        type="button"
                                        onClick={() => updateElementStyles(selectedElement.id, { buttonHoverShadow: sh.id })}
                                        className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                                          isCurrent
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/80 hover:border-slate-300'
                                        }`}
                                      >
                                        {sh.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Button Inside Transition Effects */}
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-600">Inside Transition Effect (Overlays)</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {[
                                    { id: 'none', label: 'None (Standard)', desc: 'Clean interior' },
                                    { id: 'glass-sheen', label: 'Glass Sheen', desc: 'Frosted reflection highlight' },
                                    { id: 'shine-sweep', label: 'Shine Sweep Beam', desc: 'Laser glare sweeps on hover' },
                                    { id: 'fill-slide', label: 'Fill Slide', desc: 'Sliding background accent' },
                                    { id: 'neon-border', label: 'Neon Border Flare', desc: 'Pulsing perimeter edge' },
                                  ].map((fx) => {
                                    const isCurrent = activeInsideEffect === fx.id;
                                    return (
                                      <button
                                        key={fx.id}
                                        type="button"
                                        onClick={() => updateElementStyles(selectedElement.id, { buttonInsideEffect: fx.id })}
                                        className={`p-2 text-left rounded-lg border transition-all cursor-pointer ${
                                          isCurrent
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300'
                                        }`}
                                      >
                                        <div className="text-[11px] font-bold">{fx.label}</div>
                                        <div className={`text-[9px] truncate ${isCurrent ? 'text-indigo-100' : 'text-slate-400'}`}>
                                          {fx.desc}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* FIXED HOVER COLORS SECTION (Full Width Rows with Reset Buttons) */}
                              <div className="pt-3 border-t border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-xs font-bold text-slate-800">Hover Color Overrides</span>
                                    <p className="text-[10px] text-slate-400">Optional custom colors on hover. Clear to use preset defaults.</p>
                                  </div>
                                  {(selectedElement.styles?.hoverBgColor || selectedElement.styles?.hoverColor || selectedElement.styles?.hoverBorderColor) && (
                                    <button
                                      type="button"
                                      onClick={() => updateElementStyles(selectedElement.id, {
                                        hoverBgColor: '',
                                        hoverColor: '',
                                        hoverBorderColor: ''
                                      })}
                                      className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded border border-rose-200 transition-colors cursor-pointer"
                                    >
                                      Reset All
                                    </button>
                                  )}
                                </div>

                                <div className="space-y-3">
                                  {/* Hover Background */}
                                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <ModernColorPicker
                                      label="Hover Background"
                                      value={selectedElement.styles?.hoverBgColor || ''}
                                      onChange={(hoverBgColor) => updateElementStyles(selectedElement.id, { hoverBgColor })}
                                      onReset={selectedElement.styles?.hoverBgColor ? () => updateElementStyles(selectedElement.id, { hoverBgColor: '' }) : undefined}
                                    />
                                  </div>

                                  {/* Hover Text Color */}
                                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <ModernColorPicker
                                      label="Hover Text Color"
                                      value={selectedElement.styles?.hoverColor || ''}
                                      onChange={(hoverColor) => updateElementStyles(selectedElement.id, { hoverColor })}
                                      onReset={selectedElement.styles?.hoverColor ? () => updateElementStyles(selectedElement.id, { hoverColor: '' }) : undefined}
                                    />
                                  </div>

                                  {/* Hover Border Color */}
                                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <ModernColorPicker
                                      label="Hover Border Color"
                                      value={selectedElement.styles?.hoverBorderColor || ''}
                                      onChange={(hoverBorderColor) => updateElementStyles(selectedElement.id, { hoverBorderColor })}
                                      onReset={selectedElement.styles?.hoverBorderColor ? () => updateElementStyles(selectedElement.id, { hoverBorderColor: '' }) : undefined}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* 3. GENERAL TYPOGRAPHY & COLORS */}
                {selectedElement.type !== 'innerrow' && selectedElement.type !== 'icon' && selectedElement.type !== 'iconbox' && selectedElement.type !== 'video' && (
                  <>
                    {/* Typography Card */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                      <div
                        onClick={() => toggleSettingCard('el_typography')}
                        className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Type className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Typography & Text</span>
                        </div>
                        {openSettingCards.el_typography !== false ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      {openSettingCards.el_typography !== false && (
                        <div className="space-y-3.5 pt-1">
                          {/* Font Family */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600">Font Family</label>
                            <select
                              value={selectedElement.styles?.fontFamily || 'Inter, sans-serif'}
                              onChange={(e) => updateElementStyles(selectedElement.id, { fontFamily: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                            >
                              {FONT_FAMILIES.map((font) => (
                                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                  {font.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Font Weight */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-600">Font Weight</label>
                              <span className="text-[10px] font-mono font-bold text-indigo-600">
                                {selectedElement.styles?.fontWeight || (selectedElement.type === 'heading' ? '800' : '400')}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { label: 'Light', value: '300' },
                                { label: 'Regular', value: '400' },
                                { label: 'Medium', value: '500' },
                                { label: 'Semi', value: '600' },
                                { label: 'Bold', value: '700' },
                                { label: 'Extra', value: '800' },
                                { label: 'Black', value: '900' }
                              ].map((w) => {
                                const currentWeight = String(selectedElement.styles?.fontWeight || (selectedElement.type === 'heading' ? '800' : '400'));
                                const isSelected = currentWeight === w.value;
                                return (
                                  <button
                                    key={w.value}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { fontWeight: w.value })}
                                    className={`py-1 text-[10px] font-semibold rounded-lg border transition-colors ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                                    }`}
                                  >
                                    {w.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Font Size with UP and DOWN small arrows */}
                          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-700">Font Size</label>
                              <span className="text-xs font-mono font-bold text-indigo-600">
                                {currentFontSize}px
                              </span>
                            </div>

                            {/* Stepper with small Up and Down arrows */}
                            <div className="flex items-center space-x-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  min="8"
                                  max="120"
                                  value={currentFontSize}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 16;
                                    updateElementStyles(selectedElement.id, { fontSize: `${val}px` });
                                  }}
                                  className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                                />
                                <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center">
                                  <button
                                    type="button"
                                    onClick={() => changeFontSize(1)}
                                    className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded"
                                    title="Increase size"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => changeFontSize(-1)}
                                    className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded"
                                    title="Decrease size"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-400">px</span>
                            </div>

                            {/* Quick Preset Pills */}
                            <div className="flex items-center space-x-1 pt-1">
                              {[14, 16, 20, 24, 32, 40].map((size) => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { fontSize: `${size}px` })}
                                  className={`flex-1 py-1 text-[10px] font-mono font-bold rounded transition-colors ${
                                    currentFontSize === size
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'bg-slate-200/70 hover:bg-indigo-100 text-slate-600'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Text Alignment */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-600">Text Align</label>
                              <span className="text-[10px] font-mono font-bold text-indigo-600 capitalize">
                                {selectedElement.styles?.textAlign || 'left'}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { id: 'left', label: 'Left', icon: AlignLeft },
                                { id: 'center', label: 'Center', icon: AlignCenter },
                                { id: 'right', label: 'Right', icon: AlignRight },
                                { id: 'justify', label: 'Justify', icon: AlignJustify }
                              ].map(({ id, label, icon: Icon }) => {
                                const isActive = (selectedElement.styles?.textAlign || 'left') === id;
                                return (
                                  <button
                                    key={id}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { textAlign: id as any })}
                                    className={`py-1.5 text-xs font-semibold rounded-lg capitalize border flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                                      isActive
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                                    }`}
                                    title={`Align ${label}`}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Text Case (Text Transform) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-600">Text Case</label>
                              <span className="text-[10px] font-mono font-bold text-indigo-600 capitalize">
                                {selectedElement.styles?.textTransform || 'none'}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { id: 'none', label: 'As Typed', preview: 'Aa' },
                                { id: 'uppercase', label: 'UPPER', preview: 'AA' },
                                { id: 'lowercase', label: 'lower', preview: 'aa' },
                                { id: 'capitalize', label: 'Title', preview: 'Ab' }
                              ].map(({ id, label, preview }) => {
                                const isSelected = (selectedElement.styles?.textTransform || 'none') === id;
                                return (
                                  <button
                                    key={id}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { textTransform: id as any })}
                                    className={`py-1.5 px-1 text-xs rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                                    }`}
                                    title={`Text Case: ${label}`}
                                  >
                                    <span className="font-mono font-extrabold text-xs">{preview}</span>
                                    <span className="text-[9px] font-medium leading-none mt-0.5">{label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Line Spacing (Line Height) */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-600">Line Spacing</label>
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[10px] font-mono font-bold text-indigo-600">
                                  {selectedElement.styles?.lineHeight || 'Normal (1.5)'}
                                </span>
                                {selectedElement.styles?.lineHeight && (
                                  <button
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { lineHeight: undefined })}
                                    className="text-[10px] text-slate-400 hover:text-rose-500 font-medium transition-colors"
                                    title="Reset to default"
                                  >
                                    Reset
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-5 gap-1">
                              {[
                                { label: 'Tight', value: '1.1' },
                                { label: 'Snug', value: '1.25' },
                                { label: 'Normal', value: '1.5' },
                                { label: 'Relaxed', value: '1.75' },
                                { label: 'Loose', value: '2' }
                              ].map(({ label, value }) => {
                                const currentLH = selectedElement.styles?.lineHeight || '1.5';
                                const isActive = currentLH === value;
                                return (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { lineHeight: value })}
                                    className={`py-1 text-xs rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                      isActive
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                                    }`}
                                    title={`Line Height ${value}`}
                                  >
                                    <span className="font-mono font-bold text-[11px]">{value}</span>
                                    <span className="text-[9px] font-medium leading-none mt-0.5">{label}</span>
                                  </button>
                                );
                              })}
                            </div>
                            {/* Custom Line Height Input */}
                            <div className="flex items-center space-x-2 pt-0.5">
                              <span className="text-[10px] text-slate-500 font-medium">Custom:</span>
                              <input
                                type="text"
                                value={selectedElement.styles?.lineHeight || ''}
                                onChange={(e) => updateElementStyles(selectedElement.id, { lineHeight: e.target.value })}
                                placeholder="e.g. 1.4 or 28px"
                                className="flex-1 p-1 px-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          {/* Letter Spacing */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-600">Letter Spacing</label>
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[10px] font-mono font-bold text-indigo-600">
                                  {selectedElement.styles?.letterSpacing || 'Normal (0px)'}
                                </span>
                                {selectedElement.styles?.letterSpacing && (
                                  <button
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { letterSpacing: undefined })}
                                    className="text-[10px] text-slate-400 hover:text-rose-500 font-medium transition-colors"
                                    title="Reset to default"
                                  >
                                    Reset
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-6 gap-1">
                              {[
                                { label: 'Tight', value: '-1px' },
                                { label: '0', value: '0px' },
                                { label: 'Wide', value: '1px' },
                                { label: '+2', value: '2px' },
                                { label: '+3', value: '3px' },
                                { label: 'Max', value: '5px' }
                              ].map(({ label, value }) => {
                                const currentLS = selectedElement.styles?.letterSpacing || '0px';
                                const isActive = currentLS === value;
                                return (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { letterSpacing: value })}
                                    className={`py-1 text-xs rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                      isActive
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                                    }`}
                                    title={`Letter Spacing ${value}`}
                                  >
                                    <span className="font-mono font-bold text-[11px]">{value}</span>
                                    <span className="text-[8px] font-medium leading-none mt-0.5">{label}</span>
                                  </button>
                                );
                              })}
                            </div>
                            {/* Custom Letter Spacing Input */}
                            <div className="flex items-center space-x-2 pt-0.5">
                              <span className="text-[10px] text-slate-500 font-medium">Custom:</span>
                              <input
                                type="text"
                                value={selectedElement.styles?.letterSpacing || ''}
                                onChange={(e) => updateElementStyles(selectedElement.id, { letterSpacing: e.target.value })}
                                placeholder="e.g. 1.5px or 0.1em"
                                className="flex-1 p-1 px-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          {/* Text Shadow Controls */}
                          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                <label className="text-[11px] font-semibold text-slate-700">Text Shadow</label>
                              </div>
                              {selectedElement.styles?.textShadow && selectedElement.styles?.textShadow !== 'none' && (
                                <button
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { textShadow: undefined })}
                                  className="text-[10px] text-rose-500 hover:text-rose-700 font-bold transition-colors cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                            </div>

                            {/* Quick Presets */}
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { label: 'None', value: 'none' },
                                { label: 'Subtle', value: '0 1px 2px rgba(0, 0, 0, 0.3)' },
                                { label: 'Soft', value: '0 2px 5px rgba(0, 0, 0, 0.35)' },
                                { label: 'Medium', value: '0 4px 8px rgba(0, 0, 0, 0.5)' },
                                { label: 'Hard 3D', value: '2px 2px 0px rgba(0, 0, 0, 0.8)' },
                                { label: 'Glow Indigo', value: '0 0 12px rgba(99, 102, 241, 0.8)' },
                                { label: 'Glow Cyan', value: '0 0 10px #06b6d4, 0 0 20px #3b82f6' },
                                { label: 'Outline', value: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }
                              ].map((preset) => {
                                const isPresetActive = (selectedElement.styles?.textShadow || 'none') === preset.value ||
                                  (!selectedElement.styles?.textShadow && preset.value === 'none');
                                return (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, {
                                      textShadow: preset.value === 'none' ? undefined : preset.value
                                    })}
                                    className={`py-1 px-1 text-[9px] font-semibold rounded-md border transition-all truncate text-center cursor-pointer ${
                                      isPresetActive
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                    }`}
                                    title={preset.value}
                                  >
                                    {preset.label}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Custom Text Shadow Toggle */}
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setShowCustomTextShadow(!showCustomTextShadow)}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                              >
                                <SlidersHorizontal className="w-3 h-3" />
                                <span>{showCustomTextShadow ? 'Hide Custom Controls' : 'Custom Shadow Controls'}</span>
                              </button>
                            </div>

                            {/* Custom Controls Panel */}
                            {showCustomTextShadow && (
                              <div className="pt-2 border-t border-slate-200/80 space-y-2.5">
                                {/* Offset X */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-semibold text-slate-600">Offset X</span>
                                    <span className="font-mono text-indigo-600 font-bold">{textShadowX}px</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="-25"
                                    max="25"
                                    value={textShadowX}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setTextShadowX(val);
                                      updateElementStyles(selectedElement.id, {
                                        textShadow: `${val}px ${textShadowY}px ${textShadowBlur}px ${textShadowColor}`
                                      });
                                    }}
                                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                                  />
                                </div>

                                {/* Offset Y */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-semibold text-slate-600">Offset Y</span>
                                    <span className="font-mono text-indigo-600 font-bold">{textShadowY}px</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="-25"
                                    max="25"
                                    value={textShadowY}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setTextShadowY(val);
                                      updateElementStyles(selectedElement.id, {
                                        textShadow: `${textShadowX}px ${val}px ${textShadowBlur}px ${textShadowColor}`
                                      });
                                    }}
                                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                                  />
                                </div>

                                {/* Blur Radius */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-semibold text-slate-600">Blur Radius</span>
                                    <span className="font-mono text-indigo-600 font-bold">{textShadowBlur}px</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="35"
                                    value={textShadowBlur}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setTextShadowBlur(val);
                                      updateElementStyles(selectedElement.id, {
                                        textShadow: `${textShadowX}px ${textShadowY}px ${val}px ${textShadowColor}`
                                      });
                                    }}
                                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                                  />
                                </div>

                                {/* Shadow Color */}
                                <ModernColorPicker
                                  label="Shadow Color"
                                  value={textShadowColor}
                                  onChange={(color) => {
                                    setTextShadowColor(color);
                                    updateElementStyles(selectedElement.id, {
                                      textShadow: `${textShadowX}px ${textShadowY}px ${textShadowBlur}px ${color}`
                                    });
                                  }}
                                />

                                {/* Live Preview Box */}
                                <div className="mt-2 p-2 bg-slate-100 rounded-lg text-center overflow-hidden border border-slate-200">
                                  <span
                                    className="text-xs font-bold text-slate-800 transition-all"
                                    style={{
                                      textShadow: selectedElement.styles?.textShadow || `${textShadowX}px ${textShadowY}px ${textShadowBlur}px ${textShadowColor}`
                                    }}
                                  >
                                    Sample Text Shadow
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Colors & Background Card */}
                    {selectedElement.type !== 'button' && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                        <div
                          onClick={() => toggleSettingCard('el_colors')}
                          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                        >
                          <div className="flex items-center space-x-1.5">
                            <Palette className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Colors & Background</span>
                          </div>
                          {openSettingCards.el_colors !== false ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        {openSettingCards.el_colors !== false && (
                          <div className="space-y-3 pt-1">
                            {/* Text Color Picker */}
                            <ModernColorPicker
                              label="Text / Primary Color"
                              value={selectedElement.styles?.color || '#1e293b'}
                              onChange={(color) => updateElementStyles(selectedElement.id, { color })}
                            />

                            {/* Background Color Picker */}
                            <ModernColorPicker
                              label="Card / Background Color"
                              value={selectedElement.styles?.bgColor || '#ffffff'}
                              onChange={(bgColor) => updateElementStyles(selectedElement.id, { bgColor })}
                            />

                            {/* Border Color Picker */}
                            <ModernColorPicker
                              label="Border Color"
                              value={selectedElement.styles?.borderColor || '#e2e8f0'}
                              onChange={(borderColor) => updateElementStyles(selectedElement.id, { borderColor })}
                            />
                            {selectedElement.type === 'timeline' && (
                              <div className="pt-2.5 border-t border-slate-100 space-y-2.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Date & Badge Colors</span>
                                <ModernColorPicker
                                  label="Date Text Color"
                                  value={selectedElement.styles?.dateColor || selectedElement.styles?.lineColor || selectedElement.styles?.iconColor || '#6366f1'}
                                  onChange={(val) => updateElementStyles(selectedElement.id, { dateColor: val })}
                                />
                                <ModernColorPicker
                                  label="Tag / Badge Text Color"
                                  value={selectedElement.styles?.tagColor || selectedElement.styles?.lineColor || selectedElement.styles?.iconColor || '#6366f1'}
                                  onChange={(val) => updateElementStyles(selectedElement.id, { tagColor: val })}
                                />
                                <ModernColorPicker
                                  label="Tag / Badge Background"
                                  value={selectedElement.styles?.tagBgColor || 'rgba(99, 102, 241, 0.1)'}
                                  onChange={(val) => updateElementStyles(selectedElement.id, { tagBgColor: val })}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Border & Corners Card */}
                    {selectedElement.type !== 'button' && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                      <div
                        onClick={() => toggleSettingCard('el_border')}
                        className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Square className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Border & Corners</span>
                        </div>
                        {openSettingCards.el_border !== false ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      {openSettingCards.el_border !== false && (
                        <div className="space-y-3 pt-1">
                          {/* Border Width with Stepper */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-600">Border Width</label>
                              <span className="text-xs font-mono font-bold text-indigo-600">{currentBorderWidth}px</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  value={currentBorderWidth}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    updateElementStyles(selectedElement.id, { borderWidth: `${val}px` });
                                  }}
                                  className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                                />
                                <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center">
                                  <button
                                    type="button"
                                    onClick={() => changeBorderWidth(1)}
                                    className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => changeBorderWidth(-1)}
                                    className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-400">px</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {[0, 1, 2, 3, 4].map((w) => (
                                <button
                                  key={w}
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { borderWidth: `${w}px` })}
                                  className={`flex-1 py-1 text-[10px] font-mono font-bold rounded ${
                                    currentBorderWidth === w ? 'bg-indigo-600 text-white' : 'bg-slate-200/70 text-slate-600'
                                  }`}
                                >
                                  {w}px
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Border Style */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600">Border Style</label>
                            <select
                              value={selectedElement.styles?.borderStyle || 'solid'}
                              onChange={(e) => updateElementStyles(selectedElement.id, { borderStyle: e.target.value })}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                            >
                              <option value="solid">Solid</option>
                              <option value="dashed">Dashed</option>
                              <option value="dotted">Dotted</option>
                              <option value="none">None</option>
                            </select>
                          </div>

                          {/* Border Radius with Stepper */}
                          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-700">Border Radius</label>
                              <span className="text-xs font-mono font-bold text-indigo-600">
                                {currentBorderRadius}px
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={currentBorderRadius}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    updateElementStyles(selectedElement.id, { borderRadius: `${val}px` });
                                  }}
                                  className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                                />
                                <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center">
                                  <button
                                    type="button"
                                    onClick={() => changeBorderRadius(2)}
                                    className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => changeBorderRadius(-2)}
                                    className="h-3 w-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-400">px</span>
                            </div>

                            <div className="flex items-center space-x-1 pt-1">
                              {[0, 8, 16, 24].map((r) => (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => updateElementStyles(selectedElement.id, { borderRadius: `${r}px` })}
                                  className={`flex-1 py-1 text-[10px] font-mono font-bold rounded transition-colors ${
                                    currentBorderRadius === r
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-slate-200/70 hover:bg-indigo-100 text-slate-600'
                                  }`}
                                >
                                  {r}px
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      </div>
                    )}

                    {/* Element Shadow (Box Shadow) Card */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                      <div
                        onClick={() => toggleSettingCard('el_shadow')}
                        className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Box className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Box Shadow & Effects</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedElement.styles?.shadow && selectedElement.styles?.shadow !== 'none' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateElementStyles(selectedElement.id, { shadow: undefined, shadowColor: undefined });
                              }}
                              className="text-[10px] text-rose-500 hover:text-rose-700 font-bold transition-colors cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                          {openSettingCards.el_shadow !== false ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                      {openSettingCards.el_shadow !== false && (
                        <div className="space-y-3 pt-1">
                          {/* Shadow Selector Dropdown */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600">Shadow Elevation</label>
                            <select
                              value={selectedElement.styles?.shadow || 'none'}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'none') {
                                  updateElementStyles(selectedElement.id, { shadow: 'none' });
                                } else {
                                  const coloredShadow = selectedElement.styles?.shadowColor
                                    ? applyShadowColor(val, selectedElement.styles.shadowColor)
                                    : val;
                                  updateElementStyles(selectedElement.id, { shadow: coloredShadow });
                                }
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              <option value="none">None</option>
                              <option value="0 1px 2px 0 rgba(0, 0, 0, 0.05)">Small (sm)</option>
                              <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)">Medium (md)</option>
                              <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)">Large (lg)</option>
                              <option value="0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)">Extra Large (xl)</option>
                              <option value="0 25px 50px -12px rgba(0, 0, 0, 0.25)">2X Large (2xl)</option>
                              <option value="0 8px 30px rgba(0, 0, 0, 0.12)">Soft Float</option>
                              <option value="0 0 20px rgba(99, 102, 241, 0.35)">Glow Indigo</option>
                              <option value="0 0 20px rgba(16, 185, 129, 0.35)">Glow Emerald</option>
                              <option value="0 0 20px rgba(245, 158, 11, 0.35)">Glow Amber</option>
                              <option value="inset 0 2px 4px 0 rgba(0, 0, 0, 0.08)">Inner Shadow</option>
                            </select>
                          </div>

                          {/* Quick Preset Pills */}
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { label: 'None', val: 'none' },
                              { label: 'Small', val: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
                              { label: 'Medium', val: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' },
                              { label: 'Large', val: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)' },
                              { label: 'XL', val: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' },
                              { label: '2XL', val: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
                              { label: 'Glow', val: '0 0 20px rgba(99, 102, 241, 0.35)' },
                              { label: 'Inner', val: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.08)' }
                            ].map((preset) => {
                              const isPresetActive = (selectedElement.styles?.shadow || 'none') === preset.val ||
                                (Boolean(selectedElement.styles?.shadow) && Boolean(selectedElement.styles?.shadowColor) && selectedElement.styles?.shadow === applyShadowColor(preset.val, selectedElement.styles.shadowColor));
                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => {
                                    if (preset.val === 'none') {
                                      updateElementStyles(selectedElement.id, { shadow: 'none' });
                                      return;
                                    }
                                    const coloredShadow = selectedElement.styles?.shadowColor
                                      ? applyShadowColor(preset.val, selectedElement.styles.shadowColor)
                                      : preset.val;
                                    updateElementStyles(selectedElement.id, { shadow: coloredShadow });
                                  }}
                                  className={`py-1 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                                    isPresetActive
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>

                          {/* Shadow Color Property */}
                          <ModernColorPicker
                            label="Shadow Color"
                            value={selectedElement.styles?.shadowColor || '#000000'}
                            onChange={(color) => {
                              const activeShadow = selectedElement.styles?.shadow;
                              let updatedShadow: string | undefined;
                              if (!activeShadow || activeShadow === 'none') {
                                updatedShadow = `${boxShadowX}px ${boxShadowY}px ${boxShadowBlur}px ${boxShadowSpread}px ${color}`;
                              } else {
                                updatedShadow = applyShadowColor(activeShadow, color);
                              }
                              updateElementStyles(selectedElement.id, {
                                shadowColor: color,
                                shadow: updatedShadow
                              });
                            }}
                            allowAlpha={true}
                          />

                          {/* Custom Shadow Toggle */}
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setShowCustomBoxShadow(!showCustomBoxShadow)}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                            >
                              <SlidersHorizontal className="w-3 h-3" />
                              <span>{showCustomBoxShadow ? 'Hide Custom Shadow Sliders' : 'Custom Shadow Sliders'}</span>
                            </button>
                          </div>

                          {/* Custom Sliders Panel */}
                          {showCustomBoxShadow && (() => {
                            const updateCustomShadow = (x: number, y: number, blur: number, spread: number) => {
                              const col = selectedElement.styles?.shadowColor || '#000000';
                              const shadowStr = `${x}px ${y}px ${blur}px ${spread}px ${col}`;
                              updateElementStyles(selectedElement.id, {
                                shadow: shadowStr
                              });
                            };

                            return (
                              <div className="pt-2 border-t border-slate-200/80 space-y-2.5">
                                {/* Offset X */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-semibold text-slate-600">Offset X</span>
                                    <span className="font-mono text-indigo-600 font-bold">{boxShadowX}px</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={boxShadowX}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setBoxShadowX(val);
                                      updateCustomShadow(val, boxShadowY, boxShadowBlur, boxShadowSpread);
                                    }}
                                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                                  />
                                </div>

                                {/* Offset Y */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-semibold text-slate-600">Offset Y</span>
                                    <span className="font-mono text-indigo-600 font-bold">{boxShadowY}px</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={boxShadowY}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setBoxShadowY(val);
                                      updateCustomShadow(boxShadowX, val, boxShadowBlur, boxShadowSpread);
                                    }}
                                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                                  />
                                </div>

                                {/* Blur Radius */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-semibold text-slate-600">Blur Radius</span>
                                    <span className="font-mono text-indigo-600 font-bold">{boxShadowBlur}px</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="60"
                                    value={boxShadowBlur}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setBoxShadowBlur(val);
                                      updateCustomShadow(boxShadowX, boxShadowY, val, boxShadowSpread);
                                    }}
                                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                                  />
                                </div>

                                {/* Spread Radius */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-semibold text-slate-600">Spread Radius</span>
                                    <span className="font-mono text-indigo-600 font-bold">{boxShadowSpread}px</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="-20"
                                    max="30"
                                    value={boxShadowSpread}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setBoxShadowSpread(val);
                                      updateCustomShadow(boxShadowX, boxShadowY, boxShadowBlur, val);
                                    }}
                                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                                  />
                                </div>

                                {/* Live Shadow Preview Chip */}
                                <div className="mt-2 p-6 bg-slate-50 rounded-lg text-center border border-slate-200 flex items-center justify-center min-h-[90px] overflow-visible">
                                  <div
                                    className="px-4 py-2 bg-white rounded-lg text-xs font-bold text-slate-800 transition-all border border-slate-200/50"
                                    style={{
                                      boxShadow: applyShadowColor(selectedElement.styles?.shadow, selectedElement.styles?.shadowColor) || 'none'
                                    }}
                                  >
                                    Shadow Preview
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Dedicated Slide Caption & Navigation Styling */}
                    {(selectedElement.type === 'carousel' || selectedElement.type === 'mediacarousel' || selectedElement.type === 'gallery' || selectedElement.type === 'imagebox') && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                        <div
                          onClick={() => toggleSettingCard('el_caption')}
                          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                        >
                          <div className="flex items-center space-x-1.5">
                            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Slide Caption & Navigation</span>
                          </div>
                          {openSettingCards.el_caption !== false ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        {openSettingCards.el_caption !== false && (
                          <div className="space-y-3 pt-1">
                            {/* Caption Text Color */}
                            <ModernColorPicker
                              label="Caption / Subtext Color"
                              value={selectedElement.styles?.descColor || '#cbd5e1'}
                              onChange={(color) => updateElementStyles(selectedElement.id, { descColor: color })}
                            />

                            {/* Caption Font Size */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-600">Caption Font Size</label>
                              <div className="grid grid-cols-5 gap-1">
                                {['11px', '12px', '13px', '14px', '16px'].map((sz) => (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() => updateElementStyles(selectedElement.id, { descFontSize: sz })}
                                    className={`py-1 text-[10px] font-mono font-bold rounded border transition-colors cursor-pointer ${
                                      (selectedElement.styles?.descFontSize || '13px') === sz
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Navigation Arrow Background Color */}
                            <ModernColorPicker
                              label="Navigation Arrow Background"
                              value={selectedElement.styles?.arrowBgColor || 'rgba(15, 23, 42, 0.75)'}
                              onChange={(color) => updateElementStyles(selectedElement.id, { arrowBgColor: color })}
                            />

                            {/* Navigation Arrow Icon Color */}
                            <ModernColorPicker
                              label="Navigation Arrow Icon Color"
                              value={selectedElement.styles?.arrowColor || '#ffffff'}
                              onChange={(color) => updateElementStyles(selectedElement.id, { arrowColor: color })}
                            />

                            {/* Active Dot / Indicator Color */}
                            <ModernColorPicker
                              label="Active Dot / Indicator Color"
                              value={selectedElement.styles?.dotActiveColor || '#6366f1'}
                              onChange={(color) => updateElementStyles(selectedElement.id, { dotActiveColor: color })}
                            />

                            {/* Inactive Dot Color */}
                            <ModernColorPicker
                              label="Inactive Dot / Indicator Color"
                              value={selectedElement.styles?.dotColor || 'rgba(255, 255, 255, 0.4)'}
                              onChange={(color) => updateElementStyles(selectedElement.id, { dotColor: color })}
                            />

                            {/* Navigation Arrow Border Color */}
                            <ModernColorPicker
                              label="Navigation Arrow Border Color"
                              value={selectedElement.styles?.arrowBorderColor || 'rgba(255, 255, 255, 0.2)'}
                              onChange={(color) => updateElementStyles(selectedElement.id, { arrowBorderColor: color })}
                            />

                            {/* Navigation Arrow Opacity */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-slate-700">Navigation Arrow Opacity</span>
                                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                  {Math.round((Number(selectedElement.styles?.arrowOpacity ?? selectedElement.content?.arrowOpacity ?? 1)) * 100)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.05"
                                value={selectedElement.styles?.arrowOpacity ?? selectedElement.content?.arrowOpacity ?? 1}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  updateElementStyles(selectedElement.id, { arrowOpacity: val });
                                  updateElementContent(selectedElement.id, { arrowOpacity: val });
                                }}
                                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                              />
                              <div className="grid grid-cols-5 gap-1">
                                {[1, 0.8, 0.6, 0.4, 0.2].map((op) => {
                                  const cur = Number(selectedElement.styles?.arrowOpacity ?? selectedElement.content?.arrowOpacity ?? 1);
                                  const isSel = Math.abs(cur - op) < 0.05;
                                  return (
                                    <button
                                      key={op}
                                      type="button"
                                      onClick={() => {
                                        updateElementStyles(selectedElement.id, { arrowOpacity: op });
                                        updateElementContent(selectedElement.id, { arrowOpacity: op });
                                      }}
                                      className={`py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                                        isSel
                                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      {Math.round(op * 100)}%
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Navigation Dots Opacity */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-slate-700">Navigation Dots Opacity</span>
                                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                  {Math.round((Number(selectedElement.styles?.dotsOpacity ?? selectedElement.content?.dotsOpacity ?? 1)) * 100)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.05"
                                value={selectedElement.styles?.dotsOpacity ?? selectedElement.content?.dotsOpacity ?? 1}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  updateElementStyles(selectedElement.id, { dotsOpacity: val });
                                  updateElementContent(selectedElement.id, { dotsOpacity: val });
                                }}
                                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                              />
                              <div className="grid grid-cols-5 gap-1">
                                {[1, 0.8, 0.6, 0.4, 0.2].map((op) => {
                                  const cur = Number(selectedElement.styles?.dotsOpacity ?? selectedElement.content?.dotsOpacity ?? 1);
                                  const isSel = Math.abs(cur - op) < 0.05;
                                  return (
                                    <button
                                      key={op}
                                      type="button"
                                      onClick={() => {
                                        updateElementStyles(selectedElement.id, { dotsOpacity: op });
                                        updateElementContent(selectedElement.id, { dotsOpacity: op });
                                      }}
                                      className={`py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                                        isSel
                                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      {Math.round(op * 100)}%
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Box Shadow */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-600">Frame Shadow</label>
                              <select
                                value={selectedElement.styles?.shadow || 'none'}
                                onChange={(e) => updateElementStyles(selectedElement.id, { shadow: e.target.value === 'none' ? undefined : e.target.value })}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                              >
                                <option value="none">None</option>
                                <option value="0 1px 2px 0 rgba(0, 0, 0, 0.05)">Small (sm)</option>
                                <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)">Medium (md)</option>
                                <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)">Large (lg)</option>
                                <option value="0 20px 25px -5px rgba(0, 0, 0, 0.15)">Extra Large (xl)</option>
                                <option value="0 25px 50px -12px rgba(0, 0, 0, 0.25)">2X Large (2xl)</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dedicated Opacity & Transparency Card for Images and Carousels */}
                    {(selectedElement.type === 'image' || selectedElement.type === 'imagebox' || selectedElement.type === 'carousel' || selectedElement.type === 'mediacarousel') && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                        <div
                          onClick={() => toggleSettingCard('el_opacity')}
                          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                        >
                          <div className="flex items-center space-x-1.5">
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Opacity & Transparency</span>
                          </div>
                          {openSettingCards.el_opacity !== false ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        {openSettingCards.el_opacity !== false && (
                          <div className="space-y-3 pt-1">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-slate-700">Element Opacity</span>
                                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                  {Math.round((Number(selectedElement.styles?.opacity ?? selectedElement.content?.opacity ?? 1)) * 100)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={selectedElement.styles?.opacity ?? selectedElement.content?.opacity ?? 1}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  updateElementStyles(selectedElement.id, { opacity: val });
                                  updateElementContent(selectedElement.id, { opacity: val });
                                }}
                                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                              />
                              <div className="grid grid-cols-5 gap-1 pt-1">
                                {[1, 0.85, 0.7, 0.5, 0.25].map((op) => {
                                  const cur = Number(selectedElement.styles?.opacity ?? selectedElement.content?.opacity ?? 1);
                                  const isSel = Math.abs(cur - op) < 0.05;
                                  return (
                                    <button
                                      key={op}
                                      type="button"
                                      onClick={() => {
                                        updateElementStyles(selectedElement.id, { opacity: op });
                                        updateElementContent(selectedElement.id, { opacity: op });
                                      }}
                                      className={`py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                                        isSel
                                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      {Math.round(op * 100)}%
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
            </div>
          )}

            {/* --------------------------------------------------------------------- */}
            {/* TAB 3: ADVANCED & LAYOUT TAB (Borders, Margins, Padding) */}
            {/* --------------------------------------------------------------------- */}
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                {/* Sticky Navigation Settings moved to Advanced */}
                {selectedElement.type === 'navigation' && (
                  <NavigationStickyControls
                    selectedElement={selectedElement}
                    sections={sections}
                    updateElementStyles={updateElementStyles}
                    updateElementContent={updateElementContent}
                    updateSectionStyles={updateSectionStyles}
                  />
                )}

                {/* 4-Sided Padding, 4-Sided Margin, Spacing (Gap) and Layer (Z-Index) */}
                <AdvancedSpacingControls
                  styles={selectedElement.styles || {}}
                  onUpdateStyles={(newStyles) => updateElementStyles(selectedElement.id, newStyles)}
                  showGap={true}
                  showZIndex={true}
                />

                {/* CSS ID & Anchor */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-700">CSS ID / Anchor</label>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold">#id</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. hero-title, feature-box"
                    value={selectedElement.styles?.customId || ''}
                    onChange={(e) => {
                      const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
                      updateElementStyles(selectedElement.id, { customId: clean });
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Target this element with anchor links e.g. <span className="font-mono text-indigo-500">#{selectedElement.styles?.customId || 'id'}</span> or custom CSS.
                  </p>
                </div>

                {/* Custom CSS Class */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                  <label className="text-[11px] font-semibold text-slate-700">Custom CSS Class</label>
                  <input
                    type="text"
                    placeholder="e.g. shadow-2xl animate-pulse"
                    value={selectedElement.styles?.customClass || ''}
                    onChange={(e) => updateElementStyles(selectedElement.id, { customClass: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
