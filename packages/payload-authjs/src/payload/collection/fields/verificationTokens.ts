import type { Field } from "payload";

/**
 * Verification tokens field for a user
 *
 * @see https://authjs.dev/concepts/database-models
 */
export const verificationTokensField: Field = {
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
    {
      type: "row",
      fields: [
        { name: "token", type: "text", required: true, index: true },
        { name: "expires", type: "date", required: true },
      ],
    },
  ],
  admin: {
    initCollapsed: true,
  },
  access: {
    create: () => false,
    update: () => false,
  },
};
