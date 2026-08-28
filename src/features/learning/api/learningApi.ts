import { request } from "@/shared/api/httpClient";
import type {
  Dashboard,
  DueReview,
  LearningStatistics,
  Quiz,
  QuizAttemptResult,
  QuizSummary,
  ReviewRating,
} from "../types/learning";

export const learningApi = {
  dashboard: () => request<Dashboard>("/dashboard"),
  statistics: () => request<LearningStatistics>("/statistics"),
  dueReviews: () =>
    request<{ items: DueReview[]; nextCursor: string | null }>("/reviews/due"),
  review: (vocabularyId: string, rating: ReviewRating) =>
    request<{ vocabularyId: string; nextReviewAt: string; srsStage: number }>(
      "/reviews",
      { method: "POST", body: JSON.stringify({ vocabularyId, rating }) },
    ),
  listLessonQuizzes: (lessonId: string) =>
    request<QuizSummary[]>(`/lessons/${lessonId}/quizzes`),
  listUnitQuizzes: (unitId: string) =>
    request<QuizSummary[]>(`/units/${unitId}/quizzes`),
  getQuiz: (quizId: string) => request<Quiz>(`/quizzes/${quizId}`),
  submitAttempt: (
    quizId: string,
    answers: Array<{ questionId: string; selectedOptionId: string }>,
  ) =>
    request<QuizAttemptResult>(`/quizzes/${quizId}/attempts`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  updateLessonProgress: (lessonId: string, sectionsSeen: string[]) =>
    request<{ status: string }>(`/lessons/${lessonId}/progress`, {
      method: "POST",
      body: JSON.stringify({ sectionsSeen }),
    }),
  getLessonProgress: (lessonId: string) =>
    request<{ sectionsSeen: string[]; status: string }>(
      `/lessons/${lessonId}/progress`,
    ),
  tag: (vocabularyId: string, tag: "favorite" | "difficult") =>
    request<void>(`/vocabulary/${vocabularyId}/tags/${tag}`, { method: "PUT" }),
  untag: (vocabularyId: string, tag: "favorite" | "difficult") =>
    request<void>(`/vocabulary/${vocabularyId}/tags/${tag}`, {
      method: "DELETE",
    }),
};
