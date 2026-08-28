import {
  CheckCircle2,
  ChevronLeft,
  CircleAlert,
  RotateCcw,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import type { AuthState } from "@/features/auth";
import { ErrorState, LoadingState, PageFrame } from "@/shared/components";
import { useRemoteResource } from "@/shared/hooks/useRemoteResource";
import { learningApi } from "../api/learningApi";
import { AuthRequired } from "../components/AuthRequired";
import type { QuizAttemptResult } from "../types/learning";

export function QuizPage({ auth }: { auth: AuthState }) {
  const { id = "" } = useParams();
  return (
    <PageFrame title="Quiz ôn tập" eyebrow="KIỂM TRA KIẾN THỨC">
      <AuthRequired signedIn={Boolean(auth.user)}>
        <QuizContent quizId={id} />
      </AuthRequired>
    </PageFrame>
  );
}

function QuizContent({ quizId }: { quizId: string }) {
  const load = useCallback(() => learningApi.getQuiz(quizId), [quizId]);
  const resource = useRemoteResource(load, `quiz:${quizId}`);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const answeredCount = useMemo(() => Object.keys(selected).length, [selected]);
  if (resource.loading) return <LoadingState />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;
  const quiz = resource.data;
  if (!quiz) return null;

  const submit = async () => {
    if (answeredCount !== quiz.questions.length || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      setResult(
        await learningApi.submitAttempt(
          quiz.id,
          quiz.questions.map((question) => ({
            questionId: question.id,
            selectedOptionId: selected[question.id]!,
          })),
        ),
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Chưa thể nộp quiz. Hãy thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const passed = result.score >= quiz.passingScore;
    return (
      <section className="quiz-result" aria-live="polite">
        {passed ? (
          <CheckCircle2 aria-hidden="true" size={40} />
        ) : (
          <CircleAlert aria-hidden="true" size={40} />
        )}
        <p className="eyebrow">KẾT QUẢ</p>
        <h2>
          {passed ? "Bạn đã qua quiz!" : "Bạn có thể ôn lại thêm một lượt"}
        </h2>
        <strong>{result.score}%</strong>
        <p>
          {result.answers.filter((answer) => answer.isCorrect).length}/
          {result.questionCount} câu đúng. Mức cần đạt là {quiz.passingScore}%.
        </p>
        <div className="quiz-result-actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={() => {
              setSelected({});
              setResult(null);
            }}
          >
            <RotateCcw aria-hidden="true" size={17} />
            Làm lại
          </button>
          <Link className="button button--primary" to="/dashboard">
            Về không gian học
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="quiz-shell" aria-labelledby="quiz-heading">
      <Link className="back-link" to="/dashboard">
        <ChevronLeft aria-hidden="true" size={17} />
        Về không gian học
      </Link>
      <div className="quiz-heading-row">
        <div>
          <h2 id="quiz-heading">Hoàn thành {quiz.questions.length} câu hỏi</h2>
          <p>Chọn một đáp án cho mỗi câu rồi nộp khi bạn sẵn sàng.</p>
        </div>
        <span className="count-pill">
          {answeredCount}/{quiz.questions.length} câu
        </span>
      </div>
      <div className="quiz-question-list">
        {quiz.questions.map((question, index) => (
          <fieldset className="quiz-question-card" key={question.id}>
            <legend>
              <span>Câu {index + 1}</span>
              {question.prompt}
            </legend>
            <div className="quiz-options">
              {question.options.map((option) => (
                <label
                  className={
                    selected[question.id] === option.id
                      ? "quiz-option is-selected"
                      : "quiz-option"
                  }
                  key={option.id}
                >
                  <input
                    checked={selected[question.id] === option.id}
                    name={question.id}
                    onChange={() =>
                      setSelected((current) => ({
                        ...current,
                        [question.id]: option.id,
                      }))
                    }
                    type="radio"
                    value={option.id}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      {submitError && (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      )}
      <button
        className="button button--primary"
        disabled={answeredCount !== quiz.questions.length || submitting}
        onClick={() => void submit()}
        type="button"
      >
        {submitting ? "Đang chấm điểm…" : "Nộp bài"}
      </button>
    </section>
  );
}
