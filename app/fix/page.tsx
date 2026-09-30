import Link from 'next/link';
import { ArrowRight, FileSearch, Stethoscope, type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';

export const metadata = {
  title: 'Fix',
  description: 'Something is not working? Find out which layer is failing: the upload, or the sketch and its pins.',
};

const TOOLS: { href: string; icon: LucideIcon; title: string; what: string; when: string }[] = [
  {
    href: '/fix/upload',
    icon: Stethoscope,
    title: 'Upload Doctor',
    what: 'Paste the error from the Arduino IDE and get the likely causes, most likely first, with one fix per step.',
    when: 'The IDE shows a red error when you press Upload.',
  },
  {
    href: '/fix/code',
    icon: FileSearch,
    title: 'Check my code',
    what: 'Paste your sketch and check every pin against your board, and against a guided project’s wiring.',
    when: 'The upload works but an LED, sensor or motor does nothing.',
  },
];

export default function FixPage() {
  return (
    <>
      <PageHeader
        title="Fix"
        description="Something is not working. Pick the symptom that matches, and we will help you find which part is failing."
      />
      <ul className="my-6 grid list-none gap-4 p-0 sm:grid-cols-2">
        {TOOLS.map(({ href, icon: Icon, title, what, when }) => (
          <li key={href}>
            <Link href={href} className="group block h-full rounded-panel">
              <Panel className="h-full transition-shadow group-hover:shadow-[inset_0_0_0_1.5px_var(--border-ui)]">
                <Icon aria-hidden size={26} className="text-ink" />
                <h2 className="mb-1 mt-3 text-xl font-extrabold">{title}</h2>
                <p className="m-0 text-muted">{what}</p>
                <p className="mb-0 mt-3 text-small">
                  <span className="font-bold">Use this when: </span>
                  {when}
                </p>
                <p className="mb-0 mt-4 inline-flex items-center gap-1.5 font-bold text-link">
                  Open <ArrowRight aria-hidden size={16} className="transition-transform motion-safe:group-hover:translate-x-0.5" />
                </p>
              </Panel>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
