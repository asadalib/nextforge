import React, { useState } from 'react';
import {
  Link2,
  Unlink2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  Maximize2,
  Move,
  Layers,
  RotateCcw
} from 'lucide-react';
import { ElementStyles } from '../../types/builder';

interface AdvancedSpacingControlsProps {
  styles: ElementStyles;
  onUpdateStyles: (newStyles: Partial<ElementStyles>) => void;
  showGap?: boolean;
  showZIndex?: boolean;
  titlePrefix?: string;
  defaultPadding?: number;
  defaultMargin?: number;
}

const parseNumber = (val: string | number | undefined, defaultVal = 0): number => {
  if (val === undefined || val === null || val === '') return defaultVal;
  if (typeof val === 'number') return val;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultVal : parsed;
};

export const AdvancedSpacingControls: React.FC<AdvancedSpacingControlsProps> = ({
  styles,
  onUpdateStyles,
  showGap = true,
  showZIndex = true,
  titlePrefix = '',
  defaultPadding = 0,
  defaultMargin = 0
}) => {
  // Collapsible cards state
  const [paddingOpen, setPaddingOpen] = useState<boolean>(true);
  const [marginOpen, setMarginOpen] = useState<boolean>(true);
  const [spacingOpen, setSpacingOpen] = useState<boolean>(true);

  // Current 4-way padding values
  const padTop = parseNumber(styles.paddingTop, defaultPadding);
  const padRight = parseNumber(styles.paddingRight, defaultPadding);
  const padBottom = parseNumber(styles.paddingBottom, defaultPadding);
  const padLeft = parseNumber(styles.paddingLeft, defaultPadding);

  // Current 4-way margin values
  const marTop = parseNumber(styles.marginTop, defaultMargin);
  const marRight = parseNumber(styles.marginRight, defaultMargin);
  const marBottom = parseNumber(styles.marginBottom, defaultMargin);
  const marLeft = parseNumber(styles.marginLeft, defaultMargin);

  // Link state: initialized to true if all sides are equal
  const [paddingLinked, setPaddingLinked] = useState<boolean>(
    padTop === padRight && padRight === padBottom && padBottom === padLeft
  );
  const [marginLinked, setMarginLinked] = useState<boolean>(
    marTop === marRight && marRight === marBottom && marBottom === marLeft
  );

  // Current Gap & Z-Index
  const currentGap = parseNumber(styles.gap || styles.columnGap, 0);
  const currentZIndex = parseNumber(styles.zIndex, 0);

  // Update Padding helper
  const handlePaddingChange = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    const clamped = Math.max(0, value);
    if (paddingLinked) {
      onUpdateStyles({
        paddingTop: `${clamped}px`,
        paddingRight: `${clamped}px`,
        paddingBottom: `${clamped}px`,
        paddingLeft: `${clamped}px`
      });
    } else {
      switch (side) {
        case 'top':
          onUpdateStyles({ paddingTop: `${clamped}px` });
          break;
        case 'right':
          onUpdateStyles({ paddingRight: `${clamped}px` });
          break;
        case 'bottom':
          onUpdateStyles({ paddingBottom: `${clamped}px` });
          break;
        case 'left':
          onUpdateStyles({ paddingLeft: `${clamped}px` });
          break;
      }
    }
  };

  const handlePaddingPreset = (presetPx: number) => {
    onUpdateStyles({
      paddingTop: `${presetPx}px`,
      paddingRight: `${presetPx}px`,
      paddingBottom: `${presetPx}px`,
      paddingLeft: `${presetPx}px`
    });
  };

  const resetPadding = () => {
    onUpdateStyles({
      paddingTop: '0px',
      paddingRight: '0px',
      paddingBottom: '0px',
      paddingLeft: '0px'
    });
  };

  // Update Margin helper
  const handleMarginChange = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    if (marginLinked) {
      onUpdateStyles({
        marginTop: `${value}px`,
        marginRight: `${value}px`,
        marginBottom: `${value}px`,
        marginLeft: `${value}px`
      });
    } else {
      switch (side) {
        case 'top':
          onUpdateStyles({ marginTop: `${value}px` });
          break;
        case 'right':
          onUpdateStyles({ marginRight: `${value}px` });
          break;
        case 'bottom':
          onUpdateStyles({ marginBottom: `${value}px` });
          break;
        case 'left':
          onUpdateStyles({ marginLeft: `${value}px` });
          break;
      }
    }
  };

  const handleMarginPreset = (presetPx: number) => {
    onUpdateStyles({
      marginTop: `${presetPx}px`,
      marginRight: `${presetPx}px`,
      marginBottom: `${presetPx}px`,
      marginLeft: `${presetPx}px`
    });
  };

  const resetMargin = () => {
    onUpdateStyles({
      marginTop: '0px',
      marginRight: '0px',
      marginBottom: '0px',
      marginLeft: '0px'
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. 4-WAY PADDING CONTROL */}
      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div
            onClick={() => setPaddingOpen(!paddingOpen)}
            className="flex items-center space-x-1.5 cursor-pointer select-none group"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {titlePrefix ? `${titlePrefix} Padding` : 'Padding'}
            </span>
            {paddingOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setPaddingLinked(!paddingLinked)}
              title={paddingLinked ? 'Sides linked (click to unlink)' : 'Sides unlinked (click to link)'}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition-all ${
                paddingLinked
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
            >
              {paddingLinked ? <Link2 className="w-3.5 h-3.5" /> : <Unlink2 className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-bold">{paddingLinked ? 'Linked' : 'Unlinked'}</span>
            </button>
            <button
              type="button"
              onClick={resetPadding}
              title="Reset padding to 0px"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {paddingOpen && (
          <>
            {/* 4 Sides Grid (Top, Right, Bottom, Left) */}
            <div className="grid grid-cols-4 gap-1.5">
              {/* Top */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 px-0.5">
              <span className="flex items-center space-x-0.5">
                <ArrowUp className="w-2.5 h-2.5 text-indigo-500" />
                <span>Top</span>
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                min="0"
                max="300"
                value={padTop}
                onChange={(e) => handlePaddingChange('top', parseInt(e.target.value) || 0)}
                className="w-full pl-2 pr-5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <div className="absolute right-1 top-0.5 bottom-0.5 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => handlePaddingChange('top', padTop + 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronUp className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePaddingChange('top', padTop - 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 px-0.5">
              <span className="flex items-center space-x-0.5">
                <ArrowRight className="w-2.5 h-2.5 text-indigo-500" />
                <span>Right</span>
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                min="0"
                max="300"
                value={padRight}
                onChange={(e) => handlePaddingChange('right', parseInt(e.target.value) || 0)}
                className="w-full pl-2 pr-5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <div className="absolute right-1 top-0.5 bottom-0.5 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => handlePaddingChange('right', padRight + 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronUp className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePaddingChange('right', padRight - 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 px-0.5">
              <span className="flex items-center space-x-0.5">
                <ArrowDown className="w-2.5 h-2.5 text-indigo-500" />
                <span>Bottom</span>
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                min="0"
                max="300"
                value={padBottom}
                onChange={(e) => handlePaddingChange('bottom', parseInt(e.target.value) || 0)}
                className="w-full pl-2 pr-5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <div className="absolute right-1 top-0.5 bottom-0.5 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => handlePaddingChange('bottom', padBottom + 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronUp className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePaddingChange('bottom', padBottom - 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Left */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 px-0.5">
              <span className="flex items-center space-x-0.5">
                <ArrowLeft className="w-2.5 h-2.5 text-indigo-500" />
                <span>Left</span>
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                min="0"
                max="300"
                value={padLeft}
                onChange={(e) => handlePaddingChange('left', parseInt(e.target.value) || 0)}
                className="w-full pl-2 pr-5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <div className="absolute right-1 top-0.5 bottom-0.5 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => handlePaddingChange('left', padLeft + 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronUp className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePaddingChange('left', padLeft - 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Padding Presets */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
            <span>Presets</span>
            <span>px</span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {[0, 8, 16, 24, 32, 48].map((p) => {
              const isActive = padTop === p && padRight === p && padBottom === p && padLeft === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePaddingPreset(p)}
                  className={`py-1 text-[10px] font-mono font-bold rounded-lg border transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </>
    )}
  </div>

      {/* 2. 4-WAY MARGIN CONTROL */}
      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div
            onClick={() => setMarginOpen(!marginOpen)}
            className="flex items-center space-x-1.5 cursor-pointer select-none group"
          >
            <Move className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {titlePrefix ? `${titlePrefix} Margin` : 'Margin'}
            </span>
            {marginOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setMarginLinked(!marginLinked)}
              title={marginLinked ? 'Sides linked (click to unlink)' : 'Sides unlinked (click to link)'}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition-all ${
                marginLinked
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
            >
              {marginLinked ? <Link2 className="w-3.5 h-3.5" /> : <Unlink2 className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-bold">{marginLinked ? 'Linked' : 'Unlinked'}</span>
            </button>
            <button
              type="button"
              onClick={resetMargin}
              title="Reset margin to 0px"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {marginOpen && (
          <>
            {/* 4 Sides Grid (Top, Right, Bottom, Left) */}
            <div className="grid grid-cols-4 gap-1.5">
          {/* Top */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 px-0.5">
              <span className="flex items-center space-x-0.5">
                <ArrowUp className="w-2.5 h-2.5 text-indigo-500" />
                <span>Top</span>
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                min="-200"
                max="300"
                value={marTop}
                onChange={(e) => handleMarginChange('top', parseInt(e.target.value) || 0)}
                className="w-full pl-2 pr-5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <div className="absolute right-1 top-0.5 bottom-0.5 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => handleMarginChange('top', marTop + 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronUp className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMarginChange('top', marTop - 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 px-0.5">
              <span className="flex items-center space-x-0.5">
                <ArrowRight className="w-2.5 h-2.5 text-indigo-500" />
                <span>Right</span>
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                min="-200"
                max="300"
                value={marRight}
                onChange={(e) => handleMarginChange('right', parseInt(e.target.value) || 0)}
                className="w-full pl-2 pr-5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <div className="absolute right-1 top-0.5 bottom-0.5 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => handleMarginChange('right', marRight + 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronUp className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMarginChange('right', marRight - 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 px-0.5">
              <span className="flex items-center space-x-0.5">
                <ArrowDown className="w-2.5 h-2.5 text-indigo-500" />
                <span>Bottom</span>
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                min="-200"
                max="300"
                value={marBottom}
                onChange={(e) => handleMarginChange('bottom', parseInt(e.target.value) || 0)}
                className="w-full pl-2 pr-5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <div className="absolute right-1 top-0.5 bottom-0.5 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => handleMarginChange('bottom', marBottom + 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronUp className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMarginChange('bottom', marBottom - 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Left */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 px-0.5">
              <span className="flex items-center space-x-0.5">
                <ArrowLeft className="w-2.5 h-2.5 text-indigo-500" />
                <span>Left</span>
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                min="-200"
                max="300"
                value={marLeft}
                onChange={(e) => handleMarginChange('left', parseInt(e.target.value) || 0)}
                className="w-full pl-2 pr-5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <div className="absolute right-1 top-0.5 bottom-0.5 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => handleMarginChange('left', marLeft + 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronUp className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMarginChange('left', marLeft - 2)}
                  className="h-2.5 w-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Margin Presets */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
            <span>Presets</span>
            <span>px</span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {[0, 8, 16, 24, 32, 48].map((m) => {
              const isActive = marTop === m && marRight === m && marBottom === m && marLeft === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMarginPreset(m)}
                  className={`py-1 text-[10px] font-mono font-bold rounded-lg border transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </>
    )}
  </div>

      {/* 3. SPACING & POSITIONING (GAP & Z-INDEX) */}
      {(showGap || showZIndex) && (
        <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 shadow-2xs space-y-3">
          <div
            onClick={() => setSpacingOpen(!spacingOpen)}
            className="flex items-center justify-between cursor-pointer select-none group"
          >
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {titlePrefix ? `${titlePrefix} Spacing & Layer` : 'Spacing & Layer'}
              </span>
            </div>
            {spacingOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            )}
          </div>

          {spacingOpen && (
            <>
              {/* Gap / Inner Spacing */}
              {showGap && (
                <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-600">
                  Inner Spacing / Gap
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {currentGap}px
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="64"
                  step="2"
                  value={currentGap}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    onUpdateStyles({ gap: `${val}px`, columnGap: `${val}px` });
                  }}
                  className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="relative w-16">
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={currentGap}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      onUpdateStyles({ gap: `${val}px`, columnGap: `${val}px` });
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                  />
                  <span className="absolute right-1.5 top-1 text-[10px] font-bold text-slate-400">px</span>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-1 pt-0.5">
                {[0, 8, 12, 16, 24, 32].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onUpdateStyles({ gap: `${g}px`, columnGap: `${g}px` })}
                    className={`py-1 text-[10px] font-mono font-bold rounded border transition-all ${
                      currentGap === g
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Z-Index (Layer Order) */}
          {showZIndex && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-600">
                  Z-Index (Layer Stacking)
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {currentZIndex === 0 ? 'Auto (0)' : currentZIndex}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="-10"
                  max="1000"
                  value={currentZIndex}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    onUpdateStyles({ zIndex: val });
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => onUpdateStyles({ zIndex: 0 })}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors shrink-0"
                >
                  Auto
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1 pt-0.5">
                {[0, 10, 20, 30, 50].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => onUpdateStyles({ zIndex: z })}
                    className={`py-1 text-[10px] font-mono font-bold rounded border transition-all ${
                      currentZIndex === z
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    z-{z}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )}
</div>
  );
};
export default AdvancedSpacingControls;