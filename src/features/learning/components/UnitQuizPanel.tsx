import { useCallback } from "react";
import { Link } from "react-router";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components";
import { useRemoteResource } from "@/shared/hooks/useRemoteResource";
import { learningApi } from "../api/learningApi";

export function UnitQuizPanel({
  signedIn,
  unitId,
}: {
  signedIn: boolean;
  unitId: string;
}) {
  const load = useCallback(() => learningApi.listUnitQuizzes(unitId), [unitId]);
  const resource = useRemoteResource(load, `unit-quizzes:${unitId}`);
  if (!signedIn)
    return (
      <section
        className="lesson-quiz-panel"
        aria-labelledby="unit-quiz-heading"
      >
        <p className="eyebrow">QUIZ CẤP CHỦ ĐỀ</p>
        <h2 id="unit-quiz-heading">Tổng ôn sau các bài học</h2>
        <p>Đăng nhập để làm quiz cấp chủ đề và lưu kết quả của bạn.</p>
        <Link className="button button--secondary" to="/login">
          Đăng nhập để làm quiz
        </Link>
      </section>
    );
  if (resource.loading) return <LoadingState />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;
  if (!resource.data?.length)
    return <EmptyState>Chủ đề này chưa có quiz tổng ôn.</EmptyState>;
  return (
    <section className="lesson-quiz-panel" aria-labelledby="unit-quiz-heading">
      <p className="eyebrow">QUIZ CẤP CHỦ ĐỀ</p>
      <h2 id="unit-quiz-heading">Tổng ôn sau các bài học</h2>
      <div className="quiz-link-list">
        {resource.data.map((quiz) => (
          <Link
            className="quiz-link-card"
            key={quiz.id}
            to={`/quizzes/${quiz.id}`}
          >
            <span>{quiz.title}</span>
            <small>Cần đạt {quiz.passingScore}%</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
