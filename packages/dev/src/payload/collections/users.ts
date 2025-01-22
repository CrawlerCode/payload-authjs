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
