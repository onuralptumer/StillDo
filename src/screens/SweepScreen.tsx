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
import { Snapshot } from '../components/Snapshot';
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
    height: 8,
    borderRadius: 4,
    marginTop: 24,
  },
  fill: { height: 8, borderRadius: 4 },
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
    paddingTop: space.rule,
  },
});

export const SweepScreen = ({ s }: { s: Stilldo }) => {
  const c = useTheme();
  const card = s.sweepCard;
  const total = s.sweepTotal;
  // A run with nothing in it has made no progress, rather than all of it.
  const pct = total ? Math.round((s.sweepIdx / total) * 100) : 0;
  const did = s.sweepLog.filter(v => v === 'done').length;
  const moved = s.sweepLog.filter(v => v === 'later').length;

  return (
    <View style={styles.page}>
      <Kicker>{`${s.settings.sweepTime} · Evening sweep`}</Kicker>
      <Display style={styles.display}>{'What did\nyou forget?'}</Display>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ now: s.sweepIdx, min: 0, max: total }}
        style={[styles.track, { backgroundColor: c.line }]}
      >
        <View
          style={[styles.fill, { backgroundColor: c.accent, width: `${pct}%` }]}
        />
      </View>
      <Kicker style={styles.counter}>
        {card
          ? `${s.sweepIdx + 1} of ${total}`
          : total === 0
          ? 'Nothing to check'
          : 'Swept'}
      </Kicker>

      {card ? (
        <>
          <View style={[styles.card, { backgroundColor: c.peach }]}>
            <Kicker style={{ color: c.accent }}>{card.source}</Kicker>
            <CardTitle>{card.title}</CardTitle>
            <CardNote>{card.note}</CardNote>
            {!!card.photoUri && <Snapshot uri={card.photoUri} />}
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
          <DisplayLarge>
            {total === 0
              ? 'Nothing to sweep.'
              : did > 0
              ? 'Day closed.'
              : 'All clear.'}
          </DisplayLarge>
          <Lead style={styles.resultBody}>
            {total === 0
              ? 'Nothing was left open. When something is, this is where it comes back to you.'
              : `${did} done, ${moved} moved to tomorrow. Nothing is sitting in your head overnight — it is all here, and it will find you again.`}
          </Lead>
          {total > 0 && (
            <View>
              <DashedRule />
              <Text style={[styles.streak, { color: c.accent }]}>
                Fourth sweep in a row
              </Text>
            </View>
          )}
          <OutlineButton
            label={total === 0 ? 'Back to today' : 'Close the day'}
            onPress={() => s.actions.go('today')}
          />
        </View>
      )}
    </View>
  );
};
