import Link from 'next/link';
import { ArrowRight, Sprout, Upload } from 'lucide-react';
import { Scene } from '@/components/diagram/Scene';
import { FixUpload, EXAMPLE_ERROR } from '@/components/fix/FixUpload';
import { ToolCard } from '@/components/fix/ToolCard';
import { ContinueBanner } from '@/components/home/ContinueBanner';
import { ButtonLink } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { PROJECTS, getProject } from '@/content/projects';
import { PARTS } from '@/content/parts';
import { BRAND } from '@/lib/brand';
import { FIX_TOOLS } from '@/lib/fix/tools';
import { getHomeStats } from '@/lib/home';

const STARTING = {
  href: '/learn',
  icon: Sprout,
  name: 'Guided projects',
  symptom: "I'm just starting",
};

export default function Home() {
  const demo = getProject('first-light')!;
  const stats = getHomeStats();

  return (
    <>
      <ContinueBanner projects={PROJECTS} />

      <section className="grid items-start gap-8 pb-12 pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 lg:pt-8">
        <div>
          <h1 className="text-[clamp(36px,5vw,58px)] font-extrabold leading-[1.03] tracking-[-0.025em]">
            {`${BRAND.tagline}.`}
          </h1>
          <p className="mb-7 mt-5 max-w-[36ch] text-[19px] text-muted">{BRAND.description}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <ButtonLink href="/fix/upload" variant="primary" icon={Upload}>
              Fix my upload
            </ButtonLink>
            <ButtonLink href="/learn" variant="ghost" size="sm" className="-ml-2">
              or start learning <ArrowRight aria-hidden size={16} />
            </ButtonLink>
          </div>
        </div>

        <Panel padding="sm" aria-label="Example: paste an upload error and see the likely cause">
          <FixUpload compact initialLog={EXAMPLE_ERROR} />
        </Panel>
      </section>

      <section aria-labelledby="hurt-heading" className="pb-12">
        <h2 id="hurt-heading" className="m-0 border-b-2 border-ink pb-3 text-[28px] font-extrabold">
          Where does it hurt?
        </h2>
        <ul className="mt-5 grid list-none gap-4 p-0 sm:grid-cols-3">
          {[...FIX_TOOLS, STARTING].map((item) => (
            <li key={item.href}>
              <ToolCard item={item} variant="symptom" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="proof-heading" className="pb-12">
        <h2 id="proof-heading" className="m-0 border-b-2 border-ink pb-3 text-[28px] font-extrabold">
          Built on checks you can read
        </h2>
        <dl className="m-0 mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <Panel key={s.label} padding="sm" className="flex flex-col-reverse gap-1">
              <dt className="text-small text-muted">{s.label}</dt>
              <dd className="m-0 font-head text-[34px] font-extrabold leading-none">{s.value}</dd>
            </Panel>
          ))}
        </dl>
        <p className="mb-0 mt-4 max-w-[62ch] text-muted">
          Every rule is plain code with a test, in the open. If one is wrong, you can see why and tell us.{' '}
          <a href={BRAND.repoUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-link underline underline-offset-2">
            Read the source<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </section>

      <section aria-labelledby="learn-heading" className="grid items-center gap-8 pb-4 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-12">
        <div>
          <h2 id="learn-heading" className="m-0 text-[28px] font-extrabold">
            Or learn by building
          </h2>
          <p className="mb-5 mt-2 max-w-[42ch] text-muted">
            One wire at a time, with a diagram for every step: which hole, why it goes there, and what to check when it does
            not work.
          </p>
          <ButtonLink href="/learn">See the guided projects</ButtonLink>
        </div>
        <div>
          <div className="mat">
            <Scene
              project={demo}
              stepIndex={demo.steps.length - 1}
              parts={PARTS}
              showAll
              animation={{ led1: 'blink' }}
              label="A finished LED circuit with the LED blinking"
            />
          </div>
          <p className="mx-1 mt-2.5 text-small text-muted">
            Guided project 1, finished: pin 9 blinks an LED through a 220 Ω resistor.{' '}
            <Link href="/learn/projects/first-light/1" className="font-bold text-link underline underline-offset-2">
              Start it
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
