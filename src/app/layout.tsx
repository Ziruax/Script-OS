import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { ToastProvider } from '@/components/Toast';

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
