import { CodeChecker } from '@/components/check/CodeChecker';

export const metadata = { title: 'Check my code | Jumper' };

export default function CheckPage() {
  return (
    <section className="pt-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 border-b-2 border-ink pb-3">
        <h2 className="text-[28px] font-extrabold">Check my code</h2>
        <p className="text-[15px] text-muted">
          Does your sketch use pins that exist, work the way you expect, and match your wiring?
        </p>
      </div>
      <div className="my-6">
        <CodeChecker />
      </div>
    </section>
  );
}
