import { flashcards, initialGoals, initialNotes } from "../../data/learning";
import type { LearningHubAction, LearningHubState } from "../../types/learning";

export function createInitialLearningState(): LearningHubState {
  return {
    goals: initialGoals.map((goal) => ({ ...goal })),
    cardIndex: 0,
    isFlashcardFlipped: false,
    knownCardRatings: {},
    recallIndex: 0,
    notes: initialNotes.map((note) => ({ ...note })),
  };
}

export function learningHubReducer(
  state: LearningHubState,
  action: LearningHubAction,
): LearningHubState {
  switch (action.type) {
    case "goal/toggled":
      return {
        ...state,
        goals: state.goals.map((goal) =>
          goal.id === action.goalId ? { ...goal, done: !goal.done } : goal,
        ),
      };
    case "writing/completed":
      return {
        ...state,
        goals: state.goals.map((goal) =>
          goal.id === 3 ? { ...goal, done: true } : goal,
        ),
      };
    case "flashcard/flipped":
      return { ...state, isFlashcardFlipped: !state.isFlashcardFlipped };
    case "flashcard/moved":
      return {
        ...state,
        cardIndex:
          (((state.cardIndex + action.offset) % flashcards.length) +
            flashcards.length) %
          flashcards.length,
        isFlashcardFlipped: false,
      };
    case "flashcard/rated":
      return {
        ...state,
        knownCardRatings: {
          ...state.knownCardRatings,
          [action.cardId]: action.rating,
        },
      };
    case "flashcard/reset":
      return { ...state, cardIndex: 0, isFlashcardFlipped: false };
    case "recall/advanced":
      return {
        ...state,
        recallIndex: (state.recallIndex + 1) % flashcards.length,
      };
    case "note/added":
      return {
        ...state,
        notes: [{ ...action.note, date: "Vừa xong" }, ...state.notes],
      };
  }
}
