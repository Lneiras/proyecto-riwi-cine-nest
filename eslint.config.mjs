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

    // Reglas específicas para los tests: los mocks son "any" por naturaleza,
    // así que estas reglas dan ruido en vez de valor
    {
        files: ["**/*.spec.ts", "test/**/*.ts"],

        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unnecessary-type-assertion": "off",
        },
    },
);
