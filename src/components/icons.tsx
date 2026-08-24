/**
 * The app's marks — the four tabs, and the few controls that say it with a
 * stroke rather than a word.
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

export type IconProps = { color: string; size?: number; opacity?: number };

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

/**
 * Settings: a gear. Eight teeth rather than the usual twelve — at 22px the
 * finer ones close up into a ring and lose the shape entirely.
 */
export const GearIcon = (p: IconProps) => (
  <Frame {...p}>
    <Path d="M10.32 3.4a1.2 1.2 0 0 1 1.2-1h.96a1.2 1.2 0 0 1 1.2 1l.16 1.24a7 7 0 0 1 1.7.7l1-.76a1.2 1.2 0 0 1 1.57.1l.68.68a1.2 1.2 0 0 1 .1 1.57l-.76 1a7 7 0 0 1 .7 1.7l1.24.16a1.2 1.2 0 0 1 1 1.2v.96a1.2 1.2 0 0 1-1 1.2l-1.24.16a7 7 0 0 1-.7 1.7l.76 1a1.2 1.2 0 0 1-.1 1.57l-.68.68a1.2 1.2 0 0 1-1.57.1l-1-.76a7 7 0 0 1-1.7.7l-.16 1.24a1.2 1.2 0 0 1-1.2 1h-.96a1.2 1.2 0 0 1-1.2-1l-.16-1.24a7 7 0 0 1-1.7-.7l-1 .76a1.2 1.2 0 0 1-1.57-.1l-.68-.68a1.2 1.2 0 0 1-.1-1.57l.76-1a7 7 0 0 1-.7-1.7l-1.24-.16a1.2 1.2 0 0 1-1-1.2v-.96a1.2 1.2 0 0 1 1-1.2l1.24-.16a7 7 0 0 1 .7-1.7l-.76-1a1.2 1.2 0 0 1 .1-1.57l.68-.68a1.2 1.2 0 0 1 1.57-.1l1 .76a7 7 0 0 1 1.7-.7Z" />
    <Circle cx={12} cy={12} r={2.75} fill="none" />
  </Frame>
);

/** Add: the plus on the inbox field, cut to the same cross as the rules. */
export const PlusIcon = (p: IconProps) => (
  <Frame {...p}>
    <Line x1={12} y1={5.5} x2={12} y2={18.5} />
    <Line x1={5.5} y1={12} x2={18.5} y2={12} />
  </Frame>
);

export const TAB_ICONS: Record<Screen, (p: IconProps) => React.ReactElement> = {
  today: TodayIcon,
  inbox: InboxIcon,
  sweep: SweepIcon,
  settings: GearIcon,
  // Detail has no tab of its own; the tab bar shows whatever it was opened from.
  detail: TodayIcon,
};
