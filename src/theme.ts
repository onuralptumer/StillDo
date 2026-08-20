/**
 * Design tokens ported from Stilldo.dc.html.
 *
 * The canvas expresses type in CSS `em` letter-spacing; React Native wants
 * points, so every `letterSpacing` here is `em * fontSize` pre-multiplied.
 *
 * @format
 */

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
};

export const dark: Palette = {
  page: '#0a0503',
  bg: '#100904',
  raise: '#382416',
  raiseHi: '#4a3020',
  accent: '#dc5000',
  ink: '#ffedd7',
  mute: '#6c5f51',
  line: '#40372e',
  tint: 'rgba(255,237,215,.08)',
};

export const light: Palette = {
  page: '#efe8e0',
  bg: '#fbf7f3',
  raise: '#f2e3d3',
  raiseHi: '#e9d4c0',
  accent: '#a83900',
  ink: '#251a11',
  mute: '#6b5949',
  line: '#d9cabb',
  tint: 'rgba(37,26,17,.06)',
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
  card: 12,
  action: 36,
} as const;
