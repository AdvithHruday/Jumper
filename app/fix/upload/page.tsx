import { UploadDoctor } from '@/components/fix/UploadDoctor';

export const metadata = { title: 'Upload Doctor | Jumper' };

export default function UploadDoctorPage() {
  return (
    <section className="pt-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 border-b-2 border-ink pb-3">
        <h2 className="text-[28px] font-extrabold">Upload Doctor</h2>
        <p className="text-[15px] text-muted">
          Upload failed? Paste the error and find out why, in plain words.
        </p>
      </div>
      <div className="my-6">
        <UploadDoctor />
      </div>
    </section>
  );
}
