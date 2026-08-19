import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import { UsersTable } from "@/components/admin/tables/UsersTable";
import { users } from "@/lib/admin-data";

export default function UsersPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Users" count={users.length}>
        <Button>
          <Plus />
          Add User
        </Button>
      </PageHeader>

      <UsersTable rows={users} />
    </div>
  );
}