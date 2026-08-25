/**
 * @format
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../components/ThemeContext';
import {
  DashedRule,
  Display,
  Kicker,
  SectionHeading,
} from '../components/primitives';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { OptionSheet } from '../components/OptionSheet';
import { appGuide, settingDefs } from '../data';
import { font, radius, space } from '../theme';
import type { SettingKey } from '../types';
import type { Stilldo } from '../useStilldo';
import type { SweepAlarm } from '../useSweepAlarm';

const styles = StyleSheet.create({
  page: {
    paddingTop: 14,
    paddingBottom: 40,
    paddingHorizontal: space.gutter,
  },
  display: { marginTop: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 18,
    paddingVertical: 18,
  },
  body: { flex: 1, minWidth: 0 },
  label: {
    fontFamily: font.medium,
    fontSize: 12,
    letterSpacing: 0.84,
    textTransform: 'uppercase',
  },
  desc: {
    fontFamily: font.regular,
    fontSize: 12,
    lineHeight: 15.1,
    opacity: 0.55,
    marginTop: 6,
  },
  // Sits directly under "Sweep at", where the promise it qualifies is made.
  blocked: {
    paddingBottom: 18,
    marginTop: -4,
  },
  blockedText: {
    fontFamily: font.regular,
    fontSize: 12,
    lineHeight: 15.1,
  },
  // The guide's prose, held a little in from the rows so it reads as an
  // aside rather than as another setting.
  guide: { paddingBottom: 8 },
  guideTitle: { marginTop: 14 },
  guideBody: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 19.6,
    opacity: 0.75,
    marginTop: 7,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipLabel: {
    fontFamily: font.medium,
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  // The canvas drops to Arial here; on device the system face is the
  // equivalent "not the brand font" signal for legal small print.
  footnote: {
    marginTop: space.section,
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 0.48,
    textTransform: 'uppercase',
  },
});

export const SettingsScreen = ({
  s,
  alarm,
}: {
  s: Stilldo;
  alarm: SweepAlarm;
}) => {
  const c = useTheme();
  const [picking, setPicking] = useState<SettingKey | null>(null);
  // Folded away by default: the guide is read once, and the screen is a place
  // people come to change a time.
  const [guiding, setGuiding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const open = settingDefs.find(d => d.key === picking);

  return (
    <View style={styles.page}>
      <Kicker>Tune the memory</Kicker>
      <Display style={styles.display}>Settings</Display>

      <SectionHeading>The sweep</SectionHeading>
      {settingDefs.map(({ key, label, desc, options, pick }) => {
        const value = s.settings[key];
        return (
          <View key={key}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${label}, ${value}`}
              accessibilityHint={desc}
              onPress={() =>
                pick ? setPicking(key) : s.actions.cycleSetting(key, options)
              }
              style={({ pressed }) => [
                styles.row,
                pressed && { backgroundColor: c.tint },
              ]}>
              <View style={styles.body}>
                <Text style={[styles.label, { color: c.ink }]}>{label}</Text>
                <Text style={[styles.desc, { color: c.ink }]}>{desc}</Text>
              </View>
              <View style={[styles.chip, { borderColor: c.ink }]}>
                <Text style={[styles.chipLabel, { color: c.ink }]}>
                  {value}
                </Text>
              </View>
            </Pressable>
            <DashedRule />
            {key === 'sweepTime' && alarm.permitted === false && (
              // The time is set but nothing can act on it — say so here rather
              // than let the row keep promising a sweep that never arrives.
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Turn on notifications"
                onPress={alarm.openSettings}
                style={styles.blocked}>
                <Text style={[styles.blockedText, { color: c.accent }]}>
                  Notifications are off, so the sweep cannot reach you. Turn
                  them on →
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}

      <SectionHeading>How it works</SectionHeading>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="App guide"
        accessibilityHint="What ThinkLighter does with what you catch"
        accessibilityState={{ expanded: guiding }}
        onPress={() => setGuiding(v => !v)}
        style={({ pressed }) => [
          styles.row,
          pressed && { backgroundColor: c.tint },
        ]}>
        <View style={styles.body}>
          <Text style={[styles.label, { color: c.ink }]}>App guide</Text>
          <Text style={[styles.desc, { color: c.ink }]}>
            What the app does with what you catch.
          </Text>
        </View>
        <View style={[styles.chip, { borderColor: c.ink }]}>
          <Text style={[styles.chipLabel, { color: c.ink }]}>
            {guiding ? 'Close' : 'Read'}
          </Text>
        </View>
      </Pressable>
      {guiding && (
        <View style={styles.guide}>
          {appGuide.map(section => (
            <View key={section.title}>
              <Kicker style={styles.guideTitle}>{section.title}</Kicker>
              <Text style={[styles.guideBody, { color: c.ink }]}>
                {section.body}
              </Text>
            </View>
          ))}
        </View>
      )}
      <DashedRule />

      <SectionHeading>This device</SectionHeading>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Clear all local data"
        accessibilityHint="Asks you to confirm before anything is deleted"
        onPress={() => setClearing(true)}
        style={({ pressed }) => [
          styles.row,
          pressed && { backgroundColor: c.tint },
        ]}>
        <View style={styles.body}>
          <Text style={[styles.label, { color: c.ink }]}>
            Clear all local data
          </Text>
          <Text style={[styles.desc, { color: c.ink }]}>
            Every capture on this phone, and your settings with them.
          </Text>
        </View>
        {/* The accent, because this is the one row that takes something away. */}
        <View style={[styles.chip, { borderColor: c.accent }]}>
          <Text style={[styles.chipLabel, { color: c.accent }]}>Clear</Text>
        </View>
      </Pressable>
      <DashedRule />

      {!!open && (
        <OptionSheet
          title={open.label}
          options={open.options}
          value={s.settings[open.key]}
          onPick={option => s.actions.setSetting(open.key, option)}
          onClose={() => setPicking(null)}
        />
      )}

      {clearing && (
        <ConfirmSheet
          title={'Clear\neverything?'}
          body="Every capture on this phone is deleted, open or answered, along with the notes and photos attached to them. Your settings go back to their defaults. Nothing is copied anywhere else, so there is no way back from this."
          confirmLabel="Clear everything"
          onCancel={() => setClearing(false)}
          onConfirm={() => {
            setClearing(false);
            s.actions.clearData();
          }}
        />
      )}

      <Text style={[styles.footnote, { color: c.mute }]}>
        * ThinkLighter stores captures on device. Sweep runs locally.
      </Text>
    </View>
  );
};
