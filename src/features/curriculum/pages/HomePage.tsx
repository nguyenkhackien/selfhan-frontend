import { useCallback } from "react";
import { ErrorState, LoadingState } from "@/shared/components";
import { useRemoteResource } from "@/shared/hooks/useRemoteResource";
import { curriculumApi } from "../api/curriculumApi";
import { Hero } from "../components/Hero";
import { LevelGrid } from "../components/LevelGrid";

export function HomePage() {
  const load = useCallback(() => curriculumApi.listLevels(), []);
  const resource = useRemoteResource(load, "levels");
  return (
    <div className="page page--home">
      {resource.loading && <LoadingState label="Đang chuẩn bị lộ trình" />}
      {resource.error && (
        <ErrorState message={resource.error} onRetry={resource.reload} />
      )}
      {resource.data && <Hero levels={resource.data.items} />}
      {resource.data && <LevelGrid levels={resource.data.items} compact />}
    </div>
  );
}
