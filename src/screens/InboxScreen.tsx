/**
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../components/ThemeContext';
import { HoldButton, IconButton, OutlineButton } from '../components/controls';
import {
  Display,
  Kicker,
  Lead,
  SectionHeading,
} from '../components/primitives';
import { CaptionSheet, UNCAPTIONED } from '../components/CaptionSheet';
import { CameraIcon, MicIcon, PlusIcon } from '../components/icons';
import { TaskRow } from '../components/TaskRow';
import { font, space } from '../theme';
import type { Stilldo } from '../useStilldo';
import { usePhotoCapture } from '../usePhotoCapture';
import { useVoiceCapture } from '../useVoiceCapture';

const styles = StyleSheet.create({
  page: {
    paddingTop: 14,
    paddingBottom: 40,
    paddingHorizontal: space.gutter,
  },
  display: { marginTop: 10 },
  blurb: { marginTop: 14, maxWidth: 290, opacity: 0.7 },
  field: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  // Pulls the mark's own padding back out, so it sits where the word did.
  add: { marginRight: -4 },
  input: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: 17,
    letterSpacing: 0,
    paddingVertical: 4,
    padding: 0,
  },
  capture: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 9,
  },
  status: {
    marginTop: 12,
    gap: 6,
  },
  statusLabel: {
    fontFamily: font.medium,
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  heard: {
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 18.9,
  },
});

export const InboxScreen = ({ s }: { s: Stilldo }) => {
  const c = useTheme();
  const field = useRef<React.ComponentRef<typeof TextInput>>(null);
  /**
   * The microphone was opened by a widget rather than by a finger held on the
   * button, so there is no release coming to close it. It stays open until it
   * is tapped shut or the recogniser hears the sentence end.
   */
  const [handsFree, setHandsFree] = useState(false);

  const voice = useVoiceCapture(text =>
    s.actions.capture(
      text,
      'Voice',
      'Caught mid-sentence. The sweep will ask what you meant.',
    ),
  );
  /**
   * A shot that has been taken but not yet caught: it is waiting for its
   * caption. The picker hands back a URI and this holds it while the sheet
   * asks what it was of.
   */
  const [snapped, setSnapped] = useState<string | null>(null);
  const photo = usePhotoCapture(setSnapped);

  /** Put the held photo in the inbox, under whatever it has been called. */
  const catchPhoto = (caption: string) => {
    setSnapped(null);
    s.actions.capture(
      caption || UNCAPTIONED,
      'Photo',
      caption
        ? 'A picture, and your own words on it. The sweep will bring it back tonight.'
        : 'A picture is enough. You will recognise it tonight even if you cannot name it now.',
      snapped ?? undefined,
    );
  };
  /**
   * A widget tap arrives as a request on the store, because this is the screen
   * that holds the microphone and the camera. Take it once, then let go of it
   * — leaving it set would reopen the camera on every render.
   */
  const pending = s.pendingCapture;
  useEffect(() => {
    if (!pending) return;
    s.actions.clearCapture();
    if (pending === 'voice') {
      setHandsFree(true);
      voice.start();
    } else if (pending === 'photo') {
      photo.shoot();
    } else {
      field.current?.focus();
    }
    // Only the arrival of a request should run this. The capture hooks are
    // rebuilt on every render, and depending on them would fire it again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  // Whatever ended the recogniser — a tap, a silence, a failure — the button
  // goes back to being one you hold.
  useEffect(() => {
    if (!voice.listening) setHandsFree(false);
  }, [voice.listening]);

  const status = voice.listening
    ? voice.partial
    : voice.error || photo.error || '';
  const list = s.tasks.filter(
    t => t.from === 'inbox' && t.status !== 'dropped',
  );
  const uncategorised = s.tasks.filter(
    t => t.from === 'inbox' && t.status === 'open',
  ).length;

  return (
    <View style={styles.page}>
      <Kicker>Nothing gets sorted here</Kicker>
      <Display style={styles.display}>Inbox</Display>
      <Lead style={styles.blurb}>
        Dump it and look away. The sweep will find it again tonight, so you
        don't have to hold it.
      </Lead>

      <View
        style={[
          styles.field,
          { borderColor: c.line, backgroundColor: c.raise },
        ]}
      >
        <TextInput
          ref={field}
          value={s.draft}
          onChangeText={s.actions.setDraft}
          onSubmitEditing={s.actions.addFromDraft}
          placeholder="What’s on your mind?"
          placeholderTextColor={c.mute}
          autoCapitalize="sentences"
          autoCorrect={false}
          returnKeyType="done"
          style={[styles.input, { color: c.ink }]}
        />
        <IconButton
          icon={PlusIcon}
          label="Add"
          onPress={s.actions.addFromDraft}
          style={styles.add}
        />
      </View>

      {/*
        Two marks rather than two words. What each one does is short enough to
        draw — a microphone, a camera — and the line under the row is where the
        state gets spelled out, so the buttons do not have to carry it.
      */}
      <View style={styles.capture}>
        {handsFree ? (
          // Lit, because the microphone is already open: this is the way to
          // close it, there being no finger on the button to lift.
          <OutlineButton
            size="sm"
            variant="accent"
            icon={MicIcon}
            label="Tap to catch it"
            onPress={voice.stop}
          />
        ) : (
          <HoldButton
            icon={MicIcon}
            label="Hold to speak"
            holdingLabel="Listening…"
            holding={voice.listening}
            onPressIn={() => {
              photo.dismissError();
              voice.start();
            }}
            onPressOut={voice.stop}
          />
        )}
        <OutlineButton
          size="sm"
          variant="quiet"
          icon={CameraIcon}
          label="Snap it"
          onPress={() => {
            voice.dismissError();
            photo.choose();
          }}
        />
      </View>

      {!!snapped && (
        <CaptionSheet
          uri={snapped}
          onCatch={catchPhoto}
          onDiscard={() => setSnapped(null)}
        />
      )}

      {(voice.listening || !!status) && (
        <View style={styles.status}>
          {voice.listening && (
            <Text style={[styles.statusLabel, { color: c.accent }]}>
              {handsFree
                ? 'Listening — tap to catch it'
                : 'Release to catch it'}
            </Text>
          )}
          {!!status && (
            <Text
              style={[
                voice.listening ? styles.heard : styles.statusLabel,
                { color: voice.listening ? c.ink : c.accent },
              ]}
            >
              {status}
            </Text>
          )}
        </View>
      )}

      <SectionHeading>
        {uncategorised === 0
          ? 'Nothing waiting — dump the next one here'
          : `${uncategorised} uncategorised — leave them that way`}
      </SectionHeading>
      {list.map(t => (
        <TaskRow
          key={t.id}
          task={t}
          variant="inbox"
          onPress={() => s.actions.open(t.id)}
        />
      ))}
    </View>
  );
};
