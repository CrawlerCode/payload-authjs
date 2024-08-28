import type { Plugin } from "payload";
import { generateUsersCollection } from "./generateUsersCollection";
import type { AuthjsPluginConfig } from "./types";

export const authjsPlugin =
  (pluginOptions: AuthjsPluginConfig): Plugin =>
  incomingConfig => {
    let config = { ...incomingConfig };

    // If the plugin is disabled, return the config as is
    if (pluginOptions.enabled === false) return config;

    // Generate users collection
    config.collections = config.collections ?? [];
    generateUsersCollection(config.collections, pluginOptions);

    return config;
  };
