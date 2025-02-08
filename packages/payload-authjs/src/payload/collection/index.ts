import type { CollectionConfig, TabsField } from "payload";
import { isEmailProviderAvailable, isSessionStrategyDatabase } from "../../authjs/utils/config";
import { AuthjsAuthStrategy } from "../AuthjsAuthStrategy";
import type { AuthjsPluginConfig } from "../plugin";
import { mergeFields } from "../utils/mergeFields";
import { defaultAccess } from "./access";
import { logoutEndpoint } from "./endpoints/logout";
import { accountsField } from "./fields/accounts";
import { generalFields } from "./fields/general";
import { sessionsField } from "./fields/session";
import { verificationTokensField } from "./fields/verificationTokens";
import { meHook } from "./hooks/me";

export const generateUsersCollection = (
  collections: CollectionConfig[],
  pluginOptions: AuthjsPluginConfig,
): void => {
  // Get or create users collection
  const userCollectionSlug = pluginOptions.userCollectionSlug || "users";
  let collection = collections?.find(c => c.slug === userCollectionSlug);
  if (!collection) {
    collection = {
      slug: userCollectionSlug,
      admin: {
        useAsTitle: "name",
      },
      fields: [],
    };
    collections.push(collection);
  }

  // Merge users collection fields
  const { mergedFields, restFields } = mergeFields({
    path: userCollectionSlug,
    baseFields: [
      {
        name: "id",
        type: "text",
        required: true,
        access: {
          create: () => false,
          update: () => false,
        },
      },
      {
        type: "tabs",
        tabs: [
          {
            label: "General",
            fields: generalFields,
          },
          {
            label: "Accounts",
            fields: [accountsField],
          },
          // Add sessions tab only if session strategy is database
          ...(isSessionStrategyDatabase(pluginOptions.authjsConfig)
            ? [
                {
                  label: "Sessions",
                  fields: [sessionsField],
                },
              ]
            : []),
          // Add verification tokens tab only if email provider is available
          ...(isEmailProviderAvailable(pluginOptions.authjsConfig)
            ? [
                {
                  label: "Verification Tokens",
                  fields: [verificationTokensField],
                },
              ]
            : []),
        ],
      },
    ],
    patchFields: collection.fields, // User defined fields
  });
  collection.fields = mergedFields;
  (collection.fields[1] as TabsField).tabs[0].fields.push(...restFields); // Add the rest fields to the general tab

  // Override the access control
  collection.access = {
    ...defaultAccess,
    ...collection.access,
  };

  // Add auth strategy to users collection
  collection.auth = {
    disableLocalStrategy: true,
    strategies: [AuthjsAuthStrategy(collection, pluginOptions)],
  };

  // Add hooks to users collection
  const _meHook = meHook(collection, pluginOptions);
  collection.hooks = {
    ...collection.hooks,
    me: [...(collection.hooks?.me || []), ...(_meHook ? [_meHook] : [])],
  };

  // Add custom endpoints to users collection
  collection.endpoints = [
    ...(collection.endpoints || []),
    // Add the logout endpoint
    logoutEndpoint(pluginOptions),
  ];
};
