/**
 * @format
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../components/ThemeContext';
import { FilledButton, LinkButton } from '../components/controls';
import {
  DashedRule,
  Display,
  Kicker,
  Lead,
} from '../components/primitives';
import { nudgeOptions } from '../data';
import { font, radius, space } from '../theme';
import type { Stilldo } from '../useStilldo';

const styles = StyleSheet.create({
  page: {
    paddingTop: 14,
    paddingBottom: 40,
    paddingHorizontal: space.gutter,
  },
  kicker: { marginTop: 24 },
  display: { marginTop: 10 },
  note: { marginTop: 16, opacity: 0.75 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  spec: {
    fontFamily: font.medium,
    fontSize: 11,
    letterSpacing: 0.77,
    textTransform: 'uppercase',
  },
  nudgeList: {
    marginTop: 14,
    gap: 9,
  },
  nudge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: 18,
    gap: 6,
  },
  nudgeLabel: {
    fontFamily: font.medium,
    fontSize: 11,
    letterSpacing: 0.99,
    textTransform: 'uppercase',
  },
  nudgeDesc: {
    fontFamily: font.regular,
    fontSize: 12,
    lineHeight: 15.1,
    opacity: 0.6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: space.section,
  },
});

const Spec = ({ label, value }: { label: string; value: string }) => {
  const c = useTheme();
  return (
    <View>
      <View style={styles.specRow}>
        <Text style={[styles.spec, { color: c.mute }]}>{label}</Text>
        <Text style={[styles.spec, { color: c.ink }]}>{value}</Text>
      </View>
      <DashedRule />
    </View>
  );
};

export const DetailScreen = ({ s }: { s: Stilldo }) => {
  const c = useTheme();
  const d = s.detail;
  const done = d.status === 'done';

  return (
    <View style={styles.page}>
      <LinkButton label="← Back" onPress={s.actions.back} />
      <Kicker style={styles.kicker}>{d.source}</Kicker>
      <Display style={styles.display}>{d.title}</Display>
      <Lead style={styles.note}>{d.note}</Lead>

      <DashedRule marginTop={space.section} />
      <Spec label="Caught" value={d.caught} />
      <Spec label="Where" value={d.where} />
      <Spec label="Slipped past" value={d.slips} />

      <Kicker style={{ marginTop: space.section }}>
        How hard should I push?
      </Kicker>
      <View style={styles.nudgeList}>
        {nudgeOptions.map(n => {
          const on = d.nudge === n.key;
          return (
            <Pressable
              key={n.key}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => s.actions.setNudge(d.id, n.key)}
              style={({ pressed }) => [
                styles.nudge,
                {
                  borderColor: on ? c.ink : c.line,
                  backgroundColor: pressed ? c.tint : 'transparent',
                },
              ]}>
              <Text style={[styles.nudgeLabel, { color: c.ink }]}>
                {n.label}
              </Text>
              <Text style={[styles.nudgeDesc, { color: c.ink }]}>{n.desc}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <FilledButton
          label={done ? 'Done — undo' : 'Mark it done'}
          onPress={() => s.actions.resolve(d.id, done ? 'open' : 'done')}
        />
        <LinkButton
          variant="ghost"
          label="Let it go"
          onPress={() => s.actions.resolve(d.id, 'dropped')}
        />
      </View>
    </View>
  );
};
