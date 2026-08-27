import { request } from "@/shared/api/httpClient";
import type {
  LessonDetail,
  LevelDetail,
  LevelSummary,
  UnitDetail,
} from "../types/curriculum";

export const curriculumApi = {
  listLevels: () => request<{ items: LevelSummary[] }>("/levels"),
  getLevel: (slug: string) => request<LevelDetail>(`/levels/${slug}`),
  getUnit: (slug: string) => request<UnitDetail>(`/units/${slug}`),
  getLesson: (slug: string) => request<LessonDetail>(`/lessons/${slug}`),
};
