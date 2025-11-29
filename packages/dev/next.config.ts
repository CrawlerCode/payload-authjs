import { withNx } from "@nx/next";
import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* nx: {
    svgr: false,
  }, */
  allowedDevOrigins: [
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    ...(process.env.AUTH_URL ? [process.env.AUTH_URL.match(/https?:\/\/([\w.-]+)/)?.[1]!] : []),
  ],
};

export default withNx(
  withPayload(nextConfig, {
    devBundleServerPackages: false,
  }),
);
