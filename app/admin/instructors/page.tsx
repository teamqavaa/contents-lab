import { Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import { InstructorsTable } from "@/components/admin/tables/InstructorsTable";
import { instructors } from "@/lib/admin-data";

export default function InstructorsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Instructors" count={instructors.length}>
        <Button variant="outline">
          <Filter />
          Filter: Pending Applications Only
        </Button>
      </PageHeader>

      <InstructorsTable rows={instructors} />
    </div>
  );
}