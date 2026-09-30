'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { ThemeToggle } from '@/components/shell/ThemeToggle';
import { BRAND } from '@/lib/brand';
import { MENU_GROUPS, SECTIONS, activeSection, type MenuLink } from '@/lib/nav';
import { cn } from '@/lib/ui/cn';

function MenuItem({ link }: { link: MenuLink }) {
  const cls =
    'flex min-h-11 items-center justify-between gap-3 rounded-control px-3 font-bold text-ink hover:bg-panel-2';
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
        <span>
          {link.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </span>
        <ExternalLink aria-hidden size={16} className="text-muted" />
      </a>
    );
  }
  return (
    <Link href={link.href} className={cls}>
      {link.label}
    </Link>
  );
}

/**
 * The header: the logo, the three sections, and a menu for everything else.
 * On a phone the sections move to their own row under the logo so the menu
 * button never hides them. The menu is a disclosure, not a modal: it closes
 * on Escape, on a click outside, and when you navigate, and Escape returns
 * focus to its button.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const current = activeSection(pathname);
  const [open, setOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when the route changes. Adjusting state during render (rather than in
  // an effect) drops the menu in the same pass that changes the page.
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onPointer(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <header className="flex flex-wrap items-center gap-x-4 py-3">
      <Link href="/" aria-label={`${BRAND.name} home`} className="rounded-control">
        <Logo />
      </Link>

      <nav
        aria-label="Main"
        className="order-last -mx-4 flex w-[calc(100%+2rem)] border-t border-line px-4 sm:order-none sm:mx-0 sm:ml-auto sm:w-auto sm:border-0 sm:px-0"
      >
        {SECTIONS.map((s) => (
          <Link
            key={s.id}
            href={s.href}
            aria-current={current === s.id ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-11 flex-1 items-center justify-center border-b-[3px] px-4 font-bold text-ink hover:bg-panel sm:flex-none',
              current === s.id ? 'border-accent' : 'border-transparent',
            )}
          >
            {s.label}
          </Link>
        ))}
      </nav>

      <div ref={wrapRef} className="relative ml-auto sm:ml-0">
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-control text-ink hover:bg-panel"
        >
          {open ? <X aria-hidden size={22} /> : <Menu aria-hidden size={22} />}
        </button>

        {open && (
          <div
            id="site-menu"
            className="absolute right-0 top-full z-30 mt-2 w-[min(21rem,calc(100vw-2rem))] rounded-panel bg-panel p-2 shadow-pop"
          >
            <p className="m-0 px-3 pb-1 pt-2 text-caption font-bold uppercase tracking-wide text-muted">Appearance</p>
            <div className="px-1 pb-2">
              <ThemeToggle />
            </div>
            {MENU_GROUPS.map((group) => (
              <div key={group.title} className="border-t border-line pt-1">
                <p className="m-0 px-3 pb-1 pt-2 text-caption font-bold uppercase tracking-wide text-muted">{group.title}</p>
                {group.links.map((link) => (
                  <MenuItem key={link.href} link={link} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
