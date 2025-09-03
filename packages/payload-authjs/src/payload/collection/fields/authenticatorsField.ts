import type { Field } from "payload";

/**
 * Authenticators field for a user
 *
 * @see https://authjs.dev/reference/core/adapters#adapterauthenticator
 * @see https://authjs.dev/reference/core/types#authenticator
 */
export const authenticatorsField: Field = {
  name: "authenticators",
  type: "array",
  fields: [
    { name: "credentialID", type: "text", required: true, index: true },
    { name: "credentialPublicKey", type: "text", required: true },
    { name: "credentialBackedUp", type: "checkbox", required: true },
    { name: "counter", type: "number", required: true },
    { name: "transports", type: "text" },
    { name: "credentialDeviceType", type: "text", required: true },
  ],
  admin: {
    initCollapsed: true,
  },
  access: {
    create: () => false,
    update: () => false,
  },
};
