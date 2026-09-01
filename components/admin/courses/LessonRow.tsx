"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createDjangoVideoAction,
  deleteDjangoLessonAction,
  deleteDjangoVideoAction,
  updateDjangoLessonAction,
  updateDjangoVideoAction,
} from "@/lib/admin-actions";
import type {
  DjangoLesson,
  DjangoLessonType,
  DjangoVideo,
} from "@/lib/api/courses-api";
import {
  emptyVideoForm,
  VideoEditControls,
  VideoFields,
  VideoSummary,
  type VideoFormState,
} from "./VideoFields";
import { Badge } from "@/components/ui/badge";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

const LESSON_TYPES: { value: DjangoLessonType; label: string }[] = [
  { value: "VIDEO", label: "Video" },
  { value: "ARTICLE", label: "Article" },
  { value: "DOCUMENT", label: "Document" },
  { value: "QUIZ", label: "Quiz" },
];

function videoToForm(v: DjangoVideo): VideoFormState {
  return {
    title: v.title ?? "",
    provider: v.provider,
    video_url: v.video_url ?? "",
    external_id: v.external_id ?? "",
    thumbnail_url: v.thumbnail_url ?? "",
    duration_in_seconds: v.duration_in_seconds ? String(v.duration_in_seconds) : "",
  };
}

export function LessonRow({
  lesson,
  onRefresh,
}: {
  lesson: DjangoLesson;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [lessonType, setLessonType] = useState<DjangoLessonType>(lesson.lesson_type);
  const [order, setOrder] = useState(lesson.order);
  const [duration, setDuration] = useState(lesson.duration_in_minutes);
  const [isPreview, setIsPreview] = useState(lesson.is_preview);
  const [isPublished, setIsPublished] = useState(lesson.is_published);
  const [description, setDescription] = useState(lesson.description ?? "");
  const [busy, setBusy] = useState(false);

  const video = lesson.video ?? null;

  // Video state
  const [editingVideo, setEditingVideo] = useState(false);
  const [videoForm, setVideoForm] = useState<VideoFormState>(
    video ? videoToForm(video) : emptyVideoForm
  );

  async function saveLesson() {
    setBusy(true);
    await updateDjangoLessonAction(lesson.id, {
      title,
      lesson_type: lessonType,
      order,
      duration_in_minutes: duration,
      is_preview: isPreview,
      is_published: isPublished,
      description,
    });
    setBusy(false);
    setEditing(false);
    onRefresh();
  }

  async function deleteLesson() {
    setBusy(true);
    await deleteDjangoLessonAction(lesson.id);
    setBusy(false);
    onRefresh();
  }

  async function saveVideo() {
    if (!videoForm.video_url.trim()) return;
    setBusy(true);
    const payload = {
      title: videoForm.title.trim() || title,
      provider: videoForm.provider,
      video_url: videoForm.video_url.trim(),
      external_id: videoForm.external_id.trim() || undefined,
      thumbnail_url: videoForm.thumbnail_url.trim() || undefined,
      duration_in_seconds: videoForm.duration_in_seconds
        ? Number(videoForm.duration_in_seconds)
        : 0,
    };
    const res = video
      ? await updateDjangoVideoAction(video.id, payload)
      : await createDjangoVideoAction({ lesson: lesson.id, ...payload });
    setBusy(false);
    if (res.ok) {
      setEditingVideo(false);
      onRefresh();
    }
  }

  async function deleteVideo() {
    setBusy(true);
    await deleteDjangoVideoAction(video!.id);
    setBusy(false);
    onRefresh();
  }

  return (
    <li className="rounded-md border border-border bg-white px-3 py-2">
      <div className="flex items-start gap-2">
        {editing ? (
          <div className="flex flex-1 flex-col gap-1.5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              autoFocus
            />
            <div className="grid gap-1.5 sm:grid-cols-4">
              <select
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value as DjangoLessonType)}
                className={inputClass}
              >
                {LESSON_TYPES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={order}
                min="1"
                onChange={(e) => setOrder(Number(e.target.value))}
                className={inputClass}
                title="Order"
              />
              <input
                type="number"
                value={duration}
                min="0"
                onChange={(e) => setDuration(Number(e.target.value))}
                className={inputClass}
                title="Duration (minutes)"
              />
              <select
                value={isPublished ? "published" : "draft"}
                onChange={(e) => setIsPublished(e.target.value === "published")}
                className={inputClass}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lesson description (optional)"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={isPreview}
                  onChange={(e) => setIsPreview(e.target.checked)}
                />
                Free preview
              </label>
            </div>
          </div>
        ) : (
          <div className="flex-1 text-sm">
            <span className="mr-1.5 text-muted-foreground">{lesson.order}.</span>
            <span className="font-medium">{lesson.title}</span>
            <Badge variant="outline" className="ml-2">
              {lesson.lesson_type.toLowerCase()}
            </Badge>
            <span className="ml-2 text-xs text-muted-foreground">
              {lesson.duration_in_minutes} min
            </span>
            {lesson.is_preview && (
              <span className="ml-1 text-xs text-primary">preview</span>
            )}
          </div>
        )}

        <div className="flex gap-1">
          {editing ? (
            <>
              <Button size="sm" variant="outline" disabled={busy} onClick={saveLesson}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                <Pencil size={13} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  if (confirm(`Delete lesson "${lesson.title}"?`)) deleteLesson();
                }}
              >
                <Trash2 size={13} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Video section — only for VIDEO lessons */}
      {lesson.lesson_type === "VIDEO" &&
        !editing &&
        (editingVideo ? (
          <div className="mt-2 space-y-1.5">
            <VideoFields form={videoForm} setForm={setVideoForm} />
            <VideoEditControls
              busy={busy}
              onSave={saveVideo}
              onCancel={() => setEditingVideo(false)}
            />
          </div>
        ) : video ? (
          <div className="flex items-center gap-1">
            <div className="flex-1">
              <VideoSummary
                video={{
                  title: video.title,
                  provider: video.provider,
                  video_url: video.video_url,
                  duration_in_seconds: video.duration_in_seconds,
                  thumbnail_url: video.thumbnail_url,
                }}
                onEdit={() => {
                  setVideoForm(videoToForm(video));
                  setEditingVideo(true);
                }}
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                if (confirm("Delete this video?")) deleteVideo();
              }}
            >
              <Trash2 size={13} />
            </Button>
          </div>
        ) : (
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setVideoForm(emptyVideoForm);
                setEditingVideo(true);
              }}
            >
              <Plus size={13} /> Add video
            </Button>
          </div>
        ))}
    </li>
  );
}
