import { SESSION_STRATEGY } from "@/auth/base.config";
import type { CollectionConfig, Field } from "payload";
import { createdAtField } from "../fields/createdAt";

const Users: CollectionConfig<"users"> = {
  slug: "users",
  admin: {
    useAsTitle: "name",
  },
  access: {
    /* admin: ({ req: { user } }) => {
      return user?.roles?.includes("admin") ?? false;
    }, */
  },
  auth: {
    useAPIKey: true,
    depth: 0,
    loginWithUsername: {
      allowEmailLogin: true,
      requireEmail: true,
      requireUsername: false,
    },
    useSessions: false, // TODO: Database sessions currently not working
  },
  defaultPopulate: {
    id: true,
    name: true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Display-Name", // Add label to name field
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
                      name: "accessToken",
                      type: "text",
                    },
                    {
                      name: "refreshToken",
                      type: "text",
                    },
                    {
                      name: "expiresAt",
                      type: "date",
                    },
                    {
                      name: "refreshExpiresAt",
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
        // Add custom field
        {
          name: "additionalAccountDatabaseField",
          type: "text",
          required: true,
          defaultValue: () => `Default value at ${new Date().toISOString()}`,
        },
        createdAtField,
      ],
    },
    ...(SESSION_STRATEGY === "database"
      ? [
          {
            name: "sessions",
            type: "array",
            fields: [createdAtField],
          } satisfies Field,
        ]
      : []),
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
    /* {
      name: "examples",
      type: "join",
      collection: "examples",
      on: "author",
    }, */
  ],
  /* hooks: {
    afterLogout: [
      ({ req }) => {
        console.log("User logged out", req.user?.id);
      },
    ],
  }, */
};

export default Users;
