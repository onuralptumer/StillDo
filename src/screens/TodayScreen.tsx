/**
 * @format
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../components/ThemeContext';
import { OutlineButton, Pill } from '../components/controls';
import {
  CardNote,
  CardTitle,
  Display,
  Kicker,
  Lead,
  SectionHeading,
} from '../components/primitives';
import { TaskRow } from '../components/TaskRow';
import { longDate } from '../date';
import { font, radius, space } from '../theme';
import type { Stilldo } from '../useStilldo';

const styles = StyleSheet.create({
  page: {
    paddingTop: 14,
    paddingBottom: 40,
    paddingHorizontal: space.gutter,
  },
  display: { marginTop: 10 },
  blurb: { marginTop: 14, maxWidth: 280, opacity: 0.7 },
  card: {
    marginTop: 14,
    borderRadius: radius.card,
    padding: 24,
    gap: 14,
  },
  pills: {
    flexDirection: 'row',
    gap: 9,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  teaser: {
    marginTop: space.section,
    fontFamily: font.medium,
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
  cta: { marginTop: 12 },
});

export const TodayScreen = ({ s }: { s: Stilldo }) => {
  const c = useTheme();
  const openCount = s.openTasks.length;
  const now = s.openTasks[0] || s.tasks[0];
  const rest = s.tasks.filter(
    t => t.from === 'today' && t.id !== now?.id && t.status !== 'dropped',
  );

  return (
    <View style={styles.page}>
      <Kicker>{longDate()}</Kicker>
      <Display style={styles.display}>Today</Display>
      <Lead style={styles.blurb}>
        {openCount > 0
          ? `${openCount} open. You do not have to remember them — that is the app's job now.`
          : 'Nothing open. The sweep found everything.'}
      </Lead>

      <SectionHeading>Right now</SectionHeading>
      <Pressable
        accessibilityRole="button"
        onPress={() => s.actions.open(now.id)}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: pressed ? c.raiseHi : c.raise },
        ]}>
        <CardTitle>{now.title}</CardTitle>
        <CardNote>{now.note}</CardNote>
        <View style={styles.pills}>
          <Pill label={now.when} />
          <Pill label={now.nudge} />
        </View>
      </Pressable>

      <SectionHeading>Also today</SectionHeading>
      {rest.map(t => (
        <TaskRow key={t.id} task={t} onPress={() => s.actions.open(t.id)} />
      ))}

      <Text style={[styles.teaser, { color: c.accent }]}>
        {`Sweep tonight at ${s.settings.sweepTime} · ${openCount} to check`}
      </Text>
      <OutlineButton
        label="Start the sweep"
        onPress={s.actions.startSweep}
        style={styles.cta}
      />
    </View>
  );
};
