import React, { useState } from 'react';
import {
  AlertCircle, ArrowRight, BarChart2, Bell, Box, CheckSquare, Columns,
  CreditCard, DollarSign, FileText, Grid, HelpCircle, Image,
  Images, Info, Layers, Layout, LayoutGrid, List, Mail, MapPin, MessageSquare,
  Play, Plus, Search, Shield, Sliders, Smartphone, Star, Table, Tag, Type,
  User, Users, Video, Zap, Music, Sparkles, MousePointer2, AlignJustify, Globe,
  Clock, Repeat, Share2, History
} from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { WidgetType } from '../../types/builder';

export default function LeftSidebar() {
  const [activeTab, setActiveTab] = useState<'elements' | 'layout' | 'global'>('elements');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    addSection,
    addSectionWithElement,
    sections,
    globalSections,
    insertGlobalSection,
    addElementToColumn,
    selectedSectionId,
    applyLayoutPresetToSection
  } = useBuilderStore();

  // Custom H1 icon matching screenshot
  function H1Icon() {
    return (
      <span className="font-extrabold text-base leading-none text-indigo-600 group-hover:scale-110 transition-transform">
        H<sub className="text-[10px] font-black -bottom-0.5">1</sub>
      </span>
    );
  }

  // Matching screenshot media_1789013502340.png
  const allWidgets: { type: WidgetType; label: string; icon: any }[] = [
    { type: 'innerrow', label: 'Inner row', icon: Columns },
    { type: 'heading', label: 'CSS grid', icon: AlignJustify },
    { type: 'heading', label: 'Heading', icon: H1Icon },
    { type: 'typewriterheadline', label: 'Animated heading', icon: Sparkles },
    { type: 'text', label: 'Text editor', icon: Type },
    { type: 'button', label: 'Button', icon: MousePointer2 },
    { type: 'image', label: 'Image', icon: Image },
    { type: 'imagebox', label: 'Image box', icon: AlignJustify },
    { type: 'carousel', label: 'Image carousel', icon: AlignJustify },
    { type: 'mediacarousel', label: 'Media carousel', icon: AlignJustify },
    { type: 'gallery', label: 'Gallery', icon: AlignJustify },
    { type: 'beforeafter', label: 'Before / after', icon: Sliders },
    { type: 'video', label: 'Video', icon: Video },
    { type: 'video', label: 'Video playlist', icon: AlignJustify },
    { type: 'icon', label: 'SoundCloud', icon: AlignJustify },
    { type: 'lottie', label: 'Lottie animation', icon: Play },
    { type: 'icon', label: 'Icon', icon: AlignJustify },
    { type: 'iconbox', label: 'Icon box', icon: AlignJustify },
    { type: 'badge', label: 'Badge', icon: AlignJustify },
    { type: 'contentcard', label: 'Content card', icon: AlignJustify },
    { type: 'alert', label: 'Alert', icon: AlertCircle },
    { type: 'iconlist', label: 'Icon list', icon: List },
    { type: 'counter', label: 'Counter', icon: BarChart2 },
    { type: 'testimonial', label: 'Testimonial', icon: MessageSquare },
    { type: 'flipbox', label: 'Flip box', icon: Zap },
    { type: 'tabs', label: 'Tabs', icon: Sliders },
    { type: 'accordion', label: 'Accordion', icon: HelpCircle },
    { type: 'pricingcard', label: 'Pricing card', icon: DollarSign },
    { type: 'teammember', label: 'Team member', icon: User },
    { type: 'logocloud', label: 'Logo cloud', icon: Users },
    { type: 'cta', label: 'Call to action', icon: ArrowRight },
    { type: 'contactdetails', label: 'Contact details', icon: Mail },
    { type: 'form', label: 'Form', icon: CheckSquare },
    { type: 'map', label: 'Map', icon: MapPin },
    { type: 'spacer', label: 'Spacer', icon: Sliders },
    { type: 'divider', label: 'Divider', icon: Sliders },
    { type: 'table', label: 'Table', icon: Table },
    { type: 'search', label: 'Search', icon: Search },
    { type: 'marquee', label: 'Marquee', icon: Repeat },
    { type: 'processsteps', label: 'Process steps', icon: Layers },
    { type: 'skillbar', label: 'Skill bars', icon: BarChart2 },
    { type: 'countdown', label: 'Countdown', icon: Clock },
    { type: 'socialicons', label: 'Social icons', icon: Share2 },
    { type: 'rating', label: 'Rating', icon: Star },
    { type: 'timeline', label: 'Timeline', icon: History },
    { type: 'typewriterheadline', label: 'Typewriter headline', icon: Type },
    { type: 'posts', label: 'Posts', icon: FileText },
    { type: 'portfolio', label: 'Portfolio', icon: LayoutGrid },
    { type: 'collection', label: 'Collection', icon: CreditCard }
  ];

  const filteredWidgets = allWidgets.filter((w) =>
    w.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Exactly matching all 12 presets in media_1789013474828.png
  const layoutPresets = [
    {
      id: 'container',
      label: 'Container',
      bars: ['w-full'],
      renderIcon: () => (
        <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      )
    },
    {
      id: 'two-equal',
      label: 'Two equal',
      bars: ['w-1/2', 'w-1/2'],
      renderIcon: () => (
        <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="12" y1="3" x2="12" y2="21" />
        </svg>
      )
    },
    {
      id: 'three-equal',
      label: 'Three equal',
      bars: ['w-1/3', 'w-1/3', 'w-1/3'],
      renderIcon: () => (
        <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      )
    },
    {
      id: 'four-equal',
      label: 'Four equal',
      bars: ['w-1/4', 'w-1/4', 'w-1/4', 'w-1/4'],
      renderIcon: () => (
        <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="7.5" y1="3" x2="7.5" y2="21" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="16.5" y1="3" x2="16.5" y2="21" />
        </svg>
      )
    },
    {
      id: 'sidebar-left',
      label: 'Sidebar left',
      bars: ['w-[30%]', 'w-[70%]'],
      renderIcon: () => (
        <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    },
    {
      id: 'sidebar-right',
      label: 'Sidebar right',
      bars: ['w-[70%]', 'w-[30%]'],
      renderIcon: () => (
        <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    },
    {
      id: 'wide-left',
      label: 'Wide left',
      bars: ['w-[65%]', 'w-[35%]'],
      renderIcon: () => (
        <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      )
    },
    {
      id: 'wide-right',
      label: 'Wide right',
      bars: ['w-[35%]', 'w-[65%]'],
      renderIcon: () => (
        <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      )
    },
    {
      id: 'center-focus',
      label: 'Center focus',
      bars: ['w-[25%]', 'w-[50%]', 'w-[25%]'],
      renderIcon: () => (
        <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="7" y1="3" x2="7" y2="21" />
          <line x1="17" y1="3" x2="17" y2="21" />
        </svg>
      )
    },
    {
      id: 'wide-center',
      label: 'Wide center',
      bars: ['w-[20%]', 'w-[60%]', 'w-[20%]'],
      renderIcon: () => (
        <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="6" y1="3" x2="6" y2="21" />
          <line x1="18" y1="3" x2="18" y2="21" />
        </svg>
      )
    },
    {
      id: 'five-columns',
      label: 'Five columns',
      bars: ['w-[20%]', 'w-[20%]', 'w-[20%]', 'w-[20%]', 'w-[20%]'],
      renderIcon: () => (
        <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="6.6" y1="3" x2="6.6" y2="21" />
          <line x1="10.2" y1="3" x2="10.2" y2="21" />
          <line x1="13.8" y1="3" x2="13.8" y2="21" />
          <line x1="17.4" y1="3" x2="17.4" y2="21" />
        </svg>
      )
    },
    {
      id: 'six-columns',
      label: 'Six columns',
      bars: ['w-[16.66%]', 'w-[16.66%]', 'w-[16.66%]', 'w-[16.66%]', 'w-[16.66%]', 'w-[16.7%]'],
      renderIcon: () => (
        <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="6" y1="3" x2="6" y2="21" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
          <line x1="18" y1="3" x2="18" y2="21" />
        </svg>
      )
    }
  ];

  const handleWidgetClick = (widgetType: WidgetType) => {
    if (sections.length === 0) {
      addSectionWithElement('container', 0, widgetType);
      return;
    }
    const targetSec = sections[sections.length - 1] || sections[0];
    if (targetSec && targetSec.columns[0]) {
      addElementToColumn(targetSec.id, targetSec.columns[0].id, widgetType);
    }
  };

  return (
    <aside className="w-[240px] bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden select-none z-30 shadow-xs shrink-0">
      {/* Top Pill Tabs Switcher */}
      <div className="p-2 pb-1 shrink-0">
        <div className="bg-[#edf2f7] p-1 rounded-xl grid grid-cols-3 gap-1">
          <button
            onClick={() => setActiveTab('elements')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'elements'
                ? 'bg-white text-indigo-600 border border-slate-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Elements</span>
          </button>

          <button
            onClick={() => setActiveTab('layout')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'layout'
                ? 'bg-white text-indigo-600 border border-slate-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-3 h-3 text-indigo-600" />
            <span>Layout</span>
          </button>

          <button
            onClick={() => setActiveTab('global')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'global'
                ? 'bg-white text-emerald-600 border border-emerald-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3 h-3 text-emerald-600" />
            <span>Global</span>
          </button>
        </div>
      </div>

      {/* Helper text */}
      <div className="px-3 py-1 text-xs text-slate-500 font-normal shrink-0 truncate">
        {activeTab === 'elements'
          ? 'Drag element into column'
          : activeTab === 'layout'
          ? 'Drag structure into section'
          : 'Click to insert reusable global section'}
      </div>

      {/* Scrollable Container */}
      <div className="p-2.5 overflow-y-auto flex-1 min-h-0 nextforge-scrollbar">
        {/* ELEMENTS TAB GRID: height 75% (72px) and width 80% */}
        {activeTab === 'elements' && (
          <div className="grid grid-cols-2 gap-2 pb-8">
            {filteredWidgets.map((w, idx) => {
              const IconComp = w.icon;
              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', w.type);
                    e.dataTransfer.effectAllowed = 'all';
                  }}
                  onClick={() => handleWidgetClick(w.type)}
                  className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-400 hover:shadow-md text-slate-700 hover:text-indigo-600 transition-all group cursor-grab active:cursor-grabbing select-none h-[72px] min-h-[72px] shadow-xs"
                >
                  <div className="h-5 flex items-center justify-center mb-1 pointer-events-none">
                    <IconComp className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform pointer-events-none" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 group-hover:text-indigo-600 truncate max-w-full text-center leading-tight pointer-events-none px-0.5">
                    {w.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* LAYOUT TAB GRID (Matching presets, scaled proportionally) */}
        {activeTab === 'layout' && (
          <div className="grid grid-cols-2 gap-2 pb-8">
            {layoutPresets.map((preset) => (
              <div
                key={preset.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/nextforge-layout', preset.id);
                  e.dataTransfer.setData('text/plain', `layout:${preset.id}`);
                  e.dataTransfer.effectAllowed = 'all';
                }}
                onClick={() => {
                  if (selectedSectionId) {
                    applyLayoutPresetToSection(selectedSectionId, preset.id);
                  } else {
                    addSection(preset.id);
                  }
                }}
                className="bg-white border border-slate-200/90 hover:border-indigo-400 rounded-xl p-2 flex flex-col items-center justify-between text-center min-h-[78px] h-[78px] shadow-xs hover:shadow-md cursor-pointer transition-all group select-none"
              >
                {/* Outline Icon */}
                <div className="h-5 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {preset.renderIcon()}
                </div>

                {/* Preset Title */}
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors mt-0.5 truncate max-w-full">
                  {preset.label}
                </span>

                {/* Mini Proportional Bars */}
                <div className="w-full flex items-center gap-1 mt-1 px-0.5">
                  {preset.bars.map((bar, bi) => (
                    <div
                      key={bi}
                      className={`${bar} h-2.5 bg-[#e0e7ff] border border-[#c7d2fe]/70 rounded-[2px] group-hover:bg-indigo-200 transition-colors`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GLOBAL DYNAMIC SECTIONS TAB */}
        {activeTab === 'global' && (
          <div className="space-y-2.5 pb-8">
            {Object.keys(globalSections || {}).length === 0 ? (
              <div className="p-5 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Globe className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">No Global Sections Yet</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Select any section on your page and click &ldquo;Make Dynamic Global Component&rdquo; in the inspector to reuse it anywhere.
                </p>
              </div>
            ) : (
              Object.entries(globalSections).map(([globalId, sec]) => (
                <div
                  key={globalId}
                  onClick={() => insertGlobalSection(globalId)}
                  className="p-3 bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-400 rounded-xl cursor-pointer shadow-xs hover:shadow-md transition-all group"
                  title="Click to insert this dynamic component into the active page"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate max-w-[130px]">
                      {sec.name}
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-full flex items-center space-x-1 shrink-0">
                      <Globe className="w-2.5 h-2.5" />
                      <span>DYNAMIC</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                    <span>{sec.columns?.length || 1} col(s)</span>
                    <span className="text-emerald-600 font-bold group-hover:underline flex items-center space-x-0.5">
                      <Plus className="w-3 h-3" />
                      <span>Insert</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>

  );
}
