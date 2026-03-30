import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use turbopack (Next.js 16 default)
  turbopack: {
    resolveAlias: {
      canvas: { browser: "" },
    },
  },

  // Allow loading PDF.js worker from CDN
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
