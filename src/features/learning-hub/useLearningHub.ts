import { useEffect, useMemo, useReducer } from "react";
import type {
  CardRating,
  LearningHubActions,
  LearningHubController,
  Note,
} from "../../types/learning";
import {
  createInitialLearningState,
  learningHubReducer,
} from "./learningHubReducer";
import {
  loadLearningHubState,
  saveLearningHubState,
} from "./learningHubStorage";

export function useLearningHub(): LearningHubController {
  const [state, dispatch] = useReducer(
    learningHubReducer,
    createInitialLearningState,
    (createSeed) => loadLearningHubState(createSeed()),
  );

  useEffect(() => {
    saveLearningHubState(state);
  }, [state]);

  const actions = useMemo<LearningHubActions>(
    () => ({
      toggleGoal: (goalId: number) =>
        dispatch({ type: "goal/toggled", goalId }),
      completeWriting: () => dispatch({ type: "writing/completed" }),
      toggleFlashcard: () => dispatch({ type: "flashcard/flipped" }),
      moveFlashcard: (offset: number) =>
        dispatch({ type: "flashcard/moved", offset }),
      resetFlashcards: () => dispatch({ type: "flashcard/reset" }),
      rateFlashcard: (cardId: number, rating: CardRating) =>
        dispatch({
          type: "flashcard/rated",
          cardId,
          rating,
        }),
      advanceRecall: () => dispatch({ type: "recall/advanced" }),
      addNote: (note: Omit<Note, "id" | "date">) =>
        dispatch({
          type: "note/added",
          note: { ...note, id: Date.now() },
        }),
    }),
    [],
  );

  return { state, actions };
}
