import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

import { authjsPlugin } from "payload-authjs";
import { adminsAuthConfig } from "./auth.admins.config";
import { customersAuthConfig } from "./auth.customers.config";
import Admins from "./payload/collections/admins";
import Customers from "./payload/collections/customers";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "admins",
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Customers, Admins],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  sharp,
  plugins: [
    authjsPlugin({
      userCollectionSlug: "customers",
      authjsConfig: customersAuthConfig,
    }),
    authjsPlugin({
      userCollectionSlug: "admins",
      authjsConfig: adminsAuthConfig,
    }),
  ],
});
