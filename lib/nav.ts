import { BRAND } from '@/lib/brand';

/**
 * The navigation, as data: the three sections in the header, and the links
 * tucked into the menu. Every internal link is checked against the app folder
 * by a test, so a renamed route cannot leave a dead link behind.
 */

export const SECTIONS = [
  { id: 'fix', label: 'Fix', href: '/fix' },
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'parts', label: 'Parts', href: '/parts' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

/** Which section a path belongs to, so the header can mark it as current. */
export function activeSection(pathname: string): SectionId | null {
  for (const s of SECTIONS) {
    if (pathname === s.href || pathname.startsWith(`${s.href}/`)) return s.id;
  }
  return null;
}

export interface MenuLink {
  label: string;
  href: string;
  /** Opens in a new tab and leaves the app. */
  external?: boolean;
}

export const MENU_GROUPS: { title: string; links: MenuLink[] }[] = [
  {
    title: 'Help',
    links: [{ label: 'Send feedback', href: `${BRAND.repoUrl}/issues`, external: true }],
  },
  {
    title: 'About',
    links: [
      { label: 'About Ohmwise', href: '/about' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Source code', href: BRAND.repoUrl, external: true },
    ],
  },
];
