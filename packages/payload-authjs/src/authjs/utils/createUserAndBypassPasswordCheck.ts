import crypto from "crypto";
import type { Payload, RequiredDataFromCollectionSlug } from "payload";

/**
 * Create a user and bypass the password check
 * This is because payload requires a password to be set when creating a user
 *
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/collections/operations/create.ts#L254
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/auth/strategies/local/generatePasswordSaltHash.ts
 */
export const createUserAndBypassPasswordCheck = async <TSlug extends "users-with-local-strategy">(
  payload: Payload,
  {
    collection,
    data,
  }: {
    collection: TSlug;
    data: RequiredDataFromCollectionSlug<TSlug>;
  },
) => {
  // Generate a random password
  data.password = crypto.randomBytes(32).toString("hex");

  // Create the user
  const user = await payload.create({
    collection,
    data,
  });

  // Remove the salt and hash after the user was created
  await payload.update({
    collection,
    id: user.id,
    data: {
      salt: null,
      hash: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  });

  return user;
};
