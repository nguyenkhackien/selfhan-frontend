import { useCallback } from "react";
import { ErrorState, LoadingState, PageFrame } from "@/shared/components";
import { useRemoteResource } from "@/shared/hooks/useRemoteResource";
import { curriculumApi } from "../api/curriculumApi";
import { LevelGrid } from "../components/LevelGrid";

export function LevelsPage() {
  const load = useCallback(() => curriculumApi.listLevels(), []);
  const resource = useRemoteResource(load, "levels-page");
  if (resource.loading) {
    return (
      <PageFrame title="Lộ trình học">
        <LoadingState />
      </PageFrame>
    );
  }
  if (resource.error) {
    return (
      <PageFrame title="Lộ trình học">
        <ErrorState message={resource.error} onRetry={resource.reload} />
      </PageFrame>
    );
  }
  return <LevelGrid levels={resource.data?.items ?? []} />;
}
