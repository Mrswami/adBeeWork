module.exports = [
    // Global settings
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: {
                console: "readonly",
                process: "readonly",
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-console": "off",
            "no-undef": "error"
        }
    },
    // Backend and general JS
    {
        files: ["**/*.js"],
        ignores: ["public/**", "tests/**"],
        languageOptions: {
            globals: {
                node: true,
                __dirname: "readonly",
                require: "readonly",
                module: "readonly",
            }
        }
    },
    // Browser files
    {
        files: ["public/**/*.js"],
        languageOptions: {
            globals: {
                window: "readonly",
                document: "readonly",
                fetch: "readonly",
                localStorage: "readonly",
                location: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                alert: "readonly",
                URLSearchParams: "readonly",
                Intl: "readonly",
            }
        },
        rules: {
            "no-unused-vars": "off"
        }
    },
    // Test files
    {
        files: ["tests/**/*.test.js"],
        languageOptions: {
            globals: {
                jest: true,
                describe: "readonly",
                it: "readonly",
                expect: "readonly",
                require: "readonly",
                module: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
            }
        }
    }
];
