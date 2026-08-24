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

// Notifee is native too. The tests drive this stand-in directly and assert on
// what the app asked it to schedule; the enums have to match the real ones.
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  AndroidImportance: { DEFAULT: 3 },
  AuthorizationStatus: { NOT_DETERMINED: -1, DENIED: 0, AUTHORIZED: 1, PROVISIONAL: 2 },
  RepeatFrequency: { NONE: -1, HOURLY: 0, DAILY: 1, WEEKLY: 2 },
  TriggerType: { TIMESTAMP: 0, INTERVAL: 1 },
  default: {
    requestPermission: jest.fn(() => Promise.resolve({ authorizationStatus: 1 })),
    getNotificationSettings: jest.fn(() =>
      Promise.resolve({ authorizationStatus: 1 }),
    ),
    createChannel: jest.fn(() => Promise.resolve('sweep')),
    createTriggerNotification: jest.fn(() => Promise.resolve('sweep')),
    cancelTriggerNotification: jest.fn(() => Promise.resolve()),
    openNotificationSettings: jest.fn(() => Promise.resolve()),
  },
}));

// Lottie is native. The intro renders it; the tests only care that the
// surrounding pane still works, so a plain host view stands in for it.
jest.mock('lottie-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props) => React.createElement(View, { ...props, testID: 'lottie' }),
  };
});
