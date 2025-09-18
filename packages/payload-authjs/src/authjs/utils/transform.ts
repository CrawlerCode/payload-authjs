import {
  type AdapterAccount,
  type AdapterAuthenticator,
  type AdapterSession,
  type AdapterUser,
  type VerificationToken as AdapterVerificationToken,
} from "next-auth/adapters";
import type { DataFromCollectionSlug } from "payload";
import type { AuthCollectionSlug } from "../../payload/plugin";

type User = Omit<DataFromCollectionSlug<AuthCollectionSlug>, "createdAt" | "updatedAt">;
type Account = NonNullable<User["accounts"]>[0];
type Session = NonNullable<User["sessions"]>[0];
type VerificationToken = NonNullable<User["verificationTokens"]>[0];
type Authenticator = NonNullable<User["authenticators"]>[0];

/**
 * Transform payload objects and adapter objects back and forth
 *
 * @see https://authjs.dev/guides/creating-a-database-adapter#official-adapter-guidelines
 */
export const transform = {
  user: {
    /**
     * Modifications:
     * - ~`accounts`~
     * - ~`sessions`~
     * - ~`verificationTokens`~
     * - ~`authenticators`~
     */
    toAdapter: (user: User): AdapterUser => {
      const userWithoutRelations = omit(user, [
        "accounts",
        "sessions",
        "verificationTokens",
        "authenticators",
      ]);
      return {
        emailVerified: null, // Set to null instead of undefined
        ...transformPayloadObjectToAdapterObject<typeof userWithoutRelations, "emailVerified">(
          userWithoutRelations,
        ),
      };
    },
    /**
     * No modifications
     */
    fromAdapter: (
      adapterUser: AdapterUser,
    ): Omit<User, "accounts" | "sessions" | "verificationTokens" | "authenticators"> => {
      return transformAdapterObjectToPayloadObject(adapterUser);
    },
    /**
     * No modifications
     */
    fromPartialAdapter: (
      adapterUser: Partial<AdapterUser>,
    ): Partial<Omit<User, "accounts" | "sessions" | "verificationTokens" | "authenticators">> => {
      return transformAdapterObjectToPayloadObject(adapterUser);
    },
  },
  account: {
    /**
     * Modifications:
     * - `user.id` --> `userId`
     */
    toAdapter: (user: Pick<User, "id">, account: Account): AdapterAccount => {
      return {
        userId: user.id,
        ...transformPayloadObjectToAdapterObject(account),
      };
    },
    /**
     * Modifications:
     * - ~`userId`~
     */
    fromAdapter: (adapterAccount: AdapterAccount): Account => {
      return transformAdapterObjectToPayloadObject(
        omit(adapterAccount, ["userId"]) as AdapterAccount,
      );
    },
  },
  session: {
    toAdapter: (user: Pick<User, "id">, session: Session): AdapterSession => {
      return {
        userId: user.id,
        ...transformPayloadObjectToAdapterObject<Session, "expires">(session),
      };
    },
    /**
     * Modifications:
     * - ~`userId`~
     */
    fromAdapter: (adapterSession: AdapterSession): Session => {
      return transformAdapterObjectToPayloadObject(omit(adapterSession, ["userId"]));
    },
    /**
     * Modifications:
     * - ~`userId`~
     */
    fromPartialAdapter: (adapterSession: Partial<AdapterSession>): Partial<Session> => {
      return transformAdapterObjectToPayloadObject(omit(adapterSession, ["userId"]));
    },
  },
  verificationToken: {
    /**
     * Modifications:
     * - `user.email` --> `identifier`
     */
    toAdapter: (
      user: Pick<User, "email">,
      verificationToken: VerificationToken,
    ): AdapterVerificationToken => {
      return {
        identifier: user.email,
        ...transformPayloadObjectToAdapterObject<VerificationToken, "expires">(verificationToken),
      };
    },
    /**
     * Modifications:
     * - ~`identifier`~
     */
    fromAdapter: (adapterVerificationToken: AdapterVerificationToken): VerificationToken => {
      return transformAdapterObjectToPayloadObject(omit(adapterVerificationToken, ["identifier"]));
    },
  },
  authenticator: {
    /**
     * Modifications:
     * - `user.id` --> `userId`
     * - `authenticator.credentialID` --> `providerAccountId`
     */
    toAdapter: (user: Pick<User, "id">, authenticator: Authenticator): AdapterAuthenticator => {
      return {
        userId: user.id,
        providerAccountId: authenticator.credentialID,
        ...transformPayloadObjectToAdapterObject(authenticator),
      };
    },
    /**
     * Modifications:
     * - ~`userId`~
     * - ~`providerAccountId`~
     */
    fromAdapter: (adapterAuthenticator: AdapterAuthenticator): Authenticator => {
      return transformAdapterObjectToPayloadObject(
        omit(adapterAuthenticator, ["userId", "providerAccountId"]),
      );
    },
  },
};

/**
 * --- Utility functions for transforming data between Payload and Adapter ---
 */

// https://github.com/honeinc/is-iso-date/blob/8831e79b5b5ee615920dcb350a355ffc5cbf7aed/index.js#L5
const isoDateRE =
  // eslint-disable-next-line regexp/no-unused-capturing-group
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isDate = (val: any): val is ConstructorParameters<typeof Date>[0] =>
  !!(val && isoDateRE.test(val) && !isNaN(Date.parse(val)));

type StringToDate<T> = T extends string ? Date : T;

/**
 * Transform a Payload object to an Adapter object
 *
 * @param object The Payload object to transform
 * @returns The transformed Adapter object
 */
const transformPayloadObjectToAdapterObject = <
  TObject extends object,
  TDateKeys extends keyof TObject = never,
>(
  object: TObject,
): {
  [K in keyof TObject]: K extends TDateKeys ? StringToDate<TObject[K]> : TObject[K];
} => {
  const adapterObject: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(object)) {
    adapterObject[key] = isDate(value) ? new Date(value) : value;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return adapterObject as any;
};

type DateToString<T> = T extends Date ? string : T;

/**
 * Transform an Adapter object to a Payload object
 *
 * @param adapterObject The Adapter object to transform
 * @returns The transformed Payload object
 */
const transformAdapterObjectToPayloadObject = <AdapterObject extends object>(
  adapterObject: AdapterObject,
): {
  [K in keyof AdapterObject]: DateToString<AdapterObject[K]>;
} => {
  const object: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(adapterObject)) {
    object[key] = value instanceof Date ? value.toISOString() : value;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return object as any;
};

/**
 * Omit keys from an object
 *
 * @param obj The object to omit keys from
 * @param keys The keys to omit
 * @returns The object without the omitted keys
 */
const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
};
