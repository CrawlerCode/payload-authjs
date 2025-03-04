import crypto from "crypto";
import type {
  Adapter,
  AdapterAccount,
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
import type { Account, Session, User, VerificationToken } from "./types";
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
    // #region User management
    async createUser(user) {
      (await logger).debug({ userId: user.id, user }, `Creating user '${user.id}'`);

      let payloadUser: User;
      if (
        (await payload).collections[userCollectionSlug]?.config.custom.enableLocalStrategy ===
          true &&
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
        disableErrors: true,
      })) as User | null;

      return payloadUser ? toAdapterUser(payloadUser) : null;
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
        })
      ).docs.at(0) as User | undefined;

      return payloadUser ? toAdapterUser(payloadUser) : null;
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
        })
      ).docs.at(0) as User | undefined;

      return payloadUser ? toAdapterUser(payloadUser) : null;
    },
    async updateUser(user) {
      (await logger).debug({ userId: user.id, user }, `Updating user '${user.id}'`);

      const payloadUser = (await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: user.id,
        data: user,
      })) as unknown as User | undefined;

      return payloadUser ? toAdapterUser(payloadUser) : (null as unknown as AdapterUser);
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
    async linkAccount(account) {
      (await logger).debug(
        {
          userId: account.userId,
          account,
        },
        `Linking account for user '${account.userId}'`,
      );

      let payloadUser = (await (
        await payload
      ).findByID({
        collection: userCollectionSlug,
        id: account.userId,
        disableErrors: true,
      })) as User | null;
      if (!payloadUser) {
        throw new Error(`Failed to link account: User '${account.userId}' not found`);
      }

      payloadUser = (await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          accounts: [...(payloadUser.accounts || []), account],
        } satisfies Partial<User>,
      })) as User;

      const createdAccount = payloadUser.accounts?.find(
        a => a.provider === account.provider && a.providerAccountId === account.providerAccountId,
      );

      return createdAccount ? toAdapterAccount(createdAccount) : account;
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
      })) as User;
    },
    // #endregion
    // #region Database session management
    async createSession(session) {
      (await logger).debug(
        { userId: session.userId, session },
        `Creating session for user '${session.userId}'`,
      );

      let payloadUser = (await (
        await payload
      ).findByID({
        collection: userCollectionSlug,
        id: session.userId,
        disableErrors: true,
      })) as User | null;
      if (!payloadUser) {
        throw new Error(`Failed to create session: User '${session.userId}' not found`);
      }

      payloadUser = (await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          sessions: [...(payloadUser.sessions || []), session],
        },
      })) as User;

      const createdSession = payloadUser.sessions?.find(
        s => s.sessionToken === session.sessionToken,
      );

      return createdSession ? toAdapterSession(payloadUser, createdSession) : session;
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
    async updateSession(session) {
      (await logger).debug(
        { userId: session.userId, session },
        `Updating session '${session.sessionToken}'`,
      );

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
            s.sessionToken === session.sessionToken ? session : s,
          ),
        },
      })) as User;

      const updatedSession = payloadUser.sessions?.find(
        s => s.sessionToken === session.sessionToken,
      );

      return updatedSession ? toAdapterSession(payloadUser, updatedSession) : null;
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
        })
      ).docs.at(0) as User | undefined;

      if (!payloadUser) {
        const user = {
          id: crypto.randomUUID(),
          email,
          verificationTokens: [token],
        };

        if (
          (await payload).collections[userCollectionSlug]?.config.custom.enableLocalStrategy ===
          true
        ) {
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
        })) as User;
      }

      const createdToken = payloadUser.verificationTokens?.find(t => t.token === token.token);

      return createdToken
        ? toAdapterVerificationToken(payloadUser.email, createdToken)
        : {
            identifier: email,
            ...token,
          };
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
        })
      ).docs.at(0) as User | undefined;
      if (!payloadUser) {
        return null;
      }

      const verificationToken = payloadUser.verificationTokens?.find(t => t.token === token);

      payloadUser = (await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          verificationTokens: payloadUser.verificationTokens?.filter(t => t.token !== token),
        },
      })) as User;

      return verificationToken
        ? toAdapterVerificationToken(payloadUser.email, verificationToken)
        : null;
    },
    // #endregion
  };
}

function toAdapterUser(user: User): AdapterUser {
  return transformObject(user, ["accounts", "sessions", "verificationTokens"]);
}

function toAdapterAccount(account: Account): AdapterAccount {
  return transformObject(account);
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
