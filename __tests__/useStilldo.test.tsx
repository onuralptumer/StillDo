/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useStilldo, type Stilldo } from '../src/useStilldo';

/** Renders nothing; just exposes the hook's current value to the test. */
function mount() {
  const ref: { current: Stilldo } = { current: null as unknown as Stilldo };
  const Probe = () => {
    ref.current = useStilldo();
    return null;
  };
  ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<Probe />);
  });
  return ref;
}

const act = (fn: () => void) => ReactTestRenderer.act(fn);

test('seeds six open tasks and one already done', () => {
  const s = mount();
  expect(s.current.openTasks).toHaveLength(6);
  expect(s.current.tasks.filter(t => t.status === 'done')).toHaveLength(1);
});

test('the sweep visits every open task exactly once', () => {
  const s = mount();
  act(() => s.current.actions.startSweep());

  const queued = [...s.current.sweepQueue];
  expect(queued).toHaveLength(6);

  const seen: number[] = [];
  // Resolve every card as done — the case that used to make the queue shrink
  // underneath the cursor and skip the following task.
  for (let i = 0; i < queued.length; i++) {
    expect(s.current.sweepCard).not.toBeNull();
    seen.push(s.current.sweepCard!.id);
    act(() => s.current.actions.advance('done'));
  }

  expect(seen).toEqual(queued);
  expect(s.current.sweepCard).toBeNull();
  expect(s.current.openTasks).toHaveLength(0);
});

test('"move to tomorrow" advances without resolving the task', () => {
  const s = mount();
  act(() => s.current.actions.startSweep());
  const id = s.current.sweepCard!.id;

  act(() => s.current.actions.advance('later'));

  expect(s.current.tasks.find(t => t.id === id)!.status).toBe('open');
  expect(s.current.sweepCard!.id).not.toBe(id);
});

test('revisiting the sweep tab re-arms a finished run but resumes a live one', () => {
  const s = mount();
  act(() => s.current.actions.startSweep());
  act(() => s.current.actions.advance('done'));

  act(() => s.current.actions.go('today'));
  act(() => s.current.actions.go('sweep'));
  expect(s.current.sweepIdx).toBe(1);

  while (s.current.sweepCard) {
    act(() => s.current.actions.advance('drop'));
  }
  act(() => s.current.actions.go('sweep'));
  expect(s.current.sweepIdx).toBe(0);
  expect(s.current.sweepQueue).toHaveLength(0);
});

test('captures land in the inbox and typing clears the draft', () => {
  const s = mount();
  const before = s.current.tasks.length;

  act(() => s.current.actions.setDraft('  RING THE VET  '));
  act(() => s.current.actions.addFromDraft());

  expect(s.current.tasks).toHaveLength(before + 1);
  const added = s.current.tasks[s.current.tasks.length - 1];
  expect(added.title).toBe('RING THE VET');
  expect(added.from).toBe('inbox');
  expect(s.current.draft).toBe('');
});

test('an empty draft captures nothing', () => {
  const s = mount();
  const before = s.current.tasks.length;
  act(() => s.current.actions.setDraft('   '));
  act(() => s.current.actions.addFromDraft());
  expect(s.current.tasks).toHaveLength(before);
});

test('resolving from the detail screen returns to where it was opened', () => {
  const s = mount();
  act(() => s.current.actions.go('inbox'));
  act(() => s.current.actions.open(7));
  expect(s.current.screen).toBe('detail');

  act(() => s.current.actions.resolve(7, 'dropped'));
  expect(s.current.screen).toBe('inbox');
  expect(s.current.tasks.find(t => t.id === 7)!.status).toBe('dropped');
});

test('settings cycle through their options and wrap', () => {
  const s = mount();
  const opts = ['21:00', '19:30', '22:30'];
  expect(s.current.settings.sweepTime).toBe('21:00');
  for (const expected of ['19:30', '22:30', '21:00']) {
    act(() => s.current.actions.cycleSetting('sweepTime', opts));
    expect(s.current.settings.sweepTime).toBe(expected);
  }
});
