import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import { authjsPlugin } from "..";
import { authConfig } from "./auth.config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * ! This is a dummy config just to generate types !
 */
export default buildConfig({
  admin: {
    user: "users",
  },
  collections: [
    {
      slug: "users-with-local-strategy",
      auth: {
        useSessions: false,
      },
      fields: [],
    },
  ],
  secret: "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: {
    defaultIDType: "text",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    init: () => null as any,
  },
  plugins: [
    authjsPlugin({
      userCollectionSlug: "users",
      authjsConfig: authConfig,
    }),
    authjsPlugin({
      userCollectionSlug: "users-with-local-strategy",
      authjsConfig: authConfig,
      enableLocalStrategy: true,
    }),
  ],
});
