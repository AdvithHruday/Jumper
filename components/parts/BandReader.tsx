import { BAND_COLORS } from '@/components/diagram/parts';
import { resistorValue } from '@/lib/parts/types';

const ROLES = ['First digit', 'Second digit', 'Multiplier', 'Tolerance'] as const;

/**
 * How the bands on a resistor add up to its value. Each band is shown as a
 * colour swatch and its name, so the table works without seeing the colours.
 */
export function BandReader({ bands }: { bands: string[] }) {
  const value = resistorValue(bands);
  if (!value) return null;
  return (
    <div>
      <ol className="m-0 grid list-none gap-1.5 p-0 text-small">
        {bands.map((band, i) => (
          <li key={ROLES[i]} className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="inline-block size-4 shrink-0 rounded-sm shadow-[inset_0_0_0_1px_var(--line-strong)]"
              style={{ background: BAND_COLORS[band] ?? 'var(--panel-2)' }}
            />
            <span className="w-28 text-muted">{ROLES[i]}</span>
            <span className="font-bold capitalize">{band}</span>
          </li>
        ))}
      </ol>
      <p className="mb-0 mt-3 text-small">
        Read with the gold band on the right: <span className="font-bold">{value.text}</span>, {value.tolerance}.
      </p>
    </div>
  );
}
