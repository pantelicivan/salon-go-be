import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*spec.ts'],
  // Default is ["/node_modules/"], which we remove because all tests
  // are in the test folder. It improves performance a bit.
  testPathIgnorePatterns: [],
  moduleFileExtensions: ['ts', 'json', 'js'],
  // transform: {
  //   '^.+\\.(t|j)s$': 'ts-jest',
  // },
  moduleNameMapper: {
    '^(src|test)/(.*)$': '<rootDir>/$1/$2',
  },
};
export default config;
