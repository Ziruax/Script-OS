import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  metadataBase: new URL('https://scriptos.app'),
  title: 'ScriptOS — Retention Script Operating System',
  description: 'Professional-grade operating system for retention-optimized, undetectable, unique-perspective scripts.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'ScriptOS — Retention Script Operating System',
    description: 'Professional-grade operating system for retention-optimized, undetectable, unique-perspective scripts.',
    type: 'website',
    images: ['/logo.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScriptOS — Retention Script Operating System',
    description: 'Professional-grade operating system for retention-optimized, undetectable, unique-perspective scripts.',
    images: ['/logo.svg'],
  },
};

// Inline script that runs before paint to apply the saved theme, preventing a flash.
const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('scriptos_theme');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: themeInitScript}} />
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
