/**
 * @format
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { font } from '../theme';
import type { Task } from '../types';
import { DashedRule } from './primitives';
import { useTheme } from './ThemeContext';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    paddingVertical: 18,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 9999,
    marginTop: 5,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: font.medium,
    fontSize: 14,
    letterSpacing: 0.42,
    lineHeight: 16.8,
    textTransform: 'uppercase',
  },
  meta: {
    fontFamily: font.medium,
    fontSize: 11,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    marginTop: 7,
  },
  state: {
    fontFamily: font.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingTop: 2,
  },
  chevron: {
    fontSize: 16,
    paddingTop: 2,
  },
  faded: {
    opacity: 0.4,
  },
});

/** Accent marks the ones that keep slipping; done items go quiet. */
export const dotColor = (t: Task, accent: string, mute: string, line: string) =>
  t.status === 'done'
    ? line
    : t.nudge === 'alarm' || t.slips.includes('running')
    ? accent
    : mute;

export const TaskRow = ({
  task,
  onPress,
  variant = 'today',
}: {
  task: Task;
  onPress: () => void;
  variant?: 'today' | 'inbox';
}) => {
  const c = useTheme();
  const done = task.status === 'done';

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${task.title}. ${task.source}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          pressed && { backgroundColor: c.tint },
        ]}>
        {variant === 'today' && (
          <View
            style={[
              styles.dot,
              { backgroundColor: dotColor(task, c.accent, c.mute, c.line) },
            ]}
          />
        )}
        <View style={styles.body}>
          <Text style={[styles.title, { color: c.ink }, done && styles.faded]}>
            {task.title}
          </Text>
          <Text style={[styles.meta, { color: c.mute }]}>{task.source}</Text>
        </View>
        {variant === 'today' ? (
          <Text style={[styles.state, { color: c.mute }]}>
            {done ? 'Done' : task.when}
          </Text>
        ) : (
          <Text style={[styles.chevron, { color: c.mute }]}>→</Text>
        )}
      </Pressable>
      <DashedRule />
    </View>
  );
};
