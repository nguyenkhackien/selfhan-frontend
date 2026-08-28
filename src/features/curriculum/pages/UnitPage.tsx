import { ArrowRight, PenLine } from "lucide-react";
import { useCallback } from "react";
import { Link, useParams } from "react-router";
import {
  BackLink,
  EmptyState,
  ErrorState,
  LoadingState,
  PageFrame,
} from "@/shared/components";
import { useRemoteResource } from "@/shared/hooks/useRemoteResource";
import type { AuthState } from "@/features/auth";
import { UnitQuizPanel } from "@/features/learning/components/UnitQuizPanel";
import { curriculumApi } from "../api/curriculumApi";
import type { UnitDetail } from "../types/curriculum";

export function UnitPage({ auth }: { auth?: AuthState }) {
  const { slug = "" } = useParams();
  const load = useCallback(() => curriculumApi.getUnit(slug), [slug]);
  const resource = useRemoteResource<UnitDetail>(load, `unit:${slug}`);
  if (resource.loading) {
    return (
      <PageFrame title="Đang mở Unit">
        <LoadingState />
      </PageFrame>
    );
  }
  if (resource.error) {
    return (
      <PageFrame title="Không mở được Unit">
        <ErrorState message={resource.error} onRetry={resource.reload} />
      </PageFrame>
    );
  }
  const unit = resource.data;
  if (!unit) return null;
  return (
    <PageFrame title={unit.title} eyebrow="UNIT">
      <BackLink to="/levels">Quay lại Level</BackLink>
      <p className="lead">{unit.description}</p>
      <section className="lesson-list" aria-label="Danh sách Lesson">
        {unit.lessons.length ? (
          unit.lessons.map((lesson, index) => (
            <Link
              className="lesson-card"
              to={`/lessons/${lesson.slug}`}
              key={lesson.id}
            >
              <span className="lesson-number">Bài {index + 1}</span>
              <h2>{lesson.title}</h2>
              <p>{lesson.summary || "Mở bài học để bắt đầu."}</p>
              {lesson.writingCharacter && (
                <span className="writing-chip">
                  <PenLine aria-hidden="true" size={15} /> Viết{" "}
                  {lesson.writingCharacter}
                </span>
              )}
              <span className="card-link">
                Học bài này <ArrowRight aria-hidden="true" size={16} />
              </span>
            </Link>
          ))
        ) : (
          <EmptyState>Unit này chưa có Lesson được xuất bản.</EmptyState>
        )}
      </section>
      <UnitQuizPanel signedIn={Boolean(auth?.user)} unitId={unit.id} />
    </PageFrame>
  );
}
