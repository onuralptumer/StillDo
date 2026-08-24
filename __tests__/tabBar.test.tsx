/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { TabBar } from '../src/components/TabBar';
import { tabs } from '../src/data';
import type { Screen } from '../src/types';

const render = (
  active: Screen,
  onSelect: (screen: Screen) => void = () => {},
) => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <TabBar active={active} onSelect={onSelect} />,
    );
  });
  return tree!;
};

const labels = (tree: ReactTestRenderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map(t => t.props.children);

/**
 * Composite and host nodes both carry accessibilityRole, so match on the one
 * that actually owns the press handler.
 */
const tabNodes = (tree: ReactTestRenderer.ReactTestRenderer) =>
  tree.root.findAll(
    n =>
      n.props.accessibilityRole === 'tab' &&
      typeof n.props.onPress === 'function',
  );

test('every tab is present and reachable', () => {
  const tree = render('today');
  const names = tabNodes(tree).map(n => n.props.accessibilityLabel);
  expect(names).toEqual(tabs.map(([, label]) => label));
});

test('only the active tab says its name', () => {
  expect(labels(render('today'))).toEqual(['Today']);
  expect(labels(render('sweep'))).toEqual(['Sweep']);
});

test('settings is not a tab — it is reached from the header gear', () => {
  const tree = render('today');
  const names = tabNodes(tree).map(n => n.props.accessibilityLabel);
  expect(names).not.toContain('Settings');
  // On the settings screen there is simply no tab lit, rather than a wrong one.
  expect(labels(render('settings'))).toEqual([]);
  expect(
    tabNodes(render('settings')).filter(
      n => n.props.accessibilityState.selected,
    ),
  ).toHaveLength(0);
});

test('the inactive tabs are marks alone, but still named for a screen reader', () => {
  const tree = render('sweep');
  const inactive = tabNodes(tree).filter(
    n => !n.props.accessibilityState.selected,
  );
  expect(inactive).toHaveLength(2);
  for (const node of inactive) {
    expect(node.findAllByType(Text)).toHaveLength(0);
    expect(node.props.accessibilityLabel).toBeTruthy();
  }
});

test('selection is announced, not just drawn', () => {
  const tree = render('inbox');
  const selected = tabNodes(tree).filter(
    n => n.props.accessibilityState.selected,
  );
  expect(selected).toHaveLength(1);
  expect(selected[0].props.accessibilityLabel).toBe('Inbox');
});

test('tapping a tab asks for that screen', () => {
  const asked: string[] = [];
  const tree = render('today', screen => {
    asked.push(screen);
  });
  for (const node of tabNodes(tree)) node.props.onPress();
  expect(asked).toEqual(['today', 'inbox', 'sweep']);
});

test('a detail view keeps the tab it was opened from lit', () => {
  // App passes the origin screen, never 'detail' itself.
  expect(labels(render('inbox'))).toEqual(['Inbox']);
});
