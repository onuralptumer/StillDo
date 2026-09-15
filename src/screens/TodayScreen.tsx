/**
 * @format
 */

import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '../components/ThemeContext';
import { OutlineButton } from '../components/controls';
import {
  CardNote,
  CardTitle,
  Display,
  Kicker,
  Lead,
  SectionHeading,
} from '../components/primitives';
import { Illustration } from '../components/Illustration';
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
  hero: { padding: 24, borderRadius: 32, marginTop: 8 },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroText: { flex: 1 },
  art: {
    width: 110,
    height: 150,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stats: { flexDirection: 'row', gap: 10, marginTop: 18 },
  stat: { flex: 1, padding: 12, borderRadius: 22, gap: 8 },
  statNumber: { fontFamily: font.semibold, fontSize: 28 },
  statLabel: { fontFamily: font.medium, fontSize: 12 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tag: { fontFamily: font.medium, fontSize: 12 },
  display: { marginTop: 10 },
  blurb: { marginTop: 14, maxWidth: 280, opacity: 0.7 },
  card: {
    marginTop: 14,
    borderRadius: radius.card,
    padding: 24,
    gap: 14,
  },
  teaser: {
    marginTop: space.section,
    fontFamily: font.medium,
    fontSize: 11,
    letterSpacing: 0.88,
  },
  held: { marginTop: 9 },
  cta: { marginTop: 12 },
});

export const TodayScreen = ({ s }: { s: Stilldo }) => {
  const c = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const showArt = width >= 375 && fontScale <= 1.2;
  const openCount = s.dueTasks.length;
  const held = s.deferredTasks.length;
  // Nothing has ever been caught: the day has no shape to show yet.
  const blank = s.tasks.length === 0;
  const now = s.dueTasks[0];
  const deferred = new Set(s.deferredTasks.map(t => t.id));
  const rest = s.tasks.filter(
    t =>
      t.from === 'today' &&
      t.id !== now?.id &&
      t.status !== 'dropped' &&
      !deferred.has(t.id),
  );

  return (
    <View style={styles.page}>
      <Kicker>{longDate()}</Kicker>
      <View style={[styles.hero, { backgroundColor: c.peach }]}>
        <View style={styles.heroTop}>
          <View style={styles.heroText}>
            <Kicker style={{ color: c.ink }}>A little space for you</Kicker>
            <Display style={styles.display}>
              {'Today,\none thing\nat a time.'}
            </Display>
          </View>
          {showArt && (
            <View style={styles.art}>
              <Illustration name="drawkit-notes" />
            </View>
          )}
        </View>
        <Lead style={styles.blurb}>
          {blank
            ? 'Nothing caught yet. Put the first task in the inbox and let go of it.'
            : openCount > 0
            ? `${openCount} open. You do not have to remember them — that is the app's job now.`
            : 'Nothing open. The sweep found everything.'}
        </Lead>
      </View>
      <View style={styles.stats}>
        {[
          { label: 'To do', count: openCount, color: c.sage },
          { label: 'Tomorrow', count: held, color: c.peach },
          {
            label: 'Completed',
            count: s.tasks.filter(t => t.status === 'done').length,
            color: c.blue,
          },
        ].map(item => (
          <View
            key={item.label}
            style={[styles.stat, { backgroundColor: item.color }]}
          >
            <Text style={[styles.statNumber, { color: c.ink }]}>
              {item.count}
            </Text>
            <Text style={[styles.statLabel, { color: c.ink }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {blank ? (
        <OutlineButton
          label="Catch the first one"
          onPress={() => s.actions.go('inbox')}
          style={styles.cta}
        />
      ) : (
        <>
          {!!now && (
            <>
              <SectionHeading>Right now</SectionHeading>
              <Pressable
                accessibilityRole="button"
                onPress={() => s.actions.open(now.id)}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: pressed ? c.raiseHi : c.raise },
                ]}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.tag, { color: c.accent }]}>
                    Your next small step
                  </Text>
                  <Text style={{ color: c.accent, fontSize: 22 }}>↗</Text>
                </View>
                <CardTitle>{now.title}</CardTitle>
                <CardNote>{now.note}</CardNote>
              </Pressable>
            </>
          )}

          {rest.length > 0 && (
            <>
              <SectionHeading>Also today</SectionHeading>
              {rest.map(t => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onPress={() => s.actions.open(t.id)}
                />
              ))}
            </>
          )}

          <Text style={[styles.teaser, { color: c.accent }]}>
            {`Sweep tonight at ${s.settings.sweepTime} · ${openCount} to check`}
          </Text>
          {held > 0 && (
            // Moved out of today, but say so — otherwise it reads as lost.
            <Kicker style={styles.held}>
              {held === 1
                ? '1 waiting for tomorrow'
                : `${held} waiting for tomorrow`}
            </Kicker>
          )}
          <OutlineButton
            label="Start the sweep"
            onPress={s.actions.startSweep}
            style={styles.cta}
          />
        </>
      )}
    </View>
  );
};
