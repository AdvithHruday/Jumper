import { ToolCard } from '@/components/fix/ToolCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { FIX_TOOLS } from '@/lib/fix/tools';

export const metadata = {
  title: 'Fix',
  description: 'Something is not working? Find out which layer is failing: the upload, or the sketch and its pins.',
};

export default function FixPage() {
  return (
    <>
      <PageHeader
        title="Fix"
        description="Something is not working. Pick the symptom that matches, and we will help you find which part is failing."
      />
      <ul className="my-6 grid list-none gap-4 p-0 sm:grid-cols-2">
        {FIX_TOOLS.map((tool) => (
          <li key={tool.id}>
            <ToolCard item={tool} variant="full" />
          </li>
        ))}
      </ul>
    </>
  );
}
