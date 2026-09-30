import Link from 'next/link';
import { PartDrawing } from '@/components/parts/PartDrawing';
import { Panel } from '@/components/ui/Panel';
import type { ResolvedGuide } from '@/lib/parts/types';
import { oneLine } from '@/lib/parts/guide';

/** A part in the catalog: its drawing, its name, and the one thing it does. */
export function PartCard({ guide }: { guide: ResolvedGuide }) {
  return (
    <Link href={`/parts/${guide.id}`} className="group block h-full rounded-panel">
      <Panel padding="sm" className="h-full transition-shadow group-hover:shadow-[inset_0_0_0_1.5px_var(--border-ui)]">
        <PartDrawing drawing={guide.drawing} bands={guide.bands} label={`Drawing of ${guide.name}`} />
        <h3 className="mb-1 mt-3 text-lg font-extrabold">{guide.name}</h3>
        <p className="m-0 text-small text-muted">{oneLine(guide.what)}</p>
      </Panel>
    </Link>
  );
}
