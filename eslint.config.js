// @ts-check

import payloadEsLintConfig from "@payloadcms/eslint-config";

export const defaultESLintIgnores = [
  "**/.temp",
  "**/.*", // ignore all dotfiles
  "**/.git",
  "**/next-env.d.ts",
  "**/jest.config.js",
  "**/eslint.config.js",
  "**/payload-types.ts",
  "packages/dev/src/app/(payload)/",
  "**/dist/",
  "**/build/",
  "**/node_modules/",
  "**/temp/",
  "examples/",
];

export default [
  ...payloadEsLintConfig,
  {
    // Modify any rules from payload's config that you want to override/disable
    rules: {
      "no-restricted-exports": "off",
      "perfectionist/sort-union-types": "off",
      "perfectionist/sort-objects": "off",
      "perfectionist/sort-interfaces": "off",
      "perfectionist/sort-object-types": "off",
      "perfectionist/sort-imports": "off",
      "perfectionist/sort-jsx-props": "off",
    },
  },
  {
    ignores: defaultESLintIgnores,
  },
  {
    languageOptions: {
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
        projectService: {
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 40,
          allowDefaultProject: ["scripts/*.ts", "*.js", "*.mjs", "*.spec.ts", "*.d.ts"],
        },
        // projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
