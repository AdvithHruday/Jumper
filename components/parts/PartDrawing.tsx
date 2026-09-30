import { DRAWINGS } from '@/components/parts/drawings';
import { DRAWING_HEIGHT, DRAWING_WIDTH } from '@/components/parts/drawings/types';
import { cn } from '@/lib/ui/cn';
import type { DrawingKey } from '@/lib/parts/types';

/**
 * A part on the board mat, the same teal tile the guided diagrams use. With
 * `markers`, numbered yellow dots sit on the named points of the drawing; the
 * detail page lists what each number means as real text, so nothing depends
 * on reading the picture.
 */
export function PartDrawing({
  drawing,
  label,
  bands,
  markers,
  className,
}: {
  drawing: DrawingKey;
  /** What the picture shows, for people who cannot see it. */
  label: string;
  bands?: string[];
  markers?: { n: number; at: string }[];
  className?: string;
}) {
  const spec = DRAWINGS[drawing];
  return (
    <svg
      viewBox={`0 0 ${DRAWING_WIDTH} ${DRAWING_HEIGHT}`}
      role="img"
      aria-label={label}
      className={cn('block h-auto w-full rounded-panel', className)}
    >
      <rect width={DRAWING_WIDTH} height={DRAWING_HEIGHT} rx="10" fill="var(--mat)" />
      {spec.render({ bands })}
      {markers?.map(({ n, at }) => {
        const point = spec.anchors[at];
        if (!point) return null;
        return (
          <g key={n} transform={`translate(${point[0]} ${point[1]})`}>
            <circle r="6.5" fill="var(--accent)" stroke="var(--on-accent)" strokeWidth="1" />
            <text
              y="3"
              fontSize="8.5"
              fontWeight="800"
              textAnchor="middle"
              fill="var(--on-accent)"
              fontFamily="var(--font-head)"
            >
              {n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
