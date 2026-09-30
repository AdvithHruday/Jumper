import { KitMatcher } from '@/components/build/KitMatcher';
import { Callout } from '@/components/ui/Callout';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = { title: 'What can I build?' };

export default function BuildPage() {
  return (
    <>
      <PageHeader
        title="What can I build?"
        description="Tell us what is in your kit. We show what you can build today, and what one more part unlocks."
      />
      <Callout variant="warning" title="Not built on real hardware yet" className="mt-4">
        These builds come with wiring, code and the mistakes people make, but nobody has built them on real hardware yet.
        Read the wiring against your parts and tell us what is wrong.
      </Callout>
      <div className="my-6">
        <KitMatcher />
      </div>
    </>
  );
}
