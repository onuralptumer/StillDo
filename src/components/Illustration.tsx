/**
 * The intro's three illustrations.
 *
 * The source files are stock Lottie exports, each in its own palette — a hard
 * crimson, a product blue, cyan and butter yellow — none of which belong next
 * to Stilldo's warm near-black. Rather than commit a recoloured copy of every
 * file per theme, the art is repainted on the way in: each fill and stroke is
 * looked up in a per-file map and rewritten from the live palette, so one
 * asset reads correctly in both themes and follows the theme when it changes.
 *
 * The maps are written in terms of contrast against the page rather than
 * lightness — `ink` is always the furthest from the background, `raise` the
 * nearest — which is what keeps a figure legible when the palette inverts.
 *
 * @format
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView, { type AnimationObject } from 'lottie-react-native';
import { useTheme } from './ThemeContext';
import type { Palette } from '../theme';

export type Illustrated = 'forget-password' | 'drawkit-notes' | 'making-notes';

export const SOURCES: Record<Illustrated, AnimationObject> = {
  'forget-password': require('../../assets/animations/forget-password.json'),
  'drawkit-notes': require('../../assets/animations/drawkit-notes.json'),
  'making-notes': require('../../assets/animations/making-notes.json'),
};

/** A colour picked from the palette, sometimes part-way between two of them. */
type Tone = (p: Palette) => string;

const channels = (h: string) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

/** `t` of the way from `a` to `b`, both palette lookups. */
const mix =
  (a: Tone, b: Tone, t: number): Tone =>
  p => {
    const from = channels(a(p));
    const to = channels(b(p));
    const step = (i: number) => Math.round(from[i] + (to[i] - from[i]) * t);
    return `#${[0, 1, 2]
      .map(i => step(i).toString(16).padStart(2, '0'))
      .join('')}`;
  };

const ink: Tone = p => p.ink;
const accent: Tone = p => p.accent;
const mute: Tone = p => p.mute;
const line: Tone = p => p.line;
const raise: Tone = p => p.raise;
const raiseHi: Tone = p => p.raiseHi;
const page: Tone = p => p.page;

export const PALETTE_MAPS: Record<Illustrated, Record<string, Tone>> = {
  'forget-password': {
    '#383A45': ink, // hair, outlines, the dress seams
    '#EC1146': accent, // the question marks — the whole point of the frame
    '#F6BC9F': mute, // skin
    '#E9946F': mix(mute, line, 0.55), // skin turned away from the light
    '#547984': line, // creases
    '#4B6D79': mix(line, ink, 0.25), // the deeper crease
    '#FFFAEF': raise, // the dress
    '#D6ECE1': raiseHi, // its lit panel
    '#929895': line, // seam
  },
  'drawkit-notes': {
    '#F8F8F8': raise, // the blob everything sits on
    '#DEDEDE': raiseHi, // the note being written
    '#DE8E68': mute, // skin, arms, hands
    '#FD8369': accent, // hair
    '#FED385': mix(accent, raise, 0.45), // top
    '#FED892': mix(accent, raise, 0.3), // top, lit
    '#74D5DE': ink, // lower body
    '#56CAD8': mix(ink, line, 0.35), // lower body, shaded
    '#000000': ink, // the pencil
  },
  'making-notes': {
    '#0776F1': accent, // board frame, shirt, pen, the ticks
    '#263238': ink, // hair, trousers, outlines
    '#FFC3BD': mute, // skin
    '#ED847E': mix(mute, ink, 0.2), // skin, mid
    '#B55B52': mix(mute, line, 0.5), // skin, shadow
    '#FFFFFF': mix(raise, ink, 0.06), // paper
    '#F5F5F5': raise, // wall
    '#F0F0F0': mix(raise, raiseHi, 0.5), // furniture
    '#EBEBEB': raiseHi, // furniture, nearer
    '#E0E0E0': mix(raiseHi, line, 0.5), // its edges
    '#000000': page, // the drop shadows, all of them at a fifth opacity
  },
};

const toHex = (k: number[]) =>
  `#${k
    .slice(0, 3)
    .map(v =>
      Math.round(Math.max(0, Math.min(1, v)) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`.toUpperCase();

const isStaticColour = (c: unknown): c is { k: number[] } =>
  !!c &&
  typeof c === 'object' &&
  Array.isArray((c as { k?: unknown }).k) &&
  typeof (c as { k: unknown[] }).k[0] === 'number';

/**
 * Clone the document, rewriting every fill and stroke the map names. Lottie
 * holds colour as `[r, g, b, a]` in 0–1; alpha is left as the artist set it.
 */
const repaint = (
  node: unknown,
  swap: (hex: string) => string | null,
): unknown => {
  if (Array.isArray(node)) return node.map(v => repaint(v, swap));
  if (!node || typeof node !== 'object') return node;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    out[key] = repaint(value, swap);
  }

  if ((out.ty === 'fl' || out.ty === 'st') && isStaticColour(out.c)) {
    const colour = out.c;
    const to = swap(toHex(colour.k));
    if (to) {
      const [r, g, b] = channels(to);
      colour.k = [r / 255, g / 255, b / 255, colour.k[3] ?? 1];
    }
  }
  return out;
};

const styles = StyleSheet.create({
  frame: { height: 180, alignSelf: 'stretch' },
  art: { flex: 1, alignSelf: 'stretch' },
});

export const Illustration = ({ name }: { name: Illustrated }) => {
  const c = useTheme();

  const source = useMemo(() => {
    const map = PALETTE_MAPS[name];
    return repaint(SOURCES[name], hex => {
      const tone = map[hex];
      return tone ? tone(c) : null;
    }) as AnimationObject;
  }, [name, c]);

  return (
    <View style={styles.frame} pointerEvents="none">
      <LottieView
        // A fresh mount per pane, so each one plays from its first frame.
        key={name}
        source={source}
        autoPlay
        loop
        resizeMode="contain"
        style={styles.art}
      />
    </View>
  );
};
