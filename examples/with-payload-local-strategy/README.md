# With Payload local-strategy Example

This example demonstrates how to use the `payload-authjs` plugin with the Payload [Local JWT Strategy](https://payloadcms.com/docs/authentication/jwt).

## Configuration

- The Auth.js configuration is located in `src/auth.config.ts` and the NextAuth instance is created in `src/auth.ts`.
- In the Payload CMS configuration (`src/payload.config.ts`), we added the `payload-authjs` plugin.
- The [Local JWT Strategy](https://payloadcms.com/docs/authentication/jwt) is enabled via the `enableLocalStrategy` option in the `payload-authjs` plugin.
- And additionally, the [API Key Strategy](https://payloadcms.com/docs/authentication/api-keys) is enabled via the `auth.useAPIKey` option in `src/payload/collections/users.ts`.

## Setup

1. Rename the `.env.example` file to `.env` and update the values with your secrets.
2. Install dependencies: `pnpm install`
3. Start the development server: `pnpm run dev`
