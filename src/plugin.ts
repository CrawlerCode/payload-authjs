import type { Plugin } from "payload";
import type { AuthjsPluginConfig } from "./types";

export const authjsPlugin =
  (pluginOptions: AuthjsPluginConfig): Plugin =>
  incomingConfig => {
    let config = { ...incomingConfig };

    // If the plugin is disabled, return the config as is
    if (pluginOptions.enabled === false) return config;

    return config;
  };
