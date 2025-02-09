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