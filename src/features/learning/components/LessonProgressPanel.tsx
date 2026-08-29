import { Check, Circle } from "lucide-react";
import { useCallback, useState } from "react";
import { ErrorState, LoadingState } from "@/shared/components";
import { useRemoteResource } from "@/shared/hooks/useRemoteResource";
import { learningApi } from "../api/learningApi";

const SECTIONS = [
  { id: "vocabulary", label: "Từ vựng" },
  { id: "grammar", label: "Ngữ pháp" },
  { id: "writing", label: "Luyện viết" },
];

export function LessonProgressPanel({ lessonId }: { lessonId: string }) {
  const load = useCallback(
    () => learningApi.getLessonProgress(lessonId),
    [lessonId],
  );
  const resource = useRemoteResource(load, `lesson-progress:${lessonId}`);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  if (resource.loading) return <LoadingState />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;
  const progress = resource.data;
  if (!progress) return null;
  const toggle = async (section: string) => {
    if (saving) return;
    setSaveError(null);
    const next = progress.sectionsSeen.includes(section)
      ? progress.sectionsSeen.filter((item) => item !== section)
      : [...progress.sectionsSeen, section];
    setSaving(true);
    try {
      await learningApi.updateLessonProgress(lessonId, next);
      resource.reload();
    } catch (caught) {
      setSaveError(
        caught instanceof Error
          ? caught.message
          : "Chưa thể lưu tiến độ. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <section
      className="lesson-progress-panel"
      aria-labelledby="lesson-progress-heading"
      aria-busy={saving}
    >
      <div>
        <p className="eyebrow">TIẾN ĐỘ BÀI HỌC</p>
        <h2 id="lesson-progress-heading">Đánh dấu phần bạn đã học</h2>
      </div>
      <div className="lesson-section-toggles">
        {SECTIONS.map((section) => {
          const complete = progress.sectionsSeen.includes(section.id);
          return (
            <button
              className={complete ? "is-complete" : ""}
              aria-pressed={complete}
              disabled={saving}
              key={section.id}
              onClick={() => void toggle(section.id)}
              type="button"
            >
              {complete ? (
                <Check aria-hidden="true" size={17} />
              ) : (
                <Circle aria-hidden="true" size={17} />
              )}{" "}
              {section.label}
            </button>
          );
        })}
      </div>
      <p className="lesson-progress-status" role="status" aria-live="polite">
        {saving
          ? "Đang lưu tiến độ…"
          : progress.status === "completed"
            ? "Bài học đã hoàn thành."
            : "Hoàn tất ba phần và đạt quiz để hoàn thành bài học."}
      </p>
      {saveError && (
        <p className="form-error" role="alert">
          {saveError}
        </p>
      )}
    </section>
  );
}
