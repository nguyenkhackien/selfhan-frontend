import { describe, expect, it } from "vitest";
import { flashcards } from "../../data/learning";
import {
  createInitialLearningState,
  learningHubReducer,
} from "./learningHubReducer";

describe("learning hub reducer", () => {
  it("toggles only the selected daily goal without mutating the seed state", () => {
    const initial = createInitialLearningState();
    const next = learningHubReducer(initial, {
      type: "goal/toggled",
      goalId: 3,
    });

    expect(next.goals.find((goal) => goal.id === 3)?.done).toBe(true);
    expect(next.goals.find((goal) => goal.id === 1)?.done).toBe(true);
    expect(initial.goals.find((goal) => goal.id === 3)?.done).toBe(false);
  });

  it("marks the writing goal complete while retaining other goals", () => {
    const initial = createInitialLearningState();
    const next = learningHubReducer(initial, { type: "writing/completed" });

    expect(next.goals.find((goal) => goal.id === 3)?.done).toBe(true);
    expect(next.goals.find((goal) => goal.id === 2)?.done).toBe(true);
  });

  it("flips a flashcard without changing the active card", () => {
    const initial = createInitialLearningState();
    const next = learningHubReducer(initial, { type: "flashcard/flipped" });

    expect(next).toMatchObject({ cardIndex: 0, isFlashcardFlipped: true });
  });

  it("moves, rates, and resets a flashcard session", () => {
    const initial = {
      ...createInitialLearningState(),
      cardIndex: 0,
      isFlashcardFlipped: true,
      knownCardRatings: { 1: "known" as const },
    };
    const moved = learningHubReducer(initial, {
      type: "flashcard/moved",
      offset: -1,
    });
    const rated = learningHubReducer(moved, {
      type: "flashcard/rated",
      cardId: 2,
      rating: "again",
    });
    const reset = learningHubReducer(rated, { type: "flashcard/reset" });

    expect(moved.cardIndex).toBe(flashcards.length - 1);
    expect(moved.isFlashcardFlipped).toBe(false);
    expect(rated.knownCardRatings).toEqual({ 1: "known", 2: "again" });
    expect(reset).toMatchObject({ cardIndex: 0, isFlashcardFlipped: false });
    expect(reset.knownCardRatings).toEqual({ 1: "known", 2: "again" });
  });

  it("normalizes flashcard movement across full cycles", () => {
    const next = learningHubReducer(createInitialLearningState(), {
      type: "flashcard/moved",
      offset: -(flashcards.length + 1),
    });

    expect(next.cardIndex).toBe(flashcards.length - 1);
  });

  it("advances recall and prepends a new note", () => {
    const initial = {
      ...createInitialLearningState(),
      recallIndex: flashcards.length - 1,
    };
    const advanced = learningHubReducer(initial, { type: "recall/advanced" });
    const next = learningHubReducer(advanced, {
      type: "note/added",
      note: {
        id: 99,
        title: "Ôn lại serenity",
        content: "Dùng từ này trong bài viết tối nay.",
        category: "Vocabulary",
      },
    });

    expect(advanced.recallIndex).toBe(0);
    expect(next.notes[0]).toMatchObject({
      title: "Ôn lại serenity",
      date: "Vừa xong",
    });
  });
});
