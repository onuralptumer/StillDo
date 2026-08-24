/**
 * Buttons. The canvas used `style-hover`; on touch the equivalent
 * affordance is the pressed state, so that is what those hints map to here.
 *
 * @format
 */

import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { font, radius } from '../theme';
import type { IconProps } from './icons';
import { useTheme } from './ThemeContext';

const styles = StyleSheet.create({
  outline: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 11,
    paddingHorizontal: 22,
    alignSelf: 'flex-start',
  },
  outlineSm: {
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  outlineLabel: {
    fontFamily: font.medium,
    fontSize: 11,
    letterSpacing: 0.99,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  outlineLabelSm: {
    fontSize: 10,
    letterSpacing: 0.9,
  },
  filled: {
    borderRadius: radius.action,
    paddingVertical: 15,
    paddingHorizontal: 26,
    alignSelf: 'flex-start',
  },
  filledLabel: {
    fontFamily: font.medium,
    fontSize: 12,
    letterSpacing: 1.08,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  link: {
    fontFamily: font.medium,
    fontSize: 11,
    letterSpacing: 0.99,
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  icon: {
    // Tight enough not to push the row it sits in taller than the text it
    // replaces — the target is grown with `hitSlop` instead, which costs no
    // layout. The pill shows only while pressed.
    padding: 4,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

type ButtonProps = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  /**
   * How loudly the button asks to be pressed:
   * `primary` full-contrast border and label, `quiet` a receding border around
   * a full-contrast label, `ghost` receding throughout. Pressing any of them
   * brings it up to full contrast, which is what the canvas's hover hints did.
   */
  variant?: 'primary' | 'quiet' | 'ghost';
  /** The tighter capture buttons on the Inbox screen. */
  size?: 'md' | 'sm';
};

export const OutlineButton = ({
  label,
  onPress,
  style,
  variant = 'primary',
  size = 'md',
}: ButtonProps) => {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.outline,
        size === 'sm' && styles.outlineSm,
        {
          borderColor: variant === 'primary' || pressed ? c.ink : c.mute,
          backgroundColor: pressed ? c.tint : 'transparent',
        },
        style,
      ]}>
      {({ pressed }) => (
        <Text
          style={[
            styles.outlineLabel,
            size === 'sm' && styles.outlineLabelSm,
            { color: variant === 'ghost' && !pressed ? c.mute : c.ink },
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

export const FilledButton = ({ label, onPress, style }: ButtonProps) => {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.filled,
        { backgroundColor: pressed ? c.raiseHi : c.raise },
        style,
      ]}>
      <Text style={[styles.filledLabel, { color: c.ink }]}>{label}</Text>
    </Pressable>
  );
};

export const LinkButton = ({
  label,
  onPress,
  style,
  variant = 'primary',
}: ButtonProps) => {
  const c = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={style}>
      {({ pressed }) => (
        <Text
          style={[
            styles.link,
            { color: variant === 'primary' || pressed ? c.ink : c.mute },
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

/**
 * A button that says it with a stroke instead of a word. The mark carries no
 * meaning to a screen reader, so `label` still names it — it just stops being
 * drawn.
 */
export const IconButton = ({
  icon: Icon,
  label,
  onPress,
  style,
  variant = 'primary',
}: Omit<ButtonProps, 'size'> & {
  icon: (p: IconProps) => React.ReactElement;
}) => {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.icon,
        { backgroundColor: pressed ? c.tint : 'transparent' },
        style,
      ]}>
      {({ pressed }) => (
        <Icon color={variant === 'primary' || pressed ? c.ink : c.mute} />
      )}
    </Pressable>
  );
};

/**
 * "Hold to speak": the press itself is the gesture, so the recogniser runs
 * between press-in and release rather than firing once on tap.
 */
export const HoldButton = ({
  label,
  holdingLabel,
  holding,
  onPressIn,
  onPressOut,
  style,
}: {
  label: string;
  holdingLabel: string;
  holding: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
  style?: StyleProp<ViewStyle>;
}) => {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Hold to record, release to catch it"
      accessibilityState={{ busy: holding }}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.outline,
        styles.outlineSm,
        styles.transparent,
        { borderColor: holding ? c.accent : c.mute },
        holding && { backgroundColor: c.tint },
        style,
      ]}>
      <Text
        style={[
          styles.outlineLabel,
          styles.outlineLabelSm,
          { color: holding ? c.accent : c.ink },
        ]}>
        {holding ? holdingLabel : label}
      </Text>
    </Pressable>
  );
};
