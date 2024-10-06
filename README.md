# Payload CMS plugin for Auth.js

<a href="https://github.com/CrawlerCode/payload-authjs/actions/workflows/ci.yml"><img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/CrawlerCode/payload-authjs/ci.yml?style=flat-square&logo=github"></a>
<a href="https://www.npmjs.com/package/payload-authjs"><img alt="NPM Version" src="https://img.shields.io/npm/v/payload-authjs?style=flat-square"></a>
<a href="https://github.com/CrawlerCode/payload-authjs/blob/main/LICENSE"><img alt="NPM License" src="https://img.shields.io/npm/l/payload-authjs?style=flat-square"></a>
<a href="https://www.npmjs.com/package/payload-authjs"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/payload-authjs?style=flat-square"></a>


A [Payload CMS 3 (beta)](https://payloadcms.com) plugin for integrating [Auth.js 5 (beta)](https://authjs.dev).

> ⚠ This plugin is in beta and under construction.
> Payload CMS 3 and Auth.js 5 are also in beta. Use at your own risk.

## Installation

Install the plugin using any JavaScript package manager like PNPM, NPM, or Yarn:


```bash
pnpm i payload-authjs
```

Add the `authjsPlugin` in your Payload configuration file:

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

> ⚠ Make sure you define your `authConfig` in a separate file than where you use the `withPayload` function to avoid circular dependencies.

**And that's it! Now you can sign-in via Auth.js and you are automatically authenticated in Payload CMS. Nice 🎉**

---

## Customizing

You don't need to create a collection for users. This plugin automatically creates a collection with the slug `users`.

But if you want to customize the users collection, you can create a collection with the slug `users` and add the fields you need. 

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

Next, you need to extend the user object returned by your Auth.js provider. You can do this like this example:

```ts
const authConfig: NextAuthConfig = {
  providers: [
    github({
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
          roles: ["user"], // <-- Extend the user object with a custom field
        };
      },
    }),
  ],
  ...
};
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
```

Now you could access your custom field, e.g. in the access control operations:

```ts
const Examples: CollectionConfig = {
  slug: "examples",
  access: {
    read: ({ req: { user } }) => {
      return user?.roles?.includes("user") ?? false; // <-- Check if the user has the role "user"
    },
  },
  fields: [
    ...
  ],
};
```

### Utility functions

This plugin also export a utility function to get the current payload user

```tsx
// ServerComponentExample.tsx
const ServerComponentExample = async () => {
  const payloadUser = await getPayloadUser<DataFromCollectionSlug<"users">>();

  return (
    <div>
      <h3>Payload CMS User</h3>
      <div>
        {JSON.stringify(payloadUser)}
      </div>
    </div>
  );
};
```