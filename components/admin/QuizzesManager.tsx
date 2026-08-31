"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { RowActions } from "@/components/admin/RowActions";
import { StatusDot } from "@/components/admin/StatusDot";
import { Button } from "@/components/ui/button";
import {
  createOptionAction,
  createQuestionAction,
  createQuizAction,
  deleteOptionAction,
  deleteQuestionAction,
  deleteQuizAction,
  updateOptionAction,
  updateQuizAction,
  updateQuizLinkAction,
} from "@/lib/admin-actions";
import type {
  ContentTypeRow,
  Course,
  Module,
  Quiz,
  QuizOption,
  QuizQuestion,
  QuizType,
} from "@/lib/api/courses-api";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";
const textareaClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

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

// Polymorphic link editor for a quiz: target a course or a module.
// Writes the quiz content_type (of Course/Module) plus object_id.
type QuizLinkValue = { content_type: string; object_id: string };

function QuizLinkSelects({
  contentTypes,
  courses,
  modules,
  value,
  onChange,
}: {
  contentTypes: ContentTypeRow[];
  courses: Course[];
  modules: Module[];
  value: QuizLinkValue;
  onChange: (v: QuizLinkValue) => void;
}) {
  const courseCt = contentTypes.find((ct) => ct.model === "course");
  const moduleCt = contentTypes.find((ct) => ct.model === "module");
  const targetType =
    value.content_type === String(courseCt?.id)
      ? "course"
      : value.content_type === String(moduleCt?.id)
        ? "module"
        : "";
  const rows = targetType === "course" ? courses : targetType === "module" ? modules : [];
  const rowIds = new Set(rows.map((r) => String(r.id)));
  const objectId = value.object_id && rowIds.has(value.object_id) ? value.object_id : "";

  function setType(contentType: string) {
    onChange({ content_type: contentType, object_id: "" });
  }

  return (
    <>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Linked to</label>
        <select
          className={inputClass}
          value={value.content_type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Nothing (unlinked)</option>
          {courseCt && <option value={String(courseCt.id)}>Course</option>}
          {moduleCt && <option value={String(moduleCt.id)}>Module</option>}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Target</label>
        <select
          className={inputClass}
          value={objectId}
          disabled={targetType === ""}
          onChange={(e) => onChange({ ...value, object_id: e.target.value })}
        >
          <option value="">Select a {targetType || "target"}…</option>
          {rows.map((r) => (
            <option key={r.id} value={String(r.id)}>
              {r.title}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
function QuizForm({
  quizTypes,
  contentTypes,
  courses,
  modules,
}: {
  quizTypes: QuizType[];
  contentTypes: ContentTypeRow[];
  courses: Course[];
  modules: Module[];
}) {
  const [link, setLink] = useState<QuizLinkValue>({ content_type: "", object_id: "" });
  return (
    <form
      action={(formData) => {
        createQuizAction({ ok: false }, formData);
      }}
      className="space-y-3 rounded-xl border border-border bg-card p-4"
    >
      <p className="text-sm font-semibold">New quiz</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Title</label>
          <input name="title" required placeholder="Git basics check" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Quiz type</label>
          <select name="type_quiz" defaultValue="" className={inputClass}>
            <option value="">None</option>
            {quizTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Active</label>
          <select name="is_active" defaultValue="0" className={inputClass}>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-foreground">Description</label>
          <input name="description" placeholder="Short description" className={inputClass} />
        </div>
        <QuizLinkSelects
          contentTypes={contentTypes}
          courses={courses}
          modules={modules}
          value={link}
          onChange={setLink}
        />
        <input type="hidden" name="content_type" value={link.content_type} />
        <input type="hidden" name="object_id" value={link.object_id} />
      </div>
      <Button type="submit">
        <Plus size={15} /> Create
      </Button>
    </form>
  );
}
// Options belong to one question; supports add, edit, toggle-correct, delete.
function OptionList({
  questionId,
  options,
}: {
  questionId: number;
  options: QuizOption[];
}) {
  const rows = options
    .filter((o) => o.question === questionId)
    .sort((a, b) => a.order - b.order);
  const [draft, setDraft] = useState("");

  async function add() {
    const text = draft.trim();
    if (!text) return;
    const res = await createOptionAction(questionId, text, rows.length + 1, false);
    if (res.ok) {
      setDraft("");
      location.reload();
    }
  }

  return (
    <div className="mt-2 space-y-1.5">
      {rows.map((option) => (
        <div key={option.id} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={option.is_correct}
            title="Correct answer"
            onChange={() =>
              updateOptionAction(option.id, {
                text: option.text,
                order: option.order,
                is_correct: !option.is_correct,
              }).then(() => location.reload())
            }
          />
          <span className="flex-1 text-foreground">{option.text}</span>
          <span className="text-xs text-muted-foreground">#{option.order}</span>
          <RowActions
            actions={[
              {
                icon: Trash2,
                label: "Delete option",
                tone: "destructive",
                onClick: () => {
                  if (confirm("Delete this option?")) {
                    deleteOptionAction(option.id).then(() => location.reload());
                  }
                },
              },
            ]}
          />
        </div>
      ))}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder="Add option…"
          className={inputClass}
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus size={14} /> Add
        </Button>
      </div>
    </div>
  );
}

// Questions belong to one quiz; each expands into its option list.
function QuestionList({
  quizId,
  questions,
  options,
}: {
  quizId: number;
  questions: QuizQuestion[];
  options: QuizOption[];
}) {
  const rows = questions
    .filter((q) => q.quiz === quizId)
    .sort((a, b) => a.order - b.order);
  const [draft, setDraft] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function add() {
    const text = draft.trim();
    if (!text) return;
    const res = await createQuestionAction(quizId, text, rows.length + 1);
    if (res.ok) {
      setDraft("");
      location.reload();
    }
  }

  return (
    <div className="rounded-lg border border-border bg-zinc-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Questions
      </p>
      <ul className="space-y-2">
        {rows.length === 0 && (
          <li className="text-xs text-muted-foreground">No questions yet.</li>
        )}
        {rows.map((question) => (
          <li key={question.id} className="rounded-md border border-border bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">
                {question.order}. {question.text}
              </span>
              <RowActions
                actions={[
                  {
                    icon: Pencil,
                    label: "Options",
                    onClick: () => setExpandedId(expandedId === question.id ? null : question.id),
                  },
                  {
                    icon: Trash2,
                    label: "Delete question",
                    tone: "destructive",
                    onClick: () => {
                      if (confirm("Delete this question and its options?")) {
                        deleteQuestionAction(question.id).then(() => location.reload());
                      }
                    },
                  },
                ]}
              />
            </div>
            {expandedId === question.id && (
              <OptionList questionId={question.id} options={options} />
            )}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder="Add question…"
          className={inputClass}
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus size={14} /> Add
        </Button>
      </div>
    </div>
  );
}

function QuizEditPanel({
  quiz,
  quizTypes,
  questions,
  options,
  contentTypes,
  courses,
  modules,
}: {
  quiz: Quiz;
  quizTypes: QuizType[];
  questions: QuizQuestion[];
  options: QuizOption[];
  contentTypes: ContentTypeRow[];
  courses: Course[];
  modules: Module[];
}) {
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description ?? "");
  const [typeQuiz, setTypeQuiz] = useState(quiz.type_quiz ? String(quiz.type_quiz) : "");
  const [isActive, setIsActive] = useState(quiz.is_active);
  const [link, setLink] = useState<QuizLinkValue>({
    content_type: quiz.content_type != null ? String(quiz.content_type) : "",
    object_id: quiz.object_id != null ? String(quiz.object_id) : "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await updateQuizAction(quiz.id, {
      title,
      description: description || null,
      type_quiz: typeQuiz === "" ? null : Number(typeQuiz),
      is_active: isActive,
    });
    const linkFields =
      link.content_type === "" || link.object_id === ""
        ? { content_type: null, object_id: null }
        : { content_type: Number(link.content_type), object_id: Number(link.object_id) };
    await updateQuizLinkAction(quiz.id, linkFields);
    location.reload();
  }

  return (
    <div className="mb-6 space-y-4 rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Edit quiz — {quiz.title}</p>
        <Button type="button" size="sm" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save quiz"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Quiz type</label>
          <select
            value={typeQuiz}
            onChange={(e) => setTypeQuiz(e.target.value)}
            className={inputClass}
          >
            <option value="">None</option>
            {quizTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Active</label>
          <select
            value={isActive ? "1" : "0"}
            onChange={(e) => setIsActive(e.target.value === "1")}
            className={inputClass}
          >
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={textareaClass}
          />
        </div>
        <QuizLinkSelects
          contentTypes={contentTypes}
          courses={courses}
          modules={modules}
          value={link}
          onChange={setLink}
        />
      </div>
      <QuestionList quizId={quiz.id} questions={questions} options={options} />
    </div>
  );
}

export function QuizzesManager({
  quizzes,
  quizTypes,
  questions,
  options,
  courses,
  modules,
  contentTypes,
}: {
  quizzes: Quiz[];
  quizTypes: QuizType[];
  questions: QuizQuestion[];
  options: QuizOption[];
  courses: Course[];
  modules: Module[];
  contentTypes: ContentTypeRow[];
}) {
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  if (editingQuiz) {
    return (
      <div className="space-y-4">
        <QuizEditPanel
          quiz={editingQuiz}
          quizTypes={quizTypes}
          questions={questions}
          options={options}
          contentTypes={contentTypes}
          courses={courses}
          modules={modules}
        />
        <Button variant="outline" onClick={() => setEditingQuiz(null)}>
          <X size={15} /> Close editor
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <QuizForm
        quizTypes={quizTypes}
        contentTypes={contentTypes}
        courses={courses}
        modules={modules}
      />
      <DataTable
        rows={quizzes}
        rowKey={(q) => q.id}
        columns={columns}
        renderRowActions={(quiz) => (
          <RowActions
            actions={[
              {
                icon: Pencil,
                label: "Edit quiz",
                onClick: () => setEditingQuiz(quiz),
              },
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
