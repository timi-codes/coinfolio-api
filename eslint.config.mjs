import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';
import jestPlugin from 'eslint-plugin-jest';
import globals from "globals";

export default [
    js.configs.recommended,
    {
        ignores: ['dist/**'],
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            '@typescript-eslint': tsPlugin,
            'import': importPlugin,
            jest: jestPlugin,
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
            },
            globals: {
                ...jestPlugin.environments.globals.globals,
                ...globals.node,
            }
        },
        rules: {
            ...tsPlugin.configs['recommended'].rules,
            ...jestPlugin.configs['recommended'].rules,
            '@/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
            '@/no-throw-literal': 'error',
            'import/prefer-default-export': 'off',
            'class-methods-use-this': 'off',
            "jest/prefer-importing-jest-globals": "error",
        },
    },
    prettier,
];