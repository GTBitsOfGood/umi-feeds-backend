module.exports = {
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json'
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
        '**/test/**/*.test.(ts|js)'
    ],
    setupFiles: ['./test/test-environment-config.ts'], // RUNS THESE FILES BEFORE RUNNING TESTS (sets up environment)
    testEnvironment: 'node'
};
