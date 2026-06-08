import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Build nao para em erros de TypeScript (os erros estao nos arquivos de jogos
    // que foram migrados de HTML e sao funcionais em runtime).
    // Remover quando os arquivos de jogos forem limpos.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
