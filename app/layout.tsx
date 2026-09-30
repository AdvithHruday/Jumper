import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Atkinson_Hyperlegible, JetBrains_Mono } from 'next/font/google';
import { SiteFooter } from '@/components/shell/SiteFooter';
import { SiteHeader } from '@/components/shell/SiteHeader';
import { BRAND, BRAND_COLORS, SITE_URL } from '@/lib/brand';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import './globals.css';

/**
 * Atkinson Hyperlegible is the body face on purpose (spec 9): it was designed
 * for low-vision readers, and this is an app people read with one hand on a
 * breadboard.
 */
const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  weight: ['600', '800'],
});

const atkinson = Atkinson_Hyperlegible({
  variable: '--font-atkinson',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '600'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name}: ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  openGraph: { siteName: BRAND.name, type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: BRAND_COLORS.light },
    { media: '(prefers-color-scheme: dark)', color: BRAND_COLORS.dark },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script below sets data-theme on <html>
    // before React hydrates, which is the point (no white flash), and would
    // otherwise be reported as a mismatch.
    <html lang="en" suppressHydrationWarning className={`${bricolage.variable} ${atkinson.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-control focus:bg-accent focus:px-4 focus:py-2.5 focus:font-bold focus:text-on-accent"
        >
          Skip to content
        </a>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-5">
          <SiteHeader />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
