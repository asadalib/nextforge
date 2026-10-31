import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, ChevronUp, Copy, Edit2, GripVertical, Layers,
  Trash2, X, Plus, Columns
} from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';

interface FloatingLayersPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FloatingLayersPanel({ isOpen, onClose }: FloatingLayersPanelProps) {
  if (!isOpen) return null;

  const {
    sections,
    renameSection,
    reorderSections,
    deleteSection,
    duplicateSection,
    toggleSectionCollapse,
    duplicateColumn,
    duplicateElement,
    setSelectedSectionId,
    setSelectedRowId,
    setSelectedColumnId,
    setSelectedElementId,
    selectedElementId,
    selectedSectionId,
    selectedRowId,
    selectedColumnId
  } = useBuilderStore();

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [draggedSecIdx, setDraggedSecIdx] = useState<number | null>(null);
  const [dragOverSecIdx, setDragOverSecIdx] = useState<number | null>(null);

  const toggleExpand = (secId: string) => {
    toggleSectionCollapse(secId);
  };

  const handleStartRename = (secId: string, name: string) => {
    setEditingSectionId(secId);
    setEditingName(name);
  };

  const handleSaveRename = (secId: string) => {
    if (editingName.trim()) {
      renameSection(secId, editingName.trim());
    }
    setEditingSectionId(null);
  };

  return (
    <div className="fixed top-16 left-[295px] z-50 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fade-in select-none">
      {/* Movable Panel Header */}
      <div className="px-3.5 py-2.5 bg-indigo-600 text-white flex items-center justify-between cursor-move">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-white" />
          <h3 className="text-xs font-bold">Layers</h3>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-semibold">
            {sections.length} sections
          </span>
        </div>
        <button onClick={onClose} className="p-0.5 text-indigo-200 hover:text-white rounded transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 font-medium flex items-center justify-between">
        <span>Drag grip to arrange • Double-click to rename</span>
      </div>

      {/* Layers Tree Items */}
      <div className="p-3 max-h-[420px] overflow-y-auto space-y-2">
        {sections.map((sec, secIdx) => {
          const isExpanded = !sec.isCollapsed;
          const isSecSelected = selectedSectionId === sec.id;
          const isDragging = draggedSecIdx === secIdx;
          const isDragOver = dragOverSecIdx === secIdx && draggedSecIdx !== secIdx;

          return (
            <div
              key={sec.id}
              draggable={editingSectionId !== sec.id}
              onDragStart={(e) => {
                setDraggedSecIdx(secIdx);
                e.dataTransfer.setData('text/plain', String(secIdx));
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverSecIdx !== secIdx) {
                  setDragOverSecIdx(secIdx);
                }
              }}
              onDragLeave={() => {
                if (dragOverSecIdx === secIdx) {
                  setDragOverSecIdx(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedSecIdx !== null && draggedSecIdx !== secIdx) {
                  reorderSections(draggedSecIdx, secIdx);
                }
                setDraggedSecIdx(null);
                setDragOverSecIdx(null);
              }}
              onDragEnd={() => {
                setDraggedSecIdx(null);
                setDragOverSecIdx(null);
              }}
              className={`rounded-xl border transition-all ${
                isSecSelected
                  ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              } ${isDragging ? 'opacity-40 border-dashed border-indigo-400' : ''} ${
                isDragOver ? 'ring-2 ring-indigo-500 shadow-md bg-indigo-50/70 border-indigo-500' : ''
              }`}
            >
              {/* Section Node Bar */}
              <div className="p-2 flex items-center justify-between space-x-1">
                <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                  {/* Grip Handle for Reordering */}
                  <div
                    className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors shrink-0"
                    title="Drag to arrange section order"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  {/* Expand/Collapse Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(sec.id);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 shrink-0"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {/* Section Name / Inline Rename on Double Click */}
                  <div className="min-w-0 flex-1">
                    {editingSectionId === sec.id ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleSaveRename(sec.id)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') handleSaveRename(sec.id);
                          if (e.key === 'Escape') setEditingSectionId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.target.select()}
                        className="px-2 py-0.5 border-2 border-indigo-500 rounded-lg text-xs font-bold text-slate-800 bg-white shadow-xs focus:outline-none w-full"
                      />
                    ) : (
                      <span
                        onClick={() => setSelectedSectionId(sec.id)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleStartRename(sec.id, sec.name);
                        }}
                        className="text-xs font-bold text-slate-800 truncate block cursor-pointer hover:text-indigo-600 transition-colors"
                        title="Click to select • Double-click to rename"
                      >
                        {sec.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Section Action Icons & Reordering Controls */}
                <div className="flex items-center space-x-0.5 shrink-0">
                  {/* Move Up Button */}
                  <button
                    disabled={secIdx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      reorderSections(secIdx, secIdx - 1);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
                    title="Move section up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>

                  {/* Move Down Button */}
                  <button
                    disabled={secIdx === sections.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      reorderSections(secIdx, secIdx + 1);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
                    title="Move section down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* Rename Icon Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartRename(sec.id, sec.name);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                    title="Rename Section (or double-click name)"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  {/* Duplicate Icon Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSection(sec.id);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                    title="Duplicate Section"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  {/* Delete Icon Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSection(sec.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete Section"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Nested Rows, Columns & Elements */}
              {isExpanded && (() => {
                const displayRows = sec.rows && sec.rows.length > 0
                  ? sec.rows
                  : [{ id: `${sec.id}-row-0`, columns: sec.columns || [] }];

                return (
                  <div className="px-3 pb-2.5 pt-1 border-t border-slate-100 space-y-2.5">
                    {displayRows.map((row, rowIdx) => (
                      <div key={row.id} className="space-y-1.5">
                        {displayRows.length > 1 && (
                          <div
                            onClick={() => setSelectedRowId(row.id, sec.id)}
                            className={`text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-between pt-0.5 cursor-pointer rounded px-1 transition-colors ${
                              selectedRowId === row.id && !selectedColumnId
                                ? 'text-indigo-600 bg-indigo-50 font-black'
                                : 'text-slate-600 hover:text-indigo-600'
                            }`}
                            title={`Click to style Row ${rowIdx + 1}`}
                          >
                            <span>Row {rowIdx + 1}</span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {row.columns?.length || 0} col{(row.columns?.length || 0) > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        {(row.columns || []).map((col, colIdx) => (
                          <div key={col.id} className="pl-3 border-l-2 border-purple-300 space-y-1">
                            <div className="text-[10px] font-bold text-slate-500 flex items-center justify-between">
                              <span
                                onClick={() => setSelectedColumnId(col.id, row.id, sec.id)}
                                className={`cursor-pointer hover:text-purple-600 transition-colors ${
                                  selectedColumnId === col.id ? 'text-purple-700 font-extrabold' : ''
                                }`}
                                title={`Click to style Column ${colIdx + 1}`}
                              >
                                Column {colIdx + 1}
                              </span>
                              <div className="flex items-center space-x-1">
                                <span className="text-purple-600 bg-purple-100 px-1.5 py-0.2 rounded font-mono">
                                  {col.widthPercentage}%
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateColumn(sec.id, col.id);
                                  }}
                                  className="p-0.5 text-slate-400 hover:text-purple-600 rounded transition-colors"
                                  title="Duplicate Column"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>

                            {/* Column Elements */}
                            <div className="space-y-1 pt-1">
                              {(col.elements || []).map((el) => {
                                const isElSelected = selectedElementId === el.id;
                                return (
                                  <div
                                    key={el.id}
                                    onClick={() => setSelectedElementId(el.id)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                                      isElSelected
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-700 hover:bg-purple-100'
                                    }`}
                                  >
                                    <span className="truncate">{el.label}</span>
                                    <div className="flex items-center space-x-1.5">
                                      <span className="text-[9px] opacity-70 font-mono uppercase">{el.type}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          duplicateElement(el.id);
                                        }}
                                        className="p-0.5 opacity-70 hover:opacity-100 hover:scale-110 transition-transform"
                                        title="Duplicate Element"
                                      >
                                        <Copy className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
