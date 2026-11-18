// FTC mobile design tokens — taken from the live portal (ftcksu.com/portal)
// and the Foundations artboard of the design.
// Single source of truth: never hard-code colours in components.

// Accent hues with the lighter shades the screens use for text on tinted
// backgrounds (Tailwind 100–300 scale, as in the portal).
export const hue = {
  amber: { base: '#FBBF24', s300: '#FCD34D', s200: '#FDE68A' },
  orange: { base: '#FB923C', s300: '#FDBA74', s200: '#FED7AA', s100: '#FFEDD5' },
  green: { base: '#4ADE80', s300: '#86EFAC', s200: '#BBF7D0' },
  red: { base: '#F87171', s300: '#FCA5A5', s200: '#FECACA' },
  blue: { base: '#60A5FA', s300: '#93C5FD' },
  pink: { base: '#F472B6', s300: '#F9A8D4' },
  teal: { base: '#5EEAD4' },
} as const;

export const color = {
  // surfaces
  bg: '#0C0A18',
  surface: '#16132A',
  raised: '#221D3D',
  nav: '#1A1630',
  navGlass: 'rgba(26,22,48,0.96)',
  barGlass: 'rgba(12,10,24,0.96)', // sticky CTA bar at the bottom of detail screens
  warnSurface: '#2A2140', // offline banner
  pinnedSurface: '#211A42', // pinned «ترتيبك هالشهر» row on the leaderboard
  line: '#2B2550',
  lineStrong: '#3A335C',
  scrim: 'rgba(6,4,14,0.74)', // behind bottom sheets
  track: 'rgba(255,255,255,0.06)', // progress bar track

  // text
  ink: '#F4F1FF',
  inkSecondary: '#CFC9E6',
  inkSoft: '#9A93B8', // minimum for readable text (also input placeholders)
  inkMuted: '#6B6488', // decorative only (dividers, disabled glyphs)
  tabInactive: '#8E87AB',
  onBrand: '#FFFFFF', // text and icons on brand-filled buttons
  avatarGlyph: '#E4DEF8', // person glyph on my own avatar, inline code

  // brand purples
  brand: '#7449C2', // primary buttons
  accent: '#B49BF5', // links, icons
  highlight: '#C4A5FF',
  glow: '#C084FC', // unread dots, emphasis word in headline
  brandTint: 'rgba(116,73,194,0.22)', // selected tab / icon tiles
  brandTintSoft: 'rgba(116,73,194,0.12)', // unread notification card
  brandBorder: 'rgba(180,155,245,0.3)',

  danger: hue.red.base,
  dangerText: hue.red.s300, // error messages and destructive button labels
} as const;

// A member's state inside a task (same values as the portal).
// `fg` is the dot / icon colour, `text` the chip label colour.
export const taskState = {
  working: { fg: '#9A93B8', text: '#CFC9E6', label: 'شغّال عليها' },
  submitted: { fg: hue.amber.base, text: hue.amber.s300, label: 'بانتظار الاعتماد' },
  returned: { fg: hue.orange.base, text: hue.orange.s300, label: 'مرجّعة لك' },
  approved: { fg: hue.green.base, text: hue.green.s300, label: 'معتمدة' },
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
// `text` = chip label colour (a lighter shade of `fg`); chip background = tint(fg, 0.14),
// except tech, which uses the brand tint as in the artboards. projects/finance text shades
// are not in any artboard yet (slate-300 / yellow-300 picked to match the others).
export const committee = {
  tech: {
    fg: '#B49BF5',
    text: '#C4A5FF',
    bg: 'rgba(116,73,194,0.18)',
    label: 'التقنية',
    icon: 'Code',
  },
  events: { fg: '#F472B6', text: '#F9A8D4', label: 'الفعاليات', icon: 'PartyPopper' },
  innovation: { fg: '#FBBF24', text: '#FCD34D', label: 'الابتكار', icon: 'Lightbulb' },
  pr: { fg: '#60A5FA', text: '#93C5FD', label: 'العلاقات العامة', icon: 'Handshake' },
  media: { fg: '#FB923C', text: '#FDBA74', label: 'الإعلامية', icon: 'Megaphone' },
  hr: { fg: '#4ADE80', text: '#86EFAC', label: 'الموارد البشرية', icon: 'Users' },
  projects: { fg: '#94A3B8', text: '#CBD5E1', label: 'إدارة المشاريع', icon: 'FolderKanban' },
  finance: { fg: '#FACC15', text: '#FDE047', label: 'المالية', icon: 'Wallet' },
} as const;

// Avatar ring by gender (as in the portal)
export const avatarRing = { female: '#F0ABFC', male: '#93C5FD' } as const;

// Tinted background for any accent colour: tint('#4ADE80', 0.14)
export function tint(hex: string, alpha = 0.14): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  card: 18,
  sheet: 28,
  pill: 999,
  device: 44,
} as const;
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
} as const;
export type FontWeight = keyof typeof font.family;

// Type scale from the Foundations artboard (size / weight / line height).
// Screens sometimes use a nearby size; when an artboard differs, the artboard wins
// and the component passes its own size.
export const type = {
  display: { fontSize: 30, lineHeight: 41, weight: 'extrabold' }, // 30/800 · 1.35
  title: { fontSize: 22, lineHeight: 32, weight: 'extrabold' }, // 22/800 · 1.45 tab headline
  // Screens leave these line heights unset, so Cairo's default (~1.875) applies; the
  // artboards win over Foundations' 1.5 here.
  heading: { fontSize: 17, lineHeight: 32, weight: 'bold' }, // 17/700 section heading
  header: { fontSize: 16, lineHeight: 30, weight: 'bold' }, // stack header title
  cardTitle: { fontSize: 15.5, lineHeight: 23, weight: 'bold' }, // 15.5/700 · 1.5
  body: { fontSize: 14.5, lineHeight: 26, weight: 'regular' }, // 14.5/400 · 1.8
  meta: { fontSize: 13, lineHeight: 24, weight: 'medium' }, // 13/500
  chip: { fontSize: 12, lineHeight: 22, weight: 'semibold' },
  caption: { fontSize: 11.5, lineHeight: 22, weight: 'semibold' }, // 11.5/600 tab labels
  stat: { fontSize: 22, lineHeight: 31, weight: 'extrabold' },
} as const satisfies Record<string, { fontSize: number; lineHeight: number; weight: FontWeight }>;
export type TypeVariant = keyof typeof type;

export const shadow = {
  nav: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  brandButton: {
    shadowColor: '#7449C2',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  sheet: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: -20 },
    elevation: 24,
  },
  banner: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
} as const;
