import { CodeChecker } from '@/components/check/CodeChecker';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = { title: 'Check my code' };

export default function CheckPage() {
  return (
    <>
      <PageHeader
        title="Check my code"
        description="Does your sketch use pins that exist, work the way you expect, and match your wiring?"
      />
      <div className="my-6">
        <CodeChecker />
      </div>
    </>
  );
}
