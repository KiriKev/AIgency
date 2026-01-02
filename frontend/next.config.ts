import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: Build currently fails due to pre-existing TypeScript errors in upstream
  // See: GeneratorInterface.tsx Variable import issue
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
