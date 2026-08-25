/**
 * The question asked before something that cannot be taken back.
 *
 * Same panel as `OptionSheet` rather than the platform alert: a sheet the app
 * draws itself asks in the app's own voice and typeface, and — unlike an alert
 * — keeps the destructive answer visibly the quieter of the two.
 *
 * @format
 */

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, radius, space } from '../theme';
import { OutlineButton } from './controls';
import { DashedRule, Display } from './primitives';
import { useTheme } from './ThemeContext';

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'flex-end',
    // Fixed rather than themed: it darkens whatever is behind it.
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  panel: {
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: space.gutter,
    paddingTop: 22,
  },
  title: { marginBottom: 16 },
  body: {
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 20.5,
    opacity: 0.75,
    marginTop: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    flexWrap: 'wrap',
  },
});

export const ConfirmSheet = ({
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  /** Names the deed — "Yes" makes the reader reconstruct what they agreed to. */
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible
      transparent
      animationType="slide"
      // The hardware back button is a way out, not a way through.
      onRequestClose={onCancel}
      statusBarTranslucent>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onCancel}
        style={styles.scrim}>
        <Pressable
          // Swallows taps so answering does not dismiss through the scrim.
          onPress={() => {}}
          style={[
            styles.panel,
            {
              backgroundColor: c.bg,
              paddingBottom: Math.max(insets.bottom, 20) + 8,
            },
          ]}>
          <Display style={styles.title}>{title}</Display>
          <DashedRule />
          <Text style={[styles.body, { color: c.ink }]}>{body}</Text>
          <View style={styles.actions}>
            {/* Cancel comes first: the finger lands on the way out. */}
            <OutlineButton label={cancelLabel} onPress={onCancel} />
            <OutlineButton
              label={confirmLabel}
              variant="accent"
              onPress={onConfirm}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
