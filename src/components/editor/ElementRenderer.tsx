import React, { useState, useEffect } from 'react';
import {
  ArrowRight, ArrowLeft, MoveLeft, MoveRight, Box, Check, CheckCircle2, CheckSquare, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight,
  CreditCard, DollarSign, Flame, Globe, Heart, HelpCircle, Image as ImageIcon,
  Mail, MapPin, MessageSquare, Play, Rocket, Shield, Sparkles, Star,
  Trophy, User, Users, Video, Zap, Bell, Code, ExternalLink, Clock, Phone,
  AlertTriangle, XCircle, Info, SplitSquareVertical, Menu, X, Columns, Trash2, Copy, Plus, GripVertical,
  Link2, Unlink
} from 'lucide-react';
import { ElementModel, NavLinkItem } from '../../types/builder';
import { useBuilderStore } from '../../store/useBuilderStore';
import ElementPickerModal from './ElementPickerModal';
import { parseVideoUrl, getClipPathForShape, getVideoOverlayCss } from '../../utils/videoUtils';

// Helper to normalize CSS values (e.g. 20 -> 20px)
export function normalizeUnit(val?: string | number): string | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'number') return `${val}px`;
  const trimmed = String(val).trim();
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
  return trimmed;
}

export function applyShadowColor(shadow?: string, shadowColor?: string): string | undefined {
  if (!shadow || shadow === 'none') {
    if (shadowColor && shadowColor !== 'transparent') {
      return `0 10px 25px -5px ${shadowColor}`;
    }
    return undefined;
  }
  if (!shadowColor || shadowColor === 'transparent') {
    return shadow;
  }
  const colorRegex = /(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|hsl\([^)]+\))/g;
  if (colorRegex.test(shadow)) {
    return shadow.replace(colorRegex, shadowColor);
  }
  return `${shadow} ${shadowColor}`;
}

export function getSectionLayoutStyles(styles?: ElementStyles) {
  const isScreen = styles?.widthType === 'screen';
  const isCustom = styles?.widthType === 'custom';

  const rawTop = styles?.marginTop;
  const rawBottom = styles?.marginBottom;
  const rawLeft = styles?.marginLeft;
  const rawRight = styles?.marginRight;

  const numLeft = rawLeft !== undefined && rawLeft !== '' ? parseInt(String(rawLeft), 10) || 0 : 0;
  const numRight = rawRight !== undefined && rawRight !== '' ? parseInt(String(rawRight), 10) || 0 : 0;

  const normTop = normalizeUnit(rawTop) || '0px';
  const normBottom = normalizeUnit(rawBottom) || '0px';

  const sectionAlign = styles?.sectionAlign || 'center';
  const totalHMargin = numLeft + numRight;

  let marginLeft = 'auto';
  let marginRight = 'auto';
  let alignSelf: 'center' | 'flex-start' | 'flex-end' | 'stretch' = 'center';

  if (isScreen && totalHMargin === 0) {
    marginLeft = '0px';
    marginRight = '0px';
    alignSelf = 'stretch';
  } else if (sectionAlign === 'left') {
    marginLeft = numLeft > 0 ? `${numLeft}px` : '0px';
    marginRight = 'auto';
    alignSelf = 'flex-start';
  } else if (sectionAlign === 'right') {
    marginLeft = 'auto';
    marginRight = numRight > 0 ? `${numRight}px` : '0px';
    alignSelf = 'flex-end';
  } else {
    // center
    if (numLeft > 0 && numRight > 0 && numLeft !== numRight) {
      marginLeft = `${numLeft}px`;
      marginRight = `${numRight}px`;
    } else {
      marginLeft = 'auto';
      marginRight = 'auto';
    }
    alignSelf = 'center';
  }

  let width: string = '100%';
  let maxWidth: string | undefined = undefined;

  if (isScreen) {
    if (totalHMargin > 0) {
      width = `calc(100% - ${totalHMargin}px)`;
    } else {
      width = '100%';
    }
    maxWidth = 'none';
  } else if (isCustom) {
    const pct = styles?.customWidth
      ? (styles.customWidth.includes('%') || styles.customWidth.includes('px') ? styles.customWidth : `${styles.customWidth}%`)
      : '80%';
    if (totalHMargin > 0) {
      width = `calc(${pct} - ${totalHMargin}px)`;
    } else {
      width = pct;
    }
    maxWidth = '100%';
  } else {
    // Boxed (1180px)
    if (totalHMargin > 0) {
      width = `calc(100% - ${totalHMargin}px)`;
      maxWidth = `min(1180px, calc(100% - ${totalHMargin}px))`;
    } else {
      width = '100%';
      maxWidth = '1180px';
    }
  }

  return {
    marginTop: normTop,
    marginBottom: normBottom,
    marginLeft,
    marginRight,
    width,
    maxWidth,
    alignSelf
  };
}

// Helper to map icon names to Lucide icon components from comprehensive icon registry
import { getLucideIcon } from './iconRegistry';
export { getLucideIcon };

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

// Interactive Button Widget with live hover effects, border customization, animations, and inside transition overlays
function InteractiveButtonElement({
  content,
  styles,
}: {
  content: Record<string, any>;
  styles: ElementStyles;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const preset = styles.buttonPreset || 'solid';
  const primaryColor = styles.bgColor || '#6366f1';
  const textColor = styles.color || '#ffffff';

  // Modern, refined, subtle default shadows per preset
  const DEFAULT_PRESET_SHADOWS: Record<string, string> = {
    solid: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
    outline: 'none',
    soft: 'none',
    gradient: `0 4px 14px -3px ${primaryColor}40`,
    glow: `0 0 12px 1px ${primaryColor}50, 0 2px 6px rgba(0,0,0,0.06)`,
    pill: '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
    glass: '0 4px 16px 0 rgba(0, 0, 0, 0.06)',
    '3d': '0 3px 0 0 rgba(0,0,0,0.18), 0 3px 6px rgba(0,0,0,0.06)',
    minimal: 'none',
    shine: '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.4)',
  };

  const hasExplicitShadow = styles.shadow !== undefined && styles.shadow !== '';
  const defaultPresetShadow = DEFAULT_PRESET_SHADOWS[preset] || DEFAULT_PRESET_SHADOWS.solid;
  let btnShadow = hasExplicitShadow
    ? (styles.shadow === 'none' ? 'none' : styles.shadow)
    : defaultPresetShadow;

  // Base preset styling
  let btnBg = primaryColor;
  let btnColor = textColor;
  let btnRadius = normalizeUnit(styles.borderRadius) || '12px';
  let btnTransform: string | undefined = undefined;
  let btnBgImage: string | undefined = styles.bgGradient || undefined;
  let btnBackdrop: string | undefined = undefined;
  let defaultBorder = 'none';

  switch (preset) {
    case 'outline':
      btnBg = 'transparent';
      btnColor = (styles.color && styles.color !== '#ffffff') ? styles.color : primaryColor;
      defaultBorder = `2px solid ${styles.borderColor || primaryColor}`;
      break;
    case 'soft':
      btnBg = `${primaryColor}22`;
      btnColor = (styles.color && styles.color !== '#ffffff') ? styles.color : primaryColor;
      defaultBorder = 'none';
      break;
    case 'gradient':
      btnBgImage = styles.bgGradient || `linear-gradient(135deg, ${primaryColor} 0%, #a855f7 100%)`;
      btnColor = textColor;
      defaultBorder = 'none';
      break;
    case 'glow':
      btnBg = primaryColor;
      btnColor = textColor;
      defaultBorder = `1px solid ${styles.borderColor || primaryColor}`;
      break;
    case 'pill':
      btnBg = primaryColor;
      btnColor = textColor;
      defaultBorder = 'none';
      btnRadius = '9999px';
      break;
    case 'glass':
      btnBg = 'rgba(255, 255, 255, 0.25)';
      btnColor = (styles.color && styles.color !== '#ffffff') ? styles.color : '#0f172a';
      defaultBorder = `1px solid ${styles.borderColor || 'rgba(255, 255, 255, 0.5)'}`;
      btnRadius = normalizeUnit(styles.borderRadius) || '14px';
      btnBackdrop = 'blur(12px)';
      break;
    case '3d':
      btnBg = primaryColor;
      btnColor = textColor;
      defaultBorder = 'none';
      btnTransform = 'translateY(-2px)';
      break;
    case 'minimal':
      btnBg = 'transparent';
      btnColor = (styles.color && styles.color !== '#ffffff') ? styles.color : '#334155';
      defaultBorder = `1px solid ${styles.borderColor || '#cbd5e1'}`;
      btnRadius = normalizeUnit(styles.borderRadius) || '8px';
      break;
    case 'shine':
      btnBg = primaryColor;
      btnBgImage = 'linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 65%)';
      btnColor = textColor;
      defaultBorder = `1px solid ${styles.borderColor || 'rgba(255, 255, 255, 0.3)'}`;
      break;
    case 'solid':
    default:
      btnBg = primaryColor;
      btnColor = textColor;
      defaultBorder = 'none';
      break;
  }

  // Always apply custom shadow color if provided
  if (btnShadow && btnShadow !== 'none' && styles.shadowColor) {
    btnShadow = applyShadowColor(btnShadow, styles.shadowColor) || btnShadow;
  }

  // Explicit borderWidth handling:
  // If user sets borderWidth, respect it regardless of preset!
  let btnBorder = defaultBorder;
  if (styles.borderWidth !== undefined && styles.borderWidth !== '') {
    const rawVal = normalizeUnit(styles.borderWidth);
    if (rawVal === '0px' || rawVal === '0') {
      btnBorder = 'none';
    } else {
      const bStyle = styles.borderStyle || 'solid';
      const bColor = styles.borderColor || (preset === 'glass' ? 'rgba(255, 255, 255, 0.6)' : preset === 'minimal' ? '#cbd5e1' : primaryColor);
      btnBorder = `${rawVal} ${bStyle} ${bColor}`;
    }
  } else if (styles.borderColor && defaultBorder !== 'none') {
    const widthMatch = defaultBorder.match(/^([0-9]+(?:px|em|rem)?\s+[a-z]+)/i);
    if (widthMatch) {
      btnBorder = `${widthMatch[1]} ${styles.borderColor}`;
    }
  }

  // Dynamic signature defaults per preset (guarantees every preset has exciting hover behavior)
  const presetDefaults = PRESET_HOVER_DEFAULTS[preset] || PRESET_HOVER_DEFAULTS.solid;
  const hoverEffect = (styles.buttonHoverEffect !== undefined && styles.buttonHoverEffect !== '')
    ? styles.buttonHoverEffect
    : (styles.hoverScale ? 'scale' : presetDefaults.hoverEffect);
  const hoverShadowType = (styles.buttonHoverShadow !== undefined && styles.buttonHoverShadow !== '')
    ? styles.buttonHoverShadow
    : presetDefaults.hoverShadow;
  const insideEffect = (styles.buttonInsideEffect !== undefined && styles.buttonInsideEffect !== '')
    ? styles.buttonInsideEffect
    : presetDefaults.insideEffect;

  if (isHovered) {
    if (styles.hoverBgColor) {
      btnBg = styles.hoverBgColor;
      btnBgImage = undefined;
    } else {
      // Signature default color transitions per preset
      if (preset === 'outline') {
        btnBg = primaryColor;
        btnColor = '#ffffff';
      } else if (preset === 'soft') {
        btnBg = `${primaryColor}38`;
      } else if (preset === 'glass') {
        btnBg = 'rgba(255, 255, 255, 0.42)';
      } else if (preset === 'minimal') {
        btnBg = '#f1f5f9';
        btnColor = '#0f172a';
      }
    }
    if (styles.hoverColor) {
      btnColor = styles.hoverColor;
    }
    if (styles.hoverBorderColor) {
      const widthMatch = btnBorder.match(/^([0-9]+(?:px|em|rem)?\s+[a-z]+)/i);
      if (widthMatch) {
        btnBorder = `${widthMatch[1]} ${styles.hoverBorderColor}`;
      } else if (btnBorder !== 'none') {
        btnBorder = `1px solid ${styles.hoverBorderColor}`;
      }
    }

    // Hover Transform / Animation Preset
    switch (hoverEffect) {
      case 'lift':
        btnTransform = 'translateY(-4px)';
        break;
      case 'scale':
        btnTransform = preset === 'gradient' ? 'scale(1.05) translateY(-2px)' : 'scale(1.05)';
        break;
      case 'bounce':
        btnTransform = 'translateY(-5px) scale(1.02)';
        break;
      case 'push':
        btnTransform = 'translateY(3px) scale(0.98)';
        break;
      case 'glow':
        btnTransform = 'scale(1.04)';
        break;
      case 'pulse':
        btnTransform = 'scale(1.04)';
        break;
      case 'shine-sweep':
        btnTransform = 'translateY(-3px)';
        break;
      case 'none':
        btnTransform = undefined;
        break;
      default:
        if (styles.hoverScale) {
          btnTransform = `scale(${styles.hoverScale})`;
        }
        break;
    }

    // Hover Shadow
    if (styles.hoverShadow) {
      btnShadow = styles.hoverShadow;
    } else if (styles.buttonHoverShadow !== undefined && styles.buttonHoverShadow !== '') {
      switch (hoverShadowType) {
        case 'subtle':
          btnShadow = '0 4px 8px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)';
          break;
        case 'medium':
          btnShadow = '0 6px 16px -3px rgba(0, 0, 0, 0.12), 0 3px 6px -2px rgba(0, 0, 0, 0.06)';
          break;
        case 'large':
          btnShadow = preset === 'glass' ? '0 8px 24px 0 rgba(31, 38, 135, 0.12)' : '0 12px 24px -4px rgba(0, 0, 0, 0.14)';
          break;
        case 'glow':
          btnShadow = `0 0 16px 2px ${primaryColor}70, 0 4px 12px rgba(0,0,0,0.08)`;
          break;
        case 'colored':
          btnShadow = `0 8px 18px -3px ${primaryColor}45`;
          break;
        case 'sharp-3d':
          btnShadow = '0 1.5px 0 0 rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.08)';
          break;
        case 'inner-glow':
          btnShadow = 'inset 0 0 10px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.08)';
          break;
        case 'none':
          btnShadow = 'none';
          break;
        default:
          btnShadow = '0 6px 16px -3px rgba(0, 0, 0, 0.12)';
          break;
      }
      if (btnShadow && btnShadow !== 'none' && styles.shadowColor && hoverShadowType !== 'colored' && hoverShadowType !== 'glow') {
        btnShadow = applyShadowColor(btnShadow, styles.shadowColor) || btnShadow;
      }
    } else if (hasExplicitShadow) {
      // Retain user's custom shadow
      if (btnShadow && btnShadow !== 'none' && styles.shadowColor) {
        btnShadow = applyShadowColor(btnShadow, styles.shadowColor) || btnShadow;
      }
    } else {
      switch (hoverShadowType) {
        case 'subtle':
          btnShadow = '0 4px 8px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)';
          break;
        case 'medium':
          btnShadow = '0 6px 16px -3px rgba(0, 0, 0, 0.12), 0 3px 6px -2px rgba(0, 0, 0, 0.06)';
          break;
        case 'large':
          btnShadow = preset === 'glass' ? '0 8px 24px 0 rgba(31, 38, 135, 0.12)' : '0 12px 24px -4px rgba(0, 0, 0, 0.14)';
          break;
        case 'glow':
          btnShadow = `0 0 16px 2px ${primaryColor}70, 0 4px 12px rgba(0,0,0,0.08)`;
          break;
        case 'colored':
          btnShadow = `0 8px 18px -3px ${primaryColor}45`;
          break;
        case 'sharp-3d':
          btnShadow = '0 1.5px 0 0 rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.08)';
          break;
        case 'inner-glow':
          btnShadow = 'inset 0 0 10px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.08)';
          break;
        case 'none':
          btnShadow = 'none';
          break;
        default:
          btnShadow = '0 6px 16px -3px rgba(0, 0, 0, 0.12)';
          break;
      }
      if (btnShadow && btnShadow !== 'none' && styles.shadowColor && hoverShadowType !== 'colored' && hoverShadowType !== 'glow') {
        btnShadow = applyShadowColor(btnShadow, styles.shadowColor) || btnShadow;
      }
    }
  }

  const IconComponent = content.iconName ? getLucideIcon(content.iconName) : ArrowRight;

  return (
    <div style={{ textAlign: styles.textAlign || 'left' }}>
      <button
        type="button"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative overflow-hidden font-bold text-xs transition-all duration-300 active:scale-95 inline-flex items-center space-x-2 select-none group"
        style={{
          fontFamily: styles.fontFamily || undefined,
          textTransform: (styles.textTransform || undefined) as any,
          backgroundColor: btnBg,
          backgroundImage: btnBgImage,
          color: btnColor,
          border: btnBorder,
          borderRadius: btnRadius,
          boxShadow: btnShadow,
          transform: btnTransform,
          backdropFilter: btnBackdrop,
          WebkitBackdropFilter: btnBackdrop,
          paddingTop: normalizeUnit(styles.paddingTop) || '12px',
          paddingRight: normalizeUnit(styles.paddingRight) || '24px',
          paddingBottom: normalizeUnit(styles.paddingBottom) || normalizeUnit(styles.paddingTop) || '12px',
          paddingLeft: normalizeUnit(styles.paddingLeft) || normalizeUnit(styles.paddingRight) || '24px',
          fontSize: normalizeUnit(styles.fontSize) || '13px',
          fontWeight: styles.fontWeight || '700',
          textShadow: styles.textShadow || undefined,
          marginTop: normalizeUnit(styles.marginTop),
          marginBottom: normalizeUnit(styles.marginBottom)
        }}
      >
        {/* Inside Transition: Shine Sweep Beam */}
        {(insideEffect === 'shine-sweep' || hoverEffect === 'shine-sweep') && (
          <span
            className={`absolute top-0 bottom-0 w-3/4 pointer-events-none -skew-x-12 transition-transform duration-700 ease-in-out ${
              isHovered ? 'translate-x-[250%]' : '-translate-x-[180%]'
            }`}
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)'
            }}
          />
        )}

        {/* Inside Transition: Glass Sheen */}
        {insideEffect === 'glass-sheen' && (
          <span
            className="absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-[inherit]"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.05) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          />
        )}

        {/* Inside Transition: Fill Slide */}
        {insideEffect === 'fill-slide' && (
          <span
            className={`absolute inset-0 pointer-events-none transition-transform duration-300 ease-out origin-left ${
              isHovered ? 'scale-x-100' : 'scale-x-0'
            }`}
            style={{
              backgroundColor: styles.hoverBgColor || (preset === 'outline' ? primaryColor : preset === 'minimal' ? '#f1f5f9' : 'rgba(255, 255, 255, 0.25)')
            }}
          />
        )}

        {/* Inside Transition: Neon Border Flare */}
        {insideEffect === 'neon-border' && (
          <span
            className={`absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              boxShadow: `inset 0 0 12px 1px ${primaryColor}, 0 0 16px 2px ${primaryColor}`
            }}
          />
        )}

        <span className="relative z-10">{content.text || 'Start creating'}</span>
        {content.showIcon !== false && <IconComponent className="w-4 h-4 relative z-10" />}
      </button>
    </div>
  );
}

// Dedicated Video Player with zero-reload audio toggles, postMessage sync, and stable key preservation
function VideoPlayerElement({
  el,
  content,
  styles,
  isEditor = false,
  isSelected = false,
  onSelect
}: {
  el: ElementModel;
  content: Record<string, any>;
  styles: ElementStyles;
  isEditor?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  const videoUrl = content.url || '';
  const buttonless = Boolean(content.buttonless);
  const autoplay = Boolean(content.autoplay);
  const controls = content.controls !== false;
  const loop = Boolean(content.loop);
  const muted = Boolean(content.muted);
  const aspectRatioVal = content.aspectRatio || '16/9';

  const parsed = parseVideoUrl(videoUrl, {
    autoplay,
    controls,
    loop,
    muted,
    buttonless
  });

  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Smoothly update audio and playback without reloading the iframe or video DOM
  React.useEffect(() => {
    // 1. HTML5 Video: update DOM properties directly without re-render or reload
    if (videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.loop = buttonless || loop;
      videoRef.current.controls = buttonless ? false : controls;
    }

    // 2. YouTube Iframe: send postMessage for audio mute/unmute with zero reload
    if (parsed.type === 'youtube' && iframeRef.current?.contentWindow) {
      try {
        const cmd = muted ? 'mute' : 'unMute';
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: cmd, args: [] }),
          '*'
        );
      } catch {}
    }

    // 3. Vimeo Iframe: send postMessage for audio mute/unmute with zero reload
    if (parsed.type === 'vimeo' && iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ method: 'setVolume', value: muted ? 0 : 1 }),
          '*'
        );
      } catch {}
    }
  }, [muted, loop, controls, buttonless, parsed.type]);

  // Aspect ratio or custom height
  let containerAspect: string | undefined = undefined;
  let containerHeight: string | undefined = undefined;

  if (aspectRatioVal === 'custom') {
    containerHeight = normalizeUnit(styles.height) || '400px';
  } else if (aspectRatioVal === '16/9') {
    containerAspect = '16 / 9';
  } else if (aspectRatioVal === '4/3') {
    containerAspect = '4 / 3';
  } else if (aspectRatioVal === '1/1') {
    containerAspect = '1 / 1';
  } else if (aspectRatioVal === '21/9') {
    containerAspect = '21 / 9';
  } else if (aspectRatioVal) {
    containerAspect = aspectRatioVal.replace('/', ' / ');
  } else {
    containerAspect = '16 / 9';
  }

  // Shape Masking
  const maskShape = styles.maskShape || 'none';
  const clipPathVal = getClipPathForShape(maskShape);

  // Color Overlay / Tint
  const overlayData = getVideoOverlayCss(styles);

  // Border & Shadow
  const hasBorder = Boolean(
    (styles.borderColor && styles.borderColor !== 'transparent') ||
    (styles.borderWidth && styles.borderWidth !== '0' && styles.borderWidth !== '0px')
  );
  const borderStyleVal = hasBorder
    ? `${normalizeUnit(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor || '#334155'}`
    : undefined;

  const outerStyles: React.CSSProperties = {
    width: normalizeUnit(styles.width) || '100%',
    maxWidth: '100%',
    height: containerHeight,
    aspectRatio: containerHeight ? undefined : containerAspect,
    borderRadius: normalizeUnit(styles.borderRadius) || '16px',
    border: borderStyleVal,
    boxShadow: styles.shadow || undefined,
    marginTop: normalizeUnit(styles.marginTop),
    marginBottom: normalizeUnit(styles.marginBottom),
    marginLeft: normalizeUnit(styles.marginLeft),
    marginRight: normalizeUnit(styles.marginRight),
    clipPath: clipPathVal !== 'none' ? clipPathVal : undefined,
    WebkitClipPath: clipPathVal !== 'none' ? clipPathVal : undefined,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: styles.bgColor || '#000000'
  };

  if (parsed.type === 'empty') {
    return (
      <div
        style={outerStyles}
        className="flex flex-col items-center justify-center p-6 text-center text-slate-400 border border-dashed border-slate-700 select-none group cursor-pointer"
        onClick={() => {
          if (isEditor && !isSelected) {
            onSelect?.();
          }
        }}
      >
        <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 text-slate-400 group-hover:scale-105 transition-transform">
          <Video className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-200">No Video Configured</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Add a YouTube link, Vimeo URL, MP4 video, or upload a local file in the inspector.
        </p>
      </div>
    );
  }

  // Stable key: ONLY changes if the actual video URL or ID changes, NOT when audio/controls checkboxes are clicked!
  const stableKey = parsed.videoId || parsed.sourceUrl || el.id;

  return (
    <div style={outerStyles} className="group relative select-none">
      {parsed.type === 'youtube' || parsed.type === 'vimeo' ? (
        <iframe
          key={stableKey}
          ref={iframeRef}
          src={parsed.embedUrl}
          title={content.title || 'Video Player'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0 absolute inset-0"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            backgroundColor: '#000000'
          }}
        />
      ) : (
        <video
          key={stableKey}
          ref={videoRef}
          src={parsed.embedUrl}
          controls={buttonless ? false : controls}
          autoPlay={buttonless || autoplay}
          loop={buttonless || loop}
          muted={muted}
          playsInline
          className="w-full h-full object-cover absolute inset-0"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            backgroundColor: '#000000'
          }}
        />
      )}

      {/* Optional Color Overlay / Gradient / Tint */}
      {overlayData && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity z-10"
          style={{
            background: overlayData.background,
            opacity: overlayData.opacity
          }}
        />
      )}

      {/* Selection Interceptor in Canvas Editor when unselected */}
      {isEditor && !isSelected && (
        <div
          className="absolute inset-0 z-20 cursor-pointer bg-transparent"
          title="Click to select video"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
        />
      )}

      {/* Subtle Interactive Badge in Canvas Editor when selected */}
      {isEditor && isSelected && !buttonless && (
        <div className="absolute top-2 right-2 z-20 pointer-events-none px-2 py-0.5 rounded-full bg-slate-900/85 backdrop-blur border border-slate-700/60 text-slate-300 text-[10px] font-semibold flex items-center space-x-1 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Player Active</span>
        </div>
      )}
    </div>
  );
}

export interface TypewriterHeadingProps {
  text: string;
  speedMs?: number;
  pauseMs?: number;
  loop?: boolean;
  loopMode?: 'erase' | 'restart' | 'once';
  cursorChar?: string;
  cursorBlink?: 'blink' | 'pulse' | 'solid' | 'none';
  cursorColor?: string;
  deleteSpeedMs?: number;
  replayKey?: any;
}

export function TypewriterHeading({
  text,
  speedMs = 90,
  pauseMs = 1500,
  loop = true,
  loopMode = 'erase',
  cursorChar = '|',
  cursorBlink = 'blink',
  cursorColor,
  deleteSpeedMs = 40,
  replayKey
}: TypewriterHeadingProps) {
  const [displayText, setDisplayText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting' | 'done'>('typing');

  // Restart animation immediately when text, replayKey, or any setting changes so live preview is reactive
  useEffect(() => {
    setDisplayText('');
    setPhase('typing');
  }, [text, replayKey, speedMs, loopMode, loop, pauseMs, deleteSpeedMs]);

  useEffect(() => {
    let timer: any;
    const fullText = text || '';

    if (phase === 'typing') {
      if (displayText.length < fullText.length) {
        timer = setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length + 1));
        }, Math.max(10, speedMs));
      } else {
        if (!loop || loopMode === 'once') {
          setPhase('done');
        } else {
          setPhase('pausing');
        }
      }
    } else if (phase === 'pausing') {
      // Pause at full text before deleting or restarting
      timer = setTimeout(() => {
        if (loopMode === 'restart') {
          setDisplayText('');
          setPhase('typing');
        } else {
          setPhase('deleting');
        }
      }, Math.max(100, pauseMs));
    } else if (phase === 'deleting') {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length - 1));
        }, Math.max(10, deleteSpeedMs));
      } else {
        // Pause briefly at empty before typing again
        timer = setTimeout(() => {
          setPhase('typing');
        }, Math.max(80, speedMs * 1.5));
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, phase, text, speedMs, pauseMs, loop, loopMode, deleteSpeedMs]);

  const showCursor = cursorChar && cursorChar !== 'none';

  return (
    <span className="nf-typewriter-wrapper" style={{ display: 'inline', whiteSpace: 'pre-wrap' }}>
      <span>{displayText || '\u200B'}</span>
      {showCursor && (
        <span
          className={`nf-tw-cursor nf-tw-cursor-${cursorBlink}`}
          style={{
            display: 'inline-block',
            marginLeft: cursorChar === '_' ? '1px' : '2px',
            color: cursorColor || 'currentColor',
            fontWeight: 'normal',
            lineHeight: 1,
            userSelect: 'none',
            verticalAlign: cursorChar === '_' ? 'baseline' : 'text-bottom'
          }}
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
}

export function TypewriterHeadlineElement({ el, isPreview }: { el: any; isPreview?: boolean }) {
  const content = el.content || {};
  const styles = el.styles || {};

  const prefixText = content.prefixText !== undefined ? content.prefixText : 'We deliver';
  const rawWords: string[] = Array.isArray(content.rotatingWords) && content.rotatingWords.length > 0
    ? content.rotatingWords
    : ['CLEAN', 'FAST', 'AFFORDABLE'];
  const suffixText = content.suffixText !== undefined ? content.suffixText : 'solutions.';

  const typeSpeed = Number(content.typeSpeed) || 100;
  const deleteSpeed = Number(content.deleteSpeed) || 50;
  const pauseTime = Number(content.pauseTime) || 2000;
  const showCursor = content.showCursor !== false;
  const cursorChar = content.cursorChar || '|';
  const cursorColor = content.cursorColor || content.rotatingWordColor || '#6366f1';
  const rotatingWordColor = content.rotatingWordColor || '#6366f1';
  const rotatingWordBold = content.rotatingWordBold !== false;
  const rotatingWordUppercase = content.rotatingWordUppercase !== false;

  const [wordIdx, setWordIdx] = useState(0);
  const [displayText, setDisplayText] = useState(rawWords[0] ? rawWords[0].slice(0, 1) : '');
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing');

  // Keep state in bounds when words change
  useEffect(() => {
    if (wordIdx >= rawWords.length) {
      setWordIdx(0);
      setDisplayText('');
      setPhase('typing');
    }
  }, [rawWords.length, wordIdx]);

  useEffect(() => {
    if (!rawWords.length) return;
    const targetWord = rawWords[wordIdx] || '';

    let timer: any;
    if (phase === 'typing') {
      if (displayText.length < targetWord.length) {
        timer = setTimeout(() => {
          setDisplayText(targetWord.slice(0, displayText.length + 1));
        }, Math.max(15, typeSpeed));
      } else {
        // Complete word, wait 2000ms pauseTime
        timer = setTimeout(() => {
          setPhase('deleting');
        }, Math.max(100, pauseTime));
      }
    } else if (phase === 'deleting') {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, Math.max(10, deleteSpeed));
      } else {
        // Word is deleted! Move to next word in sequence and start typing
        const nextIdx = (wordIdx + 1) % rawWords.length;
        setWordIdx(nextIdx);
        setPhase('typing');
      }
    }

    return () => clearTimeout(timer);
  }, [phase, displayText, wordIdx, rawWords, typeSpeed, deleteSpeed, pauseTime]);

  const fontSize = styles.fontSize || '36px';
  const textAlign = (styles.textAlign || content.textAlign || 'center') as any;
  const baseColor = styles.color || '#0f172a';
  const fontWeight = styles.fontWeight || '700';
  const fontFamily = styles.fontFamily || undefined;

  const prefixDisplay = prefixText ? `${prefixText}${!prefixText.endsWith(' ') ? ' ' : ''}` : '';
  const suffixDisplay = suffixText ? `${!suffixText.startsWith(' ') ? ' ' : ''}${suffixText}` : '';

  return (
    <div
      className="nf-typewriter-headline-wrap w-full select-none"
      style={{
        fontSize,
        textAlign,
        color: baseColor,
        fontWeight,
        fontFamily,
        lineHeight: 1.3
      }}
    >
      <style>{`
        @keyframes nf-twh-cursor-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .nf-twh-cursor-blink {
          animation: nf-twh-cursor-blink 0.8s infinite;
          display: inline-block;
          font-weight: 300;
          margin-left: 2px;
        }
      `}</style>
      <span className="nf-twh-prefix">{prefixDisplay}</span>
      <span
        className="nf-twh-rotating-word"
        style={{
          color: rotatingWordColor,
          fontWeight: rotatingWordBold ? '800' : 'normal',
          textTransform: rotatingWordUppercase ? 'uppercase' : 'none',
          display: 'inline'
        }}
      >
        {displayText || '\u200B'}
      </span>
      {showCursor && (
        <span
          className="nf-twh-cursor-blink"
          style={{ color: cursorColor }}
        >
          {cursorChar}
        </span>
      )}
      <span className="nf-twh-suffix">{suffixDisplay}</span>
    </div>
  );
}

export function LottieAnimationElement({ el, isPreview }: { el: any; isPreview?: boolean }) {
  const content = el.content || {};
  const styles = el.styles || {};

  const lottieUrl = content.url || 'https://assets5.lottiefiles.com/packages/lf20_myejioos.json';
  const autoplay = content.autoplay !== false;
  const loop = content.loop !== false;
  const speed = Number(content.speed) || 1;
  const hoverPlay = Boolean(content.hoverPlay);
  const showControls = Boolean(content.showControls);
  const [playerLoaded, setPlayerLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).customElements && (window as any).customElements.get('lottie-player')) {
      setPlayerLoaded(true);
      return;
    }
    const scriptId = 'lottie-player-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
      script.async = true;
      script.onload = () => setPlayerLoaded(true);
      document.body.appendChild(script);
    } else {
      script.addEventListener('load', () => setPlayerLoaded(true));
    }
  }, []);

  const width = normalizeUnit(styles.width) || '280px';
  const height = normalizeUnit(styles.height) || '280px';
  const align = styles.align || content.align || 'center';
  const borderRadius = normalizeUnit(styles.borderRadius) || '0px';
  const bgColor = styles.bgColor || 'transparent';

  const justifyMap: Record<string, string> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end'
  };

  return (
    <div
      className="nf-lottie-container w-full"
      style={{
        display: 'flex',
        justifyContent: justifyMap[align] || 'center'
      }}
    >
      <div
        className="nf-lottie-box relative overflow-hidden"
        style={{
          width,
          height,
          borderRadius,
          backgroundColor: bgColor
        }}
      >
        {React.createElement('lottie-player', {
          src: lottieUrl,
          background: 'transparent',
          speed: String(speed),
          loop: loop ? true : undefined,
          autoplay: autoplay ? true : undefined,
          hover: hoverPlay ? true : undefined,
          controls: showControls ? true : undefined,
          style: { width: '100%', height: '100%', display: 'block' }
        })}
      </div>
    </div>
  );
}

interface ElementRendererProps {
  element: ElementModel;
  isEditor?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

export default function ElementRenderer({
  element: el,
  isEditor = false,
  isSelected = false,
  onSelect,
  previewDevice
}: ElementRendererProps) {
  const content = el.content || {};
  const styles = el.styles || {};
  const breakpoint = useBuilderStore((s) => s.breakpoint);

  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveDevice: 'desktop' | 'tablet' | 'mobile' =
    previewDevice
      ? previewDevice
      : isEditor
      ? breakpoint
      : windowWidth < 768
      ? 'mobile'
      : windowWidth < 1024
      ? 'tablet'
      : 'desktop';

  const isMobile = effectiveDevice === 'mobile';
  const isTablet = effectiveDevice === 'tablet';

  // Local state for interactive elements (accordion, tabs, flipbox, slider/carousel)
  const [openAccordionIdx, setOpenAccordionIdx] = useState<number | null>(0);
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Builder store actions for inner row and element operations
  const addElementToInnerColumn = useBuilderStore((s) => s.addElementToInnerColumn);
  const deleteElementFromInnerColumn = useBuilderStore((s) => s.deleteElementFromInnerColumn);
  const duplicateInnerColumn = useBuilderStore((s) => s.duplicateInnerColumn);
  const deleteInnerColumn = useBuilderStore((s) => s.deleteInnerColumn);
  const deleteElement = useBuilderStore((s) => s.deleteElement);
  const duplicateElement = useBuilderStore((s) => s.duplicateElement);
  const updateElementContent = useBuilderStore((s) => s.updateElementContent);
  const setSelectedElementId = useBuilderStore((s) => s.setSelectedElementId);
  const selectedElementId = useBuilderStore((s) => s.selectedElementId);
  const selectedInnerColumnId = useBuilderStore((s) => s.selectedInnerColumnId);
  const setSelectedInnerColumnId = useBuilderStore((s) => s.setSelectedInnerColumnId);
  const moveElement = useBuilderStore((s) => s.moveElement);
  const pages = useBuilderStore((s) => s.pages);
  const sections = useBuilderStore((s) => s.sections);
  const currentPageId = useBuilderStore((s) => s.currentPageId);
  const setCurrentPageId = useBuilderStore((s) => s.setCurrentPageId);

  // Inner row drag/drop and picker state
  const [pickerTargetInnerColId, setPickerTargetInnerColId] = useState<string | null>(null);
  const [dragOverInnerColId, setDragOverInnerColId] = useState<string | null>(null);
  const [innerDropIndicator, setInnerDropIndicator] = useState<{ colId: string; index: number } | null>(null);

  // Sticky navigation scroll state
  const [isStickyVisible, setIsStickyVisible] = useState<boolean>(true);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Close mobile navigation menu on device change
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  // Sticky Navigation Scroll Observer & Section Threshold Tracker
  useEffect(() => {
    if (el.type !== 'navigation') return;
    const isSticky = Boolean(styles.isSticky ?? content.isSticky);
    if (!isSticky) {
      setIsStickyVisible(true);
      setIsScrolled(false);
      return;
    }

    const stickyBehavior = styles.stickyBehavior || content.stickyBehavior || 'always';
    const targetId = (styles.stickyTargetSection || content.stickyTargetSection || '').trim();

    const getScrollContainer = () => {
      return (
        document.getElementById('preview-scroll-container') ||
        document.getElementById('canvas-scroll-container') ||
        (typeof window !== 'undefined' ? window : null)
      );
    };

    const applyStickyVisibility = (visible: boolean) => {
      setIsStickyVisible(visible);
      // Synchronize parent section if parent section is marked sticky
      const navNode = document.getElementById(el.id) || document.querySelector(`[data-element-id="${el.id}"]`);
      const parentSec = navNode?.closest('section, [data-section-id]') as HTMLElement | null;
      if (parentSec && (parentSec.classList.contains('sticky') || parentSec.style.position === 'sticky')) {
        parentSec.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        if (visible) {
          parentSec.style.transform = 'translateY(0)';
          parentSec.style.opacity = '1';
          parentSec.style.pointerEvents = 'auto';
        } else {
          parentSec.style.transform = 'translateY(-100%)';
          parentSec.style.opacity = '0';
          parentSec.style.pointerEvents = 'none';
        }
      }
    };

    const handleScroll = () => {
      const scrollContainer = getScrollContainer();
      if (!scrollContainer) return;

      let scrollTop = 0;
      if (scrollContainer === window) {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
      } else {
        scrollTop = (scrollContainer as HTMLElement).scrollTop;
      }

      setIsScrolled(scrollTop > 15);

      if (stickyBehavior === 'always' || !targetId) {
        applyStickyVisibility(true);
        return;
      }

      const cleanId = targetId.replace(/^#/, '').trim();
      const targetEl =
        document.getElementById(cleanId) ||
        document.querySelector(`[data-section-id="${cleanId}"]`) ||
        document.querySelector(`[data-custom-id="${cleanId}"]`) ||
        document.querySelector(`[id="${cleanId}"]`) ||
        document.querySelector(`[id*="${cleanId}"]`);

      if (!targetEl) {
        applyStickyVisibility(true);
        return;
      }

      const containerRect = scrollContainer === window
        ? { top: 0, bottom: window.innerHeight, height: window.innerHeight }
        : (scrollContainer as HTMLElement).getBoundingClientRect();

      const tRect = targetEl.getBoundingClientRect();
      const targetRelTop = tRect.top - containerRect.top;
      const targetRelBottom = tRect.bottom - containerRect.top;
      const containerHeight = containerRect.height || window.innerHeight;

      switch (stickyBehavior) {
        case 'show-after': {
          // In the editor at top of canvas, keep visible so the user can interact/edit it.
          if (isEditor && scrollTop < 15) {
            applyStickyVisibility(true);
            break;
          }
          // Reveals once the user scrolls down to or past the target section
          const hasReachedTarget = targetRelTop <= 100 || targetRelBottom <= (containerHeight * 0.5);
          applyStickyVisibility(hasReachedTarget);
          break;
        }

        case 'hide-after': {
          // Sticky nav is visible initially, hides once user reaches target section
          const hasReachedTarget = targetRelTop <= 80;
          applyStickyVisibility(!hasReachedTarget);
          break;
        }

        case 'hide-inside': {
          // Hides while target section is currently in viewport
          const isInside = targetRelTop < (containerHeight * 0.75) && targetRelBottom > 60;
          applyStickyVisibility(!isInside);
          break;
        }

        default:
          applyStickyVisibility(true);
          break;
      }
    };

    handleScroll();

    const container = getScrollContainer();
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      const navNode = document.getElementById(el.id) || document.querySelector(`[data-element-id="${el.id}"]`);
      const parentSec = navNode?.closest('section, [data-section-id]') as HTMLElement | null;
      if (parentSec) {
        parentSec.style.transform = '';
        parentSec.style.opacity = '';
        parentSec.style.pointerEvents = '';
      }
    };
  }, [
    el.type,
    styles.isSticky,
    content.isSticky,
    styles.stickyBehavior,
    content.stickyBehavior,
    styles.stickyTargetSection,
    content.stickyTargetSection,
    isEditor,
    previewDevice
  ]);

  // Auto slide loop for slider / carousel / gallery / imagebox
  useEffect(() => {
    const isSlider =
      el.type === 'carousel' ||
      el.type === 'mediacarousel' ||
      (el.type === 'gallery' && (content.displayMode || 'slider') === 'slider') ||
      (el.type === 'imagebox' && (content.displayMode === 'slider' || (content.items && content.items.length > 1)));

    const rawItems = content.items || content.images || [];
    const itemsCount = rawItems.length > 0 ? rawItems.length : 1;
    const autoSlide = content.autoSlide !== false;
    const intervalSec = Number(content.slideInterval) || 3;

    if (!isSlider || itemsCount <= 1 || !autoSlide || isHovered) return;

    const timer = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % itemsCount);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [el.type, content.displayMode, content.items, content.images, content.autoSlide, content.slideInterval, isHovered]);

  const commonStyle: React.CSSProperties = {
    color: styles.color,
    backgroundColor: styles.bgColor,
    fontFamily: styles.fontFamily || undefined,
    fontSize: normalizeUnit(styles.fontSize),
    fontWeight: styles.fontWeight,
    textAlign: styles.textAlign,
    borderRadius: normalizeUnit(styles.borderRadius),
    paddingTop: normalizeUnit(styles.paddingTop),
    paddingBottom: normalizeUnit(styles.paddingBottom),
    paddingLeft: normalizeUnit(styles.paddingLeft),
    paddingRight: normalizeUnit(styles.paddingRight),
    marginTop: normalizeUnit(styles.marginTop),
    marginBottom: normalizeUnit(styles.marginBottom),
    marginLeft: normalizeUnit(styles.marginLeft),
    marginRight: normalizeUnit(styles.marginRight),
    borderColor: styles.borderColor,
    boxShadow: applyShadowColor(styles.shadow, styles.shadowColor)
  };

  const IconComponent = getLucideIcon(content.iconName);

  // Responsive Visibility check (mobileShow, tabletShow, desktopShow)
  const isHiddenOnCurrentDevice =
    (isMobile && el.responsive?.mobileShow === false) ||
    (isTablet && el.responsive?.tabletShow === false) ||
    (!isMobile && !isTablet && el.responsive?.desktopShow === false);

  if (isHiddenOnCurrentDevice && !isEditor) {
    return null;
  }

  const renderInner = () => {
    switch (el.type) {
      // 0. INNER ROW (Nested Columns inside a Column)
      case 'innerrow': {
        const innerCols = content.columns && content.columns.length > 0
          ? content.columns
          : [
              { id: `c-${el.id}-1`, widthPercentage: 50, elements: [] },
              { id: `c-${el.id}-2`, widthPercentage: 50, elements: [] }
            ];
        const isInterlocked = content.interlockWidths !== false;

        const handleInnerDrop = (e: React.DragEvent, innerColId: string, dropIndex?: number) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOverInnerColId(null);
          setInnerDropIndicator(null);

          const elementDataStr = e.dataTransfer.getData('application/nextforge-element');
          const plainData = e.dataTransfer.getData('text/plain') || '';

          // 1. Moving an existing element
          if (elementDataStr || plainData.startsWith('element:')) {
            let movedElId = '';
            if (elementDataStr) {
              try {
                const parsed = JSON.parse(elementDataStr);
                movedElId = parsed.elementId;
              } catch {
                movedElId = plainData.replace('element:', '');
              }
            } else {
              movedElId = plainData.replace('element:', '');
            }

            if (movedElId) {
              if (movedElId === el.id) return;
              moveElement(movedElId, el.id, innerColId, dropIndex);
              return;
            }
          }

          // 2. Adding a new widget from sidebar
          const widgetType = plainData || 'heading';
          if (!widgetType.startsWith('layout:')) {
            addElementToInnerColumn(el.id, innerColId, widgetType, dropIndex);
          }
        };

        const isDefaultEditorBorder = (styles.borderStyle === 'dashed' || !styles.borderStyle) && (styles.borderColor === '#a5b4fc' || !styles.borderColor);

        const hasCustomInnerRowBorder = Boolean(
          styles.borderWidth &&
          styles.borderWidth !== '0' &&
          styles.borderWidth !== '0px' &&
          !isDefaultEditorBorder
        );

        const innerRowBorder = isEditor
          ? (styles.borderWidth
              ? `${normalizeUnit(styles.borderWidth)} ${styles.borderStyle || 'solid'} ${styles.borderColor || 'transparent'}`
              : '1px dashed #a5b4fc')
          : (hasCustomInnerRowBorder
              ? `${normalizeUnit(styles.borderWidth)} ${styles.borderStyle || 'solid'} ${styles.borderColor || 'transparent'}`
              : undefined);

        const innerRowPaddingTop = normalizeUnit(styles.paddingTop) || (isEditor ? '12px' : (styles.bgColor ? '16px' : '12px'));
        const innerRowPaddingBottom = normalizeUnit(styles.paddingBottom) || (isEditor ? '12px' : (styles.bgColor ? '16px' : '12px'));
        const innerRowPaddingLeft = normalizeUnit(styles.paddingLeft) || (isEditor ? '12px' : (styles.bgColor ? '16px' : '12px'));
        const innerRowPaddingRight = normalizeUnit(styles.paddingRight) || (isEditor ? '12px' : (styles.bgColor ? '16px' : '12px'));

        const innerRowBgColor = isEditor
          ? (styles.bgColor || 'rgba(238, 242, 255, 0.25)')
          : (styles.bgColor && styles.bgColor !== 'rgba(238, 242, 255, 0.25)' ? styles.bgColor : undefined);

        const innerRowBorderRadius = normalizeUnit(styles.borderRadius) || (styles.bgColor ? '12px' : (isEditor ? '12px' : undefined));

        const innerRowWidthType = styles.widthType || content.widthType || 'full';
        let innerRowWidth = '100%';
        let innerRowMaxWidth: string | undefined = undefined;

        if (innerRowWidthType === 'boxed') {
          innerRowMaxWidth = '1180px';
        } else if (innerRowWidthType === 'contained') {
          innerRowMaxWidth = '960px';
        } else if (innerRowWidthType === 'compact') {
          innerRowMaxWidth = '720px';
        } else if (innerRowWidthType === 'custom') {
          const rawW = styles.customWidth || content.customWidth || '80%';
          innerRowWidth = normalizeUnit(rawW.includes('%') || rawW.includes('px') ? rawW : `${rawW}%`) || '80%';
          innerRowMaxWidth = '100%';
        }

        const innerRowAlign = styles.align || content.align || 'center';
        let innerRowMarginLeft = 'auto';
        let innerRowMarginRight = 'auto';
        if (innerRowAlign === 'left') {
          innerRowMarginLeft = normalizeUnit(styles.marginLeft) || '0px';
          innerRowMarginRight = 'auto';
        } else if (innerRowAlign === 'right') {
          innerRowMarginLeft = 'auto';
          innerRowMarginRight = normalizeUnit(styles.marginRight) || '0px';
        } else {
          innerRowMarginLeft = 'auto';
          innerRowMarginRight = 'auto';
        }

        return (
          <div
            id={styles.customId || undefined}
            className={`transition-all group/innerrow relative ${styles.customClass || ''}`}
            style={{
              width: innerRowWidth,
              maxWidth: innerRowMaxWidth,
              marginLeft: innerRowMarginLeft,
              marginRight: innerRowMarginRight,
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom),
              paddingTop: innerRowPaddingTop,
              paddingBottom: innerRowPaddingBottom,
              paddingLeft: innerRowPaddingLeft,
              paddingRight: innerRowPaddingRight,
              backgroundColor: innerRowBgColor,
              border: innerRowBorder,
              borderRadius: innerRowBorderRadius,
              boxShadow: styles.shadow || undefined
            }}
          >
            {/* Inner Row Header - visible ONLY in editor mode */}
            {isEditor && (
              <div className="flex items-center justify-between mb-2 text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider">
                <span className="flex items-center space-x-1.5">
                  <Columns className="w-3.5 h-3.5" />
                  <span>Inner Row ({innerCols.length} Columns)</span>
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateElement(el.id);
                    }}
                    className="p-1 hover:text-indigo-700 hover:bg-indigo-100 rounded transition-colors cursor-pointer"
                    title="Duplicate Inner Row"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(el.id);
                    }}
                    className="p-1 hover:text-rose-600 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                    title="Delete Inner Row"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <div
              className="flex flex-wrap w-full transition-all"
              style={{
                gap: content.gap ? normalizeUnit(content.gap) : '10px',
                alignItems: content.alignItems || 'stretch'
              }}
            >
              {innerCols.map((col: any, idx: number) => {
                const numCols = innerCols.length || 1;
                const gapVal = content.gap ? normalizeUnit(content.gap) : '10px';
                const gapDeduction = numCols > 1 ? `(${gapVal} * ${numCols - 1} * ${(col.widthPercentage || 50)} / 100)` : '0px';
                const effectiveWidth = isMobile
                  ? '100%'
                  : isTablet && (col.widthPercentage || 50) <= 34
                  ? `calc(50% - (${gapVal} / 2))`
                  : numCols > 1
                  ? `calc(${col.widthPercentage || 50}% - ${gapDeduction})`
                  : '100%';

                const isColDragOver = dragOverInnerColId === col.id;
                const isThisInnerColSelected = isEditor && isSelected && selectedInnerColumnId === col.id;

                const hasCustomColBorder = Boolean(
                  styles.columnBorderWidth &&
                  styles.columnBorderWidth !== '0' &&
                  styles.columnBorderWidth !== '0px' &&
                  styles.columnBorderStyle &&
                  styles.columnBorderStyle !== 'dashed' &&
                  styles.columnBorderColor &&
                  styles.columnBorderColor !== '#c7d2fe'
                );

                return (
                  <div
                    key={col.id || idx}
                    onClick={(e) => {
                      if (isEditor) {
                        e.stopPropagation();
                        setSelectedInnerColumnId(el.id, col.id);
                      }
                    }}
                    style={{
                      width: effectiveWidth,
                      maxWidth: isMobile ? '100%' : effectiveWidth,
                      flex: isMobile ? '1 1 100%' : `0 0 ${effectiveWidth}`,
                      boxSizing: 'border-box',
                      backgroundColor: col.styles?.bgColor || styles.columnBgColor || (isEditor ? '#ffffff' : undefined),
                      borderColor: isEditor
                        ? (isColDragOver ? '#6366f1' : isThisInnerColSelected ? '#4f46e5' : styles.columnBorderColor || '#c7d2fe')
                        : (hasCustomColBorder ? col.styles?.borderColor || styles.columnBorderColor : undefined),
                      borderWidth: isEditor
                        ? (isThisInnerColSelected ? '2px' : styles.columnBorderWidth ? normalizeUnit(styles.columnBorderWidth) : '1px')
                        : (hasCustomColBorder && styles.columnBorderWidth ? normalizeUnit(styles.columnBorderWidth) : undefined),
                      borderStyle: isEditor ? (isThisInnerColSelected ? 'solid' : styles.columnBorderStyle || 'dashed') : (hasCustomColBorder ? styles.columnBorderStyle : undefined),
                      borderRadius: normalizeUnit(col.styles?.borderRadius || styles.columnBorderRadius) || (isEditor ? '10px' : undefined),
                      padding: normalizeUnit(col.styles?.padding || styles.columnPadding) || (isEditor ? '10px' : '8px'),
                      boxShadow: isThisInnerColSelected ? '0 4px 12px -2px rgba(99, 102, 241, 0.25)' : (styles.columnShadow || undefined)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === 'copy' ? 'copy' : 'move';
                      if (dragOverInnerColId !== col.id) setDragOverInnerColId(col.id);
                    }}
                    onDragLeave={(e) => {
                      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                      if (dragOverInnerColId === col.id) setDragOverInnerColId(null);
                    }}
                    onDrop={(e) => {
                      handleInnerDrop(e, col.id);
                    }}
                    className={`flex-shrink-0 flex flex-col justify-between transition-all relative ${
                      isEditor ? 'min-w-0 min-h-[85px] cursor-pointer' : ''
                    } ${
                      isColDragOver ? 'ring-2 ring-indigo-500 bg-indigo-50/70 border-indigo-500 scale-[1.01]' : ''
                    } ${
                      isThisInnerColSelected ? 'ring-2 ring-indigo-600 ring-offset-1 bg-indigo-50/30' : ''
                    }`}
                  >
                    {/* Inner Column Header Badge */}
                    {isEditor && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInnerColumnId(el.id, col.id);
                        }}
                        className={`flex items-center justify-between px-2 py-0.5 mb-2 rounded text-[9px] font-mono font-bold tracking-tight select-none transition-all cursor-pointer ${
                          isThisInnerColSelected
                            ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-500'
                            : 'bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70'
                        }`}
                        title={`Column ${idx + 1} (${Math.round(col.widthPercentage || 50)}%) - Click to select & adjust width`}
                      >
                        <div className="flex items-center space-x-1">
                          <Columns className="w-2.5 h-2.5" />
                          <span>Col {idx + 1}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-extrabold">{Math.round(col.widthPercentage || 50)}%</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateElementContent(el.id, {
                                interlockWidths: !isInterlocked
                              });
                            }}
                            className={`p-0.5 rounded transition-colors ${
                              isInterlocked
                                ? 'hover:bg-indigo-700/50 hover:text-white'
                                : 'opacity-60 hover:opacity-100 hover:bg-indigo-700/50 hover:text-white'
                            }`}
                            title={
                              isInterlocked
                                ? 'Column widths interlocked (Auto-balance to 100%) - Click to unlock independent widths'
                                : 'Independent column widths - Click to interlock & auto-balance'
                            }
                          >
                            {isInterlocked ? <Link2 className="w-2.5 h-2.5" /> : <Unlink className="w-2.5 h-2.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateInnerColumn(el.id, col.id);
                            }}
                            className="p-0.5 hover:bg-indigo-700/50 hover:text-white rounded transition-colors"
                            title="Clone / Duplicate Column"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                          {innerCols.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteInnerColumn(el.id, col.id);
                              }}
                              className="p-0.5 hover:bg-rose-500/80 hover:text-white rounded transition-colors"
                              title="Delete Column"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      {col.elements && col.elements.length > 0 ? (
                        col.elements.map((subEl: any, subIdx: number) => {
                          const isSubSelected = selectedElementId === subEl.id;

                          return (
                            <div
                              key={subEl.id}
                              draggable={isEditor}
                              onDragStart={(e) => {
                                e.stopPropagation();
                                e.dataTransfer.setData(
                                  'application/nextforge-element',
                                  JSON.stringify({
                                    elementId: subEl.id,
                                    sourceInnerRowId: el.id,
                                    sourceInnerColId: col.id,
                                    sourceIndex: subIdx
                                  })
                                );
                                e.dataTransfer.setData('text/plain', `element:${subEl.id}`);
                                e.dataTransfer.effectAllowed = 'all';
                              }}
                              onDragEnd={() => {
                                setInnerDropIndicator(null);
                                setDragOverInnerColId(null);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === 'copy' ? 'copy' : 'move';
                                const rect = e.currentTarget.getBoundingClientRect();
                                const midY = rect.top + rect.height / 2;
                                const targetIdx = e.clientY < midY ? subIdx : subIdx + 1;
                                if (!innerDropIndicator || innerDropIndicator.colId !== col.id || innerDropIndicator.index !== targetIdx) {
                                  setInnerDropIndicator({ colId: col.id, index: targetIdx });
                                }
                              }}
                              onDrop={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const midY = rect.top + rect.height / 2;
                                const targetIdx = e.clientY < midY ? subIdx : subIdx + 1;
                                handleInnerDrop(e, col.id, targetIdx);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedElementId(subEl.id);
                              }}
                              className={`relative group/sub transition-all rounded-lg cursor-pointer ${
                                isSubSelected ? 'ring-2 ring-indigo-500 shadow-sm' : ''
                              }`}
                            >
                              {/* Drop Indicator Bar Before Sub Element */}
                              {innerDropIndicator?.colId === col.id && innerDropIndicator?.index === subIdx && (
                                <div className="h-1 bg-indigo-600 rounded-full my-1.5 animate-pulse shadow-sm" />
                              )}

                              {/* Mini floating action bar */}
                              {isEditor && (
                                <div
                                  className={`absolute -top-3.5 right-1 z-30 flex items-center space-x-1 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[8px] font-sans font-bold shadow-md border border-indigo-400/40 transition-opacity ${
                                    isSubSelected ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover/sub:opacity-100 pointer-events-auto'
                                  }`}
                                >
                                  <div
                                    className="cursor-grab active:cursor-grabbing hover:text-indigo-200 flex items-center pr-1 border-r border-indigo-400/40"
                                    title="Drag to move"
                                  >
                                    <GripVertical className="w-2.5 h-2.5" />
                                  </div>
                                  <span className="truncate max-w-[65px]">{subEl.label || subEl.type}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      duplicateElement(subEl.id);
                                    }}
                                    className="hover:text-indigo-200 p-0.5"
                                    title="Duplicate (Ctrl+D)"
                                  >
                                    <Copy className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteElementFromInnerColumn(el.id, col.id, subEl.id);
                                    }}
                                    className="hover:text-rose-200 p-0.5"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              )}

                              <ElementRenderer
                                element={subEl}
                                isEditor={isEditor}
                                isSelected={isSubSelected}
                                onSelect={() => setSelectedElementId(subEl.id)}
                                previewDevice={previewDevice}
                              />

                              {/* Drop Indicator Bar After Last Sub Element */}
                              {innerDropIndicator?.colId === col.id &&
                                innerDropIndicator?.index === subIdx + 1 &&
                                subIdx === col.elements.length - 1 && (
                                  <div className="h-1 bg-indigo-600 rounded-full my-1.5 animate-pulse shadow-sm" />
                                )}
                            </div>
                          );
                        })
                      ) : isEditor ? (
                        <div className="text-[10px] text-slate-400 text-center py-3 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                          {isColDragOver ? 'Drop element here' : `Col ${idx + 1} (${col.widthPercentage || 50}%)`}
                        </div>
                      ) : null}
                    </div>

                    {/* Add Element into Inner Column in Editor */}
                    {isEditor && (
                      <div className="pt-2 flex items-center justify-center border-t border-indigo-100/70 mt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPickerTargetInnerColId(col.id);
                          }}
                          className="w-full py-1.5 px-2 flex items-center justify-center space-x-1.5 bg-indigo-50/80 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-[10px] font-bold border border-dashed border-indigo-300 hover:border-indigo-600 transition-all shadow-2xs cursor-pointer group/addel"
                          title="Add Element to this column"
                        >
                          <Plus className="w-3 h-3 group-hover/addel:rotate-90 transition-transform" />
                          <span>Add Element</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Element Picker Modal for Inner Column */}
            {isEditor && pickerTargetInnerColId && (
              <ElementPickerModal
                isOpen={Boolean(pickerTargetInnerColId)}
                onClose={() => setPickerTargetInnerColId(null)}
                onSelectElement={(wType) => {
                  if (pickerTargetInnerColId) {
                    addElementToInnerColumn(el.id, pickerTargetInnerColId, wType);
                  }
                  setPickerTargetInnerColId(null);
                }}
                columnTitle={`Inner Column (${innerCols.find((c: any) => c.id === pickerTargetInnerColId)?.widthPercentage || 50}%)`}
              />
            )}
          </div>
        );
      }

      // 1. HEADING
      // 1. HEADING
      case 'heading': {
        const Tag = (content.tag || 'h1') as keyof JSX.IntrinsicElements;
        const hasBorder = Boolean(styles.borderColor && styles.borderColor !== 'transparent');
        const hasBg = Boolean(styles.bgColor && styles.bgColor !== 'transparent');
        const decType = content.decorationType || 'none';
        const decColor = content.decorationColor || styles.decorationColor || '#6366f1';
        const decThick = content.decorationThickness || 3;
        const anim = content.headingAnimation || 'none';
        const animSpeed = typeof content.animationSpeedSeconds === 'number'
          ? `${content.animationSpeedSeconds}s`
          : content.animationSpeed === 'lightning' || content.animationSpeed === 'ultra-fast' ? '0.6s'
          : content.animationSpeed === 'very-fast' ? '0.9s'
          : content.animationSpeed === 'fast' ? '1.4s'
          : content.animationSpeed === 'slow' ? '4s'
          : content.animationSpeed === 'very-slow' ? '6s'
          : content.animationSpeed === 'ultra-slow' ? '9s'
          : '2.5s';
        const animLoop = content.animationLoop !== false ? 'infinite' : 'forwards';

        // Styles for decoration
        const isGradient = decType === 'gradient-text';
        const gradFrom = content.gradientFrom || '#6366f1';
        const gradTo = content.gradientTo || '#ec4899';

        // Gradient shimmer light sweep colors
        const shimmerFrom = content.shimmerColorFrom || content.gradientFrom || '#6366f1';
        const shimmerMid = content.shimmerColorMid || content.gradientTo || '#ec4899';
        const shimmerEnd = content.shimmerColorEnd || shimmerFrom;

        // Neon Glow & Sign effect settings
        const isNeon = anim === 'neon';
        const neonColor = content.neonColor || '#00f0ff';
        const neonIntensity = content.neonIntensity || 'intense';
        const neonStyle = content.neonStyle || 'pulse';
        const neonWhiteCore = content.neonWhiteCore !== false;

        const getNeonGlowStr = (intensity: string, color: string) => {
          if (intensity === 'subtle') {
            return `0 0 4px #ffffff, 0 0 10px ${color}, 0 0 20px ${color}80`;
          }
          if (intensity === 'medium') {
            return `0 0 4px #ffffff, 0 0 8px #ffffff, 0 0 16px ${color}, 0 0 32px ${color}, 0 0 50px ${color}80`;
          }
          if (intensity === 'cyberpunk') {
            return `0 0 3px #ffffff, 0 0 7px #ffffff, 0 0 14px ${color}, 0 0 28px ${color}, 0 0 55px ${color}, 0 0 90px ${color}, 0 0 130px ${color}`;
          }
          // intense
          return `0 0 4px #ffffff, 0 0 9px #ffffff, 0 0 18px ${color}, 0 0 36px ${color}, 0 0 65px ${color}, 0 0 95px ${color}90`;
        };

        const activeNeonGlow = getNeonGlowStr(neonIntensity, neonColor);
        const subtleNeonGlow = `0 0 3px #ffffff, 0 0 8px ${neonColor}, 0 0 18px ${neonColor}60`;

        let textDecor: string | undefined = undefined;
        let textDecorColor: string | undefined = undefined;
        let textDecorThickness: string | undefined = undefined;
        let textUnderlineOffset: string | undefined = undefined;
        let borderLeft: string | undefined = undefined;
        let paddingLeftExtra: string | undefined = undefined;
        let bgExtra: string | undefined = undefined;
        let bgClip: string | undefined = undefined;
        let textFillColor: string | undefined = undefined;
        let borderExtra: string | undefined = undefined;
        let borderRadExtra: string | undefined = undefined;

        if (decType === 'underline') {
          textDecor = 'underline';
          textDecorColor = decColor;
          textDecorThickness = `${decThick}px`;
          textUnderlineOffset = `${Math.max(6, decThick * 2 + 2)}px`;
        } else if (decType === 'wavy') {
          textDecor = 'underline wavy';
          textDecorColor = decColor;
          textDecorThickness = `${decThick}px`;
          textUnderlineOffset = `${Math.max(6, decThick * 2 + 2)}px`;
        } else if (decType === 'double') {
          textDecor = 'underline double';
          textDecorColor = decColor;
          textDecorThickness = `${decThick}px`;
          textUnderlineOffset = `${Math.max(6, decThick * 2 + 2)}px`;
        } else if (decType === 'highlight') {
          bgExtra = `linear-gradient(120deg, ${decColor}25 0%, ${decColor}50 100%)`;
          borderRadExtra = '6px';
        } else if (decType === 'accent-bar') {
          borderLeft = `${decThick + 2}px solid ${decColor}`;
          paddingLeftExtra = '14px';
        } else if (decType === 'circled') {
          borderExtra = `${decThick}px solid ${decColor}`;
          borderRadExtra = '999px';
          paddingLeftExtra = '16px';
        } else if (isGradient) {
          bgExtra = `linear-gradient(135deg, ${gradFrom}, ${gradTo})`;
          bgClip = 'text';
          textFillColor = 'transparent';
        }

        // Animation class
        const animClass = anim === 'gradient-shimmer' ? 'nf-heading-shimmer'
          : anim === 'fade-slide-up' ? 'nf-heading-fadeslide'
          : anim === 'pulse-glow' ? 'nf-heading-pulseglow'
          : anim === 'floating' ? 'nf-heading-floating'
          : anim === 'bounce' ? 'nf-heading-bounce'
          : anim === 'neon' ? (
              neonStyle === 'pulse' ? 'nf-heading-neon-pulse' :
              neonStyle === 'flicker' ? 'nf-heading-neon-flicker' :
              neonStyle === 'electric' ? 'nf-heading-neon-electric' :
              'nf-heading-neon-steady'
            )
          : '';

        const isTypewriter = anim === 'typewriter';
        const headingText = content.text || 'A visual builder made for modern Next.js sites.';

        // Typewriter controls (exact character tracking, zero gap/overshoot)
        const twSpeed = typeof content.typewriterSpeed === 'number'
          ? content.typewriterSpeed
          : content.animationSpeed === 'fast' ? 45
          : content.animationSpeed === 'slow' ? 160
          : content.animationSpeed === 'ultra-fast' ? 25
          : content.animationSpeed === 'dramatic' ? 240
          : 90;

        const twLoopMode = (content.typewriterMode as any) || (content.animationLoop === false ? 'once' : 'erase');
        const twLoop = twLoopMode !== 'once';
        const twPause = typeof content.typewriterPause === 'number' ? content.typewriterPause : 1500;
        const twCursor = content.typewriterCursor !== undefined ? content.typewriterCursor : '|';
        const twCursorBlink = content.typewriterCursorBlink || 'blink';
        const twCursorColor = content.typewriterCursorColor || undefined;
        const twDeleteSpeed = typeof content.typewriterDeleteSpeed === 'number' ? content.typewriterDeleteSpeed : 40;
        const twReplayKey = content.typewriterReplayKey || 0;

        return (
          <div className="w-full">
            {anim !== 'none' && (
              <style>{`
                @keyframes nf-shimmer {
                  0% { background-position: -200% 0; }
                  100% { background-position: 200% 0; }
                }
                .nf-heading-shimmer {
                  background: linear-gradient(90deg, ${shimmerFrom} 0%, ${shimmerMid} 50%, ${shimmerEnd} 100%);
                  background-size: 200% auto;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  animation: nf-shimmer ${animSpeed} linear ${animLoop};
                }
                @keyframes nf-neon-pulse {
                  0%, 100% { text-shadow: ${subtleNeonGlow}; opacity: 0.92; }
                  50% { text-shadow: ${activeNeonGlow}; opacity: 1; }
                }
                .nf-heading-neon-pulse {
                  animation: nf-neon-pulse ${animSpeed} ease-in-out ${animLoop};
                }
                @keyframes nf-neon-flicker {
                  0%, 18.99%, 22%, 62.99%, 64%, 64.99%, 70%, 100% {
                    opacity: 1;
                    text-shadow: ${activeNeonGlow};
                  }
                  19%, 21.99%, 63%, 63.99%, 65%, 69.99% {
                    opacity: 0.25;
                    text-shadow: none;
                  }
                }
                .nf-heading-neon-flicker {
                  animation: nf-neon-flicker ${animSpeed} linear ${animLoop};
                }
                @keyframes nf-neon-electric {
                  0%, 100% { text-shadow: ${activeNeonGlow}; opacity: 1; }
                  41.99% { text-shadow: ${activeNeonGlow}; opacity: 1; }
                  42% { text-shadow: none; opacity: 0.2; }
                  42.8% { text-shadow: ${activeNeonGlow}; opacity: 1; }
                  44% { text-shadow: 0 0 3px #fff, 0 0 8px ${neonColor}; opacity: 0.55; }
                  45.5% { text-shadow: ${activeNeonGlow}; opacity: 1; }
                }
                .nf-heading-neon-electric {
                  animation: nf-neon-electric ${animSpeed} ease-in-out ${animLoop};
                }
                .nf-heading-neon-steady {
                  text-shadow: ${activeNeonGlow};
                }
                @keyframes nf-float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-8px); }
                }
                .nf-heading-floating {
                  animation: nf-float ${animSpeed} ease-in-out ${animLoop};
                }
                @keyframes nf-pulseglow {
                  0%, 100% { text-shadow: 0 0 4px rgba(99,102,241,0.2); }
                  50% { text-shadow: 0 0 20px rgba(99,102,241,0.7), 0 0 35px rgba(236,72,153,0.5); }
                }
                .nf-heading-pulseglow {
                  animation: nf-pulseglow ${animSpeed} ease-in-out ${animLoop};
                }
                @keyframes nf-bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
                .nf-heading-bounce {
                  animation: nf-bounce ${animSpeed} cubic-bezier(0.28, 0.84, 0.42, 1) ${animLoop};
                }
                @keyframes nf-fadeslide {
                  from { opacity: 0; transform: translateY(16px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .nf-heading-fadeslide {
                  animation: nf-fadeslide ${animSpeed} ease-out forwards;
                }
                @keyframes nf-tw-blink {
                  0%, 49% { opacity: 1; }
                  50%, 100% { opacity: 0; }
                }
                @keyframes nf-tw-pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.15; }
                }
                .nf-tw-cursor-blink {
                  animation: nf-tw-blink 0.8s infinite;
                }
                .nf-tw-cursor-pulse {
                  animation: nf-tw-pulse 1.1s ease-in-out infinite;
                }
                .nf-tw-cursor-solid {
                  opacity: 1;
                }
                .nf-tw-cursor-none {
                  display: none !important;
                }
              `}</style>
            )}

            {decType === 'badge-pill' && (
              <div className="mb-2">
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    backgroundColor: `${decColor}15`,
                    color: decColor,
                    border: `1px solid ${decColor}40`
                  }}
                >
                  {content.badgeText || 'FEATURE'}
                </span>
              </div>
            )}

            <Tag
              className={`tracking-tight leading-tight transition-all ${animClass}`}
              style={{
                fontFamily: styles.fontFamily || undefined,
                color: isNeon
                  ? (neonWhiteCore ? '#ffffff' : neonColor)
                  : (textFillColor === 'transparent' ? undefined : (styles.color || '#000000')),
                backgroundColor: bgExtra || styles.bgColor || undefined,
                backgroundImage: isGradient ? bgExtra : (styles.bgGradient || undefined),
                WebkitBackgroundClip: bgClip as any,
                WebkitTextFillColor: isNeon ? (neonWhiteCore ? '#ffffff' : neonColor) : textFillColor,
                textDecoration: textDecor,
                textDecorationColor: textDecorColor,
                textDecorationThickness: textDecorThickness,
                textUnderlineOffset: textUnderlineOffset,
                textDecorationSkipInk: 'none',
                WebkitTextDecorationSkip: 'none',
                borderLeft: borderLeft,
                border: borderExtra || (hasBorder ? `${normalizeUnit(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor}` : undefined),
                borderRadius: borderRadExtra || normalizeUnit(styles.borderRadius) || undefined,
                boxShadow: styles.shadow || undefined,
                paddingTop: normalizeUnit(styles.paddingTop) || (hasBg || hasBorder || decType === 'highlight' ? '6px' : undefined),
                paddingBottom: normalizeUnit(styles.paddingBottom) || (hasBg || hasBorder || decType === 'highlight' ? '6px' : undefined),
                paddingLeft: paddingLeftExtra || normalizeUnit(styles.paddingLeft) || (hasBg || hasBorder || decType === 'highlight' ? '12px' : undefined),
                paddingRight: normalizeUnit(styles.paddingRight) || (hasBg || hasBorder || decType === 'highlight' || decType === 'circled' ? '16px' : undefined),
                fontSize: normalizeUnit(styles.fontSize) || '36px',
                fontWeight: styles.fontWeight || (content.tag === 'h1' ? '800' : content.tag === 'h2' ? '700' : '600'),
                textShadow: isNeon
                  ? (neonStyle === 'steady' ? activeNeonGlow : undefined)
                  : (styles.textShadow || undefined),
                textAlign: styles.textAlign || 'left',
                textTransform: (styles.textTransform || content.textTransform || undefined) as any,
                letterSpacing: normalizeUnit(styles.headingLetterSpacing || styles.letterSpacing),
                lineHeight: normalizeUnit(styles.headingLineHeight || styles.lineHeight),
                marginTop: normalizeUnit(styles.marginTop),
                marginBottom: normalizeUnit(styles.marginBottom),
                display: (hasBg || hasBorder || isGradient || decType === 'highlight' || decType === 'circled') ? 'inline-block' : undefined,
                maxWidth: '100%',
                position: 'relative'
              }}
            >
              {decType === 'woosh' || decType === 'slash' ? (
                <span style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                  {isTypewriter ? (
                    <TypewriterHeading
                      key={`tw-${el.id}-${twReplayKey}-${headingText}-${twSpeed}-${twLoopMode}-${twCursor}`}
                      text={headingText}
                      speedMs={twSpeed}
                      pauseMs={twPause}
                      loop={twLoop}
                      loopMode={twLoopMode}
                      cursorChar={twCursor}
                      cursorBlink={twCursorBlink}
                      cursorColor={twCursorColor}
                      deleteSpeedMs={twDeleteSpeed}
                      replayKey={twReplayKey}
                    />
                  ) : (
                    headingText
                  )}
                  {decType === 'woosh' && (
                    <svg
                      viewBox="0 0 200 16"
                      preserveAspectRatio="none"
                      style={{
                        display: 'block',
                        width: '100%',
                        height: `${Math.max(6, decThick * 2.5)}px`,
                        marginTop: '2px',
                        overflow: 'visible',
                        color: decColor
                      }}
                    >
                      <path
                        d="M 2 11 C 45 3, 155 1, 198 7 C 145 13, 55 15, 2 11 Z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  {decType === 'slash' && (
                    <span
                      style={{
                        position: 'absolute',
                        left: '-4%',
                        right: '-4%',
                        top: '52%',
                        height: `${Math.max(2, decThick)}px`,
                        backgroundColor: decColor,
                        transform: 'rotate(-3.5deg)',
                        transformOrigin: 'center',
                        borderRadius: '2px',
                        pointerEvents: 'none',
                        zIndex: 1,
                        opacity: 0.9
                      }}
                    />
                  )}
                </span>
              ) : isTypewriter ? (
                <TypewriterHeading
                  key={`tw-${el.id}-${twReplayKey}-${headingText}-${twSpeed}-${twLoopMode}-${twCursor}`}
                  text={headingText}
                  speedMs={twSpeed}
                  pauseMs={twPause}
                  loop={twLoop}
                  loopMode={twLoopMode}
                  cursorChar={twCursor}
                  cursorBlink={twCursorBlink}
                  cursorColor={twCursorColor}
                  deleteSpeedMs={twDeleteSpeed}
                  replayKey={twReplayKey}
                />
              ) : (
                headingText
              )}
            </Tag>
          </div>
        );
      }

      // 2. TEXT EDITOR
      case 'text': {
        const hasBorder = Boolean(styles.borderColor && styles.borderColor !== 'transparent');
        const hasBg = Boolean(styles.bgColor && styles.bgColor !== 'transparent');
        const htmlContent = content.html || (content.text ? `<p>${content.text}</p>` : '');

        return (
          <div
            data-align={styles.textAlign || 'left'}
            className="w-full leading-relaxed transition-all nextforge-rich-text"
            style={{
              fontFamily: styles.fontFamily || undefined,
              color: styles.color || '#334155',
              backgroundColor: styles.bgColor || undefined,
              border: hasBorder
                ? `${normalizeUnit(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor}`
                : undefined,
              borderRadius: normalizeUnit(styles.borderRadius) || undefined,
              boxShadow: styles.shadow || undefined,
              paddingTop: normalizeUnit(styles.paddingTop) || (hasBg || hasBorder ? '8px' : undefined),
              paddingBottom: normalizeUnit(styles.paddingBottom) || (hasBg || hasBorder ? '8px' : undefined),
              paddingLeft: normalizeUnit(styles.paddingLeft) || (hasBg || hasBorder ? '12px' : undefined),
              paddingRight: normalizeUnit(styles.paddingRight) || (hasBg || hasBorder ? '12px' : undefined),
              fontSize: normalizeUnit(styles.fontSize) || '15px',
              fontWeight: styles.fontWeight || '400',
              textShadow: styles.textShadow || undefined,
              textAlign: styles.textAlign || 'left',
              textTransform: (styles.textTransform || (content as any)?.textTransform || undefined) as any,
              letterSpacing: normalizeUnit(styles.letterSpacing),
              lineHeight: normalizeUnit(styles.lineHeight),
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom),
              display: 'block',
              width: '100%',
              maxWidth: '100%'
            }}
            dangerouslySetInnerHTML={{
              __html: htmlContent || '<p>Start typing your paragraph text here...</p>'
            }}
          />
        );
      }

      // 3. BUTTON
      case 'button': {
        return <InteractiveButtonElement content={content} styles={styles} />;
      }

      // 4. IMAGE
      case 'image': {
        const imageUrl =
          content.url ||
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';

        const imgWidth = content.imageWidth || content.width || '100%';
        const imgHeight = content.imageHeight || content.height || 'auto';
        const objectFit = content.objectFit || 'cover';

        const rawOpacity = styles.opacity !== undefined && styles.opacity !== ''
          ? styles.opacity
          : (content.opacity !== undefined && content.opacity !== '' ? content.opacity : undefined);
        const imgOpacity = rawOpacity !== undefined ? Number(rawOpacity) : 1;

        return (
          <div
            className="overflow-hidden shadow-2xl transition-all"
            style={{
              borderRadius: normalizeUnit(styles.borderRadius) || '16px',
              boxShadow: styles.shadow || undefined,
              border: styles.borderColor && styles.borderColor !== 'transparent'
                ? `${normalizeUnit(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor}`
                : undefined,
              paddingTop: normalizeUnit(styles.paddingTop),
              paddingBottom: normalizeUnit(styles.paddingBottom),
              paddingLeft: normalizeUnit(styles.paddingLeft),
              paddingRight: normalizeUnit(styles.paddingRight),
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom),
              width: imgWidth && imgWidth !== 'auto' ? normalizeUnit(imgWidth) : undefined,
              maxWidth: '100%'
            }}
          >
            <img
              src={imageUrl}
              alt={content.alt || 'Visual display'}
              style={{
                borderRadius: normalizeUnit(styles.borderRadius) || '16px',
                width: normalizeUnit(imgWidth) || '100%',
                height: imgHeight === 'auto' ? 'auto' : (normalizeUnit(imgHeight) || 'auto'),
                objectFit: objectFit as any,
                maxHeight: imgHeight === 'auto' ? '380px' : undefined,
                opacity: imgOpacity
              }}
              className="transition-all duration-300 hover:scale-[1.01]"
            />
            {content.caption && (
              <p className="text-[11px] text-slate-400 text-center mt-2 italic">{content.caption}</p>
            )}
          </div>
        );
      }

      // 5. IMAGE BOX
      case 'imagebox': {
        const items: { id: string; url: string; title: string; description: string }[] =
          content.items && content.items.length > 0
            ? content.items
            : [
                {
                  id: 'item-default',
                  url: content.url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
                  title: content.title || 'Feature Spotlight',
                  description: content.description || 'Describe your visual highlight or workflow here.'
                }
              ];

        const cardWidth = content.cardWidth;
        const imgHeight = content.imageHeight || '180px';
        const imgWidth = content.imageWidth || '100%';
        const objectFit = content.objectFit || 'cover';
        const hasBorder = Boolean(styles.borderColor && styles.borderColor !== 'transparent');

        // Navigation Arrow Customization Properties
        const showArrows = content.showArrows !== false;
        const arrowPlacement = content.arrowPlacement || styles.arrowPlacement || 'sides';
        const arrowShape = content.arrowShape || styles.arrowShape || 'circle';
        const arrowSize = content.arrowSize || styles.arrowSize || 'md';
        const arrowIcon = content.arrowIcon || styles.arrowIcon || 'chevron';
        const arrowHoverOnly = Boolean(content.arrowHoverOnly ?? styles.arrowHoverOnly);
        const rawArrowOpacity = styles.arrowOpacity !== undefined && styles.arrowOpacity !== ''
          ? styles.arrowOpacity
          : (content.arrowOpacity !== undefined && content.arrowOpacity !== '' ? content.arrowOpacity : undefined);
        const arrowOpacity = rawArrowOpacity !== undefined ? Number(rawArrowOpacity) : 1;
        const arrowBg = styles.arrowBgColor || 'rgba(15, 23, 42, 0.75)';
        const arrowColor = styles.arrowColor || '#ffffff';
        const arrowBorderColor = styles.arrowBorderColor || (arrowShape === 'ghost' ? 'currentColor' : 'rgba(255, 255, 255, 0.2)');

        // Arrow Free Placement (Sliders & Layout)
        const arrowOrientation = content.arrowOrientation || 'horizontal';
        const arrowGap = content.arrowGap !== undefined ? Number(content.arrowGap) : 8;
        const arrowCustomX = content.arrowCustomX !== undefined ? Number(content.arrowCustomX) : 50;
        const arrowCustomY = content.arrowCustomY !== undefined ? Number(content.arrowCustomY) : 50;

        // Navigation Dots Customization Properties
        const showDots = content.showDots !== false;
        const dotsPlacement = content.dotsPlacement || styles.dotsPlacement || 'bottom-center';
        const dotsShape = content.dotsShape || styles.dotsShape || 'dots';
        const dotsSize = content.dotsSize || styles.dotsSize || 'md';
        const dotsBackdrop = content.dotsBackdrop || styles.dotsBackdrop || 'pill';
        const rawDotsOpacity = styles.dotsOpacity !== undefined && styles.dotsOpacity !== ''
          ? styles.dotsOpacity
          : (content.dotsOpacity !== undefined && content.dotsOpacity !== '' ? content.dotsOpacity : undefined);
        const dotsOpacity = rawDotsOpacity !== undefined ? Number(rawDotsOpacity) : 1;
        const activeDotColor = styles.dotActiveColor || '#6366f1';
        const dotColor = styles.dotColor || 'rgba(255, 255, 255, 0.4)';

        // Dots Free Placement (Sliders & Orientation)
        const dotsOrientation = content.dotsOrientation || 'horizontal';
        const dotsCustomX = content.dotsCustomX !== undefined ? Number(content.dotsCustomX) : 50;
        const dotsCustomY = content.dotsCustomY !== undefined ? Number(content.dotsCustomY) : 92;

        // Slide numbers badge
        const showSlideNumbers = content.showSlideNumbers !== false;

        // Container backdrop styling
        let dotsBackdropClass = 'bg-slate-950/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/15';
        if (dotsBackdrop === 'transparent') {
          dotsBackdropClass = 'px-1 py-1';
        } else if (dotsBackdrop === 'glass') {
          dotsBackdropClass = 'bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/30';
        }
        if (dotsOrientation === 'vertical') {
          if (dotsBackdrop === 'glass') {
            dotsBackdropClass = 'bg-white/20 backdrop-blur-md px-1.5 py-2.5 rounded-full border border-white/30';
          } else if (dotsBackdrop !== 'transparent') {
            dotsBackdropClass = 'bg-slate-950/60 backdrop-blur-sm px-1.5 py-2.5 rounded-full border border-white/15';
          }
        }

        // Placement container classes & styles
        let dotsPlacementClass = 'bottom-3 left-1/2 -translate-x-1/2';
        let dotsCustomStyle: React.CSSProperties = { opacity: dotsOpacity };

        if (dotsPlacement === 'custom') {
          dotsPlacementClass = '';
          dotsCustomStyle = {
            opacity: dotsOpacity,
            left: `${dotsCustomX}%`,
            top: `${dotsCustomY}%`,
            transform: `translate(-${dotsCustomX}%, -${dotsCustomY}%)`
          };
        } else if (dotsPlacement === 'bottom-left') {
          dotsPlacementClass = 'bottom-3 left-3';
        } else if (dotsPlacement === 'bottom-right') {
          dotsPlacementClass = 'bottom-3 right-3';
        } else if (dotsPlacement === 'top-center') {
          dotsPlacementClass = 'top-3 left-1/2 -translate-x-1/2';
        } else if (dotsPlacement === 'top-left') {
          dotsPlacementClass = 'top-3 left-3';
        } else if (dotsPlacement === 'top-right') {
          dotsPlacementClass = 'top-3 right-3';
        }

        // Automatically shift if bottom-center collides with arrows
        if (arrowPlacement === 'bottom-center' && dotsPlacement === 'bottom-center') {
          dotsPlacementClass = 'bottom-12 left-1/2 -translate-x-1/2';
        }

        // Dot dimensions and shapes
        const getDotClasses = (isActive: boolean) => {
          if (dotsShape === 'lines') {
            if (dotsSize === 'sm') return isActive ? 'w-6 h-0.5 rounded-none' : 'w-3 h-0.5 rounded-none';
            if (dotsSize === 'lg') return isActive ? 'w-12 h-1.5 rounded-sm' : 'w-6 h-1.5 rounded-sm';
            return isActive ? 'w-8 h-1 rounded-sm' : 'w-4 h-1 rounded-sm';
          }
          if (dotsShape === 'pills') {
            if (dotsSize === 'sm') return isActive ? 'w-5 h-1.5 rounded-full' : 'w-2.5 h-1.5 rounded-full';
            if (dotsSize === 'lg') return isActive ? 'w-9 h-3 rounded-full' : 'w-5 h-3 rounded-full';
            return isActive ? 'w-7 h-2 rounded-full' : 'w-3.5 h-2 rounded-full';
          }
          if (dotsShape === 'squares') {
            if (dotsSize === 'sm') return isActive ? 'w-3.5 h-2 rounded-none' : 'w-2 h-2 rounded-none';
            if (dotsSize === 'lg') return isActive ? 'w-6 h-3 rounded-none' : 'w-3 h-3 rounded-none';
            return isActive ? 'w-4 h-2.5 rounded-none' : 'w-2.5 h-2.5 rounded-none';
          }
          if (dotsShape === 'circles') {
            if (dotsSize === 'sm') return 'w-1.5 h-1.5 rounded-full';
            if (dotsSize === 'lg') return 'w-3.5 h-3.5 rounded-full';
            return 'w-2.5 h-2.5 rounded-full';
          }
          if (dotsShape === 'numbers') {
            if (dotsSize === 'sm') return 'w-4 h-4 text-[9px] rounded-full flex items-center justify-center font-bold font-mono';
            if (dotsSize === 'lg') return 'w-6 h-6 text-xs rounded-full flex items-center justify-center font-bold font-mono';
            return 'w-5 h-5 text-[10px] rounded-full flex items-center justify-center font-bold font-mono';
          }
          // Default: 'dots' (expanding pill)
          if (dotsSize === 'sm') return isActive ? 'w-4 h-1.5 rounded-full shadow-xs' : 'w-1.5 h-1.5 rounded-full';
          if (dotsSize === 'lg') return isActive ? 'w-8 h-3 rounded-full shadow-xs' : 'w-3 h-3 rounded-full';
          return isActive ? 'w-6 h-2 rounded-full shadow-xs' : 'w-2 h-2 rounded-full';
        };

        // Dimensions based on arrowSize
        let arrowDimensions = 'w-8 h-8';
        let arrowIconSize = 'w-4 h-4';
        if (arrowSize === 'sm') {
          arrowDimensions = 'w-6 h-6';
          arrowIconSize = 'w-3 h-3';
        } else if (arrowSize === 'lg') {
          arrowDimensions = 'w-10 h-10';
          arrowIconSize = 'w-5 h-5';
        } else if (arrowSize === 'xl') {
          arrowDimensions = 'w-12 h-12';
          arrowIconSize = 'w-6 h-6';
        }

        // Shapes
        let arrowShapeClasses = 'rounded-full';
        if (arrowShape === 'rounded') {
          arrowShapeClasses = 'rounded-lg';
        } else if (arrowShape === 'square') {
          arrowShapeClasses = 'rounded-none';
        } else if (arrowShape === 'glass') {
          arrowShapeClasses = 'rounded-full backdrop-blur-md bg-white/20 border border-white/30';
        } else if (arrowShape === 'ghost') {
          arrowShapeClasses = 'rounded-full bg-transparent hover:bg-white/20 border border-current shadow-none';
        }

        // Hover Visibility
        const arrowHoverClasses = arrowHoverOnly
          ? 'opacity-0 group-hover:opacity-100 transition-all duration-200'
          : 'transition-all duration-200';

        const renderPrevIcon = () => {
          if (arrowIcon === 'arrow') return <ArrowLeft className={arrowIconSize} />;
          if (arrowIcon === 'long') return <MoveLeft className={arrowIconSize} />;
          return <ChevronLeft className={arrowIconSize} />;
        };

        const renderNextIcon = () => {
          if (arrowIcon === 'arrow') return <ArrowRight className={arrowIconSize} />;
          if (arrowIcon === 'long') return <MoveRight className={arrowIconSize} />;
          return <ChevronRight className={arrowIconSize} />;
        };

        const prevButton = (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlideIdx((prev) => (prev - 1 + items.length) % items.length);
            }}
            style={{
              backgroundColor: arrowShape === 'ghost' ? 'transparent' : arrowBg,
              color: arrowColor,
              borderColor: arrowBorderColor,
              opacity: arrowOpacity
            }}
            className={`${arrowDimensions} ${arrowShapeClasses} flex items-center justify-center shadow-md hover:scale-110 z-20 cursor-pointer border ${arrowHoverClasses}`}
            title="Previous Slide"
          >
            {renderPrevIcon()}
          </button>
        );

        const nextButton = (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlideIdx((prev) => (prev + 1) % items.length);
            }}
            style={{
              backgroundColor: arrowShape === 'ghost' ? 'transparent' : arrowBg,
              color: arrowColor,
              borderColor: arrowBorderColor,
              opacity: arrowOpacity
            }}
            className={`${arrowDimensions} ${arrowShapeClasses} flex items-center justify-center shadow-md hover:scale-110 z-20 cursor-pointer border ${arrowHoverClasses}`}
            title="Next Slide"
          >
            {renderNextIcon()}
          </button>
        );

        if (items.length > 1) {
          const activeIdx = Math.max(0, Math.min(items.length - 1, currentSlideIdx));
          const activeItem = items[activeIdx] || items[0];
          return (
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`relative text-left shadow-lg group select-none transition-all ${
                arrowPlacement === 'outside' ? 'overflow-visible px-3' : 'overflow-hidden'
              }`}
              style={{
                width: cardWidth && cardWidth !== 'auto' ? normalizeUnit(cardWidth) : undefined,
                maxWidth: '100%',
                backgroundColor: styles.bgColor || '#0f172a',
                color: styles.color || '#ffffff',
                border: hasBorder
                  ? `${normalizeUnit(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor}`
                  : '1px solid rgba(51, 65, 85, 0.8)',
                borderRadius: normalizeUnit(styles.borderRadius) || '16px',
                paddingTop: normalizeUnit(styles.paddingTop),
                paddingBottom: normalizeUnit(styles.paddingBottom),
                paddingLeft: normalizeUnit(styles.paddingLeft),
                paddingRight: normalizeUnit(styles.paddingRight),
                marginTop: normalizeUnit(styles.marginTop),
                marginBottom: normalizeUnit(styles.marginBottom),
                boxShadow: styles.shadow || undefined
              }}
            >
              <div
                className={`w-full relative flex items-center justify-center bg-slate-900/40 ${
                  arrowPlacement === 'outside' ? 'overflow-visible' : 'overflow-hidden'
                }`}
                style={{
                  height: imgHeight === 'auto' ? 'auto' : (normalizeUnit(imgHeight) || '220px'),
                  perspective: '1000px'
                }}
              >
                <div
                  key={`imgbox-slide-${el.id}-${activeIdx}`}
                  className={`w-full h-full relative overflow-hidden flex items-center justify-center nf-slide-${content.slideEffect || 'slide-horizontal'}`}
                  style={{
                    '--slide-duration': `${content.slideDuration !== undefined ? Number(content.slideDuration) : 500}ms`,
                    '--slide-interval-or-duration': `${Math.max(Number(content.slideInterval) || 4, 3)}s`
                  } as React.CSSProperties}
                >
                  <img
                    src={activeItem.url}
                    alt={activeItem.title || 'Image box'}
                    style={{
                      width: normalizeUnit(imgWidth) || '100%',
                      height: imgHeight === 'auto' ? 'auto' : (normalizeUnit(imgHeight) || '100%'),
                      objectFit: objectFit as any
                    }}
                    className="select-none"
                  />
                </div>

                {/* Navigation Arrows */}
                {showArrows && (() => {
                  if (arrowPlacement === 'custom') {
                    return (
                      <div
                        className={`absolute z-20 flex ${
                          arrowOrientation === 'vertical' ? 'flex-col' : 'flex-row'
                        } items-center`}
                        style={{
                          left: `${arrowCustomX}%`,
                          top: `${arrowCustomY}%`,
                          transform: `translate(-${arrowCustomX}%, -${arrowCustomY}%)`,
                          gap: `${arrowGap}px`
                        }}
                      >
                        {prevButton}
                        {nextButton}
                      </div>
                    );
                  }
                  if (arrowPlacement === 'outside') {
                    const outsideTop = content.arrowCustomY !== undefined ? `${content.arrowCustomY}%` : '50%';
                    return (
                      <>
                        <div
                          className="absolute -left-3 sm:-left-4 z-20"
                          style={{ top: outsideTop, transform: `translateY(-${outsideTop})` }}
                        >
                          {prevButton}
                        </div>
                        <div
                          className="absolute -right-3 sm:-right-4 z-20"
                          style={{ top: outsideTop, transform: `translateY(-${outsideTop})` }}
                        >
                          {nextButton}
                        </div>
                      </>
                    );
                  }
                  if (arrowPlacement === 'top-right') {
                    return (
                      <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 z-20">
                        {prevButton}
                        {nextButton}
                      </div>
                    );
                  }
                  if (arrowPlacement === 'top-left') {
                    return (
                      <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 z-20">
                        {prevButton}
                        {nextButton}
                      </div>
                    );
                  }
                  if (arrowPlacement === 'bottom-right') {
                    return (
                      <div className="absolute bottom-2.5 right-2.5 flex items-center space-x-1.5 z-20">
                        {prevButton}
                        {nextButton}
                      </div>
                    );
                  }
                  if (arrowPlacement === 'bottom-left') {
                    return (
                      <div className="absolute bottom-2.5 left-2.5 flex items-center space-x-1.5 z-20">
                        {prevButton}
                        {nextButton}
                      </div>
                    );
                  }
                  if (arrowPlacement === 'bottom-center') {
                    return (
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-20">
                        {prevButton}
                        {nextButton}
                      </div>
                    );
                  }
                  // Default: 'sides'
                  const sidesTop = content.arrowCustomY !== undefined ? `${content.arrowCustomY}%` : '50%';
                  return (
                    <>
                      <div
                        className="absolute left-2.5 z-20"
                        style={{ top: sidesTop, transform: `translateY(-${sidesTop})` }}
                      >
                        {prevButton}
                      </div>
                      <div
                        className="absolute right-2.5 z-20"
                        style={{ top: sidesTop, transform: `translateY(-${sidesTop})` }}
                      >
                        {nextButton}
                      </div>
                    </>
                  );
                })()}

                {/* Navigation Dots */}
                {showDots && items.length > 1 && (
                  <div
                    style={dotsCustomStyle}
                    className={`absolute ${dotsPlacementClass} flex ${
                      dotsOrientation === 'vertical' ? 'flex-col space-y-1.5' : 'flex-row space-x-1.5'
                    } items-center z-20 ${dotsBackdropClass} transition-all`}
                  >
                    {items.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSlideIdx(i);
                        }}
                        style={{
                          backgroundColor: i === activeIdx ? activeDotColor : dotColor,
                          color: i === activeIdx ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'
                        }}
                        className={`${getDotClasses(i === activeIdx)} transition-all cursor-pointer ${
                          i === activeIdx ? 'scale-105' : 'hover:opacity-100 opacity-70'
                        }`}
                        title={`Go to slide ${i + 1}`}
                      >
                        {dotsShape === 'numbers' ? i + 1 : null}
                      </button>
                    ))}
                  </div>
                )}

                {/* Slide Counter */}
                {showSlideNumbers && (
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full z-10 border border-white/10">
                    {activeIdx + 1} / {items.length}
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <h4
                  className="font-bold text-sm"
                  style={{
                    fontFamily: styles.fontFamily || undefined,
                    fontSize: normalizeUnit(styles.fontSize) || '15px',
                    fontWeight: styles.fontWeight || '700',
                    textShadow: styles.textShadow || undefined,
                    color: styles.color || '#ffffff'
                  }}
                >
                  {activeItem.title}
                </h4>
                <p
                  className="text-xs text-slate-400 leading-relaxed"
                  style={{
                    fontFamily: styles.descFontFamily || styles.fontFamily || undefined,
                    fontSize: normalizeUnit(styles.descFontSize) || undefined,
                    fontWeight: styles.descFontWeight || undefined,
                    color: styles.descColor || undefined,
                    textShadow: styles.textShadow || undefined
                  }}
                >
                  {activeItem.description}
                </p>
              </div>
            </div>
          );
        }

        const singleItem = items[0];
        return (
          <div
            className="overflow-hidden transition-all text-left shadow-lg"
            style={{
              width: cardWidth && cardWidth !== 'auto' ? normalizeUnit(cardWidth) : undefined,
              maxWidth: '100%',
              backgroundColor: styles.bgColor || '#0f172a',
              color: styles.color || '#ffffff',
              border: hasBorder
                ? `${normalizeUnit(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor}`
                : '1px solid rgba(51, 65, 85, 0.8)',
              borderRadius: normalizeUnit(styles.borderRadius) || '16px',
              paddingTop: normalizeUnit(styles.paddingTop),
              paddingBottom: normalizeUnit(styles.paddingBottom),
              paddingLeft: normalizeUnit(styles.paddingLeft),
              paddingRight: normalizeUnit(styles.paddingRight),
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            <div
              className="w-full flex items-center justify-center overflow-hidden bg-slate-900/40"
              style={{
                height: imgHeight === 'auto' ? 'auto' : (normalizeUnit(imgHeight) || '180px')
              }}
            >
              <img
                src={singleItem.url}
                alt={singleItem.title || 'Image box'}
                style={{
                  width: normalizeUnit(imgWidth) || '100%',
                  height: imgHeight === 'auto' ? 'auto' : (normalizeUnit(imgHeight) || '100%'),
                  objectFit: objectFit as any
                }}
                className="transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
            <div className="p-4 space-y-2">
              <h4
                className="font-bold text-sm"
                style={{
                  fontFamily: styles.fontFamily || undefined,
                  fontSize: normalizeUnit(styles.fontSize) || '15px',
                  fontWeight: styles.fontWeight || '700',
                  textShadow: styles.textShadow || undefined,
                  color: styles.color || '#ffffff'
                }}
              >
                {singleItem.title}
              </h4>
              <p
                className="text-xs text-slate-400 leading-relaxed"
                style={{
                  fontFamily: styles.descFontFamily || styles.fontFamily || undefined,
                  fontSize: normalizeUnit(styles.descFontSize) || undefined,
                  fontWeight: styles.descFontWeight || undefined,
                  color: styles.descColor || undefined,
                  textShadow: styles.textShadow || undefined
                }}
              >
                {singleItem.description}
              </p>
            </div>
          </div>
        );
      }

      // 5b. BEFORE / AFTER COMPARISON SLIDER
      case 'beforeafter': {
        const beforeImg = content.beforeImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
        const afterImg = content.afterImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
        const beforeLabel = content.beforeLabel !== undefined ? content.beforeLabel : 'Before';
        const afterLabel = content.afterLabel !== undefined ? content.afterLabel : 'After';
        const showLabels = content.showLabels !== false;
        const orientation = content.orientation || 'horizontal';
        const isVertical = orientation === 'vertical';
        const sliderPos = typeof content.sliderPosition === 'number' ? content.sliderPosition : 50;
        const imgHeight = content.imageHeight || '400px';
        const objectFit = content.objectFit || 'cover';
        const handleColor = content.handleColor || '#ffffff';

        return (
          <div
            style={{
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom),
              marginLeft: normalizeUnit(styles.marginLeft),
              marginRight: normalizeUnit(styles.marginRight),
              borderRadius: normalizeUnit(styles.borderRadius) || '16px',
              boxShadow: styles.shadow || '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              position: 'relative',
              width: '100%',
              height: imgHeight,
              userSelect: 'none'
            }}
            className="group/beforeafter"
          >
            {/* Base Image (After) */}
            <img
              src={afterImg}
              alt={afterLabel}
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: objectFit as any,
                display: 'block',
                pointerEvents: 'none'
              }}
            />

            {/* Overlay Image (Before) clipped */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                clipPath: isVertical
                  ? `inset(0 0 ${100 - sliderPos}% 0)`
                  : `inset(0 ${100 - sliderPos}% 0 0)`,
                pointerEvents: 'none'
              }}
            >
              <img
                src={beforeImg}
                alt={beforeLabel}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: objectFit as any,
                  display: 'block'
                }}
              />
            </div>

            {/* Comparison Labels */}
            {showLabels && (
              <>
                <span
                  style={{
                    position: 'absolute',
                    top: isVertical ? '12px' : '12px',
                    left: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    backdropFilter: 'blur(8px)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.03em',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    zIndex: 10,
                    pointerEvents: 'none'
                  }}
                >
                  {beforeLabel}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    bottom: isVertical ? '12px' : undefined,
                    top: isVertical ? undefined : '12px',
                    right: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    backdropFilter: 'blur(8px)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.03em',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    zIndex: 10,
                    pointerEvents: 'none'
                  }}
                >
                  {afterLabel}
                </span>
              </>
            )}

            {/* Split Divider Handle Line */}
            <div
              style={{
                position: 'absolute',
                left: isVertical ? '0' : `${sliderPos}%`,
                top: isVertical ? `${sliderPos}%` : '0',
                width: isVertical ? '100%' : '3px',
                height: isVertical ? '3px' : '100%',
                backgroundColor: handleColor,
                boxShadow: '0 0 10px rgba(0,0,0,0.4)',
                transform: isVertical ? 'translateY(-50%)' : 'translateX(-50%)',
                zIndex: 20,
                pointerEvents: 'none'
              }}
            >
              {/* Center Handle Button with Arrows */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '9999px',
                  backgroundColor: handleColor,
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  border: '2px solid rgba(255,255,255,0.8)'
                }}
              >
                {isVertical ? (
                  <div className="flex flex-col items-center justify-center -space-y-1">
                    <ChevronUp className="w-3.5 h-3.5 text-slate-800 stroke-[3]" />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-800 stroke-[3]" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center -space-x-1">
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-800 stroke-[3]" />
                    <ChevronRight className="w-3.5 h-3.5 text-slate-800 stroke-[3]" />
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Range Input overlay to let user drag on canvas */}
            <input
              type="range"
              min={0}
              max={100}
              value={sliderPos}
              onChange={(e) => {
                const newPos = Number(e.target.value);
                useBuilderStore.getState().updateElementContent(el.id, { sliderPosition: newPos });
              }}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: isVertical ? 'ns-resize' : 'ew-resize',
                zIndex: 30,
                margin: 0
              }}
            />
          </div>
        );
      }

      // 6. GALLERY, CAROUSEL & MEDIA CAROUSEL (Slider with Next/Prev Navigation & Auto Slide Loop)
      case 'gallery':
      case 'carousel':
      case 'mediacarousel': {
        const rawList =
          content.items && content.items.length > 0
            ? content.items
            : (content.images && content.images.length > 0
                ? content.images
                : [
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
                  ]);

        const items: { id: string; url: string; title?: string; caption?: string }[] = rawList.map((item: any, i: number) => {
          if (typeof item === 'string') {
            return {
              id: `slide-${i}`,
              url: item,
              title: `Photo ${i + 1}`,
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

        const isCarouselWidget = el.type === 'carousel' || el.type === 'mediacarousel';
        const displayMode = content.displayMode || (isCarouselWidget ? 'slider' : (content.columns ? 'grid' : 'slider'));
        const showArrows = content.showArrows !== false;
        const showDots = content.showDots !== false;
        const showSlideNumbers = content.showSlideNumbers !== false && content.showNumbers !== false;
        const slideHeight = content.slideHeight || '340px';
        const objectFit = content.objectFit || 'cover';

        // Border & Container Frame Styling
        const hasBorder = Boolean(
          (styles.borderColor && styles.borderColor !== 'transparent') ||
          (styles.borderWidth && styles.borderWidth !== '0px')
        );
        const borderVal = hasBorder
          ? `${normalizeUnit(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor || '#334155'}`
          : undefined;

        const containerRadius = normalizeUnit(styles.borderRadius) || '16px';
        const containerBg = styles.bgColor || 'transparent';
        const containerShadow = styles.shadow || (styles.boxShadow as string) || undefined;

        // Title & Caption Typography & Colors
        const titleColor = styles.color || styles.headingColor || '#ffffff';
        const titleFontFamily = styles.fontFamily || styles.headingFontFamily;
        const titleFontSize = normalizeUnit(styles.fontSize || styles.headingFontSize) || '18px';
        const titleFontWeight = styles.fontWeight || styles.headingFontWeight || '700';
        const titleShadow = styles.textShadow || styles.headingTextShadow;
        const textAlign = styles.textAlign || 'left';

        const captionColor = styles.descColor || '#cbd5e1';
        const captionFontFamily = styles.descFontFamily || styles.fontFamily;
        const captionFontSize = normalizeUnit(styles.descFontSize) || '13px';
        const captionFontWeight = styles.descFontWeight || '400';

        // Navigation Arrows & Dots Styles
        const arrowBg = styles.arrowBgColor || 'rgba(15, 23, 42, 0.75)';
        const arrowColor = styles.arrowColor || '#ffffff';
        const activeDotColor = styles.dotActiveColor || '#6366f1';
        const dotColor = styles.dotColor || 'rgba(255, 255, 255, 0.4)';

        // Safe index within bounds
        const activeIdx = Math.max(0, Math.min(items.length - 1, currentSlideIdx));
        const activeSlide = items[activeIdx] || items[0];

        // Grid View
        if (displayMode === 'grid') {
          const cols = content.columns || 3;
          const gridColsClass = cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-4' : 'grid-cols-3';
          return (
            <div
              className={`grid ${gridColsClass} gap-4 transition-all`}
              style={{
                gap: (content.gap !== undefined && content.gap !== '' ? content.gap : styles.gap)
                  ? normalizeUnit((content.gap !== undefined && content.gap !== '' ? content.gap : styles.gap) as any)
                  : undefined,
                marginTop: normalizeUnit(styles.marginTop),
                marginBottom: normalizeUnit(styles.marginBottom),
                paddingTop: normalizeUnit(styles.paddingTop),
                paddingBottom: normalizeUnit(styles.paddingBottom),
                paddingLeft: normalizeUnit(styles.paddingLeft),
                paddingRight: normalizeUnit(styles.paddingRight)
              }}
            >
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="overflow-hidden aspect-video group relative transition-all"
                  style={{
                    borderRadius: containerRadius,
                    border: borderVal || '1px solid rgba(51, 65, 85, 0.3)',
                    boxShadow: containerShadow,
                    backgroundColor: containerBg
                  }}
                >
                  <img
                    src={item.url}
                    alt={item.title || `Gallery photo ${idx + 1}`}
                    style={{ objectFit: objectFit as any }}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {(item.title || item.caption) && (
                    <div
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ textAlign: textAlign as any }}
                    >
                      {item.title && (
                        <p
                          style={{
                            color: titleColor,
                            fontFamily: titleFontFamily,
                            fontSize: normalizeUnit(styles.fontSize) || '14px',
                            fontWeight: titleFontWeight,
                            textShadow: titleShadow
                          }}
                          className="font-bold truncate"
                        >
                          {item.title}
                        </p>
                      )}
                      {item.caption && (
                        <p
                          style={{
                            color: captionColor,
                            fontFamily: captionFontFamily,
                            fontSize: normalizeUnit(styles.descFontSize) || '11px',
                            fontWeight: captionFontWeight
                          }}
                          className="truncate mt-0.5"
                        >
                          {item.caption}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }

        // Slide Opacity
        const rawSlideOpacity = styles.opacity !== undefined && styles.opacity !== ''
          ? styles.opacity
          : (content.opacity !== undefined && content.opacity !== ''
              ? content.opacity
              : (styles.imageOpacity !== undefined && styles.imageOpacity !== '' ? styles.imageOpacity : undefined));
        const slideOpacity = rawSlideOpacity !== undefined ? Number(rawSlideOpacity) : 1;

        // Navigation Arrow Customization Properties
        const arrowPlacement = content.arrowPlacement || styles.arrowPlacement || 'sides';
        const arrowShape = content.arrowShape || styles.arrowShape || 'circle';
        const arrowSize = content.arrowSize || styles.arrowSize || 'md';
        const arrowIcon = content.arrowIcon || styles.arrowIcon || 'chevron';
        const arrowHoverOnly = Boolean(content.arrowHoverOnly ?? styles.arrowHoverOnly);
        const rawArrowOpacity = styles.arrowOpacity !== undefined && styles.arrowOpacity !== ''
          ? styles.arrowOpacity
          : (content.arrowOpacity !== undefined && content.arrowOpacity !== '' ? content.arrowOpacity : undefined);
        const arrowOpacity = rawArrowOpacity !== undefined ? Number(rawArrowOpacity) : 1;
        const arrowBorderColor = styles.arrowBorderColor || (arrowShape === 'ghost' ? 'currentColor' : 'rgba(255, 255, 255, 0.2)');

        // Arrow Free Placement (Sliders & Layout)
        const arrowOrientation = content.arrowOrientation || 'horizontal';
        const arrowGap = content.arrowGap !== undefined ? Number(content.arrowGap) : 8;
        const arrowCustomX = content.arrowCustomX !== undefined ? Number(content.arrowCustomX) : 50;
        const arrowCustomY = content.arrowCustomY !== undefined ? Number(content.arrowCustomY) : 50;

        // Navigation Dots Customization Properties
        const dotsPlacement = content.dotsPlacement || styles.dotsPlacement || 'bottom-center';
        const dotsShape = content.dotsShape || styles.dotsShape || 'dots';
        const dotsSize = content.dotsSize || styles.dotsSize || 'md';
        const dotsBackdrop = content.dotsBackdrop || styles.dotsBackdrop || 'pill';
        const rawDotsOpacity = styles.dotsOpacity !== undefined && styles.dotsOpacity !== ''
          ? styles.dotsOpacity
          : (content.dotsOpacity !== undefined && content.dotsOpacity !== '' ? content.dotsOpacity : undefined);
        const dotsOpacity = rawDotsOpacity !== undefined ? Number(rawDotsOpacity) : 1;

        // Dots Free Placement (Sliders & Orientation)
        const dotsOrientation = content.dotsOrientation || 'horizontal';
        const dotsCustomX = content.dotsCustomX !== undefined ? Number(content.dotsCustomX) : 50;
        const dotsCustomY = content.dotsCustomY !== undefined ? Number(content.dotsCustomY) : 92;

        // Container backdrop styling
        let dotsBackdropClass = 'bg-slate-950/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/15';
        if (dotsBackdrop === 'transparent') {
          dotsBackdropClass = 'px-1 py-1';
        } else if (dotsBackdrop === 'glass') {
          dotsBackdropClass = 'bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/30';
        }
        if (dotsOrientation === 'vertical') {
          if (dotsBackdrop === 'glass') {
            dotsBackdropClass = 'bg-white/20 backdrop-blur-md px-1.5 py-2.5 rounded-full border border-white/30';
          } else if (dotsBackdrop !== 'transparent') {
            dotsBackdropClass = 'bg-slate-950/60 backdrop-blur-sm px-1.5 py-2.5 rounded-full border border-white/15';
          }
        }

        // Placement container classes & styles
        let dotsPlacementClass = 'bottom-3 left-1/2 -translate-x-1/2';
        let dotsCustomStyle: React.CSSProperties = { opacity: dotsOpacity };

        if (dotsPlacement === 'custom') {
          dotsPlacementClass = '';
          dotsCustomStyle = {
            opacity: dotsOpacity,
            left: `${dotsCustomX}%`,
            top: `${dotsCustomY}%`,
            transform: `translate(-${dotsCustomX}%, -${dotsCustomY}%)`
          };
        } else if (dotsPlacement === 'bottom-left') {
          dotsPlacementClass = 'bottom-3 left-4';
        } else if (dotsPlacement === 'bottom-right') {
          dotsPlacementClass = 'bottom-3 right-4';
        } else if (dotsPlacement === 'top-center') {
          dotsPlacementClass = 'top-3 left-1/2 -translate-x-1/2';
        } else if (dotsPlacement === 'top-left') {
          dotsPlacementClass = 'top-3 left-4';
        } else if (dotsPlacement === 'top-right') {
          dotsPlacementClass = 'top-3 right-4';
        }

        // Automatically shift if bottom-center collides with arrows
        if (arrowPlacement === 'bottom-center' && dotsPlacement === 'bottom-center') {
          dotsPlacementClass = 'bottom-12 left-1/2 -translate-x-1/2';
        }

        // Dot dimensions and shapes
        const getDotClasses = (isActive: boolean) => {
          if (dotsShape === 'lines') {
            if (dotsSize === 'sm') return isActive ? 'w-6 h-0.5 rounded-none' : 'w-3 h-0.5 rounded-none';
            if (dotsSize === 'lg') return isActive ? 'w-12 h-1.5 rounded-sm' : 'w-6 h-1.5 rounded-sm';
            return isActive ? 'w-8 h-1 rounded-sm' : 'w-4 h-1 rounded-sm';
          }
          if (dotsShape === 'pills') {
            if (dotsSize === 'sm') return isActive ? 'w-5 h-1.5 rounded-full' : 'w-2.5 h-1.5 rounded-full';
            if (dotsSize === 'lg') return isActive ? 'w-9 h-3 rounded-full' : 'w-5 h-3 rounded-full';
            return isActive ? 'w-7 h-2 rounded-full' : 'w-3.5 h-2 rounded-full';
          }
          if (dotsShape === 'squares') {
            if (dotsSize === 'sm') return isActive ? 'w-3.5 h-2 rounded-none' : 'w-2 h-2 rounded-none';
            if (dotsSize === 'lg') return isActive ? 'w-6 h-3 rounded-none' : 'w-3 h-3 rounded-none';
            return isActive ? 'w-4 h-2.5 rounded-none' : 'w-2.5 h-2.5 rounded-none';
          }
          if (dotsShape === 'circles') {
            if (dotsSize === 'sm') return 'w-1.5 h-1.5 rounded-full';
            if (dotsSize === 'lg') return 'w-3.5 h-3.5 rounded-full';
            return 'w-2.5 h-2.5 rounded-full';
          }
          if (dotsShape === 'numbers') {
            if (dotsSize === 'sm') return 'w-4 h-4 text-[9px] rounded-full flex items-center justify-center font-bold font-mono';
            if (dotsSize === 'lg') return 'w-6 h-6 text-xs rounded-full flex items-center justify-center font-bold font-mono';
            return 'w-5 h-5 text-[10px] rounded-full flex items-center justify-center font-bold font-mono';
          }
          // Default: 'dots' (expanding pill)
          if (dotsSize === 'sm') return isActive ? 'w-4 h-1.5 rounded-full shadow-xs' : 'w-1.5 h-1.5 rounded-full';
          if (dotsSize === 'lg') return isActive ? 'w-8 h-3 rounded-full shadow-xs' : 'w-3 h-3 rounded-full';
          return isActive ? 'w-6 h-2 rounded-full shadow-xs' : 'w-2 h-2 rounded-full';
        };

        // Dimensions based on arrowSize
        let arrowDimensions = 'w-9 h-9';
        let arrowIconSize = 'w-5 h-5';
        if (arrowSize === 'sm') {
          arrowDimensions = 'w-7 h-7';
          arrowIconSize = 'w-3.5 h-3.5';
        } else if (arrowSize === 'lg') {
          arrowDimensions = 'w-11 h-11';
          arrowIconSize = 'w-6 h-6';
        } else if (arrowSize === 'xl') {
          arrowDimensions = 'w-14 h-14';
          arrowIconSize = 'w-7 h-7';
        }

        // Shapes
        let arrowShapeClasses = 'rounded-full';
        if (arrowShape === 'rounded') {
          arrowShapeClasses = 'rounded-xl';
        } else if (arrowShape === 'square') {
          arrowShapeClasses = 'rounded-none';
        } else if (arrowShape === 'glass') {
          arrowShapeClasses = 'rounded-full backdrop-blur-md bg-white/20 border border-white/30';
        } else if (arrowShape === 'ghost') {
          arrowShapeClasses = 'rounded-full bg-transparent hover:bg-white/20 border border-current shadow-none';
        }

        // Hover Visibility
        const arrowHoverClasses = arrowHoverOnly
          ? 'opacity-0 group-hover:opacity-100 transition-all duration-200'
          : 'transition-all duration-200';

        const renderPrevIcon = () => {
          if (arrowIcon === 'arrow') return <ArrowLeft className={arrowIconSize} />;
          if (arrowIcon === 'long') return <MoveLeft className={arrowIconSize} />;
          return <ChevronLeft className={arrowIconSize} />;
        };

        const renderNextIcon = () => {
          if (arrowIcon === 'arrow') return <ArrowRight className={arrowIconSize} />;
          if (arrowIcon === 'long') return <MoveRight className={arrowIconSize} />;
          return <ChevronRight className={arrowIconSize} />;
        };

        const prevButton = (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlideIdx((prev) => (prev - 1 + items.length) % items.length);
            }}
            style={{
              backgroundColor: arrowShape === 'ghost' ? 'transparent' : arrowBg,
              color: arrowColor,
              borderColor: arrowBorderColor,
              opacity: arrowOpacity
            }}
            className={`${arrowDimensions} ${arrowShapeClasses} flex items-center justify-center shadow-lg hover:scale-110 z-20 cursor-pointer border ${arrowHoverClasses}`}
            title="Previous Slide"
          >
            {renderPrevIcon()}
          </button>
        );

        const nextButton = (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlideIdx((prev) => (prev + 1) % items.length);
            }}
            style={{
              backgroundColor: arrowShape === 'ghost' ? 'transparent' : arrowBg,
              color: arrowColor,
              borderColor: arrowBorderColor,
              opacity: arrowOpacity
            }}
            className={`${arrowDimensions} ${arrowShapeClasses} flex items-center justify-center shadow-lg hover:scale-110 z-20 cursor-pointer border ${arrowHoverClasses}`}
            title="Next Slide"
          >
            {renderNextIcon()}
          </button>
        );

        // Slider / Carousel View with Next/Prev Navigation & Auto Slide Loop
        return (
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative group select-none transition-all ${
              arrowPlacement === 'outside' ? 'overflow-visible px-4 sm:px-6' : 'overflow-hidden'
            }`}
            style={{
              borderRadius: containerRadius,
              border: borderVal,
              boxShadow: containerShadow,
              backgroundColor: containerBg,
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom),
              paddingTop: normalizeUnit(styles.paddingTop),
              paddingBottom: normalizeUnit(styles.paddingBottom),
              paddingLeft: normalizeUnit(styles.paddingLeft),
              paddingRight: normalizeUnit(styles.paddingRight)
            }}
          >
            {/* Active Slide Image */}
            <div
              className="w-full relative overflow-hidden rounded-[inherit] flex items-center justify-center"
              style={{
                backgroundColor: styles.bgColor || '#090d16',
                height: slideHeight === 'auto' ? 'auto' : (normalizeUnit(slideHeight) || '340px'),
                perspective: '1000px'
              }}
            >
              <div
                key={`carousel-slide-${el.id}-${activeIdx}`}
                className={`w-full h-full relative overflow-hidden flex items-center justify-center nf-slide-${content.slideEffect || 'slide-horizontal'}`}
                style={{
                  '--slide-duration': `${content.slideDuration !== undefined ? Number(content.slideDuration) : 500}ms`,
                  '--slide-interval-or-duration': `${Math.max(Number(content.slideInterval) || 4, 3)}s`
                } as React.CSSProperties}
              >
                <img
                  src={activeSlide?.url}
                  alt={activeSlide?.title || 'Slide photo'}
                  style={{
                    height: slideHeight === 'auto' ? 'auto' : (normalizeUnit(slideHeight) || '340px'),
                    width: '100%',
                    objectFit: objectFit as any,
                    opacity: slideOpacity
                  }}
                  className="w-full select-none"
                />

                {/* Title & Caption Overlay */}
                {(activeSlide?.title || activeSlide?.caption) && (
                  <div
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-5 text-white"
                    style={{ textAlign: textAlign as any }}
                  >
                    {activeSlide.title && (
                      <h4
                        style={{
                          color: titleColor,
                          fontFamily: titleFontFamily,
                          fontSize: titleFontSize,
                          fontWeight: titleFontWeight,
                          textShadow: titleShadow,
                          textAlign: textAlign as any
                        }}
                        className="tracking-tight"
                      >
                        {activeSlide.title}
                      </h4>
                    )}
                    {activeSlide.caption && (
                      <p
                        style={{
                          color: captionColor,
                          fontFamily: captionFontFamily,
                          fontSize: captionFontSize,
                          fontWeight: captionFontWeight,
                          textAlign: textAlign as any
                        }}
                        className="text-xs text-slate-300 mt-1 line-clamp-2"
                      >
                        {activeSlide.caption}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Slide Counter Badge (Hideable via showSlideNumbers) */}
              {showSlideNumbers && (
                <div
                  className={`absolute ${
                    arrowPlacement === 'top-right' ? 'top-3 left-3' : 'top-3 right-3'
                  } bg-slate-950/70 backdrop-blur-sm text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full z-10 border border-white/10 shadow-xs`}
                >
                  {activeIdx + 1} / {items.length}
                </div>
              )}
            </div>

            {/* Navigation Arrows based on Placement */}
            {showArrows && items.length > 1 && (() => {
              if (arrowPlacement === 'custom') {
                return (
                  <div
                    className={`absolute z-20 flex ${
                      arrowOrientation === 'vertical' ? 'flex-col' : 'flex-row'
                    } items-center`}
                    style={{
                      left: `${arrowCustomX}%`,
                      top: `${arrowCustomY}%`,
                      transform: `translate(-${arrowCustomX}%, -${arrowCustomY}%)`,
                      gap: `${arrowGap}px`
                    }}
                  >
                    {prevButton}
                    {nextButton}
                  </div>
                );
              }
              if (arrowPlacement === 'outside') {
                const outsideTop = content.arrowCustomY !== undefined ? `${content.arrowCustomY}%` : '50%';
                return (
                  <>
                    <div
                      className="absolute -left-3 sm:-left-5 z-20"
                      style={{ top: outsideTop, transform: `translateY(-${outsideTop})` }}
                    >
                      {prevButton}
                    </div>
                    <div
                      className="absolute -right-3 sm:-right-5 z-20"
                      style={{ top: outsideTop, transform: `translateY(-${outsideTop})` }}
                    >
                      {nextButton}
                    </div>
                  </>
                );
              }
              if (arrowPlacement === 'top-right') {
                return (
                  <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-20">
                    {prevButton}
                    {nextButton}
                  </div>
                );
              }
              if (arrowPlacement === 'top-left') {
                return (
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5 z-20">
                    {prevButton}
                    {nextButton}
                  </div>
                );
              }
              if (arrowPlacement === 'bottom-right') {
                return (
                  <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 z-20">
                    {prevButton}
                    {nextButton}
                  </div>
                );
              }
              if (arrowPlacement === 'bottom-left') {
                return (
                  <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 z-20">
                    {prevButton}
                    {nextButton}
                  </div>
                );
              }
              if (arrowPlacement === 'bottom-center') {
                return (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
                    {prevButton}
                    {nextButton}
                  </div>
                );
              }
              // Default: 'sides' (inside left and right edges)
              const sidesTop = content.arrowCustomY !== undefined ? `${content.arrowCustomY}%` : '50%';
              return (
                <>
                  <div
                    className="absolute left-3 z-20"
                    style={{ top: sidesTop, transform: `translateY(-${sidesTop})` }}
                  >
                    {prevButton}
                  </div>
                  <div
                    className="absolute right-3 z-20"
                    style={{ top: sidesTop, transform: `translateY(-${sidesTop})` }}
                  >
                    {nextButton}
                  </div>
                </>
              );
            })()}

            {/* Pagination Indicators / Dots */}
            {showDots && items.length > 1 && (
              <div
                style={dotsCustomStyle}
                className={`absolute ${dotsPlacementClass} flex ${
                  dotsOrientation === 'vertical' ? 'flex-col space-y-1.5' : 'flex-row space-x-1.5'
                } items-center z-20 ${dotsBackdropClass} transition-all`}
              >
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlideIdx(i);
                    }}
                    style={{
                      backgroundColor: i === activeIdx ? activeDotColor : dotColor,
                      color: i === activeIdx ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'
                    }}
                    className={`${getDotClasses(i === activeIdx)} transition-all cursor-pointer ${
                      i === activeIdx ? 'scale-105' : 'hover:opacity-100 opacity-70'
                    }`}
                    title={`Go to slide ${i + 1}`}
                  >
                    {dotsShape === 'numbers' ? i + 1 : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }

      // 7. CALL TO ACTION (CTA)
      case 'cta': {
        return (
          <div
            className="p-8 rounded-2xl transition-all text-center space-y-4 shadow-xl border border-indigo-400/30"
            style={{
              backgroundColor: styles.bgColor || '#4f46e5',
              backgroundImage: styles.bgGradient || undefined,
              color: styles.color || '#ffffff',
              borderColor: styles.borderColor || undefined,
              borderWidth: normalizeUnit(styles.borderWidth) || undefined,
              borderStyle: styles.borderStyle || undefined,
              boxShadow: styles.shadow || undefined,
              borderRadius: normalizeUnit(styles.borderRadius) || '20px',
              paddingTop: normalizeUnit(styles.paddingTop) || '32px',
              paddingBottom: normalizeUnit(styles.paddingBottom) || '32px',
              paddingLeft: normalizeUnit(styles.paddingLeft) || undefined,
              paddingRight: normalizeUnit(styles.paddingRight) || undefined,
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            <h3
              className="text-2xl font-black tracking-tight"
              style={{
                fontSize: normalizeUnit(styles.fontSize) || '24px',
                color: styles.color || '#ffffff'
              }}
            >
              {content.headline || 'Ready to build high-performance Next.js apps?'}
            </h3>
            <p className="text-sm opacity-90 max-w-xl mx-auto leading-relaxed">
              {content.subheadline ||
                'Visually assemble components, inspect properties, and export pure production code in seconds.'}
            </p>
            <div className="pt-2">
              <button
                type="button"
                className="px-6 py-3 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-95 inline-flex items-center space-x-2"
              >
                <span>{content.buttonText || 'Get Started Now'}</span>
                <ArrowRight className="w-4 h-4 text-indigo-700" />
              </button>
            </div>
          </div>
        );
      }

      // 8. FORM (Dynamic fields & customizable field styling)
      case 'form': {
        const currentTheme = content.theme || 'dark';
        const isLight = currentTheme === 'light';
        const isMinimal = currentTheme === 'minimal';
        const isGlass = currentTheme === 'glass';

        const defaultBg = isLight ? '#ffffff' : isMinimal ? '#fafafa' : isGlass ? 'rgba(15, 23, 42, 0.75)' : '#0f172a';
        const defaultBorder = isLight ? '#e2e8f0' : isMinimal ? '#e4e4e7' : isGlass ? 'rgba(255, 255, 255, 0.2)' : '#1e293b';
        const defaultColor = (isLight || isMinimal) ? '#0f172a' : '#ffffff';
        const defaultLabel = isLight ? '#475569' : isMinimal ? '#71717a' : isGlass ? '#cbd5e1' : '#94a3b8';
        const defaultInputBg = isLight ? '#f8fafc' : isMinimal ? '#ffffff' : isGlass ? 'rgba(255, 255, 255, 0.08)' : '#090d16';
        const defaultInputText = (isLight || isMinimal) ? '#0f172a' : '#f8fafc';
        const defaultInputBorder = isLight ? '#cbd5e1' : isMinimal ? '#e4e4e7' : isGlass ? 'rgba(255, 255, 255, 0.2)' : '#334155';
        const defaultButtonBg = isMinimal ? '#18181b' : '#6366f1';
        const defaultButtonText = '#ffffff';

        const fields = content.fields && content.fields.length > 0 ? content.fields : [
          { id: 'f-1', label: 'Full Name', type: 'text', placeholder: 'Full Name...', required: true },
          { id: 'f-2', label: 'Email Address', type: 'email', placeholder: 'Email Address...', required: true },
          { id: 'f-3', label: 'Message', type: 'textarea', placeholder: 'Your message or inquiry...', required: false }
        ];

        const inputStyle: React.CSSProperties = {
          backgroundColor: styles.inputBgColor || defaultInputBg,
          color: styles.inputTextColor || defaultInputText,
          borderColor: styles.inputBorderColor || defaultInputBorder,
          borderRadius: normalizeUnit(styles.inputBorderRadius) || '10px'
        };

        const buttonStyle: React.CSSProperties = {
          backgroundColor: styles.buttonBgColor || defaultButtonBg,
          color: styles.buttonTextColor || defaultButtonText,
          borderRadius: normalizeUnit(styles.buttonBorderRadius) || '12px',
          width: content.buttonWidth === 'auto' ? 'auto' : '100%'
        };

        return (
          <div
            className={`p-6 rounded-2xl border transition-all text-left space-y-4 ${
              isGlass ? 'backdrop-blur-md' : ''
            } ${
              styles.widthType === 'screen' ? 'w-full max-w-none' : 'w-full'
            }`}
            style={{
              backgroundColor: styles.bgColor || defaultBg,
              borderColor: styles.borderColor || defaultBorder,
              borderWidth: normalizeUnit(styles.borderWidth),
              borderStyle: styles.borderStyle,
              borderRadius: normalizeUnit(styles.borderRadius) || '16px',
              paddingTop: normalizeUnit(styles.paddingTop),
              paddingBottom: normalizeUnit(styles.paddingBottom),
              paddingLeft: normalizeUnit(styles.paddingLeft),
              paddingRight: normalizeUnit(styles.paddingRight),
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom),
              boxShadow: applyShadowColor(styles.shadow, styles.shadowColor)
            }}
          >
            {content.title && (
              <h4
                className="text-sm font-bold"
                style={{
                  color: styles.color || defaultColor,
                  fontSize: normalizeUnit(styles.fontSize) || '15px'
                }}
              >
                {content.title}
              </h4>
            )}
            <div className="space-y-3 max-h-[550px] overflow-y-auto nextforge-scrollbar pr-1">
              {fields.map((field: any, idx: number) => (
                <div key={field.id || idx} className="space-y-1">
                  {field.label && (
                    <label
                      className="text-[11px] font-semibold block"
                      style={{ color: styles.labelColor || defaultLabel }}
                    >
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                  )}
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      placeholder={field.placeholder || ''}
                      disabled={isEditor}
                      style={inputStyle}
                      className="w-full px-3.5 py-2 border text-xs focus:outline-none transition-colors"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      disabled={isEditor}
                      style={inputStyle}
                      className="w-full px-3.5 py-2 border text-xs focus:outline-none transition-colors"
                    >
                      {(field.options || ['Option 1', 'Option 2', 'Option 3']).map((opt: string, i: number) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      placeholder={field.placeholder || ''}
                      disabled={isEditor}
                      style={inputStyle}
                      className="w-full px-3.5 py-2 border text-xs focus:outline-none transition-colors"
                    />
                  )}
                </div>
              ))}
              <div className={content.buttonWidth === 'auto' ? 'text-left' : 'w-full'}>
                <button
                  type="button"
                  style={buttonStyle}
                  className="py-2.5 px-6 font-bold text-xs shadow-md transition-all active:scale-95 text-center"
                >
                  {content.buttonText || 'Submit Form'}
                </button>
              </div>
            </div>
          </div>
        );
      }

      // 9. ICON & ICON BOX
      case 'icon': {
        const iconColor = styles.iconColor || styles.color || '#6366f1';
        const iconBgColor = styles.iconBgColor || (styles.bgColor && styles.bgColor !== 'transparent' ? `${iconColor}20` : '#ede9fe');
        const iconSize = styles.iconSize ? normalizeUnit(styles.iconSize) : '20px';
        const iconPadding = styles.iconPadding ? normalizeUnit(styles.iconPadding) : '10px';
        const badgeBorderRadius = styles.iconBorderRadius !== undefined ? normalizeUnit(styles.iconBorderRadius) : '12px';

        // Badge Border computation
        const badgeBorderWidthNum = styles.iconBorderWidth !== undefined ? parseInt(String(styles.iconBorderWidth).replace(/[^0-9]/g, '')) : 0;
        const badgeBorderColor = styles.iconBorderColor;
        let badgeBorderStyle: string | undefined = undefined;
        if (badgeBorderWidthNum > 0 && badgeBorderColor && badgeBorderColor !== 'transparent') {
          badgeBorderStyle = `${badgeBorderWidthNum}px solid ${badgeBorderColor}`;
        } else if (badgeBorderWidthNum > 0) {
          badgeBorderStyle = `${badgeBorderWidthNum}px solid ${iconColor}`;
        } else if (badgeBorderColor && badgeBorderColor !== 'transparent') {
          badgeBorderStyle = `1px solid ${badgeBorderColor}`;
        }

        const headingFontFamily = styles.headingFontFamily || styles.fontFamily || undefined;
        const headingFontSize = normalizeUnit(styles.headingFontSize || styles.fontSize) || '14px';
        const headingFontWeight = styles.headingFontWeight || styles.fontWeight || '700';
        const headingColor = styles.headingColor || styles.color || '#1e293b';
        const descFontFamily = styles.descFontFamily || styles.fontFamily || undefined;
        const descFontSize = normalizeUnit(styles.descFontSize) || '12px';
        const descFontWeight = styles.descFontWeight || '400';
        const descColor = styles.descColor || '#64748b';
        const align = styles.textAlign || 'left';

        // Card Border computation
        const rawBorderWidth = styles.borderWidth !== undefined ? styles.borderWidth : undefined;
        const borderWidthNum = rawBorderWidth !== undefined ? parseInt(String(rawBorderWidth).replace(/[^0-9]/g, '')) : undefined;
        const rawBorderColor = styles.borderColor;
        const isBorderTransparent = rawBorderColor === 'transparent';
        
        let cardBorderStyle: string | undefined = undefined;
        if (borderWidthNum !== undefined) {
          if (borderWidthNum === 0 || isBorderTransparent) {
            cardBorderStyle = 'none';
          } else {
            cardBorderStyle = `${borderWidthNum}px ${styles.borderStyle || 'solid'} ${rawBorderColor && rawBorderColor !== 'transparent' ? rawBorderColor : '#cbd5e1'}`;
          }
        } else if (rawBorderColor && !isBorderTransparent) {
          cardBorderStyle = `1px ${styles.borderStyle || 'solid'} ${rawBorderColor}`;
        }

        const cardBorderRadius = styles.borderRadius !== undefined ? normalizeUnit(styles.borderRadius) : '12px';
        const flexJustify = align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start';

        const iconAnim = (styles.iconAnimation || content.iconAnimation || 'none') as string;
        const iconTrigger = (styles.iconAnimationTrigger || content.iconAnimationTrigger || 'always') as string;
        const iconSpeed = (styles.iconAnimationSpeed || content.iconAnimationSpeed || 'normal') as string;
        const safeId = String(el.id || 'icon').replace(/[^a-zA-Z0-9_-]/g, '-');
        const cardClass = `nf-ib-card-${safeId}`;
        const iconClass = `nf-ib-icon-${safeId}`;

        const speedDurations: Record<string, Record<string, string>> = {
          pulse: { slow: '3s', normal: '2s', fast: '1.2s' },
          float: { slow: '3.6s', normal: '2.5s', fast: '1.5s' },
          shimmer: { slow: '3.2s', normal: '2.2s', fast: '1.3s' },
          'spin-slow': { slow: '14s', normal: '8s', fast: '4s' },
          'bounce-soft': { slow: '2.4s', normal: '1.6s', fast: '1s' },
          wiggle: { slow: '2.2s', normal: '1.4s', fast: '0.9s' },
        };
        const dur = (speedDurations[iconAnim] && speedDurations[iconAnim][iconSpeed]) || speedDurations[iconAnim]?.normal || '2s';

        return (
          <div
            className={`flex items-center space-x-3 p-3 transition-all ${flexJustify} ${cardClass}`}
            style={{
              backgroundColor: styles.bgColor || 'transparent',
              border: cardBorderStyle,
              borderRadius: cardBorderRadius,
              boxShadow: styles.shadow || undefined,
              paddingTop: normalizeUnit(styles.paddingTop) || undefined,
              paddingBottom: normalizeUnit(styles.paddingBottom) || undefined,
              paddingLeft: normalizeUnit(styles.paddingLeft) || undefined,
              paddingRight: normalizeUnit(styles.paddingRight) || undefined,
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom),
              textAlign: align
            }}
          >
            {iconAnim && iconAnim !== 'none' && (
              <style>{`
                @keyframes nf-icon-pulse-${safeId} {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.1); }
                }
                @keyframes nf-icon-float-${safeId} {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-5px); }
                }
                @keyframes nf-icon-shimmer-${safeId} {
                  0%, 100% { filter: drop-shadow(0 0 0px transparent); opacity: 0.92; }
                  50% { filter: drop-shadow(0 0 8px currentColor); opacity: 1; }
                }
                @keyframes nf-icon-spin-${safeId} {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes nf-icon-bounce-${safeId} {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-6px); }
                }
                @keyframes nf-icon-wiggle-${safeId} {
                  0%, 100% { transform: rotate(0deg); }
                  25% { transform: rotate(-6deg); }
                  75% { transform: rotate(6deg); }
                }
                ${iconAnim === 'hover-lift'
                  ? `.${iconClass} { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important; }
                     .${cardClass}:hover .${iconClass} { transform: translateY(-5px) scale(1.08) !important; }`
                  : iconAnim === 'hover-spin'
                  ? `.${iconClass} { transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important; }
                     .${cardClass}:hover .${iconClass} { transform: rotate(360deg) !important; }`
                  : iconTrigger === 'hover'
                  ? `.${cardClass}:hover .${iconClass} { animation: nf-icon-${iconAnim}-${safeId} ${dur} infinite ease-in-out !important; }`
                  : `.${iconClass} { animation: nf-icon-${iconAnim}-${safeId} ${dur} infinite ease-in-out !important; }`
                }
              `}</style>
            )}
            <div
              className={`shrink-0 flex items-center justify-center shadow-xs transition-all ${iconClass}`}
              style={{
                backgroundColor: iconBgColor,
                color: iconColor,
                padding: iconPadding,
                borderRadius: badgeBorderRadius,
                border: badgeBorderStyle
              }}
            >
              <IconComponent style={{ width: iconSize, height: iconSize, color: iconColor }} />
            </div>
            <div style={{ textAlign: align }}>
              <div
                className="leading-tight"
                style={{
                  fontFamily: headingFontFamily,
                  fontSize: headingFontSize,
                  fontWeight: headingFontWeight,
                  color: headingColor,
                  textTransform: (styles.headingTextTransform || styles.textTransform || undefined) as any
                }}
              >
                {content.text !== undefined ? content.text : 'Special Feature'}
              </div>
              {content.subtext !== '' && (
                <div
                  className="mt-0.5"
                  style={{
                    fontFamily: descFontFamily,
                    fontSize: descFontSize,
                    fontWeight: descFontWeight,
                    color: descColor,
                    textTransform: (styles.descTextTransform || undefined) as any
                  }}
                >
                  {content.subtext !== undefined ? content.subtext : 'Ultra-fast Next.js component'}
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'iconbox': {
        const iconColor = styles.iconColor || styles.color || '#6366f1';
        const iconBgColor = styles.iconBgColor || `${iconColor}20`;
        const iconSize = styles.iconSize ? normalizeUnit(styles.iconSize) : '24px';
        const iconPadding = styles.iconPadding ? normalizeUnit(styles.iconPadding) : '12px';
        const badgeBorderRadius = styles.iconBorderRadius !== undefined ? normalizeUnit(styles.iconBorderRadius) : '14px';

        // Badge Border computation
        const badgeBorderWidthNum = styles.iconBorderWidth !== undefined ? parseInt(String(styles.iconBorderWidth).replace(/[^0-9]/g, '')) : 0;
        const badgeBorderColor = styles.iconBorderColor;
        let badgeBorderStyle: string | undefined = undefined;
        if (badgeBorderWidthNum > 0 && badgeBorderColor && badgeBorderColor !== 'transparent') {
          badgeBorderStyle = `${badgeBorderWidthNum}px solid ${badgeBorderColor}`;
        } else if (badgeBorderWidthNum > 0) {
          badgeBorderStyle = `${badgeBorderWidthNum}px solid ${iconColor}`;
        } else if (badgeBorderColor && badgeBorderColor !== 'transparent') {
          badgeBorderStyle = `1px solid ${badgeBorderColor}`;
        }

        const headingFontFamily = styles.headingFontFamily || styles.fontFamily || undefined;
        const headingFontSize = normalizeUnit(styles.headingFontSize || styles.fontSize) || '16px';
        const headingFontWeight = styles.headingFontWeight || styles.fontWeight || '700';
        const headingColor = styles.headingColor || styles.color || '#0f172a';
        const descFontFamily = styles.descFontFamily || styles.fontFamily || undefined;
        const descFontSize = normalizeUnit(styles.descFontSize) || '13px';
        const descFontWeight = styles.descFontWeight || '400';
        const descColor = styles.descColor || '#64748b';
        const align = styles.textAlign || 'left';

        // Card Border computation
        const rawBorderWidth = styles.borderWidth !== undefined ? styles.borderWidth : undefined;
        const borderWidthNum = rawBorderWidth !== undefined ? parseInt(String(rawBorderWidth).replace(/[^0-9]/g, '')) : undefined;
        const rawBorderColor = styles.borderColor !== undefined ? styles.borderColor : undefined;
        const isBorderTransparent = rawBorderColor === 'transparent';
        
        let cardBorderStyle: string = '1px solid #e2e8f0'; // default iconbox border
        if (borderWidthNum !== undefined) {
          if (borderWidthNum === 0 || isBorderTransparent) {
            cardBorderStyle = 'none';
          } else {
            cardBorderStyle = `${borderWidthNum}px ${styles.borderStyle || 'solid'} ${rawBorderColor && rawBorderColor !== 'transparent' ? rawBorderColor : '#e2e8f0'}`;
          }
        } else if (rawBorderColor !== undefined) {
          cardBorderStyle = isBorderTransparent ? 'none' : `1px ${styles.borderStyle || 'solid'} ${rawBorderColor}`;
        }

        const cardBorderRadius = styles.borderRadius !== undefined ? normalizeUnit(styles.borderRadius) : '16px';
        const flexAlign = align === 'center' ? 'items-center' : align === 'right' ? 'items-end' : 'items-start';

        const iconAnim = (styles.iconAnimation || content.iconAnimation || 'none') as string;
        const iconTrigger = (styles.iconAnimationTrigger || content.iconAnimationTrigger || 'always') as string;
        const iconSpeed = (styles.iconAnimationSpeed || content.iconAnimationSpeed || 'normal') as string;
        const safeId = String(el.id || 'ib').replace(/[^a-zA-Z0-9_-]/g, '-');
        const cardClass = `nf-ib-card-${safeId}`;
        const iconClass = `nf-ib-icon-${safeId}`;

        const speedDurations: Record<string, Record<string, string>> = {
          pulse: { slow: '3s', normal: '2s', fast: '1.2s' },
          float: { slow: '3.6s', normal: '2.5s', fast: '1.5s' },
          shimmer: { slow: '3.2s', normal: '2.2s', fast: '1.3s' },
          'spin-slow': { slow: '14s', normal: '8s', fast: '4s' },
          'bounce-soft': { slow: '2.4s', normal: '1.6s', fast: '1s' },
          wiggle: { slow: '2.2s', normal: '1.4s', fast: '0.9s' },
        };
        const dur = (speedDurations[iconAnim] && speedDurations[iconAnim][iconSpeed]) || speedDurations[iconAnim]?.normal || '2s';

        return (
          <div
            className={`p-5 transition-all space-y-3 flex flex-col ${flexAlign} ${cardClass}`}
            style={{
              backgroundColor: styles.bgColor || '#ffffff',
              backgroundImage: styles.bgGradient || undefined,
              border: cardBorderStyle,
              borderRadius: cardBorderRadius,
              boxShadow: styles.shadow || '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              paddingTop: normalizeUnit(styles.paddingTop) || undefined,
              paddingBottom: normalizeUnit(styles.paddingBottom) || undefined,
              paddingLeft: normalizeUnit(styles.paddingLeft) || undefined,
              paddingRight: normalizeUnit(styles.paddingRight) || undefined,
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom),
              textAlign: align
            }}
          >
            {iconAnim && iconAnim !== 'none' && (
              <style>{`
                @keyframes nf-icon-pulse-${safeId} {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.1); }
                }
                @keyframes nf-icon-float-${safeId} {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-5px); }
                }
                @keyframes nf-icon-shimmer-${safeId} {
                  0%, 100% { filter: drop-shadow(0 0 0px transparent); opacity: 0.92; }
                  50% { filter: drop-shadow(0 0 8px currentColor); opacity: 1; }
                }
                @keyframes nf-icon-spin-${safeId} {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes nf-icon-bounce-${safeId} {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-6px); }
                }
                @keyframes nf-icon-wiggle-${safeId} {
                  0%, 100% { transform: rotate(0deg); }
                  25% { transform: rotate(-6deg); }
                  75% { transform: rotate(6deg); }
                }
                ${iconAnim === 'hover-lift'
                  ? `.${iconClass} { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important; }
                     .${cardClass}:hover .${iconClass} { transform: translateY(-5px) scale(1.08) !important; }`
                  : iconAnim === 'hover-spin'
                  ? `.${iconClass} { transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important; }
                     .${cardClass}:hover .${iconClass} { transform: rotate(360deg) !important; }`
                  : iconTrigger === 'hover'
                  ? `.${cardClass}:hover .${iconClass} { animation: nf-icon-${iconAnim}-${safeId} ${dur} infinite ease-in-out !important; }`
                  : `.${iconClass} { animation: nf-icon-${iconAnim}-${safeId} ${dur} infinite ease-in-out !important; }`
                }
              `}</style>
            )}
            <div
              className={`flex items-center justify-center shrink-0 transition-all ${iconClass}`}
              style={{
                backgroundColor: iconBgColor,
                color: iconColor,
                padding: iconPadding,
                borderRadius: badgeBorderRadius,
                border: badgeBorderStyle
              }}
            >
              <IconComponent style={{ width: iconSize, height: iconSize, color: iconColor }} />
            </div>
            <h4
              style={{
                fontFamily: headingFontFamily,
                fontSize: headingFontSize,
                fontWeight: headingFontWeight,
                textShadow: styles.headingTextShadow || styles.textShadow || undefined,
                color: headingColor,
                textTransform: (styles.headingTextTransform || styles.textTransform || undefined) as any,
                margin: 0
              }}
            >
              {content.title !== undefined ? content.title : 'Enterprise Security'}
            </h4>
            {content.description !== '' && (
              <p
                className="leading-relaxed"
                style={{
                  fontFamily: descFontFamily,
                  fontSize: descFontSize,
                  fontWeight: descFontWeight,
                  textShadow: styles.textShadow || undefined,
                  color: descColor,
                  textTransform: (styles.descTextTransform || undefined) as any,
                  margin: 0
                }}
              >
                {content.description !== undefined ? content.description : 'Guaranteed safety and end-to-end performance.'}
              </p>
            )}
          </div>
        );
      }

      // 10. CONTENT CARD
      case 'contentcard': {
        return (
          <div
            className="p-5 rounded-2xl border transition-all text-left shadow-xs space-y-2"
            style={{
              backgroundColor: styles.bgColor || '#f8fafc',
              backgroundImage: styles.bgGradient || undefined,
              borderColor: styles.borderColor || '#e2e8f0',
              borderWidth: normalizeUnit(styles.borderWidth) || undefined,
              borderStyle: styles.borderStyle || undefined,
              boxShadow: styles.shadow || undefined,
              paddingTop: normalizeUnit(styles.paddingTop) || undefined,
              paddingBottom: normalizeUnit(styles.paddingBottom) || undefined,
              paddingLeft: normalizeUnit(styles.paddingLeft) || undefined,
              paddingRight: normalizeUnit(styles.paddingRight) || undefined,
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            {content.badge && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block"
                style={{
                  backgroundColor: `${styles.color || '#6366f1'}20`,
                  color: styles.color || '#6366f1'
                }}
              >
                {content.badge}
              </span>
            )}
            <h4
              className="font-bold text-sm"
              style={{
                fontSize: normalizeUnit(styles.fontSize) || '15px',
                color: styles.color || '#0f172a'
              }}
            >
              {content.title || '100/100 PageSpeed'}
            </h4>
            <p
              className="text-xs text-slate-500 leading-relaxed"
              style={{
                fontFamily: styles.descFontFamily || styles.fontFamily || undefined,
                fontSize: normalizeUnit(styles.descFontSize) || undefined,
                fontWeight: styles.descFontWeight || undefined,
                color: styles.descColor || undefined
              }}
            >
              {content.description || 'Zero DOM depth bloat, pure Next.js speed.'}
            </p>
          </div>
        );
      }

      // 11. PRICING CARD
      case 'pricingcard': {
        const features: string[] = content.features || [
          'Unlimited dynamic pages',
          '1-Click ZIP Next.js code export',
          'Cloudflare D1 & SQLite Ready'
        ];

        return (
          <div
            className="p-6 rounded-2xl border transition-all text-left shadow-lg space-y-4"
            style={{
              backgroundColor: styles.bgColor || '#0f172a',
              backgroundImage: styles.bgGradient || undefined,
              color: styles.color || '#ffffff',
              fontFamily: styles.fontFamily || undefined,
              borderColor: styles.borderColor || undefined,
              borderWidth: normalizeUnit(styles.borderWidth) || undefined,
              borderStyle: styles.borderStyle || undefined,
              boxShadow: styles.shadow || undefined,
              borderRadius: normalizeUnit(styles.borderRadius) || '16px',
              paddingTop: normalizeUnit(styles.paddingTop) || undefined,
              paddingBottom: normalizeUnit(styles.paddingBottom) || undefined,
              paddingLeft: normalizeUnit(styles.paddingLeft) || undefined,
              paddingRight: normalizeUnit(styles.paddingRight) || undefined,
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm">{content.planName || 'Pro Tier'}</h4>
              {content.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
                  {content.badge}
                </span>
              )}
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black">{content.price || '$29'}</span>
              <span className="text-xs text-slate-400">{content.interval || '/ month'}</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {features.map((feat, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
              style={{
                backgroundColor: styles.buttonBgColor || undefined,
                color: styles.buttonTextColor || undefined,
                borderRadius: normalizeUnit(styles.buttonBorderRadius) || undefined
              }}
            >
              {content.buttonText || 'Get Started Now'}
            </button>
          </div>
        );
      }

      // 12. ACCORDION (FAQ)
      case 'accordion': {
        const items = content.items && content.items.length > 0 ? content.items : [
          { q: content.title1 || 'Why choose NextForge visual builder?', a: 'Clean React code generation with no proprietary runtime lock-in.' },
          { q: content.title2 || 'How does clean Next.js export work?', a: 'Generates real TypeScript + Tailwind + React 19 code ready for Vercel.' }
        ];

        return (
          <div
            className={`space-y-2 text-xs text-left transition-all max-h-[550px] overflow-y-auto nextforge-scrollbar ${
              styles.widthType === 'screen' ? 'w-full max-w-none' : 'w-full'
            }`}
            style={{
              color: styles.color || '#ffffff',
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            {items.map((item: any, idx: number) => {
              const isOpen = openAccordionIdx === idx;
              return (
                <div
                  key={item.id || idx}
                  className="rounded-xl border overflow-hidden transition-all shadow-xs"
                  style={{
                    backgroundColor: styles.bgColor || '#0f172a',
                    borderColor: styles.borderColor || '#1e293b',
                    borderWidth: normalizeUnit(styles.borderWidth) || undefined,
                    borderStyle: styles.borderStyle || undefined,
                    boxShadow: styles.shadow || undefined,
                    borderRadius: normalizeUnit(styles.borderRadius) || '12px'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenAccordionIdx(isOpen ? null : idx)}
                    className="w-full p-3.5 font-bold flex justify-between items-center text-left transition-colors"
                    style={{
                      color: styles.color || '#ffffff',
                      fontSize: normalizeUnit(styles.fontSize) || '13px'
                    }}
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div
                      className="px-3.5 pb-3.5 pt-1 text-slate-400 leading-relaxed border-t overflow-y-auto max-h-56 nextforge-scrollbar"
                      style={{
                        borderColor: styles.borderColor ? `${styles.borderColor}60` : '#1e293b'
                      }}
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      // 13. TABS
      case 'tabs': {
        const tabList = content.tabs || [
          { label: 'Architecture', content: 'Edge runtime with automatic static generation and server-side streaming.' },
          { label: 'Database', content: 'Native SQLite local support with instant Cloudflare D1 edge replication.' },
          { label: 'Export', content: 'Generate complete, clean Next.js 15+ repositories with one click.' }
        ];

        return (
          <div
            className={`p-5 rounded-2xl border space-y-4 text-left transition-all ${
              styles.widthType === 'screen' ? 'w-full max-w-none' : 'w-full'
            }`}
            style={{
              backgroundColor: styles.bgColor || '#0f172a',
              borderColor: styles.borderColor || '#1e293b',
              borderRadius: normalizeUnit(styles.borderRadius) || '16px',
              color: styles.color || '#ffffff',
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            <div className="flex space-x-2 border-b border-slate-800/80 pb-2.5 overflow-x-auto nextforge-scrollbar scrollbar-thin">
              {tabList.map((tab: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTabIdx(idx)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTabIdx === idx
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-300 leading-relaxed overflow-x-auto">
              {tabList[activeTabIdx]?.content}
            </div>
          </div>
        );
      }

      // 14. DATA TABLE
      case 'table': {
        const headers: string[] = content.headers && content.headers.length > 0
          ? content.headers
          : ['Feature', 'NextForge', 'Traditional'];
        const rows: string[][] = content.rows && content.rows.length > 0
          ? content.rows
          : [
            ['PageSpeed', '100 / 100', '65 / 100'],
            ['Code Quality', 'Clean Next.js', 'Vendor Bloat'],
            ['Data Ownership', '100%', 'Proprietary']
          ];

        const colWidths: string[] = (content.colWidths as string[]) || [];
        const gridColsTemplate = headers
          .map((_, i) => {
            const w = (colWidths[i] || '').trim();
            if (!w || w === 'auto') return 'minmax(0, 1fr)';
            if (/^\d+$/.test(w)) return `${w}px`;
            return w;
          })
          .join(' ');

        const headerBg = styles.tableHeaderBg || '#1e293b';
        const headerColor = styles.tableHeaderColor || '#f8fafc';
        const headerFontSize = styles.tableHeaderFontSize || '12px';
        const headerFontWeight = styles.tableHeaderFontWeight || '700';
        const headerAlign = (styles.tableHeaderAlign || styles.textAlign || 'left') as 'left' | 'center' | 'right';
        const cellAlign = (styles.tableCellAlign || styles.textAlign || headerAlign || 'left') as 'left' | 'center' | 'right';
        const headerBorderColor = styles.tableHeaderBorderColor || styles.borderColor || '#334155';
        const headerPadding = styles.tableHeaderPadding || '12px 14px';

        const tableBg = styles.bgColor || '#0f172a';
        const textColor = styles.color || '#cbd5e1';
        const rowBorderColor = styles.borderColor || '#1e293b';
        const isStriped = Boolean(styles.tableStriped);
        const hasHover = styles.tableHoverHighlight !== false;
        const cellPadding = styles.tableCellPadding || '12px 14px';

        // Only apply default middle column highlight if user has not customized table text color
        const isMiddleHighlighted = !styles.color && styles.highlightMiddleColumn !== false;

        return (
          <div
            className="rounded-xl overflow-hidden border text-xs shadow-md w-full transition-all"
            style={{
              backgroundColor: tableBg,
              borderColor: styles.borderColor || 'rgba(51, 65, 85, 0.8)',
              borderRadius: normalizeUnit(styles.borderRadius) || '12px',
              boxShadow: styles.shadow ? applyShadowColor(styles.shadow, styles.shadowColor) : undefined,
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            <div className="w-full overflow-x-auto nextforge-scrollbar">
              <div style={{ minWidth: `${Math.max(headers.length * 110, 280)}px` }}>
                {/* Header Row */}
                <div
                  className="grid transition-colors"
                  style={{
                    gridTemplateColumns: gridColsTemplate,
                    backgroundColor: headerBg,
                    color: headerColor,
                    fontSize: headerFontSize,
                    fontWeight: headerFontWeight,
                    textAlign: headerAlign,
                    padding: headerPadding,
                    borderBottom: `1px solid ${headerBorderColor}`
                  }}
                >
                  {headers.map((h, i) => (
                    <span key={i} className="truncate px-1.5" title={h}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Table Rows */}
                {rows.map((row, rIdx) => {
                  const isStripe = isStriped && rIdx % 2 === 1;
                  const rowBg = isStripe ? 'rgba(255, 255, 255, 0.035)' : 'transparent';

                  return (
                    <div
                      key={rIdx}
                      className={`grid items-center transition-colors ${
                        hasHover ? 'hover:bg-slate-800/40' : ''
                      }`}
                      style={{
                        gridTemplateColumns: gridColsTemplate,
                        backgroundColor: rowBg,
                        borderTop: rIdx === 0 ? 'none' : `1px solid ${rowBorderColor}`,
                        color: textColor,
                        textAlign: cellAlign,
                        padding: cellPadding
                      }}
                    >
                      {headers.map((_, cIdx) => {
                        const cell = row[cIdx] !== undefined ? row[cIdx] : '';
                        return (
                          <span
                            key={cIdx}
                            className={`truncate px-1.5 ${
                              isMiddleHighlighted && cIdx === 1 ? 'text-indigo-400 font-semibold' : ''
                            }`}
                            style={{
                              color: textColor
                            }}
                            title={cell}
                          >
                            {cell}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      // 15. TESTIMONIAL
      case 'testimonial': {
        const avatarUrl =
          content.avatar ||
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80';
        const rating = content.rating || 5;

        return (
          <div
            className="p-6 rounded-2xl border transition-all text-left shadow-sm space-y-3"
            style={{
              backgroundColor: styles.bgColor || '#f8fafc',
              backgroundImage: styles.bgGradient || undefined,
              borderColor: styles.borderColor || '#e2e8f0',
              borderWidth: normalizeUnit(styles.borderWidth) || undefined,
              borderStyle: styles.borderStyle || undefined,
              boxShadow: styles.shadow || undefined,
              paddingTop: normalizeUnit(styles.paddingTop) || undefined,
              paddingBottom: normalizeUnit(styles.paddingBottom) || undefined,
              paddingLeft: normalizeUnit(styles.paddingLeft) || undefined,
              paddingRight: normalizeUnit(styles.paddingRight) || undefined,
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            <div className="flex items-center space-x-1 text-amber-400">
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p
              className="text-xs leading-relaxed italic"
              style={{
                color: styles.color || '#334155',
                fontFamily: styles.fontFamily || undefined,
                fontSize: normalizeUnit(styles.fontSize) || undefined
              }}
            >
              "{content.quote || 'NextForge cuts our front-end delivery cycle by 80%. Exporting clean Next.js 15 code is a game changer.'}"
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <img
                src={avatarUrl}
                alt={content.author || 'Author'}
                className="w-9 h-9 rounded-full object-cover border border-indigo-200 shadow-xs"
              />
              <div>
                <h5 className="text-xs font-bold text-slate-900">{content.author || 'Sarah Jenkins'}</h5>
                <p className="text-[10px] text-slate-500">{content.role || 'CTO at TechFlow'}</p>
              </div>
            </div>
          </div>
        );
      }

      // 16. TEAM MEMBER
      case 'teammember': {
        const avatarUrl =
          content.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

        return (
          <div
            className="p-5 rounded-2xl border transition-all text-center space-y-3 shadow-sm"
            style={{
              backgroundColor: styles.bgColor || '#ffffff',
              backgroundImage: styles.bgGradient || undefined,
              borderColor: styles.borderColor || '#e2e8f0',
              borderWidth: normalizeUnit(styles.borderWidth) || undefined,
              borderStyle: styles.borderStyle || undefined,
              boxShadow: styles.shadow || undefined,
              fontFamily: styles.fontFamily || undefined,
              paddingTop: normalizeUnit(styles.paddingTop) || undefined,
              paddingBottom: normalizeUnit(styles.paddingBottom) || undefined,
              paddingLeft: normalizeUnit(styles.paddingLeft) || undefined,
              paddingRight: normalizeUnit(styles.paddingRight) || undefined,
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            <img
              src={avatarUrl}
              alt={content.name || 'Team member'}
              className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-indigo-500 shadow-md"
            />
            <div>
              <h5 className="text-sm font-bold text-slate-900">{content.name || 'Alex Rivera'}</h5>
              <p className="text-xs text-indigo-600 font-semibold">{content.role || 'Head of Engineering'}</p>
            </div>
            {content.bio && <p className="text-xs text-slate-500 leading-relaxed">{content.bio}</p>}
          </div>
        );
      }

      // 16b. ICON LIST
      case 'iconlist': {
        const listItems: { id?: string; iconName?: string; text?: string }[] =
          content.items && content.items.length > 0
            ? content.items
            : [
                { id: 'il-1', iconName: 'check', text: 'Unlimited dynamic pages' },
                { id: 'il-2', iconName: 'check', text: '1-Click ZIP Next.js code export' },
                { id: 'il-3', iconName: 'check', text: 'Zero vendor lock-in' }
              ];
        const liIconColor = styles.iconColor || styles.color || '#6366f1';
        const liIconSize = normalizeUnit(styles.iconSize) || '16px';

        return (
          <div
            className="flex flex-col transition-all"
            style={{
              backgroundColor: styles.bgColor || undefined,
              backgroundImage: styles.bgGradient || undefined,
              color: styles.color || '#1e293b',
              fontFamily: styles.fontFamily || undefined,
              fontSize: normalizeUnit(styles.fontSize) || '14px',
              fontWeight: styles.fontWeight || undefined,
              textAlign: styles.textAlign || 'left',
              border: styles.borderColor
                ? `${normalizeUnit(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor}`
                : undefined,
              borderRadius: normalizeUnit(styles.borderRadius) || undefined,
              boxShadow: styles.shadow || undefined,
              gap: normalizeUnit(styles.gap) || '10px',
              paddingTop: normalizeUnit(styles.paddingTop) || '8px',
              paddingBottom: normalizeUnit(styles.paddingBottom) || '8px',
              paddingLeft: normalizeUnit(styles.paddingLeft) || '8px',
              paddingRight: normalizeUnit(styles.paddingRight) || '8px',
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            {listItems.map((item, idx) => {
              const ItemIcon = getLucideIcon(item.iconName || 'check');
              return (
                <div key={item.id || idx} className="flex items-center space-x-2.5">
                  <span
                    className="inline-flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: styles.iconBgColor || undefined,
                      borderRadius: normalizeUnit(styles.iconBorderRadius) || undefined,
                      padding: normalizeUnit(styles.iconPadding) || undefined
                    }}
                  >
                    <ItemIcon style={{ width: liIconSize, height: liIconSize, color: liIconColor }} />
                  </span>
                  <span>{item.text || ''}</span>
                </div>
              );
            })}
          </div>
        );
      }

      // 17. BADGE
      case 'badge': {
        return (
          <div style={{ textAlign: styles.textAlign || 'left' }}>
            <span
              className="inline-flex items-center space-x-1 text-xs font-bold px-3 py-1 rounded-full shadow-xs"
              style={{
                backgroundColor: styles.bgColor || '#ede9fe',
                color: styles.color || '#6366f1',
                fontSize: normalizeUnit(styles.fontSize) || '11px',
                marginTop: normalizeUnit(styles.marginTop),
                marginBottom: normalizeUnit(styles.marginBottom)
              }}
            >
              <Sparkles className="w-3 h-3" />
              <span>{content.text || 'Next.js 15+ Native'}</span>
            </span>
          </div>
        );
      }

      // 18. COUNTER
      case 'counter': {
        return (
          <div
            className="p-4 rounded-xl text-center space-y-1"
            style={{
              backgroundColor: styles.bgColor || undefined,
              backgroundImage: styles.bgGradient || undefined,
              borderRadius: normalizeUnit(styles.borderRadius) || undefined,
              boxShadow: styles.shadow || undefined,
              paddingTop: normalizeUnit(styles.paddingTop) || undefined,
              paddingBottom: normalizeUnit(styles.paddingBottom) || undefined,
              paddingLeft: normalizeUnit(styles.paddingLeft) || undefined,
              paddingRight: normalizeUnit(styles.paddingRight) || undefined,
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            <div
              className="font-black text-4xl tracking-tight"
              style={{
                color: styles.color || '#6366f1',
                fontFamily: styles.fontFamily || undefined,
                fontSize: normalizeUnit(styles.fontSize) || '40px',
                fontWeight: styles.fontWeight || undefined
              }}
            >
              <span>{content.value || '99.9'}</span>
              <span>{content.suffix || '%'}</span>
            </div>
            <div
              className="text-xs font-bold text-slate-400 uppercase tracking-wider"
              style={{ color: styles.descColor || undefined }}
            >
              {content.label || 'Uptime SLA'}
            </div>
          </div>
        );
      }

      // 19. ALERT
      case 'alert': {
        const type = content.alertType || 'info';
        const isSuccess = type === 'success';
        const isWarning = type === 'warning';
        const isDanger = type === 'error';

        return (
          <div
            className={`p-4 rounded-xl border text-xs flex items-start space-x-3 shadow-xs ${
              isSuccess
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                : isWarning
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                : isDanger
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                : 'bg-indigo-500/10 border-indigo-500/40 text-indigo-200'
            }`}
            style={{
              backgroundColor: styles.bgColor || undefined,
              color: styles.color || undefined,
              borderRadius: normalizeUnit(styles.borderRadius) || '12px',
              borderWidth: normalizeUnit(styles.borderWidth) || undefined,
              borderStyle: styles.borderStyle || undefined,
              borderColor: styles.borderColor || undefined,
              boxShadow: styles.shadow || undefined,
              fontFamily: styles.fontFamily || undefined,
              paddingTop: normalizeUnit(styles.paddingTop) || undefined,
              paddingBottom: normalizeUnit(styles.paddingBottom) || undefined,
              paddingLeft: normalizeUnit(styles.paddingLeft) || undefined,
              paddingRight: normalizeUnit(styles.paddingRight) || undefined,
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-left space-y-0.5">
              <div className="font-bold text-white">{content.title || 'Deployment Active'}</div>
              <p className="opacity-90">{content.message || 'Your latest changes are live on the global CDN.'}</p>
            </div>
          </div>
        );
      }

      // 20. DIVIDER
      case 'divider': {
        return (
          <div
            className="w-full"
            style={{
              marginTop: normalizeUnit(styles.marginTop) || '16px',
              marginBottom: normalizeUnit(styles.marginBottom) || '16px'
            }}
          >
            <div
              style={{
                borderBottomWidth: styles.borderWidth
                  ? normalizeUnit(styles.borderWidth)
                  : `${content.thickness || 1}px`,
                borderBottomStyle: (content.style || styles.borderStyle || 'solid') as any,
                borderBottomColor: styles.borderColor || '#e2e8f0'
              }}
            />
          </div>
        );
      }

      // 21. SPACER
      case 'spacer': {
        const h = content.height || 40;
        return <div style={{ height: `${h}px` }} className="w-full" />;
      }

      // 22. MAP
      case 'map': {
        const address = content.address || 'San Francisco, CA';
        const h = content.height || 220;

        return (
          <div
            className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 flex flex-col items-center justify-center relative shadow-lg"
            style={{
              height: `${h}px`,
              borderRadius: normalizeUnit(styles.borderRadius) || '16px',
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10 text-center space-y-1 p-4">
              <MapPin className="w-8 h-8 text-rose-500 mx-auto animate-bounce" />
              <div className="text-xs font-bold text-white">{address}</div>
              <p className="text-[10px] text-slate-400">Interactive Next.js Edge Map Embed</p>
            </div>
          </div>
        );
      }

      // 23. CONTACT DETAILS
      case 'contactdetails': {
        return (
          <div
            className="p-5 rounded-2xl border transition-all text-left space-y-3 shadow-xs"
            style={{
              backgroundColor: styles.bgColor || '#f8fafc',
              borderColor: styles.borderColor || '#e2e8f0',
              borderRadius: normalizeUnit(styles.borderRadius) || '16px',
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Get in Touch</h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{content.email || 'hello@nextforge.dev'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{content.phone || '+1 (555) 234-5678'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{content.address || '77 Innovation Way, CA'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{content.hours || 'Mon - Fri: 9am - 6pm'}</span>
              </div>
            </div>
          </div>
        );
      }

      // 24. LOGO CLOUD
      case 'logocloud': {
        const logos: string[] = content.logos || ['Vercel', 'Cloudflare', 'Supabase', 'Stripe', 'Tailwind'];

        return (
          <div
            className="p-4 text-center space-y-3"
            style={{
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {content.title || 'Empowering Modern Engineering Teams'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-black text-slate-400 opacity-80">
              {logos.map((logo, i) => (
                <span key={i} className="hover:text-indigo-400 transition-colors">
                  {logo}
                </span>
              ))}
            </div>
          </div>
        );
      }

      // 25. FLIP BOX
      case 'flipbox': {
        return (
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="p-6 rounded-2xl border border-indigo-400/30 text-center shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: isFlipped ? '#0f172a' : styles.bgColor || '#6366f1',
              color: '#ffffff',
              borderRadius: normalizeUnit(styles.borderRadius) || '16px',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {!isFlipped ? (
              <div className="space-y-2">
                <Zap className="w-6 h-6 mx-auto text-amber-300" />
                <h4 className="text-base font-bold">{content.frontTitle || 'Hover / Click Me'}</h4>
                <p className="text-xs opacity-80">Flip to reveal component properties</p>
              </div>
            ) : (
              <div className="space-y-2 animate-fade-in">
                <h4 className="text-base font-bold text-indigo-400">{content.backTitle || 'Next.js Code Ready'}</h4>
                <p className="text-xs text-slate-300">{content.backDesc || 'Instant export with zero vendor locks.'}</p>
              </div>
            )}
          </div>
        );
      }

      // 26. VIDEO
      case 'video': {
        return (
          <VideoPlayerElement
            el={el}
            content={content}
            styles={styles}
            isEditor={isEditor}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      }

      // 27. NAVIGATION
      case 'navigation': {
        const rawLinks: any[] = content.links && content.links.length > 0
          ? content.links
          : ['Home', 'Features', 'Pricing', 'About'];

        const links: NavLinkItem[] = rawLinks.map((item: any, idx: number) => {
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

        const logoText = content.logoText || 'NextForge';
        const ctaText = content.ctaText || 'Get Started';
        const showCta = content.showCta !== false;
        const navLayout = styles.navLayout || content.navLayout || 'standard';
        const navStylePreset = styles.navStyle || content.navStyle || 'clean';

        // Smooth scroll / anchor handler, multi-page routing & external links
        const handleLinkClick = (linkInput: any) => {
          setMobileMenuOpen(false);
          const linkObj: NavLinkItem =
            typeof linkInput === 'object' && linkInput !== null
              ? {
                  label: linkInput.label !== undefined ? String(linkInput.label) : '',
                  url: linkInput.url !== undefined ? String(linkInput.url) : (linkInput.label || ''),
                  openInNewTab: Boolean(linkInput.openInNewTab)
                }
              : { label: String(linkInput || ''), url: String(linkInput || ''), openInNewTab: false };

          const targetUrl = (linkObj.url || linkObj.label || '').trim();
          const openInNewTab = Boolean(linkObj.openInNewTab);

          if (!targetUrl) return;

          // 1. External URL (http://, https://, //, mailto:, tel:)
          if (/^(https?:|\/\/|mailto:|tel:)/i.test(targetUrl)) {
            if (openInNewTab) {
              window.open(targetUrl, '_blank', 'noopener,noreferrer');
            } else {
              window.location.href = targetUrl;
            }
            return;
          }

          // 2. Multi-page link routing: check if link matches a page name or slug (when NOT an anchor link)
          if (!targetUrl.startsWith('#')) {
            const cleanTarget = targetUrl.replace(/^\//, '').toLowerCase().trim();
            const cleanLabel = (linkObj.label || '').toLowerCase().trim();

            const targetPage = pages.find((p: any) => {
              const pSlug = (p.slug || '').replace(/^\//, '').toLowerCase().trim();
              const pName = (p.name || '').toLowerCase().trim();
              const pId = (p.id || '').toLowerCase().trim();
              return (
                (cleanTarget && (pSlug === cleanTarget || pName === cleanTarget || pId === cleanTarget)) ||
                (cleanLabel && (pSlug === cleanLabel || pName === cleanLabel)) ||
                ((cleanTarget === '' || cleanTarget === 'home' || cleanLabel === 'home') && (p.slug === '/' || p.id === 'page-home'))
              );
            });

            if (targetPage) {
              if (targetPage.id !== currentPageId) {
                setCurrentPageId(targetPage.id);
                const scrollCont = document.getElementById('preview-scroll-container') || document.getElementById('canvas-scroll-container');
                if (scrollCont) scrollCont.scrollTop = 0;
              }
              return;
            }
          }

          // 3. Anchor scrolling on current page (e.g. #SectionID, #hero, or raw SectionID)
          const rawId = targetUrl.replace(/^#/, '').trim();
          if (!rawId) return;

          const lowerId = rawId.toLowerCase();

          // Locate element by exact ID, lowercase ID, data-custom-id, or data-section-id
          let targetEl: HTMLElement | null =
            document.getElementById(rawId) ||
            document.getElementById(lowerId) ||
            (document.querySelector(`[data-custom-id="${rawId}"]`) as HTMLElement) ||
            (document.querySelector(`[data-custom-id="${lowerId}"]`) as HTMLElement) ||
            (document.querySelector(`[data-section-id="${rawId}"]`) as HTMLElement) ||
            (document.querySelector(`[data-section-id="${lowerId}"]`) as HTMLElement) ||
            (document.querySelector(`[id="${rawId}" i]`) as HTMLElement) ||
            (document.querySelector(`[data-custom-id="${rawId}" i]`) as HTMLElement);

          // If not found directly in DOM, resolve against sections from builder store
          if (!targetEl && sections && sections.length > 0) {
            const matchedSec = sections.find((s: any) =>
              (s.customId && s.customId.toLowerCase() === lowerId) ||
              (s.id && s.id.toLowerCase() === lowerId) ||
              (s.name && s.name.toLowerCase().replace(/[^a-z0-9_-]/g, '') === lowerId)
            );
            if (matchedSec) {
              const secAnchor = matchedSec.customId || matchedSec.id;
              targetEl =
                document.getElementById(secAnchor) ||
                (document.querySelector(`[data-section-id="${matchedSec.id}"]`) as HTMLElement) ||
                (document.querySelector(`[data-custom-id="${matchedSec.customId}"]`) as HTMLElement);
            }
          }

          // Fallback query for matching element ID substring
          if (!targetEl) {
            try {
              targetEl =
                (document.querySelector(`section[id*="${lowerId}"]`) as HTMLElement) ||
                (document.querySelector(`[id*="${lowerId}"]`) as HTMLElement);
            } catch {
              // ignore invalid query selector
            }
          }

          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
              window.history.replaceState(null, '', `#${rawId}`);
            }
          }
        };

        // Style presets
        let presetClasses = 'w-full transition-all';
        let customBg = styles.bgColor;
        let customBorder = styles.borderColor;

        switch (navStylePreset) {
          case 'glass':
            presetClasses += ' backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 shadow-sm rounded-2xl px-3.5 sm:px-5 py-3';
            break;
          case 'floating':
            presetClasses += ' bg-white dark:bg-slate-900 shadow-lg border border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-full px-3.5 sm:px-6 py-2.5 mx-auto max-w-5xl';
            break;
          case 'bordered':
            presetClasses += ' border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-3 bg-white dark:bg-slate-950';
            break;
          case 'dark':
            presetClasses += ' bg-slate-950 text-white rounded-xl px-3.5 sm:px-5 py-3 shadow-md border border-slate-800';
            break;
          case 'gradient':
            presetClasses += ' bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-xl px-3.5 sm:px-5 py-3 shadow-md';
            break;
          case 'clean':
          default:
            presetClasses += ' py-2.5 px-3 sm:px-4 rounded-xl';
            break;
        }

        const isInverseColor = navStylePreset === 'dark' || navStylePreset === 'gradient';
        const primaryTextColor = isInverseColor
          ? '#ffffff'
          : (styles.color || '#0f172a');
        const secondaryTextColor = isInverseColor
          ? 'rgba(255,255,255,0.85)'
          : (styles.color ? `${styles.color}cc` : '#475569');
        const hoverTextColor = isInverseColor
          ? '#ffffff'
          : '#4f46e5';

        const ctaBtnClasses = navStylePreset === 'gradient'
          ? 'bg-white text-indigo-700 hover:bg-slate-100 shadow-sm'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs';

        // Logo component (never wraps, flex-shrink-0)
        const renderLogo = (center = false) => (
          <div
            onClick={() => handleLinkClick('home')}
            className={`flex items-center space-x-2.5 font-black text-sm tracking-tight cursor-pointer select-none flex-shrink-0 ${center ? 'justify-center' : ''}`}
          >
            {content.logoImage ? (
              <img src={content.logoImage} alt={logoText} className="h-7 w-auto object-contain rounded flex-shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white text-xs font-black shadow-xs flex-shrink-0">
                {logoText.charAt(0)}
              </div>
            )}
            <span
              className="font-extrabold text-base tracking-tight whitespace-nowrap truncate max-w-[130px] sm:max-w-none"
              style={{ color: primaryTextColor }}
            >
              {logoText}
            </span>
          </div>
        );

        // Desktop & Tablet Navigation Links
        const renderLinks = (spacingClass = '') => {
          if (isMobile) return null;

          const defaultSpacing = isTablet ? 'space-x-3 text-[11px]' : 'space-x-7 text-xs';
          const finalClass = spacingClass || defaultSpacing;
          return (
            <div className={`flex items-center ${finalClass} font-semibold flex-shrink-0`}>
              {links.map((linkItem: NavLinkItem, idx: number) => (
                <span
                  key={idx}
                  className="cursor-pointer transition-colors hover:scale-105 inline-block whitespace-nowrap flex-shrink-0"
                  style={{ color: secondaryTextColor }}
                  onClick={() => handleLinkClick(linkItem)}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = hoverTextColor; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = secondaryTextColor; }}
                >
                  {linkItem.label}
                </span>
              ))}
            </div>
          );
        };

        // CTA Button
        const renderCta = (compact = false) => {
          if (!showCta) return null;
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const ctaTarget = (content.ctaUrl || content.ctaText || '').trim();
                handleLinkClick(ctaTarget || 'pricing');
              }}
              className={`${ctaBtnClasses} active:scale-95 rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap flex-shrink-0 cursor-pointer ${
                compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-4 py-2 text-xs'
              }`}
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
            </button>
          );
        };

        // Hamburger button (mobile only)
        const renderHamburger = () => {
          if (!isMobile) return null;
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className={`p-2 rounded-xl transition-all flex items-center justify-center border shadow-xs active:scale-95 flex-shrink-0 ${
                isInverseColor
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  : navStylePreset === 'glass'
                  ? 'bg-white/50 hover:bg-white/80 text-slate-800 border-white/60 backdrop-blur-md dark:bg-slate-800 dark:text-slate-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
              }`}
              aria-label="Toggle Navigation Menu"
              title="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          );
        };

        // Render based on navLayout and active viewport
        const renderLayoutContent = () => {
          // 1. MOBILE RESPONSIVE ADAPTIVE LAYOUTS
          if (isMobile) {
            switch (navLayout) {
              case 'minimal':
                // Minimal on mobile: cleanly Logo + Hamburger (CTA lives inside the drawer for zero clutter)
                return (
                  <div className="flex items-center justify-between w-full">
                    {renderLogo()}
                    {renderHamburger()}
                  </div>
                );

              case 'stacked':
                // Stacked on mobile: 2-tier stacked header
                return (
                  <div className="flex flex-col items-center justify-center w-full space-y-2 py-0.5">
                    <div className="flex items-center justify-center w-full">
                      {renderLogo(true)}
                    </div>
                    <div className="flex items-center justify-between w-full pt-1.5 border-t border-slate-200/40 dark:border-slate-800/40">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Menu</span>
                      <div className="flex items-center space-x-2">
                        {showCta && renderCta(true)}
                        {renderHamburger()}
                      </div>
                    </div>
                  </div>
                );

              case 'centered':
                // Centered on mobile: balanced centered logo with hamburger on right
                return (
                  <div className="flex items-center justify-between w-full">
                    <div className="w-8" />
                    <div className="flex-1 flex justify-center">
                      {renderLogo(true)}
                    </div>
                    <div className="w-8 flex justify-end">
                      {renderHamburger()}
                    </div>
                  </div>
                );

              case 'split':
              case 'standard':
              default:
                return (
                  <div className="flex items-center justify-between w-full">
                    {renderLogo()}
                    <div className="flex items-center space-x-2">
                      {showCta && renderCta(true)}
                      {renderHamburger()}
                    </div>
                  </div>
                );
            }
          }

          // 2. TABLET RESPONSIVE ADAPTIVE LAYOUTS
          if (isTablet) {
            switch (navLayout) {
              case 'brand-left':
                return (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      {renderLogo()}
                      {renderLinks('space-x-2.5 text-[11px]')}
                    </div>
                    <div className="shrink-0 flex items-center space-x-2">
                      {renderCta(true)}
                    </div>
                  </div>
                );

              case 'centered':
                return (
                  <div className="flex items-center justify-between w-full">
                    <div className="shrink-0">
                      {renderLogo()}
                    </div>
                    <div className="flex-1 flex justify-center px-2 overflow-hidden">
                      {renderLinks('space-x-2.5 text-[11px]')}
                    </div>
                    <div className="shrink-0 flex items-center">
                      {renderCta(true)}
                    </div>
                  </div>
                );

              case 'split': {
                const mid = Math.ceil(links.length / 2);
                const leftLinks = links.slice(0, mid);
                const rightLinks = links.slice(mid);
                const renderSplitGroup = (items: NavLinkItem[]) => (
                  <div className="flex items-center space-x-2 text-[11px] font-semibold">
                    {items.map((linkItem: NavLinkItem, idx: number) => (
                      <span
                        key={idx}
                        className="cursor-pointer transition-colors whitespace-nowrap hover:scale-105 inline-block"
                        style={{ color: secondaryTextColor }}
                        onClick={() => handleLinkClick(linkItem)}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = hoverTextColor; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = secondaryTextColor; }}
                      >
                        {linkItem.label}
                      </span>
                    ))}
                  </div>
                );

                return (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1 flex justify-start overflow-hidden">
                      {renderSplitGroup(leftLinks)}
                    </div>
                    <div className="shrink-0 px-2">
                      {renderLogo()}
                    </div>
                    <div className="flex-1 flex justify-end items-center space-x-2 overflow-hidden">
                      {renderSplitGroup(rightLinks)}
                      {renderCta(true)}
                    </div>
                  </div>
                );
              }

              case 'minimal':
                return (
                  <div className="flex items-center justify-between w-full">
                    {renderLogo()}
                    <div className="flex items-center space-x-3">
                      {renderLinks('space-x-3 text-xs')}
                      {renderCta(true)}
                    </div>
                  </div>
                );

              case 'stacked':
                return (
                  <div className="flex flex-col items-center justify-center w-full space-y-2 py-1">
                    <div className="flex items-center justify-center w-full">
                      {renderLogo(true)}
                    </div>
                    <div className="flex items-center space-x-5 text-xs font-semibold">
                      {renderLinks('space-x-4 text-xs')}
                      {renderCta(true)}
                    </div>
                  </div>
                );

              case 'standard':
              default:
                return (
                  <div className="flex items-center justify-between w-full">
                    {renderLogo()}
                    {renderLinks('space-x-3.5 text-xs')}
                    <div className="flex items-center space-x-2.5">
                      {renderCta(true)}
                    </div>
                  </div>
                );
            }
          }

          // 3. DESKTOP ADAPTIVE LAYOUTS
          switch (navLayout) {
            case 'brand-left':
              return (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-8">
                    {renderLogo()}
                    {renderLinks('space-x-6 text-xs')}
                  </div>
                  <div className="flex items-center space-x-3">
                    {renderCta()}
                  </div>
                </div>
              );

            case 'centered':
              return (
                <div className="flex items-center justify-between w-full">
                  <div className="w-1/4 flex justify-start">
                    {renderLogo()}
                  </div>
                  <div className="w-2/4 flex justify-center">
                    {renderLinks('space-x-7 text-xs')}
                  </div>
                  <div className="w-1/4 flex justify-end items-center space-x-3">
                    {renderCta()}
                  </div>
                </div>
              );

            case 'split': {
              const mid = Math.ceil(links.length / 2);
              const leftLinks = links.slice(0, mid);
              const rightLinks = links.slice(mid);
              const renderSplitGroup = (items: NavLinkItem[]) => (
                <div className="flex items-center space-x-6 text-xs font-semibold">
                  {items.map((linkItem: NavLinkItem, idx: number) => (
                    <span
                      key={idx}
                      className="cursor-pointer transition-colors whitespace-nowrap hover:scale-105 inline-block"
                      style={{ color: secondaryTextColor }}
                      onClick={() => handleLinkClick(linkItem)}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = hoverTextColor; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = secondaryTextColor; }}
                    >
                      {linkItem.label}
                    </span>
                  ))}
                </div>
              );

              return (
                <div className="flex items-center justify-between w-full">
                  <div className="w-1/3 flex justify-start">
                    {renderSplitGroup(leftLinks)}
                  </div>
                  <div className="w-1/3 flex justify-center">
                    {renderLogo()}
                  </div>
                  <div className="w-1/3 flex justify-end items-center space-x-4">
                    {renderSplitGroup(rightLinks)}
                    {renderCta()}
                  </div>
                </div>
              );
            }

            case 'minimal':
              return (
                <div className="flex items-center justify-between w-full">
                  {renderLogo()}
                  <div className="flex items-center space-x-6">
                    {renderLinks('space-x-6 text-xs')}
                    {renderCta()}
                  </div>
                </div>
              );

            case 'stacked':
              return (
                <div className="flex flex-col items-center justify-center w-full space-y-3 py-1">
                  <div className="flex items-center justify-center w-full">
                    {renderLogo(true)}
                  </div>
                  <div className="flex items-center space-x-8 text-xs font-semibold">
                    {renderLinks('space-x-8 text-xs')}
                    {renderCta()}
                  </div>
                </div>
              );

            case 'standard':
            default:
              return (
                <div className="flex items-center justify-between w-full">
                  {renderLogo()}
                  {renderLinks('space-x-7 text-xs')}
                  <div className="flex items-center space-x-3">
                    {renderCta()}
                  </div>
                </div>
              );
          }
        };

        // Mobile Drawer Container & Item Styling based on navStylePreset
        let drawerContainerClass = 'mt-3 pt-3 border-t space-y-3 animate-in fade-in slide-in-from-top-2 duration-200';
        let drawerItemClass = 'py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between active:scale-98';
        let drawerCtaContainerClass = 'pt-2 border-t';

        switch (navStylePreset) {
          case 'glass':
            drawerContainerClass = 'mt-3 p-4 rounded-2xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/40 dark:border-white/15 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200';
            drawerItemClass = 'py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between text-slate-800 dark:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/80 active:scale-98 shadow-2xs';
            drawerCtaContainerClass = 'pt-2.5 border-t border-slate-200/50 dark:border-slate-800/50';
            break;

          case 'floating':
            drawerContainerClass = 'mt-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200';
            drawerItemClass = 'py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 active:scale-98';
            drawerCtaContainerClass = 'pt-2.5 border-t border-slate-100 dark:border-slate-800';
            break;

          case 'gradient':
            drawerContainerClass = 'mt-3 p-4 rounded-2xl bg-indigo-950/95 backdrop-blur-xl text-white border border-white/20 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200';
            drawerItemClass = 'py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between text-white/90 hover:text-white hover:bg-white/15 active:scale-98';
            drawerCtaContainerClass = 'pt-2.5 border-t border-white/15';
            break;

          case 'dark':
            drawerContainerClass = 'mt-3 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl text-white border border-slate-800 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200';
            drawerItemClass = 'py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between text-slate-200 hover:text-white hover:bg-slate-800 active:scale-98';
            drawerCtaContainerClass = 'pt-2.5 border-t border-slate-800';
            break;

          case 'bordered':
            drawerContainerClass = 'mt-3 p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200';
            drawerItemClass = 'py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 active:scale-98';
            drawerCtaContainerClass = 'pt-2 border-t border-slate-200 dark:border-slate-800';
            break;

          case 'clean':
          default:
            drawerContainerClass = `mt-3 pt-3 border-t space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
              isInverseColor ? 'border-white/15' : 'border-slate-200/80 dark:border-slate-800'
            }`;
            drawerItemClass = `py-2.5 px-3.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
              isInverseColor
                ? 'hover:bg-white/10 text-white'
                : 'hover:bg-indigo-50 hover:text-indigo-600 text-slate-800 dark:text-slate-200 dark:hover:bg-slate-800'
            }`;
            drawerCtaContainerClass = `pt-2 border-t ${isInverseColor ? 'border-white/15' : 'border-slate-100 dark:border-slate-800'}`;
            break;
        }

        // Layout specific drawer adjustments
        const isCenteredDrawer = navLayout === 'centered';
        const isSplitDrawer = navLayout === 'split' && links.length >= 4;

        // Sticky Navigation Configuration & Classes
        const isSticky = Boolean(styles.isSticky ?? content.isSticky);
        const stickyBehavior = styles.stickyBehavior || content.stickyBehavior || 'always';
        const stickyTargetSection = (styles.stickyTargetSection || content.stickyTargetSection || '').trim();

        let stickyClasses = '';
        if (isSticky) {
          const isDarkOrGradient = navStylePreset === 'dark' || navStylePreset === 'gradient' || Boolean(customBg);
          const scrollElevationClass = isScrolled
            ? isDarkOrGradient
              ? 'shadow-2xl ring-1 ring-white/20 backdrop-blur-md'
              : 'shadow-xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 ring-1 ring-slate-900/5'
            : '';

          stickyClasses = `transition-all duration-300 ${
            isStickyVisible
              ? 'translate-y-0 opacity-100'
              : '-translate-y-full opacity-0 pointer-events-none'
          } ${scrollElevationClass}`;
        }

        return (
          <nav
            id={el.id}
            data-element-id={el.id}
            className={`${isSticky ? 'sticky top-0 z-40' : 'relative'} ${presetClasses} ${stickyClasses}`}
            style={{
              backgroundColor: customBg || undefined,
              borderColor: customBorder || undefined,
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            {/* Sticky Navigation Indicator in Editor Canvas */}
            {isEditor && isSticky && (
              <div className="absolute -top-3 left-4 z-30 flex items-center space-x-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-600 text-white shadow-sm border border-indigo-400/40 select-none">
                <span>📌 STICKY NAV</span>
                {stickyBehavior !== 'always' && stickyTargetSection && (
                  <span className="opacity-90 font-normal">
                    ({stickyBehavior === 'show-after' ? 'Show after' : stickyBehavior === 'hide-after' ? 'Hide after' : 'Hide in'} #{stickyTargetSection})
                  </span>
                )}
              </div>
            )}

            {/* Primary Nav Layout */}
            {renderLayoutContent()}

            {/* Responsive Mobile Drawer / Hamburger Accordion Dropdown */}
            {isMobile && mobileMenuOpen && (
              <div className={drawerContainerClass}>
                <div className={isSplitDrawer ? 'grid grid-cols-2 gap-2' : 'flex flex-col space-y-1'}>
                  {links.map((linkItem: NavLinkItem, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => handleLinkClick(linkItem)}
                      className={`${drawerItemClass} ${isCenteredDrawer ? 'justify-center text-center' : ''}`}
                    >
                      <span>{linkItem.label}</span>
                      {!isCenteredDrawer && <ArrowRight className="w-3 h-3 opacity-40 ml-1.5 flex-shrink-0" />}
                    </div>
                  ))}
                </div>

                {showCta && (
                  <div className={drawerCtaContainerClass}>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        const ctaTarget = (content.ctaUrl || content.ctaText || '').trim();
                        handleLinkClick(ctaTarget || 'pricing');
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 active:scale-98 ${ctaBtnClasses}`}
                    >
                      <span>{ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        );
      }

      // 27. MARQUEE (infinite scrolling strip: text & SVG/PNG logos)
      case 'marquee': {
        const mode = content.mode || 'text';
        const mqItems: string[] = content.items && content.items.length > 0
          ? content.items
          : ['Free shipping over $50', '30-day easy returns', 'New drops every Friday'];
        const mqSep = content.separator !== undefined ? content.separator : '✦';
        const logos: any[] = content.logos && content.logos.length > 0
          ? content.logos
          : [
              { id: 'l1', name: 'Brand 1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80', svg: '' },
              { id: 'l2', name: 'Brand 2', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80', svg: '' },
              { id: 'l3', name: 'Brand 3', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80', svg: '' }
            ];

        const direction = content.direction || 'left';
        const speedSec = Math.max(2, Number(content.speed) || 22);
        const pauseOnHover = content.pauseOnHover !== false;
        const itemGap = content.gap !== undefined ? Number(content.gap) : 32;
        const effect = content.effect || 'none';
        const autoHeight = content.autoHeight !== false;
        const logoHeightStr = normalizeUnit(content.logoHeight) || '40px';
        const logoWidthStr = content.logoWidth && content.logoWidth !== 'auto' ? normalizeUnit(content.logoWidth) : 'auto';

        const rawLogoList = logos.length > 0 ? logos : [{ id: 'l1', name: 'Brand', url: '', svg: '' }];
        // Duplicate items to ensure seamless loop
        const textLoop = [...mqItems, ...mqItems, ...mqItems, ...mqItems];
        const logoLoop = [...rawLogoList, ...rawLogoList, ...rawLogoList, ...rawLogoList];

        const animId = `nf-mq-${String(el.id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
        const keyframeName = `kf-${animId}`;
        const isReverse = direction === 'right';

        let effectStyle: React.CSSProperties = {};
        let effectCss = '';
        if (effect === 'blur-edges') {
          effectStyle = {
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
          };
        } else if (effect === 'grayscale') {
          effectCss = `.${animId} .nf-mq-item { filter: grayscale(100%); opacity: 0.75; transition: filter 0.3s ease, opacity 0.3s ease; } .${animId} .nf-mq-item:hover { filter: grayscale(0%); opacity: 1; }`;
        } else if (effect === 'opacity-dim') {
          effectCss = `.${animId} .nf-mq-item { opacity: 0.55; transition: opacity 0.3s ease; } .${animId} .nf-mq-item:hover { opacity: 1; }`;
        }

        return (
          <div
            className={`nf-marquee ${animId}`}
            style={{
              backgroundColor: styles.bgColor || (mode === 'logos' ? '#ffffff' : '#0f172a'),
              backgroundImage: styles.bgGradient || undefined,
              color: styles.color || (mode === 'logos' ? '#0f172a' : '#ffffff'),
              fontFamily: styles.fontFamily || undefined,
              fontSize: normalizeUnit(styles.fontSize) || '14px',
              fontWeight: styles.fontWeight || '700',
              textAlign: styles.textAlign || undefined,
              borderRadius: normalizeUnit(styles.borderRadius) || (mode === 'logos' ? '16px' : '999px'),
              boxShadow: styles.shadow || undefined,
              border: styles.borderColor ? `${normalizeUnit(styles.borderWidth) || '1px'} solid ${styles.borderColor}` : undefined,
              overflow: 'hidden',
              paddingTop: normalizeUnit(styles.paddingTop) || (mode === 'logos' ? '18px' : '10px'),
              paddingBottom: normalizeUnit(styles.paddingBottom) || (mode === 'logos' ? '18px' : '10px'),
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom),
              position: 'relative',
              whiteSpace: 'nowrap',
              ...effectStyle
            }}
          >
            <style>{`
              @keyframes ${keyframeName} {
                0% { transform: translateX(${isReverse ? '-50%' : '0%'}); }
                100% { transform: translateX(${isReverse ? '0%' : '-50%'}); }
              }
              .${animId} .nf-mq-track {
                display: inline-flex;
                align-items: center;
                animation: ${keyframeName} ${speedSec}s linear infinite;
                will-change: transform;
                gap: ${itemGap}px;
              }
              ${pauseOnHover ? `.${animId}:hover .nf-mq-track { animation-play-state: paused; }` : ''}
              ${effectCss}
            `}</style>

            <div className="nf-mq-track">
              {mode === 'logos' ? (
                logoLoop.map((logo: any, idx: number) => {
                  const hasSvg = Boolean(logo.svg && logo.svg.trim().startsWith('<'));
                  const logoItemNode = (
                    <div
                      className="nf-mq-item"
                      title={logo.name || ''}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: autoHeight ? logoHeightStr : undefined,
                        width: logoWidthStr !== 'auto' ? logoWidthStr : undefined,
                        flexShrink: 0
                      }}
                    >
                      {hasSvg ? (
                        <div
                          style={{
                            height: logoHeightStr,
                            maxHeight: '100%',
                            width: logoWidthStr !== 'auto' ? logoWidthStr : 'auto',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                          dangerouslySetInnerHTML={{
                            __html: logo.svg.replace(
                              /<svg(\s|>)/i,
                              `<svg style="height:${logoHeightStr};max-height:100%;width:auto;max-width:100%;display:block;"$1`
                            )
                          }}
                        />
                      ) : logo.url ? (
                        <img
                          src={logo.url}
                          alt={logo.name || 'Brand Logo'}
                          style={{
                            height: autoHeight ? logoHeightStr : undefined,
                            maxHeight: '100%',
                            width: logoWidthStr !== 'auto' ? logoWidthStr : 'auto',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '6px', background: '#f1f5f9', color: '#475569' }}>
                          {logo.name || 'Logo'}
                        </span>
                      )}
                    </div>
                  );

                  if (logo.link && logo.link.trim()) {
                    return (
                      <a
                        key={idx}
                        href={logo.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={logo.name ? `${logo.name} (${logo.link})` : logo.link}
                        onClick={(e) => { if (isEditor) e.preventDefault(); }}
                        style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
                      >
                        {logoItemNode}
                      </a>
                    );
                  }

                  return <React.Fragment key={idx}>{logoItemNode}</React.Fragment>;
                })
              ) : (
                textLoop.map((item, idx) => (
                  <span key={idx} className="nf-mq-item" style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ padding: '0 8px' }}>{item}</span>
                    {mqSep ? <span style={{ opacity: 0.6, marginLeft: `${Math.round(itemGap / 2)}px` }}>{mqSep}</span> : null}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      }

      // 28. PROCESS STEPS ("How it works")
      case 'processsteps': {
        const steps: any[] = content.steps && content.steps.length > 0
          ? content.steps
          : [
              { iconName: 'search', title: 'Discover', description: 'Tell us your goals.' },
              { iconName: 'sliders', title: 'Design & Build', description: 'We build your solution.' },
              { iconName: 'rocket', title: 'Launch & Grow', description: 'Go live and keep improving.' }
            ];
        const psAccent = styles.iconColor || '#6366f1';
        return (
          <div
            style={{
              backgroundColor: styles.bgColor || undefined,
              backgroundImage: styles.bgGradient || undefined,
              color: styles.color || '#0f172a',
              fontFamily: styles.fontFamily || undefined,
              borderRadius: normalizeUnit(styles.borderRadius) || '16px',
              boxShadow: styles.shadow || undefined,
              paddingTop: normalizeUnit(styles.paddingTop) || '20px',
              paddingBottom: normalizeUnit(styles.paddingBottom) || '20px',
              paddingLeft: normalizeUnit(styles.paddingLeft) || '20px',
              paddingRight: normalizeUnit(styles.paddingRight) || '20px',
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(steps.length, 1)}, minmax(0, 1fr))`, gap: normalizeUnit(styles.gap) || '20px', position: 'relative' }}>
              {steps.length > 1 && (
                <div style={{ position: 'absolute', top: '24px', left: '12%', right: '12%', borderTop: `2px dashed ${psAccent}55`, zIndex: 0 }} />
              )}
              {steps.map((step: any, idx: number) => {
                const StepIcon = getLucideIcon(step.iconName || 'check');
                return (
                  <div key={idx} style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 4px' }}>
                    <div style={{ position: 'relative', width: '48px', height: '48px', margin: '0 auto' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '9999px', backgroundColor: styles.iconBgColor || '#eef2ff', color: psAccent }}>
                        <StepIcon style={{ width: '22px', height: '22px', color: psAccent }} />
                      </span>
                      <span style={{ position: 'absolute', top: '-8px', right: '-10px', fontSize: '20px', fontWeight: 900, color: psAccent, opacity: 0.9, lineHeight: 1 }}>{idx + 1}</span>
                    </div>
                    <h4 style={{ fontSize: normalizeUnit(styles.headingFontSize) || '15px', fontWeight: 700, color: styles.headingColor || styles.color || '#0f172a', margin: '12px 0 4px' }}>{step.title || ''}</h4>
                    <p style={{ fontSize: normalizeUnit(styles.descFontSize) || '12px', color: styles.descColor || '#64748b', lineHeight: 1.55, margin: 0 }}>{step.description || ''}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // 29. SKILL BARS (Interactive, animated loading bars, striped barber pole, shimmer, glowing tips, segmented battery meters)
      case 'skillbar': {
        const bars: any[] = content.bars && content.bars.length > 0
          ? content.bars
          : [
              { label: 'Frontend & UI/UX', percent: 94, tag: 'Expert' },
              { label: 'React / Next.js', percent: 90, tag: 'Advanced' },
              { label: 'TypeScript & Node', percent: 85, tag: 'Proficient' }
            ];

        const defaultBarColor = styles.bgColor || styles.iconColor || '#6366f1';
        const trackBg = content.trackBg || styles.trackBg || '#e2e8f0';
        const barStyle = content.barStyle || 'pill'; // 'pill' | 'rounded' | 'sharp' | 'segmented'
        const barHeight = normalizeUnit(content.barHeight || styles.barHeight) || '10px';
        const percentPosition = content.percentPosition || 'header'; // 'header' | 'floating' | 'inside' | 'badge' | 'hidden'
        const animationType = content.animationType || 'stripes'; // 'none' | 'slide' | 'stripes' | 'shimmer' | 'pulse'
        const animationSpeed = content.animationSpeed || '1.4s';
        const showTipGlow = content.showTipGlow !== false;
        const interactiveHover = content.interactiveHover !== false;
        const fillGradient = content.fillGradient || styles.bgGradient;
        const gapVal = normalizeUnit(styles.gap) || '16px';
        const safeId = String(el.id || 'sb').replace(/[^a-zA-Z0-9_-]/g, '-');

        // Border radius for bar
        const barRadius = barStyle === 'pill' ? '9999px' : barStyle === 'rounded' ? '8px' : '0px';

        return (
          <div
            className={`nf-skillbar-wrap group/skillbar sb-${safeId}`}
            style={{
              color: styles.color || '#0f172a',
              fontFamily: styles.fontFamily || undefined,
              fontSize: normalizeUnit(styles.fontSize) || '13px',
              borderRadius: normalizeUnit(styles.borderRadius) || undefined,
              boxShadow: styles.shadow || undefined,
              paddingTop: normalizeUnit(styles.paddingTop) || '8px',
              paddingBottom: normalizeUnit(styles.paddingBottom) || '8px',
              paddingLeft: normalizeUnit(styles.paddingLeft) || '8px',
              paddingRight: normalizeUnit(styles.paddingRight) || '8px',
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom),
              display: 'flex',
              flexDirection: 'column',
              gap: gapVal
            }}
          >
            {/* Scoped Keyframes for Barber-pole stripes, shimmer, and pulse */}
            <style>{`
              @keyframes kf-sb-stripes-${safeId} {
                0% { background-position: 0 0; }
                100% { background-position: 36px 0; }
              }
              @keyframes kf-sb-shimmer-${safeId} {
                0% { transform: translateX(-150%); }
                100% { transform: translateX(250%); }
              }
              @keyframes kf-sb-pulse-${safeId} {
                0%, 100% { opacity: 0.85; filter: drop-shadow(0 0 3px currentColor); }
                50% { opacity: 1; filter: drop-shadow(0 0 9px currentColor); }
              }
              .sb-${safeId} .sb-animated-stripes {
                background-image: linear-gradient(
                  45deg,
                  rgba(255, 255, 255, 0.22) 25%,
                  transparent 25%,
                  transparent 50%,
                  rgba(255, 255, 255, 0.22) 50%,
                  rgba(255, 255, 255, 0.22) 75%,
                  transparent 75%,
                  transparent
                );
                background-size: 28px 28px;
                animation: kf-sb-stripes-${safeId} ${animationSpeed} linear infinite;
              }
              .sb-${safeId} .sb-animated-shimmer {
                position: absolute;
                inset: 0;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
                animation: kf-sb-shimmer-${safeId} ${animationSpeed} ease-in-out infinite;
                pointer-events: none;
              }
              .sb-${safeId} .sb-animated-pulse {
                animation: kf-sb-pulse-${safeId} 2s ease-in-out infinite;
              }
            `}</style>

            {bars.map((bar: any, idx: number) => {
              const pct = Math.max(0, Math.min(100, Number(bar.percent) ?? 0));
              const itemColor = bar.color || defaultBarColor;
              const isSegmented = barStyle === 'segmented';

              return (
                <div
                  key={idx}
                  className={`nf-skill-item transition-all duration-200 ${interactiveHover ? 'hover:translate-x-1' : ''}`}
                >
                  {/* Skill Header (Label, optional Tag, and Percentage) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontWeight: 600,
                      marginBottom: '6px',
                      fontSize: 'inherit'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{bar.label || 'Skill'}</span>
                      {bar.tag && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 7px',
                            borderRadius: '999px',
                            backgroundColor: `${itemColor}18`,
                            color: itemColor,
                            letterSpacing: '0.02em'
                          }}
                        >
                          {bar.tag}
                        </span>
                      )}
                      {percentPosition === 'badge' && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '1px 8px',
                            borderRadius: '999px',
                            backgroundColor: itemColor,
                            color: '#ffffff'
                          }}
                        >
                          {pct}%
                        </span>
                      )}
                    </div>

                    {percentPosition === 'header' && (
                      <span
                        style={{
                          fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                          color: styles.color || '#0f172a'
                        }}
                      >
                        {pct}%
                      </span>
                    )}
                  </div>

                  {/* The Bar Track */}
                  {isSegmented ? (
                    /* Segmented Battery / Meter Style (10 blocks) */
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(10, 1fr)',
                        gap: '3px',
                        height: barHeight,
                        cursor: 'pointer'
                      }}
                      title="Click segment to adjust percentage"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const newPct = Math.round(Math.max(0, Math.min(100, (clickX / rect.width) * 100)));
                        const nextBars = [...bars];
                        nextBars[idx] = { ...nextBars[idx], percent: newPct };
                        useBuilderStore.getState().updateElementContent(el.id, { bars: nextBars });
                      }}
                    >
                      {Array.from({ length: 10 }).map((_, segIdx) => {
                        const segThreshold = (segIdx + 1) * 10;
                        const isFilled = pct >= segThreshold;
                        return (
                          <div
                            key={segIdx}
                            style={{
                              borderRadius: '3px',
                              backgroundColor: isFilled ? itemColor : trackBg,
                              transition: 'all 0.3s ease',
                              boxShadow: isFilled && showTipGlow && segIdx === Math.floor(pct / 10) - 1 ? `0 0 6px ${itemColor}` : undefined
                            }}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    /* Continuous Progress Bar */
                    <div
                      style={{
                        height: barHeight,
                        borderRadius: barRadius,
                        backgroundColor: trackBg,
                        overflow: percentPosition === 'floating' ? 'visible' : 'hidden',
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                      title="Click on bar to adjust percentage"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const newPct = Math.round(Math.max(0, Math.min(100, (clickX / rect.width) * 100)));
                        const nextBars = [...bars];
                        nextBars[idx] = { ...nextBars[idx], percent: newPct };
                        useBuilderStore.getState().updateElementContent(el.id, { bars: nextBars });
                      }}
                    >
                      {/* Filled Progress Bar */}
                      <div
                        className={`${animationType === 'stripes' ? 'sb-animated-stripes' : ''} ${animationType === 'pulse' ? 'sb-animated-pulse' : ''}`}
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          borderRadius: barRadius,
                          backgroundColor: itemColor,
                          backgroundImage: fillGradient || undefined,
                          position: 'relative',
                          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          boxShadow: interactiveHover ? `0 2px 8px ${itemColor}44` : undefined
                        }}
                      >
                        {/* Shimmer sweep animation overlay */}
                        {animationType === 'shimmer' && <div className="sb-animated-shimmer" />}

                        {/* Tip Glow Bulb */}
                        {showTipGlow && pct > 0 && pct < 100 && (
                          <span
                            style={{
                              position: 'absolute',
                              right: '-2px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '6px',
                              height: '6px',
                              borderRadius: '9999px',
                              backgroundColor: '#ffffff',
                              boxShadow: `0 0 8px 2px ${itemColor}, 0 0 4px #ffffff`,
                              pointerEvents: 'none'
                            }}
                          />
                        )}

                        {/* Inside Bar Percentage */}
                        {percentPosition === 'inside' && pct >= 12 && (
                          <span
                            style={{
                              paddingRight: '8px',
                              fontSize: '10px',
                              fontWeight: 800,
                              color: '#ffffff',
                              lineHeight: 1,
                              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                              userSelect: 'none'
                            }}
                          >
                            {pct}%
                          </span>
                        )}

                        {/* Floating Tooltip Pill */}
                        {percentPosition === 'floating' && (
                          <div
                            style={{
                              position: 'absolute',
                              right: '0',
                              top: '-26px',
                              transform: 'translateX(50%)',
                              backgroundColor: itemColor,
                              color: '#ffffff',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: '6px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                              pointerEvents: 'none',
                              whiteSpace: 'nowrap',
                              zIndex: 10
                            }}
                          >
                            {pct}%
                            <div
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 0,
                                height: 0,
                                borderLeft: '4px solid transparent',
                                borderRight: '4px solid transparent',
                                borderTop: `4px solid ${itemColor}`
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      // 30. COUNTDOWN TIMER (value computed at render time)
      case 'countdown': {
        const targetMs = content.targetDate ? new Date(content.targetDate).getTime() : NaN;
        const diffMs = isNaN(targetMs) ? 0 : targetMs - Date.now();
        const cdLabels = content.labels || { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' };
        const cdAccent = styles.iconColor || '#6366f1';
        if (!isNaN(targetMs) && diffMs <= 0) {
          return (
            <div style={{ backgroundColor: styles.bgColor || '#0f172a', backgroundImage: styles.bgGradient || undefined, color: styles.color || '#ffffff', borderRadius: normalizeUnit(styles.borderRadius) || '16px', boxShadow: styles.shadow || undefined, padding: '24px', textAlign: 'center', fontWeight: 700, fontSize: normalizeUnit(styles.fontSize) || '16px', marginTop: normalizeUnit(styles.marginTop), marginBottom: normalizeUnit(styles.marginBottom) }}>
              {content.finishedText || 'The offer has ended'}
            </div>
          );
        }
        const cdVals = [
          { v: Math.floor(diffMs / 86400000), l: cdLabels.days || 'Days' },
          { v: Math.floor(diffMs / 3600000) % 24, l: cdLabels.hours || 'Hours' },
          { v: Math.floor(diffMs / 60000) % 60, l: cdLabels.minutes || 'Minutes' },
          { v: Math.floor(diffMs / 1000) % 60, l: cdLabels.seconds || 'Seconds' }
        ];
        return (
          <div
            data-nf-countdown-canvas="true"
            style={{
              backgroundColor: styles.bgColor || '#0f172a',
              backgroundImage: styles.bgGradient || undefined,
              color: styles.color || '#ffffff',
              fontFamily: styles.fontFamily || undefined,
              borderRadius: normalizeUnit(styles.borderRadius) || '16px',
              boxShadow: styles.shadow || undefined,
              paddingTop: normalizeUnit(styles.paddingTop) || '20px',
              paddingBottom: normalizeUnit(styles.paddingBottom) || '20px',
              paddingLeft: normalizeUnit(styles.paddingLeft) || '20px',
              paddingRight: normalizeUnit(styles.paddingRight) || '20px',
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom),
              display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap'
            }}
          >
            {cdVals.map((part, idx) => (
              <div key={idx} style={{ minWidth: '72px', textAlign: 'center', backgroundColor: cdAccent, borderRadius: '12px', padding: '12px 10px' }}>
                <div style={{ fontSize: normalizeUnit(styles.fontSize) || '28px', fontWeight: 800, lineHeight: 1 }}>{String(part.v).padStart(2, '0')}</div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, marginTop: '4px' }}>{part.l}</div>
              </div>
            ))}
          </div>
        );
      }

      // 31. SOCIAL ICONS
      case 'socialicons': {
        // iconRegistry has NO brand icons, so each network maps to the
        // closest generic lucide icon available there (see report).
        const socialIconFor = (network?: string): string => {
          const n = String(network || '').toLowerCase();
          if (n.includes('instagram')) return 'camera';
          if (n.includes('youtube')) return 'play';
          if (n.includes('twitter') || n === 'x' || n.includes('x.com')) return 'atsign';
          if (n.includes('github')) return 'gitbranch';
          if (n.includes('linkedin')) return 'briefcase';
          if (n.includes('facebook')) return 'thumbsup';
          if (n.includes('tiktok')) return 'music';
          if (n.includes('mail') || n.includes('email')) return 'mail';
          if (n.includes('web') || n.includes('globe') || n.includes('site')) return 'globe';
          return 'share2';
        };
        const links: any[] = content.links && content.links.length > 0
          ? content.links
          : [{ network: 'website', url: 'https://example.com/' }];
        const chipBg = styles.iconBgColor || styles.bgColor || '#6366f1';
        const chipColor = styles.iconColor || '#ffffff';
        return (
          <div
            style={{
              display: 'flex', gap: normalizeUnit(styles.gap) || '10px', flexWrap: 'wrap',
              justifyContent: styles.textAlign === 'center' ? 'center' : styles.textAlign === 'right' ? 'flex-end' : 'flex-start',
              paddingTop: normalizeUnit(styles.paddingTop) || '8px',
              paddingBottom: normalizeUnit(styles.paddingBottom) || '8px',
              paddingLeft: normalizeUnit(styles.paddingLeft) || '8px',
              paddingRight: normalizeUnit(styles.paddingRight) || '8px',
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
          >
            {links.map((link: any, idx: number) => {
              const NetIcon = getLucideIcon(socialIconFor(link.network));
              return (
                <a
                  key={idx}
                  href={link.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.network || 'Social link'}
                  data-network={link.network || ''}
                  onClick={(e) => { if (isEditor) e.preventDefault(); }}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: normalizeUnit(styles.iconBorderRadius) || '9999px', backgroundColor: chipBg, backgroundImage: styles.bgGradient || undefined, color: chipColor, boxShadow: styles.shadow || undefined, textDecoration: 'none' }}
                >
                  <NetIcon style={{ width: normalizeUnit(styles.iconSize) || '18px', height: normalizeUnit(styles.iconSize) || '18px', color: chipColor }} />
                </a>
              );
            })}
          </div>
        );
      }

      // 32. RATING (stars)
      case 'rating': {
        const rValue = Math.max(0, Math.min(5, Number(content.value !== undefined ? content.value : 5) || 0));
        const filledCount = Math.round(rValue);
        const starColor = styles.iconColor || '#f59e0b';
        return (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
              justifyContent: styles.textAlign === 'center' ? 'center' : styles.textAlign === 'right' ? 'flex-end' : 'flex-start',
              color: styles.color || '#0f172a',
              fontFamily: styles.fontFamily || undefined,
              fontSize: normalizeUnit(styles.fontSize) || '14px',
              backgroundColor: styles.bgColor || undefined,
              backgroundImage: styles.bgGradient || undefined,
              borderRadius: normalizeUnit(styles.borderRadius) || undefined,
              boxShadow: styles.shadow || undefined,
              paddingTop: normalizeUnit(styles.paddingTop) || '8px',
              paddingBottom: normalizeUnit(styles.paddingBottom) || '8px',
              paddingLeft: normalizeUnit(styles.paddingLeft) || '8px',
              paddingRight: normalizeUnit(styles.paddingRight) || '8px',
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom)
            }}
            aria-label={`Rating: ${rValue} out of 5`}
          >
            <span style={{ display: 'inline-flex', gap: '2px' }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} style={{ width: '20px', height: '20px', color: starColor }} fill={i < filledCount ? starColor : 'none'} />
              ))}
            </span>
            {content.count ? <span style={{ fontWeight: 600 }}>{content.count}</span> : null}
          </div>
        );
      }

      // 33. TIMELINE (7 Themes, custom spine lines, marker dots, pulsing glow, milestone cards)
      case 'timeline': {
        const tlTheme = content.timelineTheme || 'modern';
        const tlItems: any[] = content.items && content.items.length > 0
          ? content.items
          : [
              { date: 'Jan 2024', title: 'Project Kickoff', description: 'Product architecture & research complete.', tag: 'Phase 1' },
              { date: 'Jun 2024', title: 'Beta Release', description: 'Shipped edge runtime to early testers.', tag: 'Milestone' },
              { date: 'Dec 2024', title: 'Global Launch', description: '1.0 general availability worldwide.', tag: 'Live' }
            ];

        const tlAccent = styles.lineColor || styles.iconColor || '#6366f1';
        const lineWidth = styles.lineWidth || '2px';
        const lineStyle = styles.lineStyle || 'solid';
        const dotColor = styles.dotColor || tlAccent;
        const dotSize = styles.dotSize || '14px';
        const dotShape = styles.dotShape || 'circle';
        const pulseDots = content.pulseDots !== false;

        const dateColor = styles.dateColor || (tlTheme === 'neon' ? '#38bdf8' : tlAccent);
        const tagColor = styles.tagColor || tlAccent;
        const tagBgColor = styles.tagBgColor || `${tlAccent}18`;
        const textAlignVal = styles.textAlign || 'left';
        const textShadowVal = styles.textShadow || undefined;
        const dateFontSize = normalizeUnit(styles.dateFontSize) || '11px';
        const tagFontSize = normalizeUnit(styles.tagFontSize) || '10px';

        const headerJustify = textAlignVal === 'center'
          ? 'center'
          : textAlignVal === 'right'
          ? 'flex-end'
          : textAlignVal === 'justify'
          ? 'space-between'
          : 'flex-start';

        const cardBg = styles.cardBgColor || (tlTheme === 'neon' ? '#090d16' : tlTheme === 'glassmorphism' ? 'rgba(255,255,255,0.7)' : '#f8fafc');
        const cardBorder = styles.cardBorderColor || (tlTheme === 'neon' ? `${tlAccent}55` : tlTheme === 'glassmorphism' ? 'rgba(255,255,255,0.3)' : '#e2e8f0');
        const cardRadius = normalizeUnit(styles.cardBorderRadius) || '14px';
        const tlGap = normalizeUnit(styles.gap) || '24px';

        const dotRadius = dotShape === 'circle' ? '9999px' : dotShape === 'square' ? '3px' : '2px';
        const dotTransform = dotShape === 'diamond' ? 'rotate(45deg)' : undefined;
        const pulseAnimId = `tl-pulse-${String(el.id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;

        return (
          <div
            className={`nf-timeline nf-timeline-${tlTheme} ${pulseAnimId}`}
            style={{
              backgroundColor: styles.bgColor || undefined,
              backgroundImage: styles.bgGradient || undefined,
              color: styles.color || (tlTheme === 'neon' ? '#f8fafc' : '#0f172a'),
              fontFamily: styles.fontFamily || undefined,
              borderRadius: normalizeUnit(styles.borderRadius) || '16px',
              boxShadow: styles.shadow || undefined,
              textAlign: textAlignVal,
              paddingTop: normalizeUnit(styles.paddingTop) || '20px',
              paddingBottom: normalizeUnit(styles.paddingBottom) || '20px',
              paddingLeft: normalizeUnit(styles.paddingLeft) || '20px',
              paddingRight: normalizeUnit(styles.paddingRight) || '20px',
              marginTop: normalizeUnit(styles.marginTop),
              marginBottom: normalizeUnit(styles.marginBottom),
              position: 'relative'
            }}
          >
            {pulseDots && (
              <style>{`
                @keyframes kf-${pulseAnimId} {
                  0%, 100% { box-shadow: 0 0 0 0 ${dotColor}66; }
                  50% { box-shadow: 0 0 0 7px ${dotColor}00; }
                }
                .${pulseAnimId} .nf-tl-dot-pulse {
                  animation: kf-${pulseAnimId} 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
              `}</style>
            )}

            {/* Alternating Zigzag Theme */}
            {tlTheme === 'alternating' ? (
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: tlGap }}>
                {/* Center spine line */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: lineWidth,
                    borderLeft: `${lineWidth} ${lineStyle} ${tlAccent}`,
                    zIndex: 0
                  }}
                />
                {tlItems.map((item: any, idx: number) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        alignItems: 'center',
                        zIndex: 1
                      }}
                    >
                      {/* Left side */}
                      <div style={{ paddingRight: isEven ? '24px' : '0', textAlign: isEven ? 'right' : textAlignVal }}>
                        {isEven && (
                          <div
                            style={{
                              backgroundColor: cardBg,
                              border: `1px solid ${cardBorder}`,
                              borderRadius: cardRadius,
                              padding: '14px 18px',
                              boxShadow: styles.shadow || '0 4px 12px rgba(0,0,0,0.03)',
                              textAlign: 'right'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '4px' }}>
                              {item.tag && (
                                <span style={{ fontSize: tagFontSize, fontWeight: 800, padding: '2px 8px', borderRadius: '999px', backgroundColor: tagBgColor, color: tagColor, textShadow: textShadowVal }}>
                                  {item.tag}
                                </span>
                              )}
                              <span style={{ fontSize: dateFontSize, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: dateColor, textShadow: textShadowVal }}>
                                {item.date || ''}
                              </span>
                            </div>
                            <h4 style={{ fontSize: normalizeUnit(styles.headingFontSize || styles.fontSize) || '15px', fontWeight: styles.fontWeight || 700, color: styles.headingColor || styles.color || '#0f172a', margin: '2px 0 4px', textAlign: 'right', textShadow: textShadowVal }}>
                              {item.title || ''}
                            </h4>
                            <p style={{ fontSize: normalizeUnit(styles.descFontSize) || '13px', color: styles.descColor || '#64748b', lineHeight: 1.55, margin: 0, textAlign: 'right', textShadow: textShadowVal }}>
                              {item.description || ''}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Middle dot */}
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '28px' }}>
                        <span
                          className={pulseDots ? 'nf-tl-dot-pulse' : ''}
                          style={{
                            width: dotSize,
                            height: dotSize,
                            borderRadius: dotRadius,
                            transform: dotTransform,
                            backgroundColor: dotColor,
                            border: '2px solid #ffffff',
                            boxShadow: `0 0 0 2px ${dotColor}55`,
                            flexShrink: 0
                          }}
                        />
                      </div>

                      {/* Right side */}
                      <div style={{ paddingLeft: !isEven ? '24px' : '0', textAlign: !isEven ? textAlignVal : 'left' }}>
                        {!isEven && (
                          <div
                            style={{
                              backgroundColor: cardBg,
                              border: `1px solid ${cardBorder}`,
                              borderRadius: cardRadius,
                              padding: '14px 18px',
                              boxShadow: styles.shadow || '0 4px 12px rgba(0,0,0,0.03)',
                              textAlign: textAlignVal
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: headerJustify, width: '100%', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: dateFontSize, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: dateColor, textShadow: textShadowVal }}>
                                {item.date || ''}
                              </span>
                              {item.tag && (
                                <span style={{ fontSize: tagFontSize, fontWeight: 800, padding: '2px 8px', borderRadius: '999px', backgroundColor: tagBgColor, color: tagColor, textShadow: textShadowVal }}>
                                  {item.tag}
                                </span>
                              )}
                            </div>
                            <h4 style={{ fontSize: normalizeUnit(styles.headingFontSize || styles.fontSize) || '15px', fontWeight: styles.fontWeight || 700, color: styles.headingColor || styles.color || '#0f172a', margin: '2px 0 4px', textAlign: textAlignVal, textShadow: textShadowVal }}>
                              {item.title || ''}
                            </h4>
                            <p style={{ fontSize: normalizeUnit(styles.descFontSize) || '13px', color: styles.descColor || '#64748b', lineHeight: 1.55, margin: 0, textAlign: textAlignVal, textAlignLast: textAlignVal === 'justify' ? 'justify' : undefined, textJustify: 'inter-word', textShadow: textShadowVal }}>
                              {item.description || ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Left-Spine Themes: modern, card, minimal, glassmorphism, neon, badge-pill */
              <div style={{ position: 'relative' }}>
                {/* Left spine line */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    bottom: '12px',
                    left: tlTheme === 'minimal' ? '7px' : '11px',
                    width: lineWidth,
                    borderLeft: `${lineWidth} ${lineStyle} ${tlAccent}`,
                    boxShadow: tlTheme === 'neon' ? `0 0 10px ${tlAccent}` : undefined,
                    zIndex: 0
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: tlGap }}>
                  {tlItems.map((item: any, idx: number) => {
                    const isCardLike = tlTheme === 'card' || tlTheme === 'glassmorphism' || tlTheme === 'neon';
                    return (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          paddingLeft: tlTheme === 'minimal' ? '28px' : '36px',
                          zIndex: 1
                        }}
                      >
                        {/* Dot marker */}
                        <span
                          className={pulseDots ? 'nf-tl-dot-pulse' : ''}
                          style={{
                            position: 'absolute',
                            left: tlTheme === 'minimal' ? '2px' : '5px',
                            top: isCardLike ? '16px' : '4px',
                            width: dotSize,
                            height: dotSize,
                            borderRadius: dotRadius,
                            transform: dotTransform,
                            backgroundColor: dotColor,
                            border: tlTheme === 'neon' ? `2px solid ${dotColor}` : '2px solid #ffffff',
                            boxShadow: tlTheme === 'neon' ? `0 0 12px ${dotColor}, 0 0 4px ${dotColor}` : `0 0 0 2px ${dotColor}55`,
                            zIndex: 2
                          }}
                        />

                        {/* Content Container */}
                        <div
                          style={{
                            backgroundColor: isCardLike ? cardBg : undefined,
                            backdropFilter: tlTheme === 'glassmorphism' ? 'blur(12px)' : undefined,
                            WebkitBackdropFilter: tlTheme === 'glassmorphism' ? 'blur(12px)' : undefined,
                            border: isCardLike ? `1px solid ${cardBorder}` : undefined,
                            borderRadius: isCardLike ? cardRadius : undefined,
                            padding: isCardLike ? '16px 20px' : '0',
                            boxShadow: isCardLike ? (styles.shadow || (tlTheme === 'neon' ? `0 0 16px ${tlAccent}15` : '0 4px 16px rgba(0,0,0,0.03)')) : (styles.shadow || undefined),
                            textAlign: textAlignVal
                          }}
                        >
                          {/* Header / Date / Tag */}
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '4px', justifyContent: headerJustify, width: '100%' }}>
                            {tlTheme === 'badge-pill' ? (
                              <span
                                style={{
                                  fontSize: dateFontSize,
                                  fontWeight: 800,
                                  padding: '3px 10px',
                                  borderRadius: '999px',
                                  backgroundColor: dateColor,
                                  color: '#ffffff',
                                  letterSpacing: '0.04em',
                                  textShadow: textShadowVal
                                }}
                              >
                                {item.date || ''}
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: dateFontSize,
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
                                  color: dateColor,
                                  textShadow: textShadowVal
                                }}
                              >
                                {item.date || ''}
                              </span>
                            )}

                            {item.tag && (
                              <span
                                style={{
                                  fontSize: tagFontSize,
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  backgroundColor: tagBgColor,
                                  color: tagColor,
                                  textShadow: textShadowVal
                                }}
                              >
                                {item.tag}
                              </span>
                            )}
                          </div>

                          <h4
                            style={{
                              fontSize: normalizeUnit(styles.headingFontSize || styles.fontSize) || '15px',
                              fontWeight: styles.fontWeight || 700,
                              color: styles.headingColor || styles.color || (tlTheme === 'neon' ? '#ffffff' : '#0f172a'),
                              margin: '2px 0 4px',
                              textAlign: textAlignVal,
                              textShadow: textShadowVal
                            }}
                          >
                            {item.title || ''}
                          </h4>

                          <p
                            style={{
                              fontSize: normalizeUnit(styles.descFontSize) || '13px',
                              color: styles.descColor || (tlTheme === 'neon' ? '#94a3b8' : '#64748b'),
                              lineHeight: 1.55,
                              margin: 0,
                              textAlign: textAlignVal,
                              textAlignLast: textAlignVal === 'justify' ? 'justify' : undefined,
                              textJustify: 'inter-word',
                              textShadow: textShadowVal
                            }}
                          >
                            {item.description || ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'typewriterheadline': {
        return <TypewriterHeadlineElement el={el} isPreview={!isEditor} />;
      }

      case 'lottie': {
        return <LottieAnimationElement el={el} isPreview={!isEditor} />;
      }

      default: {
        return (
          <div
            className="p-4 rounded-xl border border-dashed border-slate-300 bg-white/80 text-slate-700 text-xs flex items-center space-x-2 transition-all"
            style={commonStyle}
          >
            <Box className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold">{content.text || `${el.label} Element`}</span>
          </div>
        );
      }
    }
  };

  const elAlign = styles.align || content.align || 'center';
  const hasCustomWidth = styles.widthType === 'custom' || Boolean(styles.customWidth);
  const elWidth = styles.width ? normalizeUnit(styles.width) : (styles.widthType === 'custom' && styles.customWidth ? normalizeUnit(styles.customWidth) : undefined);
  const elMaxWidth = styles.widthType === 'boxed' ? '1180px' : (styles.maxWidth ? normalizeUnit(styles.maxWidth) : undefined);

  let elMarginLeft = normalizeUnit(styles.marginLeft);
  let elMarginRight = normalizeUnit(styles.marginRight);

  if (hasCustomWidth || elWidth || elMaxWidth || (styles.widthType && styles.widthType !== 'screen')) {
    if (elAlign === 'center') {
      elMarginLeft = 'auto';
      elMarginRight = 'auto';
    } else if (elAlign === 'left') {
      elMarginLeft = normalizeUnit(styles.marginLeft) || '0px';
      elMarginRight = 'auto';
    } else if (elAlign === 'right') {
      elMarginLeft = 'auto';
      elMarginRight = normalizeUnit(styles.marginRight) || '0px';
    }
  }

  const elementWrapperStyle: React.CSSProperties = {
    fontFamily: styles.fontFamily || undefined,
    textTransform: (styles.textTransform || (content as any)?.textTransform || undefined) as any,
    letterSpacing: normalizeUnit(styles.letterSpacing),
    lineHeight: normalizeUnit(styles.lineHeight),
    width: elWidth || (elMaxWidth ? '100%' : undefined),
    maxWidth: elMaxWidth,
    marginLeft: elMarginLeft,
    marginRight: elMarginRight,
    zIndex: styles.zIndex !== undefined && styles.zIndex !== '' ? Number(styles.zIndex) || styles.zIndex : undefined,
  };

  // Generic hover keys (hoverColor / hoverBgColor / hoverBorderColor /
  // hoverShadow / hoverScale) for non-button elements. These are written by
  // the AI site generator and presets (e.g. cards with hoverScale 1.03 + a
  // lift shadow) but were previously ignored by every card renderer; buttons
  // have their own dedicated hover system in InteractiveButtonElement.
  const hasGenericHover = el.type !== 'button' && Boolean(
    styles.hoverColor || styles.hoverBgColor || styles.hoverBorderColor || styles.hoverShadow ||
    (styles.hoverScale !== undefined && styles.hoverScale !== '' && styles.hoverScale !== null)
  );
  const hoverClass = hasGenericHover ? `nfh-${String(el.id).replace(/[^a-zA-Z0-9_-]/g, '-')}` : '';
  const hoverCss = hasGenericHover
    ? (() => {
        const decls: string[] = [];
        if (styles.hoverColor) decls.push(`color: ${styles.hoverColor} !important;`);
        if (styles.hoverBgColor) decls.push(`background-color: ${styles.hoverBgColor} !important;`);
        if (styles.hoverBorderColor) decls.push(`border-color: ${styles.hoverBorderColor} !important;`);
        if (styles.hoverShadow) decls.push(`box-shadow: ${styles.hoverShadow} !important;`);
        if (styles.hoverScale !== undefined && styles.hoverScale !== '' && styles.hoverScale !== null) {
          const hs = String(styles.hoverScale);
          decls.push(`transform: ${hs.includes('scale') ? hs : `scale(${hs})`} !important;`);
        }
        return `.${hoverClass} > :not(style) { transition: box-shadow 0.3s ease, transform 0.3s ease, background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease; } .${hoverClass}:hover > :not(style) { ${decls.join(' ')} }`;
      })()
    : '';

  const scrollRevealAttr = styles.scrollReveal && styles.scrollReveal !== 'none' ? styles.scrollReveal : undefined;
  const parallaxAttr = styles.parallaxSpeed && styles.parallaxSpeed !== 'none' ? styles.parallaxSpeed : undefined;

  if (!isEditor) {
    return (
      <div
        className={`w-full ${hoverClass} ${scrollRevealAttr ? `nf-reveal nf-reveal-${scrollRevealAttr}` : ''} ${parallaxAttr ? 'nf-parallax' : ''}`}
        style={elementWrapperStyle}
        data-nf-reveal={scrollRevealAttr}
        data-nf-reveal-delay={styles.scrollRevealDelay}
        data-nf-reveal-duration={styles.scrollRevealDuration}
        data-nf-parallax={parallaxAttr}
      >
        {renderInner()}
        {hoverCss ? <style>{hoverCss}</style> : null}
      </div>
    );
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      data-label={el.label}
      data-nf-reveal={scrollRevealAttr}
      data-nf-parallax={parallaxAttr}
      className={`w-full relative transition-all cursor-pointer rounded-xl ${hoverClass} ${
        isSelected ? 'nextforge-canvas-selected' : 'hover:nextforge-canvas-hover'
      }`}
      style={elementWrapperStyle}
    >
      {/* Active Element Badge in Top Right */}
      {isSelected && (
        <div className="absolute top-1 right-2 z-40 bg-indigo-600 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide shadow-xs">
          {el.type}
        </div>
      )}
      {renderInner()}
      {hoverCss ? <style>{hoverCss}</style> : null}
    </div>
  );
}
