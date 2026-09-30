import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Callout } from '@/components/ui/Callout';
import { PageHeader } from '@/components/ui/PageHeader';
import { BRAND, TEAM } from '@/lib/brand';

export const metadata = {
  title: 'About',
  description: `${BRAND.name} is an independent, open-source tool that helps you work out why an Arduino or ESP32 build is not working.`,
};

const H2 = 'mb-2 mt-9 border-b border-line pb-1.5 text-xl font-extrabold';
const LINK = 'font-bold text-link underline underline-offset-2';

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title={`About ${BRAND.name}`}
        description="An independent, open-source tool that helps you work out why an Arduino or ESP32 build is not working."
      />

      <div className="max-w-[68ch] pb-4">
        <h2 className={H2}>Why it exists</h2>
        <p>
          When a first circuit does nothing, the cause could be the cable, the driver, a wire, a part, a pin number or the
          code, and to a beginner they all look the same. {BRAND.name} helps you tell which one it is, in plain English,
          without needing to already know.
        </p>

        <h2 className={H2}>What it does today</h2>
        <ul className="m-0 space-y-2 pl-5">
          <li>
            <Link href="/fix/upload" className={LINK}>Fix my upload</Link>: paste an upload error and get the likely causes,
            most likely first, with one fix per step.
          </li>
          <li>
            <Link href="/fix/code" className={LINK}>Check my code</Link>: check every pin in a sketch against your board, and
            against a guided project’s wiring.
          </li>
          <li>
            <Link href="/learn" className={LINK}>Guided projects</Link>: build a circuit one wire at a time, with a diagram
            for every step.
          </li>
          <li>
            <Link href="/learn/build" className={LINK}>What can I build?</Link>: say which parts you own and see what you can
            make, with the wiring, the sketch and the mistakes people make.
          </li>
        </ul>

        <Callout variant="warning" title="Some of it is not tested on real hardware yet" className="mt-6">
          The projects in the build library have not been built on a real board, and the pin data for each board is being
          checked against datasheets. Each project says so on its page. Corrections are the most useful thing you can send us.
        </Callout>

        <h2 className={H2}>Open source</h2>
        <p>
          {BRAND.name} is released under the MIT licence, so you can use it, change it and share it. The code is on{' '}
          <a href={BRAND.repoUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
            GitHub<ExternalLink aria-hidden size={14} className="ml-1 inline align-[-1px]" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          . Found a wrong pin, a bad instruction or something confusing? Open an issue there.
        </p>

        <h2 className={H2}>Who built it</h2>
        <ul className="m-0 list-none space-y-1 p-0">
          {TEAM.map((person) => (
            <li key={person.email}>
              <span className="font-bold">{person.name}</span>{' '}
              <a href={`mailto:${person.email}`} className={LINK}>
                {person.email}
              </a>
            </li>
          ))}
        </ul>

        <h2 className={H2}>Not affiliated</h2>
        <p>
          {BRAND.name} is independent. It is not affiliated with or endorsed by Arduino or Espressif. Product names are
          trademarks of their owners and are used only to say which boards this works with.
        </p>
      </div>
    </>
  );
}
