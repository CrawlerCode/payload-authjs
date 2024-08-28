import type { CollectionConfig } from "payload";
import { hasRole } from "../access/hasRole";

// Example Collection - For reference only, this must be added to payload.config.ts to be used.
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
