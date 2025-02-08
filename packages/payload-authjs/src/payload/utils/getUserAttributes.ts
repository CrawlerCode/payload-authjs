import type { User as AuthjsUser } from "next-auth";
import type { Field } from "payload";

/**
 * Get user attributes from a user object based on the fields
 *
 * @param user User object
 * @param fields Fields to get from the user object
 * @returns Object with specified fields from the user object
 */
export const getUserAttributes = (user: AuthjsUser, fields: Field[]) => {
  return fields.reduce((acc: Partial<AuthjsUser>, field) => {
    if ("name" in field) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val = user[field.name as keyof AuthjsUser] as any;
      acc[field.name as keyof AuthjsUser] = val;
    }
    return acc;
  }, {});
};
