import { PartCard } from '@/components/parts/PartCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { getGuide, partGroups } from '@/lib/parts/guide';

export const metadata = {
  title: 'Meet your parts',
  description: 'Every part in the Ohmwise kit: a drawing, how to recognise it, which way round it goes, and what to watch for.',
};

export default function PartsPage() {
  const groups = partGroups();
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return (
    <div className="pb-12">
      <PageHeader
        title="Meet your parts"
        description={`All ${total} parts in the kit. Each has a drawing, how to recognise it, which way round it goes, and what to watch out for.`}
      />
      {groups.map((group) => (
        <section key={group.id} aria-labelledby={`group-${group.id}`} className="mt-8">
          <h2 id={`group-${group.id}`} className="mb-3 text-xl font-extrabold">
            {group.title}
          </h2>
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => {
              const guide = getGuide(item.id);
              return guide ? (
                <li key={item.id}>
                  <PartCard guide={guide} />
                </li>
              ) : null;
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
