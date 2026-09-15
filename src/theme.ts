/** Shared colors, typography, and shapes for the calm Stilldo interface. */

export type Palette = {
  page: string;
  bg: string;
  raise: string;
  raiseHi: string;
  accent: string;
  ink: string;
  mute: string;
  line: string;
  tint: string;
  peach: string;
  sage: string;
  blue: string;
  onAccent: string;
};

export const dark: Palette = {
  page: '#172B29',
  bg: '#172B29',
  raise: '#233B37',
  raiseHi: '#304B44',
  accent: '#A8D5BE',
  ink: '#F9F3E8',
  mute: '#B1C0B7',
  line: '#3C534B',
  tint: 'rgba(168,213,190,.12)',
  peach: '#584139',
  sage: '#304D42',
  blue: '#304653',
  onAccent: '#173A30',
};

export const light: Palette = {
  page: '#F8F5EC',
  bg: '#F8F5EC',
  raise: '#FFFDF8',
  raiseHi: '#EEEADF',
  accent: '#2E6959',
  ink: '#203B36',
  mute: '#65756D',
  line: '#DFE5DA',
  tint: 'rgba(46,105,89,.08)',
  peach: '#F4D0B4',
  sage: '#DCE9D9',
  blue: '#DBE8EF',
  onAccent: '#FFFFFF',
};

/**
 * Weight lives in the family name, not `fontWeight` — setting both makes
 * Android drop the custom face and fall back to Roboto.
 */
export const font = {
  regular: 'HankenGrotesk-Regular',
  medium: 'HankenGrotesk-Medium',
  semibold: 'HankenGrotesk-SemiBold',
} as const;

export const space = {
  gutter: 24,
  section: 31,
  rule: 18,
} as const;

export const radius = {
  pill: 22.5,
  card: 28,
  action: 22,
} as const;
