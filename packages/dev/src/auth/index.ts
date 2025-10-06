import payloadConfig from "@payload-config";
import { getPayload } from "payload";
import { getAuthjsInstance } from "payload-authjs";

const payload = await getPayload({ config: payloadConfig });
export const { handlers, signIn, signOut, auth } = getAuthjsInstance(payload);

/* // Lazy initialization of the Auth.js instance (@see https://github.com/CrawlerCode/payload-authjs/issues/35)
export const { handlers, signIn, signOut, auth } = NextAuth(async () =>
  withPayloadAuthjs({
    payload: await getPayload({ config: payloadConfig }),
    config: nodeAuthConfig,
    collectionSlug: "users",
  }),
); */
