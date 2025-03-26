import { postgresAdapter } from "@payloadcms/db-postgres";
import path from "path";
import { buildConfig } from "payload";
import { authjsPlugin } from "payload-authjs";
import { build as buildLogger } from "pino-pretty";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { nodeAuthConfig } from "./auth/node.config";
import Examples from "./payload/collections/examples";
import Users from "./payload/collections/users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  logger: {
    options: {
      level: "debug",
    },
    destination: buildLogger({
      colorize: true,
      ignore: "pid,hostname",
      translateTime: "SYS:HH:MM:ss",
    }),
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, "payload", "components"),
    },
    components: {
      beforeDashboard: ["/Greeting"],
    },
  },
  collections: [Users, Examples],
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  email: ({ payload }) => ({
    name: "logger",
    defaultFromName: "Payload Auth.js",
    defaultFromAddress: "payload-authjs@example.com",
    sendEmail: args => {
      payload.logger.info(args, "Sending email");
      return Promise.resolve();
    },
  }),
  sharp,
  plugins: [authjsPlugin({ authjsConfig: nodeAuthConfig })],
});
