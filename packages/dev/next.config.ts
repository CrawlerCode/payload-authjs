import { withNx } from "@nx/next";
import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  nx: {
    svgr: false,
  },
};

export default withNx(
  withPayload(nextConfig, {
    devBundleServerPackages: false,
  }),
);
