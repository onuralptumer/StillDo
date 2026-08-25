/**
 * What the photo was of.
 *
 * A snapped capture used to go in as "Photo" and nothing else, which is fine
 * at the moment you take it and useless at 21:00 when the sweep hands you back
 * three of them. So the shot is shown once, with a line to put your own words
 * on it — the only place in the app that asks you to name anything, and even
 * here it is optional.
 *
 * @format
 */

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, radius, space } from '../theme';
import { FilledButton, LinkButton } from './controls';
import { DashedRule, Kicker } from './primitives';
import { Snapshot } from './Snapshot';
import { useTheme } from './ThemeContext';

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'flex-end',
    // Fixed rather than themed: it darkens whatever is behind it.
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  panel: {
    maxHeight: '92%',
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: space.gutter,
    paddingTop: 20,
  },
  snapshot: { marginTop: 16 },
  field: {
    marginTop: 20,
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  input: {
    fontFamily: font.medium,
    fontSize: 13,
    letterSpacing: 0.91,
    paddingVertical: 4,
    padding: 0,
  },
  hint: {
    fontFamily: font.regular,
    fontSize: 12,
    lineHeight: 15.1,
    opacity: 0.55,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 22,
  },
});

/** What a photo is called when its caption is left blank. */
export const UNCAPTIONED = 'Photo';

export const CaptionSheet = ({
  uri,
  onCatch,
  onDiscard,
}: {
  uri: string;
  /** The caption as typed; blank is allowed and means "just the picture". */
  onCatch: (caption: string) => void;
  onDiscard: () => void;
}) => {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const [caption, setCaption] = useState('');
  const keep = () => onCatch(caption.trim());

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      // Backing out keeps the photo. The shot has already been taken, and the
      // sheet is asking what it was of — not whether you meant to take it.
      // Losing it is the one thing this app must not do; "Discard" says so out
      // loud for the times you did mean it.
      onRequestClose={keep}
      statusBarTranslucent>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Catch it without a caption"
        onPress={keep}
        style={styles.scrim}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable
            // Swallows taps so typing does not dismiss through the scrim.
            onPress={() => {}}
            style={[
              styles.panel,
              {
                backgroundColor: c.bg,
                paddingBottom: Math.max(insets.bottom, 20) + 8,
              },
            ]}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Kicker>Caught as a picture</Kicker>
              <Snapshot uri={uri} style={styles.snapshot} />

              <View style={[styles.field, { borderBottomColor: c.ink }]}>
                <TextInput
                  value={caption}
                  onChangeText={setCaption}
                  onSubmitEditing={keep}
                  placeholder="SAY WHAT IT IS"
                  placeholderTextColor={c.mute}
                  accessibilityLabel="Caption"
                  // The Inbox field's uppercase, reached the same way —
                  // TextInput ignores `textTransform` on Android.
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoFocus
                  returnKeyType="done"
                  style={[styles.input, { color: c.ink }]}
                />
              </View>
              <Text style={[styles.hint, { color: c.ink }]}>
                Half a word is enough. Leave it blank and it goes in as{' '}
                {UNCAPTIONED.toLowerCase()}.
              </Text>

              <DashedRule marginTop={space.rule} />
              <View style={styles.actions}>
                <FilledButton label="Catch it" onPress={keep} />
                <LinkButton
                  variant="ghost"
                  label="Discard"
                  onPress={onDiscard}
                />
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};
