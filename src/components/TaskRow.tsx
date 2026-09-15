/**
 * @format
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { stamp } from '../date';
import { font } from '../theme';
import type { Task } from '../types';
import { useTheme } from './ThemeContext';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    padding: 20,
    marginBottom: 10,
    borderRadius: 22,
    minHeight: 84,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9999,
    marginTop: 5,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: font.medium,
    fontSize: 17,
    letterSpacing: 0,
    lineHeight: 23,
  },
  meta: {
    fontFamily: font.medium,
    fontSize: 11,
    letterSpacing: 0.66,
    marginTop: 7,
  },
  state: {
    fontFamily: font.medium,
    fontSize: 10,
    letterSpacing: 0.8,
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

/** Open items carry a mark; done ones go quiet. */
export const dotColor = (t: Task, mute: string, line: string) =>
  t.status === 'done' ? line : mute;

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
        accessibilityLabel={`${task.title}. Caught ${stamp(task.caught)}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: c.raise },
          pressed && { backgroundColor: c.tint },
        ]}
      >
        {variant === 'today' && (
          <View
            style={[
              styles.dot,
              { backgroundColor: dotColor(task, c.accent, c.sage) },
            ]}
          />
        )}
        <View style={styles.body}>
          <Text style={[styles.title, { color: c.ink }, done && styles.faded]}>
            {task.title}
          </Text>
          {/* The moment it was caught — the same value the detail shows. */}
          <Text style={[styles.meta, { color: c.mute }]}>
            {stamp(task.caught)}
          </Text>
        </View>
        {variant === 'today' ? (
          // Only done is worth a word here; an open task has nothing to add
          // that the dot and the caught line do not already say.
          done && <Text style={[styles.state, { color: c.mute }]}>Done</Text>
        ) : (
          <Text style={[styles.chevron, { color: c.mute }]}>→</Text>
        )}
      </Pressable>
    </View>
  );
};
