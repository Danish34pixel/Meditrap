module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // RN 0.80+: Reanimated plugin moved to worklets
    'react-native-worklets/plugin',
  ],
};
