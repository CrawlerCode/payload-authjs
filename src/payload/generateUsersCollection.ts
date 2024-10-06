import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { CollectionConfig, Field } from "payload";
import { withPayload } from "../authjs/withPayload";
import { AuthjsAuthStrategy } from "./AuthjsAuthStrategy";
import type { AuthjsPluginConfig } from "./plugin";

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

  // Add or patch fields in users collection
  createOrPatchField(collection.fields, {
    name: "id",
    type: "text",
    admin: {
      readOnly: true,
    },
  });
  createOrPatchField(collection.fields, {
    name: "email",
    type: "email",
    required: true,
    // unique: true,
  });
  createOrPatchField(collection.fields, {
    name: "name",
    type: "text",
  });
  createOrPatchField(collection.fields, {
    name: "image",
    type: "text",
  });
  createOrPatchField(collection.fields, {
    name: "emailVerified",
    type: "date",
  });
  createOrPatchField(collection.fields, {
    name: "accounts",
    type: "array",
    fields: [
      {
        name: "id",
        type: "text",
        admin: {
          disabled: true,
        },
      },
      { name: "provider", type: "text", required: true },
      { name: "providerAccountId", type: "text", required: true },
      { name: "type", type: "text", required: true },
    ],
    admin: {
      readOnly: true,
      position: "sidebar",
      initCollapsed: true,
    },
  });
  createOrPatchField(collection.fields, {
    name: "sessions",
    type: "array",
    fields: [
      {
        name: "id",
        type: "text",
        admin: {
          disabled: true,
        },
      },
      { name: "sessionToken", type: "text", required: true },
      { name: "expires", type: "date", required: true },
    ],
    admin: {
      readOnly: true,
      position: "sidebar",
      initCollapsed: true,
    },
  });
  createOrPatchField(collection.fields, {
    name: "verificationTokens",
    type: "array",
    fields: [
      {
        name: "id",
        type: "text",
        admin: {
          disabled: true,
        },
      },
      { name: "token", type: "text", required: true },
      { name: "expires", type: "date", required: true },
    ],
    admin: {
      readOnly: true,
      position: "sidebar",
      initCollapsed: true,
    },
  });

  // Add auth strategy to users collection
  collection.auth = {
    disableLocalStrategy: true,
    strategies: [AuthjsAuthStrategy(userCollectionSlug, pluginOptions)],
  };

  // Add custom endpoints to users collection
  collection.endpoints = [
    ...(collection.endpoints || []),
    {
      /**
       * Override the default logout endpoint to destroy the authjs session
       *
       * @see https://payloadcms.com/docs/beta/authentication/operations#logout
       * @see https://github.com/payloadcms/payload/blob/beta/packages/next/src/routes/rest/auth/logout.ts
       */
      method: "post",
      path: "/logout",
      handler: async req => {
        // Sign out and get cookies from authjs
        const { signOut } = NextAuth(
          withPayload(pluginOptions.authjsConfig, {
            payload: req.payload,
            userCollectionSlug,
          }),
        );
        const { cookies } = await signOut({ redirect: false });

        // Create response with cookies
        const response = NextResponse.json({
          message: req.t("authentication:logoutSuccessful"),
        });
        for (const cookie of cookies) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
        return response;
      },
    },
  ];
};

function createOrPatchField(fields: Field[], field: Field): void {
  const existingField = fields.find(
    collectionField =>
      "name" in collectionField && "name" in field && collectionField.name === field.name,
  );
  if (!existingField) {
    fields.push(field);
  } else {
    if ("fields" in field && "fields" in existingField) {
      field.fields.forEach(subField => createOrPatchField(existingField.fields, subField));
      // eslint-disable-next-line no-param-reassign
      field.fields = existingField.fields;
    }
    Object.assign(existingField, field);
  }
}
