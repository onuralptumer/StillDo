/**
 * @format
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../components/ThemeContext';
import { FilledButton, OutlineButton } from '../components/controls';
import {
  CardNote,
  CardTitle,
  DashedRule,
  Display,
  DisplayLarge,
  Kicker,
  Lead,
} from '../components/primitives';
import { font, radius, space } from '../theme';
import type { Stilldo } from '../useStilldo';

const styles = StyleSheet.create({
  page: {
    paddingTop: 14,
    paddingBottom: 40,
    paddingHorizontal: space.gutter,
    minHeight: 640,
  },
  display: { marginTop: 10 },
  track: {
    height: 1,
    marginTop: 24,
  },
  fill: { height: 1 },
  counter: { marginTop: 10, letterSpacing: 0.9 },
  card: {
    marginTop: space.section,
    borderRadius: radius.card,
    padding: 24,
    gap: 16,
  },
  choices: {
    marginTop: 24,
    gap: 9,
  },
  wide: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  split: {
    flexDirection: 'row',
    gap: 9,
  },
  half: {
    flex: 1,
    alignSelf: 'auto',
    alignItems: 'center',
  },
  hint: {
    marginTop: 16,
    fontFamily: font.regular,
    fontSize: 12,
    lineHeight: 15.1,
    opacity: 0.55,
  },
  done: {
    marginTop: 41,
    gap: 18,
  },
  resultBody: { opacity: 0.75, maxWidth: 290 },
  streak: {
    fontFamily: font.medium,
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    paddingTop: space.rule,
  },
});

export const SweepScreen = ({ s }: { s: Stilldo }) => {
  const c = useTheme();
  const card = s.sweepCard;
  const total = s.sweepTotal;
  const pct = total ? Math.round((s.sweepIdx / total) * 100) : 100;
  const did = s.sweepLog.filter(v => v === 'done').length;
  const moved = s.sweepLog.filter(v => v === 'later').length;

  return (
    <View style={styles.page}>
      <Kicker>{`${s.settings.sweepTime} · Evening sweep`}</Kicker>
      <Display style={styles.display}>{'What did\nyou forget?'}</Display>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ now: s.sweepIdx, min: 0, max: total }}
        style={[styles.track, { backgroundColor: c.line }]}>
        <View
          style={[styles.fill, { backgroundColor: c.ink, width: `${pct}%` }]}
        />
      </View>
      <Kicker style={styles.counter}>
        {card ? `${s.sweepIdx + 1} of ${total}` : 'Swept'}
      </Kicker>

      {card ? (
        <>
          <View style={[styles.card, { backgroundColor: c.raise }]}>
            <Kicker style={{ color: c.accent }}>{card.source}</Kicker>
            <CardTitle>{card.title}</CardTitle>
            <CardNote>{card.note}</CardNote>
          </View>

          <View style={styles.choices}>
            <FilledButton
              label="I did it"
              onPress={() => s.actions.advance('done')}
              style={styles.wide}
            />
            <View style={styles.split}>
              <OutlineButton
                label="Move to tomorrow"
                onPress={() => s.actions.advance('later')}
                style={styles.half}
              />
              <OutlineButton
                variant="ghost"
                label="Let it go"
                onPress={() => s.actions.advance('drop')}
                style={styles.half}
              />
            </View>
          </View>

          <DashedRule marginTop={24} />
          <Text style={[styles.hint, { color: c.ink }]}>
            Not doing it is a real answer. Letting go here costs you nothing.
          </Text>
        </>
      ) : (
        <View style={styles.done}>
          <DisplayLarge>{did > 0 ? 'Day closed.' : 'All clear.'}</DisplayLarge>
          <Lead style={styles.resultBody}>
            {`${did} done, ${moved} moved to tomorrow. Nothing is sitting in your head overnight — it is all here, and it will find you again.`}
          </Lead>
          <View>
            <DashedRule />
            <Text style={[styles.streak, { color: c.accent }]}>
              Fourth sweep in a row
            </Text>
          </View>
          <OutlineButton
            label="Close the day"
            onPress={() => s.actions.go('today')}
          />
        </View>
      )}
    </View>
  );
};
