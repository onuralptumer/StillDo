/**
 * The tab marks.
 *
 * Drawn rather than imported from an icon set: at 22px with a 1.5 stroke they
 * carry the same weight as the app's hairlines and dashed rules, which an
 * off-the-shelf set does not.
 *
 * @format
 */

import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import type { Screen } from '../types';

type IconProps = { color: string; size?: number; opacity?: number };

const Frame = ({
  color,
  size = 22,
  opacity = 1,
  children,
}: IconProps & { children: React.ReactNode }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity={opacity}>
    {children}
  </Svg>
);

/** Today: the day itself, as a page with its date line. */
const TodayIcon = (p: IconProps) => (
  <Frame {...p}>
    <Rect x={3.5} y={5} width={17} height={15} rx={2.5} />
    <Line x1={3.5} y1={9.5} x2={20.5} y2={9.5} />
    <Line x1={8} y1={3} x2={8} y2={6} />
    <Line x1={16} y1={3} x2={16} y2={6} />
  </Frame>
);

/** Inbox: something dropped in and left alone. */
const InboxIcon = (p: IconProps) => (
  <Frame {...p}>
    <Path d="M12 3.5v9" />
    <Path d="M8.5 9.5 12 13l3.5-3.5" />
    <Path d="M4 15v3.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V15" />
  </Frame>
);

/** Sweep: the evening pass. */
const SweepIcon = (p: IconProps) => (
  <Frame {...p}>
    <Path d="M20 14.7A8.5 8.5 0 0 1 9.3 4a6.8 6.8 0 1 0 10.7 10.7Z" />
  </Frame>
);

/** Settings: the same sliders the reference uses. */
const SettingsIcon = (p: IconProps) => (
  <Frame {...p}>
    <Line x1={9} y1={4} x2={9} y2={20} />
    <Circle cx={9} cy={9} r={2.5} fill="none" />
    <Line x1={15} y1={4} x2={15} y2={20} />
    <Circle cx={15} cy={15} r={2.5} fill="none" />
  </Frame>
);

export const TAB_ICONS: Record<Screen, (p: IconProps) => React.ReactElement> = {
  today: TodayIcon,
  inbox: InboxIcon,
  sweep: SweepIcon,
  settings: SettingsIcon,
  // Detail has no tab of its own; the tab bar shows whatever it was opened from.
  detail: TodayIcon,
};
