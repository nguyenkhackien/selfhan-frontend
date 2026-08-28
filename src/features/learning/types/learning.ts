export interface QuizOption {
  id: string;
  questionId: string;
  label: string;
  sortOrder: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  type: "hanzi_to_meaning" | "meaning_to_hanzi" | "pinyin" | "listening";
  audioUrl: string | null;
  sortOrder: number;
  options: QuizOption[];
}

export interface QuizSummary {
  id: string;
  title: string;
  kind: "lesson" | "unit";
  passingScore: number;
}

export interface Quiz extends Omit<QuizSummary, "title" | "kind"> {
  lessonId: string | null;
  unitId: string | null;
  questions: QuizQuestion[];
}

export interface QuizAttemptResult {
  id: string;
  score: number;
  questionCount: number;
  submittedAt: string;
  answers: Array<{
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }>;
}

export interface Dashboard {
  completedLessons: number;
  learnedWords: number;
  dueReviewCount: number;
  accuracy: number;
  currentStreak: number;
  continueLesson: { id: string; slug: string; title: string } | null;
}

export interface DueReview {
  vocabularyId: string;
  nextReviewAt: string;
  srsStage: number;
  hanzi: string;
  pinyin: string;
  meaningVi: string;
}

export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface LearningStatistics {
  attemptCount: number;
  questionCount: number;
  accuracy: number;
}
