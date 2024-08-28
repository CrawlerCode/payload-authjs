# Payload CMS plugin for Auth.js

A [Payload CMS 3 (beta)](https://payloadcms.com) plugin for integrating [Auth.js 5 (beta)](https://authjs.dev).

### Installation

Install the plugin using any JavaScript package manager like Yarn, NPM, or PNPM:
  
```bash
pnpm i payload-authjs
```

### Basic Usage

Install the `authjsPlugin` in your Payload configuration file:

```ts
// payload.config.ts
import { authjsPlugin } from "payload-authjs";
import { authConfig } from "./auth.config";

export const config = buildConfig({
  plugins: [
    authjsPlugin({
      authjsConfig: authConfig,
    }),
  ]
});
```

Wrap your Auth.js configuration with the `withPayload` function before creating the NextAuth instance:

```ts
// auth.ts
import payloadConfig from "@payload-config";
import NextAuth from "next-auth";
import { withPayload } from "payload-authjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth(
  withPayload(authConfig, {
    payloadConfig,
  }),
);
```

And that's it! Now you can sign-in via Auth.js and you are automatically authenticated in Payload. Nice 🎉

### Advanced Usage

If you want to customize the users collection, you can create a collection with the slug `users` and add the fields you need.

```ts
// users.ts
import type { CollectionConfig } from "payload";

const Users: CollectionConfig = {
  slug: "users",
  fields: [
    {
      name: "roles",
      type: "json",
    },
  ],
};

export default Users;
```

⚠ Keep in mind that Auth.js doesn't update the user after the first sign-in. If you want to update the user on every sign-in, you can use the `updateUserOnSignIn` option in the `withPayload` function:

```ts
// auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth(
  withPayload(authConfig, {
    payloadConfig,
    updateUserOnSignIn: true, // <-- Update the user on every sign-in
  }),
);