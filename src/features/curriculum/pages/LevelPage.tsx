import { ArrowRight } from "lucide-react";
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
import { curriculumApi } from "../api/curriculumApi";
import type { LevelDetail } from "../types/curriculum";

export function LevelPage() {
  const { slug = "" } = useParams();
  const load = useCallback(() => curriculumApi.getLevel(slug), [slug]);
  const resource = useRemoteResource<LevelDetail>(load, `level:${slug}`);
  if (resource.loading) {
    return (
      <PageFrame title="Đang mở Level">
        <LoadingState />
      </PageFrame>
    );
  }
  if (resource.error) {
    return (
      <PageFrame title="Không mở được Level">
        <ErrorState message={resource.error} onRetry={resource.reload} />
      </PageFrame>
    );
  }
  const level = resource.data;
  if (!level) return null;
  return (
    <PageFrame title={level.title} eyebrow="LEVEL">
      <BackLink to="/levels">Tất cả Level</BackLink>
      <p className="lead">{level.description}</p>
      <section className="sequence" aria-label="Danh sách Unit">
        {level.units.length ? (
          level.units.map((unit, index) => (
            <Link
              key={unit.id}
              className="sequence-item"
              to={`/units/${unit.slug}`}
            >
              <span>{index + 1}</span>
              <div>
                <h2>{unit.title}</h2>
                <p>{unit.description || "Mở Unit để xem các Lesson."}</p>
              </div>
              <ArrowRight aria-hidden="true" />
            </Link>
          ))
        ) : (
          <EmptyState>Level này chưa có Unit được xuất bản.</EmptyState>
        )}
      </section>
    </PageFrame>
  );
}
