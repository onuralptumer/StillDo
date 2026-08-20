/**
 * A scroll wheel, built rather than borrowed: the platform pickers come with
 * their own font, colours and metrics, none of which this app uses.
 *
 * Rows are tappable as well as scrollable — reaching for a time you can
 * already see should not mean nudging the wheel to it.
 *
 * @format
 */

import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import { font } from '../theme';
import { DashedRule } from './primitives';
import { useTheme } from './ThemeContext';

const ROW = 46;
/** Odd, so one row sits in the middle. */
const VISIBLE = 5;
const PAD = ROW * ((VISIBLE - 1) / 2);

const styles = StyleSheet.create({
  frame: { height: ROW * VISIBLE },
  band: {
    position: 'absolute',
    top: PAD,
    left: 0,
    right: 0,
    height: ROW,
    justifyContent: 'space-between',
  },
  content: { paddingVertical: PAD },
  row: { height: ROW, alignItems: 'center', justifyContent: 'center' },
  label: {
    fontFamily: font.medium,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontSize: 17,
  },
  chosen: { fontSize: 22 },
});

/** Rows fade with distance from the middle. */
const fade = (distance: number) =>
  distance === 0 ? 1 : distance === 1 ? 0.55 : 0.28;

export const WheelPicker = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (option: string) => void;
}) => {
  const c = useTheme();
  const scroller = useRef<ScrollViewInstance>(null);
  const start = Math.max(0, options.indexOf(value));
  const [centre, setCentre] = useState(start);
  const placed = useRef(false);

  const settle = (i: number) => {
    const next = Math.min(Math.max(i, 0), options.length - 1);
    setCentre(next);
    if (options[next] !== value) onChange(options[next]);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setCentre(Math.round(e.nativeEvent.contentOffset.y / ROW));

  return (
    <View style={styles.frame}>
      {/* The band marks which row counts as chosen. */}
      <View style={styles.band} pointerEvents="none">
        <DashedRule color={c.mute} />
        <DashedRule color={c.mute} />
      </View>
      <ScrollView
        ref={scroller}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={e =>
          settle(Math.round(e.nativeEvent.contentOffset.y / ROW))
        }
        onLayout={() => {
          // Open on the current value rather than at midnight.
          if (placed.current) return;
          placed.current = true;
          scroller.current?.scrollTo({ y: start * ROW, animated: false });
        }}
        contentContainerStyle={styles.content}>
        {options.map((option, i) => {
          const distance = Math.abs(i - centre);
          const on = distance === 0;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => {
                scroller.current?.scrollTo({ y: i * ROW, animated: true });
                settle(i);
              }}
              style={styles.row}>
              <Text
                style={[
                  styles.label,
                  on && styles.chosen,
                  { color: on ? c.ink : c.mute, opacity: fade(distance) },
                ]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
