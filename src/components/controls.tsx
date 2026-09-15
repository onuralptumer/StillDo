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

/** Small enough that a pill drawn round it stays the height of a tap target. */
const ICON_IN_PILL = 20;

const styles = StyleSheet.create({
  outline: {
    minHeight: 44,
    justifyContent: 'center',
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
    fontSize: 14,
    letterSpacing: 0,
    textAlign: 'center',
  },
  outlineLabelSm: {
    fontSize: 13,
    letterSpacing: 0,
  },
  // A mark instead of a word: equal padding all round, so the pill closes to
  // a circle about the icon rather than staying a lozenge with air either side.
  outlineIcon: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  filled: {
    borderRadius: radius.action,
    paddingVertical: 15,
    paddingHorizontal: 26,
    alignSelf: 'flex-start',
  },
  filledLabel: {
    fontFamily: font.medium,
    fontSize: 15,
    letterSpacing: 0,
    textAlign: 'center',
  },
  link: {
    fontFamily: font.medium,
    fontSize: 14,
    letterSpacing: 0,
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
   * `accent` is the palette's one colour throughout: a press that cannot be
   * taken back, or a control that is currently live.
   */
  variant?: 'primary' | 'quiet' | 'ghost' | 'accent';
  /** The tighter capture buttons on the Inbox screen. */
  size?: 'md' | 'sm';
};

export const OutlineButton = ({
  label,
  onPress,
  style,
  variant = 'primary',
  size = 'md',
  icon: Icon,
}: ButtonProps & {
  /** Draws this mark in place of the word. `label` still names the button. */
  icon?: (p: IconProps) => React.ReactElement;
}) => {
  const c = useTheme();
  const lit = variant === 'accent';
  const tone = (pressed: boolean) =>
    lit ? c.accent : variant === 'ghost' && !pressed ? c.mute : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      // Named either way: with a mark in place of the word there is nothing
      // for assistive tech to read off the face of the button.
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.outline,
        size === 'sm' && styles.outlineSm,
        !!Icon && styles.outlineIcon,
        {
          borderColor: lit
            ? c.accent
            : variant === 'primary' || pressed
            ? c.ink
            : c.mute,
          backgroundColor: pressed ? c.tint : 'transparent',
        },
        style,
      ]}
    >
      {({ pressed }) =>
        Icon ? (
          <Icon color={tone(pressed)} size={ICON_IN_PILL} />
        ) : (
          <Text
            style={[
              styles.outlineLabel,
              size === 'sm' && styles.outlineLabelSm,
              { color: tone(pressed) },
            ]}
          >
            {label}
          </Text>
        )
      }
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
        { backgroundColor: c.accent, opacity: pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Text style={[styles.filledLabel, { color: c.onAccent }]}>{label}</Text>
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
          ]}
        >
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
      ]}
    >
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
  icon: Icon,
}: {
  label: string;
  /** What it says while the recogniser is open — unused when drawn as a mark. */
  holdingLabel: string;
  holding: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
  style?: StyleProp<ViewStyle>;
  icon?: (p: IconProps) => React.ReactElement;
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
        !!Icon && styles.outlineIcon,
        styles.transparent,
        { borderColor: holding ? c.accent : c.mute },
        holding && { backgroundColor: c.tint },
        style,
      ]}
    >
      {Icon ? (
        // The mark cannot change its word, so the accent is what says the
        // microphone is open — with the line under the row spelling it out.
        <Icon color={holding ? c.accent : c.ink} size={ICON_IN_PILL} />
      ) : (
        <Text
          style={[
            styles.outlineLabel,
            styles.outlineLabelSm,
            { color: holding ? c.accent : c.ink },
          ]}
        >
          {holding ? holdingLabel : label}
        </Text>
      )}
    </Pressable>
  );
};
