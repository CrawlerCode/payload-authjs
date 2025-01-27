import { type Field } from "payload";

export const createdAtField: Field = {
  name: "createdAt",
  type: "date",
  required: true,
  defaultValue: () => new Date(),
};
