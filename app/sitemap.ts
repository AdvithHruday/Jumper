import type { MetadataRoute } from 'next';
import { LIBRARY } from '@/content/library';
import { PROJECTS } from '@/content/projects';
import { SITE_URL } from '@/lib/brand';

/**
 * Every public page. Built from the same content the routes are generated from,
 * so a new project or build appears here without anyone remembering to add it.
 * Internal pages (/design) are left out on purpose.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '/',
    '/fix',
    '/fix/upload',
    '/fix/code',
    '/learn',
    '/learn/build',
    '/parts',
    '/about',
    '/privacy',
    ...LIBRARY.map((p) => `/learn/build/${p.id}`),
    ...PROJECTS.flatMap((p) => p.steps.map((_, i) => `/learn/projects/${p.id}/${i + 1}`)),
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
