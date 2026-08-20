/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';
import { prepare } from '../src/db/schema';
import { nodeDriver } from '../testing/nodeDriver';
import { useStilldo, type Stilldo } from '../src/useStilldo';
import type { SqlDriver } from '../src/db/driver';

const act = ReactTestRenderer.act;

async function mount(db: SqlDriver) {
  const ref: { current: Stilldo } = { current: null as unknown as Stilldo };
  let tree: ReactTestRenderer.ReactTestRenderer;
  const Host = () => {
    const s = useStilldo(db);
    ref.current = s;
    return s.ready ? <OnboardingScreen s={s} /> : null;
  };
  await act(async () => {
    tree = ReactTestRenderer.create(<Host />);
  });
  return { ref, tree: tree! };
}

const fresh = async () => {
  const db = nodeDriver();
  await prepare(db);
  return db;
};

/** Find a control by the label its own Text renders. */
const button = (tree: ReactTestRenderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAll(n => !!n.props.accessibilityRole)
    .find(n => n.findAllByType(Text).some(t => t.props.children === label))!;

const headings = (tree: ReactTestRenderer.ReactTestRenderer) =>
  tree.root
    .findAllByType(Text)
    .map(t => t.props.children)
    .filter((v): v is string => typeof v === 'string');

test('a fresh database has not been through the intro', async () => {
  const db = await fresh();
  const { ref } = await mount(db);
  expect(ref.current.settings.onboarded).toBe('no');
});

test('the panes advance and the last one starts the app', async () => {
  const db = await fresh();
  const { ref, tree } = await mount(db);

  expect(headings(tree)).toContain('You will\nforget things');
  expect(button(tree, 'Next')).toBeTruthy();

  await act(async () => button(tree, 'Next').props.onPress());
  expect(headings(tree)).toContain('Catch it\nbadly');

  await act(async () => button(tree, 'Next').props.onPress());
  expect(headings(tree)).toContain('One pass,\nevery evening');
  // The final pane offers Start rather than Next.
  expect(headings(tree)).toContain('Start');

  await act(async () => button(tree, 'Start').props.onPress());
  expect(ref.current.settings.onboarded).toBe('yes');
});

test('skipping still counts as having been through it', async () => {
  const db = await fresh();
  const { ref, tree } = await mount(db);

  await act(async () => button(tree, 'Skip').props.onPress());

  expect(ref.current.settings.onboarded).toBe('yes');
});

test('the intro does not come back on the next launch', async () => {
  const db = await fresh();
  const first = await mount(db);
  await act(async () => first.ref.current.actions.finishOnboarding());

  const relaunched = await mount(db);
  expect(relaunched.ref.current.settings.onboarded).toBe('yes');
});

test('the sweep time chosen in the intro is the one the app keeps', async () => {
  const db = await fresh();
  const { ref, tree } = await mount(db);
  expect(ref.current.settings.sweepTime).toBe('21:00');

  await act(async () => button(tree, 'Next').props.onPress());
  await act(async () => button(tree, 'Next').props.onPress());
  await act(async () => button(tree, '19:30').props.onPress());
  await act(async () => button(tree, 'Start').props.onPress());

  expect(ref.current.settings.sweepTime).toBe('19:30');

  const relaunched = await mount(db);
  expect(relaunched.ref.current.settings.sweepTime).toBe('19:30');
});

test('the intro captures nothing — the app still opens empty', async () => {
  const db = await fresh();
  const { ref, tree } = await mount(db);
  await act(async () => button(tree, 'Skip').props.onPress());

  expect(ref.current.tasks).toEqual([]);
});
