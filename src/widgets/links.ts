/**
 * The URLs the widgets open the app with.
 *
 * A widget cannot run the app's code; all it can do is launch it pointing at
 * one of these. Parsing is deliberately its own pure function so the routes
 * can be tested without a running app.
 *
 * @format
 */

export const SCHEME = 'stilldo';

/** Which capture the Quick Capture widget was tapped for. */
export type CaptureKind = 'voice' | 'text' | 'photo';

export type WidgetLink =
  /** Open the Inbox with that capture already reaching for the hardware. */
  | { kind: 'capture'; how: CaptureKind }
  /** Open the one task the "Right now" widget was showing. */
  | { kind: 'now' }
  /** The sweep, from the widget's "tap to sweep" line. */
  | { kind: 'sweep' };

const CAPTURES: CaptureKind[] = ['voice', 'text', 'photo'];

const isCapture = (s: string): s is CaptureKind =>
  (CAPTURES as string[]).includes(s);

/**
 * `stilldo://capture/voice` and friends. Anything else — another scheme, a
 * route a later build added, a truncated URL — is null, and the app just opens
 * where it was.
 */
export function parseWidgetLink(url: string | null | undefined): WidgetLink | null {
  if (!url) return null;

  const mark = url.indexOf('://');
  if (mark < 0) return null;
  if (url.slice(0, mark).toLowerCase() !== SCHEME) return null;

  const path = url.slice(mark + 3).split(/[?#]/)[0];
  const parts = path
    .split('/')
    .filter(Boolean)
    .map(p => p.toLowerCase());

  if (parts[0] === 'capture' && isCapture(parts[1])) {
    return { kind: 'capture', how: parts[1] };
  }
  if (parts.length === 1 && parts[0] === 'now') return { kind: 'now' };
  if (parts.length === 1 && parts[0] === 'sweep') return { kind: 'sweep' };
  return null;
}

/** The other direction, for the native widget definitions to be built against. */
export const linkFor = (link: WidgetLink): string =>
  link.kind === 'capture' ? `${SCHEME}://capture/${link.how}` : `${SCHEME}://${link.kind}`;
