import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Bricolage_Grotesque, Atkinson_Hyperlegible, JetBrains_Mono } from 'next/font/google';
import { Logo } from '@/components/brand/Logo';
import { BRAND, BRAND_COLORS, SITE_URL } from '@/lib/brand';
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
    <html lang="en" className={`${bricolage.variable} ${atkinson.variable} ${jetbrains.variable}`}>
      <body className="min-h-full">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-5">
          <header className="flex flex-wrap items-center justify-between gap-y-1 py-4">
            <Link href="/" aria-label={`${BRAND.name} home`}>
              <Logo />
            </Link>
            <nav className="flex flex-wrap gap-1.5" aria-label="Main">
              <Link href="/" className="rounded-lg px-3 py-2 text-[15px] font-bold text-ink hover:bg-panel">
                Projects
              </Link>
              <Link href="/parts" className="rounded-lg px-3 py-2 text-[15px] font-bold text-ink hover:bg-panel">
                Parts
              </Link>
              <Link href="/build" className="rounded-lg px-3 py-2 text-[15px] font-bold text-ink hover:bg-panel">
                What can I build?
              </Link>
              <Link href="/check"className="rounded-lg px-3 py-2 text-[15px] font-bold text-ink hover:bg-panel">
                Check my code
              </Link>
              <Link href="/fix/upload"className="rounded-lg px-3 py-2 text-[15px] font-bold text-ink hover:bg-panel">
                Upload Doctor
              </Link>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
