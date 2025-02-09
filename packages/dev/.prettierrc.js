import baseConfig from "../../.prettierrc.json" assert { type: "json" };

/**
 * @type {import("prettier").Config}
 */
const config = {
  ...baseConfig,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/(app)/globals.scss",
};

export default config;
