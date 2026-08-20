/**
 * Hold-to-speak capture backed by on-device speech recognition
 * (iOS Speech framework / Android SpeechRecognizer).
 *
 * @format
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Voice, {
  type SpeechErrorEvent,
  type SpeechResultsEvent,
} from '@react-native-voice/voice';

export type VoiceCapture = {
  listening: boolean;
  /** Live transcript while the button is held, so you can see it landing. */
  partial: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  dismissError: () => void;
};

/** Recogniser codes that mean "heard nothing", which is not worth an alarm. */
const SILENT = ['7', '6', 'recognition_fail'];

const message = (code: string | undefined) => {
  if (code && SILENT.includes(code)) return 'Did not catch that — hold and try again.';
  if (code === '9' || code === 'permissions') return 'Stilldo needs the microphone to catch it out loud.';
  return 'Speech capture is unavailable on this device.';
};

export function useVoiceCapture(
  onTranscript: (text: string) => void,
): VoiceCapture {
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Everything the native callbacks touch lives in refs, so the listeners can
  // be installed once instead of being torn down on every keystroke.
  const best = useRef('');
  const delivered = useRef(true);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    const clearSettle = () => {
      if (settle.current) {
        clearTimeout(settle.current);
        settle.current = null;
      }
    };

    /** Deliver at most once per hold, whichever callback gets here first. */
    const finish = () => {
      clearSettle();
      if (delivered.current) return;
      delivered.current = true;
      setListening(false);
      const text = best.current.trim();
      setPartial('');
      if (text) onTranscriptRef.current(text);
      else setError('Did not catch that — hold and try again.');
    };
    finishRef.current = finish;

    /** Both platforms report the phrase so far, so the latest one wins. */
    const heard = (e: SpeechResultsEvent) => {
      const t = e.value?.[0];
      if (t) {
        best.current = t;
        setPartial(t);
      }
    };

    Voice.onSpeechStart = () => {
      setListening(true);
      setError(null);
    };
    Voice.onSpeechPartialResults = heard;
    Voice.onSpeechResults = e => {
      heard(e);
      // iOS emits this on *every* intermediate result carrying the transcript
      // so far, so it is an update rather than the end — treating it as the
      // end truncated every capture to its first word. Android's onResults
      // really is the final answer.
      if (Platform.OS !== 'ios') finish();
    };
    Voice.onSpeechEnd = () => {
      // iOS: the recognition task has finished, so what we hold is the whole
      // phrase. Android: this is only onEndOfSpeech — onResults is still to
      // come, and finishing here would drop the last words.
      if (Platform.OS === 'ios') finish();
    };
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      // A "no match" after we already heard something is not a failure.
      if (best.current.trim()) {
        finish();
        return;
      }
      clearSettle();
      delivered.current = true;
      setListening(false);
      setPartial('');
      setError(message(e.error?.code));
    };

    return () => {
      clearSettle();
      Voice.destroy().then(() => Voice.removeAllListeners());
    };
  }, []);

  const start = useCallback(async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setError('Stilldo needs the microphone to catch it out loud.');
        return;
      }
    }
    best.current = '';
    delivered.current = false;
    setPartial('');
    setError(null);
    setListening(true);
    try {
      await Voice.start('en-US');
    } catch {
      delivered.current = true;
      setListening(false);
      setError('Speech capture is unavailable on this device.');
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await Voice.stop();
    } catch {
      // Ignore — the settle timer below still delivers whatever was heard.
    }
    // Neither platform is guaranteed to close the loop after stop(): deliver
    // the best transcript we have rather than dropping the capture.
    if (!delivered.current && !settle.current) {
      settle.current = setTimeout(() => {
        settle.current = null;
        finishRef.current();
      }, 1200);
    }
  }, []);

  const dismissError = useCallback(() => setError(null), []);

  return { listening, partial, error, start, stop, dismissError };
}
