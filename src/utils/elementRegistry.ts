// NextForge — Element Registry (single source of truth for the AI generator)
//
// This list mirrors the element picker: LeftSidebar.tsx + ElementPickerModal.tsx
// expose exactly the WidgetType union from src/types/builder.ts, plus the seven
// newest element types that are being added to that union / picker
// (marquee, processsteps, skillbar, countdown, socialicons, rating, timeline).
//
// The AI site generator may ONLY emit element types listed here. If a type is
// not in this registry it is not in the picker, so a generated site containing
// it would open in the editor with an element the user cannot add, inspect or
// reproduce by hand. aiSiteGenerator.ts enforces this at runtime in el().

export const AVAILABLE_ELEMENT_TYPES = [
  // --- Current WidgetType union (src/types/builder.ts) ---
  'innerrow',
  'heading',
  'text',
  'button',
  'image',
  'imagebox',
  'video',
  'icon',
  'iconbox',
  'flipbox',
  'badge',
  'contentcard',
  'alert',
  'iconlist',
  'counter',
  'testimonial',
  'gallery',
  'carousel',
  'mediacarousel',
  'tabs',
  'accordion',
  'pricingcard',
  'teammember',
  'logocloud',
  'cta',
  'contactdetails',
  'form',
  'map',
  'spacer',
  'divider',
  'table',
  'search',
  'posts',
  'portfolio',
  'collection',
  'navigation',
  'beforeafter',
  // --- New element types (added end-to-end in the round-3 element pass) ---
  'marquee',
  'processsteps',
  'skillbar',
  'countdown',
  'socialicons',
  'rating',
  'timeline',
  'typewriterheadline',
  'lottie'
] as const;

export type AvailableElementType = (typeof AVAILABLE_ELEMENT_TYPES)[number];

export const AVAILABLE_ELEMENT_TYPE_SET: ReadonlySet<string> = new Set<string>(
  AVAILABLE_ELEMENT_TYPES as readonly string[]
);

export function isAvailableElementType(type: unknown): type is AvailableElementType {
  return typeof type === 'string' && AVAILABLE_ELEMENT_TYPE_SET.has(type);
}
