// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './lib/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['var(--font-playfair)', 'Georgia', 'serif'],
                sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
            },
            colors: {
                brand: {
                    DEFAULT: '#1a3a2e',
                    light: '#2e6b52',
                },
                gold: {
                    DEFAULT: '#c9a84c',
                    light: '#f0d998',
                },
            },
        },
    },
    plugins: [],
};

export default config;