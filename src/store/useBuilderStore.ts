// @ts-nocheck
import { create } from 'zustand';
import { ElementModel, SectionModel, ColumnModel, ProjectFileJSON, PageModel, ElementStyles, WidgetType } from '../types/builder';
import { saveProjectToStorage, loadProjectFromStorage, getSyncStoredProject, saveSite } from '../utils/storage';

const Vi = {
  id: 'sec-nav',
  name: 'Navigation Header',
  customId: 'navbar',
  isDynamic: true,
  globalId: 'global-nav',
  styles: { bgColor: '#ffffff', paddingTop: '20px', paddingBottom: '20px' },
  columns: [
    {
      id: 'col-nav-1',
      widthPercentage: 100,
      verticalAlign: 'center',
      elements: [
        {
          id: 'el-nav-content',
          type: 'navigation',
          label: 'Navigation',
          styles: { color: '#1e293b', navLayout: 'standard', navStyle: 'clean' },
          content: {
            logoText: 'NextForge',
            links: ['Home', 'About', 'Pricing'],
            ctaText: 'Get Started Free',
            ctaUrl: '/pricing'
          }
        }
      ]
    }
  ]
};

const jh = [
  Vi,
  {
    id: 'sec-hero',
    name: 'Hero Banner',
    customId: 'hero',
    styles: { bgColor: '#0f172a', paddingTop: '60px', paddingBottom: '60px' },
    columns: [
      {
        id: 'col-hero-1',
        widthPercentage: 55,
        verticalAlign: 'center',
        elements: [
          {
            id: 'el-h1',
            type: 'heading',
            label: 'Heading',
            styles: { color: '#ffffff', fontSize: '42px', fontWeight: '800' },
            content: { text: 'A visual builder made for modern Next.js sites.' }
          },
          {
            id: 'el-text1',
            type: 'text',
            label: 'Text editor',
            styles: { color: '#94a3b8', fontSize: '15px', marginTop: '16px' },
            content: { text: 'Custom layouts, place elements exactly where you want them, then export or publish.' }
          },
          {
            id: 'el-btn1',
            type: 'button',
            label: 'Button',
            styles: { buttonPreset: 'solid', color: '#ffffff', bgColor: '#6366f1', marginTop: '24px' },
            content: { text: 'Start creating', iconName: 'ArrowRight', url: '#features' }
          }
        ]
      },
      {
        id: 'col-hero-2',
        widthPercentage: 45,
        verticalAlign: 'center',
        elements: [
          {
            id: 'el-img1',
            type: 'image',
            label: 'Image',
            styles: { borderRadius: '16px', shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' },
            content: {
              url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
              alt: 'NextForge Workspace'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'sec-features',
    name: 'Features Grid',
    customId: 'features',
    styles: { bgColor: '#ffffff', paddingTop: '60px', paddingBottom: '60px' },
    columns: [
      {
        id: 'col-f1',
        widthPercentage: 33.33,
        elements: [
          {
            id: 'el-card1',
            type: 'contentcard',
            label: 'Content card',
            styles: { bgColor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '16px' },
            content: { title: '100/100 PageSpeed', description: 'Zero DOM depth bloat, pure Next.js speed.' }
          }
        ]
      },
      {
        id: 'col-f2',
        widthPercentage: 33.33,
        elements: [
          {
            id: 'el-card2',
            type: 'contentcard',
            label: 'Content card',
            styles: { bgColor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '16px' },
            content: { title: '1-Click ZIP Export', description: 'Complete source code ownership with zero lock-in.' }
          }
        ]
      },
      {
        id: 'col-f3',
        widthPercentage: 33.34,
        elements: [
          {
            id: 'el-card3',
            type: 'contentcard',
            label: 'Content card',
            styles: { bgColor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '16px' },
            content: { title: 'Built-in CMS & Forms', description: 'Native collections, data tables, and form leads.' }
          }
        ]
      }
    ]
  }
];

const Bm = [
  { ...Vi, id: 'sec-nav-about' },
  {
    id: 'sec-about-hero',
    name: 'About Hero',
    customId: 'about-hero',
    styles: { bgColor: '#1e1b4b', paddingTop: '70px', paddingBottom: '70px' },
    columns: [
      {
        id: 'col-about-h1',
        widthPercentage: 100,
        verticalAlign: 'center',
        elements: [
          {
            id: 'el-about-heading',
            type: 'heading',
            label: 'Heading',
            styles: { color: '#ffffff', fontSize: '40px', fontWeight: '800', textAlign: 'center' },
            content: { text: 'Empowering Creators to Build The Modern Web' }
          },
          {
            id: 'el-about-sub',
            type: 'text',
            label: 'Text editor',
            styles: { color: '#c7d2fe', fontSize: '16px', textAlign: 'center', marginTop: '16px' },
            content: { text: 'NextForge unites visual canvas freedom with clean, un-opinionated production code.' }
          }
        ]
      }
    ]
  },
  {
    id: 'sec-about-story',
    name: 'Our Mission & Story',
    customId: 'story',
    styles: { bgColor: '#ffffff', paddingTop: '60px', paddingBottom: '60px' },
    columns: [
      {
        id: 'col-story-1',
        widthPercentage: 50,
        elements: [
          {
            id: 'el-story-h2',
            type: 'heading',
            label: 'Heading',
            styles: { color: '#0f172a', fontSize: '28px', fontWeight: '700' },
            content: { text: 'Crafted for designers and developers alike' }
          },
          {
            id: 'el-story-p',
            type: 'text',
            label: 'Text',
            styles: { color: '#64748b', fontSize: '15px', marginTop: '14px' },
            content: { text: 'We believe creating websites should be as intuitive as drawing on a canvas, without sacrificing speed, security, or maintainability. Every page you build exports to pure Next.js 14.' }
          }
        ]
      },
      {
        id: 'col-story-2',
        widthPercentage: 50,
        elements: [
          {
            id: 'el-story-img',
            type: 'image',
            label: 'Image',
            styles: { borderRadius: '16px', shadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
            content: {
              url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
              alt: 'NextForge Team'
            }
          }
        ]
      }
    ]
  }
];

const Dm = [
  { ...Vi, id: 'sec-nav-pricing' },
  {
    id: 'sec-pricing-hero',
    name: 'Pricing Header',
    customId: 'pricing-plans',
    styles: { bgColor: '#0f172a', paddingTop: '60px', paddingBottom: '40px' },
    columns: [
      {
        id: 'col-pricing-h1',
        widthPercentage: 100,
        elements: [
          {
            id: 'el-price-title',
            type: 'heading',
            label: 'Heading',
            styles: { color: '#ffffff', fontSize: '38px', fontWeight: '800', textAlign: 'center' },
            content: { text: 'Simple, Transparent Pricing' }
          },
          {
            id: 'el-price-sub',
            type: 'text',
            label: 'Text',
            styles: { color: '#94a3b8', fontSize: '16px', textAlign: 'center', marginTop: '12px' },
            content: { text: 'Choose the plan that fits your growth. Upgrade or downgrade anytime.' }
          }
        ]
      }
    ]
  },
  {
    id: 'sec-pricing-cards',
    name: 'Pricing Tiers',
    customId: 'pricing-table',
    styles: { bgColor: '#f8fafc', paddingTop: '60px', paddingBottom: '80px' },
    columns: [
      {
        id: 'col-price-1',
        widthPercentage: 33.33,
        elements: [
          {
            id: 'el-card-starter',
            type: 'pricingcard',
            label: 'Starter Plan',
            styles: { bgColor: '#ffffff', borderRadius: '16px', borderColor: '#e2e8f0' },
            content: {
              title: 'Starter',
              price: '$0',
              period: '/month',
              description: 'Great for personal projects and prototypes.',
              features: ['Up to 3 active projects', 'Standard responsive canvas', 'Community support'],
              buttonText: 'Get Started Free'
            }
          }
        ]
      },
      {
        id: 'col-price-2',
        widthPercentage: 33.33,
        elements: [
          {
            id: 'el-card-pro',
            type: 'pricingcard',
            label: 'Pro Plan',
            styles: { bgColor: '#ffffff', borderRadius: '16px', borderColor: '#6366f1', shadow: '0 20px 25px -5px rgba(99, 102, 241, 0.2)' },
            content: {
              title: 'Professional',
              price: '$29',
              period: '/month',
              description: 'For growing businesses, freelance builders, and teams.',
              features: ['Unlimited projects', 'ZIP code export with Next.js', 'Dynamic global components', 'Priority email support'],
              buttonText: 'Start 14-day Trial',
              popular: true
            }
          }
        ]
      },
      {
        id: 'col-price-3',
        widthPercentage: 33.34,
        elements: [
          {
            id: 'el-card-enterprise',
            type: 'pricingcard',
            label: 'Enterprise Plan',
            styles: { bgColor: '#ffffff', borderRadius: '16px', borderColor: '#e2e8f0' },
            content: {
              title: 'Enterprise',
              price: '$99',
              period: '/month',
              description: 'Custom domains, dedicated SLA, and white-labeling.',
              features: ['Custom domain mapping', 'Role-based access control', '99.99% uptime SLA', 'Dedicated account manager'],
              buttonText: 'Contact Sales'
            }
          }
        ]
      }
    ]
  }
];

const Lm = [
  { id: 'page-home', name: 'Home', slug: '/', sections: jh },
  { id: 'page-about', name: 'About', slug: '/about', sections: Bm },
  { id: 'page-pricing', name: 'Pricing', slug: '/pricing', sections: Dm }
];

const Mm = { 'global-nav': Vi };

function Du(e) {
  const t = Date.now() + '-' + Math.random().toString(36).substr(2, 4);
  const s = JSON.parse(JSON.stringify(e));
  s.id = 'sec-' + t;
  s.name = s.name.replace(/\s*\(Copy\)$/, '') + ' (Copy)';
  if (s.customId) s.customId = s.customId + '-copy';
  s.columns = (s.columns || []).map((r, o) => ({
    ...r,
    id: `col-${t}-${o + 1}`,
    elements: (r.elements || []).map((l, i) => ({ ...l, id: `el-${t}-${o + 1}-${i + 1}` }))
  }));
  if (s.rows) {
    s.rows = s.rows.map((r, o) => ({
      ...r,
      id: `row-${t}-${o + 1}`,
      columns: (r.columns || []).map((l, i) => ({
        ...l,
        id: `col-${t}-r${o + 1}-${i + 1}`,
        elements: (l.elements || []).map((a, d) => ({ ...a, id: `el-${t}-r${o + 1}-${i + 1}-${d + 1}` }))
      }))
    }));
  }
  return s;
}

export function Rl(e = 'container') {
  const t = Date.now() + '-' + Math.random().toString(36).substr(2, 4);
  switch (e) {
    case 'two-equal':
    case 'equal-2':
      return [
        { id: `col-${t}-1`, widthPercentage: 50, elements: [] },
        { id: `col-${t}-2`, widthPercentage: 50, elements: [] }
      ];
    case 'three-equal':
    case 'equal-3':
      return [
        { id: `col-${t}-1`, widthPercentage: 33.33, elements: [] },
        { id: `col-${t}-2`, widthPercentage: 33.33, elements: [] },
        { id: `col-${t}-3`, widthPercentage: 33.34, elements: [] }
      ];
    case 'four-equal':
      return [
        { id: `col-${t}-1`, widthPercentage: 25, elements: [] },
        { id: `col-${t}-2`, widthPercentage: 25, elements: [] },
        { id: `col-${t}-3`, widthPercentage: 25, elements: [] },
        { id: `col-${t}-4`, widthPercentage: 25, elements: [] }
      ];
    case 'sidebar-left':
      return [
        { id: `col-${t}-1`, widthPercentage: 30, elements: [] },
        { id: `col-${t}-2`, widthPercentage: 70, elements: [] }
      ];
    case 'sidebar-right':
      return [
        { id: `col-${t}-1`, widthPercentage: 70, elements: [] },
        { id: `col-${t}-2`, widthPercentage: 30, elements: [] }
      ];
    case 'wide-left':
      return [
        { id: `col-${t}-1`, widthPercentage: 65, elements: [] },
        { id: `col-${t}-2`, widthPercentage: 35, elements: [] }
      ];
    case 'wide-right':
      return [
        { id: `col-${t}-1`, widthPercentage: 35, elements: [] },
        { id: `col-${t}-2`, widthPercentage: 65, elements: [] }
      ];
    case 'center-focus':
      return [
        { id: `col-${t}-1`, widthPercentage: 25, elements: [] },
        { id: `col-${t}-2`, widthPercentage: 50, elements: [] },
        { id: `col-${t}-3`, widthPercentage: 25, elements: [] }
      ];
    case 'wide-center':
      return [
        { id: `col-${t}-1`, widthPercentage: 20, elements: [] },
        { id: `col-${t}-2`, widthPercentage: 60, elements: [] },
        { id: `col-${t}-3`, widthPercentage: 20, elements: [] }
      ];
    case 'five-columns':
      return [
        { id: `col-${t}-1`, widthPercentage: 20, elements: [] },
        { id: `col-${t}-2`, widthPercentage: 20, elements: [] },
        { id: `col-${t}-3`, widthPercentage: 20, elements: [] },
        { id: `col-${t}-4`, widthPercentage: 20, elements: [] },
        { id: `col-${t}-5`, widthPercentage: 20, elements: [] }
      ];
    case 'six-columns':
      return [
        { id: `col-${t}-1`, widthPercentage: 16.66, elements: [] },
        { id: `col-${t}-2`, widthPercentage: 16.66, elements: [] },
        { id: `col-${t}-3`, widthPercentage: 16.66, elements: [] },
        { id: `col-${t}-4`, widthPercentage: 16.66, elements: [] },
        { id: `col-${t}-5`, widthPercentage: 16.66, elements: [] },
        { id: `col-${t}-6`, widthPercentage: 16.7, elements: [] }
      ];
    case 'container':
    default:
      return [{ id: `col-${t}-1`, widthPercentage: 100, elements: [] }];
  }
}

export function createDefaultElement(d) {
  const l = Date.now();
  switch (d) {
    case 'heading':
      return {
        id: 'el-' + l,
        type: 'heading',
        label: 'Heading',
        content: { text: 'New Heading', tag: 'h2' },
        styles: { fontSize: '32px', fontWeight: '800', color: '#000000' }
      };
    case 'text':
      return {
        id: 'el-' + l,
        type: 'text',
        label: 'Text Editor',
        content: { text: 'Start typing your paragraph text here...', html: '<p>Start typing your paragraph text here...</p>' },
        styles: { fontSize: '15px' }
      };
    case 'button':
      return {
        id: 'el-' + l,
        type: 'button',
        label: 'Button',
        content: { text: 'Click Here' },
        styles: { bgColor: '#6366f1', color: '#ffffff', buttonPreset: 'solid', borderRadius: '12px' }
      };
    case 'image':
      return {
        id: 'el-' + l,
        type: 'image',
        label: 'Image',
        content: { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', alt: 'Showcase Image' },
        styles: { borderRadius: '16px' }
      };
    case 'imagebox':
      return {
        id: 'el-' + l,
        type: 'imagebox',
        label: 'Image Box',
        content: {
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
          title: 'Feature Spotlight',
          description: 'Describe your visual highlight or workflow here.',
          items: [
            {
              id: 'item-1',
              url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
              title: 'Feature Spotlight',
              description: 'Describe your visual highlight or workflow here.'
            }
          ]
        },
        styles: { bgColor: '#0f172a', color: '#ffffff', borderRadius: '16px' }
      };
    case 'icon':
      return {
        id: 'el-' + l,
        type: 'icon',
        label: 'Icon',
        content: { iconName: 'star', text: 'Special Feature', subtext: 'Ultra-fast Next.js component' },
        styles: { color: '#6366f1', fontSize: '15px' }
      };
    case 'iconbox':
      return {
        id: 'el-' + l,
        type: 'iconbox',
        label: 'Icon Box',
        content: {
          iconName: 'shield',
          title: 'Enterprise Security',
          description: 'Guaranteed safety and end-to-end performance.',
          iconAnimation: 'pulse',
          iconAnimationTrigger: 'always',
          iconAnimationSpeed: 'normal'
        },
        styles: {
          bgColor: '#f8fafc',
          color: '#6366f1',
          borderRadius: '16px',
          iconAnimation: 'pulse',
          iconAnimationTrigger: 'always',
          iconAnimationSpeed: 'normal'
        }
      };
    case 'form':
      return {
        id: 'el-' + l,
        type: 'form',
        label: 'Form',
        content: {
          theme: 'dark',
          title: 'Contact Us',
          buttonText: 'Send Message',
          buttonWidth: 'full',
          fields: [
            { id: 'f-1', label: 'Full Name', type: 'text', placeholder: 'Full Name...', required: true },
            { id: 'f-2', label: 'Email Address', type: 'email', placeholder: 'Email Address...', required: true },
            { id: 'f-3', label: 'Message', type: 'textarea', placeholder: 'Your message or inquiry...', required: false }
          ]
        },
        styles: {
          bgColor: '#0f172a',
          color: '#ffffff',
          borderColor: '#1e293b',
          borderRadius: '16px',
          inputBgColor: '#090d16',
          inputTextColor: '#f8fafc',
          inputBorderColor: '#334155',
          inputBorderRadius: '10px',
          buttonBgColor: '#6366f1',
          buttonTextColor: '#ffffff'
        }
      };
    case 'contentcard':
      return {
        id: 'el-' + l,
        type: 'contentcard',
        label: 'Content Card',
        content: { badge: 'FEATURE', title: 'Next.js 15+ Native', description: 'Zero DOM depth bloat, maximum performance.' },
        styles: { bgColor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '16px' }
      };
    case 'pricingcard':
      return {
        id: 'el-' + l,
        type: 'pricingcard',
        label: 'Pricing Card',
        content: {
          planName: 'Pro Tier',
          price: '$29',
          interval: '/ month',
          features: ['Unlimited dynamic pages', '1-Click ZIP Next.js code export', 'Cloudflare D1 & SQLite Ready']
        },
        styles: { bgColor: '#0f172a', color: '#ffffff', borderRadius: '16px' }
      };
    case 'accordion':
      return {
        id: 'el-' + l,
        type: 'accordion',
        label: 'Accordion',
        content: {
          items: [
            { id: 'acc-1', q: 'Why choose NextForge visual builder?', a: 'Zero DOM bloat and pure Next.js 15+ React code generation.' },
            { id: 'acc-2', q: 'How does clean Next.js export work?', a: 'Download a complete ZIP with TypeScript, Tailwind CSS, and Drizzle/Cloudflare D1 support.' },
            { id: 'acc-3', q: 'Can I use custom React components?', a: 'Yes! NextForge is designed for extensibility with modern Next.js App Router.' }
          ]
        },
        styles: { bgColor: '#0f172a', color: '#ffffff', borderColor: '#1e293b', borderRadius: '14px' }
      };
    case 'gallery':
      return {
        id: 'el-' + l,
        type: 'gallery',
        label: 'Gallery',
        content: {
          images: [
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'
          ],
          columns: 3,
          gap: 12
        },
        styles: { borderRadius: '12px' }
      };
    case 'beforeafter':
      return {
        id: 'el-' + l,
        type: 'beforeafter',
        label: 'Before / After',
        content: {
          beforeImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
          afterImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          beforeLabel: 'Before',
          afterLabel: 'After',
          sliderPosition: 50,
          orientation: 'horizontal',
          showLabels: true,
          imageHeight: '400px',
          objectFit: 'cover',
          handleColor: '#6366f1'
        },
        styles: { borderRadius: '16px', shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }
      };
    case 'carousel':
    case 'mediacarousel':
      return {
        id: 'el-' + l,
        type: d,
        label: d === 'mediacarousel' ? 'Media Carousel' : 'Image Carousel',
        content: {
          displayMode: 'slider',
          showArrows: true,
          showDots: true,
          showSlideNumbers: true,
          autoSlide: true,
          slideInterval: 4,
          slideHeight: '340px',
          objectFit: 'cover',
          items: [
            {
              id: 'slide-1',
              url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
              title: 'Next-Gen Performance',
              caption: 'Engineered for sub-millisecond edge rendering and zero runtime overhead.'
            },
            {
              id: 'slide-2',
              url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
              title: 'Visual Workflow Builder',
              caption: 'Assemble layouts visually with live responsive inspection.'
            },
            {
              id: 'slide-3',
              url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
              title: 'Production React Code',
              caption: 'Export pure Next.js 15+ App Router code with zero proprietary lock-in.'
            }
          ]
        },
        styles: {
          borderRadius: '16px',
          borderColor: '#e2e8f0',
          borderWidth: '1px',
          borderStyle: 'solid',
          shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '700',
          descColor: '#cbd5e1',
          descFontSize: '13px',
          descFontWeight: '400',
          textAlign: 'left'
        }
      };
    case 'cta':
      return {
        id: 'el-' + l,
        type: 'cta',
        label: 'Call to Action',
        content: {
          headline: 'Ready to build high-performance Next.js apps?',
          subheadline: 'Visually assemble components, inspect properties, and export pure production code in seconds.',
          buttonText: 'Get Started Now',
          buttonUrl: '#'
        },
        styles: { bgColor: '#4f46e5', color: '#ffffff', borderRadius: '16px', paddingTop: '32px', paddingBottom: '32px' }
      };
    case 'testimonial':
      return {
        id: 'el-' + l,
        type: 'testimonial',
        label: 'Testimonial',
        content: {
          quote: 'NextForge cuts our front-end delivery cycle by 80%. Exporting clean Next.js 15 code with zero lock-in is a game changer.',
          author: 'Sarah Jenkins',
          role: 'CTO at TechFlow',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
          rating: 5
        },
        styles: { bgColor: '#f8fafc', color: '#0f172a', borderRadius: '16px' }
      };
    case 'teammember':
      return {
        id: 'el-' + l,
        type: 'teammember',
        label: 'Team Member',
        content: {
          name: 'Alex Rivera',
          role: 'Head of Engineering',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          bio: 'Former Next.js core contributor, web performance researcher and open-source author.'
        },
        styles: { bgColor: '#f8fafc', borderRadius: '16px' }
      };
    case 'table':
      return {
        id: 'el-' + l,
        type: 'table',
        label: 'Data Table',
        content: {
          headers: ['Feature', 'NextForge', 'Traditional Builders'],
          rows: [
            ['PageSpeed Score', '100 / 100', '65 / 100'],
            ['Code Quality', 'Clean React 19 / Next.js', 'Vendor Bloat'],
            ['Data Ownership', '100% (1-Click ZIP)', 'Proprietary Lock-in']
          ]
        },
        styles: { bgColor: '#0f172a', color: '#ffffff', borderRadius: '12px' }
      };
    case 'tabs':
      return {
        id: 'el-' + l,
        type: 'tabs',
        label: 'Tabs',
        content: {
          tabs: [
            { label: 'Architecture', content: 'Edge runtime with automatic static generation and server-side streaming.' },
            { label: 'Database', content: 'Native SQLite local support with instant Cloudflare D1 edge replication.' },
            { label: 'Export', content: 'Generate complete, clean Next.js 15+ repositories with one click.' }
          ]
        },
        styles: { color: '#ffffff' }
      };
    case 'badge':
      return {
        id: 'el-' + l,
        type: 'badge',
        label: 'Badge',
        content: { text: 'Next.js 15+ Native', variant: 'pill' },
        styles: { bgColor: '#ede9fe', color: '#6366f1' }
      };
    case 'iconlist':
      return {
        id: 'el-' + l,
        type: 'iconlist',
        label: 'Icon List',
        content: {
          items: [
            { id: 'il-1', iconName: 'check', text: 'Unlimited dynamic pages' },
            { id: 'il-2', iconName: 'check', text: '1-Click ZIP Next.js code export' },
            { id: 'il-3', iconName: 'check', text: 'Zero vendor lock-in' }
          ]
        },
        styles: { color: '#1e293b', iconColor: '#6366f1', fontSize: '14px' }
      };
    case 'counter':
      return {
        id: 'el-' + l,
        type: 'counter',
        label: 'Counter',
        content: { value: '99.9', suffix: '%', label: 'Uptime SLA' },
        styles: { color: '#6366f1', fontSize: '36px' }
      };
    case 'alert':
      return {
        id: 'el-' + l,
        type: 'alert',
        label: 'Alert',
        content: { alertType: 'info', title: 'Edge Deployment Active', message: 'Your latest changes are propagated across 300+ edge locations.' },
        styles: { borderRadius: '12px' }
      };
    case 'divider':
      return {
        id: 'el-' + l,
        type: 'divider',
        label: 'Divider',
        content: { style: 'solid', thickness: 1 },
        styles: { borderColor: '#e2e8f0', marginTop: '16px', marginBottom: '16px' }
      };
    case 'spacer':
      return {
        id: 'el-' + l,
        type: 'spacer',
        label: 'Spacer',
        content: { height: 40 },
        styles: { height: '40px' }
      };
    case 'map':
      return {
        id: 'el-' + l,
        type: 'map',
        label: 'Map',
        content: { address: 'San Francisco, CA', zoom: 12, height: 220 },
        styles: { borderRadius: '16px' }
      };
    case 'contactdetails':
      return {
        id: 'el-' + l,
        type: 'contactdetails',
        label: 'Contact Details',
        content: { email: 'hello@nextforge.dev', phone: '+1 (555) 234-5678', address: '77 Innovation Way, CA', hours: 'Mon - Fri: 9am - 6pm' },
        styles: { bgColor: '#f8fafc', borderRadius: '16px' }
      };
    case 'logocloud':
      return {
        id: 'el-' + l,
        type: 'logocloud',
        label: 'Logo Cloud',
        content: { title: 'Empowering Modern Engineering Teams', logos: ['Vercel', 'Cloudflare', 'Supabase', 'Stripe', 'Tailwind'] },
        styles: { color: '#64748b' }
      };
    case 'flipbox':
      return {
        id: 'el-' + l,
        type: 'flipbox',
        label: 'Flip Box',
        content: { frontTitle: 'Hover For Source', frontIcon: 'zap', backTitle: 'Next.js Code Ready', backDesc: 'Instant export with zero vendor locks.' },
        styles: { bgColor: '#6366f1', color: '#ffffff', borderRadius: '16px' }
      };
    case 'innerrow':
      return {
        id: 'el-innerrow-' + l,
        type: 'innerrow',
        label: 'Inner Row',
        content: {
          preset: 'two-equal',
          columns: [
            { id: 'inner-col-' + l + '-1', widthPercentage: 50, elements: [] },
            { id: 'inner-col-' + l + '-2', widthPercentage: 50, elements: [] }
          ],
          gap: '12px',
          alignItems: 'stretch'
        },
        styles: {
          borderRadius: '12px'
        }
      };
    case 'navigation':
      return {
        id: 'el-' + l,
        type: 'navigation',
        label: 'Navigation Bar',
        content: { logoText: 'NextForge', links: ['Features', 'Pricing', 'Docs', 'About'], ctaText: 'Get Started Free', ctaUrl: '#' },
        styles: { color: '#1e293b', navLayout: 'standard', navStyle: 'clean' }
      };
    case 'video':
      return {
        id: 'el-' + l,
        type: 'video',
        label: 'Video Player',
        content: {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoSource: 'url',
          autoplay: false,
          controls: true,
          loop: false,
          muted: false,
          buttonless: false,
          aspectRatio: '16/9'
        },
        styles: {
          borderRadius: '16px',
          borderColor: '#1e293b',
          borderWidth: '0px',
          borderStyle: 'solid',
          shadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          overlayType: 'none',
          overlayColor: '#000000',
          overlayOpacity: 40,
          gradientColor1: '#4f46e5',
          gradientColor2: '#06b6d4',
          gradientColor3: '#ec4899',
          gradientAngle: 135,
          maskShape: 'none'
        }
      };
    case 'marquee':
      return {
        id: 'el-' + l,
        type: 'marquee',
        label: 'Marquee',
        content: {
          mode: 'text',
          items: ['Free shipping over $50', '30-day easy returns', 'New drops every Friday', 'Members save 20%'],
          separator: '✦',
          logos: [
            { id: 'logo-1', name: 'Brand 1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80', svg: '', link: '' },
            { id: 'logo-2', name: 'Brand 2', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80', svg: '', link: '' },
            { id: 'logo-3', name: 'Brand 3', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80', svg: '', link: '' }
          ],
          logoWidth: '120px',
          logoHeight: '40px',
          autoHeight: true,
          direction: 'left',
          speed: 22,
          pauseOnHover: true,
          gap: 32,
          effect: 'none'
        },
        styles: { bgColor: '#0f172a', color: '#ffffff', fontSize: '14px', fontWeight: '700', borderRadius: '999px' }
      };
    case 'processsteps':
      return {
        id: 'el-' + l,
        type: 'processsteps',
        label: 'Process Steps',
        content: {
          steps: [
            { iconName: 'search', title: 'Discover', description: 'Tell us your goals and we map the fastest route to get there.' },
            { iconName: 'sliders', title: 'Design & Build', description: 'We design and build your solution with weekly progress check-ins.' },
            { iconName: 'rocket', title: 'Launch & Grow', description: 'Go live with confidence, then measure, learn and keep improving.' }
          ]
        },
        styles: { bgColor: '#f8fafc', color: '#0f172a', iconColor: '#6366f1', iconBgColor: '#eef2ff', borderRadius: '16px' }
      };
    case 'skillbar':
      return {
        id: 'el-' + l,
        type: 'skillbar',
        label: 'Skill Bars',
        content: {
          bars: [
            { label: 'Design', percent: 92 },
            { label: 'Development', percent: 88 },
            { label: 'Marketing', percent: 76 }
          ]
        },
        styles: { bgColor: '#6366f1', color: '#0f172a', fontSize: '13px' }
      };
    case 'countdown':
      return {
        id: 'el-' + l,
        type: 'countdown',
        label: 'Countdown Timer',
        content: {
          targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          finishedText: 'The offer has ended',
          labels: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' }
        },
        styles: { bgColor: '#0f172a', color: '#ffffff', iconColor: '#6366f1', borderRadius: '16px' }
      };
    case 'socialicons':
      return {
        id: 'el-' + l,
        type: 'socialicons',
        label: 'Social Icons',
        content: {
          links: [
            { network: 'instagram', url: 'https://instagram.com/' },
            { network: 'youtube', url: 'https://youtube.com/' },
            { network: 'x', url: 'https://x.com/' },
            { network: 'github', url: 'https://github.com/' },
            { network: 'website', url: 'https://example.com/' }
          ]
        },
        styles: { iconColor: '#ffffff', iconBgColor: '#6366f1', color: '#0f172a' }
      };
    case 'rating':
      return {
        id: 'el-' + l,
        type: 'rating',
        label: 'Rating',
        content: { value: 5, count: '5.0 · 212 reviews' },
        styles: { color: '#0f172a', iconColor: '#f59e0b', fontSize: '14px' }
      };
    case 'timeline':
      return {
        id: 'el-' + l,
        type: 'timeline',
        label: 'Timeline',
        content: {
          items: [
            { date: 'Jan 2024', title: 'Project kickoff', description: 'We aligned on goals, scope and the roadmap for the first release.' },
            { date: 'Jun 2024', title: 'Beta launch', description: 'Early customers joined the beta and shaped the product with feedback.' },
            { date: 'Jan 2025', title: 'Public release', description: 'The full product launched publicly and growth has compounded since.' }
          ]
        },
        styles: { color: '#0f172a', iconColor: '#6366f1', bgColor: '#ffffff', borderRadius: '16px' }
      };
    case 'typewriterheadline':
      return {
        id: 'el-' + l,
        type: 'typewriterheadline',
        label: 'Animated Heading',
        content: {
          prefixText: 'We deliver',
          rotatingWords: ['CLEAN', 'FAST', 'AFFORDABLE'],
          suffixText: 'solutions.',
          typeSpeed: 100,
          deleteSpeed: 50,
          pauseTime: 2000,
          showCursor: true,
          cursorChar: '|',
          cursorColor: '#6366f1',
          rotatingWordColor: '#6366f1',
          rotatingWordBold: true,
          rotatingWordUppercase: true
        },
        styles: {
          fontSize: '36px',
          fontWeight: '700',
          color: '#0f172a',
          textAlign: 'center'
        }
      };
    case 'lottie':
      return {
        id: 'el-' + l,
        type: 'lottie',
        label: 'Lottie Animation',
        content: {
          url: 'https://assets5.lottiefiles.com/packages/lf20_myejioos.json',
          autoplay: true,
          loop: true,
          speed: 1,
          hoverPlay: false,
          showControls: false,
          presetName: 'Rocket Launch'
        },
        styles: {
          width: '280px',
          height: '280px',
          align: 'center',
          borderRadius: '16px'
        }
      };
    default:
      return {
        id: 'el-' + l,
        type: d,
        label: d.charAt(0).toUpperCase() + d.slice(1),
        content: { text: `New ${d} element` },
        styles: { color: '#1e293b' }
      };
  }
}

// ---------------------------------------------------------------------------
// Global site width ('full' | 'boxed' | '80') — pure helpers.
// Mapping onto the existing per-section width model:
//   full  -> styles.widthType 'screen', no customWidth
//   boxed -> styles.widthType 'boxed',  no customWidth (1180px cap in render/export)
//   '80'  -> styles.widthType 'custom', customWidth '80%'
// All other style keys are preserved.
// ---------------------------------------------------------------------------
export function normalizeSiteWidth(mode) {
  return mode === 'full' || mode === '80' || mode === 'custom' || mode === 'boxed' ? mode : 'boxed';
}

export function siteWidthToSectionStyles(mode, customWidth?: string) {
  const normalized = normalizeSiteWidth(mode);
  if (normalized === 'full') return { widthType: 'screen' };
  if (normalized === '80') return { widthType: 'custom', customWidth: '80%' };
  if (normalized === 'custom') {
    const raw = customWidth || '1200px';
    const formatted = raw.includes('%') || raw.includes('px') || raw.includes('vw') || raw.includes('rem') ? raw : `${raw}px`;
    return { widthType: 'custom', customWidth: formatted };
  }
  return { widthType: 'boxed' };
}

export function applySiteWidthToSectionStyles(styles, mode, customWidth?: string) {
  const next = { ...(styles || {}) };
  delete next.customWidth;
  return { ...next, ...siteWidthToSectionStyles(mode, customWidth) };
}

export function applySiteWidthToSections(sections, mode, customWidth?: string) {
  return (sections || []).map((sec) => ({
    ...sec,
    styles: applySiteWidthToSectionStyles(sec.styles, mode, customWidth)
  }));
}

const getInitialStoredProject = () => {
  const syncData = getSyncStoredProject();
  if (syncData) {
    if (Array.isArray(syncData.pages) && syncData.pages.length > 0) {
      const activeId = syncData.currentPageId || syncData.pages[0].id;
      const curPage = syncData.pages.find((p: any) => p.id === activeId) || syncData.pages[0];
      return {
        projectName: syncData.name || 'Untitled website',
        pages: syncData.pages,
        currentPageId: activeId,
        sections: curPage.sections || [],
        globalSections: syncData.globalSections || Mm,
        lastSavedAt: syncData.savedAt || null,
        siteId: syncData.id || null,
        siteWidth: normalizeSiteWidth(syncData.siteWidth),
        customSiteWidth: syncData.customSiteWidth || '1200px'
      };
    } else if (Array.isArray(syncData.sections) && syncData.sections.length > 0) {
      const homePage = { id: 'page-home', name: 'Home', slug: '/', sections: syncData.sections };
      return {
        projectName: syncData.name || 'Untitled website',
        pages: [homePage],
        currentPageId: 'page-home',
        sections: syncData.sections,
        globalSections: syncData.globalSections || Mm,
        lastSavedAt: syncData.savedAt || null,
        siteId: syncData.id || null,
        siteWidth: normalizeSiteWidth(syncData.siteWidth),
        customSiteWidth: syncData.customSiteWidth || '1200px'
      };
    }
  }

  return {
    projectName: 'Untitled website',
    pages: Lm,
    currentPageId: 'page-home',
    sections: jh,
    globalSections: Mm,
    lastSavedAt: null,
    siteId: null,
    siteWidth: 'boxed',
    customSiteWidth: '1200px'
  };
};

const initialProject = getInitialStoredProject();

export const useBuilderStore = create((set, get) => ({
  projectName: initialProject.projectName,
  pages: initialProject.pages,
  currentPageId: initialProject.currentPageId,
  sections: initialProject.sections,
  globalSections: initialProject.globalSections,
  lastSavedAt: initialProject.lastSavedAt,
  siteId: initialProject.siteId || null,
  siteWidth: normalizeSiteWidth(initialProject.siteWidth),
  customSiteWidth: initialProject.customSiteWidth || '1200px',
  autoSave: typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('nextforge_auto_save') !== null
    ? window.localStorage.getItem('nextforge_auto_save') === 'true'
    : true,
  theme: typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('nextforge_theme')
    ? (window.localStorage.getItem('nextforge_theme') as 'light' | 'dark')
    : 'light',
  setTheme: (theme: 'light' | 'dark') => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('nextforge_theme', theme);
      }
      if (typeof document !== 'undefined') {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (e) {}
    set({ theme });
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },
  autoSaveStatus: 'idle', // 'idle' | 'saving' | 'saved'
  setAutoSave: (enabled) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('nextforge_auto_save', String(enabled));
      }
    } catch (e) {}
    set({ autoSave: enabled });
  },
  setAutoSaveStatus: (status) => set({ autoSaveStatus: status }),
  initFromStorage: async () => {
    try {
      const stored = await loadProjectFromStorage();
      if (!stored) return;
      if (Array.isArray(stored.pages) && stored.pages.length > 0) {
        const activeId = stored.currentPageId || stored.pages[0].id;
        const curPage = stored.pages.find((p: any) => p.id === activeId) || stored.pages[0];
        set({
          projectName: stored.name || get().projectName,
          pages: stored.pages,
          currentPageId: activeId,
          sections: curPage.sections || get().sections,
          globalSections: stored.globalSections || get().globalSections,
          lastSavedAt: stored.savedAt || get().lastSavedAt,
          siteId: stored.id || get().siteId || null,
          siteWidth: normalizeSiteWidth(stored.siteWidth),
          customSiteWidth: stored.customSiteWidth || get().customSiteWidth || '1200px'
        });
      } else if (Array.isArray(stored.sections) && stored.sections.length > 0) {
        const homePage = { id: 'page-home', name: 'Home', slug: '/', sections: stored.sections };
        set({
          projectName: stored.name || get().projectName,
          pages: [homePage],
          currentPageId: 'page-home',
          sections: stored.sections,
          globalSections: stored.globalSections || get().globalSections,
          lastSavedAt: stored.savedAt || get().lastSavedAt,
          siteId: stored.id || get().siteId || null,
          siteWidth: normalizeSiteWidth(stored.siteWidth),
          customSiteWidth: stored.customSiteWidth || get().customSiteWidth || '1200px'
        });
      }
    } catch (err) {
      console.warn('[NextForge Store] initFromStorage failed:', err);
    }
  },
  loadSiteData: async (record) => {
    if (!record) return;
    try {
      // Make this record the active project so autosave/init stay consistent
      await saveProjectToStorage(record);
    } catch (err) {
      console.warn('[NextForge Store] loadSiteData active-storage write failed:', err);
    }
    if (Array.isArray(record.pages) && record.pages.length > 0) {
      const activeId = record.currentPageId || record.pages[0].id;
      const curPage = record.pages.find((p: any) => p.id === activeId) || record.pages[0];
      set({
        projectName: record.name || 'Untitled website',
        pages: record.pages,
        currentPageId: activeId,
        sections: curPage.sections || [],
        globalSections: record.globalSections || {},
        collections: record.collections || [],
        submissions: record.submissions || [],
        lastSavedAt: record.savedAt || null,
        siteId: record.id || null,
        siteWidth: normalizeSiteWidth(record.siteWidth),
        customSiteWidth: record.customSiteWidth || '1200px',
        selectedElementId: null,
        selectedSectionId: null,
        selectedColumnId: null,
        selectedRowId: null,
        selectedInnerColumnId: null,
        past: [],
        future: []
      });
    } else if (Array.isArray(record.sections)) {
      const homePage = { id: 'page-home', name: 'Home', slug: '/', sections: record.sections };
      set({
        projectName: record.name || 'Untitled website',
        pages: [homePage],
        currentPageId: 'page-home',
        sections: record.sections,
        globalSections: record.globalSections || {},
        collections: record.collections || [],
        submissions: record.submissions || [],
        lastSavedAt: record.savedAt || null,
        siteId: record.id || null,
        siteWidth: normalizeSiteWidth(record.siteWidth),
        customSiteWidth: record.customSiteWidth || '1200px',
        selectedElementId: null,
        selectedSectionId: null,
        selectedColumnId: null,
        selectedRowId: null,
        selectedInnerColumnId: null,
        past: [],
        future: []
      });
    }
  },
  startBlankSite: async (name) => {
    const siteId = `site-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const homePage = { id: 'page-home', name: 'Home', slug: '/', sections: [] };
    set({
      siteId,
      projectName: name || 'Untitled website',
      siteWidth: 'boxed',
      pages: [homePage],
      currentPageId: 'page-home',
      sections: [],
      globalSections: {},
      collections: [],
      submissions: [],
      selectedElementId: null,
      selectedSectionId: null,
      selectedColumnId: null,
      selectedRowId: null,
      selectedInnerColumnId: null,
      past: [],
      future: []
    });
    await get().saveProject(false);
  },
  clipboardElement: null,
  clipboardSection: null,
  selectedElementId: null,
  selectedSectionId: null,
  selectedColumnId: null,
  selectedRowId: null,
  selectedInnerColumnId: null,
  breakpoint: 'desktop',
  past: [],
  future: [],

  setProjectName: (s) => {
    set({ projectName: s });
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('nextforge_saved_project');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.name = s;
          localStorage.setItem('nextforge_saved_project', JSON.stringify(parsed));
        }
      }
    } catch (e) {}
  },
  setBreakpoint: (s) => set({ breakpoint: s }),

  // Global site width: bulk-apply to EVERY section of EVERY page (plus the
  // current-page `sections` mirror, which is the freshest copy for the
  // active page), then persist via saveProject() so the record keeps it.
  setSiteWidth: async (mode, customWidth) => {
    const normalized = normalizeSiteWidth(mode);
    const state = get();
    const cWidth = customWidth !== undefined ? customWidth : (state.customSiteWidth || '1200px');
    const mappedPages = (state.pages || []).map((p) => {
      const secs = p.id === state.currentPageId ? state.sections : p.sections;
      return { ...p, sections: applySiteWidthToSections(secs, normalized, cWidth) };
    });
    const currentPage = mappedPages.find((p) => p.id === state.currentPageId);
    const newSections = currentPage
      ? currentPage.sections
      : applySiteWidthToSections(state.sections, normalized, cWidth);
    set({ siteWidth: normalized, customSiteWidth: cWidth, pages: mappedPages, sections: newSections });
    // saveProject() reads get() (already-updated state) — no recursion:
    // it never calls setSiteWidth.
    await get().saveProject(false);
  },

  setSelectedElementId: (s) =>
    set({ selectedElementId: s, selectedInnerColumnId: null, selectedSectionId: null, selectedRowId: null, selectedColumnId: null }),
  setSelectedSectionId: (s) => {
    set({ selectedSectionId: s, selectedRowId: null, selectedColumnId: null, selectedElementId: null, selectedInnerColumnId: null });
  },
  setSelectedRowId: (s, r) => {
    set((o) => ({
      selectedSectionId: r !== undefined ? r : o.selectedSectionId,
      selectedRowId: s,
      selectedColumnId: null,
      selectedElementId: null,
      selectedInnerColumnId: null
    }));
  },
  setSelectedColumnId: (s, r, o) => {
    set((l) => ({
      selectedSectionId: o !== undefined ? o : l.selectedSectionId,
      selectedRowId: r !== undefined ? r : l.selectedRowId,
      selectedColumnId: s,
      selectedElementId: null,
      selectedInnerColumnId: null
    }));
  },
  setSelectedInnerColumnId: (innerRowId, innerColId) => {
    set({
      selectedElementId: innerRowId,
      selectedInnerColumnId: innerColId,
      selectedSectionId: null,
      selectedRowId: null,
      selectedColumnId: null
    });
  },

  updateSectionStyles: (s, r) => {
    get().saveHistory();
    set((o) => {
      const updated = o.sections.map((l) => (l.id === s ? { ...l, styles: { ...l.styles, ...r } } : l));
      const newPages = o.pages.map((p) => (p.id === o.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  updateRowStyles: (s, r, o) => {
    get().saveHistory();
    set((l) => {
      const updated = l.sections.map((i) => {
        if (i.id !== s) return i;
        const d = (i.rows && i.rows.length > 0 ? i.rows : [{ id: `${i.id}-row-0`, columns: i.columns }]).map((u) =>
          u.id === r ? { ...u, styles: { ...(u.styles || {}), ...o } } : u
        );
        return { ...i, rows: d };
      });
      const newPages = l.pages.map((p) => (p.id === l.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  updateColumnStyles: (s, r, o) => {
    get().saveHistory();
    set((l) => {
      const updated = l.sections.map((i) => {
        if (i.id !== s) return i;
        const d = (i.rows && i.rows.length > 0 ? i.rows : [{ id: `${i.id}-row-0`, columns: i.columns }]).map((g) => ({
          ...g,
          columns: g.columns.map((x) => (x.id === r ? { ...x, styles: { ...(x.styles || {}), ...o } } : x))
        }));
        const u = (i.columns || []).map((g) => (g.id === r ? { ...g, styles: { ...(g.styles || {}), ...o } } : g));
        return { ...i, rows: d, columns: u };
      });
      const newPages = l.pages.map((p) => (p.id === l.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  saveHistory: () => {
    const s = get().sections;
    set((r) => ({ past: [...r.past, JSON.parse(JSON.stringify(s))], future: [] }));
  },

  undo: () => {
    const { past: s, sections: r, future: o, pages, currentPageId } = get();
    if (s.length === 0) return;
    const l = s[s.length - 1];
    const i = s.slice(0, s.length - 1);
    const newPages = pages.map((p) => (p.id === currentPageId ? { ...p, sections: l } : p));
    set({ sections: l, pages: newPages, past: i, future: [JSON.parse(JSON.stringify(r)), ...o] });
  },

  redo: () => {
    const { future: s, sections: r, past: o, pages, currentPageId } = get();
    if (s.length === 0) return;
    const l = s[0];
    const i = s.slice(1);
    const newPages = pages.map((p) => (p.id === currentPageId ? { ...p, sections: l } : p));
    set({ sections: l, pages: newPages, past: [...o, JSON.parse(JSON.stringify(r))], future: i });
  },

  addSection: (s = 'container', r) => {
    get().saveHistory();
    const o = Rl(s);
    const l = {
      id: 'sec-' + Date.now(),
      name: 'New Container',
      styles: applySiteWidthToSectionStyles(
        { bgColor: '#ffffff', paddingTop: '20px', paddingBottom: '20px', paddingLeft: '20px', paddingRight: '20px' },
        get().siteWidth,
        get().customSiteWidth
      ),
      columns: o,
      rows: [{ id: 'row-' + Date.now() + '-0', columns: o }]
    };
    set((i) => {
      let updated;
      if (typeof r === 'number' && r >= 0 && r <= i.sections.length) {
        const a = [...i.sections];
        a.splice(r, 0, l);
        updated = a;
      } else {
        updated = [...i.sections, l];
      }
      const newPages = i.pages.map((p) => (p.id === i.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages, selectedSectionId: l.id, selectedElementId: null };
    });
  },

  addSectionWithElement: (s = 'container', r, widgetOrEl) => {
    get().saveHistory();
    const o = Rl(s);
    let elObj;
    if (typeof widgetOrEl === 'object' && widgetOrEl !== null && 'id' in widgetOrEl) {
      elObj = widgetOrEl;
    } else {
      const wType = typeof widgetOrEl === 'string' ? widgetOrEl : 'button';
      elObj = createDefaultElement(wType);
    }
    if (o.length > 0 && elObj) {
      o[0].elements = [elObj];
    }
    const secId = 'sec-' + Date.now();
    const l = {
      id: secId,
      name: 'New Container',
      styles: applySiteWidthToSectionStyles(
        { bgColor: '#ffffff', paddingTop: '20px', paddingBottom: '20px', paddingLeft: '20px', paddingRight: '20px' },
        get().siteWidth,
        get().customSiteWidth
      ),
      columns: o,
      rows: [{ id: 'row-' + Date.now() + '-0', columns: o }]
    };
    set((i) => {
      let updated;
      if (typeof r === 'number' && r >= 0 && r <= i.sections.length) {
        const a = [...i.sections];
        a.splice(r, 0, l);
        updated = a;
      } else {
        updated = [...i.sections, l];
      }
      const newPages = i.pages.map((p) => (p.id === i.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages, selectedSectionId: l.id, selectedElementId: elObj ? elObj.id : null };
    });
    return { section: l, element: elObj };
  },

  applyLayoutPresetToSection: (s, r) => {
    get().saveHistory();
    const o = Rl(r);
    set((l) => {
      const updated = l.sections.map((i) => {
        if (i.id !== s) return i;
        const a = [];
        (i.columns || []).forEach((b) => {
          a.push(b.elements || []);
        });
        const d = o.map((b, m) => (m < a.length && a[m].length > 0 ? { ...b, elements: [...a[m]] } : b));
        if (a.length > o.length) {
          const b = d.reduce((N, c, v, p) => (c.widthPercentage > p[N].widthPercentage ? v : N), 0);
          const m = [];
          for (let N = o.length; N < a.length; N++) m.push(...a[N]);
          d[b].elements = [...d[b].elements, ...m];
        }
        const u = [{ id: i.rows?.[0]?.id || `row-${Date.now()}-0`, columns: d }];
        return { ...i, columns: d, rows: u };
      });
      const newPages = l.pages.map((p) => (p.id === l.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  addRowToSection: (s, r = 'two-equal') => {
    get().saveHistory();
    const o = Rl(r);
    const l = 'row-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    set((i) => {
      const updated = i.sections.map((a) => {
        if (a.id !== s) return a;
        const d = a.rows && a.rows.length > 0 ? [...a.rows] : [{ id: 'row-' + Date.now() + '-0', columns: [...a.columns] }];
        const u = { id: l, columns: o };
        const g = [...d, u];
        return { ...a, rows: g, columns: g[0].columns };
      });
      const newPages = i.pages.map((p) => (p.id === i.currentPageId ? { ...p, sections: updated } : p));
      return { selectedRowId: l, selectedSectionId: s, selectedElementId: null, sections: updated, pages: newPages };
    });
  },

  deleteRowFromSection: (s, r) => {
    get().saveHistory();
    set((o) => {
      let l = o.selectedRowId;
      const updated = o.sections.map((a) => {
        if (a.id !== s) return a;
        const u = (a.rows && a.rows.length > 0 ? a.rows : [{ id: `${a.id}-row-0`, columns: a.columns }]).filter((g) => g.id !== r);
        if (u.length === 0) {
          const g = { id: 'row-' + Date.now() + '-0', columns: Rl('container') };
          l = g.id;
          return { ...a, rows: [g], columns: g.columns };
        }
        if (l === r) l = u[u.length - 1].id;
        return { ...a, rows: u, columns: u[0].columns };
      });
      const newPages = o.pages.map((p) => (p.id === o.currentPageId ? { ...p, sections: updated } : p));
      return { selectedRowId: l, sections: updated, pages: newPages };
    });
  },

  duplicateRowInSection: (s, r) => {
    get().saveHistory();
    const o = Date.now();
    const l = 'row-' + o + '-' + Math.random().toString(36).substr(2, 4);
    set((i) => {
      const updated = i.sections.map((a) => {
        if (a.id !== s) return a;
        const d = a.rows && a.rows.length > 0 ? a.rows : [{ id: `${a.id}-row-0`, columns: a.columns }];
        const u = d.findIndex((m) => m.id === r);
        if (u === -1) return a;
        const g = d[u];
        const x = {
          id: l,
          columns: (g.columns || []).map((m, N) => ({
            ...m,
            id: `col-${o}-${N + 1}`,
            elements: (m.elements || []).map((c, v) => ({
              ...JSON.parse(JSON.stringify(c)),
              id: `el-${o}-${N}-${v}-${Math.random().toString(36).substr(2, 4)}`
            }))
          }))
        };
        const b = [...d];
        b.splice(u + 1, 0, x);
        return { ...a, rows: b, columns: b[0].columns };
      });
      const newPages = i.pages.map((p) => (p.id === i.currentPageId ? { ...p, sections: updated } : p));
      return { selectedRowId: l, selectedSectionId: s, selectedElementId: null, sections: updated, pages: newPages };
    });
  },

  addInnerRowToColumn: (s, r, o = 'two-equal') => {
    get().saveHistory();
    const l = Date.now();
    const cols = Rl(o).map((c, idx) => ({
      id: `inner-col-${l}-${idx + 1}`,
      widthPercentage: c.widthPercentage,
      elements: []
    }));
    const a = {
      id: 'el-innerrow-' + l,
      type: 'innerrow',
      label: 'Inner Row',
      styles: {
        borderRadius: '12px'
      },
      content: {
        preset: o,
        columns: cols,
        gap: '12px',
        alignItems: 'stretch'
      }
    };
    get().addElementToColumn(s, r, a);
  },

  deleteSection: (s) => {
    get().saveHistory();
    set((r) => {
      const updated = r.sections.filter((o) => o.id !== s);
      const newPages = r.pages.map((p) => (p.id === r.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  duplicateSection: (s) => {
    get().saveHistory();
    const { sections: r, pages, currentPageId } = get();
    const o = r.find((u) => u.id === s);
    if (!o) return;
    const l = JSON.parse(JSON.stringify(o));
    const i = Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    l.id = 'sec-' + i;
    l.name = (l.name || 'Section') + ' (Copy)';
    l.columns = (l.columns || []).map((u, g) => ({
      ...u,
      id: `col-${i}-${g + 1}`,
      elements: (u.elements || []).map((x, b) => ({
        ...x,
        id: `el-${i}-${g}-${b}-${Math.random().toString(36).substr(2, 4)}`
      }))
    }));
    if (l.rows) {
      l.rows = l.rows.map((u, g) => ({
        ...u,
        id: `row-${i}-${g + 1}`,
        columns: (u.columns || []).map((x, b) => ({
          ...x,
          id: `col-${i}-r${g}-${b + 1}`,
          elements: (x.elements || []).map((m, N) => ({
            ...m,
            id: `el-${i}-r${g}-${b}-${N}-${Math.random().toString(36).substr(2, 4)}`
          }))
        }))
      }));
    }
    const a = r.findIndex((u) => u.id === s);
    const d = [...r];
    d.splice(a + 1, 0, l);
    const newPages = pages.map((p) => (p.id === currentPageId ? { ...p, sections: d } : p));
    set({ sections: d, pages: newPages, selectedSectionId: l.id, selectedElementId: null });
  },

  renameSection: (s, r) => {
    get().saveHistory();
    set((o) => {
      const updated = o.sections.map((l) => (l.id === s ? { ...l, name: r } : l));
      const newPages = o.pages.map((p) => (p.id === o.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  toggleSectionCollapse: (s) => {
    set((r) => ({
      sections: r.sections.map((o) => (o.id === s ? { ...o, isCollapsed: !o.isCollapsed } : o))
    }));
  },

  reorderSections: (s, r) => {
    get().saveHistory();
    const o = [...get().sections];
    const [l] = o.splice(s, 1);
    o.splice(r, 0, l);
    const newPages = get().pages.map((p) => (p.id === get().currentPageId ? { ...p, sections: o } : p));
    set({ sections: o, pages: newPages });
  },

  updateColumnWidth: (s, r, o) => {
    get().saveHistory();
    set((l) => {
      const updated = l.sections.map((i) => {
        if (i.id !== s) return i;
        const a = (x) => x.map((b) => (b.id === r ? { ...b, widthPercentage: o } : b));
        const d = a(i.columns);
        const u = i.rows?.map((x) => ({ ...x, columns: a(x.columns) }));
        return { ...i, columns: d, ...(u ? { rows: u } : {}) };
      });
      const newPages = l.pages.map((p) => (p.id === l.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  deleteColumn: (s, r) => {
    get().saveHistory();
    const { sections: o, pages, currentPageId } = get();
    const updated = o.map((l) => {
      if (l.id !== s) return l;
      const i = (g) => {
        const x = g.filter((m) => m.id !== r);
        if (x.length === 0) return g;
        const b = +(100 / x.length).toFixed(2);
        return x.map((m) => ({ ...m, widthPercentage: b }));
      };
      const a = i(l.columns);
      const d = l.rows?.map((g) => ({ ...g, columns: i(g.columns) }));
      return { ...l, columns: a, ...(d ? { rows: d } : {}) };
    });
    const newPages = pages.map((p) => (p.id === currentPageId ? { ...p, sections: updated } : p));
    set({ sections: updated, pages: newPages });
  },

  addColumn: (s) => {
    get().saveHistory();
    set((r) => {
      const updated = r.sections.map((o) => {
        if (o.id !== s) return o;
        const l = [...o.columns, { id: 'col-' + Date.now(), widthPercentage: 50, elements: [] }];
        const i = +(100 / l.length).toFixed(2);
        const a = l.map((d) => ({ ...d, widthPercentage: i }));
        return { ...o, columns: a, ...(o.rows ? { rows: o.rows.map((d, u) => (u === 0 ? { ...d, columns: a } : d)) } : {}) };
      });
      const newPages = r.pages.map((p) => (p.id === r.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  duplicateColumn: (s, r) => {
    get().saveHistory();
    const { sections: o, pages, currentPageId } = get();
    const updated = o.map((l) => {
      if (l.id !== s) return l;
      const i = (g) => {
        const x = g.findIndex((p) => p.id === r);
        if (x === -1) return g;
        const b = g[x];
        const m = Date.now() + '-' + Math.random().toString(36).substr(2, 4);
        const N = {
          id: 'col-' + m,
          widthPercentage: b.widthPercentage,
          elements: (b.elements || []).map((p, h) => ({
            ...JSON.parse(JSON.stringify(p)),
            id: `el-${m}-${h}-${Math.random().toString(36).substr(2, 4)}`
          }))
        };
        const c = [...g];
        c.splice(x + 1, 0, N);
        const v = +(100 / c.length).toFixed(2);
        return c.map((p) => ({ ...p, widthPercentage: v }));
      };
      const a = i(l.columns);
      const d = l.rows?.map((g) => ({ ...g, columns: i(g.columns) }));
      return { ...l, columns: a, ...(d ? { rows: d } : {}) };
    });
    const newPages = pages.map((p) => (p.id === currentPageId ? { ...p, sections: updated } : p));
    set({ sections: updated, pages: newPages });
  },

  addElementToColumn: (s, r, o, l) => {
    get().saveHistory();
    let a;
    if (typeof o === 'object' && o !== null && 'id' in o) {
      a = o;
    } else {
      const d = typeof o === 'string' ? o : 'heading';
      a = createDefaultElement(d);
    }
    set((d) => {
      const updated = d.sections.map((u) => {
        if (u.id !== s) return u;
        const g = (N) => {
          if (N.id !== r) return N;
          const c = [...N.elements];
          if (typeof l === 'number' && l >= 0 && l <= c.length) {
            c.splice(l, 0, a);
          } else {
            c.push(a);
          }
          return { ...N, elements: c };
        };
        const x = u.columns.map(g);
        const b = u.rows?.map((N) => ({ ...N, columns: N.columns.map(g) }));
        return { ...u, columns: x, ...(b ? { rows: b } : {}) };
      });
      const newPages = d.pages.map((p) => (p.id === d.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages, selectedElementId: a.id };
    });
  },

  // ADD ELEMENT TO INNER COLUMN (nested inside innerrow)
  addElementToInnerColumn: (innerRowId, innerColId, widgetOrEl, targetIndex) => {
    get().saveHistory();
    let el;
    if (typeof widgetOrEl === 'object' && widgetOrEl !== null && 'id' in widgetOrEl) {
      el = widgetOrEl;
    } else {
      const wType = typeof widgetOrEl === 'string' ? widgetOrEl : 'heading';
      el = createDefaultElement(wType);
    }

    const updateInnerColsInList = (elements) => {
      return (elements || []).map((item) => {
        if (item.id === innerRowId && item.type === 'innerrow') {
          const curCols = item.content?.columns && item.content.columns.length > 0
            ? item.content.columns
            : [
                { id: `inner-col-${Date.now()}-1`, widthPercentage: 50, elements: [] },
                { id: `inner-col-${Date.now()}-2`, widthPercentage: 50, elements: [] }
              ];

          let foundCol = false;
          const updatedCols = curCols.map((c) => {
            if (c.id === innerColId) {
              foundCol = true;
              const subEls = [...(c.elements || [])];
              if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= subEls.length) {
                subEls.splice(targetIndex, 0, el);
              } else {
                subEls.push(el);
              }
              return { ...c, elements: subEls };
            }
            return c;
          });

          // Fallback to first column if ID wasn't matched
          if (!foundCol && updatedCols.length > 0) {
            const subEls = [...(updatedCols[0].elements || [])];
            if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= subEls.length) {
              subEls.splice(targetIndex, 0, el);
            } else {
              subEls.push(el);
            }
            updatedCols[0] = { ...updatedCols[0], elements: subEls };
          }

          return {
            ...item,
            content: {
              ...item.content,
              columns: updatedCols
            }
          };
        }
        return item;
      });
    };

    set((state) => {
      const updated = state.sections.map((sec) => {
        const newCols = (sec.columns || []).map((col) => ({
          ...col,
          elements: updateInnerColsInList(col.elements)
        }));
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map((col) => ({
            ...col,
            elements: updateInnerColsInList(col.elements)
          }))
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages, selectedElementId: el.id };
    });
  },

  deleteElementFromInnerColumn: (innerRowId, innerColId, elementId) => {
    get().saveHistory();
    const removeSubElement = (elements) => {
      return (elements || []).map((item) => {
        if (item.id === innerRowId && item.type === 'innerrow') {
          const updatedCols = (item.content?.columns || []).map((c) => {
            if (c.id === innerColId || !innerColId) {
              return {
                ...c,
                elements: (c.elements || []).filter((sub) => sub.id !== elementId)
              };
            }
            return c;
          });
          return {
            ...item,
            content: {
              ...item.content,
              columns: updatedCols
            }
          };
        }
        return item;
      });
    };

    set((state) => {
      const updated = state.sections.map((sec) => {
        const newCols = (sec.columns || []).map((col) => ({
          ...col,
          elements: removeSubElement(col.elements)
        }));
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map((col) => ({
            ...col,
            elements: removeSubElement(col.elements)
          }))
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return {
        sections: updated,
        pages: newPages,
        selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId
      };
    });
  },

  updateInnerRowLayout: (innerRowId, preset) => {
    get().saveHistory();
    const newColSpecs = Rl(preset);
    const updateLayout = (elements) => {
      return (elements || []).map((item) => {
        if (item.id === innerRowId && item.type === 'innerrow') {
          const currentCols = item.content?.columns || [];
          const existingElements = currentCols.map((c) => c.elements || []);

          const newInnerCols = newColSpecs.map((spec, idx) => {
            const preserved = idx < existingElements.length ? [...existingElements[idx]] : [];
            return {
              id: `inner-col-${Date.now()}-${idx + 1}`,
              widthPercentage: spec.widthPercentage,
              elements: preserved
            };
          });

          if (existingElements.length > newColSpecs.length) {
            const leftover = [];
            for (let i = newColSpecs.length; i < existingElements.length; i++) {
              leftover.push(...existingElements[i]);
            }
            if (newInnerCols.length > 0) {
              const last = newInnerCols.length - 1;
              newInnerCols[last].elements = [...newInnerCols[last].elements, ...leftover];
            }
          }

          return {
            ...item,
            content: {
              ...item.content,
              preset,
              columns: newInnerCols
            }
          };
        }
        return item;
      });
    };

    set((state) => {
      const updated = state.sections.map((sec) => {
        const newCols = (sec.columns || []).map((col) => ({
          ...col,
          elements: updateLayout(col.elements)
        }));
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map((col) => ({
            ...col,
            elements: updateLayout(col.elements)
          }))
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  updateInnerColumnWidth: (innerRowId, innerColId, newWidth) => {
    get().saveHistory();
    const updateWidth = (elements: any[]) => {
      return (elements || []).map((item: any) => {
        if (item.id === innerRowId && item.type === 'innerrow') {
          const curCols = item.content?.columns || [];
          const isInterlocked = item.content?.interlockWidths !== false;
          let cols;
          if (isInterlocked && curCols.length > 1) {
            const clampedNewWidth = Math.min(100 - (curCols.length - 1) * 5, Math.max(5, newWidth));
            const remainingWidth = Math.max(0, 100 - clampedNewWidth);
            const otherCols = curCols.filter((c: any) => c.id !== innerColId);
            const otherColsTotal = otherCols.reduce((sum: number, c: any) => sum + (c.widthPercentage || (100 / curCols.length)), 0);

            if (curCols.length === 2) {
              const otherColWidth = Math.max(5, 100 - clampedNewWidth);
              cols = curCols.map((c: any) =>
                c.id === innerColId
                  ? { ...c, widthPercentage: clampedNewWidth }
                  : { ...c, widthPercentage: otherColWidth }
              );
            } else {
              let distributed = 0;
              cols = curCols.map((c: any) => {
                if (c.id === innerColId) {
                  return { ...c, widthPercentage: clampedNewWidth };
                }
                const ratio = otherColsTotal > 0 ? (c.widthPercentage || 1) / otherColsTotal : 1 / otherCols.length;
                const isLastOther = otherCols[otherCols.length - 1]?.id === c.id;
                let calculatedWidth: number;
                if (isLastOther) {
                  calculatedWidth = Math.max(5, Math.round((remainingWidth - distributed) * 10) / 10);
                } else {
                  calculatedWidth = Math.max(5, Math.round(remainingWidth * ratio * 10) / 10);
                  distributed += calculatedWidth;
                }
                return { ...c, widthPercentage: calculatedWidth };
              });
            }
          } else {
            // Independent width: only the target column width is updated, others remain completely untouched
            cols = curCols.map((c: any) =>
              c.id === innerColId ? { ...c, widthPercentage: Math.min(100, Math.max(5, newWidth)) } : c
            );
          }
          return {
            ...item,
            content: {
              ...item.content,
              columns: cols
            }
          };
        }
        return item;
      });
    };

    set((state) => {
      const updated = state.sections.map((sec) => {
        const newCols = (sec.columns || []).map((col) => ({
          ...col,
          elements: updateWidth(col.elements)
        }));
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map((col) => ({
            ...col,
            elements: updateWidth(col.elements)
          }))
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  duplicateInnerColumn: (innerRowId, innerColId) => {
    get().saveHistory();
    const dupCol = (elements) => {
      return (elements || []).map((item) => {
        if (item.id === innerRowId && item.type === 'innerrow') {
          const curCols = item.content?.columns || [];
          const targetIndex = curCols.findIndex((c) => c.id === innerColId);
          if (targetIndex === -1) return item;
          const targetCol = curCols[targetIndex];
          const rnd = Date.now() + '-' + Math.random().toString(36).substr(2, 4);

          const clonedCol = {
            ...JSON.parse(JSON.stringify(targetCol)),
            id: `inner-col-${rnd}`,
            elements: (targetCol.elements || []).map((sub, sIdx) => ({
              ...JSON.parse(JSON.stringify(sub)),
              id: `el-${rnd}-${sIdx + 1}`
            }))
          };

          const newCols = [...curCols];
          newCols.splice(targetIndex + 1, 0, clonedCol);

          const equal = +(100 / newCols.length).toFixed(2);
          const balanced = newCols.map((c) => ({ ...c, widthPercentage: equal }));

          return {
            ...item,
            content: {
              ...item.content,
              columns: balanced
            }
          };
        }
        return item;
      });
    };

    set((state) => {
      const updated = state.sections.map((sec) => {
        const newCols = (sec.columns || []).map((col) => ({
          ...col,
          elements: dupCol(col.elements)
        }));
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map((col) => ({
            ...col,
            elements: dupCol(col.elements)
          }))
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  updateInnerColumnStyles: (innerRowId, innerColId, colStyles) => {
    get().saveHistory();
    const updateStyles = (elements) => {
      return (elements || []).map((item) => {
        if (item.id === innerRowId && item.type === 'innerrow') {
          const cols = (item.content?.columns || []).map((c) =>
            c.id === innerColId ? { ...c, styles: { ...(c.styles || {}), ...colStyles } } : c
          );
          return {
            ...item,
            content: {
              ...item.content,
              columns: cols
            }
          };
        }
        return item;
      });
    };

    set((state) => {
      const updated = state.sections.map((sec) => {
        const newCols = (sec.columns || []).map((col) => ({
          ...col,
          elements: updateStyles(col.elements)
        }));
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map((col) => ({
            ...col,
            elements: updateStyles(col.elements)
          }))
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  addInnerColumn: (innerRowId) => {
    get().saveHistory();
    const addCol = (elements) => {
      return (elements || []).map((item) => {
        if (item.id === innerRowId && item.type === 'innerrow') {
          const curCols = item.content?.columns || [];
          const newCol = {
            id: `inner-col-${Date.now()}-${curCols.length + 1}`,
            widthPercentage: 50,
            elements: []
          };
          const combined = [...curCols, newCol];
          const equal = +(100 / combined.length).toFixed(2);
          const balanced = combined.map((c) => ({ ...c, widthPercentage: equal }));
          return {
            ...item,
            content: {
              ...item.content,
              columns: balanced
            }
          };
        }
        return item;
      });
    };

    set((state) => {
      const updated = state.sections.map((sec) => {
        const newCols = (sec.columns || []).map((col) => ({
          ...col,
          elements: addCol(col.elements)
        }));
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map((col) => ({
            ...col,
            elements: addCol(col.elements)
          }))
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  deleteInnerColumn: (innerRowId, innerColId) => {
    get().saveHistory();
    const delCol = (elements) => {
      return (elements || []).map((item) => {
        if (item.id === innerRowId && item.type === 'innerrow') {
          const curCols = item.content?.columns || [];
          if (curCols.length <= 1) return item;
          const target = curCols.find((c) => c.id === innerColId);
          const remaining = curCols.filter((c) => c.id !== innerColId);
          if (target && target.elements && target.elements.length > 0 && remaining.length > 0) {
            remaining[remaining.length - 1].elements = [
              ...(remaining[remaining.length - 1].elements || []),
              ...target.elements
            ];
          }
          const equal = +(100 / remaining.length).toFixed(2);
          const balanced = remaining.map((c) => ({ ...c, widthPercentage: equal }));
          return {
            ...item,
            content: {
              ...item.content,
              columns: balanced
            }
          };
        }
        return item;
      });
    };

    set((state) => {
      const updated = state.sections.map((sec) => {
        const newCols = (sec.columns || []).map((col) => ({
          ...col,
          elements: delCol(col.elements)
        }));
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map((col) => ({
            ...col,
            elements: delCol(col.elements)
          }))
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  updateElementContent: (s, r) => {
    const updateRecursive = (elements) => {
      if (!Array.isArray(elements)) return [];
      return elements.map((item) => {
        if (item.id === s) {
          return { ...item, content: { ...item.content, ...r } };
        }
        if (item.type === 'innerrow') {
          const cols = item.content?.columns || item.content?.innerColumns;
          if (Array.isArray(cols)) {
            return {
              ...item,
              content: {
                ...item.content,
                columns: cols.map((col) => ({
                  ...col,
                  elements: updateRecursive(col.elements || [])
                }))
              }
            };
          }
        }
        return item;
      });
    };

    set((state) => {
      const updated = state.sections.map((sec) => {
        const applyCol = (col) => ({ ...col, elements: updateRecursive(col.elements) });
        const newCols = (sec.columns || []).map(applyCol);
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map(applyCol)
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  updateElementStyles: (s, r) => {
    const updateRecursive = (elements) => {
      if (!Array.isArray(elements)) return [];
      return elements.map((item) => {
        if (item.id === s) {
          return { ...item, styles: { ...item.styles, ...r } };
        }
        if (item.type === 'innerrow') {
          const cols = item.content?.columns || item.content?.innerColumns;
          if (Array.isArray(cols)) {
            return {
              ...item,
              content: {
                ...item.content,
                columns: cols.map((col) => ({
                  ...col,
                  elements: updateRecursive(col.elements || [])
                }))
              }
            };
          }
        }
        return item;
      });
    };

    set((state) => {
      const updated = state.sections.map((sec) => {
        const applyCol = (col) => ({ ...col, elements: updateRecursive(col.elements) });
        const newCols = (sec.columns || []).map(applyCol);
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map(applyCol)
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  deleteElement: (s) => {
    get().saveHistory();
    const filterRecursive = (elements) => {
      if (!Array.isArray(elements)) return [];
      return elements
        .filter((item) => item.id !== s)
        .map((item) => {
          if (item.type === 'innerrow') {
            const cols = item.content?.columns || item.content?.innerColumns;
            if (Array.isArray(cols)) {
              return {
                ...item,
                content: {
                  ...item.content,
                  columns: cols.map((col) => ({
                    ...col,
                    elements: filterRecursive(col.elements || [])
                  }))
                }
              };
            }
          }
          return item;
        });
    };

    set((state) => {
      const updated = state.sections.map((sec) => {
        const applyCol = (col) => ({ ...col, elements: filterRecursive(col.elements) });
        const newCols = (sec.columns || []).map(applyCol);
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map(applyCol)
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return {
        sections: updated,
        pages: newPages,
        selectedElementId: state.selectedElementId === s ? null : state.selectedElementId
      };
    });
  },

  duplicateElement: (s) => {
    get().saveHistory();
    let newElementId = null;

    const dupRecursive = (elements) => {
      if (!Array.isArray(elements)) return [];
      const idx = elements.findIndex((el) => el.id === s);
      if (idx !== -1) {
        const original = elements[idx];
        const copy = JSON.parse(JSON.stringify(original));
        const rnd = Date.now() + '-' + Math.random().toString(36).substr(2, 4);
        copy.id = 'el-' + rnd;
        copy.label = (copy.label || 'Element') + ' (Copy)';
        newElementId = copy.id;

        if (copy.type === 'innerrow' && copy.content?.columns) {
          copy.content.columns = copy.content.columns.map((c, cIdx) => ({
            ...c,
            id: `inner-col-${rnd}-${cIdx + 1}`,
            elements: (c.elements || []).map((sub, sIdx) => ({
              ...sub,
              id: `el-${rnd}-${cIdx + 1}-${sIdx + 1}`
            }))
          }));
        }

        const next = [...elements];
        next.splice(idx + 1, 0, copy);
        return next;
      }

      return elements.map((item) => {
        if (item.type === 'innerrow') {
          const cols = item.content?.columns || item.content?.innerColumns;
          if (Array.isArray(cols)) {
            return {
              ...item,
              content: {
                ...item.content,
                columns: cols.map((col) => ({
                  ...col,
                  elements: dupRecursive(col.elements || [])
                }))
              }
            };
          }
        }
        return item;
      });
    };

    set((state) => {
      const updated = state.sections.map((sec) => {
        const applyCol = (col) => ({ ...col, elements: dupRecursive(col.elements) });
        const newCols = (sec.columns || []).map(applyCol);
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map(applyCol)
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return {
        sections: updated,
        pages: newPages,
        selectedElementId: newElementId || state.selectedElementId
      };
    });
  },

  reorderElementsInColumn: (s, r, o, l) => {
    get().saveHistory();
    set((state) => {
      const updated = state.sections.map((sec) => {
        if (sec.id !== s) return sec;
        const reorder = (col) => {
          if (col.id !== r) return col;
          const items = [...(col.elements || [])];
          const [moved] = items.splice(o, 1);
          items.splice(l, 0, moved);
          return { ...col, elements: items };
        };
        const newCols = (sec.columns || []).map(reorder);
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map(reorder)
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  reorderElementsInInnerColumn: (innerRowId, innerColId, srcIdx, targetIdx) => {
    get().saveHistory();
    const reorderInInner = (elements) => {
      return (elements || []).map((item) => {
        if (item.id === innerRowId && item.type === 'innerrow') {
          const cols = (item.content?.columns || []).map((col) => {
            if (col.id !== innerColId) return col;
            const items = [...(col.elements || [])];
            const [moved] = items.splice(srcIdx, 1);
            items.splice(targetIdx, 0, moved);
            return { ...col, elements: items };
          });
          return {
            ...item,
            content: { ...item.content, columns: cols }
          };
        }
        return item;
      });
    };

    set((state) => {
      const updated = state.sections.map((sec) => {
        const applyCol = (col) => ({ ...col, elements: reorderInInner(col.elements) });
        const newCols = (sec.columns || []).map(applyCol);
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map(applyCol)
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages };
    });
  },

  copyElement: (s) => {
    const elId = s || get().selectedElementId;
    if (!elId) return;
    let found = null;

    const searchInList = (list) => {
      if (!Array.isArray(list)) return;
      for (const item of list) {
        if (item.id === elId) {
          found = JSON.parse(JSON.stringify(item));
          return;
        }
        if (item.type === 'innerrow' && item.content?.columns) {
          for (const col of item.content.columns) {
            searchInList(col.elements);
            if (found) return;
          }
        }
      }
    };

    get().sections.forEach((sec) => {
      (sec.columns || []).forEach((c) => searchInList(c.elements));
      (sec.rows || []).forEach((rw) => (rw.columns || []).forEach((c) => searchInList(c.elements)));
    });

    if (found) {
      set({ clipboardElement: found });
    }
  },

  pasteElement: (targetSecId, targetColId) => {
    const { clipboardElement, selectedElementId, selectedSectionId, sections } = get();
    if (!clipboardElement || sections.length === 0) return;
    get().saveHistory();

    const clone = JSON.parse(JSON.stringify(clipboardElement));
    const rnd = Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    clone.id = 'el-' + rnd;
    clone.label = (clone.label || 'Element').replace(/\s*\(Copy\)$/, '') + ' (Copy)';

    if (clone.type === 'innerrow' && clone.content?.columns) {
      clone.content.columns = clone.content.columns.map((c, cIdx) => ({
        ...c,
        id: `inner-col-${rnd}-${cIdx + 1}`,
        elements: (c.elements || []).map((sub, sIdx) => ({
          ...sub,
          id: `el-${rnd}-${cIdx + 1}-${sIdx + 1}`
        }))
      }));
    }

    let sId = targetSecId || selectedSectionId;
    let cId = targetColId;

    if (!sId && selectedElementId) {
      sections.forEach((sec) => {
        (sec.columns || []).forEach((col) => {
          if ((col.elements || []).some((el) => el.id === selectedElementId)) {
            sId = sec.id;
            cId = col.id;
          }
        });
        (sec.rows || []).forEach((rw) => {
          (rw.columns || []).forEach((col) => {
            if ((col.elements || []).some((el) => el.id === selectedElementId)) {
              sId = sec.id;
              cId = col.id;
            }
          });
        });
      });
    }

    if (!sId && sections.length > 0) {
      sId = sections[0].id;
    }

    const secTarget = sections.find((sec) => sec.id === sId);
    if (!secTarget) return;

    if (!cId) {
      cId = secTarget.columns?.[0]?.id || secTarget.rows?.[0]?.columns?.[0]?.id;
    }

    set((state) => {
      const updated = state.sections.map((sec) => {
        if (sec.id !== sId) return sec;
        const insert = (col) => {
          if (col.id !== cId) return col;
          return { ...col, elements: [...(col.elements || []), clone] };
        };
        const newCols = (sec.columns || []).map(insert);
        const newRows = (sec.rows || []).map((rw) => ({
          ...rw,
          columns: (rw.columns || []).map(insert)
        }));
        return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
      });
      const newPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: newPages, selectedElementId: clone.id, selectedSectionId: sId };
    });
  },

  setCurrentPageId: (id) => {
    const { pages, currentPageId, sections } = get();
    if (id === currentPageId) return;
    const nextPages = pages.map((p) => (p.id === currentPageId ? { ...p, sections } : p));
    const target = nextPages.find((p) => p.id === id);
    if (target) {
      set({
        pages: nextPages,
        currentPageId: id,
        sections: target.sections,
        selectedElementId: null,
        selectedSectionId: null,
        selectedRowId: null,
        past: [],
        future: []
      });
    }
  },

  addPage: (name = 'New Page', slug) => {
    const { pages, currentPageId, sections, globalSections } = get();
    const nextPages = pages.map((p) => (p.id === currentPageId ? { ...p, sections } : p));
    const pId = 'page-' + Date.now();
    const finalSlug = slug || '/' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const navSec = globalSections['global-nav'] || sections.find((s) => s.isDynamic && s.globalId);

    const initSecs = navSec
      ? [
          { ...JSON.parse(JSON.stringify(navSec)), id: 'sec-nav-' + Date.now() },
          {
            id: 'sec-' + Date.now(),
            name: `${name} Header`,
            customId: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            styles: { bgColor: '#ffffff', paddingTop: '60px', paddingBottom: '60px' },
            columns: [
              {
                id: 'col-' + Date.now() + '-1',
                widthPercentage: 100,
                elements: [
                  {
                    id: 'el-' + Date.now() + '-1',
                    type: 'heading',
                    label: 'Heading',
                    styles: { color: '#0f172a', fontSize: '36px', fontWeight: '800', textAlign: 'center' },
                    content: { text: name }
                  },
                  {
                    id: 'el-' + Date.now() + '-2',
                    type: 'text',
                    label: 'Text',
                    styles: { color: '#64748b', fontSize: '16px', textAlign: 'center', marginTop: '12px' },
                    content: { text: `Welcome to the ${name} page. Place elements and build your custom layout here.` }
                  }
                ]
              }
            ]
          }
        ]
      : [
          {
            id: 'sec-' + Date.now(),
            name: `${name} Header`,
            customId: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            styles: { bgColor: '#ffffff', paddingTop: '60px', paddingBottom: '60px' },
            columns: [
              {
                id: 'col-' + Date.now() + '-1',
                widthPercentage: 100,
                elements: [
                  {
                    id: 'el-' + Date.now() + '-1',
                    type: 'heading',
                    label: 'Heading',
                    styles: { color: '#0f172a', fontSize: '36px', fontWeight: '800', textAlign: 'center' },
                    content: { text: name }
                  }
                ]
              }
            ]
          }
        ];

    const newPage = {
      id: pId,
      name,
      slug: finalSlug.startsWith('/') ? finalSlug : '/' + finalSlug,
      sections: initSecs
    };

    set({
      pages: [...nextPages, newPage],
      currentPageId: pId,
      sections: initSecs,
      selectedElementId: null,
      selectedSectionId: null,
      selectedRowId: null,
      past: [],
      future: []
    });
  },

  renamePage: (id, name, slug) => {
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id !== id ? p : { ...p, name, slug: slug !== undefined ? slug : p.slug }
      )
    }));
  },

  duplicatePage: (id) => {
    const { pages, currentPageId, sections } = get();
    const nextPages = pages.map((p) => (p.id === currentPageId ? { ...p, sections } : p));
    const target = nextPages.find((p) => p.id === id);
    if (!target) return;

    const pId = 'page-' + Date.now();
    const clonedSecs = target.sections.map((s) => Du(s));
    const newPage = {
      id: pId,
      name: `${target.name} (Copy)`,
      slug: `${target.slug}-copy`,
      sections: clonedSecs
    };

    set({
      pages: [...nextPages, newPage],
      currentPageId: pId,
      sections: clonedSecs,
      selectedElementId: null,
      selectedSectionId: null,
      selectedRowId: null,
      past: [],
      future: []
    });
  },

  deletePage: (id) => {
    const { pages, currentPageId, sections } = get();
    if (pages.length <= 1) return;
    const nextPages = pages.map((p) => (p.id === currentPageId ? { ...p, sections } : p)).filter((p) => p.id !== id);

    if (currentPageId === id) {
      const fallback = nextPages[0];
      set({
        pages: nextPages,
        currentPageId: fallback.id,
        sections: fallback.sections,
        selectedElementId: null,
        selectedSectionId: null,
        selectedRowId: null,
        past: [],
        future: []
      });
    } else {
      set({ pages: nextPages });
    }
  },

  setSectionCustomId: (sectionId, customId) => {
    get().saveHistory();
    const cleanId = customId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    set((state) => {
      const updated = state.sections.map((s) => (s.id === sectionId ? { ...s, customId: cleanId } : s));
      const nextPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: nextPages };
    });
  },

  makeSectionDynamic: (sectionId, name) => {
    const { sections, pages, currentPageId, globalSections } = get();
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec) return;
    get().saveHistory();

    const gId = sec.globalId || 'global-sec-' + Date.now();
    const gName = name || sec.name || 'Global Dynamic Section';
    const updatedSec = { ...sec, name: gName, isDynamic: true, globalId: gId };
    const nextGlobals = { ...globalSections, [gId]: JSON.parse(JSON.stringify(updatedSec)) };
    const updatedSecs = sections.map((s) => (s.id === sectionId ? updatedSec : s));
    const nextPages = pages.map((p) => (p.id === currentPageId ? { ...p, sections: updatedSecs } : p));

    set({ sections: updatedSecs, pages: nextPages, globalSections: nextGlobals });
  },

  detachDynamicSection: (sectionId) => {
    get().saveHistory();
    set((state) => {
      const updated = state.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const clean = { ...s };
        delete clean.isDynamic;
        delete clean.globalId;
        return clean;
      });
      const nextPages = state.pages.map((p) => (p.id === state.currentPageId ? { ...p, sections: updated } : p));
      return { sections: updated, pages: nextPages };
    });
  },

  insertGlobalSection: (globalId, index) => {
    const { globalSections, sections, pages, currentPageId } = get();
    const sec = globalSections[globalId];
    if (!sec) return;
    get().saveHistory();

    const clone = JSON.parse(JSON.stringify(sec));
    clone.id = 'sec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    clone.isDynamic = true;
    clone.globalId = globalId;

    const list = [...sections];
    if (typeof index === 'number' && index >= 0 && index <= list.length) {
      list.splice(index, 0, clone);
    } else {
      list.push(clone);
    }

    const nextPages = pages.map((p) => (p.id === currentPageId ? { ...p, sections: list } : p));
    set({ sections: list, pages: nextPages, selectedSectionId: clone.id, selectedElementId: null });
  },

  copySection: (sectionId) => {
    const { sections, selectedSectionId } = get();
    const id = sectionId || selectedSectionId;
    if (!id) return;
    const target = sections.find((s) => s.id === id);
    if (target) {
      set({ clipboardSection: JSON.parse(JSON.stringify(target)) });
    }
  },

  pasteSection: (index) => {
    const { clipboardSection, sections, pages, currentPageId } = get();
    if (!clipboardSection) return;
    get().saveHistory();

    const clone = Du(clipboardSection);
    const list = [...sections];
    if (typeof index === 'number' && index >= 0 && index <= list.length) {
      list.splice(index, 0, clone);
    } else {
      list.push(clone);
    }

    const nextPages = pages.map((p) => (p.id === currentPageId ? { ...p, sections: list } : p));
    set({ sections: list, pages: nextPages, selectedSectionId: clone.id, selectedElementId: null });
  },

  loadProjectFile: (file) => {
    if (file.pages && file.pages.length > 0) {
      const activeId = file.currentPageId || file.pages[0].id;
      const curPage = file.pages.find((p) => p.id === activeId) || file.pages[0];
      set({
        projectName: file.name || 'Imported Project',
        pages: file.pages,
        currentPageId: activeId,
        sections: curPage.sections,
        globalSections: file.globalSections || {},
        siteWidth: normalizeSiteWidth(file.siteWidth),
        past: [],
        future: []
      });
    } else if (file.sections && file.sections.length > 0) {
      const homePage = { id: 'page-home', name: 'Home', slug: '/', sections: file.sections };
      set({
        projectName: file.name || 'Imported Project',
        pages: [homePage],
        currentPageId: 'page-home',
        sections: file.sections,
        globalSections: file.globalSections || {},
        siteWidth: normalizeSiteWidth(file.siteWidth),
        past: [],
        future: []
      });
    }
  },

  // UNIVERSAL MOVE ELEMENT
  // Supports moving elements between regular columns, across sections, AND inside/outside innerrow columns!
  moveElement: (elementId, targetSecOrRowId, targetColId, targetIndex) => {
    get().saveHistory();
    let foundEl = null;
    let srcCol = null;
    let srcIdx = -1;

    // 1. Recursive extraction from anywhere
    const extractElement = (elements) => {
      if (!Array.isArray(elements)) return [];
      const idx = elements.findIndex((el) => el.id === elementId);
      if (idx !== -1) {
        foundEl = JSON.parse(JSON.stringify(elements[idx]));
        srcIdx = idx;
        return elements.filter((el) => el.id !== elementId);
      }
      return elements.map((item) => {
        if (item.type === 'innerrow') {
          const cols = item.content?.columns || item.content?.innerColumns;
          if (Array.isArray(cols)) {
            return {
              ...item,
              content: {
                ...item.content,
                columns: cols.map((col) => {
                  const subIdx = (col.elements || []).findIndex((el) => el.id === elementId);
                  if (subIdx !== -1) {
                    foundEl = JSON.parse(JSON.stringify(col.elements[subIdx]));
                    srcCol = col.id;
                    srcIdx = subIdx;
                    return {
                      ...col,
                      elements: col.elements.filter((el) => el.id !== elementId)
                    };
                  }
                  return col;
                })
              }
            };
          }
        }
        return item;
      });
    };

    const stripFromCols = (cols) => {
      return (cols || []).map((col) => {
        const idx = (col.elements || []).findIndex((el) => el.id === elementId);
        if (idx !== -1) {
          foundEl = JSON.parse(JSON.stringify(col.elements[idx]));
          srcCol = col.id;
          srcIdx = idx;
          return { ...col, elements: col.elements.filter((el) => el.id !== elementId) };
        }
        return { ...col, elements: extractElement(col.elements) };
      });
    };

    const secsWithout = get().sections.map((sec) => {
      const newCols = stripFromCols(sec.columns || []);
      const rowList = sec.rows && sec.rows.length > 0 ? sec.rows : [{ id: `${sec.id}-row-0`, columns: sec.columns || [] }];
      const newRows = rowList.map((rw) => ({
        ...rw,
        columns: stripFromCols(rw.columns || [])
      }));
      return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
    });

    if (!foundEl) return;

    let adjustedIndex = targetIndex;
    if (srcCol === targetColId && typeof adjustedIndex === 'number' && srcIdx !== -1 && srcIdx < adjustedIndex) {
      adjustedIndex = adjustedIndex - 1;
    }

    // 2. Insert into target column (could be a top-level column OR an inner column)
    const insertIntoList = (elements) => {
      if (!Array.isArray(elements)) return [];
      return elements.map((item) => {
        if (item.type === 'innerrow') {
          const cols = item.content?.columns || item.content?.innerColumns;
          if (Array.isArray(cols)) {
            return {
              ...item,
              content: {
                ...item.content,
                columns: cols.map((col) => {
                  if (col.id === targetColId) {
                    const list = [...(col.elements || [])];
                    if (typeof adjustedIndex === 'number' && adjustedIndex >= 0 && adjustedIndex <= list.length) {
                      list.splice(adjustedIndex, 0, foundEl);
                    } else {
                      list.push(foundEl);
                    }
                    return { ...col, elements: list };
                  }
                  return col;
                })
              }
            };
          }
        }
        return item;
      });
    };

    const insertIntoCol = (col) => {
      if (col.id === targetColId) {
        const list = [...(col.elements || [])];
        if (typeof adjustedIndex === 'number' && adjustedIndex >= 0 && adjustedIndex <= list.length) {
          list.splice(adjustedIndex, 0, foundEl);
        } else {
          list.push(foundEl);
        }
        return { ...col, elements: list };
      }
      return { ...col, elements: insertIntoList(col.elements) };
    };

    const secsWith = secsWithout.map((sec) => {
      const rowList = sec.rows && sec.rows.length > 0 ? sec.rows : [{ id: `${sec.id}-row-0`, columns: sec.columns || [] }];
      const newRows = rowList.map((rw) => ({
        ...rw,
        columns: (rw.columns || []).map(insertIntoCol)
      }));
      const newCols = (sec.columns || []).map(insertIntoCol);
      return { ...sec, columns: newRows[0]?.columns || newCols, rows: newRows };
    });

    const newPages = get().pages.map((p) => (p.id === get().currentPageId ? { ...p, sections: secsWith } : p));
    set({ sections: secsWith, pages: newPages, selectedElementId: elementId });
  },

  saveProject: async (downloadFile = false) => {
    const state = get();
    const updatedPages = state.pages.map((p) =>
      p.id === state.currentPageId ? { ...p, sections: state.sections } : p
    );
    const savedTime = new Date().toISOString();
    const siteId = state.siteId || `site-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const projectData = {
      id: siteId,
      version: '1.0.0',
      name: state.projectName || 'NextForge Project',
      siteWidth: normalizeSiteWidth(state.siteWidth),
      customSiteWidth: state.customSiteWidth || '1200px',
      pages: updatedPages,
      currentPageId: state.currentPageId,
      globalSections: state.globalSections || {},
      collections: state.collections || [],
      submissions: state.submissions || [],
      savedAt: savedTime
    };

    // Save to IndexedDB (primary) and LocalStorage (secondary fallback)
    await saveProjectToStorage(projectData);

    // Keep the multi-site dashboard library in sync on every save/autosave
    try {
      await saveSite(projectData);
    } catch (err) {
      console.warn('[NextForge Store] saveSite sync failed:', err);
    }

    set({ pages: updatedPages, lastSavedAt: savedTime, siteId });

    if (downloadFile) {
      try {
        const jsonStr = JSON.stringify(projectData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeName = (state.projectName || 'nextforge-project')
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, '-');
        a.href = url;
        a.download = `${safeName}.project.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Download project file error:', err);
      }
    }

    return projectData;
  }
}));
