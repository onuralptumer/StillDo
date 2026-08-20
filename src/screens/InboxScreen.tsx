/**
 * @format
 */

import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../components/ThemeContext';
import { HoldButton, LinkButton, OutlineButton } from '../components/controls';
import {
  Display,
  Kicker,
  Lead,
  SectionHeading,
} from '../components/primitives';
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
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  input: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: 13,
    letterSpacing: 0.91,
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

  const voice = useVoiceCapture(text =>
    s.actions.capture(
      text,
      'Voice',
      'Caught mid-sentence. The sweep will ask what you meant.',
    ),
  );
  const photo = usePhotoCapture(uri =>
    s.actions.capture(
      // Just "Photo": the caught line under the row already gives the when.
      'Photo',
      'Photo',
      'A picture is enough. You will recognise it tonight even if you cannot name it now.',
      uri,
    ),
  );
  const status = voice.listening
    ? voice.partial
    : voice.error || photo.error || '';
  const list = s.tasks.filter(t => t.from === 'inbox' && t.status !== 'dropped');
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

      <View style={[styles.field, { borderBottomColor: c.ink }]}>
        <TextInput
          value={s.draft}
          onChangeText={s.actions.setDraft}
          onSubmitEditing={s.actions.addFromDraft}
          placeholder="ADD A LOOSE END"
          placeholderTextColor={c.mute}
          // Matches the canvas's uppercase field without relying on
          // `textTransform`, which TextInput ignores on Android.
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          style={[styles.input, { color: c.ink }]}
        />
        <LinkButton label="Add" onPress={s.actions.addFromDraft} />
      </View>

      <View style={styles.capture}>
        <HoldButton
          label="Hold to speak"
          holdingLabel="Listening…"
          holding={voice.listening}
          onPressIn={() => {
            photo.dismissError();
            voice.start();
          }}
          onPressOut={voice.stop}
        />
        <OutlineButton
          size="sm"
          variant="quiet"
          label="Snap it"
          onPress={() => {
            voice.dismissError();
            photo.choose();
          }}
        />
      </View>

      {(voice.listening || !!status) && (
        <View style={styles.status}>
          {voice.listening && (
            <Text style={[styles.statusLabel, { color: c.accent }]}>
              Release to catch it
            </Text>
          )}
          {!!status && (
            <Text
              style={[
                voice.listening ? styles.heard : styles.statusLabel,
                { color: voice.listening ? c.ink : c.accent },
              ]}>
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
