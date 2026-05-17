import type { NextConfig } from 'next';

const config: NextConfig = {
    images: {
        remotePatterns: [
            {
                // Allow images from any Supabase project storage
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb', // Allow larger payloads for image-heavy forms
        },
    },
    devIndicators: false,
};

export default config;