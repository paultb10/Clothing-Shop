import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Clothing Shop',
    description: 'Your store description here',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    );
}
