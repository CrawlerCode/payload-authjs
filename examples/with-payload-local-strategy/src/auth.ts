import payloadConfig from "@payload-config";
import { getPayload } from "payload";
import { getAuthjsInstance } from "payload-authjs";

const payload = await getPayload({ config: payloadConfig });
export const { handlers, signIn, signOut, auth } = getAuthjsInstance(payload);
