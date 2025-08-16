import 'react-native-gesture-handler/jestSetup';

// Mock Reanimated v4+ with worklets
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

// Mock vector icons to avoid native module issues in Jest
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
