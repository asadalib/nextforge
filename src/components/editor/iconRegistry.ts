import React from 'react';
import {
  // General & Essentials
  Star, Heart, Flame, Sparkles, Zap, Trophy, Award, Crown, Gift, Coffee, Smile, Compass, Target, Flag, Bookmark, Lightbulb, Sun, Moon, Rocket, Bell, Globe,
  // Tech & Development
  Code, Terminal, Cpu, Database, Server, Cloud, Wifi, GitBranch, Layers, Layout, Box, Monitor, Smartphone, Tablet, Laptop, HardDrive, Key, Shield, ShieldCheck, Lock, Unlock, Bug, Radio, Binary, Wrench, Hammer, Cog, Sliders, SlidersHorizontal, Eye, EyeOff, FileCode,
  // Business & Finance
  Briefcase, CreditCard, DollarSign, TrendingUp, TrendingDown, BarChart, BarChart2, BarChart3, PieChart, LineChart, ShoppingCart, ShoppingBag, Store, Tag, Receipt, Wallet, Package, Truck, Percent, Coins, Landmark, Building, Building2,
  // Communication & Social
  Mail, MessageSquare, MessageCircle, Send, Share2, Phone, PhoneCall, Video, Megaphone, AtSign, User, Users, UserCheck, UserPlus, UserMinus, ThumbsUp, ThumbsDown,
  Search, Settings, Filter, Check, CheckCircle2, CheckSquare, XCircle, AlertCircle, AlertTriangle, Info, HelpCircle, Trash2, Edit, Edit3, Plus, Minus, ExternalLink, Link2, Copy, RefreshCw, Upload, Download, Home, Menu, Grid, List, Clock, Calendar, MapPin, Navigation, Paperclip, Pin, Power, Volume2, VolumeX, Camera, Image, Music, Play, Pause,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, MoveLeft, MoveRight,
  LucideIcon
} from 'lucide-react';

export interface IconItem {
  name: string;
  label: string;
  category: 'Essentials' | 'Tech' | 'Business' | 'Social' | 'UI';
  icon: LucideIcon;
}

export const ICON_CATEGORIES = ['All', 'Essentials', 'Tech', 'Business', 'Social', 'UI'] as const;
export type IconCategory = (typeof ICON_CATEGORIES)[number];

export const AVAILABLE_ICONS: IconItem[] = [
  // Essentials (21)
  { name: 'star', label: 'Star', category: 'Essentials', icon: Star },
  { name: 'sparkles', label: 'Sparkles', category: 'Essentials', icon: Sparkles },
  { name: 'zap', label: 'Zap / Flash', category: 'Essentials', icon: Zap },
  { name: 'flame', label: 'Flame / Hot', category: 'Essentials', icon: Flame },
  { name: 'heart', label: 'Heart / Favorite', category: 'Essentials', icon: Heart },
  { name: 'trophy', label: 'Trophy', category: 'Essentials', icon: Trophy },
  { name: 'award', label: 'Award', category: 'Essentials', icon: Award },
  { name: 'crown', label: 'Crown / VIP', category: 'Essentials', icon: Crown },
  { name: 'rocket', label: 'Rocket / Launch', category: 'Essentials', icon: Rocket },
  { name: 'gift', label: 'Gift', category: 'Essentials', icon: Gift },
  { name: 'coffee', label: 'Coffee', category: 'Essentials', icon: Coffee },
  { name: 'smile', label: 'Smile', category: 'Essentials', icon: Smile },
  { name: 'target', label: 'Target / Goal', category: 'Essentials', icon: Target },
  { name: 'flag', label: 'Flag', category: 'Essentials', icon: Flag },
  { name: 'bookmark', label: 'Bookmark', category: 'Essentials', icon: Bookmark },
  { name: 'lightbulb', label: 'Idea / Lightbulb', category: 'Essentials', icon: Lightbulb },
  { name: 'sun', label: 'Sun / Light', category: 'Essentials', icon: Sun },
  { name: 'moon', label: 'Moon / Dark', category: 'Essentials', icon: Moon },
  { name: 'bell', label: 'Notification', category: 'Essentials', icon: Bell },
  { name: 'globe', label: 'Globe / World', category: 'Essentials', icon: Globe },
  { name: 'compass', label: 'Compass / Explore', category: 'Essentials', icon: Compass },

  // Tech & Development (32)
  { name: 'code', label: 'Code', category: 'Tech', icon: Code },
  { name: 'terminal', label: 'Terminal / CLI', category: 'Tech', icon: Terminal },
  { name: 'cpu', label: 'CPU / Chip', category: 'Tech', icon: Cpu },
  { name: 'database', label: 'Database', category: 'Tech', icon: Database },
  { name: 'server', label: 'Server', category: 'Tech', icon: Server },
  { name: 'cloud', label: 'Cloud', category: 'Tech', icon: Cloud },
  { name: 'wifi', label: 'Wifi', category: 'Tech', icon: Wifi },
  { name: 'gitbranch', label: 'Git Branch', category: 'Tech', icon: GitBranch },
  { name: 'layers', label: 'Layers', category: 'Tech', icon: Layers },
  { name: 'layout', label: 'Layout', category: 'Tech', icon: Layout },
  { name: 'box', label: 'Box / Package', category: 'Tech', icon: Box },
  { name: 'filecode', label: 'File Code', category: 'Tech', icon: FileCode },
  { name: 'monitor', label: 'Desktop Monitor', category: 'Tech', icon: Monitor },
  { name: 'laptop', label: 'Laptop', category: 'Tech', icon: Laptop },
  { name: 'tablet', label: 'Tablet', category: 'Tech', icon: Tablet },
  { name: 'smartphone', label: 'Smartphone', category: 'Tech', icon: Smartphone },
  { name: 'harddrive', label: 'Storage Disk', category: 'Tech', icon: HardDrive },
  { name: 'key', label: 'API Key / Access', category: 'Tech', icon: Key },
  { name: 'shield', label: 'Shield', category: 'Tech', icon: Shield },
  { name: 'shieldcheck', label: 'Verified Shield', category: 'Tech', icon: ShieldCheck },
  { name: 'lock', label: 'Locked / Secure', category: 'Tech', icon: Lock },
  { name: 'unlock', label: 'Unlocked', category: 'Tech', icon: Unlock },
  { name: 'bug', label: 'Bug / Issue', category: 'Tech', icon: Bug },
  { name: 'radio', label: 'Radio Signal', category: 'Tech', icon: Radio },
  { name: 'binary', label: 'Binary Code', category: 'Tech', icon: Binary },
  { name: 'wrench', label: 'Wrench / Fix', category: 'Tech', icon: Wrench },
  { name: 'hammer', label: 'Hammer / Build', category: 'Tech', icon: Hammer },
  { name: 'cog', label: 'Engine Cog', category: 'Tech', icon: Cog },
  { name: 'sliders', label: 'Sliders', category: 'Tech', icon: Sliders },
  { name: 'slidershorizontal', label: 'Controls', category: 'Tech', icon: SlidersHorizontal },
  { name: 'eye', label: 'Eye / View', category: 'Tech', icon: Eye },
  { name: 'eyeoff', label: 'Eye Off / Hidden', category: 'Tech', icon: EyeOff },

  // Business & Commerce (23)
  { name: 'briefcase', label: 'Briefcase / Business', category: 'Business', icon: Briefcase },
  { name: 'creditcard', label: 'Credit Card', category: 'Business', icon: CreditCard },
  { name: 'dollarsign', label: 'Dollar / Price', category: 'Business', icon: DollarSign },
  { name: 'coins', label: 'Coins', category: 'Business', icon: Coins },
  { name: 'wallet', label: 'Wallet', category: 'Business', icon: Wallet },
  { name: 'receipt', label: 'Receipt / Invoice', category: 'Business', icon: Receipt },
  { name: 'trendingup', label: 'Growth / Uptrend', category: 'Business', icon: TrendingUp },
  { name: 'trendingdown', label: 'Downtrend', category: 'Business', icon: TrendingDown },
  { name: 'barchart', label: 'Bar Chart', category: 'Business', icon: BarChart },
  { name: 'barchart2', label: 'Analytics Bars', category: 'Business', icon: BarChart2 },
  { name: 'barchart3', label: 'Reports', category: 'Business', icon: BarChart3 },
  { name: 'piechart', label: 'Pie Chart', category: 'Business', icon: PieChart },
  { name: 'linechart', label: 'Line Chart', category: 'Business', icon: LineChart },
  { name: 'shoppingcart', label: 'Shopping Cart', category: 'Business', icon: ShoppingCart },
  { name: 'shoppingbag', label: 'Shopping Bag', category: 'Business', icon: ShoppingBag },
  { name: 'store', label: 'Store / Shop', category: 'Business', icon: Store },
  { name: 'tag', label: 'Price Tag', category: 'Business', icon: Tag },
  { name: 'package', label: 'Order Package', category: 'Business', icon: Package },
  { name: 'truck', label: 'Fast Delivery', category: 'Business', icon: Truck },
  { name: 'percent', label: 'Discount %', category: 'Business', icon: Percent },
  { name: 'landmark', label: 'Bank / Landmark', category: 'Business', icon: Landmark },
  { name: 'building', label: 'Enterprise', category: 'Business', icon: Building },
  { name: 'building2', label: 'Offices', category: 'Business', icon: Building2 },

  // Social & Communication (17)
  { name: 'mail', label: 'Email / Mail', category: 'Social', icon: Mail },
  { name: 'messagesquare', label: 'Chat Message', category: 'Social', icon: MessageSquare },
  { name: 'messagecircle', label: 'Discussion', category: 'Social', icon: MessageCircle },
  { name: 'send', label: 'Send Direct', category: 'Social', icon: Send },
  { name: 'share2', label: 'Share', category: 'Social', icon: Share2 },
  { name: 'phone', label: 'Phone', category: 'Social', icon: Phone },
  { name: 'phonecall', label: 'Call Now', category: 'Social', icon: PhoneCall },
  { name: 'video', label: 'Video Call', category: 'Social', icon: Video },
  { name: 'megaphone', label: 'Announcement', category: 'Social', icon: Megaphone },
  { name: 'atsign', label: 'Mention / At', category: 'Social', icon: AtSign },
  { name: 'user', label: 'User Profile', category: 'Social', icon: User },
  { name: 'users', label: 'Team / Community', category: 'Social', icon: Users },
  { name: 'usercheck', label: 'Verified User', category: 'Social', icon: UserCheck },
  { name: 'userplus', label: 'Add User', category: 'Social', icon: UserPlus },
  { name: 'userminus', label: 'Remove User', category: 'Social', icon: UserMinus },
  { name: 'thumbsup', label: 'Thumbs Up / Like', category: 'Social', icon: ThumbsUp },
  { name: 'thumbsdown', label: 'Thumbs Down', category: 'Social', icon: ThumbsDown },

  // UI & Actions (40)
  { name: 'search', label: 'Search', category: 'UI', icon: Search },
  { name: 'settings', label: 'Settings', category: 'UI', icon: Settings },
  { name: 'filter', label: 'Filter', category: 'UI', icon: Filter },
  { name: 'check', label: 'Checkmark', category: 'UI', icon: Check },
  { name: 'checkcircle2', label: 'Success Circle', category: 'UI', icon: CheckCircle2 },
  { name: 'checksquare', label: 'Checkbox', category: 'UI', icon: CheckSquare },
  { name: 'xcircle', label: 'Error / Cancel', category: 'UI', icon: XCircle },
  { name: 'alertcircle', label: 'Warning Circle', category: 'UI', icon: AlertCircle },
  { name: 'alerttriangle', label: 'Caution Alert', category: 'UI', icon: AlertTriangle },
  { name: 'info', label: 'Info Help', category: 'UI', icon: Info },
  { name: 'helpcircle', label: 'FAQ Question', category: 'UI', icon: HelpCircle },
  { name: 'trash2', label: 'Delete / Trash', category: 'UI', icon: Trash2 },
  { name: 'edit', label: 'Edit Pencil', category: 'UI', icon: Edit },
  { name: 'edit3', label: 'Write Note', category: 'UI', icon: Edit3 },
  { name: 'plus', label: 'Plus / Add', category: 'UI', icon: Plus },
  { name: 'minus', label: 'Minus / Remove', category: 'UI', icon: Minus },
  { name: 'externallink', label: 'External Link', category: 'UI', icon: ExternalLink },
  { name: 'link2', label: 'Direct URL Link', category: 'UI', icon: Link2 },
  { name: 'copy', label: 'Copy Clipboard', category: 'UI', icon: Copy },
  { name: 'refreshcw', label: 'Refresh / Sync', category: 'UI', icon: RefreshCw },
  { name: 'upload', label: 'Upload Cloud', category: 'UI', icon: Upload },
  { name: 'download', label: 'Download File', category: 'UI', icon: Download },
  { name: 'home', label: 'Home Page', category: 'UI', icon: Home },
  { name: 'menu', label: 'Hamburger Menu', category: 'UI', icon: Menu },
  { name: 'grid', label: 'Grid View', category: 'UI', icon: Grid },
  { name: 'list', label: 'List View', category: 'UI', icon: List },
  { name: 'clock', label: 'Time / Clock', category: 'UI', icon: Clock },
  { name: 'calendar', label: 'Calendar Date', category: 'UI', icon: Calendar },
  { name: 'mappin', label: 'Location Map', category: 'UI', icon: MapPin },
  { name: 'navigation', label: 'GPS Navigation', category: 'UI', icon: Navigation },
  { name: 'paperclip', label: 'Attachment', category: 'UI', icon: Paperclip },
  { name: 'pin', label: 'Pin Feature', category: 'UI', icon: Pin },
  { name: 'power', label: 'Power / Standby', category: 'UI', icon: Power },
  { name: 'volume2', label: 'Audio Speaker', category: 'UI', icon: Volume2 },
  { name: 'volumex', label: 'Mute Audio', category: 'UI', icon: VolumeX },
  { name: 'camera', label: 'Photo Camera', category: 'UI', icon: Camera },
  { name: 'image', label: 'Image Gallery', category: 'UI', icon: Image },
  { name: 'music', label: 'Audio Track', category: 'UI', icon: Music },
  { name: 'play', label: 'Play Media', category: 'UI', icon: Play },
  { name: 'pause', label: 'Pause Media', category: 'UI', icon: Pause }
];

// Fast O(1) icon lookup dictionary (normalizes casing & aliases)
const ICON_MAP: Record<string, LucideIcon> = {};
AVAILABLE_ICONS.forEach((item) => {
  ICON_MAP[item.name.toLowerCase()] = item.icon;
  // Also register with clean punctuation removed (e.g. check-circle -> checkcircle2)
  const clean = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  ICON_MAP[clean] = item.icon;
});

// Directional & Navigation icons
ICON_MAP['arrowright'] = ArrowRight;
ICON_MAP['arrowleft'] = ArrowLeft;
ICON_MAP['chevronleft'] = ChevronLeft;
ICON_MAP['chevronright'] = ChevronRight;
ICON_MAP['chevrondown'] = ChevronDown;
ICON_MAP['chevronup'] = ChevronUp;
ICON_MAP['moveleft'] = MoveLeft;
ICON_MAP['moveright'] = MoveRight;

// Extra aliases to ensure backward compatibility and smooth user search
ICON_MAP['shield-check'] = ShieldCheck;
ICON_MAP['check-circle'] = CheckCircle2;
ICON_MAP['chat'] = MessageSquare;
ICON_MAP['email'] = Mail;
ICON_MAP['call'] = Phone;
ICON_MAP['support'] = HelpCircle;

export function getLucideIcon(iconName?: string): LucideIcon {
  if (!iconName) return Star;
  const key = iconName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  return ICON_MAP[key] || ICON_MAP[iconName.toLowerCase().trim()] || Star;
}
