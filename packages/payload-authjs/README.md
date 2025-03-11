<a href="https://github.com/CrawlerCode/payload-authjs"><img width="100%" src="https://repository-images.githubusercontent.com/848986894/dbf478be-1b3b-44b8-9ff8-2f1bb30a41f8" alt="payload-authjs banner" /></a>

# Payload CMS plugin for Auth.js/NextAuth

<a href="https://github.com/CrawlerCode/payload-authjs/actions/workflows/ci.yml"><img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/CrawlerCode/payload-authjs/ci.yml?style=flat-square&logo=github"></a>
<a href="https://www.npmjs.com/package/payload-authjs"><img alt="NPM Version" src="https://img.shields.io/npm/v/payload-authjs?style=flat-square"></a>
<a href="https://github.com/CrawlerCode/payload-authjs/blob/main/LICENSE"><img alt="NPM License" src="https://img.shields.io/npm/l/payload-authjs?style=flat-square"></a>
<a href="https://www.npmjs.com/package/payload-authjs"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/payload-authjs?style=flat-square"></a>

A [Payload CMS 3](https://payloadcms.com) plugin for integrating [Auth.js 5 (beta)](https://authjs.dev).

> ⚠ This plugin and Auth.js 5 is in beta and may have some bugs. Please report any issues you find.

# ⚡ How it works

This plugin

- creates a `users` collection in Payload CMS.
- use an custom [Database Adapter](https://authjs.dev/getting-started/database) for Auth.js to store the users in the Payload CMS database.
- use a custom [Auth Strategy](https://payloadcms.com/docs/authentication/custom-strategies) for Payload CMS to retrieve the session from Auth.js.

# ⚙️ Installation / Setup

Install the plugin using any JavaScript package manager such as PNPM, NPM, or Yarn:

```bash
pnpm i payload-authjs
```

First of all, this plugin only integrates Auth.js into Payload CMS by getting the user session from Auth.js. It doesn't handle the Auth.js stuff. First, you need to setup Auth.js before you can use this plugin. You can follow the [Auth.js guide](https://authjs.dev/getting-started/installation?framework=Next.js).

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

Once you have configured Auth.js, you can integrate it with Payload CMS.

To do this, wrap your Auth.js configuration with the `withPayload` function before creating the NextAuth instance:

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

And add the `authjsPlugin` to your Payload configuration file:

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

> _You don't need to create a users collection. This plugin automatically creates a collection with the slug `users`._

---

# 🪄 Getting the payload session

This plugin also provides some utility functions to get the current payload session/user within your Next.js application.

## Server side (`getPayloadSession`)

Instead of using the [`auth`](https://authjs.dev/getting-started/session-management/get-session?framework=next-js) function of Auth.js, you can use the `getPayloadSession` function to get the current session in the server-side code (e.g. in RSC or API routes):

```tsx
// ServerComponentExample.tsx
import { getPayloadSession } from "payload-authjs";

const ServerComponentExample = async () => {
  const session = await getPayloadSession();

  return (
    <>
      <h3>Payload CMS User:</h3>
      <pre>{JSON.stringify(session?.user)}</pre>
    </>
  );
};
```

## Client side (`usePayloadSession`)

Instead of using the [`useSession`](https://authjs.dev/getting-started/session-management/get-session?framework=next-js-client) hook of Auth.js, you can use the `usePayloadSession` hook to get the current session in the client-side code:

Before you can use the `usePayloadSession` hook, you need to wrap your app with the `PayloadSessionProvider`:

```tsx
// layout.tsx
import { PayloadSessionProvider } from "payload-authjs/client";
import { getPayloadSession } from "payload-authjs";

const Layout: React.FC<{ children: React.ReactNode }> = async ({ children }) => {
  return (
    <html lang="en">
      <body>
        <PayloadSessionProvider session={await getPayloadSession()}>
          {children}
        </PayloadSessionProvider>
      </body>
    </html>
  );
};

export default Layout;
```

> ℹ️ Passing the session to the `PayloadSessionProvider` is optional, but it can be useful to avoid loading states.

You are now ready to use the `usePayloadSession` hook in your client-side code:

```tsx
// ClientComponentExample.tsx
"use client";

import { usePayloadSession } from "payload-authjs/client";

export const ClientComponentExample = () => {
  const { session } = usePayloadSession();

  return (
    <>
      <h3>Payload CMS User:</h3>
      <pre>{JSON.stringify(session?.user)}</pre>
    </>
  );
};
```

## Within Payload CMS

<details>
  <summary>Click to expand</summary>

### Within the Payload admin panel (`useAuth`)

If you want to access the current user in the Payload admin panel e.g. in a custom component. You can use the [`useAuth`](https://payloadcms.com/docs/admin/hooks#useauth) hook from Payload CMS:

```tsx
"use client";

import { Banner, useAuth } from "@payloadcms/ui";
import type { User } from "@/payload-types";

export const CustomAdminComponent = () => {
  const { user } = useAuth<User>();

  if (!user) {
    return null;
  }

  return <Banner type="success">Hi, {user.name}</Banner>;
};
```

### Inside access control operations (`req.user`)

Simply use the [`req.user`](https://payloadcms.com/docs/access-control/overview) object to determine the current user:

```ts
const Examples: CollectionConfig = {
  slug: "examples",
  access: {
    read: ({ req: { user } }) => {
      return Boolean(user) // <-- Check if the user is authenticated
    },
  },
  fields: [
    ...
  ],
};
```

### Inside custom endpoints (`req.user`)

Simply use the [`req.user`](https://payloadcms.com/docs/rest-api/overview#custom-endpoints) object to determine the current user:

```ts
const Examples: CollectionConfig = {
  slug: "examples",
  fields: [
    ...
  ],
  endpoints: [
    {
      method: "get",
      path: "/example",
      handler: (req) => {
        return Response.json(req.user); // <-- Return the user object
      },
    },
  ],
};
```

</details>

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

You can customize the existing fields in the users collection by adding the field to the collection and modifying the field. The fields are merged together.

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

> ⚠ Note that Auth.js doesn't update the user after the first sign-in. If you want to update the user on every sign-in, you can use the `signIn` event. (See [Events](#events))

### 2. Virtual fields (jwt session only)

If you are using the Auth.js `jwt` session strategy (it's the default), you can use a [virtual field](https://payloadcms.com/docs/fields/overview#virtual-fields) to add additional data that should not be stored in the database.
This plugin extracts the virtual fields from your Auth.js jwt session (if available) and adds them to the user object.

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

This plugin can only get the virtual fields, if **they are included in the Auth.js session**. So you need to extend your Auth.js token and session with your field.

You can do this as shown in this example:

```ts
// auth.config.ts
const authConfig: NextAuthConfig = {
  callbacks: {
    jwt: ({ token, trigger }) => {
      // Add the virtual field to the token only on signIn/signUp (jwt callback will be called multiple times)
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

At this point, you can implement your own logic to extend the session. For example extract from profile, fetch from a server, or something else.

_More information about extending your session can be found in the [Auth.js documentation](https://authjs.dev/guides/extending-the-session)._

### Using custom fields

Now you can access your custom field, e.g. in the access control operations or elsewhere:

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

## 🟦 Typescript

If you are using typescript you can declare your Auth.js user type as shown in the following example:

```ts
// auth.config.ts
import type { PayloadAuthjsUser } from "payload-authjs";
import type { User as PayloadUser } from "@/payload-types";

declare module "next-auth" {
  interface User extends PayloadAuthjsUser<PayloadUser> {}
}
```

_More information about typescript can be found in the [Auth.js documentation](https://authjs.dev/getting-started/typescript?framework=next-js)._

## 🎉 Events

Auth.js emits some [events](https://authjs.dev/reference/nextjs#events) that you can listen to. This plugin extends the events with additional parameters such as the `adapter` and `payload` instance.

_More information about the events can be found in the [Auth.js documentation](https://authjs.dev/reference/nextjs#events)._

The following events are available:

- signIn
- signOut
- createUser
- updateUser
- linkAccount
- session

### `signIn` Event

The `signIn` event is fired when a user successfully signs in. For example, you could use this event to update the user's name on every sign-in:

```ts
// auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth(
  withPayload(authConfig, {
    payloadConfig,
    events: {
      /**
       * Update user 'name' on every sign in
       */
      signIn: async ({ adapter, user, profile }) => {
        if (!user.id || !profile) {
          return;
        }
        await adapter.updateUser!({
          id: user.id,
          name: profile.name ?? (profile.login as string | undefined),
        });
      },
    },
  }),
);
```
