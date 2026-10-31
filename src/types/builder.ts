// TypeScript Definitions for NextForge Builder

export type WidgetType =
  | 'innerrow' | 'heading' | 'text' | 'button' | 'image' | 'imagebox' | 'video'
  | 'icon' | 'iconbox' | 'flipbox' | 'badge' | 'contentcard' | 'alert'
  | 'iconlist' | 'counter' | 'testimonial' | 'gallery' | 'carousel'
  | 'mediacarousel' | 'tabs' | 'accordion' | 'pricingcard' | 'teammember'
  | 'logocloud' | 'cta' | 'contactdetails' | 'form' | 'map' | 'spacer'
  | 'divider' | 'table' | 'search' | 'posts' | 'portfolio' | 'collection'
  | 'navigation' | 'beforeafter'
  | 'marquee' | 'processsteps' | 'skillbar' | 'countdown'
  | 'socialicons' | 'rating' | 'timeline' | 'typewriterheadline' | 'lottie';

export interface ElementStyles {
  fontFamily?: string;
  color?: string;
  bgColor?: string;
  bgGradient?: string;
  bgImage?: string;
  bgSize?: string;
  bgPosition?: string;
  bgRepeat?: string;
  bgOverlayColor?: string;
  bgOverlayOpacity?: number;
  columnGap?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing?: string;
  lineHeight?: string;
  headingLetterSpacing?: string;
  headingLineHeight?: string;
  descLetterSpacing?: string;
  descLineHeight?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  gap?: string;
  zIndex?: number | string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
  shadow?: string;
  textShadow?: string;
  headingTextShadow?: string;
  hoverColor?: string;
  hoverBgColor?: string;
  hoverBorderColor?: string;
  hoverShadow?: string;
  hoverScale?: string;
  buttonPreset?: 'solid' | 'outline' | 'soft' | 'gradient' | 'glow' | 'pill' | 'glass' | '3d' | 'minimal' | 'shine';
  buttonHoverEffect?: 'none' | 'lift' | 'scale' | 'pulse' | 'bounce' | 'push' | 'glow' | 'shine-sweep';
  buttonHoverShadow?: 'none' | 'subtle' | 'medium' | 'large' | 'glow' | 'colored' | 'sharp-3d' | 'inner-glow';
  buttonInsideEffect?: 'none' | 'glass-sheen' | 'shine-sweep' | 'fill-slide' | 'neon-border';
  widthType?: 'boxed' | 'screen' | 'custom';
  customWidth?: string;
  sectionAlign?: 'left' | 'center' | 'right';
  align?: 'left' | 'center' | 'right';
  inputBorderRadius?: string;
  buttonBorderRadius?: string;
  inputBgColor?: string;
  inputTextColor?: string;
  inputBorderColor?: string;
  iconColor?: string;
  iconBgColor?: string;
  iconSize?: string;
  iconPadding?: string;
  iconBorderRadius?: string;
  iconBorderWidth?: string;
  iconBorderColor?: string;
  iconAnimation?: 'none' | 'pulse' | 'float' | 'shimmer' | 'spin-slow' | 'bounce-soft' | 'wiggle' | 'hover-lift' | 'hover-spin' | string;
  iconAnimationTrigger?: 'always' | 'hover' | string;
  iconAnimationSpeed?: 'slow' | 'normal' | 'fast' | string;
  headingFontFamily?: string;
  headingFontSize?: string;
  headingFontWeight?: string;
  headingColor?: string;
  headingTextTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  descFontFamily?: string;
  descFontSize?: string;
  descFontWeight?: string;
  descColor?: string;
  descTextTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  navLayout?: 'standard' | 'centered' | 'split' | 'minimal' | 'stacked';
  navStyle?: 'clean' | 'glass' | 'floating' | 'bordered' | 'dark' | 'gradient';
  isSticky?: boolean;
  stickyBehavior?: 'always' | 'show-after' | 'hide-after' | 'hide-inside';
  stickyTargetSection?: string;
  stickySiteWide?: boolean;
  minHeight?: string;
  height?: string;
  equalHeightColumns?: boolean;
  rowWidthType?: 'full' | 'boxed' | 'contained' | 'compact' | 'custom';
  rowCustomWidth?: string;
  rowAlign?: 'left' | 'center' | 'right';
  rowVerticalAlign?: 'top' | 'center' | 'bottom' | 'stretch';
  contentVerticalAlign?: 'top' | 'center' | 'bottom';
  customId?: string;
  customClass?: string;
  [key: string]: any;
}

export interface NavLinkItem {
  label: string;
  url: string;
  openInNewTab?: boolean;
}

export interface ResponsiveSettings {
  desktopShow?: boolean;
  tabletShow?: boolean;
  mobileShow?: boolean;
  mobileStackColumns?: boolean;
}

export interface ElementModel {
  id: string;
  type: WidgetType;
  label: string;
  content: Record<string, any>;
  styles: ElementStyles;
  responsive?: ResponsiveSettings;
}

export interface ColumnModel {
  id: string;
  widthPercentage: number; // e.g. 50, 33.33, 25, 55, 45
  elements: ElementModel[];
  verticalAlign?: 'top' | 'center' | 'bottom';
  gap?: string;
  styles?: ElementStyles;
}

export interface RowModel {
  id: string;
  columns: ColumnModel[];
  styles?: ElementStyles;
}

export interface PageModel {
  id: string;
  name: string;
  slug: string;
  sections: SectionModel[];
}

export interface SectionModel {
  id: string;
  name: string;
  customId?: string; // HTML anchor ID e.g. "features", "pricing", "contact"
  isDynamic?: boolean; // Dynamic / Global reusable symbol
  globalId?: string; // Links all instances of this reusable section across pages
  columns: ColumnModel[];
  rows?: RowModel[];
  styles: ElementStyles;
  isCollapsed?: boolean;
  isLocked?: boolean;
}

export interface CollectionRecord {
  id: string;
  title: string;
  slug: string;
  category?: string;
  price?: number;
  image?: string;
  description?: string;
  data?: Record<string, any>;
}

export interface CollectionModel {
  id: string;
  name: string;
  records: CollectionRecord[];
}

export interface FormSubmissionModel {
  id: string;
  formName: string;
  senderName: string;
  email: string;
  date: string;
  data: Record<string, any>;
}

export interface ProjectFileJSON {
  version: string;
  name: string;
  pages?: PageModel[];
  currentPageId?: string;
  globalSections?: Record<string, SectionModel>;
  collections?: CollectionModel[];
  submissions?: FormSubmissionModel[];
  savedAt?: string;
}
