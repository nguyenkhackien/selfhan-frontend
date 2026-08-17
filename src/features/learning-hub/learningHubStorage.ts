import { flashcards, initialGoals } from "../../data/learning";
import type {
  CardRating,
  Goal,
  LearningHubState,
  LearningHubStoragePayload,
  Note,
  NoteCategory,
  PersistedGoalCompletion,
  PersistedLearningHubState,
} from "../../types/learning";

export const LEARNING_HUB_STORAGE_KEY = "zenlingo.learning-hub.v1";

const STORAGE_VERSION = 1;
const noteCategories: readonly NoteCategory[] = [
  "Vocabulary",
  "Writing",
  "Grammar",
];
const cardRatings: readonly CardRating[] = ["again", "known"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const valueKeys = Object.keys(value);
  return (
    valueKeys.length === keys.length &&
    valueKeys.every((key) => keys.includes(key))
  );
}

function hasCanonicalGoalIds(goals: Array<{ id: number }>): boolean {
  const canonicalIds = new Set(initialGoals.map((goal) => goal.id));
  const storedIds = new Set(goals.map((goal) => goal.id));

  return (
    goals.length === initialGoals.length &&
    storedIds.size === goals.length &&
    storedIds.size === canonicalIds.size &&
    [...storedIds].every((id) => canonicalIds.has(id))
  );
}

function isGoal(value: unknown): value is Goal {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["id", "label", "detail", "done"]) &&
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.label === "string" &&
    typeof value.detail === "string" &&
    typeof value.done === "boolean"
  );
}

function isGoals(value: unknown): value is Goal[] {
  return (
    Array.isArray(value) && value.every(isGoal) && hasCanonicalGoalIds(value)
  );
}

function isPersistedGoalCompletion(
  value: unknown,
): value is PersistedGoalCompletion {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["id", "done"]) &&
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.done === "boolean"
  );
}

function isPersistedGoalCompletions(
  value: unknown,
): value is PersistedGoalCompletion[] {
  return (
    Array.isArray(value) &&
    value.every(isPersistedGoalCompletion) &&
    hasCanonicalGoalIds(value)
  );
}

function isNoteCategory(value: unknown): value is NoteCategory {
  return (
    typeof value === "string" && noteCategories.includes(value as NoteCategory)
  );
}

function isNote(value: unknown): value is Note {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["id", "title", "content", "category", "date"]) &&
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.title === "string" &&
    typeof value.content === "string" &&
    isNoteCategory(value.category) &&
    typeof value.date === "string"
  );
}

function isNotes(value: unknown): value is Note[] {
  if (!Array.isArray(value) || !value.every(isNote)) return false;

  return new Set(value.map((note) => note.id)).size === value.length;
}

function isCardRatings(value: unknown): value is Record<number, CardRating> {
  return (
    isRecord(value) &&
    Object.entries(value).every(
      ([cardId, rating]) =>
        /^\d+$/.test(cardId) &&
        flashcards.some((card) => card.id === Number(cardId)) &&
        typeof rating === "string" &&
        cardRatings.includes(rating as CardRating),
    )
  );
}

function hasValidPersistedLearningHubFields(
  value: unknown,
): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "goals",
      "cardIndex",
      "knownCardRatings",
      "recallIndex",
      "notes",
    ]) &&
    isPersistedGoalCompletions(value.goals) &&
    typeof value.cardIndex === "number" &&
    Number.isInteger(value.cardIndex) &&
    value.cardIndex >= 0 &&
    value.cardIndex < flashcards.length &&
    isCardRatings(value.knownCardRatings) &&
    typeof value.recallIndex === "number" &&
    Number.isInteger(value.recallIndex) &&
    value.recallIndex >= 0 &&
    value.recallIndex < flashcards.length &&
    isNotes(value.notes)
  );
}

function isPersistedLearningHubState(
  value: unknown,
): value is PersistedLearningHubState {
  return hasValidPersistedLearningHubFields(value);
}

function isLearningHubState(value: unknown): value is LearningHubState {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "goals",
      "cardIndex",
      "isFlashcardFlipped",
      "knownCardRatings",
      "recallIndex",
      "notes",
    ]) &&
    isGoals(value.goals) &&
    typeof value.cardIndex === "number" &&
    Number.isInteger(value.cardIndex) &&
    value.cardIndex >= 0 &&
    value.cardIndex < flashcards.length &&
    isCardRatings(value.knownCardRatings) &&
    typeof value.recallIndex === "number" &&
    Number.isInteger(value.recallIndex) &&
    value.recallIndex >= 0 &&
    value.recallIndex < flashcards.length &&
    isNotes(value.notes) &&
    typeof value.isFlashcardFlipped === "boolean"
  );
}

function isStoragePayload(value: unknown): value is LearningHubStoragePayload {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["version", "state"]) &&
    value.version === STORAGE_VERSION &&
    isPersistedLearningHubState(value.state)
  );
}

function cloneLearningHubState(state: LearningHubState): LearningHubState {
  return {
    ...state,
    goals: state.goals.map((goal) => ({ ...goal })),
    knownCardRatings: { ...state.knownCardRatings },
    notes: state.notes.map((note) => ({ ...note })),
  };
}

function mergePersistedLearningHubState(
  seed: LearningHubState,
  persistedState: PersistedLearningHubState,
): LearningHubState {
  return {
    ...cloneLearningHubState(seed),
    cardIndex: persistedState.cardIndex,
    isFlashcardFlipped: false,
    goals: seed.goals.map((goal) => ({
      ...goal,
      done: persistedState.goals.find(
        (completion) => completion.id === goal.id,
      )!.done,
    })),
    knownCardRatings: { ...persistedState.knownCardRatings },
    recallIndex: persistedState.recallIndex,
    notes: persistedState.notes.map((note) => ({ ...note })),
  };
}

function toPersistedLearningHubState(
  state: LearningHubState,
): PersistedLearningHubState {
  return {
    goals: state.goals.map(({ id, done }) => ({ id, done })),
    cardIndex: state.cardIndex,
    knownCardRatings: state.knownCardRatings,
    recallIndex: state.recallIndex,
    notes: state.notes,
  };
}

function getBrowserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function loadLearningHubState(seed: LearningHubState): LearningHubState {
  const fallback = cloneLearningHubState(seed);
  const storage = getBrowserStorage();

  if (storage === null) {
    return fallback;
  }

  try {
    const serializedPayload = storage.getItem(LEARNING_HUB_STORAGE_KEY);

    if (serializedPayload === null) {
      return fallback;
    }

    const payload: unknown = JSON.parse(serializedPayload);
    return isStoragePayload(payload)
      ? mergePersistedLearningHubState(seed, payload.state)
      : fallback;
  } catch {
    return fallback;
  }
}

export function saveLearningHubState(state: LearningHubState): void {
  const storage = getBrowserStorage();

  if (storage === null || !isLearningHubState(state)) {
    return;
  }

  try {
    const payload: LearningHubStoragePayload = {
      version: STORAGE_VERSION,
      state: toPersistedLearningHubState(state),
    };
    storage.setItem(LEARNING_HUB_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Browser storage is optional; failures must not interrupt the learning hub.
  }
}
