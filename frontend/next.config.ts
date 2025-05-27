import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                'supports-color': false, // ⛔ disable unsupported Node module
            };
        }
        return config;
    },
};

export default nextConfig;
