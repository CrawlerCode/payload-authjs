import { Field, type CollectionConfig } from "payload";
import { AuthjsAuthStrategy } from "./AuthjsAuthStrategy";
import { AuthjsPluginConfig } from "./types";

export const generateUsersCollection = (
  collections: CollectionConfig[],
  pluginOptions: AuthjsPluginConfig,
) => {
  // Get or create users collection
  const userCollectionSlug = pluginOptions.userCollectionSlug || "users";
  let collection = collections?.find(collection => collection.slug === userCollectionSlug);
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
    //unique: true,
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

  return collection;
};

function createOrPatchField(fields: Field[], field: Field) {
  let existingField = fields.find(
    collectionField =>
      "name" in collectionField && "name" in field && collectionField.name === field.name,
  );
  if (!existingField) {
    fields.push(field);
  } else {
    if ("fields" in field && "fields" in existingField) {
      field.fields.forEach(subField => createOrPatchField(existingField.fields, subField));
      field.fields = existingField.fields;
    }
    Object.assign(existingField, field);
  }
}
