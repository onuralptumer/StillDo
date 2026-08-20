/**
 * Stand-ins for the two native capture modules. Tests drive the speech
 * handlers directly, the same way the recogniser would.
 *
 * @format
 */

jest.mock('@react-native-voice/voice', () => ({
  __esModule: true,
  default: {
    start: jest.fn(() => Promise.resolve()),
    stop: jest.fn(() => Promise.resolve()),
    destroy: jest.fn(() => Promise.resolve()),
    removeAllListeners: jest.fn(),
  },
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(() => Promise.resolve({ didCancel: true })),
  launchImageLibrary: jest.fn(() => Promise.resolve({ didCancel: true })),
}));

// The app's SQLite driver is native; the store tests inject a node:sqlite one
// instead, so this only has to keep the import from exploding.
jest.mock('@op-engineering/op-sqlite', () => ({
  open: () => {
    throw new Error('op-sqlite is not available under test');
  },
}));
