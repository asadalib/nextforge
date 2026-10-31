import React, { useState, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import { AVAILABLE_ICONS, ICON_CATEGORIES, IconCategory, getLucideIcon } from './iconRegistry';

interface IconSelectorProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

export default function IconSelector({ value, onChange, label = 'Icon Shape' }: IconSelectorProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<IconCategory>('All');

  const selectedKey = (value || 'star').toLowerCase().trim();
  const SelectedIcon = getLucideIcon(selectedKey);

  const selectedItem = useMemo(() => {
    return AVAILABLE_ICONS.find((item) => item.name === selectedKey) || {
      name: selectedKey,
      label: selectedKey.charAt(0).toUpperCase() + selectedKey.slice(1),
      category: 'Essentials' as const,
      icon: SelectedIcon
    };
  }, [selectedKey, SelectedIcon]);

  const filteredIcons = useMemo(() => {
    const q = search.toLowerCase().trim();
    return AVAILABLE_ICONS.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return item.name.toLowerCase().includes(q) || item.label.toLowerCase().includes(q);
    });
  }, [search, activeCategory]);

  return (
    <div className="space-y-2.5">
      {/* 1. Header with Selected Icon Badge */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-slate-700">{label}</label>
        <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700">
          <SelectedIcon className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[11px] font-bold font-mono capitalize">{selectedItem.label || selectedKey}</span>
        </div>
      </div>

      {/* 2. Live Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${AVAILABLE_ICONS.length}+ icons (e.g. heart, cloud, code)...`}
          className="w-full pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg text-xs text-slate-800 focus:outline-none transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 nextforge-scrollbar scrollbar-none">
        {ICON_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 4. Scrollable Icon Grid */}
      <div className="border border-slate-200/90 rounded-xl bg-slate-50/70 p-2 max-h-52 overflow-y-auto nextforge-scrollbar">
        {filteredIcons.length === 0 ? (
          <div className="py-6 text-center text-slate-400">
            <p className="text-xs font-semibold">No icons matching "{search}"</p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setActiveCategory('All');
              }}
              className="mt-2 px-2.5 py-1 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
            >
              Reset Search & Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-1.5">
            {filteredIcons.map((item) => {
              const IconC = item.icon;
              const isChosen = selectedKey === item.name.toLowerCase();
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => onChange(item.name)}
                  className={`h-9 rounded-lg border flex flex-col items-center justify-center transition-all group relative cursor-pointer ${
                    isChosen
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105 z-10'
                      : 'bg-white hover:bg-indigo-50/60 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600'
                  }`}
                  title={`${item.label} (${item.name})`}
                >
                  <IconC className={`w-4 h-4 transition-transform group-hover:scale-110 ${isChosen ? 'text-white' : ''}`} />
                  {isChosen && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center shadow-xs">
                      <Check className="w-2 h-2 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
        <span>Showing {filteredIcons.length} of {AVAILABLE_ICONS.length} icons</span>
        <span className="font-mono text-indigo-600 font-bold">{selectedItem.name}</span>
      </div>
    </div>
  );
}
