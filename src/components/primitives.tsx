/**
 * Typographic and rule primitives shared by every screen.
 *
 * @format
 */

import React from 'react';
import { StyleSheet, Text, View, type TextProps } from 'react-native';
import { font, space } from '../theme';
import { useTheme } from './ThemeContext';

const styles = StyleSheet.create({
  kicker: {
    fontFamily: font.medium,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // The canvas sets `line-height:.9`; CSS lets glyphs overflow that box, but
  // React Native clips to it and shears the tops off the caps. 1.0 is the
  // tightest leading that still renders whole letters.
  display: {
    fontFamily: font.medium,
    fontSize: 34,
    lineHeight: 34,
    textTransform: 'uppercase',
  },
  displayLarge: {
    fontFamily: font.medium,
    fontSize: 41,
    lineHeight: 41,
    textTransform: 'uppercase',
  },
  lead: {
    fontFamily: font.regular,
    fontSize: 17,
    lineHeight: 21.4,
  },
  cardTitle: {
    fontFamily: font.medium,
    fontSize: 24,
    lineHeight: 26.2,
    textTransform: 'uppercase',
  },
  cardNote: {
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 18.9,
    opacity: 0.75,
  },
  rule: {
    height: 1,
    overflow: 'hidden',
  },
  // Clipping a fully-dashed box to 1pt is the only way to get a dashed edge
  // that renders on both platforms.
  ruleInner: {
    height: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});

export const Kicker = ({ style, ...rest }: TextProps) => {
  const c = useTheme();
  return <Text {...rest} style={[styles.kicker, { color: c.mute }, style]} />;
};

export const Display = ({ style, ...rest }: TextProps) => {
  const c = useTheme();
  return <Text {...rest} style={[styles.display, { color: c.ink }, style]} />;
};

export const DisplayLarge = ({ style, ...rest }: TextProps) => {
  const c = useTheme();
  return (
    <Text {...rest} style={[styles.displayLarge, { color: c.ink }, style]} />
  );
};

export const Lead = ({ style, ...rest }: TextProps) => {
  const c = useTheme();
  return <Text {...rest} style={[styles.lead, { color: c.ink }, style]} />;
};

export const CardTitle = ({ style, ...rest }: TextProps) => {
  const c = useTheme();
  return <Text {...rest} style={[styles.cardTitle, { color: c.ink }, style]} />;
};

export const CardNote = ({ style, ...rest }: TextProps) => {
  const c = useTheme();
  return <Text {...rest} style={[styles.cardNote, { color: c.ink }, style]} />;
};

export const DashedRule = ({
  marginTop = 0,
  color,
}: {
  marginTop?: number;
  color?: string;
}) => {
  const c = useTheme();
  return (
    <View style={[styles.rule, { marginTop }]}>
      <View style={[styles.ruleInner, { borderColor: color ?? c.line }]} />
    </View>
  );
};

const headingLabel = { marginTop: space.rule };

/** A dashed rule with the section label sitting under it. */
export const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <>
    <DashedRule marginTop={space.section} />
    <Kicker style={headingLabel}>{children}</Kicker>
  </>
);
