import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Pipette, Check, Copy, X } from 'lucide-react';

export interface ModernColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  allowAlpha?: boolean;
  presets?: string[];
  hidePresets?: boolean;
  labelPosition?: 'left' | 'top';
  className?: string;
  onReset?: () => void;
}

const DEFAULT_PRESETS = [
  'transparent',
  '#ffffff',
  '#64748b',
  '#0f172a',
  '#6366f1',
  '#3b82f6',
  '#10b981',
  '#ef4444'
];

// Color Conversion Helpers
function hexToHsv(hex: string): { h: number; s: number; v: number; a: number } {
  if (!hex || hex === 'transparent') return { h: 240, s: 0, v: 100, a: 0 };
  let c = hex.replace('#', '').trim();
  let a = 1;
  if (c.length === 8) {
    a = parseInt(c.slice(6, 8), 16) / 255;
    c = c.slice(0, 6);
  }
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  if (c.length !== 6) return { h: 240, s: 0, v: 100, a: 1 };

  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff > 0) {
    if (max === r) h = ((g - b) / diff) % 6;
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : Math.round((diff / max) * 100);
  const v = Math.round(max * 100);

  return { h, s, v, a: Math.round(a * 100) / 100 };
}

function hsvToHex(h: number, s: number, v: number, a = 1): string {
  s = s / 100;
  v = v / 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (a < 1) {
    const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');
    return `${hexColor}${alphaHex}`;
  }
  return hexColor;
}

export default function ModernColorPicker({
  label,
  value,
  onChange,
  allowAlpha = true,
  presets = DEFAULT_PRESETS,
  hidePresets = false,
  labelPosition = 'left',
  className = '',
  onReset
}: ModernColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const satPlaneRef = useRef<HTMLDivElement>(null);

  const initialHsv = hexToHsv(value || '#ffffff');
  const [hue, setHue] = useState(initialHsv.h);
  const [sat, setSat] = useState(initialHsv.s);
  const [val, setVal] = useState(initialHsv.v);
  const [alpha, setAlpha] = useState(initialHsv.a);
  const [textInput, setTextInput] = useState(value || '#ffffff');

  // Floating Popover smart coordinates
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 264;
    const popoverHeight = 350;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Smart vertical flip: If space below is tighter than 350px and there is more space above, open ABOVE!
    let top: number;
    if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
      top = rect.top - popoverHeight - 8;
    } else {
      top = rect.bottom + 8;
    }

    // Viewport vertical clamping
    top = Math.max(10, Math.min(window.innerHeight - popoverHeight - 10, top));

    // Horizontal placement: align right edge of popover with trigger's right edge so it opens inward towards page
    let left = rect.right - popoverWidth;
    if (left < 10) {
      left = rect.left;
    }
    // Viewport horizontal clamping
    left = Math.max(10, Math.min(window.innerWidth - popoverWidth - 10, left));

    setPopoverCoords({ top, left });
  }, []);

  useEffect(() => {
    setTextInput(value || '#ffffff');
    const hsv = hexToHsv(value || '#ffffff');
    setHue(hsv.h);
    setSat(hsv.s);
    setVal(hsv.v);
    setAlpha(hsv.a);
  }, [value]);

  // Recalculate position when opened, and on scroll or resize
  useEffect(() => {
    if (!isOpen) return;
    updateCoords();

    const handleScrollOrResize = () => {
      updateCoords();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, updateCoords]);

  // Close popover when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const updateColor = useCallback((h: number, s: number, v: number, a: number) => {
    const hex = hsvToHex(h, s, v, a);
    setTextInput(hex);
    onChange(hex);
  }, [onChange]);

  // Saturation / Value plane mouse handler
  const handleSatPlaneMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const updateFromMouse = (moveEvent: MouseEvent) => {
      if (!satPlaneRef.current) return;
      const rect = satPlaneRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, moveEvent.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, moveEvent.clientY - rect.top));

      const newSat = Math.round((x / rect.width) * 100);
      const newVal = Math.round((1 - y / rect.height) * 100);

      setSat(newSat);
      setVal(newVal);
      updateColor(hue, newSat, newVal, alpha);
    };

    updateFromMouse(e.nativeEvent);

    const onMouseMove = (moveEvent: MouseEvent) => {
      updateFromMouse(moveEvent);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTextInput(raw);
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw.trim()) || raw.trim() === 'transparent') {
      onChange(raw.trim());
    }
  };

  const handleEyedropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          onChange(result.sRGBHex);
        }
      } catch (err) {
        // Eyedropper cancelled or failed
      }
    }
  };

  const copyColor = () => {
    navigator.clipboard.writeText(value || '#ffffff');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isTransparent = value === 'transparent' || alpha === 0;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {labelPosition === 'top' ? (
        /* Top Label Layout: clean, un-squished, professional */
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            {label && (
              <label className="text-[10px] font-bold text-slate-600 select-none uppercase tracking-wider truncate">
                {label}
              </label>
            )}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                title="Reset to default"
                className="text-[9px] font-medium text-slate-400 hover:text-rose-600 px-1 py-0.5 rounded hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex items-center space-x-1.5 w-full">
            {/* Swatch trigger */}
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-7 h-7 rounded-lg border border-slate-300 shadow-2xs cursor-pointer shrink-0 relative overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
              style={{
                backgroundColor: isTransparent ? '#ffffff' : (value || '#ffffff'),
                backgroundImage: isTransparent
                  ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)'
                  : undefined,
                backgroundSize: isTransparent ? '6px 6px' : undefined,
                backgroundPosition: isTransparent ? '0 0, 0 3px, 3px -3px, -3px 0px' : undefined
              }}
              title={`Click to pick color for ${label || 'element'}`}
            >
              {isTransparent && <span className="text-[9px] font-bold text-rose-500">⊘</span>}
            </button>

            {/* Color Code Input Field */}
            <input
              type="text"
              value={textInput}
              onChange={handleTextChange}
              placeholder="#ffffff"
              className="flex-1 min-w-0 px-2 py-1 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 text-center uppercase focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>
        </div>
      ) : (
        /* Left Label Layout: standard row */
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {label && (
              <label className="text-[11px] font-semibold text-slate-700 select-none">
                {label}
              </label>
            )}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                title="Reset to default"
                className="text-[9px] font-medium text-slate-400 hover:text-rose-600 px-1.5 py-0.5 rounded hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex items-center space-x-1.5">
            {/* Swatch trigger */}
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-6 h-6 rounded-lg border border-slate-300/80 shadow-2xs cursor-pointer relative overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
              style={{
                backgroundColor: isTransparent ? '#ffffff' : (value || '#ffffff'),
                backgroundImage: isTransparent
                  ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)'
                  : undefined,
                backgroundSize: isTransparent ? '6px 6px' : undefined,
                backgroundPosition: isTransparent ? '0 0, 0 3px, 3px -3px, -3px 0px' : undefined
              }}
              title="Click to open modern color picker"
            >
              {isTransparent && <span className="text-[9px] font-bold text-rose-500">⊘</span>}
            </button>

            {/* Color Code Input Field */}
            <input
              type="text"
              value={textInput}
              onChange={handleTextChange}
              placeholder="#ffffff"
              className="w-24 px-2 py-1 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 text-center uppercase focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>
        </div>
      )}

      {/* Quick-Pick Default Swatches Row (Hidden if hidePresets is true) */}
      {!hidePresets && presets && presets.length > 0 && (
        <div className="grid grid-cols-8 gap-1.5 pt-0.5 w-full">
          {presets.map((color, idx) => {
            const isSelected = (value || '').toLowerCase() === color.toLowerCase();
            const isColorTransparent = color === 'transparent';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(color);
                  setTextInput(color);
                }}
                className={`w-full aspect-square rounded-md transition-all relative overflow-hidden flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-indigo-600 ring-offset-1 scale-105 shadow-xs z-10'
                    : 'border border-slate-300/80 hover:scale-110 hover:shadow-xs hover:border-indigo-400'
                }`}
                style={{
                  backgroundColor: isColorTransparent ? '#ffffff' : color,
                  backgroundImage: isColorTransparent
                    ? 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)'
                    : undefined,
                  backgroundSize: isColorTransparent ? '4px 4px' : undefined,
                  backgroundPosition: isColorTransparent ? '0 0, 0 2px, 2px -2px, -2px 0px' : undefined
                }}
                title={color}
              >
                {isColorTransparent && <span className="text-[9px] font-bold text-rose-500">⊘</span>}
                {isSelected && !isColorTransparent && (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: ['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0'].includes(color)
                        ? '#4f46e5'
                        : '#ffffff'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Modern Floating Color Picker Popover Portaled to body with Viewport Clamping */}
      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[99999] w-64 bg-white rounded-2xl border border-slate-200/90 p-3 text-slate-800 animate-fade-in"
            style={{
              top: `${popoverCoords.top}px`,
              left: `${popoverCoords.left}px`,
              width: '264px',
              maxHeight: 'min(90vh, 380px)',
              overflowY: 'auto',
              boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider truncate max-w-[200px]">
                {label || 'Color Picker'}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Saturation / Brightness 2D Surface */}
            <div
              ref={satPlaneRef}
              onMouseDown={handleSatPlaneMouseDown}
              className="w-full h-32 rounded-xl relative overflow-hidden cursor-crosshair select-none shadow-inner"
              style={{
                backgroundColor: `hsl(${hue}, 100%, 50%)`,
                backgroundImage: `linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)`
              }}
            >
              {/* Pointer pin */}
              <div
                className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${sat}%`,
                  top: `${100 - val}%`,
                  backgroundColor: value || '#ffffff'
                }}
              />
            </div>

            {/* Hue Rainbow Slider */}
            <div className="mt-3 space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                  <span>HUE</span>
                  <span>{hue}°</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={(e) => {
                      const h = parseInt(e.target.value);
                      setHue(h);
                      updateColor(h, sat, val, alpha);
                    }}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer outline-none"
                    style={{
                      background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                    }}
                  />
                </div>
              </div>

              {/* Opacity / Alpha Slider */}
              {allowAlpha && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                    <span>OPACITY</span>
                    <span>{Math.round(alpha * 100)}%</span>
                  </div>
                  <div
                    className="relative flex items-center rounded-full overflow-hidden p-0.5"
                    style={{
                      backgroundImage: 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                      backgroundSize: '6px 6px'
                    }}
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={alpha}
                      onChange={(e) => {
                        const a = parseFloat(e.target.value);
                        setAlpha(a);
                        updateColor(hue, sat, val, a);
                      }}
                      className="w-full h-3 rounded-full appearance-none cursor-pointer outline-none"
                      style={{
                        background: `linear-gradient(to right, transparent, ${hsvToHex(hue, sat, val, 1)})`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Color Actions & Eyedropper */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                {'EyeDropper' in window && (
                  <button
                    type="button"
                    onClick={handleEyedropper}
                    className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                    title="Pick pixel from screen (Eyedropper)"
                  >
                    <Pipette className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={copyColor}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors flex items-center space-x-1 text-[10px] font-semibold cursor-pointer"
                  title="Copy color hex"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onChange('transparent');
                  setTextInput('transparent');
                }}
                className="px-2 py-1 text-[10px] font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
