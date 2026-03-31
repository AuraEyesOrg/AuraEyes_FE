import type { Config } from 'jest';

const config: Config = {
  verbose: true,

  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  testEnvironment: 'jsdom',

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  roots: ['<rootDir>/src'],

  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
};

export default config;
