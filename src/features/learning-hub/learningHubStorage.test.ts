import { afterEach, describe, expect, it, vi } from "vitest";
import type { LearningHubState } from "../../types/learning";
import { createInitialLearningState } from "./learningHubReducer";
import {
  LEARNING_HUB_STORAGE_KEY,
  loadLearningHubState,
  saveLearningHubState,
} from "./learningHubStorage";

function makeStoredState(): LearningHubState {
  const state = createInitialLearningState();

  return {
    ...state,
    goals: state.goals.map((goal) =>
      goal.id === 3 ? { ...goal, done: true } : goal,
    ),
    cardIndex: 2,
    isFlashcardFlipped: true,
    knownCardRatings: { 1: "known", 2: "again" },
    recallIndex: 1,
    notes: [
      {
        id: 99,
        title: "Từ mới",
        content: "Ôn lại serenity",
        category: "Vocabulary",
        date: "Vừa xong",
      },
      ...state.notes,
    ],
  };
}

function makeStoredProgress() {
  const storedState = makeStoredState();

  return {
    goals: storedState.goals.map(({ id, done }) => ({ id, done })),
    cardIndex: storedState.cardIndex,
    knownCardRatings: storedState.knownCardRatings,
    recallIndex: storedState.recallIndex,
    notes: storedState.notes,
  };
}

describe("learning hub storage", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("loads a valid versioned learning state", () => {
    const storedState = makeStoredState();
    window.localStorage.setItem(
      LEARNING_HUB_STORAGE_KEY,
      JSON.stringify({ version: 1, state: makeStoredProgress() }),
    );

    expect(loadLearningHubState(createInitialLearningState())).toEqual({
      ...storedState,
      isFlashcardFlipped: false,
    });
  });

  it("hydrates goal completion onto fresh canonical goal display data", () => {
    const seed = createInitialLearningState();
    const progress = makeStoredProgress();
    window.localStorage.setItem(
      LEARNING_HUB_STORAGE_KEY,
      JSON.stringify({ version: 1, state: progress }),
    );

    const loaded = loadLearningHubState(seed);

    expect(loaded.goals).toEqual(
      seed.goals.map((goal) => ({
        ...goal,
        done: progress.goals.find(({ id }) => id === goal.id)!.done,
      })),
    );
  });

  it("returns a deep-safe fresh seed when storage contains malformed JSON", () => {
    const seed = createInitialLearningState();
    window.localStorage.setItem(LEARNING_HUB_STORAGE_KEY, "not json");

    const loaded = loadLearningHubState(seed);

    expect(loaded).toEqual(seed);
    expect(loaded).not.toBe(seed);
    expect(loaded.goals).not.toBe(seed.goals);
    expect(loaded.notes).not.toBe(seed.notes);
  });

  it("returns a fresh seed for an out-of-range card index", () => {
    const seed = createInitialLearningState();
    const invalidState = {
      ...makeStoredProgress(),
      cardIndex: 9,
    };
    window.localStorage.setItem(
      LEARNING_HUB_STORAGE_KEY,
      JSON.stringify({ version: 1, state: invalidState }),
    );

    expect(loadLearningHubState(seed)).toEqual(seed);
  });

  it("returns a fresh seed for an unknown note category", () => {
    const seed = createInitialLearningState();
    const storedState = makeStoredProgress();
    const invalidState = {
      ...storedState,
      notes: [
        { ...storedState.notes[0], category: "Speaking" },
        ...storedState.notes.slice(1),
      ],
    };
    window.localStorage.setItem(
      LEARNING_HUB_STORAGE_KEY,
      JSON.stringify({ version: 1, state: invalidState }),
    );

    expect(loadLearningHubState(seed)).toEqual(seed);
  });

  it.each([
    ["empty goal progress", []],
    ["missing canonical goal", makeStoredProgress().goals.slice(0, 2)],
    [
      "duplicate goal id",
      [
        ...makeStoredProgress().goals.slice(0, 2),
        makeStoredProgress().goals[1],
      ],
    ],
    [
      "noncanonical goal id",
      makeStoredProgress().goals.map((goal, index) =>
        index === 2 ? { ...goal, id: 999 } : goal,
      ),
    ],
    [
      "goal display fields",
      makeStoredProgress().goals.map((goal) => ({
        ...goal,
        label: "Untrusted display copy",
      })),
    ],
  ])("returns a fresh seed for %s", (_caseName, goals) => {
    const seed = createInitialLearningState();
    window.localStorage.setItem(
      LEARNING_HUB_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: { ...makeStoredProgress(), goals },
      }),
    );

    expect(loadLearningHubState(seed)).toEqual(seed);
  });

  it.each([
    ["zero note id", 0],
    ["negative note id", -1],
    ["unsafe note id", Number.MAX_SAFE_INTEGER + 1],
  ])("returns a fresh seed for a %s", (_caseName, id) => {
    const seed = createInitialLearningState();
    const progress = makeStoredProgress();
    const notes = [{ ...progress.notes[0], id }, ...progress.notes.slice(1)];
    window.localStorage.setItem(
      LEARNING_HUB_STORAGE_KEY,
      JSON.stringify({ version: 1, state: { ...progress, notes } }),
    );

    expect(loadLearningHubState(seed)).toEqual(seed);
  });

  it("returns a fresh seed for duplicate note ids", () => {
    const seed = createInitialLearningState();
    const progress = makeStoredProgress();
    const notes = [
      progress.notes[0],
      { ...progress.notes[1], id: progress.notes[0].id },
      ...progress.notes.slice(2),
    ];
    window.localStorage.setItem(
      LEARNING_HUB_STORAGE_KEY,
      JSON.stringify({ version: 1, state: { ...progress, notes } }),
    );

    expect(loadLearningHubState(seed)).toEqual(seed);
  });

  it.each([
    ["unknown payload key", { payloadExtra: true }, {}],
    ["unknown state key", {}, { stateExtra: true }],
    ["transient flashcard field", {}, { isFlashcardFlipped: false }],
  ])(
    "returns a fresh seed for an %s",
    (_caseName, payloadExtra, stateExtra) => {
      const seed = createInitialLearningState();
      window.localStorage.setItem(
        LEARNING_HUB_STORAGE_KEY,
        JSON.stringify({
          version: 1,
          state: { ...makeStoredProgress(), ...stateExtra },
          ...payloadExtra,
        }),
      );

      expect(loadLearningHubState(seed)).toEqual(seed);
    },
  );

  it("returns a fresh seed for a rating with an unknown flashcard id", () => {
    const seed = createInitialLearningState();
    window.localStorage.setItem(
      LEARNING_HUB_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: {
          ...makeStoredProgress(),
          knownCardRatings: { 999: "known" },
        },
      }),
    );

    expect(loadLearningHubState(seed)).toEqual(seed);
  });

  it("returns a fresh seed for a stale storage version", () => {
    const seed = createInitialLearningState();
    window.localStorage.setItem(
      LEARNING_HUB_STORAGE_KEY,
      JSON.stringify({ version: 0, state: makeStoredState() }),
    );

    const loaded = loadLearningHubState(seed);

    expect(loaded).toEqual(seed);
    expect(loaded).not.toBe(seed);
  });

  it("writes a versioned payload", () => {
    const state = makeStoredState();

    saveLearningHubState(state);

    expect(
      JSON.parse(window.localStorage.getItem(LEARNING_HUB_STORAGE_KEY)!),
    ).toEqual({
      version: 1,
      state: {
        goals: state.goals.map(({ id, done }) => ({ id, done })),
        cardIndex: 2,
        knownCardRatings: { 1: "known", 2: "again" },
        recallIndex: 1,
        notes: state.notes,
      },
    });
  });

  it("absorbs browser storage read and write failures", () => {
    const seed = createInitialLearningState();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    expect(loadLearningHubState(seed)).toEqual(seed);
    expect(() => saveLearningHubState(seed)).not.toThrow();
  });

  it("absorbs a throwing browser storage accessor", () => {
    const seed = createInitialLearningState();
    const localStorageDescriptor = Object.getOwnPropertyDescriptor(
      window,
      "localStorage",
    );
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("storage unavailable");
      },
    });

    try {
      expect(loadLearningHubState(seed)).toEqual(seed);
      expect(() => saveLearningHubState(seed)).not.toThrow();
    } finally {
      Object.defineProperty(window, "localStorage", localStorageDescriptor!);
    }
  });
});
