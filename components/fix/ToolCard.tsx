import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';

/** The minimum a card needs; every FixTool satisfies it, and so does the "just starting" path. */
export interface ToolCardItem {
  href: string;
  icon: LucideIcon;
  name: string;
  symptom: string;
  what?: string;
  when?: string;
}

/**
 * A door into the app. `full` leads with the tool's name and says when to use
 * it (the Fix hub); `symptom` leads with what the person is experiencing and
 * names the tool underneath (the home page). Same data, same card, two
 * emphases, so the wording of a symptom can never differ between the two.
 */
export function ToolCard({ item, variant }: { item: ToolCardItem; variant: 'full' | 'symptom' }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="group block h-full rounded-panel">
      <Panel className="h-full transition-shadow group-hover:shadow-[inset_0_0_0_1.5px_var(--border-ui)]">
        <Icon aria-hidden size={26} />
        {variant === 'full' ? (
          <>
            <p className="m-0 mt-3 text-caption font-bold uppercase tracking-wide text-muted">{item.symptom}</p>
            <h2 className="mb-1 mt-1 text-xl font-extrabold">{item.name}</h2>
            {item.what && <p className="m-0 text-muted">{item.what}</p>}
            {item.when && (
              <p className="mb-0 mt-3 text-small">
                <span className="font-bold">Use this when: </span>
                {item.when}
              </p>
            )}
          </>
        ) : (
          <>
            <h3 className="mb-1 mt-3 text-lg font-extrabold">{item.symptom}</h3>
            <p className="m-0 text-muted">{item.name}</p>
          </>
        )}
        <p className="mb-0 mt-4 inline-flex items-center gap-1.5 font-bold text-link">
          Open <ArrowRight aria-hidden size={16} className="transition-transform motion-safe:group-hover:translate-x-0.5" />
        </p>
      </Panel>
    </Link>
  );
}
