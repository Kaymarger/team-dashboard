import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CINC screenshots are posted as JPEG base64, up to about 1.5 MB, through
  // /api/cinc-ticket rather than a server action (those stop at 1 MB).
  experimental: {
    proxyClientMaxBodySize: "4mb",
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.trycloudflare.com",
    "*.loca.lt",
    "*.ngrok-free.app",
    "*.ngrok.io",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "archibaldrealestate.ca",
      },
    ],
  },
};

export default nextConfig;
