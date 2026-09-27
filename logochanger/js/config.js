/**
 * Logo Changer - Configuration & Registry
 * Defines standard logos, preset color palettes, portal backgrounds, and export settings.
 */

export const LOGO_REGISTRY = {
  td: {
    id: 'td',
    name: 'Telugu Delicacies',
    subtitle: 'Classic Brandmark',
    file: './logos/td.svg',
    defaultScale: 1,
    defaultColors: {
      'Background Shape': '#eedc29',
      'Letterform Accent': '#d22828'
    },
    targets: [
      { name: 'Background Shape', selector: '#rect1, rect', attr: 'fill', default: '#eedc29' },
      { name: 'Letterform Accent', selector: '#path1, path', attr: 'fill', default: '#d22828' }
    ]
  },
  akshaya: {
    id: 'akshaya',
    name: 'Akshaya Sweets',
    subtitle: 'Dual Tone Script',
    file: './logos/akshaya.svg',
    defaultScale: 1,
    defaultColors: {
      'Top Flourish / Yellow': '#fdf311',
      'Main Script / Green': '#18aa3e'
    },
    targets: [
      { name: 'Top Flourish / Yellow', selector: '#path4', attr: 'fill', default: '#fdf311' },
      { name: 'Main Script / Green', selector: '#path3', attr: 'fill', default: '#18aa3e' }
    ]
  },
  tasty: {
    id: 'tasty',
    name: 'Tasty Pinch',
    subtitle: 'Red & Gold Identity',
    file: './logos/tasty.svg',
    defaultScale: 1,
    defaultColors: {
      'Lettering & Graphic': '#d12525',
      'Border Frame': '#d12525',
      'Card Background': '#fff0c4'
    },
    targets: [
      { name: 'Lettering & Graphic', selector: '#path2, path', attr: 'fill', default: '#d12525' },
      { name: 'Border Frame', selector: '#rect3, rect', attr: 'stroke', default: '#d12525', defaultStrokeWidth: 1 },
      { name: 'Card Background', selector: '#rect3, rect', attr: 'fill', default: '#fff0c4' }
    ]
  },
  teepi: {
    id: 'teepi',
    name: 'Teepi Gurthu',
    subtitle: 'Traditional Confectionery',
    file: './logos/teepi.svg',
    defaultScale: 1,
    defaultColors: {
      'Golden Emblem': '#f0bc54'
    },
    targets: [
      { name: 'Golden Emblem', selector: '#g7 path, path', attr: 'fill', default: '#f0bc54' }
    ]
  }
};

export const COLOR_PALETTES = [
  {
    name: 'Classic Heritage',
    colors: ['#eedc29', '#d22828', '#1e293b']
  },
  {
    name: 'Royal Gold & Velvet',
    colors: ['#fbbf24', '#7f1d1d', '#0f172a']
  },
  {
    name: 'Emerald & Saffron',
    colors: ['#059669', '#f59e0b', '#ffffff']
  },
  {
    name: 'Modern Luxury Monochrome',
    colors: ['#ffffff', '#0f172a', '#94a3b8']
  },
  {
    name: 'Cyberpunk Neon',
    colors: ['#06b6d4', '#ec4899', '#3b82f6']
  },
  {
    name: 'Pastel Confectionery',
    colors: ['#fbcfe8', '#fed7aa', '#bbf7d0']
  }
];

export const PORTAL_BACKGROUNDS = [
  {
    id: 'transparent',
    name: 'Transparent Grid',
    className: 'portal-env-transparent',
    color: 'transparent',
    icon: 'grid'
  },
  {
    id: 'dark-box',
    name: 'Luxury Dark Box',
    className: 'portal-env-dark-box',
    color: '#0d1017',
    icon: 'box'
  },
  {
    id: 'gold-box',
    name: 'Royal Gold Box',
    className: 'portal-env-gold-box',
    color: '#d97706',
    icon: 'gift'
  },
  {
    id: 'kraft-pouch',
    name: 'Brown Kraft Pouch',
    className: 'portal-env-kraft-pouch',
    color: '#c89d66',
    icon: 'archive'
  },
  {
    id: 'clean-white',
    name: 'Crisp White Card',
    className: 'portal-env-clean-white',
    color: '#ffffff',
    icon: 'file'
  },
  {
    id: 'crimson-velvet',
    name: 'Festive Crimson',
    className: 'portal-env-crimson-velvet',
    color: '#450a0a',
    icon: 'heart'
  },
  {
    id: 'emerald-silk',
    name: 'Emerald Silk Box',
    className: 'portal-env-emerald-silk',
    color: '#022c22',
    icon: 'feather'
  }
];
