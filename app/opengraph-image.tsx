import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BRAND, BRAND_COLORS, MARK } from '@/lib/brand';

export const alt = `${BRAND.name}: ${BRAND.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const heading = await readFile(join(process.cwd(), 'assets/fonts/BricolageGrotesque-ExtraBold.ttf'));

/** The social preview: lockup, one promise, and the yellow "do this now" bar. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: BRAND_COLORS.ink,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          fontFamily: 'Bricolage Grotesque',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width={112} height={75} viewBox={MARK.viewBox}>
            <path d={MARK.path} fill="none" stroke={BRAND_COLORS.accent} strokeWidth={MARK.strokeWidth} strokeLinejoin="round" />
            <rect x={0.5} y={22} width={5} height={6} rx={1} fill={BRAND_COLORS.light} />
            <rect x={34.5} y={22} width={5} height={6} rx={1} fill={BRAND_COLORS.light} />
          </svg>
          <div style={{ fontSize: 64, color: BRAND_COLORS.light, marginLeft: 28 }}>{BRAND.name}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 88, lineHeight: 1.04, color: BRAND_COLORS.light, maxWidth: 980, letterSpacing: -2 }}>
            {`${BRAND.tagline}.`}
          </div>
          <div style={{ fontSize: 34, color: BRAND_COLORS.muted, marginTop: 28 }}>
            Upload errors, pin checks and guided builds, in plain English.
          </div>
        </div>

        <div style={{ width: 160, height: 10, background: BRAND_COLORS.accent, borderRadius: 5 }} />
      </div>
    ),
    { ...size, fonts: [{ name: 'Bricolage Grotesque', data: heading, style: 'normal', weight: 800 }] },
  );
}
