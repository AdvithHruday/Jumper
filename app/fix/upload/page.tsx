import { FixUpload } from '@/components/fix/FixUpload';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = {
  title: 'Fix my upload',
  description: 'Paste the error from the Arduino IDE and get the likely causes, most likely first, with one fix per step.',
};

export default function FixUploadPage() {
  return (
    <>
      <PageHeader
        title="Fix my upload"
        description="Why won't it upload? Paste the error and find out why, in plain words."
      />
      <div className="my-6">
        <FixUpload />
      </div>
    </>
  );
}
