// NextForge AI Site Generator
// Generates a complete, fully editable site as a ProjectFileJSON record.
// The AI never emits raw HTML — every element is built through the builder's
// own createDefaultElement() so the generated site opens in the visual editor
// with the exact same PageModel -> Section -> Column -> Element schema that
// hand-built sites use.
// @ts-nocheck

import { createDefaultElement } from '../store/useBuilderStore';
import { AVAILABLE_ELEMENT_TYPE_SET } from './elementRegistry';

// ---------------------------------------------------------------------------
// UID helper — createDefaultElement() uses Date.now() for ids, which collides
// when many elements are created in the same millisecond, so EVERY generated
// id is overwritten here.
// ---------------------------------------------------------------------------
let uidCounter = 0;
function uid(prefix: string): string {
  uidCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${uidCounter.toString(36)}-${Math.floor(
    Math.random() * 1e6
  ).toString(36)}`;
}

// ---------------------------------------------------------------------------
// Palettes & categories
// ---------------------------------------------------------------------------
export const AI_PALETTES = [
  { id: 'cyber-neon', label: 'Cyber Neon', primary: '#10b981', dark: '#060b13', light: '#0d1824', accent: '#06b6d4', glow: 'rgba(16, 185, 129, 0.45)' },
  { id: 'violet-glass', label: 'Violet Glass', primary: '#8b5cf6', dark: '#090814', light: '#131127', accent: '#ec4899', glow: 'rgba(139, 92, 246, 0.45)' },
  { id: 'indigo', label: 'Electric Indigo', primary: '#6366f1', dark: '#0b0f19', light: '#f8fafc', accent: '#38bdf8', glow: 'rgba(99, 102, 241, 0.45)' },
  { id: 'ocean', label: 'Deep Ocean', primary: '#0284c7', dark: '#031424', light: '#f0f9ff', accent: '#38bdf8', glow: 'rgba(2, 132, 199, 0.45)' },
  { id: 'emerald', label: 'Emerald Mint', primary: '#059669', dark: '#021a13', light: '#ecfdf5', accent: '#34d399', glow: 'rgba(5, 150, 105, 0.45)' },
  { id: 'sunset', label: 'Amber Flame', primary: '#ea580c', dark: '#1c0b05', light: '#fff7ed', accent: '#fbbf24', glow: 'rgba(234, 88, 12, 0.45)' },
  { id: 'luxury-gold', label: 'Obsidian Gold', primary: '#d97706', dark: '#11100e', light: '#fffbeb', accent: '#fbbf24', glow: 'rgba(217, 119, 6, 0.45)' },
  { id: 'minimal-mono', label: 'Monochrome Luxe', primary: '#3b82f6', dark: '#0a0a0a', light: '#ffffff', accent: '#94a3b8', glow: 'rgba(59, 130, 246, 0.45)' }
];

export const AI_CATEGORIES = [
  { id: 'restaurant', label: 'Restaurant & Food' },
  { id: 'beauty-salon', label: 'Beauty Salon & Spa' },
  { id: 'gym', label: 'Gym & Fitness' },
  { id: 'agency', label: 'Agency & Studio' },
  { id: 'saas', label: 'SaaS & Tech Startup' },
  { id: 'shop', label: 'Shop & E-commerce' },
  { id: 'clinic', label: 'Clinic & Health' },
  { id: 'real-estate', label: 'Real Estate' },
  { id: 'generic', label: 'General Business' }
];

// Known-good Unsplash photo IDs already used elsewhere in this codebase.
const PHOTO = {
  analytics: '1460925895917-afdab827c52f',
  dashboard: '1551288049-bebda4e38f71',
  code: '1555066931-4365d14bab8c',
  team: '1522071820081-009f0129c71c',
  workspace: '1507238691740-187a5b1d37b8',
  avatarWoman: '1494790108377-be9c29b29330',
  avatarPerson: '1534528741775-53994a69daeb'
};
const img = (photoId: string, w = 800) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${w}&q=80`;

// ---------------------------------------------------------------------------
// Modern design system (2026 SaaS / agency aesthetic)
// Only style keys that ElementRenderer.tsx (canvas) and codeGenerator.ts
// (export) actually read are used below. Verified while upgrading:
//  - section + element `bgGradient` is applied verbatim as background-image,
//    so it must be a full CSS gradient string.
//  - `fontFamily` is honoured on heading / text / button / iconbox.
//  - iconbox honours iconColor / iconBgColor / iconSize / iconBorderRadius
//    plus headingColor / headingFontSize / headingFontWeight / descColor /
//    descFontSize; its padding is hard-coded, so card spacing comes from
//    the section / column layout instead.
//  - pricingcard / testimonial / counter ignore most typography keys in the
//    exporter (sizes are hard-coded there) — colour, radius, shadow and the
//    content fields (badge, rating, avatar, value/suffix/label) do carry.
// ---------------------------------------------------------------------------
const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const INK = '#0f172a';
const MUTED = '#64748b';
const BODY_ON_DARK = '#cbd5e1';
const SOFT_SHADOW = '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.12)';
const LIFT_SHADOW = '0 20px 40px -12px rgba(15, 23, 42, 0.18)';
const HERO_IMG_SHADOW = '0 24px 48px -12px rgba(0, 0, 0, 0.45), 0 12px 24px -12px rgba(0, 0, 0, 0.35)';
const IMG_SHADOW = '0 24px 48px -16px rgba(15, 23, 42, 0.25)';
const POPULAR_SHADOW = '0 24px 48px -12px rgba(15, 23, 42, 0.35)';

const heroGradient = (p: any) =>
  `radial-gradient(ellipse 80% 60% at 50% -10%, ${p.primary}38 0%, rgba(0, 0, 0, 0) 70%), linear-gradient(180deg, ${p.dark} 0%, ${p.dark} 100%)`;
const primaryGradient = (p: any) => `linear-gradient(135deg, ${p.primary} 0%, ${p.accent || p.primary} 100%)`;
const ctaGradient = (p: any) =>
  `radial-gradient(ellipse 75% 70% at 50% 50%, ${p.accent || p.primary}44 0%, rgba(0, 0, 0, 0) 75%), linear-gradient(135deg, ${p.dark} 0%, ${p.primary} 130%)`;
const darkSurface = (p: any) =>
  `linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)`;

// Category-tailored dynamic rotating keywords for typewriter animated headlines
export const TYPEWRITER_DATA: Record<
  string,
  { prefix: string; rotatingWords: string[]; suffix: string }
> = {
  restaurant: {
    prefix: 'Taste the',
    rotatingWords: ['ARTISANAL', 'SEASONAL', 'EXQUISITE', 'FRESH'],
    suffix: 'flavors at {name}.'
  },
  'beauty-salon': {
    prefix: 'Discover your',
    rotatingWords: ['RADIANT', 'TIMELESS', 'CONFIDENT', 'ELEGANT'],
    suffix: 'look at {name}.'
  },
  gym: {
    prefix: 'Build a',
    rotatingWords: ['STRONGER', 'RELENTLESS', 'FASTER', 'HEALTHIER'],
    suffix: 'version of yourself.'
  },
  agency: {
    prefix: 'We design',
    rotatingWords: ['WORLD-CLASS', 'HIGH-CONVERTING', 'SCALABLE', 'ICONIC'],
    suffix: 'digital brands.'
  },
  saas: {
    prefix: 'Work that is',
    rotatingWords: ['LIGHTNING-FAST', 'INTELLIGENT', 'EFFORTLESS', 'SEAMLESS'],
    suffix: 'for modern teams.'
  },
  shop: {
    prefix: 'Discover',
    rotatingWords: ['CURATED', 'PREMIUM', 'HANDPICKED', 'TIMELESS'],
    suffix: 'essentials at {name}.'
  },
  clinic: {
    prefix: 'Delivering',
    rotatingWords: ['COMPASSIONATE', 'EVIDENCE-BASED', 'PERSONALIZED', 'EXCELLENT'],
    suffix: 'care for families.'
  },
  'real-estate': {
    prefix: 'Find your',
    rotatingWords: ['DREAM', 'LUXURY', 'PERFECT', 'PRIME'],
    suffix: 'property with {name}.'
  },
  generic: {
    prefix: 'Delivering',
    rotatingWords: ['INNOVATIVE', 'RELIABLE', 'POWERFUL', 'MODERN'],
    suffix: 'solutions for growth.'
  }
};

// Deterministic layout variant (0, 1 or 2) from category + palette, so sites
// in different niches / colourways do not all come out identical.
function variantFor(ctx: any, palette: any): number {
  const s = `${ctx.categoryId || ctx.categoryLabel || ''}-${palette.id || ''}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 3;
}

// ---------------------------------------------------------------------------
// Element / column / section builders
// ---------------------------------------------------------------------------
const NEW_ELEMENT_TYPES = new Set([
  'marquee',
  'processsteps',
  'skillbar',
  'countdown',
  'socialicons',
  'rating',
  'timeline',
  'typewriterheadline',
  'lottie'
]);

function el(type: string, content: Record<string, any> = {}, styles: Record<string, any> = {}): any {
  // Elements lock (Workstream A): the AI may only emit element types that
  // exist in the picker. Anything outside AVAILABLE_ELEMENT_TYPES is a bug in
  // the generator, so fail loudly in development instead of shipping a site
  // with an element the user cannot add / inspect by hand.
  if (!AVAILABLE_ELEMENT_TYPE_SET.has(type)) {
    const message =
      `[aiSiteGenerator] Refusing to emit element type "${type}" — it is not in ` +
      `AVAILABLE_ELEMENT_TYPES (src/utils/elementRegistry.ts). The AI may only ` +
      `generate elements that are available in the element picker.`;
    console.error(message);
    throw new Error(message);
  }
  const base: any = createDefaultElement(type);
  base.id = uid('el');
  base.type = type;
  if (!base.label || /^New /.test(String(base.label))) base.label = type;
  base.content = { ...(base.content || {}), ...content };
  base.styles = { ...(base.styles || {}), ...styles };
  // Rewrite nested ids that createDefaultElement hard-codes (f-1, acc-1, ...)
  // and give nested items ids where the content shape carries object items
  // (accordion / iconlist items, timeline items, process steps, skill bars,
  // social links). String items (e.g. marquee items) are left untouched.
  const restamp = (list: any[], prefix: string) =>
    list.map((it: any) =>
      it && typeof it === 'object' && !Array.isArray(it) ? { ...it, id: uid(prefix) } : it
    );
  if (Array.isArray(base.content.fields)) {
    base.content.fields = restamp(base.content.fields, 'field');
  }
  if (Array.isArray(base.content.items)) {
    base.content.items = restamp(base.content.items, 'item');
  }
  if (Array.isArray(base.content.steps)) {
    base.content.steps = restamp(base.content.steps, 'step');
  }
  if (Array.isArray(base.content.bars)) {
    base.content.bars = restamp(base.content.bars, 'bar');
  }
  if (Array.isArray(base.content.links) && base.content.links.every((l: any) => l && typeof l === 'object')) {
    base.content.links = restamp(base.content.links, 'link');
  }
  if (Array.isArray(base.content.columns)) {
    base.content.columns = base.content.columns.map((c: any) => ({ ...c, id: uid('innercol') }));
  }
  return base;
}

function col(widthPercentage: number, elements: any[], verticalAlign: string = 'top'): any {
  return { id: uid('col'), widthPercentage, verticalAlign, elements };
}

function section(name: string, customId: string, styles: Record<string, any>, columns: any[]): any {
  return { id: uid('sec'), name, customId, styles, columns };
}

function headingEl(text: string, styles: Record<string, any> = {}, tag = 'h2'): any {
  return el(
    'heading',
    { text, tag },
    { fontSize: '36px', fontWeight: '800', fontFamily: FONT, color: INK, ...styles }
  );
}

function textEl(text: string, styles: Record<string, any> = {}): any {
  return el(
    'text',
    { text, html: `<p>${text}</p>` },
    { fontSize: '16px', fontFamily: FONT, color: MUTED, ...styles }
  );
}

// Modern dynamic animated heading with glowing rotating keywords
function typewriterHeroEl(ctx: any, palette: any, align = 'left'): any {
  const tw = TYPEWRITER_DATA[ctx.categoryId] || TYPEWRITER_DATA.generic;
  const prefixText = fill(tw.prefix, ctx.businessName, ctx.desc);
  const suffixText = fill(tw.suffix, ctx.businessName, ctx.desc);
  const wordColor = palette.accent || palette.primary;
  return el(
    'typewriterheadline',
    {
      prefixText,
      rotatingWords: tw.rotatingWords,
      suffixText,
      typeSpeed: 90,
      deleteSpeed: 45,
      pauseTime: 2000,
      showCursor: true,
      cursorChar: '|',
      cursorColor: wordColor,
      rotatingWordColor: wordColor,
      rotatingWordBold: true,
      rotatingWordUppercase: true
    },
    {
      fontSize: align === 'center' ? '54px' : '48px',
      fontWeight: '800',
      color: '#ffffff',
      textAlign: align,
      fontFamily: FONT,
      lineHeight: '1.18',
      letterSpacing: '-0.02em'
    }
  );
}

// Pill badge / eyebrow that tops every modern section. `subtext: ''` matters:
// the exporter's badge case prints a hard-coded fallback subtext when both
// subtext and description are undefined.
function badgeEl(text: string, palette: any, opts: Record<string, any> = {}): any {
  const dark = Boolean(opts.dark);
  return el(
    'badge',
    { text, variant: 'pill', iconName: 'sparkles', subtext: '' },
    {
      bgColor: dark ? 'rgba(255, 255, 255, 0.14)' : palette.light,
      color: dark ? '#ffffff' : palette.primary,
      fontSize: '12px',
      fontWeight: '700',
      fontFamily: FONT,
      borderRadius: '999px',
      textAlign: opts.align || 'center'
    }
  );
}

function buttonEl(text: string, palette: any, url = '#contact', opts: Record<string, any> = {}): any {
  const preset = opts.preset || 'gradient';
  const styles: Record<string, any> = {
    bgColor: opts.bgColor || palette.primary,
    color: opts.color || '#ffffff',
    buttonPreset: preset,
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: FONT,
    paddingTop: '14px',
    paddingBottom: '14px',
    paddingLeft: '28px',
    paddingRight: '28px',
    textAlign: opts.align || 'left',
    hoverScale: 1.03
  };
  if (preset === 'gradient') styles.bgGradient = primaryGradient(palette);
  if (opts.borderColor) styles.borderColor = opts.borderColor;
  if (opts.shadow) styles.shadow = opts.shadow;
  return el('button', { text, url }, styles);
}

// Modern section header block: badge pill eyebrow, 36px/800 title, muted
// subtext. The content section directly below it shares the same background
// and carries the big bottom padding, so the pair reads as one section.
function sectionHeader(
  name: string,
  customId: string,
  eyebrow: string,
  title: string,
  sub: string,
  palette: any,
  opts: Record<string, any> = {}
): any {
  const dark = Boolean(opts.dark);
  return section(
    name,
    customId,
    { bgColor: opts.bgColor || (dark ? palette.dark : '#ffffff'), paddingTop: '96px', paddingBottom: '8px' },
    [
      col(100, [
        badgeEl(eyebrow, palette, { dark }),
        headingEl(title, { textAlign: 'center', color: dark ? '#ffffff' : INK }),
        textEl(sub, { textAlign: 'center', color: dark ? BODY_ON_DARK : MUTED, fontSize: '17px' })
      ])
    ]
  );
}

// ---------------------------------------------------------------------------
// Copy banks — per-category marketing copy.
// Templates use {name} for the business name and {desc} for a short phrase
// derived from the user's description (or the bank's fallback phrase).
// ---------------------------------------------------------------------------
interface CopyBank {
  descFallback: string;
  heroHeadline: string;
  heroSub: string;
  servicesHeading: string;
  servicesSub: string;
  services: Array<{ icon: string; title: string; description: string }>;
  benefitsHeading: string;
  benefits: Array<{ title: string; description: string }>;
  aboutHeading: string;
  aboutText: string;
  testimonials: Array<{ quote: string; author: string; role: string }>;
  pricing: Array<{ planName: string; price: string; interval: string; features: string[] }>;
  faqs: Array<{ q: string; a: string }>;
  teamRoles: string[];
  ctaHeadline: string;
  ctaSub: string;
  heroImage: string;
}

const BANKS: Record<string, CopyBank> = {
  restaurant: {
    descFallback: 'seasonal dishes made with fresh, local ingredients',
    heroHeadline: 'A table worth gathering around — welcome to {name}',
    heroSub: '{name} serves {desc}, in a space made for long lunches, loud laughter and second helpings.',
    servicesHeading: 'What we serve',
    servicesSub: 'From slow Sunday brunches to private celebrations, here is what comes out of our kitchen.',
    services: [
      { icon: 'coffee', title: 'All-Day Brunch', description: 'Fresh pastries, proper coffee and brunch classics served until late afternoon.' },
      { icon: 'flame', title: 'Signature Mains', description: 'Our chef\'s seasonal menu, cooked over open flame and made to share.' },
      { icon: 'sparkles', title: 'Private Events', description: 'Birthdays, launches and weddings — full buyouts or our private dining room.' },
      { icon: 'clock', title: 'Express Lunch', description: 'A two-course lunch in under 45 minutes, Monday to Friday.' },
      { icon: 'truck', title: 'Catering & Delivery', description: 'The {name} menu at your office or event, delivered hot and on time.' },
      { icon: 'gift', title: 'Tasting Menus', description: 'Seven courses, one story — our chef\'s tasting menu every Friday and Saturday.' }
    ],
    benefitsHeading: 'Why guests come back',
    benefits: [
      { title: 'Fresh, never frozen', description: 'Produce arrives every morning from local farms we know by name.' },
      { title: 'Booked in seconds', description: 'Real-time reservations with instant confirmation — no phone tag.' },
      { title: 'Everyone eats well', description: 'Full vegetarian, vegan and gluten-free menus, not afterthoughts.' }
    ],
    aboutHeading: 'Our story',
    aboutText: '{name} started with one simple idea: cook the food we love, for the people we love, in a room that feels like home. Years later the menu has grown, but that idea still runs every service.',
    testimonials: [
      { quote: 'The tasting menu at {name} is the best meal we have had this year. Booked again before dessert arrived.', author: 'Amelia Hart', role: 'Regular guest' },
      { quote: 'We hosted our company dinner here for 40 people and the team handled everything flawlessly.', author: 'Daniel Osei', role: 'Office manager' },
      { quote: 'Finally a place where the vegetarian menu is just as exciting as everything else.', author: 'Priya Nair', role: 'Food blogger' }
    ],
    pricing: [
      { planName: 'Lunch Menu', price: '$15', interval: '/ person', features: ['Two courses', 'House drink included', 'Mon–Fri, 12–3pm', 'Vegetarian options'] },
      { planName: 'Tasting Menu', price: '$65', interval: '/ person', features: ['Seven courses', 'Wine pairing available', 'Chef\'s counter seating', 'Seasonal menu'] },
      { planName: 'Private Events', price: '$499', interval: '/ event', features: ['Private dining room', 'Custom menu planning', 'Dedicated staff', 'Up to 60 guests'] }
    ],
    faqs: [
      { q: 'Do I need a reservation?', a: 'Walk-ins are welcome at the bar, but we recommend booking ahead for the dining room, especially on weekends.' },
      { q: 'Do you cater for dietary requirements?', a: 'Yes — vegetarian, vegan, halal and gluten-free menus are always available. Tell us when you book and we will be ready.' },
      { q: 'Can I book the whole restaurant?', a: 'Absolutely. Our team plans full buyouts for up to 120 guests, with custom menus and staffing.' },
      { q: 'Is parking available?', a: 'Yes, validated parking is available in the building garage for up to two hours.' }
    ],
    teamRoles: ['Head Chef', 'Restaurant Manager', 'Head Sommelier'],
    ctaHeadline: 'Hungry? Your table is waiting',
    ctaSub: 'Reserve in under a minute — we will confirm instantly and save your favourite spot.',
    heroImage: PHOTO.workspace
  },
  'beauty-salon': {
    descFallback: 'hair, skin and nail treatments tailored to you',
    heroHeadline: 'Look good, feel unstoppable — {name}',
    heroSub: '{name} offers {desc}, delivered by senior stylists in a calm, beautiful space.',
    servicesHeading: 'Our services',
    servicesSub: 'Every appointment starts with a consultation, so you always leave with exactly what you wanted.',
    services: [
      { icon: 'sparkles', title: 'Cut & Styling', description: 'Precision cuts and styling for every hair type, finished with a relaxing wash.' },
      { icon: 'sun', title: 'Colour & Balayage', description: 'Full colour, balayage and glossing by certified colour specialists.' },
      { icon: 'heart', title: 'Skin & Facials', description: 'Results-driven facials matched to your skin, from glow-ups to deep repair.' },
      { icon: 'star', title: 'Nails & Art', description: 'Manicures, pedicures and custom nail art that actually lasts.' },
      { icon: 'crown', title: 'Bridal Packages', description: 'Trials, on-the-day styling and packages for the whole bridal party.' },
      { icon: 'smile', title: 'Massage & Spa', description: 'Reset with deep-tissue, hot stone or aromatherapy treatments.' }
    ],
    benefitsHeading: 'The {name} difference',
    benefits: [
      { title: 'Senior stylists only', description: 'No juniors learning on your hair — every chair is a specialist.' },
      { title: 'Premium products', description: 'We use salon-grade, cruelty-free products you can also take home.' },
      { title: 'Honest pricing', description: 'Quoted before we start. The price we say is the price you pay.' }
    ],
    aboutHeading: 'A salon built on trust',
    aboutText: '{name} was founded on a simple frustration: salons that rush you. We built the opposite — unhurried appointments, real consultations and results people compliment you on weeks later.',
    testimonials: [
      { quote: 'Best balayage I have ever had. Three months on and it still looks freshly done.', author: 'Sofia Marino', role: 'Colour client' },
      { quote: 'They actually listened in the consultation. I will not trust anyone else with my hair now.', author: 'Grace Liu', role: 'Regular client' },
      { quote: 'Booked the bridal package for six of us — calm, on time, and we all loved the results.', author: 'Hannah Cole', role: 'Bride, June wedding' }
    ],
    pricing: [
      { planName: 'Cut & Finish', price: '$45', interval: '/ session', features: ['Consultation included', 'Wash & blow-dry', 'Styling finish', 'Product advice'] },
      { planName: 'Colour Studio', price: '$95', interval: '/ session', features: ['Full colour or balayage', 'Toner & gloss', 'Treatment mask', 'Cut included'] },
      { planName: 'Total Glow', price: '$149', interval: '/ package', features: ['Cut & colour', 'Signature facial', 'Mani-pedi', 'Take-home care kit'] }
    ],
    faqs: [
      { q: 'How do I book?', a: 'Book online in under a minute, call us, or walk in — we hold a few same-day slots every morning.' },
      { q: 'What if I am not happy with the result?', a: 'Tell us within 7 days and we will adjust it free of charge. Your confidence matters more than the appointment.' },
      { q: 'Which products do you use?', a: 'Only professional, cruelty-free ranges. Your stylist will note exactly what was used in your client file.' },
      { q: 'Do you offer gift cards?', a: 'Yes, digital and boxed gift cards are available for any service or amount.' }
    ],
    teamRoles: ['Master Stylist', 'Colour Specialist', 'Lead Esthetician'],
    ctaHeadline: 'Your best hair day starts here',
    ctaSub: 'Pick your service, pick your stylist, pick a time — we will handle the rest.',
    heroImage: PHOTO.avatarPerson
  },
  gym: {
    descFallback: 'coaching, classes and equipment that get real results',
    heroHeadline: 'Stronger every week — train at {name}',
    heroSub: '{name} gives you {desc}, with coaches who actually coach and a community that keeps you showing up.',
    servicesHeading: 'Train your way',
    servicesSub: 'Whether it is your first session or your five-hundredth, there is a programme built for your level.',
    services: [
      { icon: 'zap', title: 'Strength Training', description: 'Full free-weights and racks area with coached lifting hours every day.' },
      { icon: 'flame', title: 'HIIT Classes', description: '45-minute high-intensity sessions that burn hard and finish fast.' },
      { icon: 'users', title: 'Personal Training', description: 'One-to-one coaching, custom programming and nutrition guidance.' },
      { icon: 'heart', title: 'Yoga & Mobility', description: 'Daily yoga, mobility and breathwork to keep you training injury-free.' },
      { icon: 'target', title: '12-Week Programmes', description: 'Structured plans with check-ins, measurements and a coach in your corner.' },
      { icon: 'clock', title: 'Open 24/7', description: 'Train at 5am or midnight — secure access around the clock for members.' }
    ],
    benefitsHeading: 'Why members stay',
    benefits: [
      { title: 'No queues for kit', description: 'Capped membership numbers mean the rack is free when you need it.' },
      { title: 'Coaches on the floor', description: 'Real coaching included in every membership, not just PT sessions.' },
      { title: 'Cancel anytime', description: 'Rolling monthly plans. No 12-month lock-in, no exit fees.' }
    ],
    aboutHeading: 'Built by lifters, for everyone',
    aboutText: '{name} started because we were tired of gyms that sell memberships and hope you never show up. We built the opposite: a gym that notices when you are gone — and helps you come back stronger.',
    testimonials: [
      { quote: 'Down 14kg in six months. The coaches here changed how I train and how I eat.', author: 'Marcus Reid', role: 'Member since 2023' },
      { quote: 'I joined for the 24/7 access and stayed for the community. Best decision this year.', author: 'Lena Fischer', role: 'HIIT regular' },
      { quote: 'As a complete beginner I was nervous — the induction programme made it easy from day one.', author: 'Tom Alvarez', role: 'New member' }
    ],
    pricing: [
      { planName: 'Off-Peak', price: '$29', interval: '/ month', features: ['Gym floor 9am–4pm', '2 classes / week', 'Locker room access', 'Cancel anytime'] },
      { planName: 'All Access', price: '$49', interval: '/ month', features: ['24/7 gym access', 'Unlimited classes', 'Monthly programme review', 'Guest pass monthly'] },
      { planName: 'Coached', price: '$99', interval: '/ month', features: ['Everything in All Access', '4 PT sessions / month', 'Nutrition plan', 'Priority support'] }
    ],
    faqs: [
      { q: 'Is there a joining fee?', a: 'No joining fee and no annual contract on monthly plans. You can pause or cancel in the app anytime.' },
      { q: 'Can I try before joining?', a: 'Yes — your first session is free, including one class. Book it online and just bring workout clothes.' },
      { q: 'Do you offer student discounts?', a: 'Students save 20% on All Access with a valid student ID.' },
      { q: 'What are the busiest times?', a: 'Weekdays 6–8am and 5–7pm. The app shows live floor capacity so you can plan around the rush.' }
    ],
    teamRoles: ['Head Coach', 'Strength Coach', 'Nutrition Coach'],
    ctaHeadline: 'Your first session is free',
    ctaSub: 'Tour the gym, meet a coach and train — no card, no commitment.',
    heroImage: PHOTO.workspace
  },
  agency: {
    descFallback: 'brand, web and marketing work that moves the numbers',
    heroHeadline: '{name} — the agency behind brands that grow',
    heroSub: 'We deliver {desc} for ambitious companies: strategy first, beautiful execution, and reporting you can actually read.',
    servicesHeading: 'What we do',
    servicesSub: 'One senior team across brand, digital and growth — no hand-offs, no juniors learning on your budget.',
    services: [
      { icon: 'lightbulb', title: 'Brand Strategy', description: 'Positioning, naming and identity systems that make you the obvious choice.' },
      { icon: 'layout', title: 'Web Design', description: 'High-converting websites designed, built and launched by our in-house team.' },
      { icon: 'trendingup', title: 'Performance Marketing', description: 'Paid media managed against revenue targets, not vanity metrics.' },
      { icon: 'megaphone', title: 'Content & Social', description: 'Content engines that compound: editorial, video and social in one calendar.' },
      { icon: 'search', title: 'SEO', description: 'Technical SEO and content programmes that own page one in your category.' },
      { icon: 'barchart', title: 'Analytics & CRO', description: 'Experiment roadmaps that turn your existing traffic into more customers.' }
    ],
    benefitsHeading: 'Why teams pick {name}',
    benefits: [
      { title: 'Senior only', description: 'The people in the pitch are the people on your account. Always.' },
      { title: 'Revenue reporting', description: 'Dashboards tied to pipeline and sales — not impressions and likes.' },
      { title: 'Speed', description: 'First deliverables inside two weeks, with weekly visible progress.' }
    ],
    aboutHeading: 'Small team, outsized results',
    aboutText: '{name} is an independent agency built by operators who have run growth inside companies like yours. We keep the team small on purpose: fewer, better people, fully accountable for outcomes.',
    testimonials: [
      { quote: '{name} rebuilt our site and pipeline grew 3x in a quarter. They report like owners, not vendors.', author: 'Rachel Kim', role: 'VP Marketing, B2B SaaS' },
      { quote: 'Finally an agency that says no to bad ideas — and brings better ones. Worth every cent.', author: 'Oliver Grant', role: 'Founder, D2C brand' },
      { quote: 'Weekly progress, honest numbers, creative that our sales team actually uses.', author: 'Marta Vidal', role: 'Head of Growth' }
    ],
    pricing: [
      { planName: 'Project', price: '$4.9k', interval: '/ from', features: ['Brand or website project', 'Fixed scope & timeline', 'Senior design team', 'Launch support'] },
      { planName: 'Growth Partner', price: '$3.5k', interval: '/ month', features: ['Dedicated senior pod', 'Marketing + design', 'Weekly reporting', 'Quarterly strategy'] },
      { planName: 'Scale', price: '$7.5k', interval: '/ month', features: ['Everything in Growth', 'Paid media management', 'CRO programme', 'Priority turnaround'] }
    ],
    faqs: [
      { q: 'How fast can we start?', a: 'Discovery calls this week; most engagements kick off within 10 working days of signing.' },
      { q: 'Who will actually do the work?', a: 'The senior team you meet on the first call — we do not subcontract strategy or design.' },
      { q: 'Do you require long contracts?', a: 'Projects are fixed-fee. Retainers are rolling monthly after an initial 3-month term.' },
      { q: 'Can you work with our in-house team?', a: 'Yes — most clients blend us with internal marketers. We bring strategy, senior craft and capacity.' }
    ],
    teamRoles: ['Creative Director', 'Strategy Lead', 'Design Lead'],
    ctaHeadline: 'Let\'s build your next stage of growth',
    ctaSub: 'Book a 30-minute discovery call. You will leave with a plan whether we work together or not.',
    heroImage: PHOTO.team
  },
  saas: {
    descFallback: 'one workspace that replaces the tools your team juggles every day',
    heroHeadline: '{name} — do the work of five tools in one',
    heroSub: '{name} is {desc}. Set up in minutes, loved by teams of 5 to 5,000.',
    servicesHeading: 'Everything in one place',
    servicesSub: 'Stop paying for tools that do not talk to each other. {name} brings the whole workflow together.',
    services: [
      { icon: 'layers', title: 'Unified Workspace', description: 'Projects, docs and data in one fast, searchable workspace.' },
      { icon: 'zap', title: 'Automations', description: 'Trigger-based automations that remove the busywork from every process.' },
      { icon: 'barchart', title: 'Live Analytics', description: 'Dashboards that update in real time — no exports, no spreadsheets.' },
      { icon: 'users', title: 'Team Collaboration', description: 'Comments, mentions and shared views keep everyone on the same page.' },
      { icon: 'shield', title: 'Enterprise Security', description: 'SSO, audit logs and granular permissions, SOC 2 Type II certified.' },
      { icon: 'cloud', title: '100+ Integrations', description: 'Slack, Google Workspace, Salesforce and an open API for everything else.' }
    ],
    benefitsHeading: 'Why teams switch to {name}',
    benefits: [
      { title: 'Live in a day', description: 'Guided migration from your current tools — most teams are fully set up in hours.' },
      { title: 'Fast, genuinely', description: 'Sub-100ms interactions everywhere. Speed is a feature we measure weekly.' },
      { title: 'Humans on support', description: 'Median first response under 5 minutes, from people who know the product.' }
    ],
    aboutHeading: 'Built by a team that lived the problem',
    aboutText: '{name} started inside our own company after one too many tabs, tools and status meetings. We built the workspace we wanted — and thousands of teams now run on it every day.',
    testimonials: [
      { quote: 'We cancelled three subscriptions the month we adopted {name}. It paid for itself immediately.', author: 'Sarah Jenkins', role: 'CTO at TechFlow' },
      { quote: 'The first tool our whole team actually opened every morning. Adoption was effortless.', author: 'David Chen', role: 'Head of Operations' },
      { quote: 'Support replied in four minutes at 11pm on a Sunday. Four. Minutes.', author: 'Amara Diallo', role: 'Founder, 12-person studio' }
    ],
    pricing: [
      { planName: 'Starter', price: '$9', interval: '/ user / month', features: ['Up to 10 users', 'Core workspace features', '20 automations', 'Email support'] },
      { planName: 'Pro', price: '$19', interval: '/ user / month', features: ['Unlimited users', 'Advanced analytics', 'Unlimited automations', 'Priority support'] },
      { planName: 'Enterprise', price: 'Custom', interval: '', features: ['SSO & SCIM', 'Audit logs', 'Dedicated success manager', '99.99% uptime SLA'] }
    ],
    faqs: [
      { q: 'Is there a free trial?', a: 'Yes — 14 days of Pro, no card required. Your data stays if you decide not to continue.' },
      { q: 'Can you migrate our existing data?', a: 'Our team migrates most tools free of charge, usually within one business day.' },
      { q: 'How secure is {name}?', a: 'SOC 2 Type II certified, encrypted in transit and at rest, with EU or US data residency options.' },
      { q: 'What does pricing look like at scale?', a: 'Volume pricing starts at 50 seats, and annual billing saves 20%. Talk to sales for a quote.' }
    ],
    teamRoles: ['Co-founder & CEO', 'Head of Engineering', 'Head of Product'],
    ctaHeadline: 'Try {name} free for 14 days',
    ctaSub: 'No card, no sales call, no migration headache. Set up in minutes.',
    heroImage: PHOTO.dashboard
  },
  shop: {
    descFallback: 'quality products, honest prices and delivery you can track',
    heroHeadline: '{name} — shop the good stuff',
    heroSub: 'At {name} you will find {desc}. Every item is checked by hand before it ships, and returns are free for 30 days.',
    servicesHeading: 'Shop with confidence',
    servicesSub: 'We obsess over the details other stores skip — sourcing, quality checks and packaging that survives the trip.',
    services: [
      { icon: 'shoppingbag', title: 'Curated Range', description: 'A tight range we would buy ourselves — no endless filler products.' },
      { icon: 'truck', title: 'Fast Tracked Delivery', description: 'Order by 2pm for same-day dispatch, tracked door to door.' },
      { icon: 'shieldcheck', title: 'Quality Guaranteed', description: 'Every product inspected before shipping, backed by a 2-year warranty.' },
      { icon: 'percent', title: 'Member Prices', description: 'Members save an extra 10% on everything, every day — no points games.' },
      { icon: 'package', title: 'Gift Ready', description: 'Free gift wrapping and handwritten notes on every order.' },
      { icon: 'refreshcw', title: 'Free 30-Day Returns', description: 'Changed your mind? Send it back free within 30 days, no questions.' }
    ],
    benefitsHeading: 'Why shoppers choose {name}',
    benefits: [
      { title: 'Honest pricing', description: 'No inflated "was" prices. Discounts here are real discounts.' },
      { title: 'Real human support', description: 'Message us and a person replies — usually within the hour.' },
      { title: 'Carbon-neutral shipping', description: 'Every delivery offset, every package recyclable.' }
    ],
    aboutHeading: 'A shop built by picky people',
    aboutText: '{name} began because we kept returning things bought elsewhere. So we built the store we wanted: fewer products, better quality, and service that treats you like a regular — because we hope you become one.',
    testimonials: [
      { quote: 'Ordered Tuesday morning, arrived Wednesday — beautifully packed and exactly as described.', author: 'Julia Brandt', role: 'Verified buyer' },
      { quote: 'Their returns process took two minutes. That is why I buy everything here now.', author: 'Sam Whitfield', role: 'Member since 2022' },
      { quote: 'You can tell real people check these products. The quality gap vs other stores is obvious.', author: 'Nadia Rahman', role: 'Verified buyer' }
    ],
    pricing: [
      { planName: 'Shop Free', price: '$0', interval: '', features: ['Standard delivery $4.95', '30-day free returns', 'Quality guarantee', 'Email support'] },
      { planName: 'Member', price: '$6', interval: '/ month', features: ['10% off everything', 'Free express delivery', 'Early access to drops', 'Priority support'] },
      { planName: 'Member Plus', price: '$12', interval: '/ month', features: ['15% off everything', 'Free next-day delivery', 'Exclusive products', 'Birthday gift yearly'] }
    ],
    faqs: [
      { q: 'How fast is delivery?', a: 'Orders placed by 2pm ship the same day. Standard delivery is 2–3 working days; express is next day.' },
      { q: 'What is your returns policy?', a: '30 days, free, no questions. Start a return online and drop the parcel at any pickup point.' },
      { q: 'Do you ship internationally?', a: 'Yes, to 40+ countries. Duties are calculated at checkout so there are no surprises on delivery.' },
      { q: 'Is my payment secure?', a: 'All payments are processed by PCI-DSS Level 1 providers. We never store card details.' }
    ],
    teamRoles: ['Founder & Buyer', 'Head of Operations', 'Customer Care Lead'],
    ctaHeadline: 'Ready when you are',
    ctaSub: 'Browse the range, and remember — returns are free for 30 days, so there is no risk in trying.',
    heroImage: PHOTO.analytics
  },
  clinic: {
    descFallback: 'compassionate, evidence-based care for the whole family',
    heroHeadline: '{name} — care that treats you like a person',
    heroSub: '{name} provides {desc}, with same-week appointments, unhurried consultations and clear, honest advice.',
    servicesHeading: 'Our services',
    servicesSub: 'Comprehensive care under one roof, with direct booking and results explained in plain language.',
    services: [
      { icon: 'heart', title: 'General Consultations', description: 'Thorough appointments that are never rushed — bring your list, we will work through it.' },
      { icon: 'shieldcheck', title: 'Health Screening', description: 'Annual checks, blood panels and preventive screening tailored to your age and risk.' },
      { icon: 'calendar', title: 'Same-Week Appointments', description: 'Urgent slots released daily at 8am. Book online in under a minute.' },
      { icon: 'video', title: 'Telehealth Visits', description: 'Follow-ups and repeat prescriptions by secure video, from wherever you are.' },
      { icon: 'users', title: 'Family Care', description: 'One clinic for the whole family, with shared notes (with permission) and joint plans.' },
      { icon: 'clock', title: 'Evening & Weekend Hours', description: 'Open late two evenings a week and Saturday mornings — care around your life.' }
    ],
    benefitsHeading: 'The {name} standard',
    benefits: [
      { title: 'Unhurried appointments', description: 'Double-length first appointments as standard. Questions are welcome here.' },
      { title: 'Clear pricing', description: 'Fees displayed before you book. No surprise invoices, ever.' },
      { title: 'Continuity of care', description: 'See the same clinician who knows your history, not a stranger each time.' }
    ],
    aboutHeading: 'Medicine the way it should feel',
    aboutText: '{name} was founded by clinicians who believe good medicine takes time. We keep patient lists small, appointments long and communication open — because that is how people actually get better.',
    testimonials: [
      { quote: 'For the first time in years I felt properly listened to. My results were explained until I understood them.', author: 'Eleanor Brooks', role: 'Patient since 2021' },
      { quote: 'Booked at 8am, seen at lunch, prescription by evening. Unheard of elsewhere.', author: 'James Okafor', role: 'Patient' },
      { quote: 'They spotted something two other clinics missed. I trust this team completely.', author: 'Rosa Delgado', role: 'Patient since 2019' }
    ],
    pricing: [
      { planName: 'Consultation', price: '$60', interval: '/ visit', features: ['30-minute appointment', 'Same-week availability', 'Prescriptions included', 'Follow-up message check-in'] },
      { planName: 'Full Health Check', price: '$180', interval: '/ annual', features: ['60-minute deep dive', 'Full blood panel', 'Written health report', 'Personal action plan'] },
      { planName: 'Family Plan', price: '$45', interval: '/ person / month', features: ['Unlimited consultations', 'Priority booking', 'Telehealth included', 'Annual health checks'] }
    ],
    faqs: [
      { q: 'How do I book an appointment?', a: 'Book online anytime, or call during opening hours. Urgent slots are released daily at 8am.' },
      { q: 'Do you accept insurance?', a: 'We work with all major insurers and provide itemised invoices for easy claims.' },
      { q: 'Can I get my results online?', a: 'Yes — results appear in your secure portal, with a plain-language summary from your clinician.' },
      { q: 'What if I need a specialist?', a: 'We refer within our trusted network and share notes (with your consent) so you never repeat your story.' }
    ],
    teamRoles: ['Medical Director', 'Senior Clinician', 'Practice Nurse Lead'],
    ctaHeadline: 'Book your appointment today',
    ctaSub: 'Same-week slots available. Your first consultation is never rushed.',
    heroImage: PHOTO.team
  },
  'real-estate': {
    descFallback: 'local expertise and honest advice for buyers and sellers',
    heroHeadline: '{name} — homes found, homes sold',
    heroSub: '{name} brings {desc} to every move: data-driven pricing, beautiful marketing and negotiators who work only for you.',
    servicesHeading: 'How we help',
    servicesSub: 'Buying, selling or just curious what your home is worth — start with a conversation, not a commitment.',
    services: [
      { icon: 'home', title: 'Home Sales', description: 'Pricing, staging and marketing that consistently beats the local average.' },
      { icon: 'search', title: 'Buyer Representation', description: 'Off-market access and sharp negotiation — we have saved buyers thousands.' },
      { icon: 'key', title: 'Free Valuation', description: 'A real valuation by a local expert, not an algorithm\'s guess.' },
      { icon: 'camera', title: 'Pro Marketing', description: 'Photography, video tours and floorplans included in every listing.' },
      { icon: 'landmark', title: 'Investment Advice', description: 'Yield analysis and portfolio reviews for landlords and investors.' },
      { icon: 'messagesquare', title: 'Move Management', description: 'One point of contact from offer to keys — we chase the chain so you do not.' }
    ],
    benefitsHeading: 'Why movers choose {name}',
    benefits: [
      { title: 'Local, deeply', description: 'Every agent works one neighbourhood. We know the streets, schools and sale prices.' },
      { title: 'Faster sales', description: 'Our listings sell in 27 days on average vs a 61-day market average.' },
      { title: 'No sale, no fee', description: 'You pay when we complete — and our fee is agreed in writing upfront.' }
    ],
    aboutHeading: 'An agency built on results',
    aboutText: '{name} started with a simple belief: estate agency should be a skilled service, not a numbers game. We take on fewer properties per agent, market them properly, and answer to results — which is why most of our business is referrals.',
    testimonials: [
      { quote: 'Sold $18k over asking in nine days. The marketing made our home look like a magazine shoot.', author: 'Chris & Dana Wells', role: 'Sellers' },
      { quote: 'As first-time buyers we needed hand-holding — {name} explained every step and never pushed.', author: 'Fatima Al-Sayed', role: 'First-time buyer' },
      { quote: 'They manage my three rentals end to end. Void periods basically disappeared.', author: 'George Lindqvist', role: 'Landlord' }
    ],
    pricing: [
      { planName: 'Valuation', price: 'Free', interval: '', features: ['In-person expert valuation', 'Comparable sales report', 'Selling strategy outline', 'No obligation'] },
      { planName: 'Standard Sale', price: '1.25%', interval: 'of sale price', features: ['Pro photography & video', 'All portal listings', 'Viewings handled', 'No sale, no fee'] },
      { planName: 'Premium Sale', price: '1.5%', interval: 'of sale price', features: ['Everything in Standard', 'Staging consultation', 'Twilight & drone shoot', 'Dedicated move manager'] }
    ],
    faqs: [
      { q: 'How much is my home worth?', a: 'Book a free valuation — a local agent visits, studies comparable sales and gives you a number in writing within 24 hours.' },
      { q: 'How long will my sale take?', a: 'Our average is 27 days to offer. Total time to completion depends on the chain, and we manage it actively.' },
      { q: 'Do you help buyers too?', a: 'Yes — registered buyers get off-market previews and honest advice on pricing and negotiation.' },
      { q: 'What are your fees?', a: 'Agreed in writing before we start, payable only on completion. No sale, no fee — always.' }
    ],
    teamRoles: ['Principal Agent', 'Senior Negotiator', 'Move Manager'],
    ctaHeadline: 'Find out what your home is worth',
    ctaSub: 'Free, in person, and with zero obligation. Most valuations are booked within 48 hours.',
    heroImage: PHOTO.analytics
  },
  generic: {
    descFallback: 'reliable service and quality you can count on',
    heroHeadline: '{name} — done properly, every time',
    heroSub: '{name} delivers {desc}. Straightforward pricing, real people to talk to, and work we stand behind.',
    servicesHeading: 'What we offer',
    servicesSub: 'Clear services, honest quotes and delivery dates we actually hit.',
    services: [
      { icon: 'star', title: 'Core Service', description: 'Our flagship offering, delivered by specialists with years of experience.' },
      { icon: 'wrench', title: 'Support & Care', description: 'Ongoing support and maintenance so you never have to think about it.' },
      { icon: 'rocket', title: 'Fast Turnaround', description: 'Priority scheduling and delivery for when timing really matters.' },
      { icon: 'shield', title: 'Guaranteed Work', description: 'Every job backed by our written guarantee — if it is not right, we fix it free.' },
      { icon: 'users', title: 'Dedicated Contact', description: 'One named person who knows your account and answers the phone.' },
      { icon: 'receipt', title: 'Transparent Quotes', description: 'Itemised quotes before work starts. The price agreed is the price paid.' }
    ],
    benefitsHeading: 'Why choose {name}',
    benefits: [
      { title: 'Rated by real customers', description: 'Hundreds of verified reviews averaging 4.9 out of 5.' },
      { title: 'No hidden costs', description: 'Quotes are itemised and fixed. Surprises are not part of the service.' },
      { title: 'Local & accountable', description: 'A real team you can call, visit and hold to our promises.' }
    ],
    aboutHeading: 'About {name}',
    aboutText: '{name} was built on referrals and repeat customers — the kind of business you only get by doing good work at a fair price, consistently. That is still the whole strategy.',
    testimonials: [
      { quote: 'Straightforward, punctual and fairly priced. A rare combination these days.', author: 'Helen Murray', role: 'Customer since 2020' },
      { quote: 'They explained everything before starting and the final bill matched the quote exactly.', author: 'Victor Hansen', role: 'Verified customer' },
      { quote: 'I have recommended {name} to half my street. Never been let down.', author: 'Grace Adebayo', role: 'Repeat customer' }
    ],
    pricing: [
      { planName: 'Essential', price: '$49', interval: '/ from', features: ['Core service included', 'Standard scheduling', 'Written guarantee', 'Email support'] },
      { planName: 'Complete', price: '$99', interval: '/ from', features: ['Everything in Essential', 'Priority scheduling', 'Dedicated contact', 'Annual review included'] },
      { planName: 'Premium', price: '$179', interval: '/ from', features: ['Everything in Complete', 'Fastest turnaround', 'Extended guarantee', 'Phone support 7 days'] }
    ],
    faqs: [
      { q: 'How do I get a quote?', a: 'Send the form on this page or call us — most quotes are issued within one working day.' },
      { q: 'Is your work guaranteed?', a: 'Yes, in writing. If something we did is not right, we come back and fix it free.' },
      { q: 'How do you price?', a: 'Itemised and fixed before we start. If the job changes, we agree the change with you first.' },
      { q: 'Where do you operate?', a: 'We cover the local area and surrounding towns — ask us and we will confirm coverage for your address.' }
    ],
    teamRoles: ['Founder', 'Operations Manager', 'Customer Lead'],
    ctaHeadline: 'Get your free quote today',
    ctaSub: 'Tell us what you need — we reply within one working day with a fixed, itemised price.',
    heroImage: PHOTO.workspace
  }
};

const TEAM_NAMES = ['Alex Rivera', 'Jordan Meyer', 'Taylor Brooks'];
const TEAM_AVATARS = [PHOTO.avatarPerson, PHOTO.avatarWoman, PHOTO.avatarPerson];

function fill(template: string, name: string, desc: string): string {
  return (template || '').split('{name}').join(name).split('{desc}').join(desc);
}

// ---------------------------------------------------------------------------
// Shared section builders — modern pattern throughout:
// badge eyebrow -> 36px/800 heading -> muted subtext, 96px section rhythm,
// alternating white / palette-light / dark-gradient section backgrounds,
// 24px-radius cards with a soft shadow and a hover lift.
// ---------------------------------------------------------------------------
const STATS: Record<string, Array<{ value: string; suffix: string; label: string }>> = {
  restaurant: [
    { value: '12k', suffix: '+', label: 'Dishes served' },
    { value: '4.9', suffix: '/5', label: 'Guest rating' },
    { value: '98', suffix: '%', label: 'Book again' }
  ],
  'beauty-salon': [
    { value: '8k', suffix: '+', label: 'Happy clients' },
    { value: '4.9', suffix: '/5', label: 'Average rating' },
    { value: '12', suffix: '', label: 'Senior stylists' }
  ],
  gym: [
    { value: '3.2k', suffix: '+', label: 'Active members' },
    { value: '120', suffix: '+', label: 'Classes / month' },
    { value: '94', suffix: '%', label: 'Hit their goal' }
  ],
  agency: [
    { value: '250', suffix: '+', label: 'Projects shipped' },
    { value: '3.1', suffix: 'x', label: 'Average ROI' },
    { value: '98', suffix: '%', label: 'Client retention' }
  ],
  saas: [
    { value: '12k', suffix: '+', label: 'Teams onboard' },
    { value: '99.99', suffix: '%', label: 'Uptime SLA' },
    { value: '4.9', suffix: '/5', label: 'Customer rating' }
  ],
  shop: [
    { value: '40k', suffix: '+', label: 'Orders delivered' },
    { value: '4.9', suffix: '/5', label: 'Buyer rating' },
    { value: '30', suffix: '-day', label: 'Free returns' }
  ],
  clinic: [
    { value: '15k', suffix: '+', label: 'Patients cared for' },
    { value: '4.9', suffix: '/5', label: 'Patient rating' },
    { value: '24', suffix: 'h', label: 'Results turnaround' }
  ],
  'real-estate': [
    { value: '27', suffix: ' days', label: 'Average time to offer' },
    { value: '480', suffix: '+', label: 'Homes sold' },
    { value: '98', suffix: '%', label: 'Of asking price' }
  ],
  generic: [
    { value: '10k', suffix: '+', label: 'Happy customers' },
    { value: '4.9', suffix: '/5', label: 'Average rating' },
    { value: '98', suffix: '%', label: 'Would recommend' }
  ]
};

function navSection(businessName: string, pageNames: string[]): any {
  return section(
    'Navigation Header',
    'navbar',
    { bgColor: '#ffffff', paddingTop: '16px', paddingBottom: '16px' },
    [
      col(
        100,
        [
          el(
            'navigation',
            { logoText: businessName, links: pageNames, ctaText: 'Get Started', ctaUrl: '#contact' },
            { color: '#1e293b', navLayout: 'standard', navStyle: 'glass' }
          )
        ],
        'center'
      )
    ]
  );
}

function footerLinkList(heading: string, lines: string[]): any[] {
  return [
    headingEl(heading, { color: '#ffffff', fontSize: '15px', fontWeight: '700' }),
    el(
      'text',
      { text: lines.join('\n'), html: lines.map((l) => `<p>${l}</p>`).join('') },
      { fontSize: '14px', fontFamily: FONT, color: '#94a3b8' }
    )
  ];
}

function footerSection(businessName: string, bank: CopyBank, ctx: any, palette: any): any {
  const year = new Date().getFullYear();
  const serviceLinks = bank.services.slice(0, 4).map((s) => fill(s.title, ctx.businessName, ctx.desc));
  return [
    section(
      'Footer',
      'footer',
      { bgColor: palette.dark, paddingTop: '64px', paddingBottom: '40px' },
      [
        col(34, [
          headingEl(businessName, { color: '#ffffff', fontSize: '20px' }),
          textEl(fill(bank.aboutText, ctx.businessName, ctx.desc), { color: '#94a3b8', fontSize: '14px' }),
          socialIconsEl(ctx)
        ]),
        col(22, footerLinkList('Explore', ctx.pageNames)),
        col(22, footerLinkList('Services', serviceLinks)),
        col(
          22,
          footerLinkList('Get in touch', [
            `hello@${ctx.slug}.com`,
            '+1 (555) 234-5678',
            '123 Main Street',
            'Mon - Fri: 9am - 6pm'
          ])
        )
      ]
    ),
    section(
      'Footer Bottom',
      'footer-bottom',
      { bgColor: palette.dark, paddingTop: '8px', paddingBottom: '32px' },
      [
        col(100, [
          textEl(`© ${year} ${businessName}. All rights reserved.`, {
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '13px'
          })
        ])
      ]
    )
  ];
}

function miniHero(pageTitle: string, sub: string, palette: any, ctx: any): any {
  return section(
    `${pageTitle} Hero`,
    'hero',
    {
      bgColor: palette.dark,
      bgGradient: heroGradient(palette),
      paddingTop: '100px',
      paddingBottom: '100px'
    },
    [
      col(100, [
        badgeEl(`✦ ${ctx.categoryLabel.toUpperCase()}`, palette, { dark: true }),
        headingEl(pageTitle, { textAlign: 'center', color: '#ffffff', fontSize: '48px' }, 'h1'),
        textEl(sub, { textAlign: 'center', color: BODY_ON_DARK, fontSize: '18px', lineHeight: '1.6' })
      ])
    ]
  );
}

// Hero — 3 deterministic variants:
//  0 split (copy left, image right)   1 centred (copy + buttons + wide image)
//  2 split reversed (image left, copy right)
// All sit on the palette-dark gradient with a glass badge, a dynamic typewriter
// animated headline, a glowing primary button and a glass secondary button.
function heroSection(bank: CopyBank, ctx: any, palette: any): any {
  const variant = variantFor(ctx, palette);
  const imgEl = el(
    'image',
    { url: img(bank.heroImage, 1000), alt: ctx.businessName },
    {
      borderRadius: '24px',
      shadow: HERO_IMG_SHADOW,
      borderColor: 'rgba(255, 255, 255, 0.12)',
      borderWidth: '1px',
      borderStyle: 'solid'
    }
  );
  const copyEls = (align: string) => [
    badgeEl(`✦ NEXT-GEN ${ctx.categoryLabel.toUpperCase()}`, palette, { dark: true, align }),
    typewriterHeroEl(ctx, palette, align),
    textEl(ctx.heroSub, { color: BODY_ON_DARK, fontSize: '18px', textAlign: align as any, lineHeight: '1.6' }),
    buttonEl('Get Started Free', palette, '#contact', {
      align,
      shadow: `0 16px 32px -8px ${palette.glow || palette.primary + '66'}`
    }),
    buttonEl('Explore Platform →', palette, '#services', {
      preset: 'glass',
      bgColor: 'rgba(255, 255, 255, 0.12)',
      borderColor: 'rgba(255, 255, 255, 0.25)',
      align
    }),
    ratingEl(ctx)
  ];
  const secStyles = {
    bgColor: palette.dark,
    bgGradient: heroGradient(palette),
    paddingTop: '100px',
    paddingBottom: variant === 1 ? '88px' : '100px'
  };
  if (variant === 1) {
    return section('Hero Banner', 'hero', secStyles, [
      col(100, [...copyEls('center'), imgEl], 'center')
    ]);
  }
  if (variant === 2) {
    return section('Hero Banner', 'hero', secStyles, [
      col(46, [imgEl], 'center'),
      col(54, copyEls('left'), 'center')
    ]);
  }
  return section('Hero Banner', 'hero', secStyles, [
    col(54, copyEls('left'), 'center'),
    col(46, [imgEl], 'center')
  ]);
}

// Stats strip directly under the hero, on the same gradient so the two
// sections read as one hero block.
function statsSection(ctx: any, palette: any): any {
  const stats = STATS[ctx.categoryId] || STATS.generic;
  return section(
    'Hero Stats',
    'stats',
    {
      bgColor: palette.dark,
      bgGradient: heroGradient(palette),
      paddingTop: '0px',
      paddingBottom: '88px'
    },
    stats.map((s) =>
      col(33.33, [
        el(
          'counter',
          { value: s.value, suffix: s.suffix, label: s.label },
          {
            color: '#ffffff',
            fontSize: '40px',
            fontFamily: FONT,
            descColor: palette.accent || '#94a3b8',
            textAlign: 'center'
          }
        )
      ])
    )
  );
}

// Services — 3 deterministic variants:
//  0 iconbox grid with light pulse animations
//  1 contentcard grid, numbered badges
//  2 iconbox grid, centred, tinted icon chips on a light section
function servicesSection(bank: CopyBank, ctx: any, palette: any, count: number): any {
  const variant = variantFor(ctx, palette);
  const items = bank.services.slice(0, count);
  const cols: any[] = [];
  const perCol = Math.ceil(items.length / 3);
  for (let c = 0; c < 3; c++) {
    const chunk = items.slice(c * perCol, (c + 1) * perCol);
    if (chunk.length === 0) break;
    cols.push(
      col(
        33.33,
        chunk.map((s, j) => {
          const idx = c * perCol + j;
          const title = fill(s.title, ctx.businessName, ctx.desc);
          const description = fill(s.description, ctx.businessName, ctx.desc);
          if (variant === 1) {
            return el(
              'contentcard',
              { badge: String(idx + 1).padStart(2, '0'), title, description },
              {
                bgColor: '#ffffff',
                color: INK,
                fontSize: '18px',
                fontFamily: FONT,
                borderColor: '#e2e8f0',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: '24px',
                shadow: SOFT_SHADOW,
                hoverScale: 1.03,
                hoverShadow: LIFT_SHADOW
              }
            );
          }
          const centred = variant === 2;
          const anim = idx % 3 === 0 ? 'pulse' : idx % 3 === 1 ? 'float' : 'shimmer';
          return el(
            'iconbox',
            {
              iconName: s.icon,
              title,
              description,
              iconAnimation: anim,
              iconAnimationTrigger: 'always',
              iconAnimationSpeed: 'normal'
            },
            {
              bgColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderRadius: '24px',
              shadow: SOFT_SHADOW,
              hoverScale: 1.03,
              hoverShadow: LIFT_SHADOW,
              iconColor: centred ? palette.primary : '#ffffff',
              iconBgColor: centred ? palette.light : palette.primary,
              iconSize: '24px',
              iconBorderRadius: '14px',
              headingColor: INK,
              headingFontSize: '18px',
              headingFontWeight: '700',
              descColor: MUTED,
              descFontSize: '15px',
              fontFamily: FONT,
              textAlign: centred ? 'center' : 'left',
              iconAnimation: anim,
              iconAnimationTrigger: 'always',
              iconAnimationSpeed: 'normal'
            }
          );
        })
      )
    );
  }
  return section(
    'Services Grid',
    'services',
    {
      bgColor: variant === 2 ? palette.light : '#ffffff',
      paddingTop: '24px',
      paddingBottom: '96px'
    },
    cols
  );
}

function benefitsSection(bank: CopyBank, ctx: any, palette: any): any {
  return section(
    'Why Choose Us',
    'why-us',
    { bgColor: palette.light, paddingTop: '24px', paddingBottom: '96px' },
    bank.benefits.map((b, i) =>
      col(33.33, [
        el(
          'contentcard',
          {
            badge: String(i + 1).padStart(2, '0'),
            title: fill(b.title, ctx.businessName, ctx.desc),
            description: fill(b.description, ctx.businessName, ctx.desc)
          },
          {
            bgColor: '#ffffff',
            color: INK,
            fontSize: '18px',
            fontFamily: FONT,
            borderColor: '#e2e8f0',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '24px',
            shadow: SOFT_SHADOW,
            hoverScale: 1.03,
            hoverShadow: LIFT_SHADOW
          }
        )
      ])
    )
  );
}

function aboutSplitSection(bank: CopyBank, ctx: any, palette: any): any {
  return section(
    'About Split',
    'about',
    { bgColor: '#ffffff', paddingTop: '96px', paddingBottom: '96px' },
    [
      col(
        45,
        [el('image', { url: img(PHOTO.team, 900), alt: `About ${ctx.businessName}` }, { borderRadius: '24px', shadow: IMG_SHADOW })],
        'center'
      ),
      col(
        55,
        [
          badgeEl('Our story', palette, { align: 'left' }),
          headingEl(fill(bank.aboutHeading, ctx.businessName, ctx.desc), { color: INK }),
          textEl(fill(bank.aboutText, ctx.businessName, ctx.desc), { color: MUTED, fontSize: '17px' }),
          buttonEl('Learn More', palette, '/about', {
            preset: 'outline',
            color: palette.primary,
            borderColor: palette.primary
          })
        ],
        'center'
      )
    ]
  );
}

function testimonialsSection(bank: CopyBank, ctx: any, palette: any): any {
  return section(
    'Testimonials',
    'testimonials',
    { bgColor: palette.light, paddingTop: '24px', paddingBottom: '96px' },
    bank.testimonials.map((t, i) =>
      col(33.33, [
        el(
          'testimonial',
          {
            quote: fill(t.quote, ctx.businessName, ctx.desc),
            author: t.author,
            role: t.role,
            avatar: img(i % 2 === 0 ? PHOTO.avatarWoman : PHOTO.avatarPerson, 200),
            rating: 5
          },
          {
            bgColor: '#ffffff',
            color: '#334155',
            borderColor: '#e2e8f0',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '24px',
            shadow: SOFT_SHADOW,
            hoverScale: 1.03,
            hoverShadow: LIFT_SHADOW
          }
        )
      ])
    )
  );
}

function pricingSection(bank: CopyBank, palette: any): any {
  return section(
    'Pricing',
    'pricing',
    { bgColor: '#ffffff', paddingTop: '24px', paddingBottom: '96px' },
    bank.pricing.map((p, i) => {
      const popular = i === 1;
      return col(33.33, [
        el(
          'pricingcard',
          {
            planName: p.planName,
            price: p.price,
            interval: p.interval,
            features: p.features,
            badge: popular ? 'Most Popular' : '',
            buttonText: 'Get Started',
            buttonUrl: '#contact'
          },
          popular
            ? {
                bgColor: palette.primary,
                bgGradient: primaryGradient(palette),
                color: '#ffffff',
                borderRadius: '24px',
                shadow: POPULAR_SHADOW,
                hoverScale: 1.03,
                hoverShadow: POPULAR_SHADOW
              }
            : {
                bgColor: palette.dark,
                color: '#ffffff',
                borderRadius: '24px',
                shadow: SOFT_SHADOW,
                hoverScale: 1.03,
                hoverShadow: LIFT_SHADOW
              }
        )
      ]);
    })
  );
}

// CTA — built as a full-bleed gradient SECTION (heading + text + button),
// not the 'cta' element: the exporter has no 'cta' case, so that element
// exports as an empty styled div and loses its headline entirely.
function ctaSection(bank: CopyBank, ctx: any, palette: any): any {
  return section(
    'Call to Action',
    'cta',
    {
      bgColor: palette.dark,
      bgGradient: ctaGradient(palette),
      paddingTop: '100px',
      paddingBottom: '100px'
    },
    [
      col(100, [
        badgeEl(`⚡ READY TO TRANSFORM`, palette, { dark: true }),
        headingEl(fill(bank.ctaHeadline, ctx.businessName, ctx.desc), {
          textAlign: 'center',
          color: '#ffffff',
          fontSize: '44px'
        }),
        textEl(fill(bank.ctaSub, ctx.businessName, ctx.desc), {
          textAlign: 'center',
          color: BODY_ON_DARK,
          fontSize: '18px',
          lineHeight: '1.6'
        }),
        buttonEl('Get Started Now Free', palette, '#contact', {
          preset: 'glow',
          bgColor: '#ffffff',
          color: palette.primary,
          align: 'center',
          shadow: `0 16px 36px -8px ${palette.glow || 'rgba(255, 255, 255, 0.4)'}`
        }),
        textEl('✦ No credit card required ✦ 14-day free trial ✦ Cancel anytime', {
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '13px',
          fontWeight: '600'
        })
      ])
    ]
  );
}

function contactSection(ctx: any, palette: any, withDetails = true): any {
  const left: any[] = [
    badgeEl('Contact', palette, { align: 'left' }),
    headingEl('Get in touch', { color: INK }),
    textEl(`Questions, quotes or bookings — send a message and the ${ctx.businessName} team will reply within one working day.`, {
      color: MUTED,
      fontSize: '17px'
    })
  ];
  if (withDetails) {
    left.push(
      el(
        'contactdetails',
        { email: `hello@${ctx.slug}.com`, phone: '+1 (555) 234-5678', address: '123 Main Street', hours: 'Mon - Fri: 9am - 6pm' },
        { bgColor: palette.light, borderRadius: '24px', shadow: SOFT_SHADOW }
      )
    );
  }
  return section(
    'Contact',
    'contact',
    { bgColor: '#ffffff', paddingTop: '96px', paddingBottom: '96px' },
    [
      col(50, left),
      col(50, [
        el(
          'form',
          { title: `Contact ${ctx.businessName}`, buttonText: 'Send Message' },
          {
            bgColor: palette.dark,
            color: '#ffffff',
            borderRadius: '24px',
            shadow: IMG_SHADOW,
            buttonBgColor: palette.primary
          }
        )
      ])
    ]
  );
}

// ---------------------------------------------------------------------------
// Round-3 elements — marquee / processsteps / skillbar / countdown /
// socialicons / rating / timeline. Content shapes are exactly the documented
// ones for each type; el() replaces (not merges) content for these types.
// ---------------------------------------------------------------------------
const RATING_COUNTS: Record<string, string> = {
  restaurant: '2,400+ verified guest reviews',
  'beauty-salon': '1,800+ verified client reviews',
  gym: '3,200+ verified member reviews',
  agency: '480+ verified client reviews',
  saas: '6,500+ verified customer reviews',
  shop: '12,000+ verified buyer reviews',
  clinic: '2,900+ verified patient reviews',
  'real-estate': '950+ verified mover reviews',
  generic: '1,500+ verified customer reviews'
};

function socialIconsEl(ctx: any): any {
  return el(
    'socialicons',
    {
      links: [
        { network: 'facebook', url: `https://facebook.com/${ctx.slug}` },
        { network: 'instagram', url: `https://instagram.com/${ctx.slug}` },
        { network: 'twitter', url: `https://twitter.com/${ctx.slug}` },
        { network: 'linkedin', url: `https://linkedin.com/company/${ctx.slug}` },
        { network: 'youtube', url: `https://youtube.com/@${ctx.slug}` }
      ]
    },
    { color: '#ffffff', iconColor: '#ffffff', iconBgColor: 'rgba(255, 255, 255, 0.14)', fontSize: '18px', textAlign: 'left' }
  );
}

function marqueeEl(bank: CopyBank, ctx: any, palette: any): any {
  const items = [
    ...bank.services.slice(0, 4).map((s) => fill(s.title, ctx.businessName, ctx.desc)),
    ...bank.benefits.slice(0, 2).map((b) => fill(b.title, ctx.businessName, ctx.desc)),
    ctx.categoryLabel
  ];
  return el(
    'marquee',
    { items, separator: '✦' },
    {
      bgColor: palette.primary,
      bgGradient: primaryGradient(palette),
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '700',
      fontFamily: FONT
    }
  );
}

// Marquee strip — used directly under the hero on most blueprints.
function marqueeSection(bank: CopyBank, ctx: any, palette: any): any {
  return section(
    'Marquee Strip',
    'marquee',
    { bgColor: palette.primary, paddingTop: '16px', paddingBottom: '16px' },
    [col(100, [marqueeEl(bank, ctx, palette)])]
  );
}

function countdownEl(ctx: any, daysFromNow = 14, accent?: string): any {
  const target = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  return el(
    'countdown',
    {
      targetDate: target.toISOString(),
      finishedText: 'This offer has ended — ask us about the latest deals.',
      labels: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' }
    },
    {
      bgColor: 'rgba(255, 255, 255, 0.12)',
      color: '#ffffff',
      iconColor: accent || '#6366f1',
      fontSize: '28px',
      fontWeight: '800',
      fontFamily: FONT,
      borderRadius: '24px',
      textAlign: 'center'
    }
  );
}

function countdownBannerSection(
  bank: CopyBank,
  ctx: any,
  palette: any,
  name = 'Countdown Banner',
  customId = 'offer-countdown'
): any {
  return section(
    name,
    customId,
    {
      bgColor: palette.dark,
      bgGradient: heroGradient(palette),
      paddingTop: '40px',
      paddingBottom: '40px'
    },
    [
      col(55, [
        badgeEl('Limited offer', palette, { dark: true, align: 'left' }),
        headingEl(fill(bank.ctaHeadline, ctx.businessName, ctx.desc), {
          color: '#ffffff',
          fontSize: '28px',
          textAlign: 'left' as any
        }),
        textEl('This offer ends soon — when the timer hits zero, it is gone.', {
          color: BODY_ON_DARK,
          fontSize: '15px'
        })
      ], 'center'),
      col(45, [countdownEl(ctx, 14, palette.primary)], 'center')
    ]
  );
}

function ratingEl(ctx: any): any {
  return el(
    'rating',
    { value: 4.9, count: RATING_COUNTS[ctx.categoryId] || RATING_COUNTS.generic },
    { color: '#f59e0b', iconColor: '#f59e0b', fontSize: '20px', fontFamily: FONT, textAlign: 'center' }
  );
}

// Rating strip placed directly adjacent to the testimonials in every
// blueprint, so the star rating reads as part of the testimonial block.
function ratingSection(ctx: any, palette: any): any {
  return section(
    'Customer Rating',
    'customer-rating',
    { bgColor: palette.light, paddingTop: '16px', paddingBottom: '0px' },
    [
      col(100, [
        ratingEl(ctx),
        textEl(`Rated 4.9 out of 5 by customers of ${ctx.businessName}.`, {
          textAlign: 'center',
          color: MUTED,
          fontSize: '14px'
        })
      ])
    ]
  );
}

function processStepsFor(bank: CopyBank, ctx: any): Array<{ iconName: string; title: string; description: string }> {
  const first = bank.services[0];
  const second = bank.services[1] || bank.services[0];
  return [
    {
      iconName: 'search',
      title: 'Tell us what you need',
      description: `Share your goals with the ${ctx.businessName} team — online, by phone or in person.`
    },
    {
      iconName: 'calendar',
      title: 'Get a clear plan',
      description: 'We agree the scope, the timeline and a fixed price before anything starts.'
    },
    {
      iconName: first ? first.icon : 'zap',
      title: fill(first ? first.title : 'We deliver', ctx.businessName, ctx.desc),
      description: fill(first ? first.description : 'Our specialists deliver the work.', ctx.businessName, ctx.desc)
    },
    {
      iconName: second ? second.icon : 'heart',
      title: 'Enjoy the result',
      description: 'We check in after delivery and stay on hand whenever you need us again.'
    }
  ];
}

function processBlocks(bank: CopyBank, ctx: any, palette: any, force = false): any[] {
  const PROCESS_CATEGORIES = ['agency', 'saas', 'gym', 'clinic', 'restaurant', 'beauty-salon', 'shop', 'real-estate', 'generic'];
  if (!force && !PROCESS_CATEGORIES.includes(ctx.categoryId)) return [];
  return [
    sectionHeader(
      'Process Heading',
      'process-heading',
      'How it works',
      'Simple, from start to finish',
      `Working with ${ctx.businessName} takes four clear steps — no surprises along the way.`,
      palette
    ),
    section(
      'Process Steps',
      'process',
      { bgColor: '#ffffff', paddingTop: '24px', paddingBottom: '96px' },
      [
        col(100, [
          el(
            'processsteps',
            { steps: processStepsFor(bank, ctx) },
            {
              bgColor: '#ffffff',
              color: INK,
              fontFamily: FONT,
              borderRadius: '24px',
              iconColor: palette.primary,
              iconBgColor: palette.light
            }
          )
        ])
      ]
    )
  ];
}

const SKILLBAR_CATEGORIES = ['agency', 'saas', 'real-estate'];

function skillBarsFor(bank: CopyBank, ctx: any): Array<{ label: string; percent: number }> {
  const percents = [96, 92, 89, 94];
  return bank.services.slice(0, 4).map((s, i) => ({
    label: fill(s.title, ctx.businessName, ctx.desc),
    percent: percents[i % percents.length]
  }));
}

function skillbarBlocks(bank: CopyBank, ctx: any, palette: any, force = false): any[] {
  if (!force && !SKILLBAR_CATEGORIES.includes(ctx.categoryId)) return [];
  return [
    sectionHeader(
      'Skills Heading',
      'skills-heading',
      'Our expertise',
      'Where we are strongest',
      `The capabilities customers of ${ctx.businessName} rate highest.`,
      palette,
      { bgColor: palette.light }
    ),
    section(
      'Skill Bars',
      'skills',
      { bgColor: palette.light, paddingTop: '24px', paddingBottom: '96px' },
      [
        col(100, [
          el(
            'skillbar',
            { bars: skillBarsFor(bank, ctx) },
            {
              bgColor: '#ffffff',
              color: INK,
              fontFamily: FONT,
              borderRadius: '24px',
              shadow: SOFT_SHADOW,
              iconColor: palette.primary
            }
          )
        ])
      ]
    )
  ];
}

function timelineItemsFor(bank: CopyBank, ctx: any): Array<{ date: string; title: string; description: string }> {
  return [
    {
      date: '2016',
      title: `${ctx.businessName} is founded`,
      description: fill(bank.aboutText, ctx.businessName, ctx.desc)
    },
    {
      date: '2019',
      title: 'The team grows',
      description: `Word of mouth turns ${ctx.businessName} into a local favourite, and the team doubles in size.`
    },
    {
      date: '2022',
      title: 'Bigger space, bigger range',
      description: fill(bank.servicesSub, ctx.businessName, ctx.desc)
    },
    {
      date: 'Today',
      title: 'Trusted by thousands',
      description: fill(bank.benefitsHeading, ctx.businessName, ctx.desc) +
        ' — and rated 4.9 out of 5 by the customers who know us best.'
    }
  ];
}

const HOME_TIMELINE_CATEGORIES = ['agency', 'saas', 'real-estate', 'generic'];

function timelineBlocks(bank: CopyBank, ctx: any, palette: any, force = false): any[] {
  if (!force && !HOME_TIMELINE_CATEGORIES.includes(ctx.categoryId)) return [];
  return [
    sectionHeader(
      'Timeline Heading',
      'story-heading',
      'Our journey',
      fill(bank.aboutHeading, ctx.businessName, ctx.desc),
      `How ${ctx.businessName} got to where it is today.`,
      palette
    ),
    section(
      'Timeline',
      'timeline',
      { bgColor: '#ffffff', paddingTop: '24px', paddingBottom: '96px' },
      [
        col(100, [
          el(
            'timeline',
            { items: timelineItemsFor(bank, ctx) },
            { bgColor: '#ffffff', color: INK, fontFamily: FONT, iconColor: palette.primary }
          )
        ])
      ]
    )
  ];
}

function faqSection(bank: CopyBank, ctx: any, palette: any): any {
  return section(
    'FAQs',
    'faqs',
    { bgColor: '#ffffff', paddingTop: '24px', paddingBottom: '96px' },
    [
      col(100, [
        el(
          'accordion',
          { items: bank.faqs.map((f) => ({ id: uid('faq'), q: fill(f.q, ctx.businessName, ctx.desc), a: fill(f.a, ctx.businessName, ctx.desc) })) },
          { bgColor: '#ffffff', color: INK, borderColor: '#e2e8f0', borderRadius: '16px' }
        )
      ])
    ]
  );
}

function faqBlocks(bank: CopyBank, ctx: any, palette: any): any[] {
  return [
    sectionHeader(
      'FAQ Heading',
      'faq-heading',
      'FAQ',
      'Frequently asked questions',
      'Everything else you might want to know before getting started.',
      palette
    ),
    faqSection(bank, ctx, palette)
  ];
}

// ---------------------------------------------------------------------------
// Page builders
// ---------------------------------------------------------------------------
const PAGE_DEFS: Record<string, { name: string; slug: string }> = {
  home: { name: 'Home', slug: '/' },
  about: { name: 'About', slug: '/about' },
  services: { name: 'Services', slug: '/services' },
  pricing: { name: 'Pricing', slug: '/pricing' },
  contact: { name: 'Contact', slug: '/contact' }
};
const PAGE_ORDER = ['home', 'about', 'services', 'pricing', 'contact'];

function buildHomeClassicModern(bank: CopyBank, ctx: any, palette: any, selected: string[]): any {
  const sections: any[] = [
    navSection(ctx.businessName, ctx.pageNames),
    heroSection(bank, ctx, palette),
    statsSection(ctx, palette),
    marqueeSection(bank, ctx, palette),
    sectionHeader(
      'Services Heading',
      'services-heading',
      'What we do',
      fill(bank.servicesHeading, ctx.businessName, ctx.desc),
      fill(bank.servicesSub, ctx.businessName, ctx.desc),
      palette,
      { bgColor: variantFor(ctx, palette) === 2 ? palette.light : '#ffffff' }
    ),
    servicesSection(bank, ctx, palette, 3),
    ...processBlocks(bank, ctx, palette),
    sectionHeader(
      'Benefits Heading',
      'why-heading',
      'Why choose us',
      fill(bank.benefitsHeading, ctx.businessName, ctx.desc),
      'Three reasons customers pick us — and stay.',
      palette,
      { bgColor: palette.light }
    ),
    benefitsSection(bank, ctx, palette),
    aboutSplitSection(bank, ctx, palette),
    ...timelineBlocks(bank, ctx, palette),
    ...skillbarBlocks(bank, ctx, palette),
    sectionHeader(
      'Testimonials Heading',
      'testimonials-heading',
      'Testimonials',
      'What customers say',
      `Real reviews from real customers of ${ctx.businessName}.`,
      palette,
      { bgColor: palette.light }
    ),
    ratingSection(ctx, palette),
    testimonialsSection(bank, ctx, palette)
  ];
  if (selected.includes('pricing')) {
    sections.push(
      sectionHeader(
        'Pricing Heading',
        'pricing-heading',
        'Pricing',
        'Simple, honest pricing',
        'Pick the option that fits — upgrade, downgrade or cancel anytime.',
        palette
      ),
      pricingSection(bank, palette)
    );
  }
  sections.push(
    ctaSection(bank, ctx, palette),
    contactSection(ctx, palette, true),
    ...footerSection(ctx.businessName, bank, ctx, palette)
  );
  return { id: uid('page'), name: 'Home', slug: '/', sections };
}

// ---------------------------------------------------------------------------
// Round-3 Home blueprints (Workstream C)
// Five compositions over the same section helpers + copy banks. Which one a
// site gets is decided per category (CATEGORY_BLUEPRINTS) and varied by a
// hash of the business name, so the same category + palette can produce two
// different layouts for two different businesses.
// ---------------------------------------------------------------------------
export const AI_BLUEPRINTS = [
  'classic-modern',
  'bento',
  'split-hero',
  'story',
  'offer'
] as const;

export const CATEGORY_BLUEPRINTS: Record<string, string[]> = {
  restaurant: ['offer', 'split-hero'],
  'beauty-salon': ['split-hero', 'classic-modern'],
  gym: ['split-hero', 'offer'],
  agency: ['bento', 'story'],
  saas: ['bento', 'story'],
  shop: ['offer', 'split-hero'],
  clinic: ['classic-modern', 'split-hero'],
  'real-estate': ['bento', 'classic-modern'],
  // Generic rotates across three layouts instead of being pinned to one.
  generic: ['classic-modern', 'bento', 'split-hero']
};

function hashBusinessName(name: string): number {
  const s = (name || '').trim().toLowerCase();
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h;
}

export function blueprintForCategory(categoryId: string, businessName: string): string {
  const allowed = CATEGORY_BLUEPRINTS[categoryId] || CATEGORY_BLUEPRINTS.generic;
  return allowed[hashBusinessName(businessName) % allowed.length];
}

function bentoSpotlightCard(svc: any, ctx: any, palette: any): any {
  return el(
    'contentcard',
    {
      badge: '✦ SPOTLIGHT CAPABILITY',
      title: fill(svc.title, ctx.businessName, ctx.desc),
      description: fill(svc.description, ctx.businessName, ctx.desc) + ' Engineered for peak velocity, enterprise-grade scalability, and intuitive control.'
    },
    {
      bgColor: palette.light,
      color: INK,
      fontSize: '22px',
      fontFamily: FONT,
      borderColor: palette.accent || palette.primary,
      borderWidth: '1.5px',
      borderStyle: 'solid',
      borderRadius: '24px',
      shadow: LIFT_SHADOW,
      hoverScale: 1.02,
      hoverShadow: POPULAR_SHADOW
    }
  );
}

function bentoStatCard(stat: { value: string; suffix: string; label: string }, palette: any): any {
  return el(
    'counter',
    { value: stat.value, suffix: stat.suffix, label: stat.label },
    {
      bgColor: '#ffffff',
      color: palette.primary,
      fontSize: '44px',
      fontWeight: '900',
      fontFamily: FONT,
      borderColor: '#e2e8f0',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '24px',
      shadow: SOFT_SHADOW,
      hoverScale: 1.03,
      hoverShadow: LIFT_SHADOW,
      textAlign: 'center',
      paddingTop: '28px',
      paddingBottom: '28px'
    }
  );
}

function bentoCard(svc: any, ctx: any, palette: any, large: boolean): any {
  return el(
    'contentcard',
    {
      badge: large ? 'Featured' : 'Service',
      title: fill(svc.title, ctx.businessName, ctx.desc),
      description: fill(svc.description, ctx.businessName, ctx.desc)
    },
    {
      bgColor: large ? palette.light : '#ffffff',
      color: INK,
      fontSize: large ? '22px' : '18px',
      fontFamily: FONT,
      borderColor: '#e2e8f0',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '24px',
      shadow: SOFT_SHADOW,
      hoverScale: 1.03,
      hoverShadow: LIFT_SHADOW
    }
  );
}

function bentoIcon(svc: any, ctx: any, palette: any, anim: string = 'pulse'): any {
  return el(
    'iconbox',
    {
      iconName: svc.icon,
      title: fill(svc.title, ctx.businessName, ctx.desc),
      description: fill(svc.description, ctx.businessName, ctx.desc),
      iconAnimation: anim,
      iconAnimationTrigger: 'always',
      iconAnimationSpeed: 'normal'
    },
    {
      bgColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '24px',
      shadow: SOFT_SHADOW,
      hoverScale: 1.03,
      hoverShadow: LIFT_SHADOW,
      iconColor: '#ffffff',
      iconBgColor: palette.primary,
      iconSize: '24px',
      iconBorderRadius: '14px',
      headingColor: INK,
      headingFontSize: '18px',
      headingFontWeight: '700',
      descColor: MUTED,
      descFontSize: '15px',
      fontFamily: FONT,
      iconAnimation: anim,
      iconAnimationTrigger: 'always',
      iconAnimationSpeed: 'normal'
    }
  );
}

// Blueprint 2 — 'bento': modern high-density Bento grid inspired by Kimi & Linear
function buildHomeBento(bank: CopyBank, ctx: any, palette: any, selected: string[]): any {
  const s = bank.services;
  const stats = STATS[ctx.categoryId] || STATS.generic;
  const sections: any[] = [
    navSection(ctx.businessName, ctx.pageNames),
    heroSection(bank, ctx, palette),
    marqueeSection(bank, ctx, palette),
    statsSection(ctx, palette),
    sectionHeader(
      'Bento Heading',
      'services-heading',
      'Architecture & Capabilities',
      fill(bank.servicesHeading, ctx.businessName, ctx.desc),
      fill(bank.servicesSub, ctx.businessName, ctx.desc),
      palette
    ),
    section('Bento Features Row 1', 'bento-row-1', { bgColor: '#ffffff', paddingTop: '24px', paddingBottom: '24px' }, [
      col(66.66, [bentoSpotlightCard(s[0], ctx, palette)]),
      col(33.33, [bentoStatCard(stats[0], palette)])
    ]),
    section('Bento Features Row 2', 'bento-row-2', { bgColor: '#ffffff', paddingTop: '0px', paddingBottom: '24px' }, [
      col(33.33, [bentoIcon(s[1], ctx, palette, 'pulse')]),
      col(33.33, [bentoIcon(s[2], ctx, palette, 'float')]),
      col(33.33, [
        el(
          'contentcard',
          {
            badge: 'Verified 4.9★',
            title: 'Loved by Customers',
            description: fill(bank.testimonials[0]?.quote || 'Outstanding quality and seamless experience from day one.', ctx.businessName, ctx.desc)
          },
          {
            bgColor: '#ffffff',
            color: INK,
            fontSize: '17px',
            fontFamily: FONT,
            borderColor: '#e2e8f0',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '24px',
            shadow: SOFT_SHADOW,
            hoverScale: 1.03,
            hoverShadow: LIFT_SHADOW
          }
        )
      ])
    ]),
    section('Bento Features Row 3', 'bento-row-3', { bgColor: '#ffffff', paddingTop: '0px', paddingBottom: '96px' }, [
      col(33.33, [bentoIcon(s[3] || s[0], ctx, palette, 'shimmer')]),
      col(66.66, [
        el(
          'contentcard',
          {
            badge: '✦ 24/7 GUARANTEE',
            title: fill(bank.benefits[0].title, ctx.businessName, ctx.desc),
            description: fill(bank.benefits[0].description, ctx.businessName, ctx.desc) + ' Every detail is calibrated to deliver unmatched reliability and peace of mind.'
          },
          {
            bgColor: palette.dark,
            color: '#ffffff',
            fontSize: '20px',
            fontFamily: FONT,
            borderRadius: '24px',
            shadow: LIFT_SHADOW,
            hoverScale: 1.02,
            hoverShadow: POPULAR_SHADOW
          }
        )
      ])
    ]),
    sectionHeader(
      'Benefits Heading',
      'why-heading',
      'Why choose us',
      fill(bank.benefitsHeading, ctx.businessName, ctx.desc),
      'Three reasons customers pick us — and stay.',
      palette,
      { bgColor: palette.light }
    ),
    benefitsSection(bank, ctx, palette),
    aboutSplitSection(bank, ctx, palette),
    ...timelineBlocks(bank, ctx, palette),
    ...skillbarBlocks(bank, ctx, palette),
    ...processBlocks(bank, ctx, palette),
    sectionHeader(
      'Testimonials Heading',
      'testimonials-heading',
      'Testimonials',
      'What customers say',
      `Real reviews from real customers of ${ctx.businessName}.`,
      palette,
      { bgColor: palette.light }
    ),
    ratingSection(ctx, palette),
    testimonialsSection(bank, ctx, palette)
  ];
  if (selected.includes('pricing')) {
    sections.push(
      sectionHeader('Pricing Heading', 'pricing-heading', 'Pricing', 'Simple, honest pricing', 'Pick the option that fits — upgrade, downgrade or cancel anytime.', palette),
      pricingSection(bank, palette)
    );
  }
  sections.push(ctaSection(bank, ctx, palette), contactSection(ctx, palette, true), ...footerSection(ctx.businessName, bank, ctx, palette));
  return { id: uid('page'), name: 'Home', slug: '/', sections };
}

const FORM_HERO_CATEGORIES = ['clinic', 'gym', 'real-estate', 'agency', 'saas', 'generic'];

// Blueprint 3 — 'split-hero': copy left with typewriter headline, lead-capture form (or images) right
function splitHeroSection(bank: CopyBank, ctx: any, palette: any): any {
  const useForm = FORM_HERO_CATEGORIES.includes(ctx.categoryId);
  const right = useForm
    ? [
        el(
          'form',
          { title: `Get started with ${ctx.businessName}`, buttonText: 'Request a Callback' },
          {
            bgColor: '#ffffff',
            color: INK,
            borderRadius: '24px',
            shadow: HERO_IMG_SHADOW,
            buttonBgColor: palette.primary
          }
        )
      ]
    : [
        el('image', { url: img(bank.heroImage, 900), alt: ctx.businessName }, { borderRadius: '24px', shadow: HERO_IMG_SHADOW, borderColor: 'rgba(255, 255, 255, 0.12)', borderWidth: '1px', borderStyle: 'solid' }),
        el('image', { url: img(PHOTO.team, 900), alt: `Inside ${ctx.businessName}` }, { borderRadius: '24px', shadow: IMG_SHADOW, borderColor: 'rgba(255, 255, 255, 0.12)', borderWidth: '1px', borderStyle: 'solid' })
      ];
  return section(
    'Split Hero',
    'hero',
    { bgColor: palette.dark, bgGradient: heroGradient(palette), paddingTop: '100px', paddingBottom: '100px' },
    [
      col(55, [
        badgeEl(`✦ ${ctx.categoryLabel.toUpperCase()}`, palette, { dark: true, align: 'left' }),
        typewriterHeroEl(ctx, palette, 'left'),
        textEl(ctx.heroSub, { color: BODY_ON_DARK, fontSize: '18px', lineHeight: '1.6' }),
        buttonEl('Get Started Free', palette, '#contact', { shadow: `0 16px 32px -8px ${palette.glow || palette.primary + '66'}` }),
        buttonEl('Explore Platform →', palette, '#services', { preset: 'glass', bgColor: 'rgba(255, 255, 255, 0.12)', borderColor: 'rgba(255, 255, 255, 0.25)' }),
        ratingEl(ctx)
      ], 'center'),
      col(45, right, 'center')
    ]
  );
}

function buildHomeSplitHero(bank: CopyBank, ctx: any, palette: any, selected: string[]): any {
  const sections: any[] = [
    navSection(ctx.businessName, ctx.pageNames),
    splitHeroSection(bank, ctx, palette),
    // Marquee directly under the hero — no section in between.
    marqueeSection(bank, ctx, palette),
    statsSection(ctx, palette),
    sectionHeader(
      'Services Heading',
      'services-heading',
      'What we do',
      fill(bank.servicesHeading, ctx.businessName, ctx.desc),
      fill(bank.servicesSub, ctx.businessName, ctx.desc),
      palette
    ),
    servicesSection(bank, ctx, palette, 6),
    ...processBlocks(bank, ctx, palette),
    sectionHeader(
      'Benefits Heading',
      'why-heading',
      'Why choose us',
      fill(bank.benefitsHeading, ctx.businessName, ctx.desc),
      'Three reasons customers pick us — and stay.',
      palette,
      { bgColor: palette.light }
    ),
    benefitsSection(bank, ctx, palette),
    aboutSplitSection(bank, ctx, palette),
    sectionHeader(
      'Testimonials Heading',
      'testimonials-heading',
      'Testimonials',
      'What customers say',
      `Real reviews from real customers of ${ctx.businessName}.`,
      palette,
      { bgColor: palette.light }
    ),
    ratingSection(ctx, palette),
    testimonialsSection(bank, ctx, palette)
  ];
  if (selected.includes('pricing')) {
    sections.push(
      sectionHeader('Pricing Heading', 'pricing-heading', 'Pricing', 'Simple, honest pricing', 'Pick the option that fits — upgrade, downgrade or cancel anytime.', palette),
      pricingSection(bank, palette)
    );
  }
  // Shops / restaurants always carry the countdown offer, whichever of
  // their two blueprints the name hash picked.
  if (ctx.categoryId === 'shop' || ctx.categoryId === 'restaurant') {
    sections.push(countdownBannerSection(bank, ctx, palette));
  }
  sections.push(ctaSection(bank, ctx, palette), contactSection(ctx, palette, true), ...footerSection(ctx.businessName, bank, ctx, palette));
  return { id: uid('page'), name: 'Home', slug: '/', sections };
}

// Blueprint 4 — 'story': narrative flow — hero, about + timeline, process,
// skill bars, services, then social proof.
function buildHomeStory(bank: CopyBank, ctx: any, palette: any, selected: string[]): any {
  const sections: any[] = [
    navSection(ctx.businessName, ctx.pageNames),
    heroSection(bank, ctx, palette),
    marqueeSection(bank, ctx, palette),
    aboutSplitSection(bank, ctx, palette),
    ...timelineBlocks(bank, ctx, palette, true),
    ...processBlocks(bank, ctx, palette, true),
    ...skillbarBlocks(bank, ctx, palette, true),
    sectionHeader(
      'Services Heading',
      'services-heading',
      'What we do',
      fill(bank.servicesHeading, ctx.businessName, ctx.desc),
      fill(bank.servicesSub, ctx.businessName, ctx.desc),
      palette
    ),
    servicesSection(bank, ctx, palette, 3),
    statsSection(ctx, palette),
    sectionHeader(
      'Testimonials Heading',
      'testimonials-heading',
      'Testimonials',
      'What customers say',
      `Real reviews from real customers of ${ctx.businessName}.`,
      palette,
      { bgColor: palette.light }
    ),
    ratingSection(ctx, palette),
    testimonialsSection(bank, ctx, palette)
  ];
  if (selected.includes('pricing')) {
    sections.push(
      sectionHeader('Pricing Heading', 'pricing-heading', 'Pricing', 'Simple, honest pricing', 'Pick the option that fits — upgrade, downgrade or cancel anytime.', palette),
      pricingSection(bank, palette)
    );
  }
  sections.push(ctaSection(bank, ctx, palette), contactSection(ctx, palette, true), ...footerSection(ctx.businessName, bank, ctx, palette));
  return { id: uid('page'), name: 'Home', slug: '/', sections };
}

// Blueprint 5 — 'offer': countdown banner above the hero, pricing pulled
// forward right after the marquee, FAQ, and a CTA that repeats the countdown.
function offerCtaSection(bank: CopyBank, ctx: any, palette: any): any {
  const base = ctaSection(bank, ctx, palette);
  base.name = 'Offer Call to Action';
  base.columns[0].elements.push(countdownEl(ctx, 14, palette.primary));
  return base;
}

function buildHomeOffer(bank: CopyBank, ctx: any, palette: any, selected: string[]): any {
  const sections: any[] = [
    navSection(ctx.businessName, ctx.pageNames),
    countdownBannerSection(bank, ctx, palette),
    heroSection(bank, ctx, palette),
    marqueeSection(bank, ctx, palette),
    sectionHeader(
      'Pricing Heading',
      'pricing-heading',
      'Pricing',
      'Simple, honest pricing',
      'Pick the option that fits — upgrade, downgrade or cancel anytime.',
      palette
    ),
    pricingSection(bank, palette),
    sectionHeader(
      'Services Heading',
      'services-heading',
      'What we do',
      fill(bank.servicesHeading, ctx.businessName, ctx.desc),
      fill(bank.servicesSub, ctx.businessName, ctx.desc),
      palette
    ),
    servicesSection(bank, ctx, palette, 3),
    ...processBlocks(bank, ctx, palette),
    ...faqBlocks(bank, ctx, palette),
    sectionHeader(
      'Testimonials Heading',
      'testimonials-heading',
      'Testimonials',
      'What customers say',
      `Real reviews from real customers of ${ctx.businessName}.`,
      palette,
      { bgColor: palette.light }
    ),
    ratingSection(ctx, palette),
    testimonialsSection(bank, ctx, palette),
    offerCtaSection(bank, ctx, palette),
    contactSection(ctx, palette, true),
    ...footerSection(ctx.businessName, bank, ctx, palette)
  ];
  return { id: uid('page'), name: 'Home', slug: '/', sections };
}

function buildHomePage(bank: CopyBank, ctx: any, palette: any, selected: string[]): any {
  const blueprint = ctx.blueprint || blueprintForCategory(ctx.categoryId, ctx.businessName);
  ctx.blueprint = blueprint;
  switch (blueprint) {
    case 'bento':
      return buildHomeBento(bank, ctx, palette, selected);
    case 'split-hero':
      return buildHomeSplitHero(bank, ctx, palette, selected);
    case 'story':
      return buildHomeStory(bank, ctx, palette, selected);
    case 'offer':
      return buildHomeOffer(bank, ctx, palette, selected);
    case 'classic-modern':
    default:
      return buildHomeClassicModern(bank, ctx, palette, selected);
  }
}

function buildAboutPage(bank: CopyBank, ctx: any, palette: any): any {
  const teamSection = section(
    'Team',
    'team',
    { bgColor: '#ffffff', paddingTop: '24px', paddingBottom: '96px' },
    bank.teamRoles.map((role, i) =>
      col(33.33, [
        el(
          'teammember',
          {
            name: TEAM_NAMES[i % TEAM_NAMES.length],
            role: fill(role, ctx.businessName, ctx.desc),
            avatar: img(TEAM_AVATARS[i % TEAM_AVATARS.length], 300),
            bio: `Part of the ${ctx.businessName} team, focused on ${role.toLowerCase()} and the details customers remember.`
          },
          {
            bgColor: '#ffffff',
            borderColor: '#e2e8f0',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '24px',
            shadow: SOFT_SHADOW,
            hoverScale: 1.03,
            hoverShadow: LIFT_SHADOW
          }
        )
      ])
    )
  );
  return {
    id: uid('page'),
    name: 'About',
    slug: '/about',
    sections: [
      navSection(ctx.businessName, ctx.pageNames),
      miniHero(`About ${ctx.businessName}`, fill(bank.aboutText, ctx.businessName, ctx.desc), palette, ctx),
      aboutSplitSection(bank, ctx, palette),
      // About pages always carry the company timeline; agency / saas /
      // real-estate (portfolio-style) About pages also carry skill bars.
      ...timelineBlocks(bank, ctx, palette, true),
      ...skillbarBlocks(bank, ctx, palette),
      sectionHeader('Team Heading', 'team-heading', 'Our team', 'Meet the team', `The people behind ${ctx.businessName}.`, palette),
      teamSection,
      ...footerSection(ctx.businessName, bank, ctx, palette)
    ]
  };
}

function buildServicesPage(bank: CopyBank, ctx: any, palette: any): any {
  return {
    id: uid('page'),
    name: 'Services',
    slug: '/services',
    sections: [
      navSection(ctx.businessName, ctx.pageNames),
      miniHero('Our Services', fill(bank.servicesSub, ctx.businessName, ctx.desc), palette, ctx),
      servicesSection(bank, ctx, palette, 6),
      sectionHeader(
        'Benefits Heading',
        'why-heading',
        'Why choose us',
        fill(bank.benefitsHeading, ctx.businessName, ctx.desc),
        'Three reasons customers pick us — and stay.',
        palette,
        { bgColor: palette.light }
      ),
      benefitsSection(bank, ctx, palette),
      ...processBlocks(bank, ctx, palette),
      ctaSection(bank, ctx, palette),
      ...footerSection(ctx.businessName, bank, ctx, palette)
    ]
  };
}

function buildPricingPage(bank: CopyBank, ctx: any, palette: any): any {
  const faqSection = section(
    'FAQs',
    'faqs',
    { bgColor: '#ffffff', paddingTop: '24px', paddingBottom: '96px' },
    [
      col(100, [
        el(
          'accordion',
          { items: bank.faqs.map((f) => ({ id: uid('faq'), q: fill(f.q, ctx.businessName, ctx.desc), a: fill(f.a, ctx.businessName, ctx.desc) })) },
          { bgColor: '#ffffff', color: INK, borderColor: '#e2e8f0', borderRadius: '16px' }
        )
      ])
    ]
  );
  return {
    id: uid('page'),
    name: 'Pricing',
    slug: '/pricing',
    sections: [
      navSection(ctx.businessName, ctx.pageNames),
      miniHero('Pricing', 'Simple, honest pricing — pick the option that fits and change it anytime.', palette, ctx),
      pricingSection(bank, palette),
      sectionHeader(
        'FAQ Heading',
        'faq-heading',
        'FAQ',
        'Frequently asked questions',
        'Everything else you might want to know before getting started.',
        palette
      ),
      faqSection,
      ctaSection(bank, ctx, palette),
      ...footerSection(ctx.businessName, bank, ctx, palette)
    ]
  };
}

function buildContactPage(bank: CopyBank, ctx: any, palette: any): any {
  return {
    id: uid('page'),
    name: 'Contact',
    slug: '/contact',
    sections: [
      navSection(ctx.businessName, ctx.pageNames),
      miniHero('Contact Us', `Talk to the ${ctx.businessName} team — we reply within one working day.`, palette, ctx),
      contactSection(ctx, palette, true),
      ...footerSection(ctx.businessName, bank, ctx, palette)
    ]
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export type AiSiteWidth = 'full' | 'boxed' | '80';

export function normalizeSiteWidth(value: unknown): AiSiteWidth {
  return value === 'full' || value === '80' || value === 'boxed' ? value : 'boxed';
}

// Stamp the global site width onto EVERY generated section (nav, hero,
// footers — everything). The store / toolbar own persisting + applying this
// at render time; the generator only has to record it and stamp the sections.
//   full  -> widthType 'screen' (no customWidth)
//   boxed -> widthType 'boxed'  (no customWidth)
//   '80'  -> widthType 'custom', customWidth '80%'
export function applySiteWidthToPages(pages: any[], siteWidth: AiSiteWidth): any[] {
  for (const page of pages || []) {
    for (const sec of page.sections || []) {
      const styles: Record<string, any> = { ...(sec.styles || {}) };
      delete styles.customWidth;
      if (siteWidth === 'full') {
        styles.widthType = 'screen';
      } else if (siteWidth === '80') {
        styles.widthType = 'custom';
        styles.customWidth = '80%';
      } else {
        styles.widthType = 'boxed';
      }
      sec.styles = styles;
    }
  }
  return pages;
}

export function generateSiteFromPrompt(input: {
  businessName: string;
  category: string;
  description?: string;
  paletteId?: string;
  pages?: string[];
  siteWidth?: string;
}): any {
  const businessName = (input.businessName || '').trim() || 'My Business';
  const categoryDef = AI_CATEGORIES.find((c) => c.id === input.category) || AI_CATEGORIES[AI_CATEGORIES.length - 1];
  const bank = BANKS[categoryDef.id] || BANKS.generic;
  const palette = AI_PALETTES.find((p) => p.id === input.paletteId) || AI_PALETTES[0];

  const requested = Array.isArray(input.pages) && input.pages.length > 0 ? input.pages : ['home'];
  const selected = PAGE_ORDER.filter((p) => p === 'home' || requested.includes(p));
  const pageNames = selected.map((p) => PAGE_DEFS[p].name);

  const rawDesc = (input.description || '').trim().replace(/\.$/, '');
  const desc = rawDesc || fill(bank.descFallback, businessName, '');

  const siteWidth = normalizeSiteWidth((input as any).siteWidth);

  const ctx = {
    businessName,
    desc,
    categoryLabel: categoryDef.label,
    categoryId: categoryDef.id,
    slug: businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'my-business',
    pageNames,
    siteWidth,
    blueprint: blueprintForCategory(categoryDef.id, businessName),
    heroHeadline: fill(bank.heroHeadline, businessName, desc),
    heroSub: fill(bank.heroSub, businessName, desc)
  };

  const builders: Record<string, () => any> = {
    home: () => buildHomePage(bank, ctx, palette, selected),
    about: () => buildAboutPage(bank, ctx, palette),
    services: () => buildServicesPage(bank, ctx, palette),
    pricing: () => buildPricingPage(bank, ctx, palette),
    contact: () => buildContactPage(bank, ctx, palette)
  };

  const pages = selected.map((key) => builders[key]());
  applySiteWidthToPages(pages, siteWidth);
  const homePage = pages[0];

  return {
    id: `site-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    version: '1.0.0',
    name: businessName,
    siteWidth,
    blueprint: ctx.blueprint,
    pages,
    currentPageId: homePage.id,
    globalSections: {},
    collections: [],
    submissions: [],
    savedAt: new Date().toISOString()
  };
}
