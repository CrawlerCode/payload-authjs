import type { Field } from "payload";

/**
 * Accounts field for a user
 *
 * @see https://authjs.dev/concepts/database-models
 */
export const accountsField: Field = {
  name: "accounts",
  type: "array",
  fields: [
    {
      type: "row",
      fields: [
        { name: "provider", type: "text", required: true },
        { name: "providerAccountId", type: "text", required: true, index: true },
        { name: "type", type: "text", required: true },
      ],
    },
  ],
  admin: {
    initCollapsed: true,
    components: {
      RowLabel: "payload-authjs/components#AccountRowLabel",
    },
  },
  access: {
    create: () => false,
    update: () => false,
  },
};
