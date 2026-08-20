/**
 * The intro, shown once before the app proper.
 *
 * Not part of the canvas — written in its language. It stays short and quiet:
 * three panes that say what the app is for, one of which sets the only choice
 * that actually shapes the day. Permissions are not asked for here; the mic
 * and camera prompts belong at the moment you first reach for them.
 *
 * @format
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../components/ThemeContext';
import { LinkButton, OutlineButton } from '../components/controls';
import { Display, Kicker, Lead } from '../components/primitives';
import { sweepTimes } from '../data';
import { font, radius, space } from '../theme';
import type { Stilldo } from '../useStilldo';

type Pane = {
  kicker: string;
  title: string;
  body: string;
  /** Only the sweep pane asks for anything. */
  choose?: boolean;
};

const PANES: Pane[] = [
  {
    kicker: 'Why this exists',
    title: 'You will\nforget things',
    body: 'That is not a character flaw, it is how attention works. Stilldo is built to catch what slips, so you can stop carrying it all yourself.',
  },
  {
    kicker: 'Catching',
    title: 'Catch it\nbadly',
    body: 'Type it, say it, or photograph it. Half a thought is enough — nothing here needs sorting, dating or naming. The inbox is meant to be a mess.',
  },
  {
    kicker: 'The sweep',
    title: 'One pass,\nevery evening',
    body: 'Stilldo brings back whatever is still open, one card at a time. Did it, moved it to tomorrow, or let it go — and the day is closed.',
    choose: true,
  },
];

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  page: {
    flex: 1,
    paddingTop: 14,
    paddingBottom: 32,
    paddingHorizontal: space.gutter,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
    paddingVertical: 40,
  },
  lead: { opacity: 0.75, maxWidth: 300 },
  chooser: { marginTop: 13, flexDirection: 'row', gap: 9, flexWrap: 'wrap' },
  chip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  chipLabel: {
    fontFamily: font.medium,
    fontSize: 11,
    letterSpacing: 0.99,
    textTransform: 'uppercase',
  },
  foot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 18,
  },
  ticks: { flexDirection: 'row', gap: 6 },
  tick: { width: 18, height: 2, borderRadius: 9999 },
});

export const OnboardingScreen = ({ s }: { s: Stilldo }) => {
  const c = useTheme();
  const [step, setStep] = useState(0);
  const pane = PANES[step];
  const last = step === PANES.length - 1;

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>
      <View style={styles.page}>
        <View style={styles.head}>
          <Kicker>{pane.kicker}</Kicker>
          <LinkButton
            variant="ghost"
            label="Skip"
            onPress={s.actions.finishOnboarding}
          />
        </View>

        <View style={styles.body}>
          <Display>{pane.title}</Display>
          <Lead style={styles.lead}>{pane.body}</Lead>

          {pane.choose && (
            <View>
              <Kicker>Sweep at</Kicker>
              <View style={styles.chooser}>
                {sweepTimes.map(time => {
                  const on = s.settings.sweepTime === time;
                  return (
                    <Pressable
                      key={time}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      onPress={() => s.actions.setSetting('sweepTime', time)}
                      style={[
                        styles.chip,
                        { borderColor: on ? c.ink : c.line },
                      ]}>
                      <Text
                        style={[
                          styles.chipLabel,
                          { color: on ? c.ink : c.mute },
                        ]}>
                        {time}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        <View style={styles.foot}>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ now: step + 1, min: 1, max: PANES.length }}
            style={styles.ticks}>
            {PANES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.tick,
                  { backgroundColor: i === step ? c.ink : c.line },
                ]}
              />
            ))}
          </View>
          <OutlineButton
            label={last ? 'Start' : 'Next'}
            onPress={() =>
              last ? s.actions.finishOnboarding() : setStep(step + 1)
            }
          />
        </View>
      </View>
    </ScrollView>
  );
};
