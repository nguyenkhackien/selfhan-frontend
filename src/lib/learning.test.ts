import { describe, expect, it } from "vitest";
import {
  getCompletedGoalCount,
  getWordCount,
  isRecallAnswerCorrect,
} from "./learning";

describe("learning helpers", () => {
  it("counts words after discarding extra surrounding whitespace", () => {
    expect(getWordCount("  Calm learning  every day ")).toBe(4);
  });

  it("matches a recall answer regardless of case or surrounding whitespace", () => {
    expect(isRecallAnswerCorrect("  Serenity ", "serenity")).toBe(true);
  });

  it("counts the goals whose done flag is true", () => {
    expect(
      getCompletedGoalCount([
        { id: 1, label: "A", detail: "A", done: true },
        { id: 2, label: "B", detail: "B", done: false },
      ]),
    ).toBe(1);
  });
});
