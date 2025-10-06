import crypto from "crypto";
import type { Adapter } from "next-auth/adapters";
import { getPayload, type Payload, type SanitizedConfig } from "payload";
import type { AuthCollectionSlug } from "../payload/plugin";
import { createUserAndBypassPasswordCheck } from "./utils/createUserAndBypassPasswordCheck";
import { transform } from "./utils/transform";

export interface PayloadAdapterOptions {
  /**
   * The Payload instance
   */
  payload?: Payload | Promise<Payload>;
  /**
   * The Payload configuration
   *
   * @deprecated Use the `payload` option instead
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
  userCollectionSlug?: AuthCollectionSlug;
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
    async createUser(adapterUser) {
      (await logger).debug(
        { userId: adapterUser.id, user: adapterUser },
        `Creating user '${adapterUser.id ?? adapterUser.email}'`,
      );

      let payloadUser;
      if (
        !(await payload).collections[userCollectionSlug]?.config.auth.disableLocalStrategy &&
        !(adapterUser as { password?: string }).password
      ) {
        // If the local strategy is enabled and the user does not have a password, bypass the password check
        payloadUser = await createUserAndBypassPasswordCheck(await payload, {
          collection: userCollectionSlug as "users-with-local-strategy",
          data: transform.user.fromAdapter(adapterUser),
        });
      } else {
        payloadUser = await (
          await payload
        ).create({
          collection: userCollectionSlug,
          data: transform.user.fromAdapter(adapterUser),
        });
      }

      return transform.user.toAdapter(payloadUser);
    },
    async getUser(userId) {
      (await logger).debug({ userId }, `Getting user by id '${userId}'`);

      const payloadUser = await (
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
      });

      if (!payloadUser) {
        return null; // Return null if user is not found
      }

      return transform.user.toAdapter(payloadUser);
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
      ).docs.at(0);

      if (!payloadUser) {
        return null; // Return null if user is not found
      }

      return transform.user.toAdapter(payloadUser);
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
      ).docs.at(0);

      if (!payloadUser) {
        return null; // Return null if user is not found
      }

      return transform.user.toAdapter(payloadUser);
    },
    async updateUser(partialUpdateUser) {
      (await logger).debug(
        { userId: partialUpdateUser.id, user: partialUpdateUser },
        `Updating user '${partialUpdateUser.id}'`,
      );

      const payloadUser = await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: partialUpdateUser.id,
        data: transform.user.fromPartialAdapter(partialUpdateUser),
        select: {
          accounts: false,
          sessions: false,
          verificationTokens: false,
        },
      });

      if (!payloadUser) {
        throw new Error(`Failed to update user: User '${partialUpdateUser.id}' not found`);
      }

      return transform.user.toAdapter(payloadUser);
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
    async linkAccount(adapterAccount) {
      const userId = adapterAccount.userId;

      (await logger).debug(
        {
          userId,
          account: adapterAccount,
        },
        `Linking account for user '${userId}'`,
      );

      let payloadUser = await (
        await payload
      ).findByID({
        collection: userCollectionSlug,
        id: userId,
        select: {
          id: true,
          accounts: true,
        },
        disableErrors: true,
      });
      if (!payloadUser) {
        throw new Error(`Failed to link account: User '${userId}' not found`);
      }

      payloadUser = await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          accounts: [
            ...(payloadUser.accounts || []),
            transform.account.fromAdapter(adapterAccount),
          ],
        },
        select: {
          id: true,
          accounts: true,
        },
      });

      const createdAccount = payloadUser.accounts?.find(
        a =>
          a.provider === adapterAccount.provider &&
          a.providerAccountId === adapterAccount.providerAccountId,
      );
      if (!createdAccount) {
        throw new Error(
          `Failed to link account: Account '${adapterAccount.providerAccountId}' of provider '${adapterAccount.provider}' not found`,
        );
      }

      return transform.account.toAdapter(payloadUser, createdAccount);
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
      ).docs.at(0);
      if (!payloadUser) {
        throw new Error(
          `Failed to unlink account: Account '${providerAccountId}' of provider '${provider}' not found`,
        );
      }

      payloadUser = await (
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
      });
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
      ).docs.at(0);
      if (!payloadUser) {
        return null;
      }

      const account = payloadUser.accounts?.find(
        a => a.providerAccountId === providerAccountId && a.provider === provider,
      );
      if (!account) {
        return null;
      }

      return transform.account.toAdapter(payloadUser, account);
    },
    // #endregion
    // #region Database session management
    async createSession(adapterSession) {
      const userId = adapterSession.userId;
      (await logger).debug(
        { userId, session: adapterSession },
        `Creating session for user '${userId}'`,
      );

      let payloadUser = await (
        await payload
      ).findByID({
        collection: userCollectionSlug,
        id: userId,
        select: {
          id: true,
          sessions: true,
        },
        disableErrors: true,
      });
      if (!payloadUser) {
        throw new Error(`Failed to create session: User '${userId}' not found`);
      }

      payloadUser = await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          sessions: [
            ...(payloadUser.sessions || []),
            transform.session.fromAdapter(adapterSession),
          ],
        },
        select: {
          id: true,
          sessions: true,
        },
      });

      const createdSession = payloadUser.sessions?.find(
        s => s.sessionToken === adapterSession.sessionToken,
      );
      if (!createdSession) {
        throw new Error(
          `Failed to create session: Session '${adapterSession.sessionToken}' not found`,
        );
      }

      return transform.session.toAdapter(payloadUser, createdSession);
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
      ).docs.at(0);
      if (!payloadUser) {
        return null;
      }

      const session = payloadUser.sessions?.find(s => s.sessionToken === sessionToken);
      if (!session) {
        return null;
      }

      return {
        user: transform.user.toAdapter(payloadUser),
        session: transform.session.toAdapter(payloadUser, session),
      };
    },
    async updateSession(partialAdapterSession) {
      const userId = partialAdapterSession.userId;
      (await logger).debug(
        { userId, session: partialAdapterSession },
        `Updating session '${partialAdapterSession.sessionToken}'`,
      );

      let payloadUser = (
        await (
          await payload
        ).find({
          collection: userCollectionSlug,
          where: {
            "sessions.sessionToken": {
              equals: partialAdapterSession.sessionToken,
            },
          },
          select: {
            id: true,
            sessions: true,
          },
          limit: 1,
        })
      ).docs.at(0);
      if (!payloadUser) {
        throw new Error(
          `Failed to update session: Session '${partialAdapterSession.sessionToken}' not found`,
        );
      }

      payloadUser = await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          sessions: payloadUser.sessions?.map(s =>
            s.sessionToken === partialAdapterSession.sessionToken
              ? { ...s, ...transform.session.fromPartialAdapter(partialAdapterSession) }
              : s,
          ),
        },
        select: {
          id: true,
          sessions: true,
        },
      });

      const updatedSession = payloadUser.sessions?.find(
        s => s.sessionToken === partialAdapterSession.sessionToken,
      );
      if (!updatedSession) {
        throw new Error(
          `Failed to update session: Session '${partialAdapterSession.sessionToken}' not found`,
        );
      }

      return transform.session.toAdapter(payloadUser, updatedSession);
    },
    async deleteSession(sessionToken) {
      (await logger).debug({ sessionToken }, `Deleting session with token '${sessionToken}'`);

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
            id: true,
            sessions: true,
          },
          limit: 1,
        })
      ).docs.at(0);
      if (!payloadUser) {
        throw new Error(`Failed to delete session: Session '${sessionToken}' not found`);
      }

      await (
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
      });
    },
    // #endregion
    // #region Verification tokens
    async createVerificationToken(adapterVerificationToken) {
      const email = adapterVerificationToken.identifier;

      (await logger).debug(
        { email, token: adapterVerificationToken },
        `Creating verification token for email '${email}'`,
      );

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
            email: true,
            verificationTokens: true,
          },
          limit: 1,
        })
      ).docs.at(0);

      if (!payloadUser) {
        const newUser = {
          id: crypto.randomUUID(),
          email,
          verificationTokens: [transform.verificationToken.fromAdapter(adapterVerificationToken)],
        };

        if (!(await payload).collections[userCollectionSlug]?.config.auth.disableLocalStrategy) {
          // If the local strategy is enabled, bypass the password check
          payloadUser = await createUserAndBypassPasswordCheck(await payload, {
            collection: userCollectionSlug as "users-with-local-strategy",
            data: newUser,
          });
        } else {
          payloadUser = await (
            await payload
          ).create({
            collection: userCollectionSlug,
            data: newUser,
            select: {
              id: true,
              email: true,
              verificationTokens: true,
            },
          });
        }
      } else {
        payloadUser = await (
          await payload
        ).update({
          collection: userCollectionSlug,
          id: payloadUser.id,
          data: {
            verificationTokens: [
              ...(payloadUser.verificationTokens || []),
              transform.verificationToken.fromAdapter(adapterVerificationToken),
            ],
          },
          select: {
            id: true,
            email: true,
            verificationTokens: true,
          },
        });
      }

      const createdToken = payloadUser.verificationTokens?.find(
        t => t.token === adapterVerificationToken.token,
      );
      if (!createdToken) {
        throw new Error(`Failed to create verification token for email '${email}'`);
      }

      return transform.verificationToken.toAdapter(payloadUser, createdToken);
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
            email: true,
            verificationTokens: true,
          },
          limit: 1,
        })
      ).docs.at(0);
      if (!payloadUser) {
        return null;
      }

      const verificationToken = payloadUser.verificationTokens?.find(t => t.token === token);
      if (!verificationToken) {
        return null;
      }

      payloadUser = await (
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
      });

      return transform.verificationToken.toAdapter(payloadUser, verificationToken);
    },
    // #endregion
    // #region Authenticators
    async createAuthenticator(adapterAuthenticator) {
      const userId = adapterAuthenticator.userId;
      (await logger).debug(
        { userId, authenticator: adapterAuthenticator },
        `Creating authenticator for user '${userId}'`,
      );

      let payloadUser = await (
        await payload
      ).findByID({
        collection: userCollectionSlug,
        id: userId,
        select: {
          id: true,
          authenticators: true,
        },
        disableErrors: true,
      });
      if (!payloadUser) {
        throw new Error(`Failed to create authenticator: User '${userId}' not found`);
      }

      payloadUser = await (
        await payload
      ).update({
        collection: userCollectionSlug,
        id: payloadUser.id,
        data: {
          authenticators: [
            ...(payloadUser.authenticators || []),
            transform.authenticator.fromAdapter(adapterAuthenticator),
          ],
        },
        select: {
          id: true,
          authenticators: true,
        },
      });

      const createdAuthenticator = payloadUser.authenticators?.find(
        a => a.credentialID === adapterAuthenticator.credentialID,
      );
      if (!createdAuthenticator) {
        throw new Error(`Failed to create authenticator for user '${userId}'`);
      }

      return transform.authenticator.toAdapter(payloadUser, createdAuthenticator);
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
      ).docs.at(0);
      if (!payloadUser) {
        return null;
      }

      const authenticator = payloadUser.authenticators?.find(a => a.credentialID === credentialID);
      if (!authenticator) {
        return null;
      }

      return transform.authenticator.toAdapter(payloadUser, authenticator);
    },
    async listAuthenticatorsByUserId(userId) {
      (await logger).debug({ userId }, `Listing authenticators for user '${userId}'`);

      const payloadUser = await (
        await payload
      ).findByID({
        collection: userCollectionSlug,
        id: userId,
        select: {
          id: true,
          authenticators: true,
        },
        disableErrors: true,
      });
      if (!payloadUser) {
        return [];
      }

      return (payloadUser.authenticators || []).map(authenticator =>
        transform.authenticator.toAdapter(payloadUser, authenticator),
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
      ).docs.at(0);
      if (!payloadUser) {
        throw new Error(
          `Failed to update authenticator: Authenticator '${credentialID}' not found`,
        );
      }

      payloadUser = await (
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
        },
        select: {
          id: true,
          authenticators: true,
        },
      });

      const authenticator = payloadUser.authenticators?.find(a => a.credentialID === credentialID);
      if (!authenticator) {
        throw new Error(
          `Failed to update authenticator: Authenticator '${credentialID}' not found`,
        );
      }

      return transform.authenticator.toAdapter(payloadUser, authenticator);
    },
    // #endregion
  };
}
