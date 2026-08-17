import type { Goal } from "../types/learning";

export const getWordCount = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

export const isRecallAnswerCorrect = (input: string, answer: string): boolean =>
  input.trim().toLowerCase() === answer.trim().toLowerCase();

export const getCompletedGoalCount = (goals: Goal[]): number =>
  goals.filter((goal) => goal.done).length;
