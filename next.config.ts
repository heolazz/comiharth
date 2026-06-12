import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network devices (like your phone) to access the dev server APIs
  // Next.js blocks non-localhost API and HMR traffic by default in dev mode!
  // @ts-ignore
  allowedDevOrigins: ["192.168.1.45", "192.168.1.11", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.komikcast.com",
      },
      {
        protocol: "https",
        hostname: "sv1.imgkc1.my.id",
      },
      {
        protocol: "https",
        hostname: "be.komikcast.cc",
      },
    ],
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
