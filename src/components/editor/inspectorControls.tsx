import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  type LucideIcon,
} from 'lucide-react';

/**
 * Shared compact, icon-based chrome for the inspector panels.
 *
 * These components are PRESENTATION ONLY: they render the same values and
 * fire the same onChange callbacks as the verbose controls they replace.
 * No store keys or behaviour live here.
 */

/* ------------------------------------------------------------------ */
/* CollapseGroup — collapsible group with an icon-headed compact row.  */
/* Supports controlled mode (open + onToggle, wired to the existing   */
/* openSettingCards state) and uncontrolled mode (defaultOpen prop).   */
/* ------------------------------------------------------------------ */
export interface CollapseGroupProps {
  icon: LucideIcon;
  title: string;
  /** Uncontrolled initial state. Ignored when `open` is provided. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Controlled toggle handler. */
  onToggle?: () => void;
  /** Optional small badge / value shown at the right of the header. */
  badge?: React.ReactNode;
  children: React.ReactNode;
}

export function CollapseGroup({
  icon: Icon,
  title,
  defaultOpen = false,
  open,
  onToggle,
  badge,
  children,
}: CollapseGroupProps) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const isOpen = open !== undefined ? open : localOpen;
  const handleToggle = () => {
    if (onToggle) onToggle();
    if (open === undefined) setLocalOpen((v) => !v);
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        title={title}
        className="w-full flex items-center justify-between px-2.5 py-1.5 text-left cursor-pointer select-none hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center space-x-1.5 min-w-0">
          <Icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="text-[11px] font-bold text-slate-800 truncate">{title}</span>
        </span>
        <span className="flex items-center space-x-1.5 shrink-0">
          {badge}
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          )}
        </span>
      </button>
      {isOpen && <div className="px-2.5 pb-2.5 pt-1 space-y-2.5 border-t border-slate-100">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* IconTabs — compact icon tab bar. Each tab is an icon with a tiny   */
/* label underneath, plus title/aria-label for meaning.               */
/* ------------------------------------------------------------------ */
export interface IconTabDef<T extends string = string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

export function IconTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: IconTabDef<T>[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div
      className="grid p-1 bg-slate-100/70 border-b border-slate-200 shrink-0 gap-1"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      role="tablist"
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={label}
            title={label}
            onClick={() => onChange(id)}
            className={`py-1 rounded-lg transition-all flex flex-col items-center justify-center gap-0 cursor-pointer ${
              isActive ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold leading-tight">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AlignGroup — text-align as an icon-only button group.              */
/* Values are exactly 'left' | 'center' | 'right' | 'justify'.        */
/* ------------------------------------------------------------------ */
const ALIGN_OPTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'left', label: 'Left', icon: AlignLeft },
  { id: 'center', label: 'Center', icon: AlignCenter },
  { id: 'right', label: 'Right', icon: AlignRight },
  { id: 'justify', label: 'Justify', icon: AlignJustify },
];

export function AlignGroup({
  value,
  onChange,
  includeJustify = true,
}: {
  value?: string;
  onChange: (value: string) => void;
  includeJustify?: boolean;
}) {
  const current = value || 'left';
  const options = includeJustify ? ALIGN_OPTIONS : ALIGN_OPTIONS.slice(0, 3);
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      role="group"
      aria-label="Text align"
    >
      {options.map(({ id, label, icon: Icon }) => {
        const isActive = current === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            title={`Align ${label}`}
            aria-label={`Align ${label}`}
            aria-pressed={isActive}
            className={`py-1.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              isActive
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CompactToggle — small switch for a boolean setting. Renders the    */
/* optional leading icon + tiny label and a pill switch.              */
/* ------------------------------------------------------------------ */
export function CompactToggle({
  checked,
  onChange,
  label,
  icon: Icon,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-700">
        {Icon && <Icon className="w-3.5 h-3.5 text-indigo-600" />}
        {label && <span>{label}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label || 'Toggle'}
        title={label || 'Toggle'}
        onClick={() => onChange(!checked)}
        className={`relative w-8 h-[18px] rounded-full transition-colors cursor-pointer shrink-0 ${
          checked ? 'bg-indigo-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow transition-all ${
            checked ? 'left-[16px]' : 'left-[2px]'
          }`}
        />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PresetChips — a wrapping row of small chips for a 1:1 preset set.  */
/* ------------------------------------------------------------------ */
export function PresetChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string; icon?: LucideIcon }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1" role="group">
      {options.map(({ id, label, icon: Icon }) => {
        const isActive = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            title={label}
            aria-label={label}
            aria-pressed={isActive}
            className={`px-2 py-1 text-[10px] font-bold rounded-lg border flex items-center space-x-1 transition-all cursor-pointer ${
              isActive
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            {Icon && <Icon className="w-3 h-3" />}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default CollapseGroup;
