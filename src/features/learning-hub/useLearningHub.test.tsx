import { StrictMode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LEARNING_HUB_STORAGE_KEY } from "./learningHubStorage";
import { useLearningHub } from "./useLearningHub";

function LearningHubProbe() {
  const { state } = useLearningHub();

  return (
    <output data-testid="learning-progress">
      {`${state.cardIndex}:${state.recallIndex}:${state.goals[2].done}:${state.knownCardRatings[1]}`}
    </output>
  );
}

describe("useLearningHub persistence", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("retains hydrated progress after StrictMode persistence effects", () => {
    window.localStorage.setItem(
      LEARNING_HUB_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: {
          goals: [
            {
              id: 1,
              done: true,
            },
            {
              id: 2,
              done: true,
            },
            {
              id: 3,
              done: true,
            },
          ],
          cardIndex: 2,
          knownCardRatings: { 1: "known" },
          recallIndex: 1,
          notes: [],
        },
      }),
    );

    render(
      <StrictMode>
        <LearningHubProbe />
      </StrictMode>,
    );

    expect(screen.getByTestId("learning-progress").textContent).toBe(
      "2:1:true:known",
    );
    expect(
      JSON.parse(window.localStorage.getItem(LEARNING_HUB_STORAGE_KEY)!),
    ).toMatchObject({
      version: 1,
      state: {
        cardIndex: 2,
        knownCardRatings: { 1: "known" },
        recallIndex: 1,
      },
    });
    expect(
      JSON.parse(window.localStorage.getItem(LEARNING_HUB_STORAGE_KEY)!).state,
    ).not.toHaveProperty("isFlashcardFlipped");
  });
});
