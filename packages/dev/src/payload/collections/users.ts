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
      type: "tabs",
      tabs: [
        {
          label: () => "User Accounts", // Change tab label
          custom: {
            originalTabLabel: "Accounts",
          },
          fields: [
            /**
             * Add currentAccount field
             * This field is virtual and will not be stored in the database
             */
            {
              name: "currentAccount",
              type: "group",
              label: "Current Account",
              virtual: true,
              admin: {
                hidden: true,
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "provider",
                      type: "text",
                    },
                    {
                      name: "providerAccountId",
                      type: "text",
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "access_token",
                      type: "text",
                    },
                    {
                      name: "refresh_token",
                      type: "text",
                    },
                    {
                      name: "expires_at",
                      type: "date",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
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
        // Add access_token field
        {
          name: "access_token",
          type: "text",
        },
        // Add custom field
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
    // Add custom database fields
    {
      name: "additionalUserDatabaseField",
      type: "text",
    },
    // Add custom virtual field
    {
      name: "additionalUserVirtualField",
      type: "text",
      virtual: true,
      admin: {
        hidden: true,
      },
    },
    /**
     * Add locale field
     */
    {
      name: "locale",
      type: "text",
    },
    /**
     * Add roles field
     * This field is virtual and will not be stored in the database
     */
    {
      name: "roles",
      type: "json",
      virtual: true,
      admin: {
        hidden: true,
      },
      typescriptSchema: [
        () => ({
          type: "array",
          items: {
            type: "string",
          },
        }),
      ],
    },
  ],
};

export default Users;
