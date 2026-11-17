// FTC mobile design tokens — taken from the live portal (ftcksu.com/portal).
// Single source of truth: never hard-code colours in components.

export const color = {
  // surfaces
  bg: '#0C0A18',
  surface: '#16132A',
  raised: '#221D3D',
  nav: '#1A1630',
  navGlass: 'rgba(26,22,48,0.96)',
  line: '#2B2550',
  lineStrong: '#3A335C',

  // text
  ink: '#F4F1FF',
  inkSecondary: '#CFC9E6',
  inkSoft: '#9A93B8', // minimum for readable text
  inkMuted: '#6B6488', // decorative only (dividers, disabled glyphs)
  tabInactive: '#8E87AB',

  // brand purples
  brand: '#7449C2', // primary buttons
  accent: '#B49BF5', // links, icons
  highlight: '#C4A5FF',
  glow: '#C084FC', // unread dots, emphasis word in headline
  brandTint: 'rgba(116,73,194,0.22)', // selected tab / icon tiles
  brandTintSoft: 'rgba(116,73,194,0.12)', // unread notification card
  brandBorder: 'rgba(180,155,245,0.3)',

  danger: '#F87171',
} as const;

// A member's state inside a task (same values as the portal)
export const taskState = {
  working: { fg: '#9A93B8', label: 'شغّال عليها' },
  submitted: { fg: '#FBBF24', label: 'بانتظار الاعتماد' },
  returned: { fg: '#FB923C', label: 'مرجّعة لك' },
  approved: { fg: '#4ADE80', label: 'معتمدة' },
} as const;
export type TaskState = keyof typeof taskState;

// Leagues per term, by approved hours
export const league = {
  bronze: { fg: '#E8A06A', label: 'البرونزي', min: 0 },
  silver: { fg: '#CBD5E1', label: 'الفضي', min: 10 },
  gold: { fg: '#FBBF24', label: 'الذهبي', min: 30 },
  platinum: { fg: '#5EEAD4', label: 'البلاتيني', min: 60 },
  diamond: { fg: '#B49BF5', label: 'الماسي', min: 90 },
} as const;
export type League = keyof typeof league;

export function leagueFor(hours: number): League {
  if (hours >= 90) return 'diamond';
  if (hours >= 60) return 'platinum';
  if (hours >= 30) return 'gold';
  if (hours >= 10) return 'silver';
  return 'bronze';
}

// Committee keys/labels/icons: confirm against the portal's committee table
// (projects + finance labels and the pr/projects/finance icons are not yet verified).
export const committee = {
  tech: { fg: '#B49BF5', label: 'التقنية', icon: 'Code' },
  events: { fg: '#F472B6', label: 'الفعاليات', icon: 'PartyPopper' },
  innovation: { fg: '#FBBF24', label: 'الابتكار', icon: 'Lightbulb' },
  pr: { fg: '#60A5FA', label: 'العلاقات العامة', icon: 'Handshake' },
  media: { fg: '#FB923C', label: 'الإعلامية', icon: 'Megaphone' },
  hr: { fg: '#4ADE80', label: 'الموارد البشرية', icon: 'Users' },
  projects: { fg: '#94A3B8', label: 'المشاريع', icon: 'FolderKanban' },
  finance: { fg: '#FACC15', label: 'المالية', icon: 'Wallet' },
} as const;

// Avatar ring by gender (as in the portal)
export const avatarRing = { female: '#F0ABFC', male: '#93C5FD' } as const;

// Tinted background for any accent colour: tint('#4ADE80', 0.14)
export function tint(hex: string, alpha = 0.14): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export const radius = { sm: 10, md: 14, lg: 20, card: 18, sheet: 28, pill: 999, device: 44 } as const;
export const space = { gutter: 20, xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const touch = { min: 44 } as const;

export const font = {
  family: {
    regular: 'Cairo_400Regular',
    medium: 'Cairo_500Medium',
    semibold: 'Cairo_600SemiBold',
    bold: 'Cairo_700Bold',
    extrabold: 'Cairo_800ExtraBold',
  },
  // size / lineHeight pairs used across the designs
  size: {
    display: { fontSize: 22, lineHeight: 32 }, // tab headline
    title: { fontSize: 20, lineHeight: 30 },
    h2: { fontSize: 18, lineHeight: 28 },
    header: { fontSize: 16, lineHeight: 24 }, // stack header title
    body: { fontSize: 14, lineHeight: 24 },
    small: { fontSize: 13, lineHeight: 21 },
    caption: { fontSize: 12, lineHeight: 18 },
    tab: { fontSize: 11.5, lineHeight: 16 },
    stat: { fontSize: 22, lineHeight: 31 },
  },
} as const;

export const shadow = {
  nav: { shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 12 }, elevation: 12 },
} as const;
