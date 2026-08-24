/**
 * The intro's art is stock, and stock art gets swapped. These guard the two
 * things that break silently when it does: a colour the map has no entry for
 * would keep its shipped crimson, and a name with no file would render blank.
 *
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  Illustration,
  PALETTE_MAPS,
  SOURCES,
  type Illustrated,
} from '../src/components/Illustration';
import { ThemeProvider } from '../src/components/ThemeContext';
import { dark, light } from '../src/theme';

const NAMES = Object.keys(SOURCES) as Illustrated[];

/** Every static fill and stroke colour in a Lottie document, as hex. */
const coloursIn = (node: unknown, found: string[] = []): string[] => {
  if (Array.isArray(node)) {
    node.forEach(v => coloursIn(v, found));
    return found;
  }
  if (!node || typeof node !== 'object') return found;
  const n = node as Record<string, any>;
  if ((n.ty === 'fl' || n.ty === 'st') && typeof n.c?.k?.[0] === 'number') {
    found.push(
      `#${n.c.k
        .slice(0, 3)
        .map((v: number) =>
          Math.round(v * 255)
            .toString(16)
            .padStart(2, '0'),
        )
        .join('')}`.toUpperCase(),
    );
  }
  Object.values(n).forEach(v => coloursIn(v, found));
  return found;
};

test.each(NAMES)('%s has a mapping for every colour it uses', name => {
  const used = new Set(coloursIn(SOURCES[name]));
  const mapped = new Set(Object.keys(PALETTE_MAPS[name]));
  expect([...used].filter(hex => !mapped.has(hex))).toEqual([]);
});

/** Render the art under a palette and read back the source Lottie was handed. */
const paint = async (name: Illustrated, palette: typeof dark) => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <ThemeProvider palette={palette}>
        <Illustration name={name} />
      </ThemeProvider>,
    );
  });
  return coloursIn(tree!.root.findByProps({ testID: 'lottie' }).props.source);
};

test.each(NAMES)('%s keeps no stock colour once repainted', async name => {
  const stock = new Set(coloursIn(SOURCES[name]));

  for (const palette of [dark, light]) {
    const painted = await paint(name, palette);

    // The document still carries every fill it started with, and not one of
    // them came through in the colour it shipped in.
    expect(painted).toHaveLength(coloursIn(SOURCES[name]).length);
    expect(painted.filter(hex => stock.has(hex))).toEqual([]);
  }
});

test('repainting leaves the original document untouched', async () => {
  const before = JSON.stringify(SOURCES['making-notes']);
  await paint('making-notes', light);
  expect(JSON.stringify(SOURCES['making-notes'])).toBe(before);
});
