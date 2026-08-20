/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { TaskRow } from '../src/components/TaskRow';
import { stamp } from '../src/date';
import { demoTasks } from '../testing/fixtures';

const texts = (tree: ReactTestRenderer.ReactTestRenderer) =>
  tree.root
    .findAllByType(Text)
    .map(t => t.props.children)
    .filter((v): v is string => typeof v === 'string');

const render = (task = demoTasks[0]) => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<TaskRow task={task} onPress={() => {}} />);
  });
  return tree!;
};

test('a row shows when it was caught, not how', () => {
  const task = { ...demoTasks[0], source: 'Typed' };
  const rendered = texts(render(task));

  expect(rendered).toContain(stamp(task.caught));
  expect(rendered).not.toContain('Typed');
});

test('the caught line matches what the detail screen shows', () => {
  const task = demoTasks[1];
  expect(texts(render(task))).toContain(stamp(task.caught));
});

test('the inbox variant shows it too', () => {
  const task = { ...demoTasks[0], from: 'inbox' as const };
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <TaskRow task={task} variant="inbox" onPress={() => {}} />,
    );
  });
  expect(texts(tree!)).toContain(stamp(task.caught));
});

test('an open row carries no filler where a due date used to be', () => {
  const rendered = texts(render({ ...demoTasks[0], status: 'open' }));
  expect(rendered).not.toContain('No date yet');
  // Title and caught line, and nothing else.
  expect(rendered).toEqual([demoTasks[0].title, stamp(demoTasks[0].caught)]);
});

test('a finished row still says so', () => {
  expect(texts(render({ ...demoTasks[0], status: 'done' }))).toContain('Done');
});
