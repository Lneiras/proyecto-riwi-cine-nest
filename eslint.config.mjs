import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    {
        ignores: ["dist/**", "node_modules/**", "coverage/**"],
    },

    {
        files: ["**/*.ts"],

        extends: [eslint.configs.recommended, tseslint.configs.recommendedTypeChecked],

        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },

        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-floating-promises": "warn",
        },
    },

    // Reglas específicas para los tests
    {
        files: ["test/**/*.ts"],

        rules: {
            "@typescript-eslint/no-unsafe-argument": "off",
        },
    },
);
