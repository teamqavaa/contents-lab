import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import { LearningPathsTable } from "@/components/admin/tables/LearningPathsTable";
import { learningPaths } from "@/lib/admin-data";

export default function LearningPathsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Learning Paths" count={learningPaths.length}>
        <Button>
          <Plus />
          Create Learning Path
        </Button>
      </PageHeader>

      <LearningPathsTable rows={learningPaths} />
    </div>
  );
}