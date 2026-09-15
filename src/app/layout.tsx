import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'ScriptOS - Complete Local Script Operating System',
  description: 'Professional-grade local operating system for retention-optimized, undetectable, unique-perspective scripts.',
  openGraph: {
    title: 'ScriptOS - Complete Local Script Operating System',
    description: 'Professional-grade local operating system for retention-optimized, undetectable, unique-perspective scripts.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScriptOS - Complete Local Script Operating System',
    description: 'Professional-grade local operating system for retention-optimized, undetectable, unique-perspective scripts.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
