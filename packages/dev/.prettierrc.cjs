const baseConfig = require("../../.prettierrc.json");

/**
 * @type {import("prettier").Config}
 */
const config = {
  ...baseConfig,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/(app)/globals.css",
};

module.exports = config;
