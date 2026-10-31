export interface VideoEmbedInfo {
  type: 'youtube' | 'vimeo' | 'html5' | 'empty';
  embedUrl?: string;
  videoId?: string;
  sourceUrl?: string;
}

export function parseVideoUrl(
  rawUrl: string = '',
  options: {
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
    muted?: boolean;
    buttonless?: boolean;
  } = {}
): VideoEmbedInfo {
  let url = (rawUrl || '').trim();
  if (!url) {
    return { type: 'empty' };
  }

  // Handle if user pasted an entire <iframe> embed code snippet
  const iframeSrcMatch = url.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    url = iframeSrcMatch[1].trim();
  }

  const {
    autoplay = false,
    controls = true,
    loop = false,
    muted = false,
    buttonless = false
  } = options;

  // In buttonless mode, controls are hidden, and it autoplays in a loop
  const effAutoplay = buttonless || autoplay;
  const effControls = buttonless ? false : controls;
  const effLoop = buttonless || loop;
  const effMuted = Boolean(muted);

  // 1. YouTube Match: Handles watch?v=, embed/, youtu.be/, shorts/, or direct 11-char ID
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  let ytMatch = url.match(ytRegex);

  // Bare YouTube 11-char alphanumeric ID
  if (!ytMatch && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
    ytMatch = [url, url];
  }

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const params = new URLSearchParams();
    if (effAutoplay) params.set('autoplay', '1');
    if (effMuted) params.set('mute', '1');
    params.set('controls', effControls ? '1' : '0');
    if (effLoop) {
      params.set('loop', '1');
      params.set('playlist', videoId);
    }
    params.set('playsinline', '1');
    params.set('rel', '0');
    params.set('modestbranding', '1');
    params.set('enablejsapi', '1');

    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?${params.toString()}`,
      sourceUrl: url
    };
  }

  // 2. Vimeo Match
  // Matches: vimeo.com/ID or player.vimeo.com/video/ID
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i;
  const vimeoMatch = url.match(vimeoRegex);

  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    const params = new URLSearchParams();
    if (effAutoplay) params.set('autoplay', '1');
    if (effMuted) params.set('muted', '1');
    if (effLoop) params.set('loop', '1');
    params.set('controls', effControls ? '1' : '0');
    params.set('api', '1');
    if (buttonless && effMuted) params.set('background', '1');

    return {
      type: 'vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?${params.toString()}`,
      sourceUrl: url
    };
  }

  // 3. Direct HTML5 video (.mp4, .webm, .ogg, data:, blob:, or any URL)
  return {
    type: 'html5',
    embedUrl: url,
    sourceUrl: url
  };
}

export interface VideoMaskShape {
  id: string;
  name: string;
  clipPath: string;
  previewSvg: string; // inline SVG path or rect for inspector preview
}

export const VIDEO_MASK_SHAPES: VideoMaskShape[] = [
  {
    id: 'none',
    name: 'Default (None)',
    clipPath: 'none',
    previewSvg: '<rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor"/>'
  },
  {
    id: 'circle',
    name: 'Circle',
    clipPath: 'circle(50% at 50% 50%)',
    previewSvg: '<circle cx="12" cy="12" r="10" fill="currentColor"/>'
  },
  {
    id: 'ellipse',
    name: 'Ellipse',
    clipPath: 'ellipse(50% 40% at 50% 50%)',
    previewSvg: '<ellipse cx="12" cy="12" rx="10" ry="7" fill="currentColor"/>'
  },
  {
    id: 'triangle',
    name: 'Triangle',
    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    previewSvg: '<polygon points="12,2 2,22 22,22" fill="currentColor"/>'
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    previewSvg: '<polygon points="6,2 18,2 23,12 18,22 6,22 1,12" fill="currentColor"/>'
  },
  {
    id: 'octagon',
    name: 'Octagon',
    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
    previewSvg: '<polygon points="7,2 17,2 22,7 22,17 17,22 7,22 2,17 2,7" fill="currentColor"/>'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    previewSvg: '<polygon points="12,2 22,12 12,22 2,12" fill="currentColor"/>'
  },
  {
    id: 'star',
    name: '5-Point Star',
    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    previewSvg: '<polygon points="12,1 15,8 23,8 17,13 19,21 12,16 5,21 7,13 1,8 9,8" fill="currentColor"/>'
  },
  {
    id: 'shield',
    name: 'Shield / Badge',
    clipPath: 'polygon(50% 0%, 100% 20%, 85% 82%, 50% 100%, 15% 82%, 0% 20%)',
    previewSvg: '<polygon points="12,2 22,6 19,19 12,23 5,19 2,6" fill="currentColor"/>'
  },
  {
    id: 'blob',
    name: 'Organic Blob',
    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
    previewSvg: '<polygon points="7,2 17,2 22,7 22,17 17,22 7,22 2,17 2,7" fill="currentColor"/>'
  },
  {
    id: 'bubble',
    name: 'Message Bubble',
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 78%, 70% 78%, 70% 100%, 48% 78%, 0% 78%)',
    previewSvg: '<polygon points="1,2 23,2 23,17 16,17 16,22 11,17 1,17" fill="currentColor"/>'
  },
  {
    id: 'heart',
    name: 'Heart',
    clipPath: 'polygon(50% 20%, 65% 5%, 85% 5%, 100% 22%, 100% 45%, 50% 95%, 0% 45%, 0% 22%, 15% 5%, 35% 20%)',
    previewSvg: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>'
  }
];

export function getClipPathForShape(shapeId: string = 'none'): string {
  const shape = VIDEO_MASK_SHAPES.find((s) => s.id === shapeId);
  return shape ? shape.clipPath : 'none';
}

export function getVideoOverlayCss(styles: Record<string, any>): {
  background: string;
  opacity: number;
} | null {
  const overlayType = styles?.overlayType || 'none';
  if (overlayType === 'none') return null;

  const rawOpacity = styles?.overlayOpacity !== undefined ? Number(styles.overlayOpacity) : 40;
  const opacity = Math.max(0, Math.min(100, rawOpacity)) / 100;
  const angle = styles?.gradientAngle !== undefined ? styles.gradientAngle : 135;

  if (overlayType === 'solid') {
    return {
      background: styles?.overlayColor || '#000000',
      opacity
    };
  }

  const c1 = styles?.gradientColor1 || '#4f46e5';
  const c2 = styles?.gradientColor2 || '#06b6d4';

  if (overlayType === 'gradient') {
    return {
      background: `linear-gradient(${angle}deg, ${c1}, ${c2})`,
      opacity
    };
  }

  if (overlayType === 'gradient3') {
    const c3 = styles?.gradientColor3 || '#ec4899';
    return {
      background: `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`,
      opacity
    };
  }

  return null;
}
