export type PageId =
  "home" | "writing" | "flashcards" | "recall" | "notes" | "stats";

export type CardRating = "again" | "known";

export interface Goal {
  id: number;
  label: string;
  detail: string;
  done: boolean;
}

export interface Flashcard {
  id: number;
  term: string;
  phonetic: string;
  meaning: string;
  example: string;
  topic: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: NoteCategory;
  date: string;
}

export type NoteCategory = "Vocabulary" | "Writing" | "Grammar";

export interface WritingPrompt {
  id: number;
  tag: string;
  title: string;
  text: string;
}

export interface WeeklyActivity {
  day: string;
  minutes: number;
}

export interface LearningHubState {
  goals: Goal[];
  cardIndex: number;
  isFlashcardFlipped: boolean;
  knownCardRatings: Record<number, CardRating>;
  recallIndex: number;
  notes: Note[];
}

export interface PersistedGoalCompletion {
  id: number;
  done: boolean;
}

export interface PersistedLearningHubState {
  goals: PersistedGoalCompletion[];
  cardIndex: number;
  knownCardRatings: Record<number, CardRating>;
  recallIndex: number;
  notes: Note[];
}

export interface LearningHubStoragePayload {
  version: 1;
  state: PersistedLearningHubState;
}

export type LearningHubAction =
  | { type: "goal/toggled"; goalId: number }
  | { type: "writing/completed" }
  | { type: "flashcard/flipped" }
  | { type: "flashcard/moved"; offset: number }
  | { type: "flashcard/rated"; cardId: number; rating: CardRating }
  | { type: "flashcard/reset" }
  | { type: "recall/advanced" }
  | { type: "note/added"; note: Omit<Note, "date"> };

export interface LearningHubActions {
  toggleGoal(goalId: number): void;
  completeWriting(): void;
  toggleFlashcard(): void;
  moveFlashcard(offset: number): void;
  resetFlashcards(): void;
  rateFlashcard(cardId: number, rating: CardRating): void;
  advanceRecall(): void;
  addNote(note: Omit<Note, "id" | "date">): void;
}

export interface LearningHubController {
  state: LearningHubState;
  actions: LearningHubActions;
}

export interface LearningHubPageProps {
  hub: LearningHubController;
  onNavigate(page: PageId): void;
}
