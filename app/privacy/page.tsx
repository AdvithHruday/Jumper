import { ExternalLink } from 'lucide-react';
import { Callout } from '@/components/ui/Callout';
import { PageHeader } from '@/components/ui/PageHeader';
import { BRAND, CONTACT_EMAIL } from '@/lib/brand';

export const metadata = {
  title: 'Privacy',
  description: `What ${BRAND.name} stores, what it sends, and to whom. It has no accounts, no cookies and no analytics.`,
};

const H2 = 'mb-2 mt-9 border-b border-line pb-1.5 text-xl font-extrabold';
const LINK = 'font-bold text-link underline underline-offset-2';

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="Privacy"
        description="What is stored, what is sent, and to whom. Last updated 30 September 2026."
      />

      <div className="max-w-[68ch] pb-4">
        <Callout variant="info" title="The short version" className="mt-6">
          {BRAND.name} has no accounts, no cookies and no analytics. What you save stays in your browser. The one thing
          that leaves your device is the photos you choose to send to Photo scan.
        </Callout>

        <h2 className={H2}>What stays on your device</h2>
        <p>
          Your progress in the guided projects, the list of parts you own, and your light or dark choice are saved in your
          browser’s own storage. They are not sent to us. Clearing your browser’s site data removes them.
        </p>

        <h2 className={H2}>Your code, errors and board</h2>
        <p>
          Sketches you paste into Check my code and error text you paste into Upload Doctor are read in your browser and
          are not uploaded. “Detect my board” only reads the USB chip ID of a port you pick, and it stays in your browser.
        </p>

        <h2 className={H2}>Photo scan</h2>
        <p>When you press Scan on the “What can I build?” page:</p>
        <ul className="m-0 space-y-1.5 pl-5">
          <li>Your photos are shrunk in your browser first. Re-encoding them also drops any location data.</li>
          <li>
            They are sent through our server to Anthropic’s Claude, which identifies the parts and sends an answer back.
          </li>
          <li>We do not store your photos or the answer.</li>
          <li>
            Anthropic handles the images under its own terms and{' '}
            <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" className={LINK}>
              privacy policy
              <ExternalLink aria-hidden size={14} className="ml-1 inline align-[-1px]" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </li>
        </ul>
        <p>
          Photograph only your parts. Please do not include people, faces, screens or documents. If you are under 18, ask a
          parent or teacher before using Photo scan.
        </p>

        <h2 className={H2}>What our server sees</h2>
        <p>
          To stop misuse and control cost, the server keeps your IP address in memory, not on disk, for up to an hour to
          count how many scans you run. Whoever hosts the site may also keep standard server logs, such as your IP address
          and the pages requested.
        </p>

        <h2 className={H2}>Young people</h2>
        <p>
          {BRAND.name} does not ask for your name, age or email, and does not make profiles. You can use everything except
          Photo scan without giving us any personal information.
        </p>

        <h2 className={H2}>Changes and questions</h2>
        <p>
          This page describes what {BRAND.name} does today. If that changes, for example by adding sign-in, this page will be
          updated before the change goes live.
        </p>
        {CONTACT_EMAIL ? (
          <p>
            For questions or requests about your data, write to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        ) : (
          <p>
            You can ask a question by opening an issue on{' '}
            <a href={`${BRAND.repoUrl}/issues`} target="_blank" rel="noopener noreferrer" className={LINK}>
              GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            . Issues are public, so please do not put personal information in one.
          </p>
        )}
      </div>
    </>
  );
}
