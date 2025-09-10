module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: [
        '<rootDir>/tests/**/*.test.js'
    ],
    collectCoverageFrom: [
        'src/js/**/*.js',
        '!src/js/libs/**',
        '!src/js/vendor/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    moduleFileExtensions: ['js', 'json'],
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    globals: {
        // CEP Environment Mocks
        'CSInterface': 'mock',
        'SystemPath': 'mock',
        'window': 'mock'
    }
};
