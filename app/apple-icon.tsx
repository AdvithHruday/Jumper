import { ImageResponse } from 'next/og';
import { BRAND_COLORS, MARK } from '@/lib/brand';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** The home-screen icon: the mark on the board-mat tile, centred by its own bounds. */
export default function AppleIcon() {
  const scale = 3.2;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: BRAND_COLORS.mat,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={40 * scale} height={30 * scale} viewBox="0 0 40 30">
          <g transform={`translate(${20 - MARK.center.x} ${15 - MARK.center.y})`}>
            <path d={MARK.path} fill="none" stroke={BRAND_COLORS.accent} strokeWidth={4.6} strokeLinejoin="round" />
            <rect x={0.5} y={22} width={5.5} height={6.5} rx={1} fill={BRAND_COLORS.light} />
            <rect x={34} y={22} width={5.5} height={6.5} rx={1} fill={BRAND_COLORS.light} />
          </g>
        </svg>
      </div>
    ),
    { ...size },
  );
}
