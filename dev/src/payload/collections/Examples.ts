import type { CollectionConfig } from "payload";
import { hasRole } from "../access/hasRole";

const Examples: CollectionConfig = {
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
  ],
};

export default Examples;
