// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: {
        default: 'Sukoon Developer — Premium Real Estate & Land Listings',
        template: '%s | Sukoon Developer',
    },
    description:
        'Discover premium land, residential, and commercial properties across Pakistan. Sukoon Developer — where every space tells a story.',
    keywords: ['real estate', 'land', 'property', 'Pakistan', 'plot', 'commercial'],
    openGraph: {
        title: 'Sukoon Developer',
        description: 'Premium Real Estate & Open Land Listings',
        type: 'website',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            {/* Adding this flag stops browser extensions from triggering hydration errors */}
            <body className="font-sans antialiased bg-stone-50 text-stone-900" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}