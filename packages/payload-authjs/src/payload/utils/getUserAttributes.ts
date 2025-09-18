import type { User as AuthjsUser } from "next-auth";
import type { DataFromCollectionSlug, Field } from "payload";
import type { AuthCollectionSlug } from "../plugin";

/**
 * Get user attributes from a user object based on the fields
 *
 * @param user User object
 * @param fields Fields to get from the user object
 * @returns Object with specified fields from the user object
 */
export const getUserAttributes = <TSlug extends AuthCollectionSlug>(
  user: AuthjsUser,
  fields: Field[],
): Partial<DataFromCollectionSlug<TSlug>> => {
  return fields.reduce((acc: Partial<DataFromCollectionSlug<TSlug>>, field) => {
    if ("name" in field) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val = user[field.name as keyof AuthjsUser] as any;
      acc[field.name as keyof DataFromCollectionSlug<TSlug>] = val;
    }
    return acc;
  }, {});
};
