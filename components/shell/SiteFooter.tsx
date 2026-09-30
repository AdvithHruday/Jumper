import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line py-8 text-small text-muted">
      <p className="m-0 max-w-[70ch]">
        {BRAND.name} is an independent, open-source project. It is not affiliated with or endorsed by Arduino or
        Espressif. Product names are trademarks of their owners.
      </p>
      <p className="mb-0 mt-3 flex flex-wrap gap-x-5 gap-y-1">
        <span>© 2026 {BRAND.name}</span>
        <Link href="/about" className="underline underline-offset-2 hover:text-ink">
          About
        </Link>
        <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
          Privacy
        </Link>
        <a href={BRAND.repoUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
          Source code<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    </footer>
  );
}
