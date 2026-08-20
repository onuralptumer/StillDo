/**
 * @format
 */

module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // Both capture libraries ship untranspiled sources.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community|-voice)?|react-native-image-picker)/)',
  ],
};
