import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network devices (like your phone) to access the dev server APIs
  // Next.js blocks non-localhost API and HMR traffic by default in dev mode!
  // @ts-ignore
  allowedDevOrigins: ["192.168.1.45", "localhost"],
};

export default nextConfig;
