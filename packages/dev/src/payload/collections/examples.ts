import type { CollectionConfig } from "payload";
import { hasRole } from "../access/hasRole";

const Examples: CollectionConfig<"examples"> = {
  slug: "examples",
  admin: {
    useAsTitle: "someField",
  },
  access: {
    read: hasRole("user"),
    create: hasRole("admin"),
    update: hasRole("admin"),
    delete: hasRole("admin"),
  },
  fields: [
    {
      name: "someField",
      type: "text",
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      maxDepth: 0,
    },
  ],
};

export default Examples;
