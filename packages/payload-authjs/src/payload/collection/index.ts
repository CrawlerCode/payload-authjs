import type { CollectionConfig, Field, TabsField } from "payload";
import {
  isEmailProviderAvailable,
  isSessionStrategyDatabase,
  isWebauthnProviderAvailable,
} from "../../authjs/utils/config";
import { AuthjsAuthStrategy } from "../AuthjsAuthStrategy";
import type { AuthjsPluginConfig } from "../plugin";
import { mergeFields } from "../utils/mergeFields";
import { defaultAccess } from "./access";
import { refreshEndpoint } from "./endpoints/refresh";
import { accountsField } from "./fields/accounts";
import { authenticatorsField } from "./fields/authenticators";
import { generalFields } from "./fields/general";
import { sessionsField } from "./fields/session";
import { verificationTokensField } from "./fields/verificationTokens";
import { logoutHook } from "./hooks/logout";
import { meHook } from "./hooks/me";
import { refreshHook } from "./hooks/refresh";

export const generateUsersCollection = (
  collections: CollectionConfig[],
  pluginOptions: AuthjsPluginConfig,
): CollectionConfig => {
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
        defaultValue: () => crypto.randomUUID(),
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
            fields: generalFields(pluginOptions),
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
          // Add authenticators tab only if webauthn provider is available
          ...(isWebauthnProviderAvailable(pluginOptions.authjsConfig)
            ? [
                {
                  label: "Authenticators",
                  fields: [authenticatorsField(pluginOptions)],
                },
              ]
            : []),
        ],
      },
    ],
    patchFields: collection.fields, // User defined fields
  });
  const { topLevelFields, restTabFields } = restFields.reduce(
    (acc, field) => {
      // Sidebar fields must put at the top level
      if (field.admin?.position === "sidebar") {
        acc.topLevelFields.push(field);
      } else {
        acc.restTabFields.push(field);
      }
      return acc;
    },
    { topLevelFields: [] as Field[], restTabFields: [] as Field[] },
  );
  collection.fields = mergedFields;
  collection.fields.push(...topLevelFields); // Add top-level fields
  (collection.fields[1] as TabsField).tabs[0].fields.push(...restTabFields); // Add the rest fields to the general tab

  // Override the access control
  collection.access = {
    ...defaultAccess,
    ...collection.access,
  };

  // Add auth strategy to users collection
  const { strategies: authStrategies, ...authOptions } =
    typeof collection.auth === "object" ? collection.auth : {};
  collection.auth = {
    ...authOptions,
    strategies: [AuthjsAuthStrategy(collection), ...(authStrategies ?? [])],
    // Disable local strategy if not explicitly enabled
    ...(pluginOptions.enableLocalStrategy === true ? {} : { disableLocalStrategy: true }),
  };

  // Add hooks to users collection
  collection.hooks = {
    ...collection.hooks,
    me: [...(collection.hooks?.me || []), meHook(collection)],
    refresh: [...(collection.hooks?.refresh || []), refreshHook(collection)],
    afterLogout: [...(collection.hooks?.afterLogout || []), logoutHook],
  };

  // Add custom endpoints to users collection
  collection.endpoints = [
    ...(collection.endpoints || []),
    // Add the refresh endpoint
    refreshEndpoint,
  ];

  return collection;
};
