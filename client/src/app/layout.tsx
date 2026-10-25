import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CodeReviewHub • Deliverable & Review Queue',
  description: 'Production-grade code review, deliverable management, and evaluation platform.',
};

// Some antivirus browser extensions (e.g. Bitdefender) stamp `bis_skin_checked` / `bis_register`
// on every element before React hydrates, which triggers dev-only hydration mismatch overlays.
// This runs before hydration and strips those foreign attributes as soon as they appear.
const EXTENSION_ATTRS = ['bis_skin_checked', 'bis_register'];
const stripExtensionAttrsScript = `(() => {
  const attrs = ${JSON.stringify(EXTENSION_ATTRS)};
  const clean = (el) => attrs.forEach((a) => el.hasAttribute && el.hasAttribute(a) && el.removeAttribute(a));
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes') clean(m.target);
      m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        clean(n);
        n.querySelectorAll('[' + attrs.join('],[') + ']').forEach(clean);
      });
    }
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: attrs });
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      {process.env.NODE_ENV === 'development' && (
        <head>
          <script dangerouslySetInnerHTML={{ __html: stripExtensionAttrsScript }} />
        </head>
      )}
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-white"
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster richColors position="top-right" theme="dark" />
        </AuthProvider>
      </body>
    </html>
  );
}
