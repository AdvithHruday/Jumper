import Link from 'next/link';
import { ArrowRight, Boxes } from 'lucide-react';
import { ContinueButton, ProjectPath, ResetProgress } from '@/components/ui/ProjectPath';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { PROJECTS } from '@/content/projects';

export const metadata = {
  title: 'Learn',
  description: 'Guided builds that show exactly which hole each wire goes in, and what you can build with the parts you own.',
};

export default function LearnPage() {
  return (
    <>
      <PageHeader
        title="Learn"
        description="Build something that works, one wire at a time, or see what your own parts can make."
        actions={<ContinueButton projects={PROJECTS} />}
      />

      <section className="mt-8">
        <h2 className="m-0 text-2xl font-extrabold">Guided projects</h2>
        <p className="mb-0 mt-1 text-small text-muted">Each one uses a skill from the one before, with a diagram for every step.</p>
        <ProjectPath projects={PROJECTS} />
      </section>

      <section className="mt-2">
        <h2 className="m-0 text-2xl font-extrabold">Build from your kit</h2>
        <Link href="/learn/build" className="group mt-3 block rounded-panel">
          <Panel className="flex items-center gap-4 transition-shadow group-hover:shadow-[inset_0_0_0_1.5px_var(--border-ui)]">
            <Boxes aria-hidden size={28} className="flex-none" />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-lg font-extrabold">What can I build?</p>
              <p className="m-0 text-muted">
                Tell us which parts you own and see what you can build today, and what one more part unlocks.
              </p>
            </div>
            <ArrowRight aria-hidden size={20} className="flex-none text-link transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Panel>
        </Link>
      </section>

      <div className="mb-12 mt-6 flex flex-wrap items-center justify-between gap-3 text-small text-muted">
        <span>Your progress is saved in this browser.</span>
        <ResetProgress />
      </div>
    </>
  );
}
