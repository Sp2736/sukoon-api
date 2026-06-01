import type { Metadata } from 'next';
import WorkForm from "@/components/WorkForm";

export const metadata: Metadata = { title: 'Add Work - Admin' };

export default function NewWorkPage() {
  return (
    <div className="relative z-10">
      <WorkForm />
    </div>
  );
}