import type { MetadataRoute } from 'next';
import { BRAND, BRAND_COLORS } from '@/lib/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name}: ${BRAND.tagline}`,
    short_name: BRAND.name,
    description: BRAND.description,
    start_url: '/',
    display: 'standalone',
    background_color: BRAND_COLORS.light,
    theme_color: BRAND_COLORS.mat,
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
