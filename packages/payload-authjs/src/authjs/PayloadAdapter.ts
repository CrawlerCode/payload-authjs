import type {
  Adapter,
  AdapterSession,
  AdapterUser,
  VerificationToken as AdapterVerificationToken,
} from "next-auth/adapters";
import { type CollectionSlug, getPayload, type Payload, type SanitizedConfig } from "payload";
import type { Session, User, VerificationToken } from "../payload/types";

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

  return {
    // #region User management
    async createUser(user) {
      /* console.log("[PayloadAdapter] Creating user", user); */

      const payloadUser = (await (
        await payload
      ).create({
        collection: userCollectionSlug,
        data: {
          ...user,
        },
      })) as User;

      return toAdapterUser(payloadUser);
    },
    async getUser(id) {
      /* console.log(`[PayloadAdapter] Getting user with id '${id}'`); */

      const payloadUser = (await (
        await payload
      ).findByID({
        collection: userCollectionSlug,
        id,
      })) as User | undefined;

      return payloadUser ? toAdapterUser(payloadUser) : null;
    },
    async getUserByEmail(email) {
      /* console.log(`[PayloadAdapter] Getting user by email '${email}'`); */

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
      /* console.log(
        `[PayloadAdapter] Getting user by account '${providerAccountId}' from provider '${provider}'`,
      ); */

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
      /* console.log(`[PayloadAdapter] Updating user '${user.id}'`, user); */

      const payloadUser = (await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: user.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: user as any,
      })) as unknown as User | undefined;

      return payloadUser ? toAdapterUser(payloadUser) : (null as unknown as AdapterUser);
    },
    async deleteUser(userId) {
      /* console.log(`[PayloadAdapter] Deleting user with id '${userId}'`); */

      await (
        await payload
      ).delete({
        collection: userCollectionSlug,
        id: userId,
      });
    },
    async linkAccount(account) {
      /* console.log(`[PayloadAdapter] Linking account for user '${account.userId}'`, account); */

      let payloadUser = (await (
        await payload
      ).findByID({
        collection: userCollectionSlug,
        id: account.userId,
      })) as User | undefined;
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

      return account;
    },
    async unlinkAccount({ provider, providerAccountId }) {
      /* console.log("[PayloadAdapter] Unlinking account"); */

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
          `Failed to unlink account: User from provider '${provider}' with account ID '${providerAccountId}' not found`,
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
              account.provider !== provider || account.providerAccountId !== providerAccountId,
          ),
        },
      })) as User;
    },
    // #endregion
    // #region Database session management
    async createSession(session) {
      /* console.log(`[PayloadAdapter] Creating session for user '${session.userId}'`, session); */

      let payloadUser = (await (
        await payload
      ).findByID({
        collection: userCollectionSlug,
        id: session.userId,
      })) as User | undefined;
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

      return session;
    },
    async getSessionAndUser(sessionToken) {
      /* console.log(`[PayloadAdapter] Getting session and user by session token '${sessionToken}'`); */

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
      /* console.log(`[PayloadAdapter] Updating session '${session.sessionToken}'`, session); */

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
      /* console.log(`[PayloadAdapter] Deleting session with token '${sessionToken}'`); */

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
      /* console.log(`[PayloadAdapter] Creating verification token for email '${email}'`, token); */

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
        payloadUser = (await (
          await payload
        ).create({
          collection: userCollectionSlug,
          data: {
            id: crypto.randomUUID(),
            email,
            verificationTokens: [token],
          },
        })) as User;
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

      return {
        identifier: email,
        ...token,
      };
    },
    async useVerificationToken({ identifier: email, token }) {
      /* console.log(`[PayloadAdapter] Using verification token for email '${email}'`, token); */

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

      return verificationToken ? toAdapterVerificationToken(payloadUser, verificationToken) : null;
    },
    // #endregion
  };
}

function toAdapterUser(user: User): AdapterUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
  };
}

function toAdapterSession(user: User, session: Session): AdapterSession {
  return {
    userId: user.id,
    sessionToken: session.sessionToken,
    expires: new Date(session.expires),
  };
}

function toAdapterVerificationToken(
  user: User,
  token: VerificationToken,
): AdapterVerificationToken {
  return {
    identifier: user.email,
    token: token.token,
    expires: new Date(token.expires),
  };
}
