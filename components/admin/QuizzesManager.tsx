"use client";

import { useActionState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { RowActions } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Button } from "@/components/ui/button";
import {
  createQuizAction,
  deleteQuizAction,
  updateQuizAction,
} from "@/lib/admin-actions";
import type { Quiz } from "@/lib/api/courses-api";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

const columns: DataColumn<Quiz>[] = [
  {
    key: "title",
    header: "Title",
    sortValue: (q) => q.title,
    render: (q) => (
      <div>
        <span className="font-medium">{q.title}</span>
        <span className="block text-xs text-muted-foreground">{q.slug}</span>
      </div>
    ),
  },
  {
    key: "description",
    header: "Description",
    render: (q) => (
      <span className="text-muted-foreground">{q.description ?? "—"}</span>
    ),
  },
  {
    key: "is_active",
    header: "Status",
    render: (q) => <StatusDot status={q.is_active ? "active" : "draft"} />,
  },
];

function QuizForm() {
  const [state, formAction, pending] = useActionState(createQuizAction, { ok: false });

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">New quiz</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="quiz-title" className="text-xs font-medium text-foreground">Title</label>
          <input id="quiz-title" name="title" required placeholder="Git basics check" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="quiz-active" className="text-xs font-medium text-foreground">Active</label>
          <select id="quiz-active" name="is_active" defaultValue="0" className={inputClass}>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="quiz-description" className="text-xs font-medium text-foreground">Description</label>
          <input id="quiz-description" name="description" placeholder="Short description" className={inputClass} />
        </div>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        <Plus size={15} /> Create
      </Button>
    </form>
  );
}

export function QuizzesManager({ quizzes }: { quizzes: Quiz[] }) {
  return (
    <div className="space-y-4">
      <QuizForm />
      <DataTable
        rows={quizzes}
        rowKey={(q) => q.id}
        columns={columns}
        renderRowActions={(quiz) => (
          <RowActions
            actions={[
              {
                icon: Pencil,
                label: quiz.is_active ? "Deactivate" : "Activate",
                onClick: () =>
                  updateQuizAction(quiz.id, { is_active: !quiz.is_active }).then(() =>
                    location.reload()
                  ),
              },
              {
                icon: Trash2,
                label: "Delete",
                tone: "destructive",
                onClick: () => {
                  if (confirm(`Delete "${quiz.title}"?`)) {
                    deleteQuizAction(quiz.id).then(() => location.reload());
                  }
                },
              },
            ]}
          />
        )}
      />
    </div>
  );
}
