import React, { useState, useRef } from 'react';
import {
  ChevronDown, ChevronRight, ChevronUp, Box, Sliders, Columns,
  Layers, Plus, Copy, Trash2, Hash, Pin, Globe, ClipboardCopy,
  Sparkles, LayoutGrid, Check, Upload, Image as ImageIcon, Eye,
  StretchHorizontal, Maximize2, Minimize2, AlignLeft, AlignCenter, AlignRight, MoveVertical
} from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { ElementStyles, SectionModel } from '../../types/builder';
import ModernColorPicker from './ModernColorPicker';
import AdvancedSpacingControls from './AdvancedSpacingControls';
import { AlignGroup } from './inspectorControls';

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

interface SectionInspectorProps {
  selectedSection: SectionModel;
  sectionTab: 'layout' | 'styling' | 'advanced';
  setSectionTab: (tab: 'layout' | 'styling' | 'advanced') => void;
  targetScope: 'section' | 'row' | 'column';
  setTargetScope: (scope: 'section' | 'row' | 'column') => void;
  openSettingCards: Record<string, boolean>;
  toggleSettingCard: (cardKey: string) => void;
}

export default function SectionInspector({
  selectedSection,
  sectionTab,
  setSectionTab,
  targetScope,
  setTargetScope,
  openSettingCards,
  toggleSettingCard
}: SectionInspectorProps) {
  const {
    sections,
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
    addColumn,
    deleteColumn,
    duplicateColumn,
    updateColumnWidth,
    applyLayoutPresetToSection,
    renameSection,
    setSectionCustomId,
    makeSectionDynamic,
    detachDynamicSection,
    copySection
  } = useBuilderStore();

  const [bgMode, setBgMode] = useState<'color' | 'gradient' | 'image'>('color');
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  // Rows and Columns hierarchy
  const secRows = selectedSection.rows && selectedSection.rows.length > 0
    ? selectedSection.rows
    : [{ id: `${selectedSection.id}-row-0`, columns: selectedSection.columns }];
  const activeRowIdx = Math.max(0, secRows.findIndex((r) => r.id === selectedRowId));
  const currentRow = secRows[activeRowIdx] || secRows[0];
  const currentRowId = currentRow.id;
  const currentRowNum = activeRowIdx + 1;

  const rowCols = currentRow.columns || [];
  const activeColIdx = Math.max(0, rowCols.findIndex((c) => c.id === selectedColumnId));
  const currentCol = rowCols[activeColIdx] || rowCols[0];
  const currentColId = currentCol?.id;
  const currentColNum = activeColIdx + 1;

  React.useEffect(() => {
    if (!selectedRowId && !selectedColumnId) {
      setTargetScope('section');
    }
  }, [selectedRowId, selectedColumnId, setTargetScope]);

  // Active styles based on targetScope
  const getTargetStyles = (): ElementStyles => {
    if (targetScope === 'row' && selectedRowId) return currentRow.styles || {};
    if (targetScope === 'column' && selectedColumnId) return currentCol?.styles || {};
    return selectedSection.styles || {};
  };

  const targetStyles = getTargetStyles();

  // Update styles safely targeting Section, Row, or Column
  const updateTargetStyles = (styles: Partial<ElementStyles>) => {
    if (targetScope === 'row' && selectedRowId) {
      updateRowStyles(selectedSection.id, currentRowId, styles);
    } else if (targetScope === 'column' && selectedColumnId && currentColId) {
      updateColumnStyles(selectedSection.id, currentColId, styles);
    } else {
      updateSectionStyles(selectedSection.id, styles);
    }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateTargetStyles({ bgImage: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getNumericValue = (val?: string | number, fallback = 0): number => {
    if (val === undefined || val === null) return fallback;
    const num = parseInt(String(val).replace(/[^0-9-]/g, ''));
    return isNaN(num) ? fallback : num;
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={bgFileInputRef}
        onChange={handleBgUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Target Scope Switcher: Section | Row | Column */}
      <div className="bg-slate-100/90 border border-slate-200/90 p-1.5 rounded-xl flex items-center justify-between shadow-2xs">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider pl-1">Target:</span>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => {
              setTargetScope('section');
              setSelectedRowId(null);
              setSelectedColumnId(null);
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 ${
              targetScope === 'section'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
            title="Target the whole Section container"
          >
            <Box className="w-3 h-3" />
            <span>Section</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetScope('row');
              setSelectedRowId(currentRowId);
              setSelectedColumnId(null);
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 ${
              targetScope === 'row'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
            title={`Target Row ${currentRowNum}`}
          >
            <Sliders className="w-3 h-3" />
            <span>Row {currentRowNum}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetScope('column');
              setSelectedRowId(currentRowId);
              setSelectedColumnId(currentColId || null);
            }}
            disabled={!currentCol}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 ${
              targetScope === 'column'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 disabled:opacity-40'
            }`}
            title={currentCol ? `Target Column ${currentColNum}` : 'No column in row'}
          >
            <Columns className="w-3 h-3" />
            <span>Col {currentColNum}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LAYOUT & SPACING */}
      {/* ========================================================================= */}
      {sectionTab === 'layout' && (
        <div className="space-y-4">
          {/* A. If Target is Section: Show Structure Presets, Rows list, Spacing */}
          {targetScope === 'section' && (
            <>
              {/* Structure Presets */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                <div
                  onClick={() => toggleSettingCard('sec_presets')}
                  className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                >
                  <span className="flex items-center space-x-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Structure Presets</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-normal">Click to apply</span>
                    {openSettingCards.sec_presets !== false ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {openSettingCards.sec_presets !== false && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {SECTION_STRUCTURE_PRESETS.map((preset) => {
                      const isMatch =
                        selectedSection.columns.length === preset.cols.length &&
                        preset.cols.every(
                          (w, i) => Math.abs((selectedSection.columns[i]?.widthPercentage || 0) - w) < 2
                        );

                      return (
                        <button
                          key={preset.id}
                          onClick={() => applyLayoutPresetToSection(selectedSection.id, preset.id)}
                          className={`p-2 rounded-xl border text-left transition-all group flex flex-col justify-between ${
                            isMatch
                              ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/20'
                              : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/80'
                          }`}
                        >
                          <div className="flex items-center space-x-1 w-full h-4 mb-2 bg-slate-100 p-0.5 rounded-md">
                            {preset.cols.map((colW, idx) => (
                              <div
                                key={idx}
                                style={{ width: `${colW}%` }}
                                className={`h-full rounded-xs transition-colors ${
                                  isMatch ? 'bg-indigo-600' : 'bg-slate-300 group-hover:bg-indigo-400'
                                }`}
                              />
                            ))}
                          </div>
                          <div>
                            <div className="flex items-center justify-between">
                              <span className={`text-[11px] font-bold ${isMatch ? 'text-indigo-700' : 'text-slate-700'}`}>
                                {preset.label}
                              </span>
                              {isMatch && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                            </div>
                            <span className="text-[10px] text-slate-400 block">{preset.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Rows in Container & Grid Management */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                <div
                  onClick={() => toggleSettingCard('sec_rows')}
                  className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Rows in Container ({secRows.length})</span>
                  </div>
                  {openSettingCards.sec_rows !== false ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {openSettingCards.sec_rows !== false && (
                  <div className="space-y-3 pt-1">
                    <div className="space-y-2">
                      {secRows.map((row, rIdx) => {
                        const isSelected = selectedRowId === row.id || (secRows.length === 1 && !selectedRowId);
                        return (
                          <div
                            key={row.id}
                            onClick={() => {
                              setSelectedRowId(row.id);
                              setTargetScope('row');
                            }}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-50/50 shadow-2xs ring-1 ring-indigo-400/20'
                                : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className={`text-[11px] font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                  Row {rIdx + 1}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  ({row.columns.length} col{row.columns.length > 1 ? 's' : ''})
                                </span>
                                {isSelected && (
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                                    Selected
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateRowInSection(selectedSection.id, row.id);
                                  }}
                                  className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-200 transition-colors flex items-center space-x-1 shadow-2xs cursor-pointer"
                                  title={`Duplicate Row ${rIdx + 1} (Ctrl+D)`}
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                  <span>Duplicate</span>
                                </button>
                                {secRows.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteRowFromSection(selectedSection.id, row.id);
                                    }}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-lg text-[10px] font-bold border border-rose-200 transition-colors flex items-center space-x-1 shadow-2xs cursor-pointer"
                                    title={`Delete Row ${rIdx + 1}`}
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                    <span>Delete</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-1 w-full h-2 mt-2 bg-white p-0.5 rounded border border-slate-200/80">
                              {row.columns.map((c, ci) => (
                                <div
                                  key={ci}
                                  style={{ width: `${c.widthPercentage}%` }}
                                  className={`h-full rounded-2xs ${isSelected ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                  title={`Col ${ci + 1}: ${c.widthPercentage}%`}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        + Add Row to Container
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'container', label: '1 Col' },
                          { id: 'two-equal', label: '2 Col' },
                          { id: 'three-equal', label: '3 Col' },
                          { id: 'four-equal', label: '4 Col' },
                          { id: 'sidebar-left', label: '30 / 70' },
                          { id: 'sidebar-right', label: '70 / 30' }
                        ].map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => addRowToSection(selectedSection.id, preset.id)}
                            className="py-1.5 px-2 text-[10px] font-bold text-indigo-600 hover:text-white bg-indigo-50/70 hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 rounded-lg transition-all flex items-center justify-center space-x-1 active:scale-95 shadow-2xs cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Column Gap */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                <div
                  onClick={() => toggleSettingCard('sec_spacing')}
                  className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                >
                  <span>Column Spacing (Gap)</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-normal">Gutter between columns</span>
                    {openSettingCards.sec_spacing !== false ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
                {openSettingCards.sec_spacing !== false && (
                  <div className="space-y-1 pt-1">
                    <div className="grid grid-cols-5 gap-1">
                      {['0px', '8px', '16px', '24px', '32px'].map((gap) => (
                        <button
                          key={gap}
                          type="button"
                          onClick={() => updateSectionStyles(selectedSection.id, { columnGap: gap })}
                          className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                            (selectedSection.styles?.columnGap || '16px') === gap
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                          }`}
                        >
                          {gap}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Content Vertical Alignment & Section Height */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
                <div
                  onClick={() => toggleSettingCard('sec_valign')}
                  className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center space-x-1.5">
                    <MoveVertical className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Content Vertical Alignment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-indigo-600 font-bold capitalize">
                      {selectedSection.styles?.contentVerticalAlign || 'top'}
                    </span>
                    {openSettingCards.sec_valign !== false ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {openSettingCards.sec_valign !== false && (
                  <div className="space-y-3 pt-1">
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Align all rows, columns, and elements in this section to the top, middle center, or bottom without needing padding.
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'top', label: 'Top' },
                        { id: 'center', label: 'Center (Middle)' },
                        { id: 'bottom', label: 'Bottom' }
                      ].map((va) => {
                        const isActive = (selectedSection.styles?.contentVerticalAlign || 'top') === va.id;
                        return (
                          <button
                            key={va.id}
                            type="button"
                            onClick={() => updateSectionStyles(selectedSection.id, { contentVerticalAlign: va.id as any })}
                            className={`py-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                              isActive
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-1 ring-indigo-500/20'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white'
                            }`}
                          >
                            {va.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Section Height / Min-Height */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-600">Section Height (Min-Height)</label>
                        <span className="text-[10px] font-mono text-indigo-600 font-bold">{selectedSection.styles?.minHeight || 'Auto'}</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {[
                          { label: 'Auto', val: undefined },
                          { label: 'Screen', val: '100vh' },
                          { label: '400px', val: '400px' },
                          { label: '600px', val: '600px' },
                          { label: '800px', val: '800px' }
                        ].map((h) => (
                          <button
                            key={h.label}
                            type="button"
                            onClick={() => updateSectionStyles(selectedSection.id, { minHeight: h.val })}
                            className={`py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                              (selectedSection.styles?.minHeight || undefined) === h.val
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                            }`}
                          >
                            {h.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Custom height (e.g. 550px or 90vh)"
                        value={selectedSection.styles?.minHeight || ''}
                        onChange={(e) => updateSectionStyles(selectedSection.id, { minHeight: e.target.value })}
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* B. If Target is Row: Show active row info, columns in this row, padding/margin */}
          {targetScope === 'row' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
              <div
                onClick={() => toggleSettingCard('sec_row_layout')}
                className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
              >
                <span className="text-xs font-bold text-indigo-700">Row {currentRowNum} Columns Layout</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addColumn(selectedSection.id);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Column</span>
                  </button>
                  {openSettingCards.sec_row_layout !== false ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {openSettingCards.sec_row_layout !== false && (
                <>
                  <div className="space-y-2 pt-1">
                {currentRow.columns.map((col, cIdx) => (
                  <div key={col.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Column {cIdx + 1}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => duplicateColumn(selectedSection.id, col.id)}
                          className="text-indigo-600 hover:text-indigo-800 text-[10px] font-semibold"
                        >
                          Duplicate
                        </button>
                        {currentRow.columns.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteColumn(selectedSection.id, col.id)}
                            className="text-rose-500 hover:text-rose-700 text-[10px] font-semibold"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={col.widthPercentage}
                        onChange={(e) => updateColumnWidth(selectedSection.id, col.id, parseFloat(e.target.value) || 0)}
                        className="w-full accent-indigo-600"
                      />
                      <span className="text-xs font-bold text-indigo-600 min-w-[38px] text-right">
                        {Math.round(col.widthPercentage)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row Width & Sizing */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600">Row Width</label>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold">
                      {currentRow.styles?.rowWidthType || 'full'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { id: 'full', label: '100%' },
                      { id: 'boxed', label: '1180px' },
                      { id: 'contained', label: '960px' },
                      { id: 'compact', label: '720px' },
                      { id: 'custom', label: 'Custom' }
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => updateTargetStyles({ rowWidthType: w.id as any })}
                        className={`py-1 text-[9px] font-bold rounded-lg border transition-all ${
                          (currentRow.styles?.rowWidthType || 'full') === w.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>

                  {currentRow.styles?.rowWidthType === 'custom' && (
                    <div className="pt-1.5 flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="e.g. 850px or 80%"
                        value={currentRow.styles?.rowCustomWidth || ''}
                        onChange={(e) => updateTargetStyles({ rowCustomWidth: e.target.value })}
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Row Alignment (Left / Center / Right) */}
                {(currentRow.styles?.rowWidthType && currentRow.styles.rowWidthType !== 'full') && (
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Row Alignment</label>
                    <AlignGroup
                      value={currentRow.styles?.rowAlign || 'center'}
                      includeJustify={false}
                      onChange={(rowAlign) => updateTargetStyles({ rowAlign: rowAlign as any })}
                    />
                  </div>
                )}

                {/* Row Columns Vertical Alignment */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Columns Vertical Align</label>
                    <span className="text-[9px] font-mono text-indigo-600 font-bold">{currentRow.styles?.rowVerticalAlign || 'top'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'top', label: 'Top' },
                      { id: 'center', label: 'Center' },
                      { id: 'bottom', label: 'Bottom' },
                      { id: 'stretch', label: 'Equal H' }
                    ].map((va) => (
                      <button
                        key={va.id}
                        type="button"
                        onClick={() => updateTargetStyles({ rowVerticalAlign: va.id as any })}
                        className={`py-1 text-[9px] font-bold rounded-lg border transition-all ${
                          (currentRow.styles?.rowVerticalAlign || 'top') === va.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                        }`}
                      >
                        {va.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row Min-Height */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Row Min Height</label>
                    <span className="text-[9px] font-mono text-indigo-600 font-bold">{currentRow.styles?.minHeight || 'Auto'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'Auto', val: undefined },
                      { label: '200px', val: '200px' },
                      { label: '350px', val: '350px' },
                      { label: '500px', val: '500px' }
                    ].map((h) => (
                      <button
                        key={h.label}
                        type="button"
                        onClick={() => updateTargetStyles({ minHeight: h.val })}
                        className={`py-1 text-[9px] font-bold rounded-lg border transition-all ${
                          (currentRow.styles?.minHeight || undefined) === h.val
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Custom height (e.g. 280px)"
                    value={currentRow.styles?.minHeight || ''}
                    onChange={(e) => updateTargetStyles({ minHeight: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

          {/* C. If Target is Column: Show width percentage slider & Column Height */}
          {targetScope === 'column' && currentCol && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
              <div
                onClick={() => toggleSettingCard('sec_col_layout')}
                className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
              >
                <span className="text-xs font-bold text-indigo-700">Column {currentColNum} (Row {currentRowNum})</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-indigo-600">{Math.round(currentCol.widthPercentage)}%</span>
                  {openSettingCards.sec_col_layout !== false ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {openSettingCards.sec_col_layout !== false && (
                <>
                  <div className="space-y-2 pt-1">
                    <label className="text-[11px] font-semibold text-slate-600">Column Width Percentage</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="1"
                        value={currentCol.widthPercentage}
                        onChange={(e) => updateColumnWidth(selectedSection.id, currentCol.id, parseFloat(e.target.value) || 0)}
                        className="flex-1 accent-indigo-600"
                      />
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={Math.round(currentCol.widthPercentage)}
                        onChange={(e) => updateColumnWidth(selectedSection.id, currentCol.id, parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 text-center"
                      />
                    </div>
                  </div>

                  {/* Column Height & Min-Height */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-600">Column Height / Min-Height</label>
                      <span className="text-[10px] font-mono text-indigo-600 font-bold">{currentCol.styles?.minHeight || 'Auto'}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { label: 'Auto', val: undefined },
                        { label: 'Full', val: '100%' },
                        { label: '200px', val: '200px' },
                        { label: '350px', val: '350px' },
                        { label: '500px', val: '500px' }
                      ].map((h) => (
                        <button
                          key={h.label}
                          type="button"
                          onClick={() => updateTargetStyles({ minHeight: h.val })}
                          className={`py-1 text-[9px] font-bold rounded-lg border transition-all ${
                            (currentCol.styles?.minHeight || undefined) === h.val
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                          }`}
                        >
                          {h.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Custom height (e.g. 400px or 100%)"
                      value={currentCol.styles?.minHeight || ''}
                      onChange={(e) => updateTargetStyles({ minHeight: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                    />
                  </div>

                  {/* Column Elements Vertical Alignment */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-600 flex items-center space-x-1.5">
                        <MoveVertical className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Elements Vertical Align</span>
                      </label>
                      <span className="text-[10px] font-mono text-indigo-600 font-bold capitalize">
                        {currentCol.styles?.contentVerticalAlign || (selectedSection.styles?.contentVerticalAlign ? `Section (${selectedSection.styles.contentVerticalAlign})` : 'Top')}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { id: undefined, label: 'Auto' },
                        { id: 'top', label: 'Top' },
                        { id: 'center', label: 'Center' },
                        { id: 'bottom', label: 'Bottom' }
                      ].map((va) => {
                        const isActive = (currentCol.styles?.contentVerticalAlign || undefined) === va.id;
                        return (
                          <button
                            key={va.label}
                            type="button"
                            onClick={() => updateTargetStyles({ contentVerticalAlign: va.id as any })}
                            className={`py-1 text-[9px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                              isActive
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                            }`}
                          >
                            {va.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Padding (Internal Spacing) for the Active Target (Section, Row, or Column) */}
          {/* Advanced 4-Sided Spacing, Margin & Padding */}
          <AdvancedSpacingControls
            titlePrefix={targetScope === 'row' ? 'Row' : targetScope === 'column' ? 'Column' : 'Container'}
            styles={targetStyles}
            onUpdateStyles={updateTargetStyles}
            showGap={targetScope !== 'column'}
            showZIndex={false}
            defaultPadding={targetScope === 'section' ? 20 : 0}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STYLING (BACKGROUND + BORDER, CORNERS, SHADOW & HOVER) */}
      {/* ========================================================================= */}
      {sectionTab === 'styling' && (
        <div className="space-y-4">
          {/* Active Target Scope Reminder */}
          <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-900">
              Styling target: <span className="font-extrabold uppercase">{targetScope}</span>
              {targetScope === 'row' && ` (Row ${currentRowNum})`}
              {targetScope === 'column' && ` (Column ${currentColNum})`}
            </span>
            <span className="text-[10px] bg-white text-indigo-700 font-bold px-2 py-0.5 rounded-full shadow-2xs">
              Live updates
            </span>
          </div>

          {/* 1. Background Type Toggle */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
            <div
              onClick={() => toggleSettingCard('sec_bg_type')}
              className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
            >
              <span>Background Type</span>
              {openSettingCards.sec_bg_type !== false ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
            {openSettingCards.sec_bg_type !== false && (
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBgMode('color')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    bgMode === 'color' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Solid Color
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode('gradient')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    bgMode === 'gradient' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Gradient
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode('image')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    bgMode === 'image' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Image
                </button>
              </div>
            )}
          </div>

          {/* 2. Solid Color Mode */}
          {bgMode === 'color' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
              <div
                onClick={() => toggleSettingCard('sec_bg_solid')}
                className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
              >
                <span>Solid Color</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTargetStyles({
                        bgColor: targetScope === 'section' ? '#ffffff' : undefined,
                        bgGradient: undefined
                      });
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-700 font-normal"
                  >
                    Reset
                  </button>
                  {openSettingCards.sec_bg_solid !== false ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {openSettingCards.sec_bg_solid !== false && (
                <div className="pt-2">
                  <ModernColorPicker
                    label={`${targetScope.toUpperCase()} BACKGROUND`}
                    value={targetStyles.bgColor || (targetScope === 'section' ? '#ffffff' : 'transparent')}
                    onChange={(bgColor) => updateTargetStyles({ bgColor, bgGradient: undefined })}
                  />
                </div>
              )}
            </div>
          )}

          {/* 3. Gradient Mode */}
          {bgMode === 'gradient' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
              <div
                onClick={() => toggleSettingCard('sec_bg_grad')}
                className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
              >
                <span>Gradient Presets</span>
                {openSettingCards.sec_bg_grad !== false ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {openSettingCards.sec_bg_grad !== false && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { name: 'Indigo Dream', grad: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
                    { name: 'Sunset Glow', grad: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
                    { name: 'Ocean Breeze', grad: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
                    { name: 'Purple Haze', grad: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)' },
                    { name: 'Dark Slate', grad: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
                    { name: 'Emerald Dawn', grad: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' },
                    { name: 'Rose Peach', grad: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)' },
                    { name: 'Midnight Blue', grad: 'linear-gradient(135deg, #030712 0%, #1e1b4b 100%)' }
                  ].map((g) => (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => updateTargetStyles({ bgGradient: g.grad, bgColor: undefined })}
                      className={`h-14 rounded-xl p-2 text-left border flex flex-col justify-end transition-all ${
                        targetStyles.bgGradient === g.grad ? 'border-indigo-600 ring-2 ring-indigo-500/50 scale-102' : 'border-slate-200'
                      }`}
                      style={{ background: g.grad }}
                    >
                      <span className="text-[10px] font-bold text-white drop-shadow-md">{g.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Image Mode */}
          {bgMode === 'image' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
              <div
                onClick={() => toggleSettingCard('sec_bg_img')}
                className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
              >
                <span>Image Background</span>
                {openSettingCards.sec_bg_img !== false ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {openSettingCards.sec_bg_img !== false && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Image URL</label>
                    <input
                      type="text"
                      value={targetStyles.bgImage || ''}
                      onChange={(e) => updateTargetStyles({ bgImage: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => bgFileInputRef.current?.click()}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image from PC</span>
                  </button>

                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stock Presets</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PRESET_IMAGES.map((img) => (
                        <button
                          key={img.name}
                          type="button"
                          onClick={() => updateTargetStyles({ bgImage: img.url })}
                          className="relative h-12 rounded-lg overflow-hidden border border-slate-200 group"
                        >
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-white text-center px-1">{img.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Overlay Color and Opacity */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <ModernColorPicker
                      label="Overlay Color"
                      value={targetStyles.bgOverlayColor || '#000000'}
                      onChange={(color) => updateTargetStyles({ bgOverlayColor: color })}
                    />
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="text-[11px] font-semibold text-slate-600">Opacity</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={targetStyles.bgOverlayOpacity !== undefined ? targetStyles.bgOverlayOpacity : 0.4}
                        onChange={(e) => updateTargetStyles({ bgOverlayOpacity: parseFloat(e.target.value) })}
                        className="flex-1 accent-indigo-600"
                      />
                      <span className="text-xs font-mono font-bold text-slate-600 w-10 text-right">
                        {Math.round((targetStyles.bgOverlayOpacity !== undefined ? targetStyles.bgOverlayOpacity : 0.4) * 100)}%
                      </span>
                    </div>

                    {/* Parallax Background */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-700 block">Parallax Background</span>
                        <span className="text-[10px] text-slate-400">Fixed viewport depth effect on scroll</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(targetStyles.isParallax)}
                        onChange={(e) => updateTargetStyles({ isParallax: e.target.checked })}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. Corner Radius */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
            <div
              onClick={() => toggleSettingCard('sec_radius')}
              className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
            >
              <span>Corner Radius</span>
              {openSettingCards.sec_radius !== false ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
            {openSettingCards.sec_radius !== false && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-5 gap-1">
                  {['0px', '8px', '16px', '24px', '32px'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => updateTargetStyles({ borderRadius: r })}
                      className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                        (targetStyles.borderRadius || '0px') === r
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. Border Style, Width & Color */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
            <div
              onClick={() => toggleSettingCard('sec_border')}
              className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
            >
              <span>Border</span>
              {openSettingCards.sec_border !== false ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
            {openSettingCards.sec_border !== false && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Border Style</label>
                    <select
                      value={targetStyles.borderStyle || 'solid'}
                      onChange={(e) => updateTargetStyles({ borderStyle: e.target.value })}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                    >
                      <option value="none">None</option>
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Border Width</label>
                    <input
                      type="text"
                      value={targetStyles.borderWidth || '0px'}
                      onChange={(e) => updateTargetStyles({ borderWidth: e.target.value })}
                      placeholder="e.g. 1px"
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <ModernColorPicker
                    label="Border Color"
                    value={targetStyles.borderColor || '#e2e8f0'}
                    onChange={(borderColor) => updateTargetStyles({ borderColor })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 7. Box Shadow */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
            <div
              onClick={() => toggleSettingCard('sec_shadow')}
              className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
            >
              <span>Box Shadow</span>
              {openSettingCards.sec_shadow !== false ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
            {openSettingCards.sec_shadow !== false && (
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[
                  { label: 'None', val: 'none' },
                  { label: 'Subtle', val: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)' },
                  { label: 'Soft', val: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' },
                  { label: 'Elevated', val: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)' },
                  { label: 'Deep', val: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' },
                  { label: 'Glow', val: '0 0 25px rgba(99, 102, 241, 0.35)' }
                ].map((sh) => (
                  <button
                    key={sh.label}
                    type="button"
                    onClick={() => updateTargetStyles({ shadow: sh.val })}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                      (targetStyles.shadow || 'none') === sh.val
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    {sh.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 8. Hover-Over Interactive Properties */}
          <div className="border border-indigo-100 rounded-xl overflow-hidden bg-indigo-50/30 shadow-xs p-3.5 space-y-3.5">
            <div
              onClick={() => toggleSettingCard('sec_hover')}
              className="flex items-center justify-between cursor-pointer select-none border-b border-indigo-100 pb-2 text-xs font-bold text-indigo-900 hover:text-indigo-700 transition-colors"
            >
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hover Interactive Effects</span>
              </span>
              {openSettingCards.sec_hover !== false ? (
                <ChevronDown className="w-4 h-4 text-indigo-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-indigo-600" />
              )}
            </div>

            {openSettingCards.sec_hover !== false && (
              <div className="space-y-3.5 pt-1">
                {/* Hover Scale */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Hover Scale Zoom</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'None (1x)', val: undefined },
                      { label: 'Slight (1.005x)', val: '1.005' },
                      { label: 'Subtle (1.01x)', val: '1.01' },
                      { label: 'Pop (1.02x)', val: '1.02' }
                    ].map((sc) => (
                      <button
                        key={sc.label}
                        type="button"
                        onClick={() => updateTargetStyles({ hoverScale: sc.val })}
                        className={`py-1 text-[9px] font-bold rounded-lg border transition-all truncate px-1 ${
                          targetStyles.hoverScale === sc.val
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                        }`}
                      >
                        {sc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hover Shadow */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Hover Box Shadow</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { label: 'Inherit', val: undefined },
                      { label: 'Elevate', val: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
                      { label: 'Indigo Glow', val: '0 0 30px rgba(99, 102, 241, 0.45)' }
                    ].map((hs) => (
                      <button
                        key={hs.label}
                        type="button"
                        onClick={() => updateTargetStyles({ hoverShadow: hs.val })}
                        className={`py-1 text-[9px] font-bold rounded-lg border transition-all truncate px-1 ${
                          targetStyles.hoverShadow === hs.val
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                        }`}
                      >
                        {hs.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hover Background Color */}
                <ModernColorPicker
                  label="Hover Background"
                  value={targetStyles.hoverBgColor || ''}
                  onChange={(color) => updateTargetStyles({ hoverBgColor: color || undefined })}
                />

                {/* Hover Border Color */}
                <ModernColorPicker
                  label="Hover Border Color"
                  value={targetStyles.hoverBorderColor || ''}
                  onChange={(color) => updateTargetStyles({ hoverBorderColor: color || undefined })}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ADVANCED (SECTION PROPERTIES MOVED HERE) */}
      {/* ========================================================================= */}
      {sectionTab === 'advanced' && (
        <div className="space-y-4">
          {/* Active Target Scope Reminder */}
          <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-900">
              Styling: <span className="font-bold underline">{targetScope.toUpperCase()}</span>
              {targetScope === 'row' && ` (Row ${currentRowNum})`}
              {targetScope === 'column' && ` (Column ${currentColNum})`}
            </span>
            <span className="text-[10px] text-indigo-600 font-bold bg-white px-2 py-0.5 rounded-md border border-indigo-200">
              Advanced Spacing
            </span>
          </div>

          {/* 4-Sided Padding, 4-Sided Margin, Spacing (Gap) & Layer (Z-Index) */}
          <AdvancedSpacingControls
            titlePrefix={targetScope === 'row' ? 'Row' : targetScope === 'column' ? 'Column' : 'Section'}
            styles={targetStyles}
            onUpdateStyles={updateTargetStyles}
            showGap={targetScope !== 'column'}
            showZIndex={targetScope === 'section'}
            defaultPadding={targetScope === 'section' ? 20 : 0}
          />

          {/* 1. Section Properties & HTML ID (Shown ONLY when Section is targeted) */}
          {targetScope === 'section' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
            <div
              onClick={() => toggleSettingCard('sec_props')}
              className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
            >
              <span>Section Properties</span>
              {openSettingCards.sec_props !== false ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {openSettingCards.sec_props !== false && (
              <div className="space-y-3 pt-1">
                {/* Section Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Section Name</label>
                  <input
                    type="text"
                    value={selectedSection.name}
                    onChange={(e) => renameSection(selectedSection.id, e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Section Width: Boxed vs Custom % vs Screen Width */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600">Section Width</label>
                    <span className="text-[10px] font-mono font-bold text-indigo-600">
                      {selectedSection.styles?.widthType === 'screen'
                        ? '100% (Screen)'
                        : selectedSection.styles?.widthType === 'custom'
                        ? `${(selectedSection.styles?.customWidth || '80%').replace('%', '')}%`
                        : '1180px (Boxed)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => updateSectionStyles(selectedSection.id, { widthType: 'boxed' })}
                      className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                        (selectedSection.styles?.widthType || 'boxed') === 'boxed'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                      }`}
                    >
                      Boxed (1180px)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = selectedSection.styles?.customWidth || '80%';
                        updateSectionStyles(selectedSection.id, {
                          widthType: 'custom',
                          customWidth: cur
                        });
                      }}
                      className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                        selectedSection.styles?.widthType === 'custom'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                      }`}
                    >
                      Custom %
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSectionStyles(selectedSection.id, { widthType: 'screen' })}
                      className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                        selectedSection.styles?.widthType === 'screen'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                      }`}
                    >
                      Screen Width
                    </button>
                  </div>

                  {/* If Custom % is selected, show Slider + Number Input + Quick Presets */}
                  {selectedSection.styles?.widthType === 'custom' && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Width Percentage</span>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min={20}
                            max={100}
                            value={parseInt(selectedSection.styles?.customWidth || '80') || 80}
                            onChange={(e) => {
                              const val = Math.min(100, Math.max(20, Number(e.target.value) || 20));
                              updateSectionStyles(selectedSection.id, { customWidth: `${val}%` });
                            }}
                            className="w-14 px-1.5 py-0.5 text-right bg-white border border-slate-200 rounded text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                          <span className="text-xs font-bold text-slate-500">%</span>
                        </div>
                      </div>

                      {/* Range Slider */}
                      <input
                        type="range"
                        min={20}
                        max={100}
                        step={1}
                        value={parseInt(selectedSection.styles?.customWidth || '80') || 80}
                        onChange={(e) => updateSectionStyles(selectedSection.id, { customWidth: `${e.target.value}%` })}
                        className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />

                      {/* Preset Pills */}
                      <div className="flex items-center justify-between gap-1 pt-0.5">
                        {['50%', '60%', '70%', '80%', '90%', '95%'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => updateSectionStyles(selectedSection.id, { customWidth: preset })}
                            className={`flex-1 py-1 text-[10px] font-bold rounded border transition-all ${
                              (selectedSection.styles?.customWidth || '80%').replace('%', '') === preset.replace('%', '')
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section Alignment (Left / Center / Right) */}
                  {selectedSection.styles?.widthType !== 'screen' && (
                    <div className="space-y-1 pt-1.5 border-t border-slate-100">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Section Alignment</label>
                      <AlignGroup
                        value={selectedSection.styles?.sectionAlign || 'center'}
                        includeJustify={false}
                        onChange={(sectionAlign) => updateSectionStyles(selectedSection.id, { sectionAlign: sectionAlign as any })}
                      />
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 pt-0.5">
                    {selectedSection.styles?.widthType === 'screen'
                      ? 'Stretches this section to full viewport width (100%).'
                      : selectedSection.styles?.widthType === 'custom'
                      ? `Section at ${selectedSection.styles?.customWidth || '80%'} width aligned ${(selectedSection.styles?.sectionAlign || 'center')}.`
                      : `1180px boxed width aligned ${(selectedSection.styles?.sectionAlign || 'center')}.`}
                  </p>
                </div>

                {/* Equal Height Columns Toggle */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center space-x-1.5">
                      <StretchHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Equal Height Columns</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Boolean(selectedSection.styles?.equalHeightColumns);
                        updateSectionStyles(selectedSection.id, { equalHeightColumns: !current });
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        selectedSection.styles?.equalHeightColumns ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          selectedSection.styles?.equalHeightColumns ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Stretches all columns in each row to match the height of the tallest column.
                  </p>
                </div>

                {/* Section Height / Min-Height */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600">Section Height (Min-Height)</label>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold">{selectedSection.styles?.minHeight || 'Auto'}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { label: 'Auto', val: undefined },
                      { label: 'Screen', val: '100vh' },
                      { label: '400px', val: '400px' },
                      { label: '600px', val: '600px' },
                      { label: '800px', val: '800px' }
                    ].map((h) => (
                      <button
                        key={h.label}
                        type="button"
                        onClick={() => updateSectionStyles(selectedSection.id, { minHeight: h.val })}
                        className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          (selectedSection.styles?.minHeight || undefined) === h.val
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Custom height (e.g. 550px or 90vh)"
                      value={selectedSection.styles?.minHeight || ''}
                      onChange={(e) => updateSectionStyles(selectedSection.id, { minHeight: e.target.value })}
                      className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>



                {/* HTML Anchor ID */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center space-x-1">
                      <Hash className="w-3 h-3 text-indigo-500" />
                      <span>HTML Anchor ID (Section ID)</span>
                    </label>
                    {selectedSection.customId && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`#${selectedSection.customId}`);
                          alert(`Copied anchor link: #${selectedSection.customId}`);
                        }}
                        className="text-[10px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-0.5"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copy #{selectedSection.customId}</span>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold">#</span>
                    <input
                      type="text"
                      value={selectedSection.customId || ''}
                      onChange={(e) => setSectionCustomId(selectedSection.id, e.target.value)}
                      placeholder="e.g. features, pricing, contact"
                      className="w-full pl-6 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Target this section from buttons or navigation with <span className="font-mono text-indigo-600 font-semibold">#{selectedSection.customId || 'id'}</span>.
                  </p>
                </div>

                {/* Sticky Section Header Toggle */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center space-x-1">
                      <Pin className="w-3 h-3 text-indigo-500" />
                      <span>Sticky Section Header</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Boolean(selectedSection.styles?.isSticky);
                        updateSectionStyles(selectedSection.id, { isSticky: !current });
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        selectedSection.styles?.isSticky ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          selectedSection.styles?.isSticky ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Keeps this entire section pinned to the top when scrolling down.
                  </p>

                  {selectedSection.styles?.isSticky && (
                    <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2 mt-2">
                      <label className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">Sticky Behavior Rule</label>
                      <select
                        value={selectedSection.styles?.stickyBehavior || 'always'}
                        onChange={(e) => updateSectionStyles(selectedSection.id, { stickyBehavior: e.target.value as any })}
                        className="w-full p-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="always">Always Sticky (Persistent)</option>
                        <option value="show-after">Show After Specific Section</option>
                        <option value="hide-after">Hide After Specific Section</option>
                        <option value="hide-inside">Hide Inside Specific Section</option>
                      </select>

                      {selectedSection.styles?.stickyBehavior && selectedSection.styles.stickyBehavior !== 'always' && (
                        <div className="space-y-1 pt-1">
                          <label className="text-[10px] font-bold text-slate-500">Target Section</label>
                          <select
                            value={selectedSection.styles?.stickyTargetSection || ''}
                            onChange={(e) => updateSectionStyles(selectedSection.id, { stickyTargetSection: e.target.value })}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                          >
                            <option value="">-- Choose Target Section --</option>
                            {sections.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} (#{s.customId || s.id})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dynamic / Global Reusable Component Toggle */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center space-x-1">
                      <Globe className="w-3 h-3 text-emerald-600" />
                      <span>Dynamic Global Component</span>
                    </label>
                    {selectedSection.isDynamic && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full">
                        ACTIVE SYMBOL
                      </span>
                    )}
                  </div>

                  {selectedSection.isDynamic ? (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-emerald-800 font-bold">
                        <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Synced Across All Pages</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-relaxed">
                        Edits to this section will automatically sync across every page where this symbol is used.
                      </p>
                      <button
                        type="button"
                        onClick={() => detachDynamicSection(selectedSection.id)}
                        className="w-full py-1.5 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        Detach to Independent Static Section
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makeSectionDynamic(selectedSection.id)}
                      className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-xs"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Make Dynamic Global Component</span>
                    </button>
                  )}
                </div>

                {/* Section Clipboard Copy */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      copySection(selectedSection.id);
                      alert(`Section "${selectedSection.name}" copied to clipboard! Switch to any page tab and click "Paste Section" or press Ctrl+Shift+V.`);
                    }}
                    className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-xs"
                  >
                    <ClipboardCopy className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Copy Section to Clipboard (Ctrl+Shift+C)</span>
                  </button>
                </div>

                {/* Scroll Reveal Animation */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Scroll Reveal / Animate on Scroll</span>
                    </label>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold">
                      {selectedSection.styles?.scrollReveal || 'none'}
                    </span>
                  </div>
                  <select
                    value={selectedSection.styles?.scrollReveal || 'none'}
                    onChange={(e) => updateSectionStyles(selectedSection.id, { scrollReveal: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    <option value="none">None (Standard)</option>
                    <option value="fade-up">Fade In Up</option>
                    <option value="fade-down">Fade In Down</option>
                    <option value="fade-left">Fade In Left</option>
                    <option value="fade-right">Fade In Right</option>
                    <option value="zoom-in">Zoom In Scale</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Row Width & Layout (Shown ONLY when Row is targeted) */}
          {targetScope === 'row' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
              <div
                onClick={() => toggleSettingCard('row_props')}
                className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
              >
                <span>Row {currentRowNum} Width & Layout</span>
                {openSettingCards.row_props !== false ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {openSettingCards.row_props !== false && (
                <div className="space-y-3 pt-1">
                  {/* Row Width */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-600">Row Width (Within Section)</label>
                      <span className="text-[10px] font-mono text-indigo-600 font-bold">
                        {currentRow.styles?.rowWidthType || 'full'}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { id: 'full', label: '100%' },
                        { id: 'boxed', label: '1180px' },
                        { id: 'contained', label: '960px' },
                        { id: 'compact', label: '720px' },
                        { id: 'custom', label: 'Custom' }
                      ].map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => updateTargetStyles({ rowWidthType: w.id as any })}
                          className={`py-1 text-[9px] font-bold rounded-lg border transition-all ${
                            (currentRow.styles?.rowWidthType || 'full') === w.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>

                    {currentRow.styles?.rowWidthType === 'custom' && (
                      <div className="pt-1.5 flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="e.g. 80% or 850px"
                          value={currentRow.styles?.rowCustomWidth || ''}
                          onChange={(e) => updateTargetStyles({ rowCustomWidth: e.target.value })}
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                        />
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 pt-0.5">
                      Row fits 100% within the parent section ({selectedSection.styles?.widthType === 'custom' ? (selectedSection.styles?.customWidth || '80%') : selectedSection.styles?.widthType === 'screen' ? '100% Screen' : '1180px Boxed'}).
                    </p>
                  </div>

                  {/* Row Alignment */}
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Row Alignment</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'left', label: 'Left', icon: AlignLeft },
                        { id: 'center', label: 'Center', icon: AlignCenter },
                        { id: 'right', label: 'Right', icon: AlignRight }
                      ].map((al) => {
                        const Icon = al.icon;
                        return (
                          <button
                            key={al.id}
                            type="button"
                            onClick={() => updateTargetStyles({ rowAlign: al.id as any })}
                            className={`py-1 text-[11px] font-bold rounded-lg border flex items-center justify-center space-x-1 transition-all ${
                              (currentRow.styles?.rowAlign || 'center') === al.id
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
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
              )}
            </div>
          )}

          {/* 2. Responsive Visibility */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 space-y-3">
            <div
              onClick={() => toggleSettingCard('sec_responsive')}
              className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
            >
              <span>Responsive Visibility</span>
              {openSettingCards.sec_responsive !== false ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {openSettingCards.sec_responsive !== false && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700">Visible on Desktop</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700">Visible on Tablet</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-between py-1 text-xs">
                  <span className="font-semibold text-slate-700">Visible on Mobile</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
