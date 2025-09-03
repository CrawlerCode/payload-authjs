import crypto from "crypto";
import type {
  Adapter,
  AdapterAccount,
  AdapterAuthenticator,
  AdapterSession,
  AdapterUser,
  VerificationToken as AdapterVerificationToken,
} from "next-auth/adapters";
import {
  type CollectionSlug,
  getPayload,
  type Payload,
  type RequiredDataFromCollectionSlug,
  type SanitizedConfig,
} from "payload";
import type { Account, Authenticator, Session, User, VerificationToken } from "./types";
import { transformObject } from "./utils/transformObject";

export interface PayloadAdapterOptions {
  /**
   * The Payload instance
   */
  payload?: Payload | Promise<Payload>;
  /**
   * The Payload configuration
   *
   * @example
   * import payloadConfig from "@payload-config";
   */
  payloadConfig?: SanitizedConfig | Promise<SanitizedConfig>;
  /**
   * The slug of the collection that contains the users
   *
   * @default "users"
   */
  userCollectionSlug?: CollectionSlug;
}
/**
 * Auth.js Database Adapter for Payload CMS
 *
 * @see https://authjs.dev/guides/creating-a-database-adapter
 * @see https://authjs.dev/reference/core/adapters#adapter
 */
export function PayloadAdapter({
  payload,
  payloadConfig,
  userCollectionSlug = "users",
}: PayloadAdapterOptions): Adapter {
  // Get the Payload instance
  if (!payload && payloadConfig) {
    payload = getPayload({ config: payloadConfig });
  }
  if (!payload) {
    throw new Error(
      "PayloadAdapter requires either a `payload` instance or a `payloadConfig` to be provided",
    );
  }

  // Create a logger
  const logger = (async () =>
    (await payload).logger.child({ name: "payload-authjs (PayloadAdapter)" }))();

  return {
    // #region User & Account management
    async createUser(user) {
      (await logger).debug({ userId: user.id, user }, `Creating user '${user.id ?? user.email}'`);

      let payloadUser: User;
      if (
        !(await payload).collections[userCollectionSlug]?.config.auth.disableLocalStrategy &&
        !(user as User).password
      ) {
        // If the local strategy is enabled and the user does not have a password, bypass the password check
        payloadUser = (await createUserAndBypassPasswordCheck(payload, {
          collection: userCollectionSlug,
          data: user,
        })) as User;
      } else {
        payloadUser = (await (
          await payload
        ).create({
          collection: userCollectionSlug,
          data: user,
        })) as User;
      }

      return toAdapterUser(payloadUser);
    },
    async getUser(userId) {
      (await logger).debug({ userId }, `Getting user by id '${userId}'`);

      const payloadUser = (await (
        await payload
      ).findByID({
        collection: userCollectionSlug,
        id: userId,
        select: {
          accounts: false,
          sessions: false,
          verificationTokens: false,
        },
        disableErrors: true,
      })) as User | null;

      if (!payloadUser) {
        return null; // Return null if user is not found
      }

      return toAdapterUser(payloadUser);
    },
    async getUserByEmail(email) {
      (await logger).debug({ email }, `Getting user by email '${email}'`);

      const payloadUser = (
        await (
          await payload
        ).find({
          collection: userCollectionSlug,
          where: {
            email: {
              equals: email,
            },
          },
          select: {
            accounts: false,
            sessions: false,
            verificationTokens: false,
          },
          limit: 1,
        })
      ).docs.at(0) as User | undefined;

      if (!payloadUser) {
        return null; // Return null if user is not found
      }

      return toAdapterUser(payloadUser);
    },
    async getUserByAccount({ provider, providerAccountId }) {
      (await logger).debug(
        { provider, providerAccountId },
        `Getting user by account '${providerAccountId}' of provider '${provider}'`,
      );

      const payloadUser = (
        await (
          await payload
        ).find({
          collection: userCollectionSlug,
          where: {
            "accounts.provider": {
              equals: provider,
            },
            "accounts.providerAccountId": {
              equals: providerAccountId,
            },
          },
          select: {
            accounts: false,
            sessions: false,
            verificationTokens: false,
          },
          limit: 1,
        })
      ).docs.at(0) as User | undefined;

      if (!payloadUser) {
        return null; // Return null if user is not found
      }

      return toAdapterUser(payloadUser);
    },
    async updateUser(user) {
      (await logger).debug({ userId: user.id, user }, `Updating user '${user.id}'`);

      const payloadUser = (await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: user.id,
        data: user,
        select: {
          accounts: false,
          sessions: false,
          verificationTokens: false,
        },
      })) as unknown as User | undefined;

      if (!payloadUser) {
        throw new Error(`Failed to update user: User '${user.id}' not found`);
      }

      return toAdapterUser(payloadUser);
    },
    async deleteUser(userId) {
      (await logger).debug({ userId }, `Deleting user '${userId}'`);

      await (
        await payload
      ).delete({
        collection: userCollectionSlug,
        id: userId,
      });
    },
    async linkAccount({ userId, ...account }) {
      (await logger).debug(
        {
          userId,
          account,
        },
        `Linking account for user '${userId}'`,
      );

      let payloadUser = (await (
        await payload
      ).findByID({
        collection: userCollectionSlug,
        id: userId,
        select: {
          id: true,
          accounts: true,
        },
        disableErrors: true,
      })) as User | null;
      if (!payloadUser) {
        throw new Error(`Failed to link account: User '${userId}' not found`);
      }

      payloadUser = (await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          accounts: [...(payloadUser.accounts || []), account],
        } satisfies Partial<User>,
        select: {
          id: true,
          accounts: true,
        },
      })) as User;

      const createdAccount = payloadUser.accounts?.find(
        a => a.provider === account.provider && a.providerAccountId === account.providerAccountId,
      );
      if (!createdAccount) {
        throw new Error(
          `Failed to link account: Account '${account.providerAccountId}' of provider '${account.provider}' not found`,
        );
      }

      return toAdapterAccount(payloadUser, createdAccount);
    },
    async unlinkAccount({ provider, providerAccountId }) {
      (await logger).debug(
        {
          provider,
          providerAccountId,
        },
        `Unlinking account '${providerAccountId}' of provider '${provider}'`,
      );

      let payloadUser = (
        await (
          await payload
        ).find({
          collection: userCollectionSlug,
          where: {
            "accounts.provider": {
              equals: provider,
            },
            "accounts.providerAccountId": {
              equals: providerAccountId,
            },
          },
          select: {
            id: true,
            accounts: true,
          },
          limit: 1,
        })
      ).docs.at(0) as User | undefined;
      if (!payloadUser) {
        throw new Error(
          `Failed to unlink account: Account '${providerAccountId}' of provider '${provider}' not found`,
        );
      }

      payloadUser = (await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          accounts: payloadUser.accounts?.filter(
            account =>
              !(account.provider === provider && account.providerAccountId === providerAccountId),
          ),
        },
        select: {
          id: true,
        },
      })) as User;
    },
    async getAccount(providerAccountId, provider) {
      (await logger).debug(
        { provider, providerAccountId },
        `Getting account '${providerAccountId}' of provider '${provider}'`,
      );

      const payloadUser = (
        await (
          await payload
        ).find({
          collection: userCollectionSlug,
          where: {
            "accounts.provider": {
              equals: provider,
            },
            "accounts.providerAccountId": {
              equals: providerAccountId,
            },
          },
          select: {
            id: true,
            accounts: true,
          },
          limit: 1,
        })
      ).docs.at(0) as User | undefined;
      if (!payloadUser) {
        return null;
      }

      const account = payloadUser.accounts?.find(
        a => a.providerAccountId === providerAccountId && a.provider === provider,
      );
      if (!account) {
        return null;
      }

      return toAdapterAccount(payloadUser, account);
    },
    // #endregion
    // #region Database session management
    async createSession({ userId, ...session }) {
      (await logger).debug({ userId, session }, `Creating session for user '${userId}'`);

      let payloadUser = (await (
        await payload
      ).findByID({
        collection: userCollectionSlug,
        id: userId,
        select: {
          id: true,
          sessions: true,
        },
        disableErrors: true,
      })) as User | null;
      if (!payloadUser) {
        throw new Error(`Failed to create session: User '${userId}' not found`);
      }

      payloadUser = (await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          sessions: [...(payloadUser.sessions || []), session],
        },
        select: {
          id: true,
          sessions: true,
        },
      })) as User;

      const createdSession = payloadUser.sessions?.find(
        s => s.sessionToken === session.sessionToken,
      );
      if (!createdSession) {
        throw new Error(`Failed to create session: Session '${session.sessionToken}' not found`);
      }

      return toAdapterSession(payloadUser, createdSession);
    },
    async getSessionAndUser(sessionToken) {
      (await logger).debug(
        {
          sessionToken,
        },
        `Getting session and user by session token '${sessionToken}'`,
      );

      const payloadUser = (
        await (
          await payload
        ).find({
          collection: userCollectionSlug,
          where: {
            "sessions.sessionToken": {
              equals: sessionToken,
            },
          },
          select: {
            accounts: false,
            verificationTokens: false,
          },
          limit: 1,
        })
      ).docs.at(0) as User | undefined;
      if (!payloadUser) {
        return null;
      }

      const session = payloadUser.sessions?.find(s => s.sessionToken === sessionToken);
      if (!session) {
        return null;
      }

      return {
        user: toAdapterUser(payloadUser),
        session: toAdapterSession(payloadUser, session),
      };
    },
    async updateSession({ userId, ...session }) {
      (await logger).debug({ userId, session }, `Updating session '${session.sessionToken}'`);

      let payloadUser = (
        await (
          await payload
        ).find({
          collection: userCollectionSlug,
          where: {
            "sessions.sessionToken": {
              equals: session.sessionToken,
            },
          },
          select: {
            id: true,
            sessions: true,
          },
          limit: 1,
        })
      ).docs.at(0) as User | undefined;
      if (!payloadUser) {
        throw new Error(`Failed to update session: Session '${session.sessionToken}' not found`);
      }

      payloadUser = (await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          sessions: payloadUser.sessions?.map(s =>
            s.sessionToken === session.sessionToken ? { ...s, ...session } : s,
          ),
        },
        select: {
          id: true,
          sessions: true,
        },
      })) as User;

      const updatedSession = payloadUser.sessions?.find(
        s => s.sessionToken === session.sessionToken,
      );
      if (!updatedSession) {
        throw new Error(`Failed to update session: Session '${session.sessionToken}' not found`);
      }

      return toAdapterSession(payloadUser, updatedSession);
    },
    async deleteSession(sessionToken) {
      (await logger).debug({ sessionToken }, `Deleting session with token '${sessionToken}'`);

      let payloadUser = (
        await (
          await payload
        ).find({
          collection: userCollectionSlug,
          where: {
            "sessions.sessionToken": {
              equals: sessionToken,
            },
          },
          select: {
            id: true,
            sessions: true,
          },
          limit: 1,
        })
      ).docs.at(0) as User | undefined;
      if (!payloadUser) {
        throw new Error(`Failed to delete session: Session '${sessionToken}' not found`);
      }

      payloadUser = (await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          sessions: payloadUser.sessions?.filter(session => session.sessionToken !== sessionToken),
        },
        select: {
          id: true,
        },
      })) as User;
    },
    // #endregion
    // #region Verification tokens
    async createVerificationToken({ identifier: email, ...token }) {
      (await logger).debug({ email, token }, `Creating verification token for email '${email}'`);

      let payloadUser = (
        await (
          await payload
        ).find({
          collection: userCollectionSlug,
          where: {
            email: {
              equals: email,
            },
          },
          select: {
            id: true,
            verificationTokens: true,
          },
          limit: 1,
        })
      ).docs.at(0) as User | undefined;

      if (!payloadUser) {
        const user = {
          id: crypto.randomUUID(),
          email,
          verificationTokens: [token],
        };

        if (!(await payload).collections[userCollectionSlug]?.config.auth.disableLocalStrategy) {
          // If the local strategy is enabled, bypass the password check
          payloadUser = (await createUserAndBypassPasswordCheck(payload, {
            collection: userCollectionSlug,
            data: user,
          })) as User;
        } else {
          payloadUser = (await (
            await payload
          ).create({
            collection: userCollectionSlug,
            data: user,
            select: {
              id: true,
              email: true,
              verificationTokens: true,
            },
          })) as User;
        }
      } else {
        payloadUser = (await (
          await payload
        ).update({
          collection: userCollectionSlug,
          id: payloadUser.id,
          data: {
            verificationTokens: [...(payloadUser.verificationTokens || []), token],
          },
          select: {
            id: true,
            email: true,
            verificationTokens: true,
          },
        })) as User;
      }

      const createdToken = payloadUser.verificationTokens?.find(t => t.token === token.token);
      if (!createdToken) {
        throw new Error(`Failed to create verification token for email '${email}'`);
      }

      return toAdapterVerificationToken(payloadUser.email, createdToken);
    },
    async useVerificationToken({ identifier: email, token }) {
      (await logger).debug({ email, token }, `Using verification token for email '${email}'`);

      let payloadUser = (
        await (
          await payload
        ).find({
          collection: userCollectionSlug,
          where: {
            email: {
              equals: email,
            },
            "verificationTokens.token": {
              equals: token,
            },
          },
          select: {
            id: true,
            verificationTokens: true,
          },
          limit: 1,
        })
      ).docs.at(0) as User | undefined;
      if (!payloadUser) {
        return null;
      }

      const verificationToken = payloadUser.verificationTokens?.find(t => t.token === token);
      if (!verificationToken) {
        return null;
      }

      payloadUser = (await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          verificationTokens: payloadUser.verificationTokens?.filter(t => t.token !== token),
        },
        select: {
          id: true,
          email: true,
        },
      })) as User;

      return toAdapterVerificationToken(payloadUser.email, verificationToken);
    },
    // #endregion
    // #region Authenticators
    async createAuthenticator({ userId, ...authenticator }) {
      (await logger).debug(
        { userId, authenticator },
        `Creating authenticator for user '${userId}'`,
      );

      let payloadUser = (await (
        await payload
      ).findByID({
        collection: userCollectionSlug,
        id: userId,
        select: {
          id: true,
          authenticators: true,
        },
        disableErrors: true,
      })) as User | null;
      if (!payloadUser) {
        throw new Error(`Failed to create authenticator: User '${userId}' not found`);
      }

      payloadUser = (await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          authenticators: [...(payloadUser.authenticators || []), authenticator],
        } satisfies Partial<User>,
        select: {
          id: true,
          authenticators: true,
        },
      })) as User;

      const createdAuthenticator = payloadUser.authenticators?.find(
        a => a.credentialID === authenticator.credentialID,
      );
      if (!createdAuthenticator) {
        throw new Error(`Failed to create authenticator for user '${userId}'`);
      }

      return toAdapterAuthenticator(payloadUser, createdAuthenticator);
    },
    async getAuthenticator(credentialID) {
      (await logger).debug({ credentialID }, `Getting authenticator '${credentialID}'`);

      const payloadUser = (
        await (
          await payload
        ).find({
          collection: userCollectionSlug,
          where: {
            "authenticators.credentialID": {
              equals: credentialID,
            },
          },
          select: {
            id: true,
            authenticators: true,
          },
          limit: 1,
        })
      ).docs.at(0) as User | undefined;
      if (!payloadUser) {
        return null;
      }

      const authenticator = payloadUser.authenticators?.find(a => a.credentialID === credentialID);
      if (!authenticator) {
        return null;
      }

      return toAdapterAuthenticator(payloadUser, authenticator);
    },
    async listAuthenticatorsByUserId(userId) {
      (await logger).debug({ userId }, `Listing authenticators for user '${userId}'`);

      const payloadUser = (await (
        await payload
      ).findByID({
        collection: userCollectionSlug,
        id: userId,
        select: {
          id: true,
          authenticators: true,
        },
        disableErrors: true,
      })) as User | null;
      if (!payloadUser) {
        return [];
      }

      return (payloadUser.authenticators || []).map(authenticator =>
        toAdapterAuthenticator(payloadUser, authenticator),
      );
    },
    async updateAuthenticatorCounter(credentialID, counter) {
      (await logger).debug(
        { credentialID, counter },
        `Updating authenticator '${credentialID}' counter`,
      );

      let payloadUser = (
        await (
          await payload
        ).find({
          collection: userCollectionSlug,
          where: {
            "authenticators.credentialID": {
              equals: credentialID,
            },
          },
          select: {
            id: true,
            authenticators: true,
          },
          limit: 1,
        })
      ).docs.at(0) as User | undefined;
      if (!payloadUser) {
        throw new Error(
          `Failed to update authenticator: Authenticator '${credentialID}' not found`,
        );
      }

      payloadUser = (await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          authenticators: payloadUser.authenticators?.map(a =>
            a.credentialID === credentialID
              ? {
                  ...a,
                  counter,
                }
              : a,
          ),
        } satisfies Partial<User>,
        select: {
          id: true,
          authenticators: true,
        },
      })) as User;

      const authenticator = payloadUser.authenticators?.find(a => a.credentialID === credentialID);
      if (!authenticator) {
        throw new Error(
          `Failed to update authenticator: Authenticator '${credentialID}' not found`,
        );
      }

      return toAdapterAuthenticator(payloadUser, authenticator);
    },
    // #endregion
  };
}

function toAdapterUser(user: User): AdapterUser {
  return transformObject(user, ["accounts", "sessions", "verificationTokens"]);
}

function toAdapterAccount(user: User, account: Account): AdapterAccount {
  return {
    ...transformObject(account),
    userId: user.id,
  };
}

function toAdapterSession(user: User, session: Session): AdapterSession {
  return {
    ...transformObject<Session, Omit<AdapterSession, "userId">>(session),
    userId: user.id,
  };
}

function toAdapterVerificationToken(
  email: string,
  token: VerificationToken,
): AdapterVerificationToken {
  return {
    identifier: email,
    ...transformObject<VerificationToken, Omit<AdapterVerificationToken, "identifier">>(token),
  };
}

function toAdapterAuthenticator(user: User, authenticator: Authenticator): AdapterAuthenticator {
  return {
    ...transformObject(authenticator),
    userId: user.id,
    providerAccountId: authenticator.credentialID,
  };
}

/**
 * Create a user and bypass the password check
 * This is because payload requires a password to be set when creating a user
 *
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/collections/operations/create.ts#L254
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/auth/strategies/local/generatePasswordSaltHash.ts
 */
const createUserAndBypassPasswordCheck = async (
  payload: Payload | Promise<Payload>,
  {
    collection,
    data,
  }: {
    collection: CollectionSlug;
    data: RequiredDataFromCollectionSlug<CollectionSlug>;
  },
) => {
  // Generate a random password
  data.password = crypto.randomBytes(32).toString("hex");

  // Create the user
  const user = await (
    await payload
  ).create({
    collection,
    data,
  });

  // Remove the salt and hash after the user was created
  await (
    await payload
  ).update({
    collection,
    id: user.id,
    data: {
      salt: null,
      hash: null,
    },
  });

  return user;
};
