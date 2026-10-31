// NextForge Builder - Production Code & Static Site Generator
// Supports: cPanel Shared Hosting (HTML/CSS/JS/.htaccess), Vercel, Netlify, Cloudflare Pages, Next.js 14 App Router

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PageModel, SectionModel, RowModel, ColumnModel, ElementModel, ElementStyles } from '../types/builder';
import JSZip from 'jszip';
import { getLucideIcon } from '../components/editor/iconRegistry';
import { applyShadowColor } from '../components/editor/ElementRenderer';
import { parseVideoUrl, getClipPathForShape, getVideoOverlayCss } from './videoUtils';

// Helper to normalize CSS unit values (e.g. 20 -> '20px')
export function normalizeCssVal(val?: string | number): string {
  if (val === undefined || val === null || val === '') return '';
  const s = String(val).trim();
  if (/^-?[0-9]+(\.[0-9]+)?$/.test(s)) return `${s}px`;
  return s;
}

// Convert camelCase CSS style object to inline CSS string
export function styleObjectToCss(styles: Record<string, any>): string {
  return Object.entries(styles)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => {
      const kebab = k.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebab}: ${v};`;
    })
    .join(' ');
}

// Section layout styles calculator (100% matched with ElementRenderer & CanvasWorkspace)
export function getSectionLayoutStyles(styles?: ElementStyles) {
  const isScreen = styles?.widthType === 'screen';
  const isCustom = styles?.widthType === 'custom';

  const rawTop = styles?.marginTop;
  const rawBottom = styles?.marginBottom;
  const rawLeft = styles?.marginLeft;
  const rawRight = styles?.marginRight;

  const numLeft = rawLeft !== undefined && rawLeft !== '' ? parseInt(String(rawLeft), 10) || 0 : 0;
  const numRight = rawRight !== undefined && rawRight !== '' ? parseInt(String(rawRight), 10) || 0 : 0;

  const normTop = normalizeCssVal(rawTop) || '0px';
  const normBottom = normalizeCssVal(rawBottom) || '0px';

  const sectionAlign = styles?.sectionAlign || 'center';
  const totalHMargin = numLeft + numRight;

  let marginLeft = 'auto';
  let marginRight = 'auto';

  if (isScreen && totalHMargin === 0) {
    marginLeft = '0px';
    marginRight = '0px';
  } else if (sectionAlign === 'left') {
    marginLeft = numLeft > 0 ? `${numLeft}px` : '0px';
    marginRight = 'auto';
  } else if (sectionAlign === 'right') {
    marginLeft = 'auto';
    marginRight = numRight > 0 ? `${numRight}px` : '0px';
  } else {
    if (numLeft > 0 && numRight > 0 && numLeft !== numRight) {
      marginLeft = `${numLeft}px`;
      marginRight = `${numRight}px`;
    } else {
      marginLeft = 'auto';
      marginRight = 'auto';
    }
  }

  let width = '100%';
  let maxWidth: string | undefined = undefined;

  if (isScreen) {
    width = totalHMargin > 0 ? `calc(100% - ${totalHMargin}px)` : '100%';
    maxWidth = 'none';
  } else if (isCustom) {
    const pct = styles?.customWidth
      ? (styles.customWidth.includes('%') || styles.customWidth.includes('px') ? styles.customWidth : `${styles.customWidth}%`)
      : '80%';
    width = totalHMargin > 0 ? `calc(${pct} - ${totalHMargin}px)` : pct;
    maxWidth = '100%';
  } else {
    // Boxed (1180px default)
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
    maxWidth
  };
}

// Inline SVG Icon Provider for Lucide Icons
export function getSvgIcon(name?: string, size = 18, color = 'currentColor', className = ''): string {
  const n = (name || '').toLowerCase().trim();
  const base = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}" style="display:inline-block;vertical-align:middle;"`;

  switch (n) {
    case 'moon':
      return `<svg ${base}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    case 'sun':
      return `<svg ${base}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
    case 'shield':
      return `<svg ${base}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`;
    case 'shieldcheck':
    case 'shield-check':
      return `<svg ${base}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`;
    case 'star':
      return `<svg ${base} fill="${color}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    case 'sparkles':
      return `<svg ${base}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/></svg>`;
    case 'zap':
      return `<svg ${base}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
    case 'check':
      return `<svg ${base}><polyline points="20 6 9 17 4 12"/></svg>`;
    case 'arrowright':
    case 'arrow-right':
      return `<svg ${base}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
    case 'arrowleft':
    case 'arrow-left':
      return `<svg ${base}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`;
    case 'chevronright':
    case 'chevron-right':
      return `<svg ${base}><polyline points="9 18 15 12 9 6"/></svg>`;
    case 'chevronleft':
    case 'chevron-left':
      return `<svg ${base}><polyline points="15 18 9 12 15 6"/></svg>`;
    case 'chevrondown':
    case 'chevron-down':
      return `<svg ${base}><polyline points="6 9 12 15 18 9"/></svg>`;
    case 'chevronup':
    case 'chevron-up':
      return `<svg ${base}><polyline points="18 15 12 9 6 15"/></svg>`;
    case 'moveleft':
    case 'move-left':
      return `<svg ${base}><path d="M6 8L2 12L6 16"/><path d="M2 12H22"/></svg>`;
    case 'moveright':
    case 'move-right':
      return `<svg ${base}><path d="M18 8L22 12L18 16"/><path d="M2 12H22"/></svg>`;
    case 'info':
      return `<svg ${base}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    case 'play':
      return `<svg ${base} fill="${color}"><polygon points="6 3 20 12 6 21 6 3"/></svg>`;
    case 'mail':
      return `<svg ${base}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
    case 'phone':
      return `<svg ${base}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
    case 'mappin':
      return `<svg ${base}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;
    case 'clock':
      return `<svg ${base}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
    case 'rocket':
      return `<svg ${base}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>`;
    case 'heart':
      return `<svg ${base} fill="${color}"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
    case 'flame':
      return `<svg ${base}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
  }

  // 2. Dynamic Lucide registry lookup for custom Lucide icons
  if (name) {
    try {
      const IconComponent = getLucideIcon(name);
      if (IconComponent) {
        return renderToStaticMarkup(
          React.createElement(IconComponent, {
            size,
            color,
            className: className || undefined,
            strokeWidth: 2,
            style: { display: 'inline-block', verticalAlign: 'middle' }
          })
        );
      }
    } catch {
      // fallback to circle below
    }
  }

  return `<svg ${base}><circle cx="12" cy="12" r="9"/></svg>`;
}

// Generate shared stylesheet with typography, smooth scroll, card flip, and all 14 slide transitions
export function generateSharedCss(): string {
  return `/* NextForge Generated Stylesheet */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
  background-color: #ffffff;
  -webkit-font-smoothing: antialiased;
}

img, video {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  cursor: pointer;
}

/* ==========================================================================
   Slide Transition Effects
   ========================================================================== */
@keyframes nfSlideHorizontal {
  from { opacity: 0; transform: translateX(45px); }
  to { opacity: 1; transform: translateX(0); }
}
.nf-slide-slide-horizontal {
  animation: nfSlideHorizontal var(--slide-duration, 500ms) cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes nfSlideVertical {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
.nf-slide-slide-vertical {
  animation: nfSlideVertical var(--slide-duration, 500ms) cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes nfSlideFade {
  from { opacity: 0; }
  to { opacity: 1; }
}
.nf-slide-fade {
  animation: nfSlideFade var(--slide-duration, 500ms) ease-in-out forwards;
}

@keyframes nfSlideZoomIn {
  from { opacity: 0; transform: scale(0.88); }
  to { opacity: 1; transform: scale(1); }
}
.nf-slide-zoom-in {
  animation: nfSlideZoomIn var(--slide-duration, 500ms) cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes nfSlideZoomOut {
  from { opacity: 0; transform: scale(1.14); }
  to { opacity: 1; transform: scale(1); }
}
.nf-slide-zoom-out {
  animation: nfSlideZoomOut var(--slide-duration, 500ms) cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes nfSlideFlipH {
  from { opacity: 0; transform: perspective(1000px) rotateY(-35deg) scale(0.95); }
  to { opacity: 1; transform: perspective(1000px) rotateY(0deg) scale(1); }
}
.nf-slide-flip-horizontal {
  animation: nfSlideFlipH var(--slide-duration, 600ms) cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes nfSlideFlipV {
  from { opacity: 0; transform: perspective(1000px) rotateX(35deg) scale(0.95); }
  to { opacity: 1; transform: perspective(1000px) rotateX(0deg) scale(1); }
}
.nf-slide-flip-vertical {
  animation: nfSlideFlipV var(--slide-duration, 600ms) cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes nfSlideBlurFade {
  from { opacity: 0; filter: blur(14px); transform: scale(1.04); }
  to { opacity: 1; filter: blur(0px); transform: scale(1); }
}
.nf-slide-blur-fade {
  animation: nfSlideBlurFade var(--slide-duration, 600ms) cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

@keyframes nfSlideRotateFade {
  from { opacity: 0; transform: rotate(-5deg) scale(0.92); }
  to { opacity: 1; transform: rotate(0deg) scale(1); }
}
.nf-slide-rotate-fade {
  animation: nfSlideRotateFade var(--slide-duration, 500ms) cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes nfSlideKenBurns {
  0% { opacity: 0; transform: scale(1); }
  15% { opacity: 1; }
  100% { opacity: 1; transform: scale(1.1) translate(-1.5%, -1%); }
}
.nf-slide-ken-burns {
  animation: nfSlideKenBurns var(--slide-interval-or-duration, 5s) cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

@keyframes nfSlideBounce {
  0% { opacity: 0; transform: scale(0.72) translateY(35px); }
  60% { opacity: 1; transform: scale(1.03) translateY(-4px); }
  80% { transform: scale(0.98) translateY(2px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.nf-slide-bounce-in {
  animation: nfSlideBounce var(--slide-duration, 650ms) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes nfSlideDiagonal {
  from { opacity: 0; transform: translate(35px, 35px); }
  to { opacity: 1; transform: translate(0, 0); }
}
.nf-slide-diagonal-slide {
  animation: nfSlideDiagonal var(--slide-duration, 500ms) cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes nfSlideCurtain {
  from { opacity: 0; clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
  to { opacity: 1; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
}
.nf-slide-curtain {
  animation: nfSlideCurtain var(--slide-duration, 600ms) cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes nfSlideCube3D {
  from { opacity: 0; transform: perspective(1000px) rotateY(45deg) translateZ(-80px); }
  to { opacity: 1; transform: perspective(1000px) rotateY(0deg) translateZ(0); }
}
.nf-slide-cube-3d {
  animation: nfSlideCube3D var(--slide-duration, 650ms) cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* 3D Flip Card */
.flip-card-container {
  perspective: 1000px;
}
.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}
.flip-card-inner.flipped {
  transform: rotateY(180deg);
}
.flip-card-front, .flip-card-back {
  position: absolute;
  inset: 0;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.flip-card-back {
  transform: rotateY(180deg);
}

/* Rich Text Editor Content & Typography */
.nextforge-rich-text {
  word-break: break-word;
  width: 100%;
}
.nextforge-rich-text p,
.nextforge-rich-text div,
.nextforge-rich-text li,
.nextforge-rich-text a {
  text-shadow: inherit;
  text-align: inherit;
}
.nextforge-rich-text span {
  text-shadow: inherit;
}
.nextforge-rich-text mark {
  padding: 1px 4px;
  border-radius: 4px;
}
.nextforge-rich-text[data-align="center"],
.nextforge-rich-text[data-align="center"] p,
.nextforge-rich-text[data-align="center"] div,
.nextforge-rich-text[data-align="center"] h1,
.nextforge-rich-text[data-align="center"] h2,
.nextforge-rich-text[data-align="center"] h3,
.nextforge-rich-text[data-align="center"] h4,
.nextforge-rich-text[data-align="center"] blockquote {
  text-align: center !important;
}
.nextforge-rich-text[data-align="right"],
.nextforge-rich-text[data-align="right"] p,
.nextforge-rich-text[data-align="right"] div,
.nextforge-rich-text[data-align="right"] h1,
.nextforge-rich-text[data-align="right"] h2,
.nextforge-rich-text[data-align="right"] h3,
.nextforge-rich-text[data-align="right"] h4,
.nextforge-rich-text[data-align="right"] blockquote {
  text-align: right !important;
}
.nextforge-rich-text[data-align="justify"],
.nextforge-rich-text[data-align="justify"] p,
.nextforge-rich-text[data-align="justify"] div,
.nextforge-rich-text[data-align="justify"] h1,
.nextforge-rich-text[data-align="justify"] h2,
.nextforge-rich-text[data-align="justify"] h3,
.nextforge-rich-text[data-align="justify"] h4,
.nextforge-rich-text[data-align="justify"] blockquote {
  text-align: justify !important;
}
.nextforge-rich-text[data-align="left"],
.nextforge-rich-text[data-align="left"] p,
.nextforge-rich-text[data-align="left"] div,
.nextforge-rich-text[data-align="left"] h1,
.nextforge-rich-text[data-align="left"] h2,
.nextforge-rich-text[data-align="left"] h3,
.nextforge-rich-text[data-align="left"] h4,
.nextforge-rich-text[data-align="left"] blockquote {
  text-align: left !important;
}
.nextforge-rich-text strong,
.nextforge-rich-text b {
  font-weight: 700 !important;
}
.nextforge-rich-text p {
  margin: 0.5em 0;
}
.nextforge-rich-text p:first-child {
  margin-top: 0;
}
.nextforge-rich-text p:last-child {
  margin-bottom: 0;
}
.nextforge-rich-text h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0.8em 0 0.4em;
  line-height: 1.25;
}
.nextforge-rich-text h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.8em 0 0.4em;
  line-height: 1.3;
}
.nextforge-rich-text h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.6em 0 0.3em;
}
.nextforge-rich-text h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.5em 0 0.25em;
}
.nextforge-rich-text table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 0.9em;
}
.nextforge-rich-text th,
.nextforge-rich-text td {
  border: 1px solid #cbd5e1;
  padding: 8px 12px;
  min-width: 40px;
}
.nextforge-rich-text th {
  background-color: #f8fafc;
  font-weight: 600;
}
.nextforge-rich-text blockquote {
  border-left: 4px solid #6366f1;
  padding-left: 14px;
  margin: 0.8em 0;
  font-style: italic;
  color: #64748b;
}
.nextforge-rich-text code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.88em;
  font-family: monospace;
}
.nextforge-rich-text pre {
  background: #0f172a;
  color: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.8em 0;
}
.nextforge-rich-text ul {
  list-style-type: disc;
  padding-left: 1.5em;
  margin: 0.5em 0;
}
.nextforge-rich-text ol {
  list-style-type: decimal;
  padding-left: 1.5em;
  margin: 0.5em 0;
}

/* ==========================================================================
   NextForge Button Enhancements & Effects
   ========================================================================== */
.nf-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease;
  user-select: none;
}
.nf-btn:active {
  transform: scale(0.97) !important;
}

/* Hover Animations */
.nf-btn.nf-btn-hover-lift:hover {
  transform: translateY(-4px);
}
.nf-btn.nf-btn-hover-scale:hover {
  transform: scale(1.05);
}
.nf-btn.nf-btn-hover-bounce:hover {
  transform: translateY(-5px) scale(1.02);
}
.nf-btn.nf-btn-hover-push:hover {
  transform: translateY(2px) scale(0.98);
}
.nf-btn.nf-btn-hover-glow:hover {
  transform: scale(1.03);
  box-shadow: 0 0 25px 4px var(--btn-primary, #6366f1);
}
.nf-btn.nf-btn-hover-pulse:hover {
  animation: nfBtnPulse 1.2s infinite ease-in-out;
}
@keyframes nfBtnPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

/* Hover Shadows */
.nf-btn.nf-btn-shadow-subtle:hover {
  box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04) !important;
}
.nf-btn.nf-btn-shadow-medium:hover {
  box-shadow: 0 6px 16px -3px rgba(0, 0, 0, 0.12), 0 3px 6px -2px rgba(0, 0, 0, 0.06) !important;
}
.nf-btn.nf-btn-shadow-large:hover {
  box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.14) !important;
}
.nf-btn.nf-btn-shadow-glow:hover {
  box-shadow: 0 0 16px 2px var(--btn-primary, #6366f1), 0 4px 12px rgba(0,0,0,0.08) !important;
}
.nf-btn.nf-btn-shadow-colored:hover {
  box-shadow: 0 8px 18px -3px var(--btn-primary, #6366f1) !important;
}
.nf-btn.nf-btn-shadow-sharp3d:hover {
  box-shadow: 0 1.5px 0 0 rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.08) !important;
}
.nf-btn.nf-btn-shadow-inner:hover {
  box-shadow: inset 0 0 10px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.08) !important;
}

/* Hover Color Overrides */
.nf-btn[style*="--btn-hover-bg"]:hover {
  background-color: var(--btn-hover-bg) !important;
  background-image: none !important;
}
.nf-btn[style*="--btn-hover-color"]:hover {
  color: var(--btn-hover-color) !important;
}
.nf-btn[style*="--btn-hover-border"]:hover {
  border-color: var(--btn-hover-border) !important;
}

/* Preset-Specific Default Hover Effects (ensures every preset has signature, exciting animations) */
.nf-btn-outline:hover {
  background-color: var(--btn-hover-bg, var(--btn-primary, #6366f1)) !important;
  color: var(--btn-hover-color, #ffffff) !important;
}
.nf-btn-soft:hover {
  filter: brightness(0.92);
}
.nf-btn-minimal:hover {
  background-color: var(--btn-hover-bg, #f1f5f9) !important;
  color: var(--btn-hover-color, #0f172a) !important;
  border-color: var(--btn-hover-border, #94a3b8) !important;
}
.nf-btn-glass:hover {
  background-color: var(--btn-hover-bg, rgba(255, 255, 255, 0.42)) !important;
  box-shadow: 0 14px 36px 0 rgba(31, 38, 135, 0.25) !important;
}
.nf-btn-3d:hover {
  transform: translateY(3px) !important;
  box-shadow: 0 2px 0 0 rgba(0,0,0,0.35), 0 3px 6px rgba(0,0,0,0.15) !important;
}
.nf-btn-gradient:hover {
  box-shadow: 0 14px 28px -4px var(--btn-primary, #6366f1) !important;
}
.nf-btn-glow:hover {
  box-shadow: 0 0 32px 6px var(--btn-primary, #6366f1), 0 6px 18px rgba(0,0,0,0.25) !important;
}

/* Inside Transition: Shine Sweep Beam */
.nf-btn-shine-sweep {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 75%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%);
  transform: translateX(-180%) skewX(-12deg);
  pointer-events: none;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1;
}
.nf-btn:hover .nf-btn-shine-sweep {
  transform: translateX(250%) skewX(-12deg);
}

/* Inside Transition: Glass Sheen */
.nf-btn-glass-sheen {
  position: absolute;
  inset: 0 0 auto 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  pointer-events: none;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  z-index: 1;
}

/* Inside Transition: Fill Slide */
.nf-btn-fill-slide {
  position: absolute;
  inset: 0;
  background-color: var(--btn-hover-bg, rgba(255, 255, 255, 0.2));
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  z-index: 1;
}
.nf-btn:hover .nf-btn-fill-slide {
  transform: scaleX(1);
}

/* Inside Transition: Neon Border Flare */
.nf-btn-neon-border {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 12px 1px var(--btn-primary, #6366f1), 0 0 16px 2px var(--btn-primary, #6366f1);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1;
}
.nf-btn:hover .nf-btn-neon-border {
  opacity: 1;
}

/* Marquee (infinite scrolling strip) */
@keyframes nf-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.nf-marquee {
  overflow: hidden;
  white-space: nowrap;
}
.nf-marquee-track,
.nf-mq-track {
  display: inline-flex;
  align-items: center;
  animation: nf-marquee 22s linear infinite;
  will-change: transform;
}
.nf-marquee:hover .nf-marquee-track,
.nf-marquee:hover .nf-mq-track {
  animation-play-state: paused;
}

/* Scroll Reveal / Load on Scroll (Intersection Observer Animations) */
.nf-reveal {
  opacity: 0;
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}
.nf-reveal-fade {
  transform: none;
}
.nf-reveal-fade-up {
  transform: translateY(36px);
}
.nf-reveal-fade-down {
  transform: translateY(-36px);
}
.nf-reveal-fade-left {
  transform: translateX(-36px);
}
.nf-reveal-fade-right {
  transform: translateX(36px);
}
.nf-reveal-zoom-in {
  transform: scale(0.92);
}
.nf-reveal-zoom-out {
  transform: scale(1.08);
}
.nf-reveal-flip-up {
  transform: perspective(1000px) rotateX(35deg);
}
.nf-revealed {
  opacity: 1 !important;
  transform: none !important;
}

/* Parallax Scroll Depth & Background */
.nf-parallax-bg {
  background-attachment: fixed !important;
}
.nf-parallax {
  will-change: transform;
  transition: transform 0.1s linear;
}

/* Global Heading Animation Keyframes */
@keyframes nf-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes nf-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes nf-pulseglow {
  0%, 100% { text-shadow: 0 0 4px rgba(99,102,241,0.2); }
  50% { text-shadow: 0 0 20px rgba(99,102,241,0.7), 0 0 35px rgba(236,72,153,0.5); }
}
@keyframes nf-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes nf-fadeslide {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
}

// Generate shared vanilla JS for interactive widgets
export function generateSharedJs(): string {
  return `// NextForge Interactive Elements Runtime
document.addEventListener('DOMContentLoaded', () => {
  // 1. Smooth Scroll to Anchors (#sectionId or #SectionID)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').substring(1);
      if (!targetId) return;
      const targetEl = document.getElementById(targetId) ||
                       document.getElementById(targetId.toLowerCase()) ||
                       document.querySelector('[data-custom-id="' + targetId + '"]') ||
                       document.querySelector('[data-custom-id="' + targetId.toLowerCase() + '"]') ||
                       document.querySelector('[data-section-id="' + targetId + '"]');
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#' + targetId);
        }
      }
    });
  });

  // 2. Mobile Navigation Drawer Toggle
  document.querySelectorAll('[data-mobile-menu-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menuId = btn.getAttribute('data-mobile-menu-toggle');
      const menu = document.getElementById(menuId);
      if (menu) {
        menu.classList.toggle('hidden');
      }
    });
  });

  // 3. Interactive Accordion
  document.querySelectorAll('[data-nf-accordion]').forEach(acc => {
    const items = acc.querySelectorAll('[data-nf-accordion-item]');
    items.forEach(item => {
      const header = item.querySelector('[data-nf-accordion-header]');
      const content = item.querySelector('[data-nf-accordion-body]');
      const icon = item.querySelector('[data-nf-accordion-icon]');
      if (header && content) {
        header.addEventListener('click', () => {
          const isOpen = !content.classList.contains('hidden');
          items.forEach(otherItem => {
            const otherBody = otherItem.querySelector('[data-nf-accordion-body]');
            const otherIcon = otherItem.querySelector('[data-nf-accordion-icon]');
            if (otherBody) otherBody.classList.add('hidden');
            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
          });
          if (!isOpen) {
            content.classList.remove('hidden');
            if (icon) icon.style.transform = 'rotate(180deg)';
          }
        });
      }
    });
  });

  // 4. Interactive Tabs
  document.querySelectorAll('[data-nf-tabs]').forEach(tabsContainer => {
    const buttons = tabsContainer.querySelectorAll('[data-nf-tab-btn]');
    const contents = tabsContainer.querySelectorAll('[data-nf-tab-content]');
    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => {
          b.classList.remove('bg-indigo-600', 'text-white');
          b.classList.add('bg-slate-800', 'text-slate-400');
        });
        btn.classList.add('bg-indigo-600', 'text-white');
        btn.classList.remove('bg-slate-800', 'text-slate-400');
        contents.forEach((c, cIdx) => {
          c.classList.toggle('hidden', cIdx !== idx);
        });
      });
    });
  });

  // 5. Interactive Carousels and Image Box Sliders
  document.querySelectorAll('[data-nf-slider]').forEach(slider => {
    const slides = slider.querySelectorAll('[data-nf-slide]');
    const dots = slider.querySelectorAll('[data-nf-dot]');
    const counter = slider.querySelector('[data-nf-counter]');
    const prevBtn = slider.querySelector('[data-nf-prev]');
    const nextBtn = slider.querySelector('[data-nf-next]');
    const titleEl = slider.querySelector('[data-nf-title]');
    const descEl = slider.querySelector('[data-nf-desc]');
    const autoSlide = slider.getAttribute('data-auto-slide') === 'true';
    const intervalSec = parseInt(slider.getAttribute('data-interval') || '4', 10);
    let currentIdx = 0;
    const total = slides.length;

    function goToSlide(idx) {
      if (total <= 1) return;
      currentIdx = (idx + total) % total;
      slides.forEach((s, i) => {
        s.classList.toggle('hidden', i !== currentIdx);
      });
      dots.forEach((d, i) => {
        if (i === currentIdx) {
          d.classList.add('scale-105');
          d.classList.remove('opacity-70');
          d.style.opacity = '1';
        } else {
          d.classList.remove('scale-105');
          d.classList.add('opacity-70');
          d.style.opacity = '0.5';
        }
      });
      if (counter) {
        counter.textContent = (currentIdx + 1) + ' / ' + total;
      }
      if (slides[currentIdx]) {
        const t = slides[currentIdx].getAttribute('data-title');
        const d = slides[currentIdx].getAttribute('data-desc');
        if (titleEl && t !== null) titleEl.textContent = t;
        if (descEl && d !== null) descEl.textContent = d;
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentIdx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentIdx + 1); });
    dots.forEach((d, i) => {
      d.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(i); });
    });

    if (autoSlide && total > 1) {
      let timer = setInterval(() => goToSlide(currentIdx + 1), intervalSec * 1000);
      slider.addEventListener('mouseenter', () => clearInterval(timer));
      slider.addEventListener('mouseleave', () => {
        timer = setInterval(() => goToSlide(currentIdx + 1), intervalSec * 1000);
      });
    }
  });

  // 6. 3D Flip Card Interactive Click
  document.querySelectorAll('[data-nf-flipbox]').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });

  // 7. Native Form Submission Feedback
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '&#10003; Sent successfully!';
        btn.classList.add('bg-emerald-600');
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('bg-emerald-600');
          form.reset();
  // 8. Interactive Before / After Comparison Sliders
  document.querySelectorAll('[data-nf-beforeafter]').forEach(ba => {
    const range = ba.querySelector('.nextforge-ba-range');
    const overlay = ba.querySelector('[data-nf-ba-overlay]');
    const handle = ba.querySelector('[data-nf-ba-handle]');
    const isVertical = ba.getAttribute('data-orientation') === 'vertical';

    function updatePos(val) {
      if (overlay) {
        overlay.style.clipPath = isVertical
          ? 'inset(0 0 ' + (100 - val) + '% 0)'
          : 'inset(0 ' + (100 - val) + '% 0 0)';
      }
      if (handle) {
        if (isVertical) {
          handle.style.top = val + '%';
        } else {
          handle.style.left = val + '%';
        }
      }
    }

    if (range) {
      range.addEventListener('input', (e) => {
        updatePos(e.target.value);
      });
      range.addEventListener('change', (e) => {
        updatePos(e.target.value);
      });
    }
  });

  // 9. Live Countdown Timers
  document.querySelectorAll('[data-nf-countdown]').forEach(function (cdEl) {
    var target = new Date(cdEl.getAttribute('data-target') || '').getTime();
    var finishedText = cdEl.getAttribute('data-finished') || 'The offer has ended';
    function pad(n) { return String(n).padStart(2, '0'); }
    function tick() {
      var diff = target - Date.now();
      if (isNaN(target) || diff <= 0) {
        cdEl.innerHTML = '<div style="font-weight: 700; text-align: center;">' + finishedText + '</div>';
        return false;
      }
      var vals = [
        Math.floor(diff / 86400000),
        Math.floor(diff / 3600000) % 24,
        Math.floor(diff / 60000) % 60,
        Math.floor(diff / 1000) % 60
      ];
      cdEl.querySelectorAll('[data-nf-countdown-value]').forEach(function (node, i) {
        node.textContent = pad(vals[i] || 0);
      });
      return true;
    }
    if (tick()) {
      var timer = setInterval(function () { if (!tick()) clearInterval(timer); }, 1000);
    }
  });

  // 9. Scroll Reveal / Load on Scroll Runtime (IntersectionObserver)
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var targetEl = entry.target;
          var delay = parseInt(targetEl.getAttribute('data-nf-reveal-delay') || '0', 10);
          var duration = parseInt(targetEl.getAttribute('data-nf-reveal-duration') || '600', 10);
          targetEl.style.transitionDuration = duration + 'ms';
          if (delay > 0) {
            setTimeout(function () {
              targetEl.classList.add('nf-revealed');
            }, delay);
          } else {
            targetEl.classList.add('nf-revealed');
          }
          observer.unobserve(targetEl);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    document.querySelectorAll('[data-nf-reveal]').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('[data-nf-reveal]').forEach(function (el) {
      el.classList.add('nf-revealed');
    });
  }

  // 10. Parallax Depth on Scroll Runtime
  var parallaxElements = document.querySelectorAll('[data-nf-parallax]');
  var parallaxBgSections = document.querySelectorAll('[data-nf-parallax-bg="true"]');
  if (parallaxElements.length > 0 || parallaxBgSections.length > 0) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var winHeight = window.innerHeight;
          parallaxElements.forEach(function (el) {
            var speed = parseFloat(el.getAttribute('data-nf-parallax') || '0.2');
            var rect = el.getBoundingClientRect();
            var elemCenter = rect.top + rect.height / 2;
            var offset = (elemCenter - winHeight / 2) * speed * -0.4;
            el.style.transform = 'translate3d(0, ' + offset.toFixed(1) + 'px, 0)';
          });

          parallaxBgSections.forEach(function (sec) {
            var rect = sec.getBoundingClientRect();
            var scrollPercent = (winHeight - rect.top) / (winHeight + rect.height);
            var yPos = Math.max(0, Math.min(100, Math.round(scrollPercent * 100)));
            sec.style.backgroundPosition = 'center ' + yPos + '%';
          });

          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
});
`;
}

// Generate Apache .htaccess file for cPanel shared hosting
export function generateHtaccess(): string {
  return `# NextForge Production .htaccess - Optimized for cPanel Apache Shared Hosting
RewriteEngine On

# 1. Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 2. Clean URLs (serve .html without showing the extension)
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]

# 3. Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# 4. Gzip / Deflate Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json application/xml image/svg+xml
</IfModule>

# 5. Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/html "access plus 10 minutes"
</IfModule>

# 6. Default Charset
AddDefaultCharset UTF-8
`;
}

// Helper to render an Element to static HTML
function renderElementToHtmlInner(el: ElementModel): string {
  const content = el.content || {};
  const styles = el.styles || {};

  const elStyleStr = styleObjectToCss({
    color: styles.color,
    backgroundColor: styles.bgColor,
    backgroundImage: styles.bgImage ? `url("${styles.bgImage}")` : (styles.bgGradient || undefined),
    fontFamily: styles.fontFamily,
    fontSize: normalizeCssVal(styles.fontSize),
    fontWeight: styles.fontWeight,
    textAlign: styles.textAlign,
    textTransform: styles.textTransform || (content as any)?.textTransform,
    letterSpacing: normalizeCssVal(styles.letterSpacing),
    lineHeight: normalizeCssVal(styles.lineHeight),
    paddingTop: normalizeCssVal(styles.paddingTop),
    paddingBottom: normalizeCssVal(styles.paddingBottom),
    paddingLeft: normalizeCssVal(styles.paddingLeft),
    paddingRight: normalizeCssVal(styles.paddingRight),
    marginTop: normalizeCssVal(styles.marginTop),
    marginBottom: normalizeCssVal(styles.marginBottom),
    borderRadius: normalizeCssVal(styles.borderRadius),
    borderWidth: normalizeCssVal(styles.borderWidth),
    borderColor: styles.borderColor,
    borderStyle: styles.borderStyle,
    boxShadow: styles.shadow
  });

  switch (el.type) {
    // 1. HEADING
    case 'heading': {
      const tag = content.tag || 'h1';
      const hasBg = Boolean(styles.bgColor && styles.bgColor !== 'transparent');
      const hasBorder = Boolean(styles.borderColor && styles.borderColor !== 'transparent');
      const padTop = normalizeCssVal(styles.paddingTop) || (hasBg || hasBorder ? '10px' : '');
      const padBottom = normalizeCssVal(styles.paddingBottom) || (hasBg || hasBorder ? '10px' : '');
      const padLeft = normalizeCssVal(styles.paddingLeft) || (hasBg || hasBorder ? '16px' : '');
      const padRight = normalizeCssVal(styles.paddingRight) || (hasBg || hasBorder ? '16px' : '');

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

      // Shimmer gradient colors
      const shimmerFrom = content.shimmerColorFrom || content.gradientFrom || '#6366f1';
      const shimmerMid = content.shimmerColorMid || content.gradientTo || '#ec4899';
      const shimmerEnd = content.shimmerColorEnd || shimmerFrom;

      // Neon settings
      const isNeon = anim === 'neon';
      const neonColor = content.neonColor || '#00f0ff';
      const neonIntensity = content.neonIntensity || 'intense';
      const neonStyle = content.neonStyle || 'pulse';
      const neonWhiteCore = content.neonWhiteCore !== false;

      const getNeonGlowCss = (intensity: string, color: string) => {
        if (intensity === 'subtle') return `0 0 4px #ffffff, 0 0 10px ${color}, 0 0 20px ${color}80`;
        if (intensity === 'medium') return `0 0 4px #ffffff, 0 0 8px #ffffff, 0 0 16px ${color}, 0 0 32px ${color}, 0 0 50px ${color}80`;
        if (intensity === 'cyberpunk') return `0 0 3px #ffffff, 0 0 7px #ffffff, 0 0 14px ${color}, 0 0 28px ${color}, 0 0 55px ${color}, 0 0 90px ${color}, 0 0 130px ${color}`;
        return `0 0 4px #ffffff, 0 0 9px #ffffff, 0 0 18px ${color}, 0 0 36px ${color}, 0 0 65px ${color}, 0 0 95px ${color}90`;
      };
      const activeNeonGlow = getNeonGlowCss(neonIntensity, neonColor);
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
      } else if (decType === 'gradient-text') {
        const gradFrom = content.gradientFrom || '#6366f1';
        const gradTo = content.gradientTo || '#ec4899';
        bgExtra = `linear-gradient(135deg, ${gradFrom}, ${gradTo})`;
        bgClip = 'text';
        textFillColor = 'transparent';
      }

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
      const animId = `nf-hd-${String(el.id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;

      // Typewriter options
      const twSpeed = typeof content.typewriterSpeed === 'number'
        ? content.typewriterSpeed
        : content.animationSpeed === 'fast' ? 45
        : content.animationSpeed === 'slow' ? 160
        : content.animationSpeed === 'ultra-fast' ? 25
        : content.animationSpeed === 'dramatic' ? 240
        : 90;

      const twLoopMode = (content.typewriterMode as string) || (content.animationLoop === false ? 'once' : 'erase');
      const twPause = typeof content.typewriterPause === 'number' ? content.typewriterPause : 1500;
      const twCursor = content.typewriterCursor !== undefined ? content.typewriterCursor : '|';
      const twCursorBlink = content.typewriterCursorBlink || 'blink';
      const twCursorColor = content.typewriterCursorColor || (styles.color || '#000000');
      const twDeleteSpeed = typeof content.typewriterDeleteSpeed === 'number' ? content.typewriterDeleteSpeed : 40;

      let styleTag = '';
      if (anim !== 'none') {
        styleTag = `<style>
          @keyframes nf-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          @keyframes nf-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          @keyframes nf-pulseglow { 0%, 100% { text-shadow: 0 0 4px rgba(99,102,241,0.2); } 50% { text-shadow: 0 0 20px rgba(99,102,241,0.7), 0 0 35px rgba(236,72,153,0.5); } }
          @keyframes nf-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes nf-fadeslide { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes nf-neon-pulse { 0%, 100% { text-shadow: ${subtleNeonGlow}; opacity: 0.92; } 50% { text-shadow: ${activeNeonGlow}; opacity: 1; } }
          @keyframes nf-neon-flicker { 0%, 18.99%, 22%, 62.99%, 64%, 64.99%, 70%, 100% { opacity: 1; text-shadow: ${activeNeonGlow}; } 19%, 21.99%, 63%, 63.99%, 65%, 69.99% { opacity: 0.25; text-shadow: none; } }
          @keyframes nf-neon-electric { 0%, 100% { text-shadow: ${activeNeonGlow}; opacity: 1; } 41.99% { text-shadow: ${activeNeonGlow}; opacity: 1; } 42% { text-shadow: none; opacity: 0.2; } 42.8% { text-shadow: ${activeNeonGlow}; opacity: 1; } 44% { text-shadow: 0 0 3px #fff, 0 0 8px ${neonColor}; opacity: 0.55; } 45.5% { text-shadow: ${activeNeonGlow}; opacity: 1; } }
          .${animId}.nf-heading-shimmer { background: linear-gradient(90deg, ${shimmerFrom} 0%, ${shimmerMid} 50%, ${shimmerEnd} 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: nf-shimmer ${animSpeed} linear ${animLoop}; }
          .${animId}.nf-heading-floating { animation: nf-float ${animSpeed} ease-in-out ${animLoop}; }
          .${animId}.nf-heading-pulseglow { animation: nf-pulseglow ${animSpeed} ease-in-out ${animLoop}; }
          .${animId}.nf-heading-bounce { animation: nf-bounce ${animSpeed} cubic-bezier(0.28, 0.84, 0.42, 1) ${animLoop}; }
          .${animId}.nf-heading-fadeslide { animation: nf-fadeslide ${animSpeed} ease-out forwards; }
          .${animId}.nf-heading-neon-pulse { animation: nf-neon-pulse ${animSpeed} ease-in-out ${animLoop}; }
          .${animId}.nf-heading-neon-flicker { animation: nf-neon-flicker ${animSpeed} linear ${animLoop}; }
          .${animId}.nf-heading-neon-electric { animation: nf-neon-electric ${animSpeed} ease-in-out ${animLoop}; }
          .${animId}.nf-heading-neon-steady { text-shadow: ${activeNeonGlow}; }
          .${animId} .nf-tw-cursor-blink { animation: nf-tw-blink 0.8s infinite; }
          .${animId} .nf-tw-cursor-pulse { animation: nf-tw-pulse 1.1s ease-in-out infinite; }
          .${animId} .nf-tw-cursor-solid { opacity: 1; }
          .${animId} .nf-tw-cursor-none { display: none !important; }
        </style>`;
      }

      const hStyle = styleObjectToCss({
        color: isNeon
          ? (neonWhiteCore ? '#ffffff' : neonColor)
          : (textFillColor === 'transparent' ? 'transparent' : (styles.color || '#000000')),
        textShadow: isNeon
          ? (neonStyle === 'steady' ? activeNeonGlow : undefined)
          : styles.textShadow,
        backgroundColor: bgExtra || styles.bgColor,
        backgroundImage: bgExtra ? undefined : styles.bgGradient,
        fontFamily: styles.fontFamily,
        fontSize: normalizeCssVal(styles.fontSize) || (tag === 'h1' ? '36px' : '28px'),
        fontWeight: styles.fontWeight || (tag === 'h1' ? '800' : '700'),
        textAlign: styles.textAlign || 'left',
        textTransform: styles.textTransform || (content as any)?.textTransform,
        letterSpacing: normalizeCssVal(styles.headingLetterSpacing || styles.letterSpacing),
        lineHeight: normalizeCssVal(styles.headingLineHeight || styles.lineHeight),
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom),
        paddingTop: padTop,
        paddingBottom: padBottom,
        paddingLeft: paddingLeftExtra || padLeft,
        paddingRight: padRight,
        borderRadius: borderRadExtra || normalizeCssVal(styles.borderRadius) || (hasBg ? '12px' : undefined),
        borderWidth: normalizeCssVal(styles.borderWidth),
        borderColor: styles.borderColor,
        borderStyle: styles.borderStyle || (styles.borderWidth ? 'solid' : undefined),
        borderLeft: borderLeft,
        border: borderExtra,
        textDecoration: textDecor,
        textDecorationColor: textDecorColor,
        textDecorationThickness: textDecorThickness,
        textUnderlineOffset: textUnderlineOffset,
        textDecorationSkipInk: 'none',
        WebkitTextDecorationSkip: 'none',
        WebkitBackgroundClip: bgClip,
        backgroundClip: bgClip,
        WebkitTextFillColor: isNeon ? (neonWhiteCore ? '#ffffff' : neonColor) : textFillColor,
        boxShadow: styles.shadow,
        display: (hasBg || hasBorder || decType === 'highlight' || decType === 'circled' || decType === 'badge-pill') ? 'inline-block' : undefined,
        maxWidth: '100%',
        position: 'relative'
      });

      const badgeHtml = content.badgePrefix ? `<span style="display: inline-block; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 999px; background-color: ${decColor}22; color: ${decColor}; margin-right: 8px; vertical-align: middle;">${content.badgePrefix}</span>` : '';
      const rawText = content.text || 'Heading Text';

      let innerContentHtml = rawText;
      if (isTypewriter) {
        const cursorHtml = twCursor !== 'none'
          ? `<span class="nf-tw-cursor nf-tw-cursor-${twCursorBlink}" style="display: inline-block; margin-left: ${twCursor === '_' ? '1px' : '2px'}; color: ${twCursorColor}; font-weight: normal; user-select: none; line-height: 1; vertical-align: ${twCursor === '_' ? 'baseline' : 'text-bottom'};">${twCursor}</span>`
          : '';

        const twScript = `<script>(function(){var root=document.querySelector('.${animId} .nf-typewriter-wrapper');if(!root)return;var textEl=root.querySelector('.nf-tw-text');if(!textEl)return;var fullText=${JSON.stringify(rawText)};var speed=${twSpeed};var pause=${twPause};var loopMode=${JSON.stringify(twLoopMode)};var delSpeed=${twDeleteSpeed};var len=0,isDeleting=false;textEl.textContent='';function step(){if(!isDeleting){len++;textEl.textContent=fullText.slice(0,len)||'\\u200B';if(len>=fullText.length){if(loopMode==='once')return;setTimeout(function(){if(loopMode==='restart'){len=0;textEl.textContent='\\u200B';setTimeout(step,speed);}else{isDeleting=true;setTimeout(step,delSpeed);}},pause);return;}setTimeout(step,speed);}else{len--;textEl.textContent=fullText.slice(0,len)||'\\u200B';if(len<=0){isDeleting=false;setTimeout(step,speed);return;}setTimeout(step,delSpeed);}}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(step,speed);});}else{setTimeout(step,speed);}})();</script>`;

        innerContentHtml = `<span class="nf-typewriter-wrapper" style="display: inline; white-space: pre-wrap;"><span class="nf-tw-text">${rawText}</span>${cursorHtml}</span>${twScript}`;
      }

      if (decType === 'woosh') {
        const wooshSvg = `<svg viewBox="0 0 200 16" preserveAspectRatio="none" style="display: block; width: 100%; height: ${Math.max(6, decThick * 2.5)}px; margin-top: 2px; overflow: visible; color: ${decColor};"><path d="M 2 11 C 45 3, 155 1, 198 7 C 145 13, 55 15, 2 11 Z" fill="currentColor"></path></svg>`;
        innerContentHtml = `<span style="position: relative; display: inline-block; max-width: 100%;">${innerContentHtml}${wooshSvg}</span>`;
      } else if (decType === 'slash') {
        const slashSpan = `<span style="position: absolute; left: -4%; right: -4%; top: 52%; height: ${Math.max(2, decThick)}px; background-color: ${decColor}; transform: rotate(-3.5deg); transform-origin: center; border-radius: 2px; pointer-events: none; z-index: 1; opacity: 0.9;"></span>`;
        innerContentHtml = `<span style="position: relative; display: inline-block; max-width: 100%;">${innerContentHtml}${slashSpan}</span>`;
      }

      return `${styleTag}<${tag} style="${hStyle}" class="${animId} ${animClass} tracking-tight leading-tight transition-all">${badgeHtml}${innerContentHtml}</${tag}>`;
    }

    // 2. TEXT EDITOR
    case 'text': {
      const hasBorder = Boolean(styles.borderColor && styles.borderColor !== 'transparent');
      const hasBg = Boolean(styles.bgColor && styles.bgColor !== 'transparent');
      const htmlContent = content.html || (content.text ? `<p>${content.text}</p>` : '<p>Start typing your paragraph text here...</p>');

      const tStyle = styleObjectToCss({
        color: styles.color || '#334155',
        fontFamily: styles.fontFamily,
        fontSize: normalizeCssVal(styles.fontSize) || '15px',
        fontWeight: styles.fontWeight || '400',
        textShadow: styles.textShadow,
        textAlign: styles.textAlign || 'left',
        textTransform: styles.textTransform || (content as any)?.textTransform,
        letterSpacing: normalizeCssVal(styles.letterSpacing),
        lineHeight: normalizeCssVal(styles.lineHeight),
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom),
        backgroundColor: styles.bgColor,
        border: hasBorder ? `${normalizeCssVal(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor}` : undefined,
        borderRadius: normalizeCssVal(styles.borderRadius) || (hasBg ? '12px' : undefined),
        boxShadow: styles.shadow,
        paddingTop: normalizeCssVal(styles.paddingTop) || (hasBg || hasBorder ? '8px' : undefined),
        paddingBottom: normalizeCssVal(styles.paddingBottom) || (hasBg || hasBorder ? '8px' : undefined),
        paddingLeft: normalizeCssVal(styles.paddingLeft) || (hasBg || hasBorder ? '12px' : undefined),
        paddingRight: normalizeCssVal(styles.paddingRight) || (hasBg || hasBorder ? '12px' : undefined),
        display: 'block',
        width: '100%',
        maxWidth: '100%'
      });
      return `<div data-align="${styles.textAlign || 'left'}" style="${tStyle}" class="w-full leading-relaxed nextforge-rich-text">${htmlContent}</div>`;
    }

    // 3. BUTTON
    case 'button': {
      const PRESET_HOVER_DEFAULTS: Record<string, {
        hoverEffect: string;
        hoverShadow: string;
        insideEffect: string;
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

      const url = content.url || '#';
      const target = content.target === '_blank' ? 'target="_blank" rel="noopener noreferrer"' : '';
      const align = styles.textAlign || 'left';
      const preset = styles.buttonPreset || 'solid';
      const primaryColor = styles.bgColor || '#6366f1';
      const textColor = styles.color || '#ffffff';

      let btnBg = primaryColor;
      let btnColor = textColor;
      let defaultBorder = 'none';
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

      let btnTransform: string | undefined = undefined;
      let btnBgImage = styles.bgGradient || undefined;
      let btnBackdrop: string | undefined = undefined;
      // FIX: btnRadius was assigned inside some preset cases below but never
      // declared, so exporting any page containing a button threw a
      // ReferenceError. Declare it here with the element's own radius as the
      // default; preset cases (pill/glass/minimal) still override it.
      let btnRadius: string | undefined = normalizeCssVal(styles.borderRadius) || '12px';

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
          btnRadius = normalizeCssVal(styles.borderRadius) || '14px';
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
          btnRadius = normalizeCssVal(styles.borderRadius) || '8px';
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
      let btnBorder = defaultBorder;
      if (styles.borderWidth !== undefined && styles.borderWidth !== '') {
        const rawVal = normalizeCssVal(styles.borderWidth);
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
      const hoverShadow = (styles.buttonHoverShadow !== undefined && styles.buttonHoverShadow !== '')
        ? styles.buttonHoverShadow
        : presetDefaults.hoverShadow;
      const insideEffect = (styles.buttonInsideEffect !== undefined && styles.buttonInsideEffect !== '')
        ? styles.buttonInsideEffect
        : presetDefaults.insideEffect;

      const btnClasses = [
        'nf-btn',
        `nf-btn-${preset}`,
        hoverEffect !== 'none' ? `nf-btn-hover-${hoverEffect}` : '',
        hoverShadow !== 'none' ? `nf-btn-shadow-${hoverShadow}` : '',
        insideEffect !== 'none' ? `nf-btn-inside-${insideEffect}` : ''
      ].filter(Boolean).join(' ');

      let insideHtml = '';
      if (insideEffect === 'shine-sweep' || hoverEffect === 'shine-sweep') {
        insideHtml += '<span class="nf-btn-shine-sweep"></span>';
      }
      if (insideEffect === 'glass-sheen') {
        insideHtml += '<span class="nf-btn-glass-sheen"></span>';
      }
      if (insideEffect === 'fill-slide') {
        insideHtml += '<span class="nf-btn-fill-slide"></span>';
      }
      if (insideEffect === 'neon-border') {
        insideHtml += '<span class="nf-btn-neon-border"></span>';
      }

      let hoverBg = styles.hoverBgColor;
      let hoverTextColor = styles.hoverColor;
      if (!hoverBg) {
        if (preset === 'outline') {
          hoverBg = primaryColor;
          hoverTextColor = hoverTextColor || '#ffffff';
        } else if (preset === 'minimal') {
          hoverBg = '#f1f5f9';
          hoverTextColor = hoverTextColor || '#0f172a';
        } else if (preset === 'glass') {
          hoverBg = 'rgba(255, 255, 255, 0.42)';
        }
      }

      const customProps: Record<string, string | undefined> = {
        '--btn-primary': primaryColor,
        '--btn-hover-bg': hoverBg || undefined,
        '--btn-hover-color': hoverTextColor || undefined,
        '--btn-hover-border': styles.hoverBorderColor || undefined,
      };

      const btnStyle = styleObjectToCss({
        ...customProps,
        color: btnColor,
        backgroundColor: btnBg,
        backgroundImage: btnBgImage,
        border: btnBorder,
        borderRadius: btnRadius,
        boxShadow: btnShadow,
        transform: btnTransform,
        backdropFilter: btnBackdrop,
        WebkitBackdropFilter: btnBackdrop,
        paddingTop: normalizeCssVal(styles.paddingTop) || '12px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '12px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '24px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '24px',
        fontSize: normalizeCssVal(styles.fontSize) || '13px',
        fontWeight: styles.fontWeight || '700',
        fontFamily: styles.fontFamily,
        textShadow: styles.textShadow,
        textTransform: styles.textTransform,
        textDecoration: 'none'
      });

      const showIcon = content.showIcon !== false;
      const iconSvg = showIcon ? getSvgIcon(content.iconName || 'arrowRight', 14, btnColor) : '';

      return `<div style="text-align: ${align};">
        <a href="${url}" ${target} style="${btnStyle}" class="${btnClasses}">
          ${insideHtml}
          <span style="position: relative; z-index: 2;">${content.text || 'Click Here'}</span>
          ${iconSvg ? `<span style="position: relative; z-index: 2; display: inline-flex; align-items: center;">${iconSvg}</span>` : ''}
        </a>
      </div>`;
    }

    // 4. IMAGE
    case 'image': {
      const align = styles.textAlign || 'left';
      const imgWidth = content.imageWidth || content.width || '100%';
      const imgHeight = content.imageHeight || content.height || 'auto';
      const objectFit = content.objectFit || 'cover';
      const rawOpacity = styles.opacity !== undefined && styles.opacity !== ''
        ? styles.opacity
        : (content.opacity !== undefined && content.opacity !== '' ? content.opacity : undefined);
      const wrapStyle = styleObjectToCss({
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom),
        paddingTop: normalizeCssVal(styles.paddingTop),
        paddingBottom: normalizeCssVal(styles.paddingBottom),
        paddingLeft: normalizeCssVal(styles.paddingLeft),
        paddingRight: normalizeCssVal(styles.paddingRight),
        width: imgWidth && imgWidth !== 'auto' ? normalizeCssVal(imgWidth) : undefined,
        maxWidth: '100%'
      });
      const imgStyle = styleObjectToCss({
        borderRadius: normalizeCssVal(styles.borderRadius) || '16px',
        boxShadow: styles.shadow,
        borderWidth: normalizeCssVal(styles.borderWidth),
        borderColor: styles.borderColor,
        borderStyle: styles.borderStyle,
        width: normalizeCssVal(imgWidth) || '100%',
        height: imgHeight === 'auto' ? 'auto' : (normalizeCssVal(imgHeight) || 'auto'),
        maxHeight: imgHeight === 'auto' ? '380px' : undefined,
        objectFit: objectFit,
        opacity: rawOpacity !== undefined ? String(Number(rawOpacity)) : undefined,
        display: 'block'
      });
      return `<div style="text-align: ${align}; ${wrapStyle}">
        <img src="${content.url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'}" alt="${content.alt || ''}" style="${imgStyle}" class="max-w-full" />
        ${content.caption ? `<p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 8px; font-style: italic;">${content.caption}</p>` : ''}
      </div>`;
    }

    // 4b. BEFORE / AFTER COMPARISON SLIDER
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

      const wrapStyle = styleObjectToCss({
        position: 'relative',
        width: '100%',
        height: imgHeight,
        borderRadius: normalizeCssVal(styles.borderRadius) || '16px',
        boxShadow: styles.shadow || '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        userSelect: 'none',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom),
        marginLeft: normalizeCssVal(styles.marginLeft),
        marginRight: normalizeCssVal(styles.marginRight)
      });

      const beforeClip = isVertical
        ? `inset(0 0 ${100 - sliderPos}% 0)`
        : `inset(0 ${100 - sliderPos}% 0 0)`;

      const handleStyle = isVertical
        ? `position: absolute; left: 0; right: 0; top: ${sliderPos}%; height: 3px; background-color: ${handleColor}; box-shadow: 0 0 10px rgba(0,0,0,0.4); transform: translateY(-50%); z-index: 20; pointer-events: none;`
        : `position: absolute; top: 0; bottom: 0; left: ${sliderPos}%; width: 3px; background-color: ${handleColor}; box-shadow: 0 0 10px rgba(0,0,0,0.4); transform: translateX(-50%); z-index: 20; pointer-events: none;`;

      const arrowsSvg = isVertical
        ? `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;margin:-3px 0;">${getSvgIcon('chevronUp', 14, '#0f172a')}${getSvgIcon('chevronDown', 14, '#0f172a')}</div>`
        : `<div style="display:flex;align-items:center;justify-content:center;margin:0 -3px;">${getSvgIcon('chevronLeft', 14, '#0f172a')}${getSvgIcon('chevronRight', 14, '#0f172a')}</div>`;

      return `
      <div data-nf-beforeafter data-orientation="${orientation}" data-pos="${sliderPos}" style="${wrapStyle}" class="nextforge-beforeafter">
        <!-- Base After Image -->
        <img src="${afterImg}" alt="${afterLabel}" style="width: 100%; height: 100%; object-fit: ${objectFit}; display: block; pointer-events: none;" />

        <!-- Clipped Before Image Overlay -->
        <div data-nf-ba-overlay style="position: absolute; inset: 0; width: 100%; height: 100%; clip-path: ${beforeClip}; pointer-events: none;">
          <img src="${beforeImg}" alt="${beforeLabel}" style="width: 100%; height: 100%; object-fit: ${objectFit}; display: block;" />
        </div>

        ${showLabels ? `
          <span style="position: absolute; top: 12px; left: 12px; background-color: rgba(15, 23, 42, 0.75); color: #ffffff; backdrop-filter: blur(8px); padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.03em; box-shadow: 0 2px 6px rgba(0,0,0,0.2); z-index: 10; pointer-events: none;">
            ${beforeLabel}
          </span>
          <span style="position: absolute; ${isVertical ? 'bottom: 12px;' : 'top: 12px;'} right: 12px; background-color: rgba(15, 23, 42, 0.75); color: #ffffff; backdrop-filter: blur(8px); padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.03em; box-shadow: 0 2px 6px rgba(0,0,0,0.2); z-index: 10; pointer-events: none;">
            ${afterLabel}
          </span>
        ` : ''}

        <!-- Split Divider Handle Line -->
        <div data-nf-ba-handle style="${handleStyle}">
          <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 38px; height: 38px; border-radius: 9999px; background-color: ${handleColor}; color: #0f172a; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.8);">
            ${arrowsSvg}
          </div>
        </div>

        <!-- Range Slider Input overlay for native drag support -->
        <input type="range" min="0" max="100" value="${sliderPos}" style="position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: ${isVertical ? 'ns-resize' : 'ew-resize'}; z-index: 30; margin: 0;" class="nextforge-ba-range" />
      </div>`;
    }

    // 5. NAVIGATION HEADER
    case 'navigation': {
      const rawLinks: any[] = content.links && content.links.length > 0
        ? content.links
        : ['Home', 'Features', 'Pricing', 'About'];

      const links: { label: string; url: string; openInNewTab?: boolean }[] = rawLinks.map((item: any, idx: number) => {
        if (typeof item === 'object' && item !== null) {
          return {
            label: item.label !== undefined ? String(item.label) : (item.text ? String(item.text) : `Link ${idx + 1}`),
            url: item.url !== undefined ? String(item.url) : (item.href ? String(item.href) : '#'),
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
      const ctaText = content.ctaText || 'Get Started Free';
      const ctaUrl = content.ctaUrl || '#pricing';
      const showCta = content.showCta !== false;
      const navStyle = styles.navStyle || content.navStyle || 'clean';
      const navLayout = styles.navLayout || content.navLayout || 'standard';
      const menuId = `nav-menu-${el.id}`;

      let navContainerStyle = `padding: ${normalizeCssVal(styles.paddingTop) || '12px'} ${normalizeCssVal(styles.paddingRight) || '20px'} ${normalizeCssVal(styles.paddingBottom) || '12px'} ${normalizeCssVal(styles.paddingLeft) || '20px'}; border-radius: ${normalizeCssVal(styles.borderRadius) || '14px'}; margin-top: ${normalizeCssVal(styles.marginTop) || '0px'}; margin-bottom: ${normalizeCssVal(styles.marginBottom) || '0px'}; font-family: ${styles.fontFamily || 'inherit'};`;
      let isGradientOrDark = false;

      if (navStyle === 'gradient') {
        navContainerStyle += ' background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #4338ca 100%); color: #ffffff; box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);';
        isGradientOrDark = true;
      } else if (navStyle === 'dark') {
        navContainerStyle += ' background-color: #020617; color: #ffffff; border: 1px solid #1e293b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);';
        isGradientOrDark = true;
      } else if (navStyle === 'glass') {
        navContainerStyle += ' backdrop-filter: blur(12px); background-color: rgba(255, 255, 255, 0.85); border: 1px solid rgba(226, 232, 240, 0.8); color: #0f172a; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);';
      } else if (navStyle === 'floating') {
        navContainerStyle += ' background-color: #ffffff; color: #0f172a; border-radius: 9999px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #f1f5f9; padding: 10px 24px; max-width: 1024px; margin: 0 auto;';
      } else if (navStyle === 'bordered') {
        navContainerStyle += ' border-bottom: 1px solid #e2e8f0; background-color: #ffffff; color: #0f172a;';
      } else {
        navContainerStyle += ` background-color: ${styles.bgColor || '#ffffff'}; color: ${styles.color || '#0f172a'};`;
      }

      if (navLayout === 'centered' || navLayout === 'stacked') {
        navContainerStyle += ' flex-direction: column; align-items: center; justify-content: center; gap: 10px; text-align: center;';
      }

      const linkColor = isGradientOrDark ? '#ffffff' : (styles.color || '#334155');
      const ctaBtnStyle = isGradientOrDark
        ? 'background-color: #ffffff; color: #4338ca; font-weight: 700; border-radius: 12px; padding: 8px 18px; font-size: 12px;'
        : 'background-color: #4f46e5; color: #ffffff; font-weight: 700; border-radius: 12px; padding: 8px 18px; font-size: 12px;';

      return `
      <header class="w-full relative z-30" style="${styles.isSticky ? 'position: sticky; top: 0; z-index: 50;' : ''}">
        <div style="${navContainerStyle}" class="flex items-center justify-between w-full">
          <!-- Brand Logo -->
          <a href="/" class="flex items-center space-x-2.5 flex-shrink-0 cursor-pointer select-none">
            ${content.logoImage
              ? `<img src="${content.logoImage}" alt="${logoText}" style="height: 28px; width: auto; object-fit: contain;" />`
              : `<div style="width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(to top right, #4f46e5, #a855f7); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 12px; font-weight: 900; box-shadow: 0 1px 2px rgba(0,0,0,0.1); flex-shrink: 0;">${logoText.charAt(0)}</div>`
            }
            <span style="font-size: 16px; font-weight: 800; letter-spacing: -0.025em; white-space: nowrap;">${logoText}</span>
          </a>

          <!-- Desktop Links -->
          <nav class="hidden md:flex items-center space-x-6 flex-shrink-0">
            ${links.map(l => `
              <a href="${l.url}" ${l.openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''} style="color: ${linkColor}; font-size: 13px; font-weight: 600; transition: opacity 0.2s;" class="hover:opacity-80">
                ${l.label}
              </a>
            `).join('')}
          </nav>

          <!-- CTA Button -->
          <div class="hidden md:flex items-center space-x-3 flex-shrink-0">
            ${showCta ? `
              <a href="${ctaUrl}" style="${ctaBtnStyle}" class="inline-flex items-center space-x-1.5 shadow-sm transition-transform hover:scale-105">
                <span>${ctaText}</span>
                ${getSvgIcon('arrowRight', 12, isGradientOrDark ? '#4338ca' : '#ffffff')}
              </a>
            ` : ''}
          </div>

          <!-- Mobile Hamburger -->
          <button data-mobile-menu-toggle="${menuId}" class="md:hidden p-2 rounded-lg" style="color: ${linkColor};">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </button>
        </div>

        <!-- Mobile Drawer -->
        <div id="${menuId}" class="hidden md:hidden px-4 pb-4 pt-2 border-t border-slate-700/20 space-y-2.5 rounded-b-xl" style="${isGradientOrDark ? 'background-color: #0f172a; color: #ffffff;' : 'background-color: #ffffff; color: #0f172a; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);'}">
          ${links.map(l => `
            <a href="${l.url}" style="display: block; padding: 6px 0; font-size: 13px; font-weight: 600;">${l.label}</a>
          `).join('')}
          ${showCta ? `
            <a href="${ctaUrl}" style="${ctaBtnStyle}; display: block; text-align: center; margin-top: 8px;">
              ${ctaText}
            </a>
          ` : ''}
        </div>
      </header>`;
    }

    // 6b. BADGE (standalone pill label — previously shared the icon-card case,
    // which exported a badge as an icon card with phantom subtext)
    case 'badge': {
      const badgeStyle = styleObjectToCss({
        backgroundColor: styles.bgColor || '#ede9fe',
        color: styles.color || '#6366f1',
        fontFamily: styles.fontFamily,
        fontSize: normalizeCssVal(styles.fontSize) || '11px',
        fontWeight: styles.fontWeight || '700',
        borderRadius: normalizeCssVal(styles.borderRadius) || (content.variant === 'square' ? '8px' : '9999px'),
        border: (styles.borderColor || styles.borderWidth) ? `${normalizeCssVal(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor || '#e2e8f0'}` : undefined,
        boxShadow: styles.shadow,
        paddingTop: normalizeCssVal(styles.paddingTop) || '4px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '4px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '12px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '12px',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom),
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      });
      return `<div style="text-align: ${styles.textAlign || 'left'};"><span style="${badgeStyle}">${getSvgIcon('sparkles', 12, styles.color || '#6366f1')}<span>${content.text || 'Next.js 15+ Native'}</span></span></div>`;
    }

    // 6. ICON (Special Feature, Icons)
    case 'icon': {
      const iconName = content.iconName || content.icon || 'star';
      const iconColor = styles.iconColor || content.iconColor || styles.color || '#6366f1';
      const iconBgColor = styles.iconBgColor || content.iconBgColor || (styles.bgColor && styles.bgColor !== 'transparent' ? `${iconColor}20` : '#ede9fe');
      const iconSize = normalizeCssVal(styles.iconSize || content.iconSize) || '20px';
      const iconPadding = normalizeCssVal(styles.iconPadding || content.iconPadding) || '10px';
      const badgeBorderRadius = styles.iconBorderRadius !== undefined ? normalizeCssVal(styles.iconBorderRadius) : (content.iconBorderRadius !== undefined ? normalizeCssVal(content.iconBorderRadius) : '12px');

      const badgeBorderWidthNum = styles.iconBorderWidth !== undefined ? parseInt(String(styles.iconBorderWidth).replace(/[^0-9]/g, ''), 10) : (content.iconBorderWidth !== undefined ? parseInt(String(content.iconBorderWidth).replace(/[^0-9]/g, ''), 10) : 0);
      const badgeBorderColor = styles.iconBorderColor || content.iconBorderColor;
      let badgeBorderStyle = '';
      if (badgeBorderWidthNum > 0 && badgeBorderColor && badgeBorderColor !== 'transparent') {
        badgeBorderStyle = `${badgeBorderWidthNum}px solid ${badgeBorderColor}`;
      } else if (badgeBorderWidthNum > 0) {
        badgeBorderStyle = `${badgeBorderWidthNum}px solid ${iconColor}`;
      } else if (badgeBorderColor && badgeBorderColor !== 'transparent') {
        badgeBorderStyle = `1px solid ${badgeBorderColor}`;
      }

      const headingColor = styles.headingColor || styles.color || '#1e293b';
      const descColor = styles.descColor || '#64748b';
      const align = styles.textAlign || content.align || 'left';

      // Card Border computation
      const rawBorderWidth = styles.borderWidth !== undefined ? styles.borderWidth : undefined;
      const borderWidthNum = rawBorderWidth !== undefined ? parseInt(String(rawBorderWidth).replace(/[^0-9]/g, ''), 10) : undefined;
      const rawBorderColor = styles.borderColor;
      const isBorderTransparent = rawBorderColor === 'transparent';
      
      let cardBorderStyle = styles.bgColor ? 'none' : '1px solid rgba(255, 255, 255, 0.2)';
      if (borderWidthNum !== undefined) {
        if (borderWidthNum === 0 || isBorderTransparent) {
          cardBorderStyle = 'none';
        } else {
          cardBorderStyle = `${borderWidthNum}px ${styles.borderStyle || 'solid'} ${rawBorderColor && rawBorderColor !== 'transparent' ? rawBorderColor : '#cbd5e1'}`;
        }
      } else if (rawBorderColor && !isBorderTransparent) {
        cardBorderStyle = `1px ${styles.borderStyle || 'solid'} ${rawBorderColor}`;
      }

      const cardBorderRadius = styles.borderRadius !== undefined ? normalizeCssVal(styles.borderRadius) : '14px';
      const flexJustify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';

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

      const animStyleTag = iconAnim && iconAnim !== 'none' ? `
        <style>
          @keyframes nf-icon-pulse-${safeId} { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
          @keyframes nf-icon-float-${safeId} { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
          @keyframes nf-icon-shimmer-${safeId} { 0%, 100% { filter: drop-shadow(0 0 0px transparent); opacity: 0.92; } 50% { filter: drop-shadow(0 0 8px currentColor); opacity: 1; } }
          @keyframes nf-icon-spin-${safeId} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes nf-icon-bounce-${safeId} { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          @keyframes nf-icon-wiggle-${safeId} { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-6deg); } 75% { transform: rotate(6deg); } }
          ${iconAnim === 'hover-lift'
            ? `.${iconClass} { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important; } .${cardClass}:hover .${iconClass} { transform: translateY(-5px) scale(1.08) !important; }`
            : iconAnim === 'hover-spin'
            ? `.${iconClass} { transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important; } .${cardClass}:hover .${iconClass} { transform: rotate(360deg) !important; }`
            : iconTrigger === 'hover'
            ? `.${cardClass}:hover .${iconClass} { animation: nf-icon-${iconAnim}-${safeId} ${dur} infinite ease-in-out !important; }`
            : `.${iconClass} { animation: nf-icon-${iconAnim}-${safeId} ${dur} infinite ease-in-out !important; }`
          }
        </style>
      ` : '';

      const cardStyle = styleObjectToCss({
        backgroundColor: styles.bgColor || 'transparent',
        border: cardBorderStyle,
        borderRadius: cardBorderRadius,
        boxShadow: styles.shadow || undefined,
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom),
        textAlign: align,
        paddingTop: normalizeCssVal(styles.paddingTop) || '12px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '12px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '16px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: flexJustify,
        gap: '12px'
      });

      return `
      <div class="transition-all ${cardClass}" style="${cardStyle}">
        ${animStyleTag}
        <div class="shrink-0 transition-all ${iconClass}" style="display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; width: fit-content; background-color: ${iconBgColor}; color: ${iconColor}; padding: ${iconPadding}; border-radius: ${badgeBorderRadius}; ${badgeBorderStyle ? `border: ${badgeBorderStyle};` : ''}">
          ${getSvgIcon(iconName, parseInt(iconSize, 10) || 20, iconColor)}
        </div>
        <div style="text-align: ${align};">
          <div style="font-family: ${styles.headingFontFamily || styles.fontFamily || 'inherit'}; font-size: ${normalizeCssVal(styles.headingFontSize || styles.fontSize) || '14px'}; font-weight: ${styles.headingFontWeight || styles.fontWeight || '700'}; color: ${headingColor}; line-height: 1.25; text-transform: ${styles.headingTextTransform || styles.textTransform || 'none'};">
            ${content.text !== undefined ? content.text : (content.title !== undefined ? content.title : 'Special Feature')}
          </div>
          ${(content.subtext !== '' && content.description !== '') ? `
            <div style="font-family: ${styles.descFontFamily || styles.fontFamily || 'inherit'}; font-size: ${normalizeCssVal(styles.descFontSize) || '12px'}; font-weight: ${styles.descFontWeight || '400'}; color: ${descColor}; margin-top: 3px; text-transform: ${styles.descTextTransform || 'none'};">
              ${content.subtext !== undefined ? content.subtext : (content.description !== undefined ? content.description : 'Ultra-fast Next.js component')}
            </div>
          ` : ''}
        </div>
      </div>`;
    }

    // 7. ICON BOX (Enterprise Security card)
    case 'iconbox': {
      const iconName = content.iconName || content.icon || 'shield';
      const iconColor = styles.iconColor || content.iconColor || styles.color || '#6366f1';
      const iconBgColor = styles.iconBgColor || content.iconBgColor || `${iconColor}20`;
      const iconSize = normalizeCssVal(styles.iconSize || content.iconSize) || '24px';
      const iconPadding = normalizeCssVal(styles.iconPadding || content.iconPadding) || '12px';
      const badgeBorderRadius = styles.iconBorderRadius !== undefined ? normalizeCssVal(styles.iconBorderRadius) : (content.iconBorderRadius !== undefined ? normalizeCssVal(content.iconBorderRadius) : '14px');

      // Badge Border computation
      const badgeBorderWidthNum = styles.iconBorderWidth !== undefined ? parseInt(String(styles.iconBorderWidth).replace(/[^0-9]/g, ''), 10) : (content.iconBorderWidth !== undefined ? parseInt(String(content.iconBorderWidth).replace(/[^0-9]/g, ''), 10) : 0);
      const badgeBorderColor = styles.iconBorderColor || content.iconBorderColor;
      let badgeBorderStyle = '';
      if (badgeBorderWidthNum > 0 && badgeBorderColor && badgeBorderColor !== 'transparent') {
        badgeBorderStyle = `${badgeBorderWidthNum}px solid ${badgeBorderColor}`;
      } else if (badgeBorderWidthNum > 0) {
        badgeBorderStyle = `${badgeBorderWidthNum}px solid ${iconColor}`;
      } else if (badgeBorderColor && badgeBorderColor !== 'transparent') {
        badgeBorderStyle = `1px solid ${badgeBorderColor}`;
      }

      const headingFontFamily = styles.headingFontFamily || styles.fontFamily || undefined;
      const headingFontSize = normalizeCssVal(styles.headingFontSize || styles.fontSize) || '16px';
      const headingFontWeight = styles.headingFontWeight || styles.fontWeight || '700';
      const headingColor = styles.headingColor || styles.color || '#0f172a';
      const descFontFamily = styles.descFontFamily || styles.fontFamily || undefined;
      const descFontSize = normalizeCssVal(styles.descFontSize) || '13px';
      const descFontWeight = styles.descFontWeight || '400';
      const descColor = styles.descColor || '#64748b';
      const align = styles.textAlign || content.align || 'left';

      // Card Border computation
      const rawBorderWidth = styles.borderWidth !== undefined ? styles.borderWidth : undefined;
      const borderWidthNum = rawBorderWidth !== undefined ? parseInt(String(rawBorderWidth).replace(/[^0-9]/g, ''), 10) : undefined;
      const rawBorderColor = styles.borderColor !== undefined ? styles.borderColor : undefined;
      const isBorderTransparent = rawBorderColor === 'transparent';
      
      let cardBorderStyle = '1px solid #e2e8f0'; // default iconbox border
      if (borderWidthNum !== undefined) {
        if (borderWidthNum === 0 || isBorderTransparent) {
          cardBorderStyle = 'none';
        } else {
          cardBorderStyle = `${borderWidthNum}px ${styles.borderStyle || 'solid'} ${rawBorderColor && rawBorderColor !== 'transparent' ? rawBorderColor : '#e2e8f0'}`;
        }
      } else if (rawBorderColor !== undefined) {
        cardBorderStyle = isBorderTransparent ? 'none' : `1px ${styles.borderStyle || 'solid'} ${rawBorderColor}`;
      }

      const cardBorderRadius = styles.borderRadius !== undefined ? normalizeCssVal(styles.borderRadius) : '16px';
      const flexAlignCss = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
      const textAlignCss = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';

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

      const animStyleTag = iconAnim && iconAnim !== 'none' ? `
        <style>
          @keyframes nf-icon-pulse-${safeId} { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
          @keyframes nf-icon-float-${safeId} { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
          @keyframes nf-icon-shimmer-${safeId} { 0%, 100% { filter: drop-shadow(0 0 0px transparent); opacity: 0.92; } 50% { filter: drop-shadow(0 0 8px currentColor); opacity: 1; } }
          @keyframes nf-icon-spin-${safeId} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes nf-icon-bounce-${safeId} { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          @keyframes nf-icon-wiggle-${safeId} { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-6deg); } 75% { transform: rotate(6deg); } }
          ${iconAnim === 'hover-lift'
            ? `.${iconClass} { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important; } .${cardClass}:hover .${iconClass} { transform: translateY(-5px) scale(1.08) !important; }`
            : iconAnim === 'hover-spin'
            ? `.${iconClass} { transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important; } .${cardClass}:hover .${iconClass} { transform: rotate(360deg) !important; }`
            : iconTrigger === 'hover'
            ? `.${cardClass}:hover .${iconClass} { animation: nf-icon-${iconAnim}-${safeId} ${dur} infinite ease-in-out !important; }`
            : `.${iconClass} { animation: nf-icon-${iconAnim}-${safeId} ${dur} infinite ease-in-out !important; }`
          }
        </style>
      ` : '';

      const cardStyle = styleObjectToCss({
        backgroundColor: styles.bgColor || '#ffffff',
        backgroundImage: styles.bgGradient,
        border: cardBorderStyle,
        borderRadius: cardBorderRadius,
        boxShadow: styles.shadow || '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom),
        display: 'flex',
        flexDirection: 'column',
        alignItems: flexAlignCss,
        textAlign: textAlignCss,
        paddingTop: normalizeCssVal(styles.paddingTop) || '20px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '20px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '20px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '20px',
        gap: '12px'
      });

      return `
      <div style="${cardStyle}" class="transition-all ${cardClass}">
        ${animStyleTag}
        <div class="shrink-0 transition-all ${iconClass}" style="display: inline-flex; align-items: center; justify-content: center; width: fit-content; align-self: ${flexAlignCss}; background-color: ${iconBgColor}; color: ${iconColor}; padding: ${iconPadding}; border-radius: ${badgeBorderRadius}; ${badgeBorderStyle ? `border: ${badgeBorderStyle};` : ''}">
          ${getSvgIcon(iconName, parseInt(iconSize, 10) || 24, iconColor)}
        </div>
        <h4 style="font-family: ${headingFontFamily || 'inherit'}; font-size: ${headingFontSize}; font-weight: ${headingFontWeight}; text-shadow: ${styles.headingTextShadow || styles.textShadow || 'none'}; color: ${headingColor}; margin: 0; width: 100%; text-align: ${textAlignCss}; text-transform: ${styles.headingTextTransform || styles.textTransform || 'none'};">
          ${content.title !== undefined ? content.title : (content.text !== undefined ? content.text : 'Enterprise Security')}
        </h4>
        ${(content.description !== '' && content.subtext !== '') ? `
          <p class="leading-relaxed" style="font-family: ${descFontFamily || 'inherit'}; font-size: ${descFontSize}; font-weight: ${descFontWeight}; text-shadow: ${styles.textShadow || 'none'}; color: ${descColor}; margin: 0; width: 100%; text-align: ${textAlignCss}; text-transform: ${styles.descTextTransform || 'none'};">
            ${content.description !== undefined ? content.description : (content.subtext !== undefined ? content.subtext : 'Guaranteed safety and end-to-end performance.')}
          </p>
        ` : ''}
      </div>`;
    }

    // 8. CONTENT CARD
    case 'contentcard': {
      const cardStyle = styleObjectToCss({
        backgroundColor: styles.bgColor || '#f8fafc',
        backgroundImage: styles.bgGradient,
        border: `${normalizeCssVal(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor || '#e2e8f0'}`,
        borderRadius: normalizeCssVal(styles.borderRadius) || '16px',
        paddingTop: normalizeCssVal(styles.paddingTop) || '20px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '20px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '20px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '20px',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom),
        boxShadow: styles.shadow || '0 1px 2px rgba(0,0,0,0.05)'
      });

      return `
      <div style="${cardStyle}" class="space-y-2 text-left transition-all">
        ${content.badge ? `
          <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase; background-color: rgba(99, 102, 241, 0.15); color: #6366f1; display: inline-block;">
            ${content.badge}
          </span>
        ` : ''}
        <h4 style="font-family: ${styles.headingFontFamily || styles.fontFamily || 'inherit'}; font-size: ${normalizeCssVal(styles.headingFontSize || styles.fontSize) || '15px'}; font-weight: ${styles.headingFontWeight || styles.fontWeight || '700'}; color: ${styles.headingColor || styles.color || '#0f172a'}; margin: 0;">
          ${content.title || 'Feature Title'}
        </h4>
        <p style="font-family: ${styles.descFontFamily || styles.fontFamily || 'inherit'}; font-size: ${normalizeCssVal(styles.descFontSize) || '13px'}; font-weight: ${styles.descFontWeight || '400'}; color: ${styles.descColor || '#64748b'}; line-height: 1.5; margin: 0;">
          ${content.description || 'Feature description goes here.'}
        </p>
      </div>`;
    }

    // 9. DATA TABLE / COMPARISON TABLE
    case 'table': {
      const headers: string[] = content.headers && content.headers.length > 0
        ? content.headers
        : ['Feature', 'NextForge', 'Traditional Builders'];
      const rows: string[][] = content.rows && content.rows.length > 0
        ? content.rows
        : [
          ['PageSpeed Score', '100 / 100', '65 / 100'],
          ['Code Quality', 'Clean React 19 / Next.js', 'Vendor Bloat'],
          ['Data Ownership', '100%', 'Proprietary Lock-in']
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

      const isCustomDark = styles.bgColor && styles.bgColor !== '#ffffff' && styles.bgColor !== 'transparent';
      const tableBg = styles.bgColor || (isCustomDark ? styles.bgColor : '#0f172a');
      const headerBg = styles.tableHeaderBg || (isCustomDark ? 'rgba(255,255,255,0.1)' : '#1e293b');
      const headerColor = styles.tableHeaderColor || '#f8fafc';
      const headerAlign = styles.tableHeaderAlign || styles.textAlign || 'left';
      const cellAlign = styles.tableCellAlign || styles.textAlign || headerAlign || 'left';
      const headerFontSize = normalizeCssVal(styles.tableHeaderFontSize) || '12px';
      const headerFontWeight = styles.tableHeaderFontWeight || '700';
      const headerBorderColor = styles.tableHeaderBorderColor || styles.borderColor || (isCustomDark ? 'rgba(255,255,255,0.1)' : '#334155');
      const headerPadding = styles.tableHeaderPadding || '12px 14px';

      const rowBorder = styles.borderColor || (isCustomDark ? 'rgba(255,255,255,0.1)' : '#1e293b');
      const textColor = styles.color || '#cbd5e1';
      const isStriped = Boolean(styles.tableStriped);
      const isMiddleHighlighted = !styles.color && styles.highlightMiddleColumn !== false;

      const tableStyle = styleObjectToCss({
        backgroundColor: tableBg,
        color: textColor,
        borderRadius: normalizeCssVal(styles.borderRadius) || '12px',
        border: '1px solid rgba(51, 65, 85, 0.8)',
        overflow: 'hidden',
        boxShadow: styles.shadow || '0 4px 12px rgba(0, 0, 0, 0.2)',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom)
      });

      const colsCount = headers.length;
      const minTableWidth = Math.max(colsCount * 110, 280);

      return `
      <div style="${tableStyle}" class="text-xs w-full">
        <div style="overflow-x: auto; width: 100%;">
          <div style="min-width: ${minTableWidth}px;">
            <!-- Table Header -->
            <div style="display: grid; grid-template-columns: ${gridColsTemplate}; background-color: ${headerBg}; padding: ${headerPadding}; font-weight: ${headerFontWeight}; font-size: ${headerFontSize}; text-align: ${headerAlign}; color: ${headerColor}; border-bottom: 1px solid ${headerBorderColor};">
              ${headers.map(h => `<span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 6px;" title="${h}">${h}</span>`).join('')}
            </div>
            <!-- Table Rows -->
            ${rows.map((row, rIdx) => {
              const isStripe = isStriped && rIdx % 2 === 1;
              const rowBg = isStripe ? 'rgba(255, 255, 255, 0.035)' : tableBg;
              return `
              <div style="display: grid; grid-template-columns: ${gridColsTemplate}; background-color: ${rowBg}; padding: 12px 14px; border-top: 1px solid ${rowBorder}; color: ${textColor}; text-align: ${cellAlign}; align-items: center;">
                ${headers.map((_, cIdx) => {
                  const cell = row[cIdx] !== undefined ? row[cIdx] : '';
                  const highlight = (isMiddleHighlighted && cIdx === 1) ? 'color: #818cf8; font-weight: 600;' : `color: ${textColor};`;
                  return `<span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 6px; ${highlight}" title="${cell}">${cell}</span>`;
                }).join('')}
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
    }

    // 10. ACCORDION (FAQ)
    case 'accordion': {
      const items = content.items && content.items.length > 0 ? content.items : [
        { q: content.title1 || 'Why choose NextForge visual builder?', a: 'Clean React code generation with no proprietary runtime lock-in.' },
        { q: content.title2 || 'How does clean Next.js export work?', a: 'Generates real TypeScript + Tailwind + React 19 code ready for Vercel.' },
        { q: content.title3 || 'Can I use custom React components?', a: 'Yes, full 1-click support for all standard modern frameworks.' }
      ];

      const accStyle = styleObjectToCss({
        color: styles.color || '#ffffff',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom)
      });

      const itemBg = styles.bgColor || '#0f172a';
      const itemBorder = styles.borderColor || '#1e293b';
      const itemRadius = normalizeCssVal(styles.borderRadius) || '12px';
      const itemBorderWidth = normalizeCssVal(styles.borderWidth) || '1px';
      const itemFontSize = normalizeCssVal(styles.fontSize) || '13px';

      return `
      <div data-nf-accordion style="${accStyle}" class="space-y-2 text-xs text-left w-full">
        ${items.map((item: any, idx: number) => `
          <div data-nf-accordion-item style="background-color: ${itemBg}; border: ${itemBorderWidth} ${styles.borderStyle || 'solid'} ${itemBorder}; border-radius: ${itemRadius}; overflow: hidden; box-shadow: ${styles.shadow || 'none'};" class="transition-all shadow-xs">
            <button data-nf-accordion-header type="button" class="w-full p-3.5 font-bold flex justify-between items-center text-left transition-colors hover:opacity-90" style="color: ${styles.color || '#ffffff'}; font-size: ${itemFontSize}; font-family: ${styles.fontFamily || 'inherit'};">
              <span>${item.q}</span>
              <span data-nf-accordion-icon class="transition-transform duration-300 transform" style="${idx === 0 ? 'transform: rotate(180deg);' : ''}">
                ${getSvgIcon('chevronDown', 14, '#818cf8')}
              </span>
            </button>
            <div data-nf-accordion-body class="${idx === 0 ? '' : 'hidden'} px-3.5 pb-3.5 pt-1 text-slate-300 leading-relaxed border-t" style="border-color: ${itemBorder};">
              ${item.a}
            </div>
          </div>
        `).join('')}
      </div>`;
    }

    // 11. TABS
    case 'tabs': {
      const tabList = content.tabs || content.items || [
        { label: 'Architecture', content: 'Edge runtime with automatic static generation and server-side streaming.' },
        { label: 'Database', content: 'Native SQLite local support with instant Cloudflare D1 edge replication.' },
        { label: 'Export', content: 'Generate complete, clean Next.js 15+ repositories with one click.' }
      ];

      const tabsStyle = styleObjectToCss({
        backgroundColor: styles.bgColor || '#0f172a',
        borderColor: styles.borderColor || '#1e293b',
        borderWidth: normalizeCssVal(styles.borderWidth) || '1px',
        borderStyle: styles.borderStyle || 'solid',
        borderRadius: normalizeCssVal(styles.borderRadius) || '16px',
        color: styles.color || '#ffffff',
        padding: '20px',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom)
      });

      return `
      <div data-nf-tabs style="${tabsStyle}" class="space-y-4 text-left transition-all w-full">
        <div class="flex space-x-2 border-b border-slate-800 pb-2.5 overflow-x-auto">
          ${tabList.map((tab: any, idx: number) => `
            <button data-nf-tab-btn type="button" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${idx === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}">
              ${tab.label || tab.title}
            </button>
          `).join('')}
        </div>
        <div>
          ${tabList.map((tab: any, idx: number) => `
            <div data-nf-tab-content class="${idx === 0 ? '' : 'hidden'} text-xs text-slate-300 leading-relaxed">
              ${tab.content || tab.body}
            </div>
          `).join('')}
        </div>
      </div>`;
    }

    // 12. CAROUSEL & MEDIA CAROUSEL
    case 'carousel':
    case 'mediacarousel': {
      const rawItems = content.items || content.images || [
        { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', title: 'Feature Spotlight', caption: 'Highlight your feature or service workflow here.' },
        { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', title: 'Analytics Dashboard', caption: 'High performance edge builder.' }
      ];

      const items = rawItems.map((item: any, i: number) => {
        if (typeof item === 'string') return { url: item, title: '', caption: '' };
        return {
          url: item.url || '',
          title: item.title !== undefined ? item.title : `Slide ${i + 1}`,
          caption: item.caption || item.description || ''
        };
      });

      const effect = content.slideEffect || 'slide-horizontal';
      const duration = content.slideDuration !== undefined ? Number(content.slideDuration) : 500;
      const interval = Math.max(Number(content.slideInterval) || 4, 3);
      const autoSlide = content.autoSlide !== false;
      const slideHeight = normalizeCssVal(content.slideHeight) || '340px';
      const objectFit = content.objectFit || 'cover';

      const showArrows = content.showArrows !== false;
      const showDots = content.showDots !== false;
      const showSlideNumbers = content.showSlideNumbers !== false && content.showNumbers !== false;
      const dotsShape = content.dotsShape || styles.dotsShape || 'dots';
      const dotsSize = content.dotsSize || styles.dotsSize || 'md';
      const dotsBackdrop = content.dotsBackdrop || styles.dotsBackdrop || 'pill';
      const dotsPlacement = content.dotsPlacement || styles.dotsPlacement || 'bottom-center';
      const dotsOrientation = content.dotsOrientation || 'horizontal';
      const dotsCustomX = content.dotsCustomX !== undefined ? Number(content.dotsCustomX) : 50;
      const dotsCustomY = content.dotsCustomY !== undefined ? Number(content.dotsCustomY) : 92;
      const rawDotsOpacity = styles.dotsOpacity !== undefined && styles.dotsOpacity !== ''
        ? styles.dotsOpacity
        : (content.dotsOpacity !== undefined && content.dotsOpacity !== '' ? content.dotsOpacity : undefined);
      const dotsOpacity = rawDotsOpacity !== undefined ? Number(rawDotsOpacity) : 1;
      const activeDotColor = styles.dotActiveColor || '#6366f1';
      const dotColor = styles.dotColor || 'rgba(255, 255, 255, 0.4)';

      // Arrow customization
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

      const arrowOrientation = content.arrowOrientation || 'horizontal';
      const arrowGap = content.arrowGap !== undefined ? Number(content.arrowGap) : 8;
      const arrowCustomX = content.arrowCustomX !== undefined ? Number(content.arrowCustomX) : 50;
      const arrowCustomY = content.arrowCustomY !== undefined ? Number(content.arrowCustomY) : 50;

      // Title & Caption styling
      const titleColor = styles.color || styles.headingColor || '#ffffff';
      const titleFontFamily = styles.fontFamily || styles.headingFontFamily;
      const titleFontSize = normalizeCssVal(styles.fontSize || styles.headingFontSize) || '18px';
      const titleFontWeight = styles.fontWeight || styles.headingFontWeight || '700';
      const titleShadow = styles.textShadow || styles.headingTextShadow;
      const textAlign = styles.textAlign || 'left';

      const captionColor = styles.descColor || '#cbd5e1';
      const captionFontFamily = styles.descFontFamily || styles.fontFamily;
      const captionFontSize = normalizeCssVal(styles.descFontSize) || '13px';
      const captionFontWeight = styles.descFontWeight || '400';

      const sliderStyle = styleObjectToCss({
        backgroundColor: styles.bgColor || '#090d16',
        color: styles.color || '#ffffff',
        border: styles.borderColor ? `${normalizeCssVal(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor}` : '1px solid rgba(51, 65, 85, 0.8)',
        borderRadius: normalizeCssVal(styles.borderRadius) || '16px',
        overflow: arrowPlacement === 'outside' ? 'visible' : 'hidden',
        boxShadow: styles.shadow || '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom)
      });

      // Arrow sizing & shape
      let arrowDimensions = 'w-9 h-9';
      let arrowIconPx = 18;
      if (arrowSize === 'sm') {
        arrowDimensions = 'w-7 h-7';
        arrowIconPx = 14;
      } else if (arrowSize === 'lg') {
        arrowDimensions = 'w-11 h-11';
        arrowIconPx = 22;
      } else if (arrowSize === 'xl') {
        arrowDimensions = 'w-14 h-14';
        arrowIconPx = 26;
      }

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

      const arrowHoverClasses = arrowHoverOnly
        ? 'opacity-0 group-hover:opacity-100 transition-all duration-200'
        : 'transition-all duration-200';

      const prevIconName = arrowIcon === 'arrow' ? 'arrowLeft' : arrowIcon === 'long' ? 'moveLeft' : 'chevronLeft';
      const nextIconName = arrowIcon === 'arrow' ? 'arrowRight' : arrowIcon === 'long' ? 'moveRight' : 'chevronRight';

      const prevButton = `
        <button data-nf-prev type="button" style="background-color: ${arrowShape === 'ghost' ? 'transparent' : arrowBg}; color: ${arrowColor}; border: 1px solid ${arrowBorderColor}; opacity: ${arrowOpacity};" class="${arrowDimensions} ${arrowShapeClasses} flex items-center justify-center shadow-lg hover:scale-110 z-20 cursor-pointer border ${arrowHoverClasses}" title="Previous Slide">
          ${getSvgIcon(prevIconName, arrowIconPx, arrowColor)}
        </button>`;

      const nextButton = `
        <button data-nf-next type="button" style="background-color: ${arrowShape === 'ghost' ? 'transparent' : arrowBg}; color: ${arrowColor}; border: 1px solid ${arrowBorderColor}; opacity: ${arrowOpacity};" class="${arrowDimensions} ${arrowShapeClasses} flex items-center justify-center shadow-lg hover:scale-110 z-20 cursor-pointer border ${arrowHoverClasses}" title="Next Slide">
          ${getSvgIcon(nextIconName, arrowIconPx, arrowColor)}
        </button>`;

      let arrowsHtml = '';
      if (showArrows && items.length > 1) {
        if (arrowPlacement === 'custom') {
          arrowsHtml = `
            <div class="absolute z-20 flex ${arrowOrientation === 'vertical' ? 'flex-col' : 'flex-row'} items-center" style="left: ${arrowCustomX}%; top: ${arrowCustomY}%; transform: translate(-${arrowCustomX}%, -${arrowCustomY}%); gap: ${arrowGap}px;">
              ${prevButton}
              ${nextButton}
            </div>`;
        } else if (arrowPlacement === 'outside') {
          const outsideTop = content.arrowCustomY !== undefined ? `${content.arrowCustomY}%` : '50%';
          arrowsHtml = `
            <div class="absolute -left-3 sm:-left-5 z-20" style="top: ${outsideTop}; transform: translateY(-${outsideTop});">
              ${prevButton}
            </div>
            <div class="absolute -right-3 sm:-right-5 z-20" style="top: ${outsideTop}; transform: translateY(-${outsideTop});">
              ${nextButton}
            </div>`;
        } else if (arrowPlacement === 'top-right') {
          arrowsHtml = `
            <div class="absolute top-3 right-3 flex items-center space-x-1.5 z-20">
              ${prevButton}
              ${nextButton}
            </div>`;
        } else if (arrowPlacement === 'top-left') {
          arrowsHtml = `
            <div class="absolute top-3 left-3 flex items-center space-x-1.5 z-20">
              ${prevButton}
              ${nextButton}
            </div>`;
        } else if (arrowPlacement === 'bottom-right') {
          arrowsHtml = `
            <div class="absolute bottom-3 right-3 flex items-center space-x-1.5 z-20">
              ${prevButton}
              ${nextButton}
            </div>`;
        } else if (arrowPlacement === 'bottom-left') {
          arrowsHtml = `
            <div class="absolute bottom-3 left-3 flex items-center space-x-1.5 z-20">
              ${prevButton}
              ${nextButton}
            </div>`;
        } else if (arrowPlacement === 'bottom-center') {
          arrowsHtml = `
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
              ${prevButton}
              ${nextButton}
            </div>`;
        } else {
          // Default: 'sides'
          const sidesTop = content.arrowCustomY !== undefined ? `${content.arrowCustomY}%` : '50%';
          arrowsHtml = `
            <div class="absolute left-3 z-20" style="top: ${sidesTop}; transform: translateY(-${sidesTop});">
              ${prevButton}
            </div>
            <div class="absolute right-3 z-20" style="top: ${sidesTop}; transform: translateY(-${sidesTop});">
              ${nextButton}
            </div>`;
        }
      }

      // Dots styling
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

      let dotsPlacementClass = 'bottom-3 left-1/2 -translate-x-1/2';
      let dotsCustomStyle = `opacity: ${dotsOpacity};`;

      if (dotsPlacement === 'custom') {
        dotsPlacementClass = '';
        dotsCustomStyle = `opacity: ${dotsOpacity}; left: ${dotsCustomX}%; top: ${dotsCustomY}%; transform: translate(-${dotsCustomX}%, -${dotsCustomY}%);`;
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

      if (arrowPlacement === 'bottom-center' && dotsPlacement === 'bottom-center') {
        dotsPlacementClass = 'bottom-12 left-1/2 -translate-x-1/2';
      }

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

      let dotsHtml = '';
      if (showDots && items.length > 1) {
        dotsHtml = `
          <div style="${dotsCustomStyle}" class="absolute ${dotsPlacementClass} flex ${dotsOrientation === 'vertical' ? 'flex-col space-y-1.5' : 'flex-row space-x-1.5'} items-center z-20 ${dotsBackdropClass} transition-all">
            ${items.map((_: any, i: number) => `
              <button data-nf-dot type="button" style="background-color: ${i === 0 ? activeDotColor : dotColor}; color: ${i === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'};" class="${getDotClasses(i === 0)} transition-all cursor-pointer ${i === 0 ? 'scale-105' : 'hover:opacity-100 opacity-70'}" title="Go to slide ${i + 1}">
                ${dotsShape === 'numbers' ? (i + 1) : ''}
              </button>
            `).join('')}
          </div>`;
      }

      const slideCounterHtml = showSlideNumbers ? `
        <div data-nf-counter class="absolute ${arrowPlacement === 'top-right' ? 'top-3 left-3' : 'top-3 right-3'} bg-slate-950/70 backdrop-blur-sm text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full z-10 border border-white/10 shadow-xs">
          1 / ${items.length}
        </div>` : '';

      return `
      <div data-nf-slider data-auto-slide="${autoSlide}" data-interval="${interval}" style="${sliderStyle}" class="relative group select-none transition-all ${arrowPlacement === 'outside' ? 'overflow-visible px-4 sm:px-6' : 'overflow-hidden'}">
        <div class="relative w-full overflow-hidden rounded-[inherit]" style="height: ${slideHeight}; perspective: 1000px;">
          ${items.map((item: any, i: number) => `
            <div data-nf-slide class="${i === 0 ? '' : 'hidden'} w-full h-full relative nf-slide-${effect}" style="--slide-duration: ${duration}ms; --slide-interval-or-duration: ${interval}s;">
              <img src="${item.url}" alt="${item.title || ''}" style="width: 100%; height: 100%; object-fit: ${objectFit};" />
              ${(item.title || item.caption) ? `
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-5 text-white" style="text-align: ${textAlign};">
                  ${item.title ? `<h4 style="color: ${titleColor}; font-family: ${titleFontFamily || 'inherit'}; font-size: ${titleFontSize}; font-weight: ${titleFontWeight}; text-shadow: ${titleShadow || 'none'}; text-align: ${textAlign}; margin: 0;" class="tracking-tight">${item.title}</h4>` : ''}
                  ${item.caption ? `<p style="color: ${captionColor}; font-family: ${captionFontFamily || 'inherit'}; font-size: ${captionFontSize}; font-weight: ${captionFontWeight}; text-align: ${textAlign}; margin-top: 4px;" class="line-clamp-2">${item.caption}</p>` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}

          ${slideCounterHtml}
        </div>

        ${arrowsHtml}
        ${dotsHtml}
      </div>`;
    }

    // 13. IMAGE BOX (Cards / Carousel / Sliders with arrows & dots)
    case 'imagebox': {
      const rawList =
        content.items && content.items.length > 0
          ? content.items
          : content.url
            ? [
                {
                  id: 'item-default',
                  url: content.url,
                  title: content.title || 'Feature Spotlight',
                  description: content.description || 'Describe your visual highlight or workflow here.'
                }
              ]
            : [
                {
                  id: 'item-default',
                  url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
                  title: 'Feature Spotlight',
                  description: 'Describe your visual highlight or workflow here.'
                }
              ];

      const items = rawList;
      const cardWidth = content.cardWidth && content.cardWidth !== 'auto' ? normalizeCssVal(content.cardWidth) : undefined;
      const imgHeight = content.imageHeight === 'auto' ? 'auto' : (normalizeCssVal(content.imageHeight) || '220px');
      const imgWidth = normalizeCssVal(content.imageWidth) || '100%';
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

      const dotsOrientation = content.dotsOrientation || 'horizontal';
      const dotsCustomX = content.dotsCustomX !== undefined ? Number(content.dotsCustomX) : 50;
      const dotsCustomY = content.dotsCustomY !== undefined ? Number(content.dotsCustomY) : 92;

      const showSlideNumbers = content.showSlideNumbers !== false;

      // Slider motion settings
      const effect = content.slideEffect || 'slide-horizontal';
      const duration = content.slideDuration !== undefined ? Number(content.slideDuration) : 500;
      const interval = Math.max(Number(content.slideInterval) || 4, 3);
      const autoSlide = content.autoSlide !== false;

      // Container styles matching ElementRenderer
      const boxStyle = styleObjectToCss({
        width: cardWidth,
        maxWidth: '100%',
        backgroundColor: styles.bgColor || '#0f172a',
        color: styles.color || '#ffffff',
        border: hasBorder
          ? `${normalizeCssVal(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor}`
          : '1px solid rgba(51, 65, 85, 0.8)',
        borderRadius: normalizeCssVal(styles.borderRadius) || '16px',
        paddingTop: normalizeCssVal(styles.paddingTop),
        paddingBottom: normalizeCssVal(styles.paddingBottom),
        paddingLeft: normalizeCssVal(styles.paddingLeft),
        paddingRight: normalizeCssVal(styles.paddingRight),
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom),
        boxShadow: styles.shadow
      });

      // Arrow Sizing
      let arrowDimensions = 'w-8 h-8';
      let arrowSvgSize = 16;
      if (arrowSize === 'sm') {
        arrowDimensions = 'w-6 h-6';
        arrowSvgSize = 12;
      } else if (arrowSize === 'lg') {
        arrowDimensions = 'w-10 h-10';
        arrowSvgSize = 20;
      } else if (arrowSize === 'xl') {
        arrowDimensions = 'w-12 h-12';
        arrowSvgSize = 24;
      }

      // Arrow Shapes
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

      const arrowHoverClasses = arrowHoverOnly
        ? 'opacity-0 group-hover:opacity-100 transition-all duration-200'
        : 'transition-all duration-200';

      const prevIconSvg = arrowIcon === 'arrow'
        ? getSvgIcon('arrowLeft', arrowSvgSize, arrowColor)
        : arrowIcon === 'long'
        ? getSvgIcon('moveLeft', arrowSvgSize, arrowColor)
        : getSvgIcon('chevronLeft', arrowSvgSize, arrowColor);

      const nextIconSvg = arrowIcon === 'arrow'
        ? getSvgIcon('arrowRight', arrowSvgSize, arrowColor)
        : arrowIcon === 'long'
        ? getSvgIcon('moveRight', arrowSvgSize, arrowColor)
        : getSvgIcon('chevronRight', arrowSvgSize, arrowColor);

      const prevButton = `
        <button data-nf-prev type="button" style="background-color: ${arrowShape === 'ghost' ? 'transparent' : arrowBg}; color: ${arrowColor}; border: 1px solid ${arrowBorderColor}; opacity: ${arrowOpacity};" class="${arrowDimensions} ${arrowShapeClasses} flex items-center justify-center shadow-md hover:scale-110 z-20 cursor-pointer border ${arrowHoverClasses}" title="Previous Slide">
          ${prevIconSvg}
        </button>`;

      const nextButton = `
        <button data-nf-next type="button" style="background-color: ${arrowShape === 'ghost' ? 'transparent' : arrowBg}; color: ${arrowColor}; border: 1px solid ${arrowBorderColor}; opacity: ${arrowOpacity};" class="${arrowDimensions} ${arrowShapeClasses} flex items-center justify-center shadow-md hover:scale-110 z-20 cursor-pointer border ${arrowHoverClasses}" title="Next Slide">
          ${nextIconSvg}
        </button>`;

      let arrowsHtml = '';
      if (showArrows) {
        if (arrowPlacement === 'custom') {
          arrowsHtml = `
            <div class="absolute z-20 flex ${arrowOrientation === 'vertical' ? 'flex-col' : 'flex-row'} items-center" style="left: ${arrowCustomX}%; top: ${arrowCustomY}%; transform: translate(-${arrowCustomX}%, -${arrowCustomY}%); gap: ${arrowGap}px;">
              ${prevButton}
              ${nextButton}
            </div>`;
        } else if (arrowPlacement === 'outside') {
          const outsideTop = content.arrowCustomY !== undefined ? `${content.arrowCustomY}%` : '50%';
          arrowsHtml = `
            <div class="absolute -left-3 sm:-left-4 z-20" style="top: ${outsideTop}; transform: translateY(-${outsideTop});">
              ${prevButton}
            </div>
            <div class="absolute -right-3 sm:-right-4 z-20" style="top: ${outsideTop}; transform: translateY(-${outsideTop});">
              ${nextButton}
            </div>`;
        } else if (arrowPlacement === 'top-right') {
          arrowsHtml = `
            <div class="absolute top-2.5 right-2.5 flex items-center space-x-1.5 z-20">
              ${prevButton}
              ${nextButton}
            </div>`;
        } else if (arrowPlacement === 'top-left') {
          arrowsHtml = `
            <div class="absolute top-2.5 left-2.5 flex items-center space-x-1.5 z-20">
              ${prevButton}
              ${nextButton}
            </div>`;
        } else if (arrowPlacement === 'bottom-right') {
          arrowsHtml = `
            <div class="absolute bottom-2.5 right-2.5 flex items-center space-x-1.5 z-20">
              ${prevButton}
              ${nextButton}
            </div>`;
        } else if (arrowPlacement === 'bottom-left') {
          arrowsHtml = `
            <div class="absolute bottom-2.5 left-2.5 flex items-center space-x-1.5 z-20">
              ${prevButton}
              ${nextButton}
            </div>`;
        } else if (arrowPlacement === 'bottom-center') {
          arrowsHtml = `
            <div class="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-20">
              ${prevButton}
              ${nextButton}
            </div>`;
        } else {
          // Default: 'sides'
          const sidesTop = content.arrowCustomY !== undefined ? `${content.arrowCustomY}%` : '50%';
          arrowsHtml = `
            <div class="absolute left-2.5 z-20" style="top: ${sidesTop}; transform: translateY(-${sidesTop});">
              ${prevButton}
            </div>
            <div class="absolute right-2.5 z-20" style="top: ${sidesTop}; transform: translateY(-${sidesTop});">
              ${nextButton}
            </div>`;
        }
      }

      // Dots styling
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

      let dotsPlacementClass = 'bottom-3 left-1/2 -translate-x-1/2';
      let dotsCustomStyle = `opacity: ${dotsOpacity};`;

      if (dotsPlacement === 'custom') {
        dotsPlacementClass = '';
        dotsCustomStyle = `opacity: ${dotsOpacity}; left: ${dotsCustomX}%; top: ${dotsCustomY}%; transform: translate(-${dotsCustomX}%, -${dotsCustomY}%);`;
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

      if (arrowPlacement === 'bottom-center' && dotsPlacement === 'bottom-center') {
        dotsPlacementClass = 'bottom-12 left-1/2 -translate-x-1/2';
      }

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
        if (dotsSize === 'sm') return isActive ? 'w-4 h-1.5 rounded-full shadow-xs' : 'w-1.5 h-1.5 rounded-full';
        if (dotsSize === 'lg') return isActive ? 'w-8 h-3 rounded-full shadow-xs' : 'w-3 h-3 rounded-full';
        return isActive ? 'w-6 h-2 rounded-full shadow-xs' : 'w-2 h-2 rounded-full';
      };

      let dotsHtml = '';
      if (showDots && items.length > 1) {
        dotsHtml = `
          <div style="${dotsCustomStyle}" class="absolute ${dotsPlacementClass} flex ${dotsOrientation === 'vertical' ? 'flex-col space-y-1.5' : 'flex-row space-x-1.5'} items-center z-20 ${dotsBackdropClass} transition-all">
            ${items.map((_: any, i: number) => `
              <button data-nf-dot type="button" style="background-color: ${i === 0 ? activeDotColor : dotColor}; color: ${i === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'};" class="${getDotClasses(i === 0)} transition-all cursor-pointer ${i === 0 ? 'scale-105' : 'hover:opacity-100 opacity-70'}" title="Go to slide ${i + 1}">
                ${dotsShape === 'numbers' ? (i + 1) : ''}
              </button>
            `).join('')}
          </div>`;
      }

      const slideCounterHtml = (showSlideNumbers && items.length > 1) ? `
        <div data-nf-counter class="absolute top-2.5 right-2.5 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full z-10 border border-white/10">
          1 / ${items.length}
        </div>` : '';

      const captionHtml = `
        <div class="p-4 space-y-2">
          <h4 data-nf-title class="font-bold text-sm" style="font-family: ${styles.fontFamily || 'inherit'}; font-size: ${normalizeCssVal(styles.fontSize) || '15px'}; font-weight: ${styles.fontWeight || '700'}; text-shadow: ${styles.textShadow || 'none'}; color: ${styles.color || '#ffffff'}; margin-bottom: 4px;">
            ${items[0].title || ''}
          </h4>
          <p data-nf-desc class="text-xs leading-relaxed" style="font-family: ${styles.descFontFamily || styles.fontFamily || 'inherit'}; font-size: ${normalizeCssVal(styles.descFontSize) || '12px'}; font-weight: ${styles.descFontWeight || 'normal'}; color: ${styles.descColor || '#94a3b8'}; text-shadow: ${styles.textShadow || 'none'}; line-height: 1.5; margin: 0;">
            ${items[0].description || ''}
          </p>
        </div>`;

      const helperEscape = (str: string) => String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

      return `
      <div data-nf-slider data-auto-slide="${autoSlide && items.length > 1}" data-interval="${interval}" style="${boxStyle}" class="relative text-left shadow-lg group select-none transition-all ${arrowPlacement === 'outside' ? 'overflow-visible px-3' : 'overflow-hidden'}">
        <div class="w-full relative flex items-center justify-center bg-slate-900/40 ${arrowPlacement === 'outside' ? 'overflow-visible' : 'overflow-hidden'}" style="height: ${imgHeight}; perspective: 1000px;">
          ${items.map((item: any, i: number) => `
            <div data-nf-slide data-title="${helperEscape(item.title)}" data-desc="${helperEscape(item.description)}" class="${i === 0 ? '' : 'hidden'} w-full h-full relative overflow-hidden flex items-center justify-center nf-slide-${effect}" style="--slide-duration: ${duration}ms; --slide-interval-or-duration: ${interval}s;">
              <img src="${item.url}" alt="${helperEscape(item.title)}" style="width: ${imgWidth}; height: ${imgHeight === 'auto' ? 'auto' : '100%'}; object-fit: ${objectFit};" class="select-none" />
            </div>
          `).join('')}

          ${slideCounterHtml}
          ${arrowsHtml}
          ${dotsHtml}
        </div>
        ${captionHtml}
      </div>`;
    }

    // 14. PRICING CARD
    case 'pricingcard': {
      const features: string[] = content.features || ['Unlimited dynamic pages', '1-Click ZIP Next.js code export', 'Cloudflare D1 & SQLite Ready'];
      const cardStyle = styleObjectToCss({
        backgroundColor: styles.bgColor || '#0f172a',
        backgroundImage: styles.bgGradient,
        color: styles.color || '#ffffff',
        fontFamily: styles.fontFamily,
        border: `${normalizeCssVal(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor || 'rgba(51, 65, 85, 0.8)'}`,
        borderRadius: normalizeCssVal(styles.borderRadius) || '16px',
        paddingTop: normalizeCssVal(styles.paddingTop) || '24px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '24px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '24px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '24px',
        boxShadow: styles.shadow || '0 10px 25px -5px rgba(0,0,0,0.3)',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom)
      });

      return `
      <div style="${cardStyle}" class="space-y-4 text-left transition-all">
        <div class="flex justify-between items-center">
          <h4 style="font-size: 16px; font-weight: 700;">${content.planName || content.title || 'Pro Tier'}</h4>
          ${content.badge ? `<span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background-color: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3);">${content.badge}</span>` : ''}
        </div>
        <div class="flex items-baseline space-x-1">
          <span style="font-size: 32px; font-weight: 900;">${content.price || '$29'}</span>
          <span style="font-size: 12px; color: #94a3b8;">${content.interval || '/ month'}</span>
        </div>
        <ul class="space-y-2 text-xs text-slate-300">
          ${features.map(f => `<li class="flex items-center space-x-2"><span style="color: #34d399;">&#10003;</span><span>${f}</span></li>`).join('')}
        </ul>
        <a href="${content.buttonUrl || content.url || '#'}" style="display: block; width: 100%; padding: 10px 0; text-align: center; background-color: ${styles.buttonBgColor || '#4f46e5'}; color: ${styles.buttonTextColor || '#ffffff'}; border-radius: ${normalizeCssVal(styles.buttonBorderRadius) || '12px'}; font-size: 12px; font-weight: 700; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);">
          ${content.buttonText || 'Get Started'}
        </a>
      </div>`;
    }

    // 15. INNER ROW (Nested columns inside a column)
    case 'innerrow': {
      const innerCols = content.columns && content.columns.length > 0
        ? content.columns
        : [
            { id: '1', widthPercentage: 50, elements: [] },
            { id: '2', widthPercentage: 50, elements: [] }
          ];

      const gap = normalizeCssVal(content.gap) || '12px';
      const isDefaultEditorBorder = (styles.borderStyle === 'dashed' || !styles.borderStyle) &&
        (styles.borderColor === '#a5b4fc' || styles.borderColor === '#c7d2fe' || !styles.borderColor || styles.borderColor === 'transparent');

      const hasCustomInnerRowBorder = Boolean(
        styles.borderWidth &&
        styles.borderWidth !== '0' &&
        styles.borderWidth !== '0px' &&
        styles.borderStyle !== 'dashed' &&
        !isDefaultEditorBorder
      );

      const innerRowBorder = hasCustomInnerRowBorder
        ? `${normalizeCssVal(styles.borderWidth)} ${styles.borderStyle || 'solid'} ${styles.borderColor || 'transparent'}`
        : undefined;

      const innerRowBgColor = (styles.bgColor && styles.bgColor !== 'rgba(238, 242, 255, 0.25)') ? styles.bgColor : undefined;

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
        innerRowWidth = normalizeCssVal(rawW.includes('%') || rawW.includes('px') ? rawW : `${rawW}%`) || '80%';
        innerRowMaxWidth = '100%';
      }

      const innerRowAlign = styles.align || content.align || 'center';
      let innerRowMarginLeft = 'auto';
      let innerRowMarginRight = 'auto';
      if (innerRowAlign === 'left') {
        innerRowMarginLeft = normalizeCssVal(styles.marginLeft) || '0px';
        innerRowMarginRight = 'auto';
      } else if (innerRowAlign === 'right') {
        innerRowMarginLeft = 'auto';
        innerRowMarginRight = normalizeCssVal(styles.marginRight) || '0px';
      }

      const rowStyle = styleObjectToCss({
        width: innerRowWidth,
        maxWidth: innerRowMaxWidth,
        marginLeft: innerRowMarginLeft,
        marginRight: innerRowMarginRight,
        backgroundColor: innerRowBgColor,
        border: innerRowBorder,
        borderRadius: normalizeCssVal(styles.borderRadius) || (innerRowBgColor ? '12px' : undefined),
        boxShadow: styles.shadow,
        paddingTop: normalizeCssVal(styles.paddingTop) || (innerRowBgColor ? '16px' : undefined),
        paddingBottom: normalizeCssVal(styles.paddingBottom) || (innerRowBgColor ? '16px' : undefined),
        paddingLeft: normalizeCssVal(styles.paddingLeft) || (innerRowBgColor ? '16px' : undefined),
        paddingRight: normalizeCssVal(styles.paddingRight) || (innerRowBgColor ? '16px' : undefined),
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom)
      });

      return `
      <div style="${rowStyle}" class="w-full">
        <div class="flex flex-wrap w-full" style="gap: ${gap};">
          ${innerCols.map((col: any) => {
            const hasCustomColBorder = Boolean(
              (col.styles?.borderWidth && col.styles.borderWidth !== '0' && col.styles.borderWidth !== '0px') ||
              (styles.columnBorderWidth &&
               styles.columnBorderWidth !== '0' &&
               styles.columnBorderWidth !== '0px' &&
               styles.columnBorderStyle &&
               styles.columnBorderStyle !== 'dashed' &&
               styles.columnBorderColor &&
               styles.columnBorderColor !== '#c7d2fe' &&
               styles.columnBorderColor !== 'transparent')
            );
            const colBorder = hasCustomColBorder
              ? `${normalizeCssVal(col.styles?.borderWidth || styles.columnBorderWidth)} ${col.styles?.borderStyle || styles.columnBorderStyle || 'solid'} ${col.styles?.borderColor || styles.columnBorderColor || '#e2e8f0'}`
              : undefined;

            const colBg = col.styles?.bgColor || styles.columnBgColor || undefined;
            const colPadding = normalizeCssVal(col.styles?.padding || styles.columnPadding) || undefined;
            const colRadius = normalizeCssVal(col.styles?.borderRadius || styles.columnBorderRadius) || (colBg || colBorder ? '10px' : undefined);

            const colStyle = styleObjectToCss({
              flex: `1 1 calc(${col.widthPercentage || 50}% - ${gap})`,
              width: `${col.widthPercentage || 50}%`,
              minWidth: '0',
              backgroundColor: colBg,
              border: colBorder,
              borderRadius: colRadius,
              padding: colPadding,
              boxShadow: styles.columnShadow
            });

            return `
            <div style="${colStyle}" class="space-y-3">
              ${(col.elements || []).map((subEl: ElementModel) => renderElementToHtml(subEl)).join('')}
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }

    // 16. TESTIMONIAL
    case 'testimonial': {
      const cardStyle = styleObjectToCss({
        backgroundColor: styles.bgColor || '#f8fafc',
        backgroundImage: styles.bgGradient,
        border: `${normalizeCssVal(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor || '#e2e8f0'}`,
        borderRadius: normalizeCssVal(styles.borderRadius) || '16px',
        paddingTop: normalizeCssVal(styles.paddingTop) || '24px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '24px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '24px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '24px',
        boxShadow: styles.shadow,
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom)
      });

      return `
      <div style="${cardStyle}" class="space-y-3 text-left">
        <div class="flex items-center space-x-1" style="color: #fbbf24;">
          ${'&#9733;'.repeat(content.rating || 5)}
        </div>
        <p style="font-family: ${styles.fontFamily || 'inherit'}; font-size: ${normalizeCssVal(styles.fontSize) || '13px'}; font-style: italic; color: ${styles.color || '#334155'}; line-height: 1.5;">
          "${content.quote || 'NextForge cuts our front-end delivery cycle by 80%. Exporting clean code is a game changer.'}"
        </p>
        <div class="flex items-center space-x-3 pt-1">
          <img src="${content.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'}" alt="${content.author || ''}" style="width: 36px; height: 36px; border-radius: 9999px; object-fit: cover;" />
          <div>
            <h5 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0;">${content.author || 'Sarah Jenkins'}</h5>
            <p style="font-size: 11px; color: #64748b; margin: 0;">${content.role || 'CTO at TechFlow'}</p>
          </div>
        </div>
      </div>`;
    }

    // 17. TEAM MEMBER
    case 'teammember': {
      const cardStyle = styleObjectToCss({
        backgroundColor: styles.bgColor || '#ffffff',
        backgroundImage: styles.bgGradient,
        border: `${normalizeCssVal(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor || '#e2e8f0'}`,
        borderRadius: normalizeCssVal(styles.borderRadius) || '16px',
        paddingTop: normalizeCssVal(styles.paddingTop) || '20px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '20px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '20px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '20px',
        boxShadow: styles.shadow,
        fontFamily: styles.fontFamily,
        textAlign: 'center',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom)
      });

      return `
      <div style="${cardStyle}" class="space-y-3">
        <img src="${content.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}" alt="${content.name || ''}" style="width: 80px; height: 80px; border-radius: 9999px; margin: 0 auto; object-fit: cover; border: 2px solid #6366f1;" />
        <div>
          <h5 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0;">${content.name || 'Alex Rivera'}</h5>
          <p style="font-size: 12px; color: #6366f1; font-weight: 600; margin-top: 2px;">${content.role || 'Head of Engineering'}</p>
        </div>
        ${content.bio ? `<p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">${content.bio}</p>` : ''}
      </div>`;
    }

    // 18. COUNTER
    case 'counter': {
      return `
      <div class="p-4 text-center space-y-1" style="margin-top: ${normalizeCssVal(styles.marginTop) || '0px'}; margin-bottom: ${normalizeCssVal(styles.marginBottom) || '0px'}; background-color: ${styles.bgColor || 'transparent'}; background-image: ${styles.bgGradient || 'none'}; border-radius: ${normalizeCssVal(styles.borderRadius) || '0px'};">
        <div style="font-family: ${styles.fontFamily || 'inherit'}; font-size: ${normalizeCssVal(styles.fontSize) || '36px'}; font-weight: ${styles.fontWeight || '900'}; color: ${styles.color || '#6366f1'}; letter-spacing: -0.025em;">
          <span>${content.value || '99.9'}</span><span>${content.suffix || '%'}</span>
        </div>
        <div style="font-size: 11px; font-weight: 700; color: ${styles.descColor || '#94a3b8'}; text-transform: uppercase; letter-spacing: 0.05em;">
          ${content.label || 'Uptime SLA'}
        </div>
      </div>`;
    }

    // 19. ALERT
    case 'alert': {
      const alertType = content.alertType || 'info';
      const alertPalettes: Record<string, { bg: string; border: string; color: string; icon: string }> = {
        success: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.4)', color: '#a7f3d0', icon: '#34d399' },
        warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.4)', color: '#fde68a', icon: '#fbbf24' },
        error: { bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.4)', color: '#fecdd3', icon: '#fb7185' },
        info: { bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.4)', color: '#c7d2fe', icon: '#818cf8' }
      };
      const pal = alertPalettes[alertType] || alertPalettes.info;
      return `
      <div style="padding: ${normalizeCssVal(styles.paddingTop) || '14px'} ${normalizeCssVal(styles.paddingRight) || '18px'} ${normalizeCssVal(styles.paddingBottom) || '14px'} ${normalizeCssVal(styles.paddingLeft) || '18px'}; border-radius: ${normalizeCssVal(styles.borderRadius) || '12px'}; background-color: ${styles.bgColor || pal.bg}; border: ${normalizeCssVal(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor || pal.border}; color: ${styles.color || pal.color}; font-family: ${styles.fontFamily || 'inherit'}; box-shadow: ${styles.shadow || 'none'}; margin-top: ${normalizeCssVal(styles.marginTop) || '0px'}; margin-bottom: ${normalizeCssVal(styles.marginBottom) || '0px'}; display: flex; align-items: start; gap: 12px;">
        ${getSvgIcon('info', 18, pal.icon)}
        <div>
          <div style="font-weight: 700; color: #ffffff; font-size: 13px;">${content.title || 'Notice'}</div>
          <p style="font-size: 12px; margin-top: 2px; opacity: 0.9;">${content.message || 'Your latest changes are live.'}</p>
        </div>
      </div>`;
    }

    // 20. DIVIDER
    case 'divider': {
      return `<div style="margin: ${normalizeCssVal(styles.marginTop) || '16px'} 0 ${normalizeCssVal(styles.marginBottom) || '16px'} 0; border-bottom: ${styles.borderWidth ? (parseInt(String(styles.borderWidth), 10) || 1) : (content.thickness || 1)}px ${content.style || styles.borderStyle || 'solid'} ${styles.borderColor || '#e2e8f0'};"></div>`;
    }

    // 21. SPACER
    case 'spacer': {
      return `<div style="height: ${content.height || 40}px; width: 100%;"></div>`;
    }

    // 22. MAP
    case 'map': {
      return `
      <div style="height: ${content.height || 200}px; border-radius: ${normalizeCssVal(styles.borderRadius) || '16px'}; background-color: #0f172a; border: 1px solid #1e293b; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; text-align: center; padding: 16px;">
        ${getSvgIcon('mappin', 32, '#f43f5e')}
        <div style="font-size: 13px; font-weight: 700; margin-top: 8px;">${content.address || 'San Francisco, CA'}</div>
        <p style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Interactive Map Location</p>
      </div>`;
    }

    // 23. CONTACT DETAILS
    case 'contactdetails': {
      return `
      <div style="background-color: ${styles.bgColor || '#f8fafc'}; border: 1px solid ${styles.borderColor || '#e2e8f0'}; border-radius: ${normalizeCssVal(styles.borderRadius) || '16px'}; padding: 20px; text-align: left;" class="space-y-2.5">
        <h4 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0f172a; margin-bottom: 8px;">Get in Touch</h4>
        <div style="font-size: 12px; color: #475569;" class="space-y-2">
          <div class="flex items-center space-x-2">${getSvgIcon('mail', 14, '#4f46e5')}<span>${content.email || 'hello@nextforge.dev'}</span></div>
          <div class="flex items-center space-x-2">${getSvgIcon('phone', 14, '#4f46e5')}<span>${content.phone || '+1 (555) 234-5678'}</span></div>
          <div class="flex items-center space-x-2">${getSvgIcon('mappin', 14, '#4f46e5')}<span>${content.address || '77 Innovation Way, CA'}</span></div>
        </div>
      </div>`;
    }

    // 24. LOGO CLOUD
    case 'logocloud': {
      const logos: string[] = content.logos || ['Vercel', 'Cloudflare', 'Supabase', 'Stripe', 'Tailwind'];
      return `
      <div class="p-4 text-center space-y-3">
        <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">
          ${content.title || 'Empowering Modern Engineering Teams'}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-6" style="font-size: 15px; font-weight: 800; color: #64748b;">
          ${logos.map(l => `<span>${l}</span>`).join('')}
        </div>
      </div>`;
    }

    // 25. 3D FLIP BOX
    case 'flipbox': {
      return `
      <div data-nf-flipbox class="flip-card-container cursor-pointer select-none" style="height: 160px; margin: ${normalizeCssVal(styles.marginTop)} 0 ${normalizeCssVal(styles.marginBottom)} 0;">
        <div class="flip-card-inner">
          <div class="flip-card-front flex flex-col items-center justify-center p-6 text-center shadow-lg" style="background-color: ${styles.bgColor || '#4f46e5'}; color: #ffffff; border-radius: ${normalizeCssVal(styles.borderRadius) || '16px'};">
            ${getSvgIcon('zap', 24, '#fde047')}
            <h4 style="font-size: 16px; font-weight: 700; margin-top: 8px;">${content.frontTitle || 'Hover / Click Me'}</h4>
            <p style="font-size: 11px; opacity: 0.85; margin-top: 4px;">Flip to reveal</p>
          </div>
          <div class="flip-card-back flex flex-col items-center justify-center p-6 text-center shadow-lg" style="background-color: #0f172a; color: #ffffff; border-radius: ${normalizeCssVal(styles.borderRadius) || '16px'}; border: 1px solid #1e293b;">
            <h4 style="font-size: 16px; font-weight: 700; color: #818cf8;">${content.backTitle || 'Next.js Ready'}</h4>
            <p style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${content.backDesc || 'Instant export with zero vendor locks.'}</p>
          </div>
        </div>
      </div>`;
    }

    // 26. VIDEO
    case 'video': {
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

      let containerAspect = '16 / 9';
      let containerHeight = '';
      if (aspectRatioVal === 'custom') {
        containerHeight = normalizeCssVal(styles.height) || '400px';
      } else if (aspectRatioVal === '4/3') {
        containerAspect = '4 / 3';
      } else if (aspectRatioVal === '1/1') {
        containerAspect = '1 / 1';
      } else if (aspectRatioVal === '21/9') {
        containerAspect = '21 / 9';
      } else if (aspectRatioVal) {
        containerAspect = aspectRatioVal.replace('/', ' / ');
      }

      const maskShape = styles.maskShape || 'none';
      const clipPathVal = getClipPathForShape(maskShape);
      const overlayData = getVideoOverlayCss(styles);

      const hasBorder = Boolean(
        (styles.borderColor && styles.borderColor !== 'transparent') ||
        (styles.borderWidth && styles.borderWidth !== '0' && styles.borderWidth !== '0px')
      );
      const borderVal = hasBorder
        ? `${normalizeCssVal(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor || '#334155'}`
        : '';

      const containerStyleParts = [
        containerHeight ? `height: ${containerHeight};` : `aspect-ratio: ${containerAspect};`,
        styles.borderRadius ? `border-radius: ${normalizeCssVal(styles.borderRadius)};` : 'border-radius: 16px;',
        borderVal ? `border: ${borderVal};` : '',
        styles.shadow ? `box-shadow: ${styles.shadow};` : 'box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);',
        styles.marginTop ? `margin-top: ${normalizeCssVal(styles.marginTop)};` : '',
        styles.marginBottom ? `margin-bottom: ${normalizeCssVal(styles.marginBottom)};` : '',
        styles.marginLeft ? `margin-left: ${normalizeCssVal(styles.marginLeft)};` : '',
        styles.marginRight ? `margin-right: ${normalizeCssVal(styles.marginRight)};` : '',
        clipPathVal !== 'none' ? `clip-path: ${clipPathVal}; -webkit-clip-path: ${clipPathVal};` : '',
        'position: relative;',
        'overflow: hidden;',
        `background-color: ${styles.bgColor || '#000000'};`,
        'width: 100%;',
        'max-width: 100%;'
      ].filter(Boolean).join(' ');

      if (parsed.type === 'empty') {
        return `
        <div style="${containerStyleParts} display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; color: #94a3b8; border: 1px dashed #334155;">
          <div style="width: 48px; height: 48px; border-radius: 9999px; background-color: rgba(30, 41, 59, 0.8); border: 1px solid rgba(71, 85, 105, 0.5); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; color: #94a3b8;">
            ${getSvgIcon('play', 24, '#94a3b8')}
          </div>
          <p style="font-size: 14px; font-weight: 600; color: #e2e8f0; margin: 0;">No Video Configured</p>
        </div>`;
      }

      let playerHtml = '';
      if (parsed.type === 'youtube' || parsed.type === 'vimeo') {
        playerHtml = `<iframe src="${parsed.embedUrl}" title="${content.title || 'Video Player'}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: none; display: block;"></iframe>`;
      } else {
        const videoAttrs = [
          `src="${parsed.embedUrl}"`,
          !buttonless && controls ? 'controls' : '',
          buttonless || autoplay ? 'autoplay' : '',
          buttonless || loop ? 'loop' : '',
          muted ? 'muted' : '',
          'playsinline',
          'style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block;"'
        ].filter(Boolean).join(' ');
        playerHtml = `<video ${videoAttrs}></video>`;
      }

      const overlayHtml = overlayData
        ? `<div style="position: absolute; inset: 0; pointer-events: none; z-index: 10; background: ${overlayData.background}; opacity: ${overlayData.opacity};"></div>`
        : '';

      return `
      <div style="${containerStyleParts}">
        ${playerHtml}
        ${overlayHtml}
      </div>`;
    }

    // 23. CALL TO ACTION (previously NO case here — a CTA exported as an
    // empty styled div and the headline/button were lost)
    case 'cta': {
      const ctaBtnBg = styles.buttonBgColor || '#ffffff';
      const ctaBtnColor = styles.buttonTextColor || '#4338ca';
      const ctaStyle = styleObjectToCss({
        backgroundColor: styles.bgColor || '#4f46e5',
        backgroundImage: styles.bgGradient,
        color: styles.color || '#ffffff',
        fontFamily: styles.fontFamily,
        textAlign: styles.textAlign || 'center',
        borderRadius: normalizeCssVal(styles.borderRadius) || '16px',
        border: `${normalizeCssVal(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor || 'rgba(129, 140, 248, 0.3)'}`,
        boxShadow: styles.shadow || '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        paddingTop: normalizeCssVal(styles.paddingTop) || '32px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '32px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '32px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '32px',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom)
      });
      return `
      <div style="${ctaStyle}">
        <h3 style="font-family: ${styles.headingFontFamily || styles.fontFamily || 'inherit'}; font-size: ${normalizeCssVal(styles.headingFontSize || styles.fontSize) || '24px'}; font-weight: ${styles.headingFontWeight || styles.fontWeight || '800'}; color: ${styles.headingColor || styles.color || '#ffffff'}; margin: 0 0 12px 0; letter-spacing: -0.025em;">${content.headline || 'Ready to build high-performance Next.js apps?'}</h3>
        <p style="font-family: ${styles.descFontFamily || styles.fontFamily || 'inherit'}; font-size: ${normalizeCssVal(styles.descFontSize) || '14px'}; color: ${styles.descColor || styles.color || '#ffffff'}; opacity: 0.9; max-width: 576px; margin: 0 auto 20px auto; line-height: 1.6;">${content.subheadline || 'Visually assemble components, inspect properties, and export pure production code in seconds.'}</p>
        <a href="${content.url || content.buttonUrl || '#'}" style="display: inline-flex; align-items: center; gap: 8px; background-color: ${ctaBtnBg}; color: ${ctaBtnColor}; padding: 12px 24px; border-radius: ${normalizeCssVal(styles.buttonBorderRadius) || '12px'}; font-size: 12px; font-weight: 700; text-decoration: none; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);"><span>${content.buttonText || 'Get Started Now'}</span>${getSvgIcon('arrowRight', 14, ctaBtnColor)}</a>
      </div>`;
    }

    // 24. FORM (previously NO case here — a form exported as its bare title text)
    case 'form': {
      const formTheme = content.theme || 'dark';
      const fIsLight = formTheme === 'light';
      const fIsMinimal = formTheme === 'minimal';
      const fIsGlass = formTheme === 'glass';
      const fDefaultBg = fIsLight ? '#ffffff' : fIsMinimal ? '#fafafa' : fIsGlass ? 'rgba(15, 23, 42, 0.75)' : '#0f172a';
      const fDefaultBorder = fIsLight ? '#e2e8f0' : fIsMinimal ? '#e4e4e7' : fIsGlass ? 'rgba(255, 255, 255, 0.2)' : '#1e293b';
      const fDefaultColor = (fIsLight || fIsMinimal) ? '#0f172a' : '#ffffff';
      const fDefaultLabel = fIsLight ? '#475569' : fIsMinimal ? '#71717a' : fIsGlass ? '#cbd5e1' : '#94a3b8';
      const fDefaultInputBg = fIsLight ? '#f8fafc' : fIsMinimal ? '#ffffff' : fIsGlass ? 'rgba(255, 255, 255, 0.08)' : '#090d16';
      const fDefaultInputText = (fIsLight || fIsMinimal) ? '#0f172a' : '#f8fafc';
      const fDefaultInputBorder = fIsLight ? '#cbd5e1' : fIsMinimal ? '#e4e4e7' : fIsGlass ? 'rgba(255, 255, 255, 0.2)' : '#334155';
      const fDefaultButtonBg = fIsMinimal ? '#18181b' : '#6366f1';
      const formFields: any[] = content.fields && content.fields.length > 0 ? content.fields : [
        { id: 'f-1', label: 'Full Name', type: 'text', placeholder: 'Full Name...', required: true },
        { id: 'f-2', label: 'Email Address', type: 'email', placeholder: 'Email Address...', required: true },
        { id: 'f-3', label: 'Message', type: 'textarea', placeholder: 'Your message or inquiry...', required: false }
      ];
      const formInputCss = `background-color: ${styles.inputBgColor || fDefaultInputBg}; color: ${styles.inputTextColor || fDefaultInputText}; border: 1px solid ${styles.inputBorderColor || fDefaultInputBorder}; border-radius: ${normalizeCssVal(styles.inputBorderRadius) || '10px'}; width: 100%; padding: 8px 14px; font-size: 12px; box-sizing: border-box;`;
      const formFieldsHtml = formFields.map((field: any, idx: number) => {
        const fieldName = String(field.label || `field-${idx + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `field-${idx + 1}`;
        let control = '';
        if (field.type === 'textarea') {
          control = `<textarea name="${fieldName}" rows="3" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} style="${formInputCss}"></textarea>`;
        } else if (field.type === 'select') {
          const opts = (field.options || ['Option 1', 'Option 2', 'Option 3']).map((opt: string) => `<option value="${opt}">${opt}</option>`).join('');
          control = `<select name="${fieldName}" ${field.required ? 'required' : ''} style="${formInputCss}">${opts}</select>`;
        } else {
          control = `<input type="${field.type || 'text'}" name="${fieldName}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} style="${formInputCss}" />`;
        }
        return `<div style="margin-bottom: 12px;">
          ${field.label ? `<label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 4px; color: ${styles.labelColor || fDefaultLabel};">${field.label}${field.required ? ' <span style="color: #f43f5e;">*</span>' : ''}</label>` : ''}
          ${control}
        </div>`;
      }).join('');
      const formStyle = styleObjectToCss({
        backgroundColor: styles.bgColor || fDefaultBg,
        border: `${normalizeCssVal(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor || fDefaultBorder}`,
        borderRadius: normalizeCssVal(styles.borderRadius) || '16px',
        paddingTop: normalizeCssVal(styles.paddingTop) || '24px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '24px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '24px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '24px',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom),
        boxShadow: applyShadowColor(styles.shadow, styles.shadowColor),
        backdropFilter: fIsGlass ? 'blur(12px)' : undefined,
        textAlign: 'left'
      });
      return `
      <form style="${formStyle}">
        ${content.title ? `<h4 style="font-family: ${styles.fontFamily || 'inherit'}; font-size: ${normalizeCssVal(styles.fontSize) || '15px'}; font-weight: 700; color: ${styles.color || fDefaultColor}; margin: 0 0 16px 0;">${content.title}</h4>` : ''}
        ${formFieldsHtml}
        <button type="submit" style="background-color: ${styles.buttonBgColor || fDefaultButtonBg}; color: ${styles.buttonTextColor || '#ffffff'}; border-radius: ${normalizeCssVal(styles.buttonBorderRadius) || '12px'}; width: ${content.buttonWidth === 'auto' ? 'auto' : '100%'}; padding: 10px 24px; font-weight: 700; font-size: 12px; border: none; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);">${content.buttonText || 'Submit Form'}</button>
      </form>`;
    }

    // 25. GALLERY (previously NO case here — a gallery exported as an empty div)
    case 'gallery': {
      const rawGal: any[] = content.items && content.items.length > 0
        ? content.items
        : (content.images && content.images.length > 0 ? content.images : [
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
          ]);
      const galItems = rawGal.map((item: any, i: number) => typeof item === 'string'
        ? { url: item, title: `Photo ${i + 1}`, caption: '' }
        : { url: item.url || '', title: item.title || `Slide ${i + 1}`, caption: item.caption || item.description || '' });
      const galMode = content.displayMode || (content.columns ? 'grid' : 'slider');
      const galRadius = normalizeCssVal(styles.borderRadius) || '12px';
      const galBorder = (styles.borderColor && styles.borderColor !== 'transparent') || styles.borderWidth
        ? `${normalizeCssVal(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor || '#334155'}`
        : '1px solid rgba(51, 65, 85, 0.3)';
      const galSpacing = `margin-top: ${normalizeCssVal(styles.marginTop) || '0px'}; margin-bottom: ${normalizeCssVal(styles.marginBottom) || '0px'}; padding-top: ${normalizeCssVal(styles.paddingTop) || '0px'}; padding-bottom: ${normalizeCssVal(styles.paddingBottom) || '0px'}; padding-left: ${normalizeCssVal(styles.paddingLeft) || '0px'}; padding-right: ${normalizeCssVal(styles.paddingRight) || '0px'}; background-color: ${styles.bgColor || 'transparent'}; box-shadow: ${styles.shadow || 'none'};`;
      if (galMode === 'grid') {
        const cols = content.columns || 3;
        const gapVal = content.gap !== undefined && content.gap !== '' ? content.gap : (styles.gap ? parseInt(String(styles.gap), 10) : 16);
        return `<div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: ${gapVal}px; ${galSpacing}">${galItems.map((it) => `<figure style="margin: 0; overflow: hidden; border-radius: ${galRadius}; border: ${galBorder};"><img src="${it.url}" alt="${it.title}" style="width: 100%; height: 100%; aspect-ratio: 16/9; object-fit: ${content.objectFit || 'cover'}; display: block;" />${it.caption ? `<figcaption style="font-size: 11px; color: ${styles.descColor || '#94a3b8'}; padding: 6px 8px;">${it.caption}</figcaption>` : ''}</figure>`).join('')}</div>`;
      }
      return `<div style="display: flex; gap: 12px; overflow-x: auto; ${galSpacing}">${galItems.map((it) => `<img src="${it.url}" alt="${it.title}" style="height: ${normalizeCssVal(content.slideHeight) || '340px'}; width: auto; max-width: 100%; object-fit: ${content.objectFit || 'cover'}; border-radius: ${galRadius}; border: ${galBorder}; display: block;" />`).join('')}</div>`;
    }

    // 26. ICON LIST (previously NO case anywhere — store/renderer/exporter)
    case 'iconlist': {
      const listItems: any[] = content.items && content.items.length > 0 ? content.items : [
        { iconName: 'check', text: 'Unlimited dynamic pages' },
        { iconName: 'check', text: '1-Click ZIP Next.js code export' },
        { iconName: 'check', text: 'Zero vendor lock-in' }
      ];
      const liIconColor = styles.iconColor || styles.color || '#6366f1';
      const listStyle = styleObjectToCss({
        backgroundColor: styles.bgColor,
        color: styles.color || '#1e293b',
        fontFamily: styles.fontFamily,
        fontSize: normalizeCssVal(styles.fontSize) || '14px',
        fontWeight: styles.fontWeight,
        textAlign: styles.textAlign || 'left',
        borderRadius: normalizeCssVal(styles.borderRadius),
        border: styles.borderColor ? `${normalizeCssVal(styles.borderWidth) || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor}` : undefined,
        boxShadow: styles.shadow,
        paddingTop: normalizeCssVal(styles.paddingTop) || '8px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '8px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '8px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '8px',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom)
      });
      return `<div style="${listStyle} display: flex; flex-direction: column; gap: ${normalizeCssVal(styles.gap) || '10px'};">${listItems.map((item: any) => `<div style="display: flex; align-items: center; gap: 10px;"><span style="display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; background-color: ${styles.iconBgColor || 'transparent'}; border-radius: ${normalizeCssVal(styles.iconBorderRadius) || '0px'}; padding: ${normalizeCssVal(styles.iconPadding) || '0px'};">${getSvgIcon(item.iconName || 'check', parseInt(normalizeCssVal(styles.iconSize) || '16', 10) || 16, liIconColor)}</span><span>${item.text || ''}</span></div>`).join('')}</div>`;
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
      const logoHeightStr = normalizeCssVal(content.logoHeight) || '40px';
      const logoWidthStr = content.logoWidth && content.logoWidth !== 'auto' ? normalizeCssVal(content.logoWidth) : 'auto';

      const rawLogoList = logos.length > 0 ? logos : [{ id: 'l1', name: 'Brand', url: '', svg: '' }];
      const textLoop = [...mqItems, ...mqItems, ...mqItems, ...mqItems];
      const logoLoop = [...rawLogoList, ...rawLogoList, ...rawLogoList, ...rawLogoList];

      const safeId = String(el.id || 'mq').replace(/[^a-zA-Z0-9_-]/g, '-');
      const animId = `nf-mq-${safeId}`;
      const keyframeName = `kf-${animId}`;
      const isReverse = direction === 'right';

      let effectCss = '';
      let maskStyle = '';
      if (effect === 'blur-edges') {
        maskStyle = '-webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);';
      } else if (effect === 'grayscale') {
        effectCss = `.${animId} .nf-mq-item { filter: grayscale(100%); opacity: 0.75; transition: filter 0.3s ease, opacity 0.3s ease; } .${animId} .nf-mq-item:hover { filter: grayscale(0%); opacity: 1; }`;
      } else if (effect === 'opacity-dim') {
        effectCss = `.${animId} .nf-mq-item { opacity: 0.55; transition: opacity 0.3s ease; } .${animId} .nf-mq-item:hover { opacity: 1; }`;
      }

      const mqStyle = styleObjectToCss({
        backgroundColor: styles.bgColor || (mode === 'logos' ? '#ffffff' : '#0f172a'),
        backgroundImage: styles.bgGradient,
        color: styles.color || (mode === 'logos' ? '#0f172a' : '#ffffff'),
        fontFamily: styles.fontFamily,
        fontSize: normalizeCssVal(styles.fontSize) || '14px',
        fontWeight: styles.fontWeight || '700',
        textAlign: styles.textAlign,
        borderRadius: normalizeCssVal(styles.borderRadius) || (mode === 'logos' ? '16px' : '999px'),
        boxShadow: styles.shadow,
        border: styles.borderColor ? `${normalizeCssVal(styles.borderWidth) || '1px'} solid ${styles.borderColor}` : undefined,
        paddingTop: normalizeCssVal(styles.paddingTop) || (mode === 'logos' ? '18px' : '10px'),
        paddingBottom: normalizeCssVal(styles.paddingBottom) || (mode === 'logos' ? '18px' : '10px'),
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom),
        overflow: 'hidden',
        position: 'relative',
        whiteSpace: 'nowrap'
      });

      const trackItemsHtml = mode === 'logos'
        ? logoLoop.map((logo: any) => {
            const hasSvg = Boolean(logo.svg && logo.svg.trim().startsWith('<'));
            let innerContent = '';
            if (hasSvg) {
              innerContent = `<div style="height: ${logoHeightStr}; max-height: 100%; width: ${logoWidthStr}; display: inline-flex; align-items: center;">${logo.svg.replace(/<svg(\s|>)/i, `<svg style="height:${logoHeightStr};max-height:100%;width:auto;max-width:100%;display:block;"$1`)}</div>`;
            } else if (logo.url) {
              innerContent = `<img src="${logo.url}" alt="${logo.name || 'Brand Logo'}" style="height: ${autoHeight ? logoHeightStr : 'auto'}; max-height: 100%; width: ${logoWidthStr !== 'auto' ? logoWidthStr : 'auto'}; object-fit: contain; display: block;" />`;
            } else {
              innerContent = `<span style="font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 6px; background: #f1f5f9; color: #475569;">${logo.name || 'Logo'}</span>`;
            }
            const itemDiv = `<div class="nf-mq-item" title="${logo.name || ''}" style="display: inline-flex; align-items: center; justify-content: center; height: ${autoHeight ? logoHeightStr : 'auto'}; width: ${logoWidthStr !== 'auto' ? logoWidthStr : 'auto'}; flex-shrink: 0;">${innerContent}</div>`;
            if (logo.link && String(logo.link).trim()) {
              return `<a href="${logo.link}" target="_blank" rel="noopener noreferrer" title="${logo.name ? `${logo.name} (${logo.link})` : logo.link}" style="display: inline-flex; align-items: center; text-decoration: none; color: inherit;">${itemDiv}</a>`;
            }
            return itemDiv;
          }).join('')
        : textLoop.map((item: string) => `<span class="nf-mq-item" style="display: inline-flex; align-items: center; flex-shrink: 0;"><span style="padding: 0 8px;">${item}</span>${mqSep ? `<span style="opacity: 0.6; margin-left: ${Math.round(itemGap / 2)}px;">${mqSep}</span>` : ''}</span>`).join('');

      return `
        <div class="nf-marquee ${animId}" style="${mqStyle} ${maskStyle}">
          <style>
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
          </style>
          <div class="nf-mq-track">
            ${trackItemsHtml}
          </div>
        </div>
      `;
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
      const psStyle = styleObjectToCss({
        backgroundColor: styles.bgColor,
        backgroundImage: styles.bgGradient,
        color: styles.color || '#0f172a',
        fontFamily: styles.fontFamily,
        borderRadius: normalizeCssVal(styles.borderRadius) || '16px',
        boxShadow: styles.shadow,
        paddingTop: normalizeCssVal(styles.paddingTop) || '20px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '20px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '20px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '20px',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom)
      });
      return `<div style="${psStyle}"><div style="display: grid; grid-template-columns: repeat(${Math.max(steps.length, 1)}, minmax(0, 1fr)); gap: ${normalizeCssVal(styles.gap) || '20px'}; position: relative;">${steps.length > 1 ? `<div style="position: absolute; top: 24px; left: 12%; right: 12%; border-top: 2px dashed ${psAccent}55;"></div>` : ''}${steps.map((step: any, idx: number) => `<div style="text-align: center; position: relative; padding: 0 4px;"><div style="position: relative; width: 48px; height: 48px; margin: 0 auto;"><span style="display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 9999px; background-color: ${styles.iconBgColor || '#eef2ff'}; color: ${psAccent};">${getSvgIcon(step.iconName || 'check', 22, psAccent)}</span><span style="position: absolute; top: -8px; right: -10px; font-size: 20px; font-weight: 900; color: ${psAccent}; line-height: 1;">${idx + 1}</span></div><h4 style="font-size: ${normalizeCssVal(styles.headingFontSize) || '15px'}; font-weight: 700; color: ${styles.headingColor || styles.color || '#0f172a'}; margin: 12px 0 4px;">${step.title || ''}</h4><p style="font-size: ${normalizeCssVal(styles.descFontSize) || '12px'}; color: ${styles.descColor || '#64748b'}; line-height: 1.55; margin: 0;">${step.description || ''}</p></div>`).join('')}</div></div>`;
    }

    // 29. SKILL BARS
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
      const barStyle = content.barStyle || 'pill';
      const barHeight = normalizeCssVal(content.barHeight || styles.barHeight) || '10px';
      const percentPosition = content.percentPosition || 'header';
      const animationType = content.animationType || 'stripes';
      const animationSpeed = content.animationSpeed || '1.4s';
      const showTipGlow = content.showTipGlow !== false;
      const interactiveHover = content.interactiveHover !== false;
      const fillGradient = content.fillGradient || styles.bgGradient;
      const gapVal = normalizeCssVal(styles.gap) || '16px';
      const safeId = String(el.id || 'sb').replace(/[^a-zA-Z0-9_-]/g, '-');
      const barRadius = barStyle === 'pill' ? '9999px' : barStyle === 'rounded' ? '8px' : '0px';

      const animStyles = `
        <style>
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
            ) !important;
            background-size: 28px 28px !important;
            animation: kf-sb-stripes-${safeId} ${animationSpeed} linear infinite !important;
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
        </style>
      `;

      const sbStyle = styleObjectToCss({
        color: styles.color || '#0f172a',
        fontFamily: styles.fontFamily,
        fontSize: normalizeCssVal(styles.fontSize) || '13px',
        borderRadius: normalizeCssVal(styles.borderRadius),
        boxShadow: styles.shadow,
        paddingTop: normalizeCssVal(styles.paddingTop) || '8px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '8px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '8px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '8px',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom)
      });

      const barsHtml = bars.map((bar: any) => {
        const pct = Math.max(0, Math.min(100, Number(bar.percent) ?? 0));
        const itemColor = bar.color || defaultBarColor;
        const isSegmented = barStyle === 'segmented';

        const tagHtml = bar.tag
          ? `<span style="font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 999px; background-color: ${itemColor}18; color: ${itemColor}; letter-spacing: 0.02em;">${bar.tag}</span>`
          : '';

        const badgePctHtml = percentPosition === 'badge'
          ? `<span style="font-size: 10px; font-weight: 800; padding: 1px 8px; border-radius: 999px; background-color: ${itemColor}; color: #ffffff;">${pct}%</span>`
          : '';

        const headerPctHtml = percentPosition === 'header'
          ? `<span style="font-weight: 700; font-variant-numeric: tabular-nums; color: ${styles.color || '#0f172a'};">${pct}%</span>`
          : '';

        if (isSegmented) {
          const segmentsHtml = Array.from({ length: 10 }).map((_, segIdx) => {
            const isFilled = pct >= (segIdx + 1) * 10;
            const glowStyle = isFilled && showTipGlow && segIdx === Math.floor(pct / 10) - 1 ? `box-shadow: 0 0 6px ${itemColor};` : '';
            return `<div style="border-radius: 3px; background-color: ${isFilled ? itemColor : trackBg}; transition: all 0.3s ease; ${glowStyle}"></div>`;
          }).join('');

          return `
            <div class="nf-skill-item" style="transition: transform 0.2s ease;">
              <div style="display: flex; align-items: center; justify-content: space-between; font-weight: 600; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>${bar.label || 'Skill'}</span>
                  ${tagHtml}
                  ${badgePctHtml}
                </div>
                ${headerPctHtml}
              </div>
              <div style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 3px; height: ${barHeight};">
                ${segmentsHtml}
              </div>
            </div>
          `;
        }

        const animClass = animationType === 'stripes' ? 'sb-animated-stripes' : animationType === 'pulse' ? 'sb-animated-pulse' : '';
        const shimmerHtml = animationType === 'shimmer' ? '<div class="sb-animated-shimmer"></div>' : '';
        const tipGlowHtml = (showTipGlow && pct > 0 && pct < 100)
          ? `<span style="position: absolute; right: -2px; top: 50%; transform: translateY(-50%); width: 6px; height: 6px; border-radius: 9999px; background-color: #ffffff; box-shadow: 0 0 8px 2px ${itemColor}, 0 0 4px #ffffff; pointer-events: none;"></span>`
          : '';
        const insidePctHtml = (percentPosition === 'inside' && pct >= 12)
          ? `<span style="padding-right: 8px; font-size: 10px; font-weight: 800; color: #ffffff; line-height: 1; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${pct}%</span>`
          : '';
        const floatingPctHtml = percentPosition === 'floating'
          ? `<div style="position: absolute; right: 0; top: -26px; transform: translateX(50%); background-color: ${itemColor}; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.18); pointer-events: none; white-space: nowrap; z-index: 10;">${pct}%<div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid ${itemColor};"></div></div>`
          : '';

        return `
          <div class="nf-skill-item" style="transition: transform 0.2s ease;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-weight: 600; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>${bar.label || 'Skill'}</span>
                ${tagHtml}
                ${badgePctHtml}
              </div>
              ${headerPctHtml}
            </div>
            <div style="height: ${barHeight}; border-radius: ${barRadius}; background-color: ${trackBg}; overflow: ${percentPosition === 'floating' ? 'visible' : 'hidden'}; position: relative;">
              <div class="${animClass}" style="width: ${pct}%; height: 100%; border-radius: ${barRadius}; background-color: ${itemColor}; background-image: ${fillGradient || 'none'}; position: relative; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: flex-end; ${interactiveHover ? `box-shadow: 0 2px 8px ${itemColor}44;` : ''}">
                ${shimmerHtml}
                ${tipGlowHtml}
                ${insidePctHtml}
                ${floatingPctHtml}
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="nf-skillbar-wrap sb-${safeId}" style="${sbStyle} display: flex; flex-direction: column; gap: ${gapVal};">
          ${animStyles}
          ${barsHtml}
        </div>
      `;
    }

    // 30. COUNTDOWN TIMER (static boxes + live ticking via generateSharedJs)
    case 'countdown': {
      const targetMs = content.targetDate ? new Date(content.targetDate).getTime() : NaN;
      const diffMs = isNaN(targetMs) ? 0 : targetMs - Date.now();
      const cdLabels = content.labels || { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' };
      const cdAccent = styles.iconColor || '#6366f1';
      const cdStyle = styleObjectToCss({
        backgroundColor: styles.bgColor || '#0f172a',
        backgroundImage: styles.bgGradient,
        color: styles.color || '#ffffff',
        fontFamily: styles.fontFamily,
        borderRadius: normalizeCssVal(styles.borderRadius) || '16px',
        boxShadow: styles.shadow,
        paddingTop: normalizeCssVal(styles.paddingTop) || '20px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '20px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '20px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '20px',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom)
      });
      const cdFinished = content.finishedText || 'The offer has ended';
      const cdTargetAttr = content.targetDate || '';
      if (!isNaN(targetMs) && diffMs <= 0) {
        return `<div data-nf-countdown data-target="${cdTargetAttr}" data-finished="${cdFinished}" style="${cdStyle} display: flex; justify-content: center;"><div style="font-weight: 700; text-align: center;">${cdFinished}</div></div>`;
      }
      const cdVals = [
        { v: Math.floor(Math.max(diffMs, 0) / 86400000), l: cdLabels.days || 'Days' },
        { v: Math.floor(Math.max(diffMs, 0) / 3600000) % 24, l: cdLabels.hours || 'Hours' },
        { v: Math.floor(Math.max(diffMs, 0) / 60000) % 60, l: cdLabels.minutes || 'Minutes' },
        { v: Math.floor(Math.max(diffMs, 0) / 1000) % 60, l: cdLabels.seconds || 'Seconds' }
      ];
      return `<div data-nf-countdown data-target="${cdTargetAttr}" data-finished="${cdFinished}" style="${cdStyle} display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">${cdVals.map((part) => `<div style="min-width: 72px; text-align: center; background-color: ${cdAccent}; border-radius: 12px; padding: 12px 10px;"><div data-nf-countdown-value style="font-size: ${normalizeCssVal(styles.fontSize) || '28px'}; font-weight: 800; line-height: 1;">${String(part.v).padStart(2, '0')}</div><div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.85; margin-top: 4px;">${part.l}</div></div>`).join('')}</div>`;
    }

    // 31. SOCIAL ICONS
    case 'socialicons': {
      // iconRegistry has NO brand icons: map each network to the closest
      // generic lucide icon available there (same map as ElementRenderer).
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
      const siJustify = styles.textAlign === 'center' ? 'center' : styles.textAlign === 'right' ? 'flex-end' : 'flex-start';
      return `<div style="display: flex; gap: ${normalizeCssVal(styles.gap) || '10px'}; flex-wrap: wrap; justify-content: ${siJustify}; padding: ${normalizeCssVal(styles.paddingTop) || '8px'} ${normalizeCssVal(styles.paddingRight) || '8px'} ${normalizeCssVal(styles.paddingBottom) || '8px'} ${normalizeCssVal(styles.paddingLeft) || '8px'}; margin-top: ${normalizeCssVal(styles.marginTop) || '0px'}; margin-bottom: ${normalizeCssVal(styles.marginBottom) || '0px'};">${links.map((link: any) => `<a href="${link.url || '#'}" target="_blank" rel="noopener noreferrer" title="${link.network || 'Social link'}" data-network="${link.network || ''}" style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: ${normalizeCssVal(styles.iconBorderRadius) || '9999px'}; background-color: ${chipBg}; background-image: ${styles.bgGradient || 'none'}; color: ${chipColor}; box-shadow: ${styles.shadow || 'none'}; text-decoration: none;">${getSvgIcon(socialIconFor(link.network), 18, chipColor)}</a>`).join('')}</div>`;
    }

    // 32. RATING (stars)
    case 'rating': {
      const rValue = Math.max(0, Math.min(5, Number(content.value !== undefined ? content.value : 5) || 0));
      const filledCount = Math.round(rValue);
      const starColor = styles.iconColor || '#f59e0b';
      const starsHtml = [0, 1, 2, 3, 4].map((i) => getSvgIcon('star', 20, i < filledCount ? starColor : '#cbd5e1')).join('');
      const rtStyle = styleObjectToCss({
        color: styles.color || '#0f172a',
        fontFamily: styles.fontFamily,
        fontSize: normalizeCssVal(styles.fontSize) || '14px',
        backgroundColor: styles.bgColor,
        backgroundImage: styles.bgGradient,
        borderRadius: normalizeCssVal(styles.borderRadius),
        boxShadow: styles.shadow,
        paddingTop: normalizeCssVal(styles.paddingTop) || '8px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '8px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '8px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '8px',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom)
      });
      const rtJustify = styles.textAlign === 'center' ? 'center' : styles.textAlign === 'right' ? 'flex-end' : 'flex-start';
      return `<div style="${rtStyle} display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: ${rtJustify};" aria-label="Rating: ${rValue} out of 5" data-nf-rating="${rValue}"><span style="display: inline-flex; gap: 2px;">${starsHtml}</span>${content.count ? `<span style="font-weight: 600;">${content.count}</span>` : ''}<span style="display: none;">${'★'.repeat(filledCount)}</span></div>`;
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
      const textShadowVal = styles.textShadow || '';
      const textShadowCss = textShadowVal ? `text-shadow: ${textShadowVal};` : '';
      const dateFontSize = normalizeCssVal(styles.dateFontSize) || '11px';
      const tagFontSize = normalizeCssVal(styles.tagFontSize) || '10px';
      const cardBoxShadow = styles.shadow || '0 4px 12px rgba(0,0,0,0.03)';
      const headerJustify = textAlignVal === 'center'
        ? 'center'
        : textAlignVal === 'right'
        ? 'flex-end'
        : textAlignVal === 'justify'
        ? 'space-between'
        : 'flex-start';

      const cardBg = styles.cardBgColor || (tlTheme === 'neon' ? '#090d16' : tlTheme === 'glassmorphism' ? 'rgba(255,255,255,0.7)' : '#f8fafc');
      const cardBorder = styles.cardBorderColor || (tlTheme === 'neon' ? `${tlAccent}55` : tlTheme === 'glassmorphism' ? 'rgba(255,255,255,0.3)' : '#e2e8f0');
      const cardRadius = normalizeCssVal(styles.cardBorderRadius) || '14px';
      const tlGap = normalizeCssVal(styles.gap) || '24px';

      const dotRadius = dotShape === 'circle' ? '9999px' : dotShape === 'square' ? '3px' : '2px';
      const dotTransform = dotShape === 'diamond' ? 'transform: rotate(45deg);' : '';
      const safeId = String(el.id || 'tl').replace(/[^a-zA-Z0-9_-]/g, '-');
      const pulseAnimId = `tl-pulse-${safeId}`;

      const pulseStyle = pulseDots ? `
        <style>
          @keyframes kf-${pulseAnimId} {
            0%, 100% { box-shadow: 0 0 0 0 ${dotColor}66; }
            50% { box-shadow: 0 0 0 7px ${dotColor}00; }
          }
          .${pulseAnimId} .nf-tl-dot-pulse {
            animation: kf-${pulseAnimId} 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        </style>
      ` : '';

      const tlStyle = styleObjectToCss({
        backgroundColor: styles.bgColor,
        backgroundImage: styles.bgGradient,
        color: styles.color || (tlTheme === 'neon' ? '#f8fafc' : '#0f172a'),
        fontFamily: styles.fontFamily,
        borderRadius: normalizeCssVal(styles.borderRadius) || '16px',
        boxShadow: styles.shadow,
        textAlign: textAlignVal,
        paddingTop: normalizeCssVal(styles.paddingTop) || '20px',
        paddingBottom: normalizeCssVal(styles.paddingBottom) || '20px',
        paddingLeft: normalizeCssVal(styles.paddingLeft) || '20px',
        paddingRight: normalizeCssVal(styles.paddingRight) || '20px',
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom),
        position: 'relative'
      });

      if (tlTheme === 'alternating') {
        return `
          <div class="nf-timeline nf-timeline-alternating ${pulseAnimId}" style="${tlStyle}">
            ${pulseStyle}
            <div style="position: relative; display: flex; flex-direction: column; gap: ${tlGap};">
              <div style="position: absolute; top: 12px; bottom: 12px; left: 50%; transform: translateX(-50%); width: ${lineWidth}; border-left: ${lineWidth} ${lineStyle} ${tlAccent}; z-index: 0;"></div>
              ${tlItems.map((item: any, idx: number) => {
                const isEven = idx % 2 === 0;
                const leftCard = isEven ? `
                  <div style="background-color: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: ${cardRadius}; padding: 14px 18px; box-shadow: ${cardBoxShadow}; text-align: right;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-bottom: 4px;">
                      ${item.tag ? `<span style="font-size: ${tagFontSize}; font-weight: 800; padding: 2px 8px; border-radius: 999px; background-color: ${tagBgColor}; color: ${tagColor}; ${textShadowCss}">${item.tag}</span>` : ''}
                      <span style="font-size: ${dateFontSize}; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: ${dateColor}; ${textShadowCss}">${item.date || ''}</span>
                    </div>
                    <h4 style="font-size: ${normalizeCssVal(styles.headingFontSize || styles.fontSize) || '15px'}; font-weight: 700; color: ${styles.headingColor || styles.color || '#0f172a'}; margin: 2px 0 4px; text-align: right; ${textShadowCss}">${item.title || ''}</h4>
                    <p style="font-size: ${normalizeCssVal(styles.descFontSize) || '13px'}; color: ${styles.descColor || '#64748b'}; line-height: 1.55; margin: 0; text-align: right; ${textShadowCss}">${item.description || ''}</p>
                  </div>
                ` : '';
                const rightCard = !isEven ? `
                  <div style="background-color: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: ${cardRadius}; padding: 14px 18px; box-shadow: ${cardBoxShadow}; text-align: ${textAlignVal};">
                    <div style="display: flex; align-items: center; justify-content: ${headerJustify}; gap: 8px; margin-bottom: 4px;">
                      <span style="font-size: ${dateFontSize}; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: ${dateColor}; ${textShadowCss}">${item.date || ''}</span>
                      ${item.tag ? `<span style="font-size: ${tagFontSize}; font-weight: 800; padding: 2px 8px; border-radius: 999px; background-color: ${tagBgColor}; color: ${tagColor}; ${textShadowCss}">${item.tag}</span>` : ''}
                    </div>
                    <h4 style="font-size: ${normalizeCssVal(styles.headingFontSize || styles.fontSize) || '15px'}; font-weight: 700; color: ${styles.headingColor || styles.color || '#0f172a'}; margin: 2px 0 4px; text-align: ${textAlignVal}; ${textShadowCss}">${item.title || ''}</h4>
                    <p style="font-size: ${normalizeCssVal(styles.descFontSize) || '13px'}; color: ${styles.descColor || '#64748b'}; line-height: 1.55; margin: 0; text-align: ${textAlignVal === 'justify' ? 'justify' : textAlignVal}; ${textShadowCss}">${item.description || ''}</p>
                  </div>
                ` : '';
                return `
                  <div style="position: relative; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; z-index: 1;">
                    <div style="padding-right: ${isEven ? '24px' : '0'}; text-align: ${isEven ? 'right' : textAlignVal};">${leftCard}</div>
                    <div style="display: flex; justify-content: center; align-items: center; width: 28px;">
                      <span class="${pulseDots ? 'nf-tl-dot-pulse' : ''}" style="width: ${dotSize}; height: ${dotSize}; border-radius: ${dotRadius}; ${dotTransform} background-color: ${dotColor}; border: 2px solid #ffffff; box-shadow: 0 0 0 2px ${dotColor}55; flex-shrink: 0;"></span>
                    </div>
                    <div style="padding-left: ${!isEven ? '24px' : '0'}; text-align: ${textAlignVal};">${rightCard}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      // Left-spine themes
      const isCardLike = tlTheme === 'card' || tlTheme === 'glassmorphism' || tlTheme === 'neon';
      const spineCardShadow = styles.shadow || (tlTheme === 'neon' ? `0 0 16px ${tlAccent}15` : '0 4px 16px rgba(0,0,0,0.03)');
      return `
        <div class="nf-timeline nf-timeline-${tlTheme} ${pulseAnimId}" style="${tlStyle}">
          ${pulseStyle}
          <div style="position: relative;">
            <div style="position: absolute; top: 12px; bottom: 12px; left: ${tlTheme === 'minimal' ? '7px' : '11px'}; width: ${lineWidth}; border-left: ${lineWidth} ${lineStyle} ${tlAccent}; ${tlTheme === 'neon' ? `box-shadow: 0 0 10px ${tlAccent};` : ''} z-index: 0;"></div>
            <div style="display: flex; flex-direction: column; gap: ${tlGap};">
              ${tlItems.map((item: any) => `
                <div style="position: relative; padding-left: ${tlTheme === 'minimal' ? '28px' : '36px'}; z-index: 1;">
                  <span class="${pulseDots ? 'nf-tl-dot-pulse' : ''}" style="position: absolute; left: ${tlTheme === 'minimal' ? '2px' : '5px'}; top: ${isCardLike ? '16px' : '4px'}; width: ${dotSize}; height: ${dotSize}; border-radius: ${dotRadius}; ${dotTransform} background-color: ${dotColor}; border: ${tlTheme === 'neon' ? `2px solid ${dotColor}` : '2px solid #ffffff'}; box-shadow: ${tlTheme === 'neon' ? `0 0 12px ${dotColor}, 0 0 4px ${dotColor}` : `0 0 0 2px ${dotColor}55`}; z-index: 2;"></span>
                  <div style="${isCardLike ? `background-color: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: ${cardRadius}; padding: 16px 20px; box-shadow: ${spineCardShadow}; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); text-align: ${textAlignVal};` : `text-align: ${textAlignVal};`}">
                    <div style="display: flex; align-items: center; justify-content: ${headerJustify}; width: 100%; flex-wrap: wrap; gap: 8px; margin-bottom: 4px;">
                      ${tlTheme === 'badge-pill'
                        ? `<span style="font-size: ${dateFontSize}; font-weight: 800; padding: 3px 10px; border-radius: 999px; background-color: ${dateColor}; color: #ffffff; letter-spacing: 0.04em; ${textShadowCss}">${item.date || ''}</span>`
                        : `<span style="font-size: ${dateFontSize}; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: ${dateColor}; ${textShadowCss}">${item.date || ''}</span>`
                      }
                      ${item.tag ? `<span style="font-size: ${tagFontSize}; font-weight: 800; padding: 2px 8px; border-radius: 999px; background-color: ${tagBgColor}; color: ${tagColor}; ${textShadowCss}">${item.tag}</span>` : ''}
                    </div>
                    <h4 style="font-size: ${normalizeCssVal(styles.headingFontSize || styles.fontSize) || '15px'}; font-weight: 700; color: ${styles.headingColor || styles.color || (tlTheme === 'neon' ? '#ffffff' : '#0f172a')}; margin: 2px 0 4px; text-align: ${textAlignVal}; ${textShadowCss}">${item.title || ''}</h4>
                    <p style="font-size: ${normalizeCssVal(styles.descFontSize) || '13px'}; color: ${styles.descColor || (tlTheme === 'neon' ? '#94a3b8' : '#64748b')}; line-height: 1.55; margin: 0; text-align: ${textAlignVal === 'justify' ? 'justify' : textAlignVal}; ${textAlignVal === 'justify' ? 'text-align-last: justify; text-justify: inter-word;' : ''} ${textShadowCss}">${item.description || ''}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    case 'typewriterheadline': {
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

      const fontSize = normalizeCssVal(styles.fontSize) || '36px';
      const textAlignVal = styles.textAlign || content.textAlign || 'center';
      const baseColor = styles.color || '#0f172a';
      const fontWeight = styles.fontWeight || '700';

      const safeId = String(el.id || 'twh').replace(/[^a-zA-Z0-9_-]/g, '-');
      const rootClass = `nf-twh-${safeId}`;

      const twhStyle = styleObjectToCss({
        fontSize,
        textAlign: textAlignVal,
        color: baseColor,
        fontWeight,
        fontFamily: styles.fontFamily,
        lineHeight: '1.3',
        paddingTop: normalizeCssVal(styles.paddingTop),
        paddingBottom: normalizeCssVal(styles.paddingBottom),
        marginTop: normalizeCssVal(styles.marginTop),
        marginBottom: normalizeCssVal(styles.marginBottom),
        textTransform: styles.textTransform
      });

      const prefixWithSpace = prefixText ? `${escapeHtml(prefixText)}${!prefixText.endsWith(' ') ? ' ' : ''}` : '';
      const suffixWithSpace = suffixText ? `${!suffixText.startsWith(' ') ? ' ' : ''}${escapeHtml(suffixText)}` : '';

      return `
        <div class="nf-typewriter-headline ${rootClass}" style="${twhStyle}">
          <style>
            @keyframes nf-twh-cursor-blink-${safeId} {
              0%, 49% { opacity: 1; }
              50%, 100% { opacity: 0; }
            }
            .${rootClass} .nf-tw-cursor {
              animation: nf-twh-cursor-blink-${safeId} 0.8s infinite;
              display: inline-block;
              font-weight: 300;
              margin-left: 2px;
            }
          </style>
          <span class="nf-tw-prefix">${prefixWithSpace}</span><span class="nf-tw-rotating-word" style="color: ${rotatingWordColor}; font-weight: ${rotatingWordBold ? '800' : 'normal'}; text-transform: ${rotatingWordUppercase ? 'uppercase' : 'none'}; display: inline;">${escapeHtml(rawWords[0] ? rawWords[0].slice(0, 1) : '')}</span>${showCursor ? `<span class="nf-tw-cursor" style="color: ${cursorColor};">${escapeHtml(cursorChar)}</span>` : ''}<span class="nf-tw-suffix">${suffixWithSpace}</span>
        </div>
        <script>
        (function() {
          function initTwh() {
            var container = document.querySelector('.${rootClass}');
            if (!container) return;
            var wordEl = container.querySelector('.nf-tw-rotating-word');
            if (!wordEl) return;
            var words = ${JSON.stringify(rawWords)};
            if (!words.length) return;
            var typeSpeed = ${typeSpeed};
            var deleteSpeed = ${deleteSpeed};
            var pauseTime = ${pauseTime};
            var wordIdx = 0;
            var currentText = '';
            var isDeleting = false;

            function step() {
              var targetWord = words[wordIdx] || '';
              if (!isDeleting) {
                if (currentText.length < targetWord.length) {
                  currentText = targetWord.slice(0, currentText.length + 1);
                  wordEl.textContent = currentText;
                  setTimeout(step, typeSpeed);
                } else {
                  isDeleting = true;
                  setTimeout(step, pauseTime);
                }
              } else {
                if (currentText.length > 0) {
                  currentText = currentText.slice(0, -1);
                  wordEl.textContent = currentText || '\\u200B';
                  setTimeout(step, deleteSpeed);
                } else {
                  isDeleting = false;
                  wordIdx = (wordIdx + 1) % words.length;
                  setTimeout(step, typeSpeed);
                }
              }
            }
            step();
          }
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initTwh);
          } else {
            initTwh();
          }
        })();
        </script>
      `;
    }

    case 'lottie': {
      const lottieUrl = content.url || 'https://assets5.lottiefiles.com/packages/lf20_myejioos.json';
      const autoplay = content.autoplay !== false;
      const loop = content.loop !== false;
      const speed = Number(content.speed) || 1;
      const hoverPlay = Boolean(content.hoverPlay);
      const showControls = Boolean(content.showControls);

      const width = normalizeCssVal(styles.width) || '280px';
      const height = normalizeCssVal(styles.height) || '280px';
      const align = styles.align || content.align || 'center';
      const borderRadius = normalizeCssVal(styles.borderRadius) || '0px';
      const bgColor = styles.bgColor || 'transparent';

      const justifyMap: Record<string, string> = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end'
      };

      return `
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
        <div class="nf-lottie-wrap" style="display: flex; justify-content: ${justifyMap[align] || 'center'}; width: 100%;">
          <div style="width: ${width}; height: ${height}; border-radius: ${borderRadius}; background-color: ${bgColor}; overflow: hidden; position: relative;">
            <lottie-player
              src="${escapeHtml(lottieUrl)}"
              background="transparent"
              speed="${speed}"
              style="width: 100%; height: 100%; display: block;"
              ${loop ? 'loop' : ''}
              ${autoplay ? 'autoplay' : ''}
              ${hoverPlay ? 'hover' : ''}
              ${showControls ? 'controls' : ''}
            ></lottie-player>
          </div>
        </div>
      `;
    }

    default:
      return `<div style="${elStyleStr}">${content.text || content.title || ''}</div>`;
  }
}


// Public element renderer: renders the element, then applies the generic
// element-level concerns that individual cases do not handle themselves —
// the same concerns the canvas preview wrapper applies in ElementRenderer:
// customId / customClass (Advanced tab), zIndex, left/right margins, and the
// generic hover keys (hoverColor / hoverBgColor / hoverBorderColor /
// hoverShadow / hoverScale) for non-button elements (buttons have their own
// dedicated hover system). Without this wrapper those settings were silently
// dropped from every export.
export function renderElementToHtml(el: ElementModel): string {
  const html = renderElementToHtmlInner(el);
  const styles = el.styles || {};

  const hasHover = el.type !== 'button' && Boolean(
    styles.hoverColor || styles.hoverBgColor || styles.hoverBorderColor || styles.hoverShadow ||
    (styles.hoverScale !== undefined && styles.hoverScale !== '' && styles.hoverScale !== null)
  );
  const hasReveal = Boolean(styles.scrollReveal && styles.scrollReveal !== 'none');
  const hasParallax = Boolean(styles.parallaxSpeed && styles.parallaxSpeed !== 'none');
  const hasWrapperStyles = Boolean(
    styles.customId || styles.customClass || hasHover || hasReveal || hasParallax ||
    (styles.zIndex !== undefined && styles.zIndex !== '') ||
    styles.marginLeft || styles.marginRight
  );
  if (!hasWrapperStyles) return html;

  const safeId = String(el.id || 'el').replace(/[^a-zA-Z0-9_-]/g, '-');
  const hoverClass = hasHover ? `nfh-${safeId}` : '';
  const revealClass = hasReveal ? `nf-reveal nf-reveal-${styles.scrollReveal}` : '';
  const parallaxClass = hasParallax ? 'nf-parallax' : '';
  const wrapperClass = [styles.customClass || '', hoverClass, revealClass, parallaxClass].filter(Boolean).join(' ');
  const wrapperStyle = styleObjectToCss({
    marginLeft: normalizeCssVal(styles.marginLeft),
    marginRight: normalizeCssVal(styles.marginRight),
    zIndex: styles.zIndex !== undefined && styles.zIndex !== '' ? String(styles.zIndex) : undefined,
    position: (styles.zIndex !== undefined && styles.zIndex !== '') || hasParallax ? 'relative' : undefined
  });

  const revealAttrs = hasReveal
    ? ` data-nf-reveal="${styles.scrollReveal}" data-nf-reveal-delay="${styles.scrollRevealDelay || 0}" data-nf-reveal-duration="${styles.scrollRevealDuration || 600}"`
    : '';
  const parallaxAttrs = hasParallax ? ` data-nf-parallax="${styles.parallaxSpeed}"` : '';

  let styleBlock = '';
  if (hasHover) {
    const decls: string[] = [];
    if (styles.hoverColor) decls.push(`color: ${styles.hoverColor} !important;`);
    if (styles.hoverBgColor) decls.push(`background-color: ${styles.hoverBgColor} !important;`);
    if (styles.hoverBorderColor) decls.push(`border-color: ${styles.hoverBorderColor} !important;`);
    if (styles.hoverShadow) decls.push(`box-shadow: ${styles.hoverShadow} !important;`);
    if (styles.hoverScale !== undefined && styles.hoverScale !== '' && styles.hoverScale !== null) {
      const hs = String(styles.hoverScale);
      decls.push(`transform: ${hs.includes('scale') ? hs : `scale(${hs})`} !important;`);
    }
    styleBlock = `<style>.${hoverClass} > :not(style) { transition: box-shadow 0.3s ease, transform 0.3s ease, background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease; } .${hoverClass}:hover > :not(style) { ${decls.join(' ')} }</style>`;
  }

  return `<div${styles.customId ? ` id="${styles.customId}"` : ''}${wrapperClass ? ` class="${wrapperClass}"` : ''}${wrapperStyle ? ` style="${wrapperStyle}"` : ''}${revealAttrs}${parallaxAttrs}>${html}${styleBlock}</div>`;
}

// Render Column to HTML (100% matched with ElementRenderer & App.tsx preview)
export function renderColumnToHtml(col: ColumnModel, colGutter = '8px', isStretchCols = false, secStyles?: ElementStyles): string {
  const hasColBorder = Boolean(
    col.styles?.borderWidth &&
    col.styles.borderWidth !== '0' &&
    col.styles.borderWidth !== '0px' &&
    col.styles?.borderColor &&
    col.styles.borderColor !== 'transparent' &&
    col.styles.borderColor !== '#a5b4fc' &&
    col.styles.borderColor !== '#c7d2fe' &&
    col.styles?.borderStyle !== 'dashed'
  );

  const hasColCardStyles = Boolean(
    col.styles?.bgColor ||
    col.styles?.bgGradient ||
    col.styles?.bgImage ||
    hasColBorder ||
    col.styles?.shadow
  );

  const colVAlign = col.styles?.contentVerticalAlign || col.styles?.verticalAlign || secStyles?.contentVerticalAlign || secStyles?.verticalAlign || 'top';
  const colJustify = colVAlign === 'center' ? 'center' : colVAlign === 'bottom' ? 'flex-end' : 'flex-start';

  const colCardStyles = styleObjectToCss({
    backgroundColor: col.styles?.bgColor,
    backgroundImage: col.styles?.bgImage ? `url("${col.styles.bgImage}")` : (col.styles?.bgGradient || undefined),
    backgroundSize: col.styles?.bgSize || 'cover',
    backgroundPosition: col.styles?.bgPosition || 'center',
    paddingTop: normalizeCssVal(col.styles?.paddingTop) || (hasColCardStyles ? '16px' : undefined),
    paddingBottom: normalizeCssVal(col.styles?.paddingBottom) || (hasColCardStyles ? '16px' : undefined),
    paddingLeft: normalizeCssVal(col.styles?.paddingLeft) || (hasColCardStyles ? '16px' : undefined),
    paddingRight: normalizeCssVal(col.styles?.paddingRight) || (hasColCardStyles ? '16px' : undefined),
    borderRadius: normalizeCssVal(col.styles?.borderRadius) || (hasColCardStyles ? '12px' : undefined),
    borderWidth: hasColBorder ? normalizeCssVal(col.styles?.borderWidth) : undefined,
    borderColor: hasColBorder ? col.styles?.borderColor : undefined,
    borderStyle: hasColBorder ? (col.styles?.borderStyle || 'solid') : undefined,
    boxShadow: col.styles?.shadow,
    minHeight: normalizeCssVal(col.styles?.minHeight) || (hasColCardStyles ? '140px' : undefined),
    height: col.styles?.height ? normalizeCssVal(col.styles.height) : (isStretchCols ? '100%' : undefined)
  });

  return `
    <div class="nf-col min-w-0 flex-shrink-0 ${isStretchCols ? 'flex flex-col' : ''}" style="width: ${col.widthPercentage}%; padding-left: ${colGutter}; padding-right: ${colGutter}; box-sizing: border-box;">
      <div class="relative flex flex-col ${isStretchCols ? 'h-full flex-1' : ''} ${hasColCardStyles ? 'rounded-xl p-4' : ''}" style="${colCardStyles}">
        <div class="space-y-4 flex-1 w-full flex flex-col" style="justify-content: ${colJustify};">
          ${(col.elements || []).map(el => renderElementToHtml(el)).join('')}
        </div>
      </div>
    </div>`;
}

// Render Row to HTML
export function renderRowToHtml(row: RowModel, secStyles?: ElementStyles): string {
  const isStretchCols = Boolean(secStyles?.equalHeightColumns || row.styles?.rowVerticalAlign === 'stretch');
  const colGapRaw = row.styles?.columnGap || secStyles?.columnGap;
  const colGutter = colGapRaw ? `${Math.max(0, parseInt(colGapRaw, 10)) / 2}px` : '8px';
  const gutterPx = parseFloat(colGutter) || 8;

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
    rowCustomW = normalizeCssVal(row.styles.rowCustomWidth);
  }

  const rowAlign = row.styles?.rowAlign || 'center';
  let rowMarginLeft = 'auto';
  let rowMarginRight = 'auto';

  if (rowAlign === 'left') {
    rowMarginLeft = row.styles?.marginLeft ? normalizeCssVal(row.styles.marginLeft) : '0px';
    rowMarginRight = 'auto';
  } else if (rowAlign === 'right') {
    rowMarginLeft = 'auto';
    rowMarginRight = row.styles?.marginRight ? normalizeCssVal(row.styles.marginRight) : '0px';
  }

  const isDefaultRowBorder = (row.styles?.borderStyle === 'dashed') ||
    row.styles?.borderColor === '#a5b4fc' ||
    row.styles?.borderColor === '#c7d2fe' ||
    row.styles?.borderColor === 'transparent';

  const hasRowBorder = Boolean(
    row.styles?.borderWidth &&
    row.styles.borderWidth !== '0' &&
    row.styles.borderWidth !== '0px' &&
    !isDefaultRowBorder
  );

  const rowBorderColor = hasRowBorder ? row.styles?.borderColor : undefined;
  const rowBorderStyle = hasRowBorder ? (row.styles?.borderStyle || 'solid') : undefined;
  const rowBorderWidth = hasRowBorder ? normalizeCssVal(row.styles?.borderWidth) : undefined;

  const rowStyleStr = styleObjectToCss({
    width: rowCustomW || '100%',
    maxWidth: rowMaxWidth ? `min(100%, ${rowMaxWidth})` : '100%',
    backgroundColor: row.styles?.bgColor,
    backgroundImage: row.styles?.bgImage ? `url("${row.styles.bgImage}")` : (row.styles?.bgGradient || undefined),
    backgroundSize: row.styles?.bgSize || 'cover',
    backgroundPosition: row.styles?.bgPosition || 'center',
    paddingTop: normalizeCssVal(row.styles?.paddingTop),
    paddingBottom: normalizeCssVal(row.styles?.paddingBottom),
    paddingLeft: normalizeCssVal(row.styles?.paddingLeft),
    paddingRight: normalizeCssVal(row.styles?.paddingRight),
    marginTop: normalizeCssVal(row.styles?.marginTop),
    marginBottom: normalizeCssVal(row.styles?.marginBottom),
    marginLeft: rowMarginLeft,
    marginRight: rowMarginRight,
    borderRadius: normalizeCssVal(row.styles?.borderRadius),
    borderWidth: rowBorderWidth,
    borderColor: rowBorderColor,
    borderStyle: rowBorderStyle,
    boxShadow: row.styles?.shadow,
    minHeight: normalizeCssVal(row.styles?.minHeight)
  });

  const verticalAlignClass = isStretchCols
    ? 'items-stretch'
    : row.styles?.rowVerticalAlign === 'bottom'
    ? 'items-end'
    : row.styles?.rowVerticalAlign === 'center'
    ? 'items-center'
    : 'items-start';

  return `
    <div class="relative rounded-xl transition-all" style="${rowStyleStr}">
      <div class="flex flex-wrap w-full gap-y-4 ${verticalAlignClass}" style="margin-left: -${colGutter}; margin-right: -${colGutter}; width: calc(100% + ${gutterPx * 2}px);">
        ${(row.columns || []).map(col => renderColumnToHtml(col, colGutter, isStretchCols, secStyles)).join('')}
      </div>
    </div>`;
}

// Render Section to HTML (100% matched with ElementRenderer & App.tsx preview)
export function renderSectionToHtml(sec: SectionModel): string {
  const hasStickyNav = sec.columns?.some((c: any) =>
    c.elements?.some((e: any) => e.type === 'navigation' && (e.styles?.isSticky ?? e.content?.isSticky))
  );
  const isSecSticky = Boolean(sec.styles?.isSticky || hasStickyNav);
  const isSecScreenFull = sec.styles?.widthType === 'screen';
  const secLayout = getSectionLayoutStyles(sec.styles);

  const activeBgColor = sec.styles?.bgColor || (isSecScreenFull ? 'transparent' : '#ffffff');

  const isDefaultSecBorder = (sec.styles?.borderStyle === 'dashed') ||
    sec.styles?.borderColor === '#a5b4fc' ||
    sec.styles?.borderColor === '#c7d2fe' ||
    sec.styles?.borderColor === 'transparent';

  const hasSecBorder = Boolean(
    sec.styles?.borderWidth &&
    sec.styles.borderWidth !== '0' &&
    sec.styles.borderWidth !== '0px' &&
    !isDefaultSecBorder
  );

  const activeBorderColor = hasSecBorder ? sec.styles?.borderColor : undefined;
  const activeBorderStyle = hasSecBorder ? (sec.styles?.borderStyle || 'solid') : undefined;
  const activeBorderWidth = hasSecBorder ? normalizeCssVal(sec.styles?.borderWidth) : undefined;
  const activeShadow = sec.styles?.shadow;

  const bgImageStyle = sec.styles?.bgImage ? `url("${sec.styles.bgImage}")` : undefined;
  const bgGradientStyle = sec.styles?.bgGradient || undefined;

  const secVAlign = sec.styles?.contentVerticalAlign || sec.styles?.verticalAlign || 'top';
  const secJustify = secVAlign === 'center' ? 'center' : secVAlign === 'bottom' ? 'flex-end' : 'flex-start';

  const rows = sec.rows && sec.rows.length > 0
    ? sec.rows
    : [{ id: `${sec.id}-row-0`, columns: sec.columns || [] }];

  const isParallaxBg = Boolean(sec.styles?.parallaxBg);
  const secReveal = sec.styles?.scrollReveal && sec.styles?.scrollReveal !== 'none' ? sec.styles.scrollReveal : undefined;

  const secStyles = styleObjectToCss({
    backgroundColor: activeBgColor,
    backgroundImage: bgImageStyle || bgGradientStyle,
    backgroundSize: sec.styles?.bgSize || 'cover',
    backgroundPosition: sec.styles?.bgPosition || 'center',
    backgroundRepeat: sec.styles?.bgRepeat || 'no-repeat',
    backgroundAttachment: isParallaxBg ? 'fixed' : undefined,
    width: secLayout.width,
    maxWidth: secLayout.maxWidth,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: secJustify,
    marginTop: secLayout.marginTop,
    marginBottom: secLayout.marginBottom,
    marginLeft: secLayout.marginLeft,
    marginRight: secLayout.marginRight,
    paddingTop: normalizeCssVal(sec.styles?.paddingTop) || '20px',
    paddingBottom: normalizeCssVal(sec.styles?.paddingBottom) || '20px',
    paddingLeft: normalizeCssVal(sec.styles?.paddingLeft) || '20px',
    paddingRight: normalizeCssVal(sec.styles?.paddingRight) || '20px',
    borderRadius: normalizeCssVal(sec.styles?.borderRadius) || (isSecScreenFull ? '0px' : '16px'),
    borderColor: activeBorderColor,
    borderWidth: activeBorderWidth,
    borderStyle: activeBorderStyle,
    boxShadow: activeShadow,
    position: isSecSticky ? 'sticky' : 'relative',
    top: isSecSticky ? '0' : undefined,
    zIndex: isSecSticky ? '40' : (sec.styles?.zIndex !== undefined && sec.styles?.zIndex !== '' ? String(sec.styles.zIndex) : undefined),
    minHeight: normalizeCssVal(sec.styles?.minHeight)
  });

  const secId = sec.customId || sec.id;
  const secClasses = [
    'transition-all relative',
    isSecScreenFull ? 'w-full' : 'mx-auto',
    isParallaxBg ? 'nf-parallax-bg' : '',
    secReveal ? `nf-reveal nf-reveal-${secReveal}` : ''
  ].filter(Boolean).join(' ');

  const secDataAttrs = [
    isParallaxBg ? 'data-nf-parallax-bg="true"' : '',
    secReveal ? `data-nf-reveal="${secReveal}"` : ''
  ].filter(Boolean).join(' ');

  return `
  <section id="${secId}" data-section-id="${sec.id}" data-custom-id="${sec.customId || ''}" ${secDataAttrs} class="${secClasses}" style="${secStyles}">
    ${sec.styles?.bgImage ? `
      <div style="position: absolute; inset: 0; pointer-events: none; border-radius: inherit; background-color: ${sec.styles.bgOverlayColor || '#000000'}; opacity: ${sec.styles.bgOverlayOpacity !== undefined ? sec.styles.bgOverlayOpacity : 0.4}; z-index: 1;"></div>
    ` : ''}
    <div class="space-y-6 relative z-10 w-full">
      ${rows.map(row => renderRowToHtml(row, sec.styles)).join('')}
    </div>
  </section>`;
}

// Generate complete standalone HTML page
export function generatePageHtml(page: PageModel, projectName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.name || projectName} | Built with NextForge</title>
  <!-- Tailwind CSS CDN for instant styling -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- NextForge Shared Custom CSS -->
  <link rel="stylesheet" href="css/styles.css" />
  <style>
    @media (max-width: 768px) {
      .nf-col {
        width: 100% !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body class="min-h-screen bg-white text-slate-800 antialiased font-sans">
  <div class="w-full min-h-screen flex flex-col">
    ${(page.sections || []).map(sec => renderSectionToHtml(sec)).join('')}
  </div>

  <!-- NextForge Interactive JS -->
  <script src="js/main.js"></script>
</body>
</html>`;
}

// Helper to check if a page is the Home page
export function isHomePage(p: PageModel): boolean {
  return p.slug === '/' || p.slug === 'home' || p.slug === 'index' || !p.slug || p.id === 'page-home';
}

// Generate full cPanel Public HTML ZIP
export async function generateCPanelZip(pages: PageModel[], projectName: string): Promise<Blob> {
  const zip = new JSZip();

  // 1. Generate HTML files for each page
  pages.forEach(p => {
    const isHome = isHomePage(p);
    const filename = isHome ? 'index.html' : `${p.slug.replace(/^\//, '')}.html`;
    zip.file(filename, generatePageHtml(p, projectName));
  });

  // Ensure index.html exists
  if (pages.length > 0 && !pages.some(p => isHomePage(p))) {
    zip.file('index.html', generatePageHtml(pages[0], projectName));
  }

  // 2. CSS & JS assets
  zip.file('css/styles.css', generateSharedCss());
  zip.file('js/main.js', generateSharedJs());

  // 3. .htaccess for cPanel clean URLs, HTTPS & Gzip
  zip.file('.htaccess', generateHtaccess());

  // 4. Instructions Readme
  zip.file('CPANEL_INSTRUCTIONS.txt', `NextForge Builder - cPanel Shared Hosting Deployment Guide
=============================================================
Project: ${projectName}

Follow these simple 4 steps to publish your site:
1. Log in to your cPanel account (e.g. yourdomain.com:2083).
2. Open "File Manager" and navigate inside the "public_html" directory.
3. Click "Upload" at the top and select this ZIP file.
4. Right-click the uploaded ZIP inside public_html and select "Extract".

Done! Your website is now live with clean URLs, HTTPS redirection, and caching enabled!
`);

  return zip.generateAsync({ type: 'blob' });
}

// Generate Netlify Deploy ZIP
export async function generateNetlifyZip(pages: PageModel[], projectName: string): Promise<Blob> {
  const zip = new JSZip();
  pages.forEach(p => {
    const isHome = isHomePage(p);
    const filename = isHome ? 'index.html' : `${p.slug.replace(/^\//, '')}.html`;
    zip.file(filename, generatePageHtml(p, projectName));
  });
  if (pages.length > 0 && !pages.some(p => isHomePage(p))) {
    zip.file('index.html', generatePageHtml(pages[0], projectName));
  }
  zip.file('css/styles.css', generateSharedCss());
  zip.file('js/main.js', generateSharedJs());
  zip.file('netlify.toml', `[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
`);

  let redirects = '';
  pages.forEach(p => {
    if (!isHomePage(p) && p.slug) {
      const cleanSlug = p.slug.replace(/^\//, '');
      redirects += `/${cleanSlug} /${cleanSlug}.html 200\n`;
    }
  });
  redirects += `/* /index.html 200\n`;
  zip.file('_redirects', redirects);

  return zip.generateAsync({ type: 'blob' });
}

// Generate Cloudflare Pages configuration ZIP
export async function generateCloudflareZip(pages: PageModel[], projectName: string): Promise<Blob> {
  const zip = new JSZip();
  pages.forEach(p => {
    const isHome = isHomePage(p);
    const filename = isHome ? 'index.html' : `${p.slug.replace(/^\//, '')}.html`;
    zip.file(filename, generatePageHtml(p, projectName));
  });
  if (pages.length > 0 && !pages.some(p => isHomePage(p))) {
    zip.file('index.html', generatePageHtml(pages[0], projectName));
  }
  zip.file('css/styles.css', generateSharedCss());
  zip.file('js/main.js', generateSharedJs());
  zip.file('wrangler.toml', `name = "nextforge-site"
compatibility_date = "2024-01-01"
pages_build_output_dir = "."
`);
  zip.file('_headers', `/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`);
  zip.file('_routes.json', JSON.stringify({ version: 1, include: ['/*'], exclude: [] }, null, 2));

  return zip.generateAsync({ type: 'blob' });
}

// Generate Next.js 14 App Router project ZIP for Vercel
export async function generateVercelNextJsZip(pages: PageModel[], projectName: string): Promise<Blob> {
  const zip = new JSZip();

  // 1. package.json
  const pkgJson = {
    name: (projectName || 'nextforge-site').toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint'
    },
    dependencies: {
      next: '14.2.5',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      'lucide-react': '^0.344.0',
      clsx: '^2.1.1',
      'tailwind-merge': '^2.5.2',
      tailwindcss: '^3.4.1'
    },
    devDependencies: {
      typescript: '^5.4.5',
      '@types/node': '^20.14.9',
      '@types/react': '^18.3.3',
      '@types/react-dom': '^18.3.0',
      postcss: '^8.4.38',
      autoprefixer: '^10.4.19'
    }
  };
  zip.file('package.json', JSON.stringify(pkgJson, null, 2));

  // 2. next.config.mjs
  zip.file('next.config.mjs', `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
};
export default nextConfig;
`);

  // 3. tailwind.config.ts & postcss.config.js
  zip.file('tailwind.config.ts', `import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
export default config;
`);

  zip.file('postcss.config.js', `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
`);

  // 4. tsconfig.json
  zip.file('tsconfig.json', `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`);

  // 5. vercel.json
  zip.file('vercel.json', JSON.stringify({
    version: 2,
    cleanUrls: true,
    headers: [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' }
        ]
      }
    ]
  }, null, 2));

  // 6. app/layout.tsx & app/globals.css
  zip.file('app/layout.tsx', `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${projectName}",
  description: "Crafted with NextForge Builder"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-white text-slate-800">
        {children}
      </body>
    </html>
  );
}
`);

  zip.file('app/globals.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

${generateSharedCss()}
`);

  // 7. app/page.tsx (Home Page)
  const homePage = pages.find(p => isHomePage(p)) || pages[0];
  const homeHtml = (homePage?.sections || []).map(sec => renderSectionToHtml(sec)).join('\n');
  zip.file('app/page.tsx', `'use client';
import React from 'react';

export default function HomePage() {
  return (
    <main className="w-full min-h-screen">
      <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(homeHtml)} }} />
    </main>
  );
}
`);

  // 8. Individual dynamic pages app/[slug]/page.tsx
  pages.forEach(p => {
    if (!isHomePage(p) && p.slug) {
      const cleanSlug = p.slug.replace(/^\//, '');
      const pageHtml = (p.sections || []).map(sec => renderSectionToHtml(sec)).join('\n');
      zip.file(`app/${cleanSlug}/page.tsx`, `'use client';
import React from 'react';

export default function ${p.name.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  return (
    <main className="w-full min-h-screen">
      <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(pageHtml)} }} />
    </main>
  );
}
`);
    }
  });

  // 9. README.md
  zip.file('README.md', `# ${projectName} - Next.js 14 Web Application
Exported from NextForge Builder.

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deploy to Vercel
\`\`\`bash
npm i -g vercel
vercel
\`\`\`
`);

  return zip.generateAsync({ type: 'blob' });
}
