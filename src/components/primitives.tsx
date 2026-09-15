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
    fontFamily: font.semibold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  display: {
    fontFamily: font.semibold,
    fontSize: 34,
    lineHeight: 40,
  },
  displayLarge: {
    fontFamily: font.semibold,
    fontSize: 41,
    lineHeight: 47,
  },
  lead: {
    fontFamily: font.regular,
    fontSize: 17,
    lineHeight: 21.4,
  },
  cardTitle: {
    fontFamily: font.semibold,
    fontSize: 24,
    lineHeight: 26.2,
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
  // A subtle separator between supporting details.
  ruleInner: {
    height: 2,
    borderWidth: 1,
    borderStyle: 'solid',
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

const headingLabel = {
  marginTop: space.section,
  marginBottom: 12,
  fontSize: 19,
};

/** A generously spaced section label. */
export const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <>
    <Kicker style={headingLabel}>{children}</Kicker>
  </>
);
