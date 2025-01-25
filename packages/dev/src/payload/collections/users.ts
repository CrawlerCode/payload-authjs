import type { CollectionConfig } from "payload";

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
      ],
    },
    // Add custom field
    {
      name: "roles",
      type: "json",
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
