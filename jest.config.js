module.exports = {
    roots: [
        '<rootDir>'
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],
    collectCoverageFrom: [
        './src/**/*.ts'
    ],
    coveragePathIgnorePatterns: [
        '/src/bin/'
    ],
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    testMatch: [
        '**/?(*.)+(spec|test|unit).ts?(x)',
    ],
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest'
    },
    globalSetup: './test/global.setup.ts',
    moduleNameMapper: {
        '^axios$': require.resolve('axios'),
        '^@opentelemetry/otlp-exporter-base/node-http$': '<rootDir>/node_modules/@opentelemetry/otlp-exporter-base/build/src/index-node-http.js',
    }
};
