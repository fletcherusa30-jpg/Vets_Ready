module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'data/**/*.ts',
    'core/**/*.ts',
    'domains/**/*.ts',
    'integrations/**/*.ts',
    'ui/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@data/(.*)$': '<rootDir>/data/$1',
    '^@core/(.*)$': '<rootDir>/core/$1',
    '^@domains/(.*)$': '<rootDir>/domains/$1',
    '^@integrations/(.*)$': '<rootDir>/integrations/$1',
    '^@ui/(.*)$': '<rootDir>/ui/$1'
  }
};
