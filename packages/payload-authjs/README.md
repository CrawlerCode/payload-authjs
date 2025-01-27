<a href="https://github.com/CrawlerCode/payload-authjs"><img width="100%" src="https://raw.githubusercontent.com/CrawlerCode/payload-authjs/main/payload-authjs-banner.png" alt="payload-authjs banner" /></a>

# Payload CMS plugin for Auth.js/NextAuth

<a href="https://github.com/CrawlerCode/payload-authjs/actions/workflows/ci.yml"><img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/CrawlerCode/payload-authjs/ci.yml?style=flat-square&logo=github"></a>
<a href="https://www.npmjs.com/package/payload-authjs"><img alt="NPM Version" src="https://img.shields.io/npm/v/payload-authjs?style=flat-square"></a>
<a href="https://github.com/CrawlerCode/payload-authjs/blob/main/LICENSE"><img alt="NPM License" src="https://img.shields.io/npm/l/payload-authjs?style=flat-square"></a>
<a href="https://www.npmjs.com/package/payload-authjs"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/payload-authjs?style=flat-square"></a>

A [Payload CMS 3](https://payloadcms.com) plugin for integrating [Auth.js 5 (beta)](https://authjs.dev).

> ⚠ This plugin and Auth.js is in beta and may have some bugs. Please report any issues you find.

# ⚙️ Installation / Setup

Install the plugin using any JavaScript package manager like PNPM, NPM, or Yarn:

```bash
pnpm i payload-authjs
```

Fist of all, setup Auth.js like you would do in a Next.js application. You can follow the [Auth.js guide](https://authjs.dev/getting-started/installation?framework=Next.js).

> ⚠ Make sure you define your config in a separate file (e.g. `auth.config.ts`) than where you create the NextAuth instance (e.g. `auth.ts`) to avoid circular dependencies. ⚠

```ts
// auth.config.ts
import github from "next-auth/providers/github";

export const authConfig: NextAuthConfig = {
  providers: [
    github, // <-- Add your provider here
  ],
};
```

Wrap your Auth.js configuration with the `withPayload` function before creating the NextAuth instance:

```ts
// auth.ts
import payloadConfig from "@payload-config";
import NextAuth from "next-auth";
import { withPayload } from "payload-authjs";
import { authConfig } from "./auth.config"; // ⚠ Import the config from a separate file

export const { handlers, signIn, signOut, auth } = NextAuth(
  withPayload(authConfig, {
    payloadConfig,
  }),
);
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
  ],
});
```

**And that's it! Now you can sign-in via Auth.js and you are automatically authenticated in Payload CMS. Nice 🎉**

> You don't need to create a collection for users. This plugin automatically creates a collection with the slug `users`.

---

# 🛠️ Advanced usage / Customization

If you want to customize the users collection, you can create a collection with the slug `users` and add your customizations there.

```ts
// users.ts
const Users: CollectionConfig = {
  slug: "users",
  fields: [],
};
```

## ✏️ Customize existing fields

<details>
  <summary>Click to expand</summary>

You can customize the existing fields in the users collection by adding the field to the collection and modifying the field. The fields will be merged together.

```ts
// users.ts
const Users: CollectionConfig = {
  slug: "users",
  fields: [
    {
      name: "id",
      type: "text",
      label: "Identifier", // <-- Add a label to the id field
      admin: {
        hidden: true, // <-- Hide id field in admin panel
      },
    },
    {
      name: "accounts",
      type: "array",
      fields: [
        {
          name: "provider",
          type: "text",
          label: "Account Provider", // <-- Add label to provider field
        },
      ],
    },
  ],
};
```

</details>

## ✨ Add additional fields

You can also add additional fields to the users collection.

<details>
  <summary>Click to expand</summary>

There are 2 ways to add additional fields. It depends on the data you want to store and your [Auth.js session strategy](https://authjs.dev/concepts/session-strategies) (`session.strategy`).

### 1. Database fields (jwt session & database session)

If you want to store additional data in the database, you can add a new field to the users collection and extend your Auth.js provider to include the new field in the user.

For example, you could add a `locale` field to the users collection:

```ts
// users.ts
const Users: CollectionConfig = {
  slug: "users",
  fields: [
    // Add custom field for 'locale'
    {
      name: "locale",
      type: "text",
    },
  ],
};
```

Next, you need to extend the user object returned by your Auth.js provider. You can do this as shown in this example:

```ts
// auth.config.ts
const authConfig: NextAuthConfig = {
  providers: [
    keycloak({
      /**
       * Add additional fields to the user on first sign in
       */
      profile(profile) {
        return {
          // Default fields from keycloak provider
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          // Custom fields
          locale: profile.locale, // <-- Add your custom field (e.g. get locale from the profile)
        };
      },
    }),
  ],
  ...
};
```

⚠ Keep in mind that Auth.js doesn't update the user after the first sign-in.

### 2. Virtual fields (jwt session only)

If you are using the Auth.js `jwt` session strategy (it's the default), you can use a [virtual field](https://payloadcms.com/docs/fields/overview#virtual-fields) to add additional data that should not be stored in the database.
This plugin extract the virtual fields from your Auth.js jwt session and adds them to the user object.

For example, you could add a `roles` field to the users collection:

```ts
// users.ts
const Users: CollectionConfig = {
  slug: "users",
  fields: [
    // Add custom field for 'roles'
    {
      name: "roles",
      type: "json",
      virtual: true, // <-- Make the field virtual
      admin: {
        hidden: true,
      },
    },
  ],
};
```

Next, you need to extend your Auth.js session with your field. You can do this as shown in this example:

```ts
// auth.config.ts
const authConfig: NextAuthConfig = {
  callbacks: {
    jwt: ({ token, trigger }) => {
      if (trigger === "signIn" || trigger === "signUp") {
        token.roles = ["example-role"]; // <-- Add your virtual field to the token
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.roles = token.roles; // <-- Forward the virtual field from the token to the session
      }
      return session;
    },
  },
  ...
};
```

At this point, you can implement your own logic to extend the session. E.g. extract from profile, fetch from a server, or something else.

_More information about extending your session can be found in the [Auth.js documentation](https://authjs.dev/guides/extending-the-session)._

### Use custom fields

Now you could access your custom field, e.g. in the access control operations or somewhere else:

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

</details>

## 📐 Utility functions

This plugin also export a utility function to get the current payload user in the server-side:

```tsx
// ServerComponentExample.tsx
const ServerComponentExample = async () => {
  const payloadUser = await getPayloadUser();

  return (
    <div>
      <h3>Payload CMS User</h3>
      <div>{JSON.stringify(payloadUser)}</div>
    </div>
  );
};
```
