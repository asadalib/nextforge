import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle, ArrowRight, BarChart2, Box, CheckSquare, Columns,
  CreditCard, DollarSign, FileText, Grid, Heading, HelpCircle,
  Image as ImageIcon, Images, Layout, LayoutGrid, List, Mail, MapPin,
  MessageSquare, Play, Plus, Search, Sliders, Star, Table, Tag, Type,
  User, Users, Video, Zap, X, Clock, Repeat, Share2, History, Layers, Sparkles
} from 'lucide-react';
import { WidgetType } from '../../types/builder';

interface ElementPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectElement: (type: WidgetType) => void;
  columnTitle?: string;
}

interface WidgetItem {
  type: WidgetType;
  label: string;
  category: 'Basic' | 'Media' | 'Interactive' | 'Marketing' | 'Structure';
  icon: any;
  description: string;
}

const ALL_PICKER_WIDGETS: WidgetItem[] = [
  // Basic
  { type: 'heading', label: 'Heading', category: 'Basic', icon: Heading, description: 'Eye-catching title with custom typography' },
  { type: 'text', label: 'Text Editor', category: 'Basic', icon: Type, description: 'Formatted paragraph text with rich styling' },
  { type: 'button', label: 'Button', category: 'Basic', icon: ArrowRight, description: 'Call-to-action button with links and icons' },
  { type: 'icon', label: 'Icon', category: 'Basic', icon: Star, description: 'Scalable vector icon with label and badge' },
  { type: 'iconbox', label: 'Icon Box', category: 'Basic', icon: Box, description: 'Icon card with heading and description' },
  { type: 'typewriterheadline', label: 'Animated Heading', category: 'Basic', icon: Sparkles, description: 'Rotating animated headline with typewriter effect and blinking cursor' },
  { type: 'badge', label: 'Badge', category: 'Basic', icon: Tag, description: 'Status pill or feature highlight badge' },

  // Media
  { type: 'image', label: 'Image', category: 'Media', icon: ImageIcon, description: 'Responsive image with rounded corners and shadow' },
  { type: 'imagebox', label: 'Image Box', category: 'Media', icon: ImageIcon, description: 'Image with accompanying title and text' },
  { type: 'video', label: 'Video Player', category: 'Media', icon: Video, description: 'Embedded video player with play controls' },
  { type: 'gallery', label: 'Gallery', category: 'Media', icon: Images, description: 'Multi-image grid showcase' },
  { type: 'beforeafter', label: 'Before / After', category: 'Media', icon: Sliders, description: 'Interactive image comparison split slider' },
  { type: 'lottie', label: 'Lottie Animation', category: 'Media', icon: Play, description: 'Embed interactive Lottie vector animations with loop and speed controls' },

  // Interactive & Form
  { type: 'form', label: 'Contact Form', category: 'Interactive', icon: CheckSquare, description: 'Lead capture form with name, email and button' },
  { type: 'accordion', label: 'Accordion (FAQ)', category: 'Interactive', icon: HelpCircle, description: 'Collapsible FAQ items' },
  { type: 'tabs', label: 'Tabs', category: 'Interactive', icon: Sliders, description: 'Tabbed switchable content panes' },
  { type: 'table', label: 'Data Table', category: 'Interactive', icon: Table, description: 'Structured comparison and metrics table' },

  // Marketing
  { type: 'contentcard', label: 'Content Card', category: 'Marketing', icon: Box, description: 'Feature highlight card with badge and copy' },
  { type: 'pricingcard', label: 'Pricing Card', category: 'Marketing', icon: DollarSign, description: 'Pricing tier with feature list and CTA' },
  { type: 'testimonial', label: 'Testimonial', category: 'Marketing', icon: MessageSquare, description: 'Customer quote and review box' },
  { type: 'teammember', label: 'Team Member', category: 'Marketing', icon: User, description: 'Member avatar with name and role' },
  { type: 'marquee', label: 'Marquee', category: 'Marketing', icon: Repeat, description: 'Infinitely scrolling announcement strip' },
  { type: 'processsteps', label: 'Process Steps', category: 'Marketing', icon: Layers, description: 'How-it-works steps with icons and numbers' },
  { type: 'skillbar', label: 'Skill Bars', category: 'Marketing', icon: BarChart2, description: 'Animated skill / progress bars with percentages' },
  { type: 'countdown', label: 'Countdown Timer', category: 'Marketing', icon: Clock, description: 'Live countdown to a launch or offer end date' },
  { type: 'socialicons', label: 'Social Icons', category: 'Marketing', icon: Share2, description: 'Row of circular social profile links' },
  { type: 'rating', label: 'Rating', category: 'Marketing', icon: Star, description: 'Star rating with review count text' },
  { type: 'timeline', label: 'Timeline', category: 'Marketing', icon: History, description: 'Vertical timeline of dated milestones' },
  { type: 'innerrow', label: 'Inner Row (2 Cols)', category: 'Structure', icon: Columns, description: 'Nested columns inside this column' },
  { type: 'navigation', label: 'Navigation Bar', category: 'Structure', icon: Layout, description: 'Header menu links with CTA button' },
  { type: 'spacer', label: 'Spacer', category: 'Structure', icon: Sliders, description: 'Adjustable blank vertical space' }
];

export default function ElementPickerModal({
  isOpen,
  onClose,
  onSelectElement,
  columnTitle
}: ElementPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedCategory('All');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['All', 'Basic', 'Media', 'Interactive', 'Marketing', 'Structure'];

  const filteredWidgets = ALL_PICKER_WIDGETS.filter((w) => {
    const matchesSearch =
      w.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || w.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-scale-in"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>Add Element to Column</span>
              {columnTitle && (
                <span className="text-xs font-mono font-medium text-slate-400">
                  ({columnTitle})
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose an element to insert into this column
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Category Filters */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search elements (e.g. heading, image, form, pricing)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-medium text-slate-800 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="p-4 overflow-y-auto flex-1 min-h-[300px] nextforge-scrollbar">
          {filteredWidgets.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Box className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">No elements match "{searchTerm}"</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredWidgets.map((item) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={item.type + item.label}
                    onClick={() => {
                      onSelectElement(item.type);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group text-left flex flex-col justify-between h-[84px]"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight mt-1">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
