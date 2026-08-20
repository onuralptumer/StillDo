/**
 * @format
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tabs } from '../data';
import { font, space } from '../theme';
import type { Screen } from '../types';
import { DashedRule } from './primitives';
import { useTheme } from './ThemeContext';

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: space.gutter,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  label: {
    fontFamily: font.medium,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 5,
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
    <View>
      <DashedRule />
      <View style={styles.bar}>
        {tabs.map(([key, label]) => {
          const on = active === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => onSelect(key as Screen)}
              style={styles.tab}>
              <Text style={[styles.label, { color: on ? c.ink : c.mute }]}>
                {label}
              </Text>
              <DashedRule color={on ? c.ink : 'transparent'} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
