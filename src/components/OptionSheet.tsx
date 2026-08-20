/**
 * A sheet for choices too numerous to tap through one at a time.
 *
 * @format
 */

import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space } from '../theme';
import { LinkButton } from './controls';
import { DashedRule, Kicker } from './primitives';
import { useTheme } from './ThemeContext';
import { WheelPicker } from './WheelPicker';

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'flex-end',
    // Fixed rather than themed: it darkens whatever is behind it.
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  panel: {
    maxHeight: '76%',
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: space.gutter,
    paddingTop: 20,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 18,
  },
  wheel: { paddingTop: 10 },
});

export const OptionSheet = ({
  title,
  options,
  value,
  onPick,
  onClose,
}: {
  title: string;
  options: string[];
  value: string;
  /** Fires as the wheel settles, so the choice is live rather than staged. */
  onPick: (option: string) => void;
  onClose: () => void;
}) => {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      {/* Tapping the darkened area behind the panel dismisses it. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        style={styles.scrim}>
        <Pressable
          // Swallows taps so choosing does not dismiss through the scrim.
          onPress={() => {}}
          style={[styles.panel, { backgroundColor: c.bg }]}>
          <View style={styles.head}>
            <Kicker>{title}</Kicker>
            <LinkButton label="Done" onPress={onClose} />
          </View>
          <DashedRule />
          <View
            style={[
              styles.wheel,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}>
            <WheelPicker options={options} value={value} onChange={onPick} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
