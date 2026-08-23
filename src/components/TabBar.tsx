/**
 * A floating pill bar: the active tab carries its label, the rest are marks.
 *
 * @format
 */

import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { tabs } from '../data';
import { font } from '../theme';
import type { Screen } from '../types';
import { TAB_ICONS } from './icons';
import { useTheme } from './ThemeContext';

const HEIGHT = 62;

const styles = StyleSheet.create({
  bar: {
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    // Enough lift to read as floating over the page, no more.
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 5 },
    }),
  },
  tab: {
    height: 46,
    minWidth: 46,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  /** Only the active tab is wide enough to say its name. */
  chosen: { paddingHorizontal: 18 },
  label: {
    fontFamily: font.medium,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export const TabBar = ({
  active,
  onSelect,
}: {
  active: Screen;
  onSelect: (screen: Screen) => void;
}) => {
  const c = useTheme();
  return (
    <View style={[styles.bar, { backgroundColor: c.raise }]}>
      {tabs.map(([key, label]) => {
        const on = active === key;
        const Icon = TAB_ICONS[key as Screen];
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: on }}
            onPress={() => onSelect(key as Screen)}
            style={({ pressed }) => [
              styles.tab,
              on && styles.chosen,
              on && { backgroundColor: c.raiseHi },
              pressed && !on && { backgroundColor: c.tint },
            ]}>
            {/*
              Dimmed ink rather than the mute tone: against the raised bar,
              mute nearly disappears in the dark theme, and these are the
              app's only means of navigation.
            */}
            <Icon color={c.ink} opacity={on ? 1 : 0.55} />
            {on && (
              <Text style={[styles.label, { color: c.ink }]}>{label}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

export const TAB_BAR_HEIGHT = HEIGHT;
