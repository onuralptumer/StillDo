/**
 * A floating navigation bar with persistent labels and a highlighted selection.
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

const HEIGHT = 72;

const styles = StyleSheet.create({
  bar: {
    height: HEIGHT,
    borderRadius: 26,
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
    height: 56,
    minWidth: 46,
    borderRadius: 23,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
  },
  label: {
    fontFamily: font.medium,
    fontSize: 12,
    letterSpacing: 0,
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
    <View style={[styles.bar, { backgroundColor: c.ink }]}>
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
              on && { backgroundColor: c.accent },
              pressed && !on && { backgroundColor: c.tint },
            ]}
          >
            <Icon color={on ? c.onAccent : c.bg} opacity={on ? 1 : 0.7} />
            <Text style={[styles.label, { color: on ? c.onAccent : c.bg }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export const TAB_BAR_HEIGHT = HEIGHT;
