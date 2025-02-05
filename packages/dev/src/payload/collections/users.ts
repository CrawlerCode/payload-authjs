import type { CollectionConfig } from "payload";
import { createdAtField } from "../fields/createdAt";

const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "name",
  },
  access: {
    /* admin: ({ req: { user } }) => {
      return user?.roles?.includes("admin") ?? false;
    }, */
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Username", // Add label to name field
    },
    {
      name: "id",
      type: "text",
      label: "Identifier",
      admin: {
        hidden: true, // Hide id field in admin panel
      },
    },
    {
      name: "accounts",
      type: "array",
      fields: [
        {
          name: "provider",
          type: "text",
          label: "Account Provider", // Add label to provider field
        },
        // Add new field to accounts
        {
          name: "access_token",
          type: "text",
        },
        {
          name: "additionalAccountDatabaseField",
          type: "text",
          required: true,
        },
        createdAtField,
      ],
    },
    /* {
      name: "sessions",
      type: "array",
      fields: [createdAtField],
    }, */
    {
      name: "verificationTokens",
      type: "array",
      fields: [createdAtField],
    },
    // Add custom field
    {
      name: "additionalUserDatabaseField",
      type: "text",
      required: true,
    },
    {
      name: "additionalUserVirtualField",
      type: "text",
      virtual: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: "locale",
      type: "text",
    },
    /**
     * Add roles field
     * This field will not be stored in the database
     */
    {
      name: "roles",
      type: "json",
      virtual: true,
      typescriptSchema: [
        () => ({
          type: "array",
          items: {
            type: "string",
          },
        }),
      ],
      admin: {
        hidden: true,
      },
    },
  ],
};

export default Users;
