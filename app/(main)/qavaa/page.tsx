import { Suspense } from "react";
import QavaaSuccessContent from "@/components/payments/QavaaSuccessContent";

export default function QavaaSuccessPage() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading...</p>}>
        <QavaaSuccessContent />
      </Suspense>
    </main>
  );
}
