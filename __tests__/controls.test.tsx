/**
 * `IconButton` drops the word and keeps the mark, which is the one thing that
 * can quietly make a control unreachable — it is now the only way to Settings.
 *
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { IconButton } from '../src/components/controls';
import { GearIcon, TAB_ICONS } from '../src/components/icons';
import { ThemeProvider } from '../src/components/ThemeContext';
import { dark } from '../src/theme';

const render = (node: React.ReactElement) => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <ThemeProvider palette={dark}>{node}</ThemeProvider>,
    );
  });
  return tree!;
};

const press = (tree: ReactTestRenderer.ReactTestRenderer, label: string) =>
  tree.root.findByProps({ accessibilityRole: 'button', accessibilityLabel: label });

test('it draws no word, but still answers to one', () => {
  const tree = render(
    <IconButton icon={GearIcon} label="Settings" onPress={() => {}} />,
  );
  const button = press(tree, 'Settings');

  // The label is the accessible name only — nothing is drawn.
  expect(tree.root.findAllByType(Text)).toHaveLength(0);
  expect(button.props.accessibilityLabel).toBe('Settings');
});

test('pressing it fires once', () => {
  const hits: number[] = [];
  const tree = render(
    <IconButton
      icon={GearIcon}
      label="Settings"
      onPress={() => hits.push(1)}
    />,
  );
  ReactTestRenderer.act(() => press(tree, 'Settings').props.onPress());
  expect(hits).toHaveLength(1);
});

test('a quiet mark recedes until it is pressed', () => {
  const ghost = render(
    <IconButton
      icon={GearIcon}
      label="Settings"
      variant="ghost"
      onPress={() => {}}
    />,
  );
  const primary = render(
    <IconButton icon={GearIcon} label="Settings" onPress={() => {}} />,
  );

  const colourOf = (tree: ReactTestRenderer.ReactTestRenderer) =>
    tree.root.findByType(GearIcon).props.color;

  expect(colourOf(ghost)).toBe(dark.mute);
  expect(colourOf(primary)).toBe(dark.ink);
});

test('the settings mark is the gear', () => {
  expect(TAB_ICONS.settings).toBe(GearIcon);
});
