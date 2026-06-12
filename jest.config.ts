import type {Config} from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/src/__mocks__/fileMock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/src/__mocks__/styleMock.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: [
    '<rootDir>/src/**/*.spec.{ts,tsx}',
    '<rootDir>/__tests__/**/*.spec.{ts,tsx}',
    '<rootDir>/scripts/**/*.spec.{ts,tsx}',
    '<rootDir>/tools/**/*.spec.{ts,tsx}',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/.worktrees/',
    '<rootDir>/.claude/worktrees/',
  ],
};

export default config;
