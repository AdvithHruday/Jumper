import { KitMatcher } from '@/components/build/KitMatcher';

export const metadata = { title: 'What can I build? | Jumper' };

export default function BuildPage() {
  return (
    <section className="pt-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 border-b-2 border-ink pb-3">
        <h2 className="text-[28px] font-extrabold">What can I build?</h2>
        <p className="text-[15px] text-muted">
          Tell us what is in your kit. We show what you can build today, and what one more part unlocks.
        </p>
      </div>
      <p className="mb-0 mt-4 rounded-xl bg-panel p-3.5 text-[15px] text-muted shadow-[inset_0_0_0_1px_var(--line)]">
        These builds come with wiring, code and the mistakes people make. They have not been built on real hardware
        yet, so read the wiring against your parts and tell us what is wrong.
      </p>
      <div className="my-6">
        <KitMatcher />
      </div>
    </section>
  );
}
