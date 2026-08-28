import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { QuizPage } from "./pages/QuizPage";

const auth = {
  user: {
    id: "user-1",
    email: "learner@example.com",
    role: "learner" as const,
    createdAt: "2026-08-28",
  },
  restoring: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

function json(body: unknown) {
  return Promise.resolve(new Response(JSON.stringify(body)));
}

describe("learner quiz", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps answer choices in the browser but submits ids for server scoring", async () => {
    const fetchMock = vi.fn((input: string, init?: RequestInit) => {
      if (input.endsWith("/quizzes/quiz-1")) {
        return json({
          id: "quiz-1",
          lessonId: "lesson-1",
          unitId: null,
          passingScore: 70,
          questions: [
            {
              id: "question-1",
              prompt: "你好 nghĩa là gì?",
              type: "hanzi_to_meaning",
              audioUrl: null,
              sortOrder: 1,
              options: [
                {
                  id: "option-1",
                  questionId: "question-1",
                  label: "xin chào",
                  sortOrder: 1,
                },
                {
                  id: "option-2",
                  questionId: "question-1",
                  label: "cảm ơn",
                  sortOrder: 2,
                },
              ],
            },
          ],
        });
      }
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(
        JSON.stringify({
          answers: [{ questionId: "question-1", selectedOptionId: "option-1" }],
        }),
      );
      return json({
        id: "attempt-1",
        score: 100,
        questionCount: 1,
        submittedAt: "2026-08-28",
        answers: [
          {
            questionId: "question-1",
            selectedOptionId: "option-1",
            isCorrect: true,
          },
        ],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter initialEntries={["/quizzes/quiz-1"]}>
        <Routes>
          <Route path="/quizzes/:id" element={<QuizPage auth={auth} />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByLabelText("xin chào"));
    fireEvent.click(screen.getByRole("button", { name: "Nộp bài" }));

    expect(await screen.findByText("Bạn đã qua quiz!")).not.toBeNull();
    expect(screen.getByText("100%")).not.toBeNull();
  });
});
