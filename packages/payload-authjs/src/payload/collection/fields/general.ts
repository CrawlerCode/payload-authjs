import type { Field } from "payload";
import type { AuthjsPluginConfig } from "src/payload/plugin";

/**
 * General fields for a user
 *
 * @see https://authjs.dev/concepts/database-models
 */
export const generalFields = (pluginOptions: AuthjsPluginConfig): Field[] => [
  ...(pluginOptions.enableLocalStrategy
    ? ([
        {
          name: "emailVerified",
          type: "date",
        },
      ] satisfies Field[])
    : ([
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
      ] satisfies Field[])),
  {
    name: "name",
    type: "text",
  },
  {
    name: "image",
    type: "text",
  },
];
