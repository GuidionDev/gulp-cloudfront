module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  moduleFileExtensions: [
    'ts',
    'js'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testMatch: [
    '**/__tests__/**/*.test.(ts|js)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist'
  ],
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100
    }
  },
};
