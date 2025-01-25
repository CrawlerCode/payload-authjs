import type { Field } from "payload";

/**
 * Sessions field for a user
 *
 * @see https://authjs.dev/concepts/database-models
 */
export const sessionsField: Field = {
  name: "sessions",
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
        { name: "sessionToken", type: "text", required: true, index: true },
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
