import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { learningApi } from "./api/learningApi";
import { AuthRequired } from "./components/AuthRequired";
import { LessonProgressPanel } from "./components/LessonProgressPanel";
import { LessonQuizPanel } from "./components/LessonQuizPanel";
import { UnitQuizPanel } from "./components/UnitQuizPanel";
import { DashboardPage } from "./pages/DashboardPage";
import { QuizPage } from "./pages/QuizPage";
import { ReviewPage } from "./pages/ReviewPage";

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

function json(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
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

  it("shows a retryable error when saving lesson progress fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: string, init?: RequestInit) => {
        if (input.endsWith("/lessons/lesson-1/progress") && init?.method) {
          return Promise.reject(new Error("offline"));
        }
        return json({ sectionsSeen: [], status: "in_progress" });
      }),
    );

    render(<LessonProgressPanel lessonId="lesson-1" />);
    const vocabulary = await screen.findByRole("button", { name: "Từ vựng" });
    expect(vocabulary.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(vocabulary);

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Không thể kết nối máy chủ",
    );
  });

  it("shows a retryable error when a review rating fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: string, init?: RequestInit) => {
        if (input.endsWith("/reviews/due")) {
          return json({
            items: [
              {
                vocabularyId: "word-1",
                nextReviewAt: "2026-08-30",
                srsStage: 1,
                hanzi: "你好",
                pinyin: "nǐ hǎo",
                meaningVi: "Xin chào",
              },
            ],
            nextCursor: null,
          });
        }
        expect(init?.method).toBe("POST");
        return Promise.reject(new Error("offline"));
      }),
    );

    render(
      <MemoryRouter initialEntries={["/reviews"]}>
        <ReviewPage auth={auth} />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Hiện đáp án" }));
    fireEvent.click(screen.getByRole("button", { name: /^Ổn/ }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Không thể kết nối máy chủ",
    );
  });

  it("renders auth-required guidance and quiz panel states", async () => {
    const guestView = render(
      <MemoryRouter>
        <AuthRequired signedIn={false}>Nội dung riêng tư</AuthRequired>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Đăng nhập để lưu tiến độ" }),
    ).not.toBeNull();
    guestView.unmount();

    render(
      <MemoryRouter>
        <AuthRequired signedIn>Nội dung riêng tư</AuthRequired>
      </MemoryRouter>,
    );
    expect(screen.getByText("Nội dung riêng tư")).not.toBeNull();
    cleanup();

    const fetchMock = vi.fn((input: string) => {
      if (input.endsWith("/lessons/lesson-1/quizzes")) return json([]);
      if (input.endsWith("/units/unit-1/quizzes")) return json([]);
      return json({ error: { message: "Không tìm thấy." } });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter>
        <LessonQuizPanel lessonId="lesson-1" signedIn={false} />
        <UnitQuizPanel unitId="unit-1" signedIn={false} />
      </MemoryRouter>,
    );
    expect(
      screen.getAllByRole("link", { name: "Đăng nhập để làm quiz" }),
    ).toHaveLength(2);
    cleanup();

    render(
      <MemoryRouter>
        <LessonQuizPanel lessonId="lesson-1" signedIn />
        <UnitQuizPanel unitId="unit-1" signedIn />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Bài này chưa có quiz.")).not.toBeNull();
    expect(screen.getByText("Chủ đề này chưa có quiz tổng ôn.")).not.toBeNull();
  });

  it("renders populated and retryable lesson and unit quiz panels", async () => {
    let mode: "data" | "error" = "data";
    const fetchMock = vi.fn((input: string) => {
      if (mode === "error")
        return json({ error: { message: "Không thể tải quiz." } }, 500);
      return input.endsWith("/lessons/lesson-1/quizzes")
        ? json([
            {
              id: "quiz-1",
              title: "Quiz bài 1",
              kind: "lesson",
              passingScore: 70,
            },
          ])
        : json([
            {
              id: "quiz-2",
              title: "Quiz chủ đề",
              kind: "unit",
              passingScore: 80,
            },
          ]);
    });
    vi.stubGlobal("fetch", fetchMock);
    const lessonView = render(
      <MemoryRouter>
        <LessonQuizPanel lessonId="lesson-1" signedIn />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("link", { name: /Quiz bài 1/ }),
    ).not.toBeNull();
    lessonView.unmount();

    const unitView = render(
      <MemoryRouter>
        <UnitQuizPanel unitId="unit-1" signedIn />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("link", { name: /Quiz chủ đề/ }),
    ).not.toBeNull();
    unitView.unmount();

    mode = "error";
    const errorView = render(
      <MemoryRouter>
        <LessonQuizPanel lessonId="lesson-1" signedIn />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Không thể tải quiz.")).not.toBeNull();
    errorView.unmount();
    render(
      <MemoryRouter>
        <UnitQuizPanel unitId="unit-1" signedIn />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Không thể tải quiz.")).not.toBeNull();
  });

  it("updates lesson progress on success and exposes pressed state", async () => {
    let progress = { sectionsSeen: ["vocabulary"], status: "completed" };
    const fetchMock = vi.fn((input: string, init?: RequestInit) => {
      if (input.endsWith("/lessons/lesson-1/progress") && init?.method) {
        progress = {
          sectionsSeen: ["vocabulary", "grammar"],
          status: "in_progress",
        };
        return json({ status: "in_progress" });
      }
      return json(progress);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<LessonProgressPanel lessonId="lesson-1" />);
    const vocabulary = await screen.findByRole("button", { name: "Từ vựng" });
    expect(vocabulary.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Bài học đã hoàn thành.")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Ngữ pháp" }));
    await waitFor(() => {
      expect(
        screen
          .getByRole("button", { name: "Ngữ pháp" })
          .getAttribute("aria-pressed"),
      ).toBe("true");
    });
  });

  it("completes a review, handles tags, and renders an empty queue", async () => {
    const fetchMock = vi.fn((input: string, init?: RequestInit) => {
      if (input.endsWith("/reviews/due")) {
        return json({
          items: [
            {
              vocabularyId: "word-1",
              nextReviewAt: "2026-08-30",
              srsStage: 1,
              hanzi: "你好",
              pinyin: "nǐ hǎo",
              meaningVi: "Xin chào",
            },
          ],
          nextCursor: null,
        });
      }
      if (input.endsWith("/reviews") && init?.method === "POST") {
        return json({
          vocabularyId: "word-1",
          nextReviewAt: "2026-09-01",
          srsStage: 2,
        });
      }
      return json({});
    });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter>
        <ReviewPage auth={auth} />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Hiện đáp án" }));
    fireEvent.click(screen.getByRole("button", { name: "Yêu thích" }));
    expect(await screen.findByText("Đã đánh dấu yêu thích.")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Cần ôn kỹ" }));
    expect(await screen.findByText("Đã đánh dấu cần ôn kỹ.")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^Dễ/ }));
    expect(
      await screen.findByRole("heading", { name: "Đã ôn xong" }),
    ).not.toBeNull();

    cleanup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => json({ items: [], nextCursor: null })),
    );
    render(
      <MemoryRouter>
        <ReviewPage auth={auth} />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: "Đã ôn xong" }),
    ).not.toBeNull();
  });

  it("renders dashboard branches and learning API endpoints", async () => {
    const fetchMock = vi.fn((input: string) => {
      if (input.endsWith("/dashboard")) {
        return json({
          completedLessons: 3,
          learnedWords: 12,
          dueReviewCount: 2,
          accuracy: 88,
          currentStreak: 4,
          continueLesson: {
            id: "lesson-1",
            slug: "hello",
            title: "Nói xin chào",
          },
        });
      }
      if (input.endsWith("/statistics")) {
        return json({ attemptCount: 4, questionCount: 10, accuracy: 88 });
      }
      return json({});
    });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter>
        <DashboardPage auth={auth} />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: "Tiếp tục Nói xin chào" }),
    ).not.toBeNull();
    expect(screen.getByRole("link", { name: "Tiếp tục học" })).not.toBeNull();
    cleanup();

    vi.stubGlobal(
      "fetch",
      vi.fn((input: string) =>
        input.endsWith("/dashboard")
          ? json({
              completedLessons: 0,
              learnedWords: 0,
              dueReviewCount: 0,
              accuracy: 0,
              currentStreak: 0,
              continueLesson: null,
            })
          : json({ attemptCount: 0, questionCount: 0, accuracy: 0 }),
      ),
    );
    render(
      <MemoryRouter>
        <DashboardPage auth={auth} />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: "Bắt đầu một bài học ngắn" }),
    ).not.toBeNull();
    expect(screen.getByRole("link", { name: "Xem lộ trình" })).not.toBeNull();

    cleanup();
    const endpointFetch = vi.fn(() => json({}));
    vi.stubGlobal("fetch", endpointFetch);
    await learningApi.dashboard();
    await learningApi.statistics();
    await learningApi.dueReviews();
    await learningApi.review("word-1", "good");
    await learningApi.listLessonQuizzes("lesson-1");
    await learningApi.listUnitQuizzes("unit-1");
    await learningApi.getQuiz("quiz-1");
    await learningApi.submitAttempt("quiz-1", []);
    await learningApi.updateLessonProgress("lesson-1", []);
    await learningApi.getLessonProgress("lesson-1");
    await learningApi.tag("word-1", "favorite");
    await learningApi.untag("word-1", "favorite");
    expect(endpointFetch).toHaveBeenCalled();
  });

  it("shows retryable dashboard errors", async () => {
    const fetchMock = vi.fn((input: string) =>
      input.endsWith("/dashboard")
        ? json({ error: { message: "Không thể tải dashboard." } }, 500)
        : json({ attemptCount: 0, questionCount: 0, accuracy: 0 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter>
        <DashboardPage auth={auth} />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Không thể tải dashboard.")).not.toBeNull();

    cleanup();
    vi.stubGlobal(
      "fetch",
      vi.fn((input: string) =>
        input.endsWith("/statistics")
          ? json({ error: { message: "Không thể tải thống kê." } }, 500)
          : json({
              completedLessons: 1,
              learnedWords: 2,
              dueReviewCount: 1,
              accuracy: 50,
              currentStreak: 1,
              continueLesson: null,
            }),
      ),
    );
    render(
      <MemoryRouter>
        <DashboardPage auth={auth} />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Không thể tải thống kê.")).not.toBeNull();
  });
});
