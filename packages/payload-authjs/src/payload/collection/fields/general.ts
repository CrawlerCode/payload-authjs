import type { Field } from "payload";

/**
 * General fields for a user
 *
 * @see https://authjs.dev/concepts/database-models
 */
export const generalFields: Field[] = [
  {
    type: "row",
    fields: [
      {
        name: "email",
        type: "email",
        required: true,
        unique: true,
        index: true,
      },
      {
        name: "emailVerified",
        type: "date",
      },
    ],
  },
  {
    name: "name",
    type: "text",
  },
  {
    name: "image",
    type: "text",
  },
];
