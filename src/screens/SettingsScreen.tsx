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
import { OptionSheet } from '../components/OptionSheet';
import { settingDefs } from '../data';
import { font, radius, space } from '../theme';
import type { SettingKey } from '../types';
import type { Stilldo } from '../useStilldo';

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

export const SettingsScreen = ({ s }: { s: Stilldo }) => {
  const c = useTheme();
  const [picking, setPicking] = useState<SettingKey | null>(null);
  const open = settingDefs.find(d => d.key === picking);

  return (
    <View style={styles.page}>
      <Kicker>Tune the memory</Kicker>
      <Display style={styles.display}>Settings</Display>

      <SectionHeading>The sweep</SectionHeading>
      {settingDefs.map(({ key, label, desc, options, pick }) => {
        const value = s.settings[key];
        const off = value === 'Off';
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
              <View
                style={[styles.chip, { borderColor: off ? c.line : c.ink }]}>
                <Text
                  style={[styles.chipLabel, { color: off ? c.mute : c.ink }]}>
                  {value}
                </Text>
              </View>
            </Pressable>
            <DashedRule />
          </View>
        );
      })}

      {!!open && (
        <OptionSheet
          title={open.label}
          options={open.options}
          value={s.settings[open.key]}
          onPick={option => s.actions.setSetting(open.key, option)}
          onClose={() => setPicking(null)}
        />
      )}

      <Text style={[styles.footnote, { color: c.mute }]}>
        * Stilldo stores captures on device. Sweep runs locally.
      </Text>
    </View>
  );
};
