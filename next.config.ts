import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "sharp"],
  experimental: {
    // Avatar e banner (até 2 MB cada) chegam pelo formulário de perfil.
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
