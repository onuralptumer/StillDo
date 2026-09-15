/**
 * @format
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../components/ThemeContext';
import { FilledButton, LinkButton } from '../components/controls';
import { DashedRule, Display, Kicker, Lead } from '../components/primitives';
import { Snapshot } from '../components/Snapshot';
import { stamp } from '../date';
import { font, space } from '../theme';
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
  snapshot: { marginTop: 18 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  spec: {
    fontFamily: font.medium,
    fontSize: 11,
    letterSpacing: 0.77,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  const d = s.detail;
  if (!d) return null;
  const done = d.status === 'done';

  return (
    <View style={styles.page}>
      <LinkButton label="← Back" onPress={s.actions.back} />
      <Kicker style={styles.kicker}>{d.source}</Kicker>
      <Display style={styles.display}>{d.title}</Display>
      <Lead style={styles.note}>{d.note}</Lead>
      {!!d.photoUri && <Snapshot uri={d.photoUri} style={styles.snapshot} />}

      <DashedRule marginTop={space.section} />
      <Spec label="Caught" value={stamp(d.caught)} />

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
