import React, { useState } from 'react';
import {
  ArrowRight, Box, Columns, Trash2, Plus, Copy, CheckSquare,
  Images, Video, Star, Tag, MessageSquare, LayoutGrid, Sliders,
  ChevronDown, ChevronRight, ClipboardCopy, Globe, Hash, GripVertical
} from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';
import ElementRenderer, { normalizeUnit, getSectionLayoutStyles } from './ElementRenderer';
import ElementPickerModal from './ElementPickerModal';

export default function CanvasWorkspace() {
  const {
    sections,
    breakpoint,
    selectedElementId,
    setSelectedElementId,
    selectedSectionId,
    setSelectedSectionId,
    selectedRowId,
    setSelectedRowId,
    selectedColumnId,
    setSelectedColumnId,
    addSection,
    addSectionWithElement,
    deleteSection,
    duplicateSection,
    copySection,
    toggleSectionCollapse,
    addRowToSection,
    deleteRowFromSection,
    duplicateRowInSection,
    addInnerRowToColumn,
    deleteColumn,
    duplicateColumn,
    addElementToColumn,
    duplicateElement,
    deleteElement,
    applyLayoutPresetToSection,
    moveElement,
    renameSection
  } = useBuilderStore();

  const [editingSecNameId, setEditingSecNameId] = useState<string | null>(null);
  const [editingSecNameVal, setEditingSecNameVal] = useState<string>('');

  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [dragOverAddContainerIdx, setDragOverAddContainerIdx] = useState<number | null>(null);
  const [showRowPickerSecId, setShowRowPickerSecId] = useState<string | null>(null);
  const [hoveredSecId, setHoveredSecId] = useState<string | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [hoveredColId, setHoveredColId] = useState<string | null>(null);
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{
    sectionId: string;
    columnId: string;
    index: number;
  } | null>(null);
  const [pickerTarget, setPickerTarget] = useState<{
    sectionId: string;
    columnId: string;
    columnTitle: string;
  } | null>(null);

  const handleDropOnAddContainer = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverAddContainerIdx(null);
    setDropIndicator(null);
    setDraggingElementId(null);
    setDragOverColumnId(null);

    const elementDataStr = e.dataTransfer.getData('application/nextforge-element');
    const plainData = e.dataTransfer.getData('text/plain') || '';

    // 1. Moving an existing element from the canvas
    if (elementDataStr || plainData.startsWith('element:')) {
      let elementId = '';
      if (elementDataStr) {
        try {
          const parsed = JSON.parse(elementDataStr);
          elementId = parsed.elementId;
        } catch {
          elementId = plainData.replace('element:', '');
        }
      } else {
        elementId = plainData.replace('element:', '');
      }

      if (elementId) {
        addSection('container', targetIndex);
        const curSecs = useBuilderStore.getState().sections;
        const newSec = curSecs[targetIndex] || curSecs[curSecs.length - 1];
        if (newSec && newSec.columns?.[0]) {
          moveElement(elementId, newSec.id, newSec.columns[0].id, 0);
        }
        return;
      }
    }

    // 2. Applying a layout preset
    const layoutPreset = e.dataTransfer.getData('application/nextforge-layout');
    if (layoutPreset || plainData.startsWith('layout:')) {
      const presetId = layoutPreset || plainData.replace('layout:', '');
      addSection(presetId, targetIndex);
      return;
    }

    // 3. New widget dragged from sidebar (e.g. 'button', 'beforeafter', 'heading', etc.)
    const widgetType = (plainData && !plainData.includes(':')) ? plainData : 'button';
    addSectionWithElement('container', targetIndex, widgetType);
  };

  const handleDropAt = (e: React.DragEvent, sectionId: string, columnId: string, index?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropIndicator(null);
    setDraggingElementId(null);
    setDragOverColumnId(null);

    const elementDataStr = e.dataTransfer.getData('application/nextforge-element');
    const plainData = e.dataTransfer.getData('text/plain') || '';

    // 1. Moving an existing element
    if (elementDataStr || plainData.startsWith('element:')) {
      let elementId = '';
      if (elementDataStr) {
        try {
          const parsed = JSON.parse(elementDataStr);
          elementId = parsed.elementId;
        } catch {
          elementId = plainData.replace('element:', '');
        }
      } else {
        elementId = plainData.replace('element:', '');
      }

      if (elementId) {
        moveElement(elementId, sectionId, columnId, index);
        return;
      }
    }

    // 2. Applying a layout preset
    const layoutPreset = e.dataTransfer.getData('application/nextforge-layout');
    if (layoutPreset || plainData.startsWith('layout:')) {
      const presetId = layoutPreset || plainData.replace('layout:', '');
      applyLayoutPresetToSection(sectionId, presetId);
      return;
    }

    // 3. Adding a new widget from sidebar
    const widgetType = plainData || 'heading';
    addElementToColumn(sectionId, columnId, widgetType, index);
  };

  const getCanvasWidthClass = () => {
    if (breakpoint === 'tablet') return 'w-[768px] min-h-[850px] max-w-full';
    if (breakpoint === 'mobile') return 'w-[390px] min-h-[800px] max-w-full';
    return 'w-full min-h-[850px]';
  };

  const blurActiveInput = () => {
    const el = document.activeElement as HTMLElement | null;
    if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) {
      el.blur();
    }
  };

  return (
    <main
      onClick={() => {
        blurActiveInput();
        setSelectedElementId(null);
        setSelectedSectionId(null);
      }}
      className="flex-1 bg-slate-100 overflow-y-auto h-[calc(100vh-3.5rem)] p-4 sm:p-8 flex flex-col items-center select-none z-10 nextforge-scrollbar"
      id="canvas-scroll-container"
    >
      {/* Devices Indicator Badge */}
      <div className="mb-3 text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
        {breakpoint.toUpperCase()} CANVAS
      </div>

      {/* Canvas Workspace Container */}
      <div
        className={`${getCanvasWidthClass()} nextforge-canvas-${breakpoint} transition-all duration-300 flex flex-col space-y-6 pb-24 relative`}
      >
        {sections.length === 0 ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => handleDropOnAddContainer(e, 0)}
            className="bg-white border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl shadow-md p-16 flex flex-col items-center justify-center text-center text-slate-400 min-h-[450px] transition-all group/empty"
          >
            <Box className="w-12 h-12 mb-3 text-indigo-500 opacity-50 group-hover/empty:scale-110 group-hover/empty:opacity-80 transition-all" />
            <h3 className="text-base font-bold text-slate-800">Empty Page Canvas</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Click the button below or drag any element / structure from the left panel to start building.
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addSection('container');
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => handleDropOnAddContainer(e, 0)}
              className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Section</span>
            </button>
          </div>
        ) : (
          sections.map((sec, secIdx) => {
            const isSecExplicitlySelected = selectedSectionId === sec.id && !selectedRowId && !selectedColumnId;
            const isSecContainerSelected = selectedSectionId === sec.id;
            const isDarkSec = sec.styles?.bgColor === '#0f172a' || sec.styles?.bgColor === '#0b0f19';
            const isSecScreenFull = sec.styles?.widthType === 'screen';
            const isSecCustomWidth = sec.styles?.widthType === 'custom';
            const isSecHovered = hoveredSecId === sec.id;

            const secLayout = getSectionLayoutStyles(sec.styles);

            // Background calculations
            const bgImageStyle = sec.styles?.bgImage ? `url("${sec.styles.bgImage}")` : undefined;
            const bgGradientStyle = sec.styles?.bgGradient || undefined;
            const activeBgColor = isSecHovered && sec.styles?.hoverBgColor
              ? sec.styles.hoverBgColor
              : sec.styles?.bgColor;

            // Border calculations
            const activeBorderColor = isSecHovered && sec.styles?.hoverBorderColor
              ? sec.styles.hoverBorderColor
              : sec.styles?.borderColor;
            const activeBorderWidth = normalizeUnit(sec.styles?.borderWidth);
            const activeBorderStyle = sec.styles?.borderStyle || (activeBorderWidth ? 'solid' : undefined);

            // Shadow calculations
            const activeShadow = isSecHovered && sec.styles?.hoverShadow
              ? sec.styles.hoverShadow
              : sec.styles?.shadow;

            // Hover scale transform
            const activeTransform = isSecHovered && sec.styles?.hoverScale
              ? `scale(${sec.styles.hoverScale})`
              : undefined;

            const colGutter = sec.styles?.columnGap
              ? `${Math.max(0, parseInt(sec.styles.columnGap)) / 2}px`
              : '8px';

            const hasStickyNav = sec.columns?.some((c: any) =>
              c.elements?.some((e: any) => e.type === 'navigation' && (e.styles?.isSticky ?? e.content?.isSticky))
            );
            const isSecSticky = Boolean(sec.styles?.isSticky || hasStickyNav);

            const secVAlign = sec.styles?.contentVerticalAlign || sec.styles?.verticalAlign || 'top';
            const secJustify = secVAlign === 'center' ? 'center' : secVAlign === 'bottom' ? 'flex-end' : 'flex-start';

            return (
              <React.Fragment key={sec.id}>
                <div
                  id={sec.customId || sec.id}
                  data-section-id={sec.id}
                  data-custom-id={sec.customId || ''}
                  onMouseEnter={() => setHoveredSecId(sec.id)}
                  onMouseLeave={() => setHoveredSecId(null)}
                  onDragOver={(e) => {
                    const types = e.dataTransfer.types;
                    if (types.includes('application/nextforge-layout')) {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                    }
                  }}
                  onDrop={(e) => {
                    const layoutPreset = e.dataTransfer.getData('application/nextforge-layout');
                    const plainData = e.dataTransfer.getData('text/plain') || '';
                    if (layoutPreset || plainData.startsWith('layout:')) {
                      e.preventDefault();
                      e.stopPropagation();
                      const presetId = layoutPreset || plainData.replace('layout:', '');
                      applyLayoutPresetToSection(sec.id, presetId);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    blurActiveInput();
                    setSelectedSectionId(sec.id);
                  }}
                  className={`${isSecSticky ? 'sticky top-0 z-40 shadow-md' : 'relative'} transition-all duration-200 overflow-visible ${
                    isSecScreenFull ? 'w-full self-stretch' : 'self-center mx-auto'
                  } ${
                    isDarkSec
                      ? 'bg-slate-950 text-white border border-slate-800/90 shadow-xl'
                      : 'bg-white text-slate-900 border border-slate-200/90 shadow-sm'
                  } ${
                    isSecExplicitlySelected
                      ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-100'
                      : isSecContainerSelected
                      ? 'ring-1 ring-indigo-400/40'
                      : sec.isDynamic
                      ? 'ring-1 ring-emerald-500/40 hover:border-emerald-400/70'
                      : 'hover:border-indigo-400/50'
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
                    marginTop: secIdx > 0
                      ? (sec.styles?.marginTop !== undefined && sec.styles?.marginTop !== ''
                          ? normalizeUnit(sec.styles.marginTop)
                          : '24px')
                      : secLayout.marginTop,
                    marginBottom: secLayout.marginBottom,
                    marginLeft: secLayout.marginLeft,
                    marginRight: secLayout.marginRight,
                    paddingTop: normalizeUnit(sec.styles?.paddingTop) || '20px',
                    paddingBottom: normalizeUnit(sec.styles?.paddingBottom) || '20px',
                    paddingLeft: normalizeUnit(sec.styles?.paddingLeft) || '20px',
                    paddingRight: normalizeUnit(sec.styles?.paddingRight) || '20px',
                    zIndex: isSecSticky ? 40 : (sec.styles?.zIndex !== undefined && sec.styles?.zIndex !== '' ? Number(sec.styles.zIndex) || sec.styles.zIndex : undefined),
                    borderRadius: normalizeUnit(sec.styles?.borderRadius) || (isSecScreenFull ? '0px' : '16px'),
                    borderColor: activeBorderColor,
                    borderWidth: activeBorderWidth,
                    borderStyle: activeBorderStyle,
                    boxShadow: activeShadow,
                    transform: activeTransform,
                    minHeight: normalizeUnit(sec.styles?.minHeight),
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* Background Overlay Tint / Dimmer */}
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

                  {/* Section Badge Header (Always fully visible, never clipped) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      blurActiveInput();
                      setSelectedSectionId(sec.id);
                    }}
                    className={`absolute -top-3.5 left-1/2 transform -translate-x-1/2 z-40 flex items-center flex-nowrap whitespace-nowrap space-x-1.5 text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-lg transition-all border max-w-[calc(100%-24px)] cursor-pointer ${
                      sec.isDynamic
                        ? 'bg-emerald-700 hover:bg-emerald-800 border-emerald-400/50 shadow-emerald-900/30'
                        : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-400/40'
                    }`}
                  >
                    {sec.isDynamic && (
                      <span
                        className="px-1.5 py-0.2 bg-emerald-950/80 text-emerald-200 rounded font-bold text-[9px] flex items-center space-x-1 shrink-0"
                        title="Dynamic Global Component — Synced across all pages"
                      >
                        <Globe className="w-2.5 h-2.5 shrink-0" />
                        {breakpoint !== 'mobile' && <span>GLOBAL</span>}
                      </span>
                    )}

                    {editingSecNameId === sec.id ? (
                      <input
                        type="text"
                        value={editingSecNameVal}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setEditingSecNameVal(e.target.value)}
                        onBlur={() => {
                          if (editingSecNameVal.trim()) {
                            renameSection(sec.id, editingSecNameVal.trim());
                          }
                          setEditingSecNameId(null);
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') {
                            if (editingSecNameVal.trim()) {
                              renameSection(sec.id, editingSecNameVal.trim());
                            }
                            setEditingSecNameId(null);
                          } else if (e.key === 'Escape') {
                            setEditingSecNameId(null);
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="bg-black/60 text-white font-bold text-[10px] px-1.5 py-0.5 rounded border border-white/40 focus:outline-none focus:ring-1 focus:ring-white w-28 sm:w-36"
                      />
                    ) : (
                      <span
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingSecNameId(sec.id);
                          setEditingSecNameVal(sec.name || 'SECTION');
                        }}
                        className="font-bold truncate max-w-[130px] sm:max-w-none cursor-pointer hover:underline decoration-white/40 select-none"
                        title="Double-click to rename section"
                      >
                        {sec.name || 'SECTION'}
                      </span>
                    )}

                    {breakpoint !== 'mobile' && sec.customId && (
                      <span
                        className="px-1.5 py-0.2 bg-black/40 text-indigo-200 rounded font-mono text-[9px] font-bold shrink-0 truncate max-w-[90px]"
                        title={`HTML Anchor: #${sec.customId}`}
                      >
                        #{sec.customId}
                      </span>
                    )}

                    {breakpoint !== 'mobile' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const current = sec.styles?.widthType || 'boxed';
                          const next = current === 'boxed' ? 'custom' : current === 'custom' ? 'screen' : 'boxed';
                          sec.styles = { ...sec.styles, widthType: next, customWidth: sec.styles?.customWidth || '80%' };
                          useBuilderStore.setState((s) => ({ sections: [...s.sections] }));
                        }}
                        className="px-1.5 py-0.5 bg-black/20 hover:bg-black/40 rounded text-[9px] font-bold tracking-normal transition-colors shrink-0"
                        title="Toggle Boxed / Custom % / Screen Width"
                      >
                        {sec.styles?.widthType === 'screen'
                          ? 'SCREEN'
                          : sec.styles?.widthType === 'custom'
                          ? `${(sec.styles?.customWidth || '80%').replace('%', '')}%`
                          : 'BOXED'}
                      </button>
                    )}

                    <div className="flex items-center space-x-0.5 shrink-0 pl-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copySection(sec.id);
                        }}
                        className="p-1 hover:text-amber-200 hover:bg-black/30 rounded transition-colors"
                        title="Copy Section (Ctrl+Shift+C)"
                      >
                        <ClipboardCopy className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateSection(sec.id);
                        }}
                        className="p-1 hover:text-indigo-200 hover:bg-black/30 rounded transition-colors"
                        title="Duplicate Section (Ctrl+D)"
                      >
                        <Copy className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(sec.id);
                        }}
                        className="p-1 hover:text-rose-200 hover:bg-rose-600/50 rounded transition-colors"
                        title="Delete Section (Del)"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>


                {/* Section Rows & Columns Grid */}
                {(() => {
                  const rows = sec.rows && sec.rows.length > 0
                    ? sec.rows
                    : [{ id: `${sec.id}-row-0`, columns: sec.columns }];

                  return (
                    <div className="space-y-6 relative z-10 w-full">
                      {rows.map((row, rowIdx) => {
                        const isRowSelected = selectedRowId === row.id && !selectedColumnId;
                        const isRowHovered = hoveredRowId === row.id;

                        const rowActiveBgColor = isRowHovered && row.styles?.hoverBgColor ? row.styles.hoverBgColor : row.styles?.bgColor;
                        const rowActiveBorderColor = isRowHovered && row.styles?.hoverBorderColor ? row.styles.hoverBorderColor : row.styles?.borderColor;
                        const rowActiveShadow = isRowHovered && row.styles?.hoverShadow ? row.styles.hoverShadow : row.styles?.shadow;
                        const rowActiveTransform = isRowHovered && row.styles?.hoverScale ? `scale(${row.styles.hoverScale})` : undefined;

                        // Row custom width & alignment
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

                        const isStretchCols = Boolean(sec.styles?.equalHeightColumns || row.styles?.rowVerticalAlign === 'stretch');

                        return (
                        <div
                          key={row.id}
                          onMouseEnter={() => setHoveredRowId(row.id)}
                          onMouseLeave={() => setHoveredRowId(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            blurActiveInput();
                            setSelectedSectionId(sec.id);
                          }}
                          className={`relative rounded-xl transition-all ${rowAlignClass} ${
                            isRowSelected
                              ? 'ring-2 ring-indigo-500 ring-offset-1 p-1.5 bg-indigo-50/20 shadow-xs'
                              : ''
                          }`}
                          style={{
                            width: rowCustomW || '100%',
                            maxWidth: rowMaxWidth ? `min(100%, ${rowMaxWidth})` : '100%',
                            boxSizing: 'border-box',
                            backgroundColor: rowActiveBgColor,
                            backgroundImage: row.styles?.bgImage ? `url("${row.styles.bgImage}")` : (row.styles?.bgGradient || undefined),
                            backgroundSize: row.styles?.bgSize || 'cover',
                            backgroundPosition: row.styles?.bgPosition || 'center',
                            paddingTop: row.styles?.paddingTop,
                            paddingBottom: row.styles?.paddingBottom,
                            paddingLeft: row.styles?.paddingLeft,
                            paddingRight: row.styles?.paddingRight,
                            marginTop: row.styles?.marginTop,
                            marginBottom: row.styles?.marginBottom,
                            marginLeft: rowMarginLeft,
                            marginRight: rowMarginRight,
                            zIndex: row.styles?.zIndex !== undefined && row.styles?.zIndex !== '' ? Number(row.styles?.zIndex) || row.styles?.zIndex : undefined,
                            borderRadius: row.styles?.borderRadius,
                            borderWidth: row.styles?.borderWidth,
                            borderColor: rowActiveBorderColor,
                            borderStyle: row.styles?.borderStyle || (row.styles?.borderWidth ? 'solid' : undefined),
                            boxShadow: rowActiveShadow,
                            transform: rowActiveTransform,
                            minHeight: normalizeUnit(row.styles?.minHeight),
                            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        >
                          {/* Row Indicator Badge when row is selected or section has multiple rows */}
                          {(rows.length > 1 || isRowSelected) && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                blurActiveInput();
                                setSelectedRowId(row.id, sec.id);
                              }}
                              className={`flex items-center justify-between flex-nowrap whitespace-nowrap px-3 py-1 mb-2 text-[10px] font-mono rounded-lg transition-all overflow-hidden cursor-pointer ${
                                isRowSelected
                                  ? 'bg-indigo-600/10 border border-indigo-300 shadow-2xs'
                                  : 'bg-slate-100/90 border border-slate-200 hover:border-indigo-300'
                              }`}
                              title={`Click to select Row ${rowIdx + 1}`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[10px] ${
                                  isRowSelected
                                    ? 'bg-indigo-600 text-white shadow-2xs'
                                    : 'text-indigo-700 bg-white border border-indigo-200'
                                }`}>
                                  Row {rowIdx + 1}
                                </span>
                                <span className="text-slate-500 text-[10px]">
                                  {row.columns.length} col{row.columns.length > 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateRowInSection(sec.id, row.id);
                                  }}
                                  className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 rounded-md border border-indigo-200 flex items-center space-x-1 font-bold text-[10px] transition-colors shadow-2xs"
                                  title={`Duplicate Row ${rowIdx + 1} (Ctrl+D)`}
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                  <span>Duplicate</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteRowFromSection(sec.id, row.id);
                                  }}
                                  className="px-2.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-md border border-rose-200 flex items-center space-x-1 font-bold text-[10px] transition-colors shadow-2xs"
                                  title={`Delete Row ${rowIdx + 1}`}
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                  <span>Delete Row</span>
                                </button>
                              </div>
                            </div>
                          )}

                          <div
                            className={`flex flex-wrap w-full gap-y-4 overflow-x-auto nextforge-scrollbar ${
                              isStretchCols
                                ? 'items-stretch'
                                : row.styles?.rowVerticalAlign === 'bottom'
                                ? 'items-end'
                                : row.styles?.rowVerticalAlign === 'center'
                                ? 'items-center'
                                : 'items-start'
                            }`}
                            style={{
                              marginLeft: `-${colGutter}`,
                              marginRight: `-${colGutter}`,
                              width: `calc(100% + ${parseFloat(colGutter) * 2}px)`
                            }}
                          >
                            {row.columns.map((col, colIdx) => {
                              const isColSelected = selectedColumnId === col.id;
                              let effectiveColWidth = col.widthPercentage;
                              if (breakpoint === 'mobile') {
                                effectiveColWidth = 100;
                              } else if (breakpoint === 'tablet') {
                                if (col.widthPercentage <= 34) {
                                  effectiveColWidth = 50;
                                } else if (col.widthPercentage < 100) {
                                  effectiveColWidth = Math.max(50, col.widthPercentage);
                                }
                              }

                              const isColHovered = hoveredColId === col.id;
                              const colActiveBgColor = isColHovered && col.styles?.hoverBgColor ? col.styles.hoverBgColor : col.styles?.bgColor;
                              const colActiveBorderColor = isColHovered && col.styles?.hoverBorderColor ? col.styles.hoverBorderColor : col.styles?.borderColor;
                              const colActiveShadow = isColHovered && col.styles?.hoverShadow ? col.styles.hoverShadow : col.styles?.shadow;
                              const colActiveTransform = isColHovered && col.styles?.hoverScale ? `scale(${col.styles.hoverScale})` : undefined;

                              const colVAlign = col.styles?.contentVerticalAlign || col.styles?.verticalAlign || secVAlign;
                              const colJustify = colVAlign === 'center' ? 'center' : colVAlign === 'bottom' ? 'flex-end' : 'flex-start';

                              return (
                                <div
                                  key={col.id}
                                  className={`min-w-0 flex-shrink-0 transition-all duration-300 ${isStretchCols ? 'flex flex-col' : ''}`}
                                  style={{
                                    width: `${effectiveColWidth}%`,
                                    paddingLeft: colGutter,
                                    paddingRight: colGutter,
                                    boxSizing: 'border-box'
                                  }}
                                >
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      blurActiveInput();
                                      setSelectedColumnId(col.id, row.id, sec.id);
                                    }}
                                    onMouseEnter={() => setHoveredColId(col.id)}
                                    onMouseLeave={() => setHoveredColId(null)}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === 'copy' ? 'copy' : 'move';
                                      if (dragOverColumnId !== col.id) {
                                        setDragOverColumnId(col.id);
                                      }
                                    }}
                                    onDragEnter={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setDragOverColumnId(col.id);
                                    }}
                                    onDragLeave={(e) => {
                                      e.preventDefault();
                                      if (e.currentTarget === e.target) {
                                        setDragOverColumnId(null);
                                        setDropIndicator(null);
                                      }
                                    }}
                                    onDrop={(e) => {
                                      const targetIdx = dropIndicator && dropIndicator.columnId === col.id ? dropIndicator.index : col.elements.length;
                                      handleDropAt(e, sec.id, col.id, targetIdx);
                                    }}
                                    className={`relative rounded-xl transition-all p-4 flex flex-col min-h-[140px] ${
                                      isStretchCols ? 'h-full flex-1' : ''
                                    } ${
                                      isColSelected ? 'ring-2 ring-indigo-500 shadow-md' : ''
                                    } ${
                                      col.styles?.bgColor || col.styles?.bgGradient || col.styles?.bgImage
                                        ? ''
                                        : isDarkSec
                                        ? 'border border-dashed border-slate-800 bg-slate-900/40 hover:border-slate-700'
                                        : 'border border-dashed border-slate-200 bg-slate-50/50 hover:border-slate-300'
                                    } ${
                                      dragOverColumnId === col.id
                                        ? 'ring-2 ring-indigo-500 bg-indigo-500/10 border-solid border-indigo-500'
                                        : ''
                                    }`}
                                    style={{
                                      backgroundColor: colActiveBgColor,
                                      backgroundImage: col.styles?.bgImage ? `url("${col.styles.bgImage}")` : (col.styles?.bgGradient || undefined),
                                      backgroundSize: col.styles?.bgSize || 'cover',
                                      backgroundPosition: col.styles?.bgPosition || 'center',
                                      paddingTop: col.styles?.paddingTop,
                                      paddingBottom: col.styles?.paddingBottom,
                                      paddingLeft: col.styles?.paddingLeft,
                                      paddingRight: col.styles?.paddingRight,
                                      marginTop: col.styles?.marginTop,
                                      marginBottom: col.styles?.marginBottom,
                                      marginLeft: col.styles?.marginLeft,
                                      marginRight: col.styles?.marginRight,
                                      borderRadius: col.styles?.borderRadius,
                                      borderWidth: col.styles?.borderWidth,
                                      borderColor: colActiveBorderColor,
                                      borderStyle: col.styles?.borderStyle || (col.styles?.borderWidth ? 'solid' : undefined),
                                      boxShadow: colActiveShadow,
                                      transform: colActiveTransform,
                                      minHeight: normalizeUnit(col.styles?.minHeight),
                                      height: col.styles?.height ? normalizeUnit(col.styles.height) : (isStretchCols ? '100%' : undefined),
                                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                                    }}
                                  >
                                  {/* Column Badge (Col 1 | 55% + Duplicate + Trash) */}
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedColumnId(col.id, row.id, sec.id);
                                    }}
                                    className={`absolute top-2 right-2 z-30 flex items-center flex-nowrap whitespace-nowrap space-x-1.5 text-[9px] font-mono px-2 py-0.5 rounded shadow-sm cursor-pointer transition-colors max-w-[calc(100%-16px)] shrink-0 ${
                                      isColSelected
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-900/90 text-slate-200 border border-slate-700/80 hover:bg-slate-800'
                                    }`}
                                    title={`Click to select & style Col ${colIdx + 1}`}
                                  >
                                    <span className={isColSelected ? 'text-indigo-100 font-bold' : 'text-slate-400'}>Col {colIdx + 1}</span>
                                    <span className={isColSelected ? 'text-white font-bold' : 'text-indigo-400 font-bold'}>{col.widthPercentage}%</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        duplicateColumn(sec.id, col.id);
                                      }}
                                      className="text-slate-400 hover:text-indigo-300 ml-1 transition-colors"
                                      title="Duplicate Column"
                                    >
                                      <Copy className="w-2.5 h-2.5" />
                                    </button>
                                    {row.columns.length > 1 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteColumn(sec.id, col.id);
                                        }}
                                        className="text-slate-400 hover:text-rose-400 ml-0.5 transition-colors"
                                        title="Delete Column"
                                      >
                                        <Trash2 className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Purple Drop Insertion Line Indicator */}
                                  {dragOverColumnId === col.id && (!dropIndicator || dropIndicator.columnId !== col.id) && (
                                    <div className="drag-drop-line-purple my-2 animate-pulse w-full pointer-events-none"></div>
                                  )}

                                  {/* Column Elements Container */}
                                  <div
                                    className="flex-1 pt-4 flex flex-col"
                                    style={{
                                      gap: col.styles?.gap ? normalizeUnit(col.styles.gap) : '16px',
                                      justifyContent: colJustify
                                    }}
                                  >
                                    {col.elements.length === 0 ? (
                                      <div
                                        onDragOver={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === 'copy' ? 'copy' : 'move';
                                          setDragOverColumnId(col.id);
                                          setDropIndicator({ sectionId: sec.id, columnId: col.id, index: 0 });
                                        }}
                                        onDrop={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleDropAt(e, sec.id, col.id, 0);
                                        }}
                                        className={`border border-dashed rounded-xl p-4 text-center transition-colors flex flex-col items-center justify-center min-h-[110px] overflow-hidden ${
                                          isDarkSec
                                            ? 'border-slate-800 text-slate-400'
                                            : 'border-slate-300 text-slate-500'
                                        }`}
                                      >
                                        <span className="text-[11px] font-semibold block mb-2.5 pointer-events-none">
                                          Add to Column
                                        </span>
                                        <div className="flex flex-wrap items-center justify-center gap-2">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setPickerTarget({
                                                sectionId: sec.id,
                                                columnId: col.id,
                                                columnTitle: `Col ${colIdx + 1} • ${sec.name}`
                                              });
                                            }}
                                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 shadow-xs active:scale-95 cursor-pointer"
                                            title="Add element to this column"
                                          >
                                            <Plus className="w-3 h-3" />
                                            <span>Element</span>
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setShowRowPickerSecId(showRowPickerSecId === sec.id ? null : sec.id);
                                            }}
                                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-lg text-[10px] font-bold flex items-center space-x-1 shadow-xs active:scale-95 cursor-pointer transition-all"
                                            title={`Add a new row in ${sec.name || 'this container'}`}
                                          >
                                            <Plus className="w-3 h-3" />
                                            <span>Add Row in Container</span>
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              addInnerRowToColumn(sec.id, col.id, 'two-equal');
                                            }}
                                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-bold flex items-center space-x-1 active:scale-95 cursor-pointer"
                                            title="Add inner columns inside this column"
                                          >
                                            <Columns className="w-3 h-3 text-indigo-600" />
                                            <span>Inner Col</span>
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      col.elements.map((el, elIdx) => {
                                        const isElSelected = selectedElementId === el.id;
                                        const isDraggingThis = draggingElementId === el.id;
                                        return (
                                          <div
                                            key={el.id}
                                            draggable={true}
                                            onDragStart={(e) => {
                                              e.stopPropagation();
                                              e.dataTransfer.setData('application/nextforge-element', JSON.stringify({
                                                elementId: el.id,
                                                sourceSectionId: sec.id,
                                                sourceColumnId: col.id,
                                                sourceIndex: elIdx
                                              }));
                                              e.dataTransfer.setData('text/plain', `element:${el.id}`);
                                              e.dataTransfer.effectAllowed = 'all';
                                              setDraggingElementId(el.id);
                                            }}
                                            onDragEnd={() => {
                                              setDraggingElementId(null);
                                              setDropIndicator(null);
                                            }}
                                            onDragOver={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === 'copy' ? 'copy' : 'move';
                                              const rect = e.currentTarget.getBoundingClientRect();
                                              const midY = rect.top + rect.height / 2;
                                              const targetIdx = e.clientY < midY ? elIdx : elIdx + 1;
                                              if (!dropIndicator || dropIndicator.columnId !== col.id || dropIndicator.index !== targetIdx) {
                                                setDropIndicator({ sectionId: sec.id, columnId: col.id, index: targetIdx });
                                              }
                                            }}
                                            onDrop={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              const rect = e.currentTarget.getBoundingClientRect();
                                              const midY = rect.top + rect.height / 2;
                                              const targetIdx = e.clientY < midY ? elIdx : elIdx + 1;
                                              handleDropAt(e, sec.id, col.id, targetIdx);
                                            }}
                                            className={`relative group/el transition-all duration-150 ${
                                              isDraggingThis ? 'opacity-35 scale-[0.98]' : ''
                                            }`}
                                          >
                                            {/* Drop Indicator Bar Before Element */}
                                            {dropIndicator?.columnId === col.id && dropIndicator?.index === elIdx && (
                                              <div className="h-1.5 bg-indigo-600 rounded-full my-2 animate-pulse shadow-md flex items-center justify-center relative z-40 pointer-events-none">
                                                <span className="bg-indigo-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full absolute -top-2 pointer-events-none">
                                                  Insert Here
                                                </span>
                                              </div>
                                            )}

                                            {/* Floating action bar with Drag Handle on hover / selection */}
                                            <div className={`absolute -top-3.5 right-2 z-30 flex items-center flex-nowrap whitespace-nowrap space-x-1.5 bg-indigo-600 text-white px-2 py-0.5 rounded text-[9px] shadow-md font-sans font-semibold border border-indigo-400/40 transition-opacity max-w-[calc(100%-16px)] shrink-0 ${
                                              isElSelected ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover/el:opacity-100 pointer-events-auto'
                                            }`}>
                                              <div
                                                className="cursor-grab active:cursor-grabbing hover:text-indigo-200 flex items-center pr-1 border-r border-indigo-400/40"
                                                title="Drag to reorder or move to another column"
                                              >
                                                <GripVertical className="w-3 h-3" />
                                              </div>
                                              <span className="truncate max-w-[85px]">{el.label || el.type}</span>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  duplicateElement(el.id);
                                                }}
                                                className="hover:text-indigo-200 p-0.5 transition-colors"
                                                title="Duplicate Element (Ctrl+D)"
                                              >
                                                <Copy className="w-2.5 h-2.5" />
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  deleteElement(el.id);
                                                }}
                                                className="hover:text-rose-200 p-0.5 transition-colors"
                                                title="Delete Element (Del)"
                                              >
                                                <Trash2 className="w-2.5 h-2.5" />
                                              </button>
                                            </div>

                                            <ElementRenderer
                                              element={el}
                                              isEditor={true}
                                              isSelected={isElSelected}
                                              onSelect={() => {
                                                blurActiveInput();
                                                setSelectedElementId(el.id);
                                              }}
                                            />

                                            {/* Drop Indicator Bar After Last Element */}
                                            {dropIndicator?.columnId === col.id && dropIndicator?.index === elIdx + 1 && elIdx === col.elements.length - 1 && (
                                              <div className="h-1.5 bg-indigo-600 rounded-full my-2 animate-pulse shadow-md flex items-center justify-center relative z-40 pointer-events-none">
                                                <span className="bg-indigo-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full absolute -top-2 pointer-events-none">
                                                  Insert Here
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>

                                  {/* Actions inside column: Add Element & Add Row in Column (only shown when column has elements to avoid duplicate buttons) */}
                                  {col.elements && col.elements.length > 0 && (
                                    <div
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === 'copy' ? 'copy' : 'move';
                                        setDragOverColumnId(col.id);
                                        setDropIndicator({ sectionId: sec.id, columnId: col.id, index: col.elements.length });
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDropAt(e, sec.id, col.id, col.elements.length);
                                      }}
                                      className={`mt-4 py-1.5 px-2 rounded-xl flex flex-wrap items-center justify-center gap-1.5 border transition-all ${
                                        isDarkSec
                                          ? 'bg-slate-950/80 border-slate-800'
                                          : 'bg-white border-slate-200 shadow-xs'
                                      }`}
                                    >
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPickerTarget({
                                            sectionId: sec.id,
                                            columnId: col.id,
                                            columnTitle: `Col ${colIdx + 1} • ${sec.name}`
                                          });
                                        }}
                                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all shadow-2xs active:scale-95 cursor-pointer"
                                        title="Add element to this column"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Element</span>
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowRowPickerSecId(showRowPickerSecId === sec.id ? null : sec.id);
                                        }}
                                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all shadow-2xs active:scale-95 cursor-pointer"
                                        title={`Add a new row in ${sec.name || 'this container'}`}
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Add Row in Container</span>
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addInnerRowToColumn(sec.id, col.id, 'two-equal');
                                        }}
                                        className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all shadow-2xs active:scale-95 cursor-pointer"
                                        title="Add inner columns inside this column"
                                      >
                                        <Columns className="w-3 h-3 text-indigo-500 hover:text-white" />
                                        <span>Inner Col</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  );
                })()}

                {/* Row Picker dropdown for Multi-Column Containers (when triggered from column toolbar) */}
                {showRowPickerSecId === sec.id && (
                  <div className="mt-4 px-6 flex flex-col items-center">
                    <div className="w-full p-3.5 bg-indigo-50/95 border border-indigo-200 rounded-2xl shadow-sm animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center space-x-2">
                          <Plus className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-bold text-slate-800">Add a new row under columns in this container:</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowRowPickerSecId(null);
                          }}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded hover:bg-slate-200/60"
                        >
                          ✕ Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {[
                          { id: 'container', label: '1 Col (100%)', bars: ['w-full'] },
                          { id: 'two-equal', label: 'Two equal (50/50)', bars: ['w-1/2', 'w-1/2'] },
                          { id: 'three-equal', label: 'Three equal', bars: ['w-1/3', 'w-1/3', 'w-1/3'] },
                          { id: 'four-equal', label: 'Four equal (25%)', bars: ['w-1/4', 'w-1/4', 'w-1/4', 'w-1/4'] },
                          { id: 'five-columns', label: 'Five columns', bars: ['w-1/5', 'w-1/5', 'w-1/5', 'w-1/5', 'w-1/5'] },
                          { id: 'six-columns', label: 'Six columns', bars: ['w-1/6', 'w-1/6', 'w-1/6', 'w-1/6', 'w-1/6', 'w-1/6'] },
                          { id: 'sidebar-left', label: 'Sidebar left (30/70)', bars: ['w-[30%]', 'w-[70%]'] },
                          { id: 'sidebar-right', label: 'Sidebar right (70/30)', bars: ['w-[70%]', 'w-[30%]'] },
                          { id: 'wide-left', label: 'Wide left (65/35)', bars: ['w-[65%]', 'w-[35%]'] },
                          { id: 'wide-right', label: 'Wide right (35/65)', bars: ['w-[35%]', 'w-[65%]'] },
                          { id: 'center-focus', label: 'Center focus', bars: ['w-1/4', 'w-1/2', 'w-1/4'] },
                          { id: 'wide-center', label: 'Wide center', bars: ['w-1/5', 'w-3/5', 'w-1/5'] }
                        ].map((preset) => (
                          <button
                            key={preset.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              addRowToSection(sec.id, preset.id);
                              setShowRowPickerSecId(null);
                            }}
                            className="p-2.5 bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-xs rounded-xl flex flex-col justify-between h-14 group text-left transition-all"
                          >
                            <span className="text-[10px] font-bold text-slate-700 group-hover:text-indigo-600 truncate">{preset.label}</span>
                            <div className="flex items-center gap-1 w-full h-2 mt-1">
                              {preset.bars.map((b, bi) => (
                                <div key={bi} className={`${b} h-full bg-indigo-100 group-hover:bg-indigo-300 border border-indigo-200 rounded-[2px] transition-colors`} />
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                </div>

                {/* Separate "+ Add New Container" Divider centered between sections */}
                <div
                  style={{ marginTop: '16px', marginBottom: '36px' }}
                  className="py-2 flex items-center justify-center relative z-20 group"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'copy';
                    if (dragOverAddContainerIdx !== secIdx + 1) {
                      setDragOverAddContainerIdx(secIdx + 1);
                    }
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverAddContainerIdx(secIdx + 1);
                  }}
                  onDragLeave={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    if (
                      e.clientY < rect.top ||
                      e.clientY >= rect.bottom ||
                      e.clientX < rect.left ||
                      e.clientX >= rect.right
                    ) {
                      setDragOverAddContainerIdx(null);
                    }
                  }}
                  onDrop={(e) => handleDropOnAddContainer(e, secIdx + 1)}
                >
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div
                      className={`w-full border-t-2 transition-all ${
                        dragOverAddContainerIdx === secIdx + 1
                          ? 'border-indigo-600 scale-y-125'
                          : 'border-dashed border-indigo-200/80 group-hover:border-indigo-400'
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addSection('container', secIdx + 1);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = 'copy';
                      setDragOverAddContainerIdx(secIdx + 1);
                    }}
                    onDrop={(e) => handleDropOnAddContainer(e, secIdx + 1)}
                    className={`relative px-5 py-2 rounded-full text-xs font-extrabold shadow-sm transition-all flex items-center space-x-2 active:scale-95 group/btn cursor-pointer ${
                      dragOverAddContainerIdx === secIdx + 1
                        ? 'bg-indigo-600 text-white border-2 border-indigo-600 ring-4 ring-indigo-200 scale-105 shadow-lg'
                        : 'bg-white hover:bg-indigo-600 text-slate-700 hover:text-white border-2 border-indigo-200 hover:border-indigo-600 hover:shadow-lg'
                    }`}
                    title={`Insert a new container after ${sec.name || 'this section'}`}
                  >
                    <Plus
                      className={`w-4 h-4 transition-all ${
                        dragOverAddContainerIdx === secIdx + 1
                          ? 'text-white rotate-90 scale-110'
                          : 'text-indigo-600 group-hover/btn:text-white group-hover/btn:rotate-90'
                      }`}
                    />
                    <span>
                      {dragOverAddContainerIdx === secIdx + 1
                        ? 'Drop to Create Container with Element'
                        : 'Add New Container'}
                    </span>
                  </button>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Element Picker Modal Dialog with Live Search */}
      <ElementPickerModal
        isOpen={pickerTarget !== null}
        columnTitle={pickerTarget?.columnTitle}
        onClose={() => setPickerTarget(null)}
        onSelectElement={(widgetType) => {
          if (pickerTarget) {
            addElementToColumn(pickerTarget.sectionId, pickerTarget.columnId, widgetType);
            setPickerTarget(null);
          }
        }}
      />
    </main>
  );
}
