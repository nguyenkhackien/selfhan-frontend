export const ADMIN_RESOURCES = [
  "levels",
  "units",
  "lessons",
  "vocabulary",
  "grammar-points",
  "quizzes",
  "quiz-questions",
  "quiz-options",
] as const;

export type AdminResource = (typeof ADMIN_RESOURCES)[number];
export type ContentRecord = Record<string, unknown> & { id: string };
