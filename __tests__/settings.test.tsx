/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsScreen } from '../src/screens/SettingsScreen';
import { prepare } from '../src/db/schema';
import { nodeDriver } from '../testing/nodeDriver';
import { settingDefs, sweepTimePresets, sweepTimes } from '../src/data';
import { useStilldo, type Stilldo } from '../src/useStilldo';
import type { SweepAlarm } from '../src/useSweepAlarm';

const act = ReactTestRenderer.act;

// The sheet reads safe-area insets, exactly as it does inside the real app.
const METRICS = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 59, left: 0, right: 0, bottom: 34 },
};

const allowed: SweepAlarm = {
  permitted: true,
  error: null,
  openSettings: () => {},
};

async function mount(alarm: SweepAlarm = allowed) {
  const db = nodeDriver();
  await prepare(db);
  const ref: { current: Stilldo } = { current: null as unknown as Stilldo };
  let tree: ReactTestRenderer.ReactTestRenderer;
  const Host = () => {
    const s = useStilldo(db);
    ref.current = s;
    return s.ready ? <SettingsScreen s={s} alarm={alarm} /> : null;
  };
  await act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>
        <Host />
      </SafeAreaProvider>,
    );
  });
  return { ref, tree: tree!, db };
}

/**
 * Find a control by its own label. Matching on "has a descendant with this
 * text" is not enough: the sheet's scrim wraps every label in the panel.
 */
const control = (tree: ReactTestRenderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(n => !!n.props.accessibilityRole).find(n => {
    const own = n.findAllByType(Text);
    return own.length === 1 && own[0].props.children === label;
  });

const wheel = (tree: ReactTestRenderer.ReactTestRenderer) =>
  tree.root.findAll(n => !!n.props.onMomentumScrollEnd)[0];

const rowFor = (tree: ReactTestRenderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAll(n => n.props.accessibilityRole === 'button')
    .find(n => String(n.props.accessibilityLabel ?? '').startsWith(label))!;

test('every half hour of the day is offered', () => {
  expect(sweepTimes).toHaveLength(48);
  expect(sweepTimes[0]).toBe('00:00');
  expect(sweepTimes[1]).toBe('00:30');
  expect(sweepTimes[47]).toBe('23:30');
  expect(new Set(sweepTimes).size).toBe(48);
  // The times the app already had must still be reachable.
  for (const t of ['19:30', '21:00', '22:30']) expect(sweepTimes).toContain(t);
  // Onboarding's quick choices are a subset of the full list.
  for (const t of sweepTimePresets) expect(sweepTimes).toContain(t);
});

test('tapping "Sweep at" opens the wheel rather than cycling', async () => {
  const { ref, tree } = await mount();
  expect(ref.current.settings.sweepTime).toBe('21:00');

  await act(async () => rowFor(tree, 'Sweep at').props.onPress());

  // The value has not moved — a wheel has opened instead.
  expect(ref.current.settings.sweepTime).toBe('21:00');
  expect(control(tree, '03:30')).toBeTruthy();
  expect(control(tree, '23:30')).toBeTruthy();
});

test('the wheel opens on the current value, not at midnight', async () => {
  const { ref, tree } = await mount();
  await act(async () => rowFor(tree, 'Sweep at').props.onPress());

  // Composite and host nodes both carry the state, so dedupe the labels.
  const chosen = new Set(
    tree.root
      .findAll(n => n.props.accessibilityState?.selected === true)
      .flatMap(n => n.findAllByType(Text).map(t => t.props.children)),
  );
  expect([...chosen]).toEqual([ref.current.settings.sweepTime]);
});

test('settling the wheel on a time sets it', async () => {
  const { ref, tree, db } = await mount();
  await act(async () => rowFor(tree, 'Sweep at').props.onPress());

  // 06:30 is the thirteenth row, and rows are 46pt tall.
  await act(async () =>
    wheel(tree).props.onMomentumScrollEnd({
      nativeEvent: { contentOffset: { y: 13 * 46 } },
    }),
  );

  expect(ref.current.settings.sweepTime).toBe('06:30');

  // ...and it is the value a cold launch reads back.
  const reopened = { current: null as unknown as Stilldo };
  const Probe = () => {
    reopened.current = useStilldo(db);
    return null;
  };
  await act(async () => {
    ReactTestRenderer.create(<Probe />);
  });
  expect(reopened.current.settings.sweepTime).toBe('06:30');
});

test('a visible row can be tapped instead of scrolled to', async () => {
  const { ref, tree } = await mount();
  await act(async () => rowFor(tree, 'Sweep at').props.onPress());
  await act(async () => control(tree, '20:30')!.props.onPress());

  expect(ref.current.settings.sweepTime).toBe('20:30');
});

test('the wheel stays open until Done, and Done changes nothing', async () => {
  const { ref, tree } = await mount();
  await act(async () => rowFor(tree, 'Sweep at').props.onPress());
  await act(async () => control(tree, '20:30')!.props.onPress());
  // Still open — the wheel is meant to be turned more than once.
  expect(control(tree, '03:30')).toBeTruthy();

  await act(async () => control(tree, 'Done')!.props.onPress());
  expect(control(tree, '03:30')).toBeUndefined();
  expect(ref.current.settings.sweepTime).toBe('20:30');
});

test('the three-option row still cycles on tap', async () => {
  const { ref, tree } = await mount();
  expect(ref.current.settings.appearance).toBe('System');

  await act(async () => rowFor(tree, 'Appearance').props.onPress());
  expect(ref.current.settings.appearance).toBe('Dark');
  // No sheet for these.
  expect(control(tree, 'Close')).toBeUndefined();

  await act(async () => rowFor(tree, 'Appearance').props.onPress());
  expect(ref.current.settings.appearance).toBe('Light');
});

/**
 * The screen used to offer auto-resurface, a voice, quiet hours, place
 * triggers and a weekly look-back. None of them were ever read by anything, so
 * they are gone; this is here to stop one drifting back in unimplemented.
 */
test('Settings offers nothing the app does not actually do', async () => {
  const { tree } = await mount();
  const shown = settingDefs.map(d => d.label);
  expect(shown).toEqual(['Sweep at', 'Appearance']);

  for (const gone of [
    'Auto-resurface',
    'Voice',
    'Quiet after 22:30',
    'Place triggers',
    'Weekly look-back',
  ]) {
    expect(rowFor(tree, gone)).toBeUndefined();
  }
});

describe('what Settings admits about the alarm', () => {
  const blocked = (tree: ReactTestRenderer.ReactTestRenderer) =>
    tree.root
      .findAll(n => n.props.accessibilityRole === 'button')
      .find(n => n.props.accessibilityLabel === 'Turn on notifications');

  test('a permitted sweep says nothing extra', async () => {
    const { tree } = await mount();
    expect(blocked(tree)).toBeUndefined();
  });

  test('a blocked sweep owns up, rather than quietly promising a time', async () => {
    const { tree } = await mount({ ...allowed, permitted: false });
    expect(blocked(tree)).toBeTruthy();
  });

  test('the notice is the way into the system switch', async () => {
    const openSettings = jest.fn();
    const { tree } = await mount({ ...allowed, permitted: false, openSettings });

    await act(async () => blocked(tree)!.props.onPress());
    expect(openSettings).toHaveBeenCalled();
  });

  test('an unanswered permission holds its tongue until the answer lands', async () => {
    const { tree } = await mount({ ...allowed, permitted: null });
    expect(blocked(tree)).toBeUndefined();
  });
});
