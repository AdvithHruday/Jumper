import { UploadDoctor } from '@/components/fix/UploadDoctor';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = { title: 'Upload Doctor' };

export default function UploadDoctorPage() {
  return (
    <>
      <PageHeader
        title="Upload Doctor"
        description="Upload failed? Paste the error and find out why, in plain words."
      />
      <div className="my-6">
        <UploadDoctor />
      </div>
    </>
  );
}
