/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import Voice from '@react-native-voice/voice';
import { launchCamera } from 'react-native-image-picker';
import { InboxScreen } from '../src/screens/InboxScreen';
import { useStilldo, type Stilldo } from '../src/useStilldo';
import { nodeDriver } from '../testing/nodeDriver';
import { prepare } from '../src/db/schema';
import { useVoiceCapture, type VoiceCapture } from '../src/useVoiceCapture';

const act = ReactTestRenderer.act;

/** The recogniser's callbacks, as the hook installed them. */
const handlers = () => Voice as unknown as Record<string, Function>;

/** Find a button by the label its own Text renders. */
const button = (tree: ReactTestRenderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAll(n => !!n.props.accessibilityRole)
    .find(n =>
      n.findAllByType(Text).some(t => t.props.children === label),
    )!;

function mountVoice() {
  const heard: string[] = [];
  const ref: { current: VoiceCapture } = {
    current: null as unknown as VoiceCapture,
  };
  const Probe = () => {
    ref.current = useVoiceCapture(t => heard.push(t));
    return null;
  };
  act(() => {
    ReactTestRenderer.create(<Probe />);
  });
  return { ref, heard };
}

test('a held phrase becomes the transcript', async () => {
  const { ref, heard } = mountVoice();

  await act(async () => {
    await ref.current.start();
  });
  expect(Voice.start).toHaveBeenCalledWith('en-US');

  act(() => handlers().onSpeechPartialResults({ value: ['ring the'] }));
  expect(ref.current.partial).toBe('ring the');
  expect(ref.current.listening).toBe(true);

  act(() => handlers().onSpeechResults({ value: ['ring the vet back'] }));
  act(() => handlers().onSpeechEnd({}));

  expect(heard).toEqual(['ring the vet back']);
  expect(ref.current.listening).toBe(false);
  expect(ref.current.partial).toBe('');
});

test('the whole phrase survives, not just its first word', async () => {
  const { ref, heard } = mountVoice();
  await act(async () => {
    await ref.current.start();
  });

  // iOS emits onSpeechResults repeatedly with the transcript so far. Treating
  // the first one as the end is what truncated captures to a single word.
  act(() => handlers().onSpeechResults({ value: ['ring'] }));
  act(() => handlers().onSpeechResults({ value: ['ring the'] }));
  act(() => handlers().onSpeechResults({ value: ['ring the vet'] }));
  expect(heard).toEqual([]);
  expect(ref.current.listening).toBe(true);

  act(() => handlers().onSpeechResults({ value: ['ring the vet back on Friday'] }));
  act(() => handlers().onSpeechEnd({}));

  expect(heard).toEqual(['ring the vet back on Friday']);
});

test('on Android the final result closes the capture, not end-of-speech', async () => {
  const { Platform, PermissionsAndroid } = require('react-native');
  const original = Platform.OS;
  Platform.OS = 'android';
  const perm = jest
    .spyOn(PermissionsAndroid, 'request')
    .mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
  try {
    const { ref, heard } = mountVoice();
    await act(async () => {
      await ref.current.start();
    });

    act(() => handlers().onSpeechPartialResults({ value: ['bins out'] }));
    // Android fires onEndOfSpeech before onResults; finishing here would drop
    // everything the recogniser had not yet committed.
    act(() => handlers().onSpeechEnd({}));
    expect(heard).toEqual([]);

    act(() => handlers().onSpeechResults({ value: ['bins out before seven'] }));
    expect(heard).toEqual(['bins out before seven']);
  } finally {
    Platform.OS = original;
    perm.mockRestore();
  }
});

test('the transcript is delivered exactly once per hold', async () => {
  const { ref, heard } = mountVoice();
  await act(async () => {
    await ref.current.start();
  });

  act(() => handlers().onSpeechResults({ value: ['book the car in'] }));
  act(() => handlers().onSpeechEnd({}));
  // A trailing "no match" error after a good result must not double-deliver.
  act(() => handlers().onSpeechError({ error: { code: '7' } }));
  act(() => handlers().onSpeechEnd({}));

  expect(heard).toEqual(['book the car in']);
  expect(ref.current.error).toBeNull();
});

test('hearing nothing reports back instead of capturing an empty task', async () => {
  const { ref, heard } = mountVoice();
  await act(async () => {
    await ref.current.start();
  });

  act(() => handlers().onSpeechError({ error: { code: '7' } }));

  expect(heard).toEqual([]);
  expect(ref.current.error).toMatch(/did not catch that/i);
  expect(ref.current.listening).toBe(false);
});

test('a released hold still delivers the best partial when no final arrives', async () => {
  jest.useFakeTimers();
  const { ref, heard } = mountVoice();
  await act(async () => {
    await ref.current.start();
  });
  act(() => handlers().onSpeechPartialResults({ value: ['bins out tonight'] }));

  await act(async () => {
    await ref.current.stop();
  });
  act(() => {
    jest.advanceTimersByTime(1300);
  });

  expect(heard).toEqual(['bins out tonight']);
  jest.useRealTimers();
});

test('a spoken capture lands in the inbox', async () => {
  const db = nodeDriver();
  await prepare(db);
  const ref: { current: Stilldo } = { current: null as unknown as Stilldo };
  let tree: ReactTestRenderer.ReactTestRenderer;
  const Host = () => {
    const s = useStilldo(db);
    ref.current = s;
    return <InboxScreen s={s} />;
  };
  await act(async () => {
    tree = ReactTestRenderer.create(<Host />);
  });

  const before = ref.current.tasks.length;
  // Hold the button, then let the recogniser answer.
  await act(async () => {
    await button(tree!, 'Hold to speak').props.onPressIn();
  });
  act(() => handlers().onSpeechResults({ value: ['chase the plumber'] }));
  act(() => handlers().onSpeechEnd({}));

  expect(ref.current.tasks).toHaveLength(before + 1);
  const added = ref.current.tasks[ref.current.tasks.length - 1];
  expect(added.title).toBe('chase the plumber');
  expect(added.source).toBe('Voice');
  expect(added.from).toBe('inbox');
});

test('a photo is attached to the capture it was taken for', async () => {
  (launchCamera as jest.Mock).mockResolvedValueOnce({
    assets: [{ uri: 'file:///tmp/receipt.jpg' }],
  });

  const db = nodeDriver();
  await prepare(db);
  const ref: { current: Stilldo } = { current: null as unknown as Stilldo };
  let tree: ReactTestRenderer.ReactTestRenderer;
  const Host = () => {
    const s = useStilldo(db);
    ref.current = s;
    return <InboxScreen s={s} />;
  };
  await act(async () => {
    tree = ReactTestRenderer.create(<Host />);
  });

  const before = ref.current.tasks.length;
  // Reach the picker the way the button does, then answer "take a photo".
  const { ActionSheetIOS } = require('react-native');
  const spy = jest
    .spyOn(ActionSheetIOS, 'showActionSheetWithOptions')
    .mockImplementation((...args: unknown[]) =>
      (args[1] as (i: number) => void)(0),
    );

  await act(async () => {
    await button(tree!, 'Snap it').props.onPress();
  });

  expect(ref.current.tasks).toHaveLength(before + 1);
  const added = ref.current.tasks[ref.current.tasks.length - 1];
  expect(added.photoUri).toBe('file:///tmp/receipt.jpg');
  expect(added.source).toBe('Photo');
  spy.mockRestore();
});
