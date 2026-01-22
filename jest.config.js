module.exports = {
    testEnvironment: 'jsdom',
    collectCoverageFrom: ['js/**/*.js', '!js/**/*.test.js', '!**/node_modules/**'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    testMatch: ['**/tests/**/*.test.js', '**/__tests__/**/*.js'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    moduleFileExtensions: ['js', 'json'],
    verbose: true
};
