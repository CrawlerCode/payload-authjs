import type { NextAuthResult } from "next-auth";
import type { Payload } from "payload";
import type { AuthCollectionSlug } from "../payload/plugin";

type PayloadWithAuthjsInstances = {
  __authjs_instances__?: Partial<Record<AuthCollectionSlug, NextAuthResult>>;
} & Payload;

/**
 * Get the Auth.js instance from the payload instance
 */
export const getAuthjsInstance = (
  payload: Payload,
  collectionSlug: AuthCollectionSlug = "users",
): NextAuthResult => {
  const authjsInstances = (payload as PayloadWithAuthjsInstances).__authjs_instances__?.[
    collectionSlug
  ];
  if (!authjsInstances || typeof authjsInstances !== "object") {
    payload.logger.error(
      `Auth.js instance for collection '${collectionSlug}' not found. Ensure that you have added the authjsPlugin to your payload config.`,
    );
    throw new Error(`Auth.js is not initialized for collection '${collectionSlug}'`);
  }
  return authjsInstances;
};

/**
 * Set the Auth.js instance in the payload instance
 */
export const setAuthjsInstance = (
  payload: Payload,
  collectionSlug: AuthCollectionSlug,
  authjs: NextAuthResult,
): void => {
  const _payload = payload as PayloadWithAuthjsInstances;

  if (!_payload.__authjs_instances__) {
    Object.defineProperty(payload, "__authjs_instances__", {
      value: {},
      writable: false,
      configurable: false,
      enumerable: false,
    });
  }

  Object.defineProperty(_payload.__authjs_instances__, collectionSlug, {
    value: authjs,
    writable: false,
    configurable: false,
    enumerable: true,
  });
};
