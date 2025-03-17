# Basic Example

This basic example demonstrates how to use the `payload-authjs` plugin.

## Configuration

- The authentication configuration is located in `src/auth.config.ts` and the NextAuth instance is created in `src/auth.ts`.
- In the Payload CMS configuration (`src/payload.config.ts`), we added the `payload-authjs` plugin.

The `middleware.example.ts` file demonstrates how to set up the middleware of Auth.js to be [edge-compatible](https://authjs.dev/guides/edge-compatibility). To use the middleware example, just rename the file to `middleware.ts`.

## Setup

1. Rename the `.env.example` file to `.env` and update the values with your secrets.
2. Install dependencies: `pnpm install`
3. Start the development server: `pnpm run dev`
