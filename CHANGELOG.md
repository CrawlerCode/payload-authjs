## 0.9.1 (2025-10-13)

### 🩹 Fixes

- Move webauthn components to dedicated export ([#48](https://github.com/CrawlerCode/payload-authjs/pull/48))

## 0.9.0 (2025-10-06)

### 🚀 Features

- Add support for Auth.js passkey provider ([#45](https://github.com/CrawlerCode/payload-authjs/pull/45))
- Receive the auth.js instance from the payload using getAuthjsInstance ([8230215](https://github.com/CrawlerCode/payload-authjs/commit/8230215))

### 🩹 Fixes

- Enforce stricter types ([50aa494](https://github.com/CrawlerCode/payload-authjs/commit/50aa494))
- Check user strategy in refresh hook ([#47](https://github.com/CrawlerCode/payload-authjs/pull/47))

### 🏡 Chore

- Add bundle size badge to README ([c8bdcd1](https://github.com/CrawlerCode/payload-authjs/commit/c8bdcd1))
- **deps:** Update npm dependencies ([dbd0141](https://github.com/CrawlerCode/payload-authjs/commit/dbd0141))
- **nx:** Use payload-authjs as workspace package for dev project ([22021c4](https://github.com/CrawlerCode/payload-authjs/commit/22021c4))

## 0.8.4 (2025-09-02)

### 🩹 Fixes

- Destroy authjs session using payload logout hook instead of overriding logout endpoints ([#11900](https://github.com/CrawlerCode/payload-authjs/issues/11900))
- Remove custom array id field for verificationTokens ([#41](https://github.com/CrawlerCode/payload-authjs/pull/41))
- **PayloadSessionProvider:** Unset the local session then request failed ([ada1fdf](https://github.com/CrawlerCode/payload-authjs/commit/ada1fdf))
- **SignInButton:** Mount authjs SessionProvider to the admin panel to provide custom base path ([#44](https://github.com/CrawlerCode/payload-authjs/pull/44))

### 🏡 Chore

- **deps:** Update npm dependencies ([3885fc4](https://github.com/CrawlerCode/payload-authjs/commit/3885fc4))
- **dev:** Improve session overview and sign in/out buttons ([c2d6698](https://github.com/CrawlerCode/payload-authjs/commit/c2d6698))

### 📓 Examples

- Use authjs signOut server action ([#43](https://github.com/CrawlerCode/payload-authjs/pull/43))

## 0.8.3 (2025-07-29)

### 🩹 Fixes

- Remove duplicate custom array id fields ([6f0ab0d](https://github.com/CrawlerCode/payload-authjs/commit/6f0ab0d))

### 🏡 Chore

- Refactor repository and author fields in package.json for better structure ([9b4d548](https://github.com/CrawlerCode/payload-authjs/commit/9b4d548))
- **deps:** Update npm dependencies ([5d1d6a3](https://github.com/CrawlerCode/payload-authjs/commit/5d1d6a3))

## 0.8.2 (2025-05-11)

### 🩹 Fixes

- **getPayloadSession:** Don't pass readonly headers object directly to fetch function ([#33](https://github.com/CrawlerCode/payload-authjs/pull/33))

### 📖 Documentation

- Add examples section to README ([507385e](https://github.com/CrawlerCode/payload-authjs/commit/507385e))

### 🏡 Chore

- Improve payload api types for /me and /refresh-token endpoints ([9bf9289](https://github.com/CrawlerCode/payload-authjs/commit/9bf9289))
- **deps:** Update npm dependencies ([1f30898](https://github.com/CrawlerCode/payload-authjs/commit/1f30898))

## 0.8.1 (2025-04-14)

### 🩹 Fixes

- Change the behavior of the SignIn button for login with provider ([#24](https://github.com/CrawlerCode/payload-authjs/pull/24))
- Remove email field duplication if enableLocalStrategy ([#29](https://github.com/CrawlerCode/payload-authjs/pull/29))

### 🏡 Chore

- **dev:** Allow login with username for local strategy ([b8c24b5](https://github.com/CrawlerCode/payload-authjs/commit/b8c24b5))
- **nx:** Rename examples to example ([a0d1ab9](https://github.com/CrawlerCode/payload-authjs/commit/a0d1ab9))

## 0.8.0 (2025-04-06)

### 🚀 Features

- Add custom account row label component ([89ce1a7](https://github.com/CrawlerCode/payload-authjs/commit/89ce1a7))
- Add support for other auth strategies ([2c94c40](https://github.com/CrawlerCode/payload-authjs/commit/2c94c40))
- **getPayloadSession:** Cache getPayloadSession function ([ff3b25b](https://github.com/CrawlerCode/payload-authjs/commit/ff3b25b))

### 🩹 Fixes

- Merge remaining properties for fields with subfield ([cfa143d](https://github.com/CrawlerCode/payload-authjs/commit/cfa143d))
- Execute afterLogout hooks at logout endpoint ([#16](https://github.com/CrawlerCode/payload-authjs/pull/16))
- Extend PayloadSession with collection and strategy ([4ca2cdf](https://github.com/CrawlerCode/payload-authjs/commit/4ca2cdf))
- Fix mergeFields function for tabs fields ([bdb393c](https://github.com/CrawlerCode/payload-authjs/commit/bdb393c))
- Refresh authjs session cookie at payload "refresh-token" endpoint ([66e50fc](https://github.com/CrawlerCode/payload-authjs/commit/66e50fc))
- Revalidate payload-session tag on logout and refresh ([25d4b8d](https://github.com/CrawlerCode/payload-authjs/commit/25d4b8d))
- Move from tsc to swc to be compatible with turbopack ([#18](https://github.com/CrawlerCode/payload-authjs/pull/18))
- **AuthjsAuthStrategy:** Respect auth.depth option of users collection ([c06262b](https://github.com/CrawlerCode/payload-authjs/commit/c06262b))
- **PayloadSessionProvider:** Abort fetch session on unmount ([0a5e859](https://github.com/CrawlerCode/payload-authjs/commit/0a5e859))
- **getPayloadSession:** Preferably extract strategy from user._strategy & improved types ([4b66142](https://github.com/CrawlerCode/payload-authjs/commit/4b66142))

### 🔥 Performance

- **PayloadAdapter:** Only retrieve necessary fields ([6beebd2](https://github.com/CrawlerCode/payload-authjs/commit/6beebd2))

### 📖 Documentation

- Add missing import for example ([e3caebc](https://github.com/CrawlerCode/payload-authjs/commit/e3caebc))
- Improve setup section ([4c54dfd](https://github.com/CrawlerCode/payload-authjs/commit/4c54dfd))

### 🏡 Chore

- **deps:** Update npm dependencies ([d269d92](https://github.com/CrawlerCode/payload-authjs/commit/d269d92))
- **deps:** Update npm dependencies ([d98f3aa](https://github.com/CrawlerCode/payload-authjs/commit/d98f3aa))
- **deps:** Update npm dependencies ([7e6a164](https://github.com/CrawlerCode/payload-authjs/commit/7e6a164))
- **deps:** Set minimal required payload version to 3.16.0 (because export of headersWithCors) ([b76df1a](https://github.com/CrawlerCode/payload-authjs/commit/b76df1a))
- **dev:** Improve edge compatibility and some other small changes ([d5e5d9e](https://github.com/CrawlerCode/payload-authjs/commit/d5e5d9e))
- **dev:** Add token rotation for keycloak provider & sync account expires date with session expires ([27ee17b](https://github.com/CrawlerCode/payload-authjs/commit/27ee17b))
- **dev:** Add mongoose adapter ([b6c4e23](https://github.com/CrawlerCode/payload-authjs/commit/b6c4e23))
- **nx:** Add examples type to changelog ([5e9b181](https://github.com/CrawlerCode/payload-authjs/commit/5e9b181))

### 📓 Examples

- **multiple-auth-collections:** Add example for using multiple authentication collections ([b0ff26a](https://github.com/CrawlerCode/payload-authjs/commit/b0ff26a))

## 0.7.1 (2025-02-09)

### 🩹 Fixes

- Register me hook always to provider expires timestamp ([#12](https://github.com/CrawlerCode/payload-authjs/pull/12))
- **PayloadSessionProvider:** Fix broken PayloadSessionProvider ([67df23d](https://github.com/CrawlerCode/payload-authjs/commit/67df23d))

## 0.7.0 (2025-02-09)

### 🚀 Features

- Allow custom tabs field in users collection ([#14](https://github.com/CrawlerCode/payload-authjs/pull/14))
- Add getPayloadSession & usePayloadSession ([146eebe](https://github.com/CrawlerCode/payload-authjs/commit/146eebe))
- **AuthjsAuthStrategy:** Log a warning if user not found in the database but has an valid authjs session ([1999a20](https://github.com/CrawlerCode/payload-authjs/commit/1999a20))
- **PayloadAdapter:** Added payload logger and log debug messages ([957f589](https://github.com/CrawlerCode/payload-authjs/commit/957f589))

### 🩹 Fixes

- Override payload refresh operation & fix session expiration ([#12](https://github.com/CrawlerCode/payload-authjs/pull/12))

### 📖 Documentation

- Add "Getting the payload session" section & improved some other wordings ([f911249](https://github.com/CrawlerCode/payload-authjs/commit/f911249))

### 🏡 Chore

- Fix eslint & typescript errors ([d9c5895](https://github.com/CrawlerCode/payload-authjs/commit/d9c5895))
- **dev:** Change nextjs port to 5000 ([0115f0e](https://github.com/CrawlerCode/payload-authjs/commit/0115f0e))
- **dev:** Allow js files (for import map) ([3b4b16b](https://github.com/CrawlerCode/payload-authjs/commit/3b4b16b))
- **dev:** Add greeting component to admin dashboard ([becc12a](https://github.com/CrawlerCode/payload-authjs/commit/becc12a))
- **dev:** Added all different options to get the session & add tailwind ([57637ab](https://github.com/CrawlerCode/payload-authjs/commit/57637ab))
- **dev:** Add currentAccount field ([3f1711d](https://github.com/CrawlerCode/payload-authjs/commit/3f1711d))

## 0.6.1 (2025-02-05)

### 🩹 Fixes

- Fix findField function for subfields ([#13](https://github.com/CrawlerCode/payload-authjs/pull/13))

### 📖 Documentation

- Fix events header ([cce4e4c](https://github.com/CrawlerCode/payload-authjs/commit/cce4e4c))

### 🏡 Chore

- **deps:** Update npm dependencies ([804f3f3](https://github.com/CrawlerCode/payload-authjs/commit/804f3f3))

## 0.6.0 (2025-01-27)

### 🚀 Features

- Add support for virtual fields (jwt session strategy) ([d20f863](https://github.com/CrawlerCode/payload-authjs/commit/d20f863))
- Add PayloadAuthjsUser helper type for authjs module declaration ([c7e8f08](https://github.com/CrawlerCode/payload-authjs/commit/c7e8f08))
- **withPayload:** Add custom evens to withPayload function ([89e749c](https://github.com/CrawlerCode/payload-authjs/commit/89e749c))

### 🩹 Fixes

- **PayloadAdapter:** Improve data transformation and forward additional fields ([9052f38](https://github.com/CrawlerCode/payload-authjs/commit/9052f38))

### 🏡 Chore

- Replace banner ([d354a51](https://github.com/CrawlerCode/payload-authjs/commit/d354a51))

## 0.5.0 (2025-01-25)

### 🚀 Features

- Allow to customize the sign in button ([#7](https://github.com/CrawlerCode/payload-authjs/pull/7))
- Improved users collection & add better support for customization ([18810ec](https://github.com/CrawlerCode/payload-authjs/commit/18810ec))
- **basic-example:** Add basic-example project ([76fc27a](https://github.com/CrawlerCode/payload-authjs/commit/76fc27a))

### 🩹 Fixes

- **PayloadAdapter:** Fix not found error on first sign in ([afd1273](https://github.com/CrawlerCode/payload-authjs/commit/afd1273))

### 🏡 Chore

- Add github issue template ([5038483](https://github.com/CrawlerCode/payload-authjs/commit/5038483))
- Update dependencies ([e74b980](https://github.com/CrawlerCode/payload-authjs/commit/e74b980))
- Move README and add symlink ([8b15168](https://github.com/CrawlerCode/payload-authjs/commit/8b15168))
- Set minimal required payload version to 3.1.1 ([c621343](https://github.com/CrawlerCode/payload-authjs/commit/c621343))
- Add banner ([da224a0](https://github.com/CrawlerCode/payload-authjs/commit/da224a0))

## 0.4.0 (2024-12-08)

### 🚀 Features

- Set default access control (read, update and delete own user) ([edaf753](https://github.com/CrawlerCode/payload-authjs/commit/edaf753))

### 🩹 Fixes

- **PayloadAdapter:** Check account provider in getUserByAccount method ([75b88c0](https://github.com/CrawlerCode/payload-authjs/commit/75b88c0))

### 🏡 Chore

- Migrate to payload 3 stable version ([2db3139](https://github.com/CrawlerCode/payload-authjs/commit/2db3139))
- Update dependencies ([d7338aa](https://github.com/CrawlerCode/payload-authjs/commit/d7338aa))

## 0.3.4 (2024-11-03)

### 🩹 Fixes

- **getPayloadUser:** Throw no serverURL error after cookie statement ([#5](https://github.com/CrawlerCode/payload-authjs/pull/5))
- **getPayloadUser:** Improved type ([9866498](https://github.com/CrawlerCode/payload-authjs/commit/9866498))

### 📖 Documentation

- Improved docs ([9c75f76](https://github.com/CrawlerCode/payload-authjs/commit/9c75f76))

## 0.3.3 (2024-10-30)

### 🩹 Fixes

- Fix eslint errors ([4dcdf8f](https://github.com/CrawlerCode/payload-authjs/commit/4dcdf8f))

### 🏡 Chore

- Migrate to @payloadcms/eslint-config 3 beta ([7d0ec8d](https://github.com/CrawlerCode/payload-authjs/commit/7d0ec8d))
- **dev:** Update payload files ([e4a6282](https://github.com/CrawlerCode/payload-authjs/commit/e4a6282))

## 0.3.2 (2024-10-29)


### 🩹 Fixes

- Migrate to next 15 ([e01d0c0](https://github.com/CrawlerCode/payload-authjs/commit/e01d0c0))

### 🏡 Chore

- Update dependencies ([efff4c8](https://github.com/CrawlerCode/payload-authjs/commit/efff4c8))

## 0.3.1 (2024-10-06)


### 🩹 Fixes

- Replace middleware by overwriting payload logout endpoint to destroy authjs session ([82b71c8](https://github.com/CrawlerCode/payload-authjs/commit/82b71c8))

### 🏡 Chore

- Update dependencies ([4ad020d](https://github.com/CrawlerCode/payload-authjs/commit/4ad020d))
- Update nx configuration for conventional commits ([7ac9c78](https://github.com/CrawlerCode/payload-authjs/commit/7ac9c78))

## 0.3.0 (2024-09-12)


### 🚀 Features

- Add sign in with auth.js button to admin login page ([c24eb72](https://github.com/CrawlerCode/payload-authjs/commit/c24eb72))

### 🩹 Fixes

- **middleware:** Middleware implementation ([47911bf](https://github.com/CrawlerCode/payload-authjs/commit/47911bf))

## 0.2.1 (2024-09-11)


### 🩹 Fixes

- **payload-adapter:** Allow user registration when using magic link ([#2](https://github.com/CrawlerCode/payload-authjs/pull/2))

## 0.2.0 (2024-09-05)


### 🚀 Features

- Fist implementation ([bf0680a](https://github.com/CrawlerCode/payload-authjs/commit/bf0680a))
- **nx-cloud:** setup nx cloud workspace ([d616991](https://github.com/CrawlerCode/payload-authjs/commit/d616991))

### 🩹 Fixes

- Fix types of getPayloadUser ([ef516b6](https://github.com/CrawlerCode/payload-authjs/commit/ef516b6))
- Fix eslint config and fix eslint errors ([388f0a8](https://github.com/CrawlerCode/payload-authjs/commit/388f0a8))