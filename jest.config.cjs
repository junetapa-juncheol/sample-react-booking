module.exports = {
  testEnvironment: 'jsdom',
  transform: { '^.+\\.[tj]sx?$': 'babel-jest' },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: { '\\.(css)$': '<rootDir>/src/test/style.cjs' },
  testMatch: ['<rootDir>/src/**/*.test.ts?(x)'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/main.tsx', '!src/test/**'],
};
