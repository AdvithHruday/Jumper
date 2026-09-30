import { ButtonLink } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title="We can’t find that page"
        description="It may have moved, or the address may have a typo. These are the places most people are looking for."
      />
      <div className="my-6 flex flex-wrap gap-3">
        <ButtonLink href="/fix" variant="primary">
          Fix a build
        </ButtonLink>
        <ButtonLink href="/learn">Learn</ButtonLink>
        <ButtonLink href="/parts">Parts</ButtonLink>
        <ButtonLink href="/" variant="ghost">
          Home
        </ButtonLink>
      </div>
    </>
  );
}
