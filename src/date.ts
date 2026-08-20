/**
 * The canvas hard-coded "Tuesday · 20 August"; a shipping app says today.
 *
 * @format
 */

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const longDate = (d: Date = new Date(Date.now())) =>
  `${DAYS[d.getDay()]} · ${d.getDate()} ${MONTHS[d.getMonth()]}`;

const pad2 = (n: number) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' in local time — the granularity a deferral needs. */
export const isoDay = (d: Date = new Date(Date.now())) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/**
 * Calendar arithmetic, not clock arithmetic: adding 24 hours lands on the
 * wrong day either side of a daylight-saving change.
 */
export const tomorrow = (from: Date = new Date(Date.now())) => {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  return isoDay(d);
};

/**
 * The exact moment something was caught, to the minute:
 * "21 Aug 2026 · 00:34". Rendered uppercase by the row that shows it.
 */
export const stamp = (ms: number) => {
  const d = new Date(ms);
  const month = MONTHS[d.getMonth()].slice(0, 3);
  return `${d.getDate()} ${month} ${d.getFullYear()} · ${pad2(
    d.getHours(),
  )}:${pad2(d.getMinutes())}`;
};
