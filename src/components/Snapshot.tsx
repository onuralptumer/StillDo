/**
 * The photo attached to a "Snap it" capture. It earns its place on the two
 * screens where you decide what to do about the task.
 *
 * @format
 */

import React from 'react';
import {
  Image,
  StyleSheet,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import { radius } from '../theme';
import { useTheme } from './ThemeContext';

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.card,
    borderWidth: 1,
  },
});

export const Snapshot = ({
  uri,
  style,
}: {
  uri: string;
  style?: StyleProp<ImageStyle>;
}) => {
  const c = useTheme();
  return (
    <Image
      accessibilityRole="image"
      accessibilityLabel="The photo caught with this task"
      source={{ uri }}
      resizeMode="cover"
      style={[styles.image, { borderColor: c.line }, style]}
    />
  );
};
