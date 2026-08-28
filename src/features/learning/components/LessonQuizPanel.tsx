import { useCallback } from "react";
import { Link } from "react-router";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components";
import { useRemoteResource } from "@/shared/hooks/useRemoteResource";
import { learningApi } from "../api/learningApi";

export function LessonQuizPanel({
  lessonId,
  signedIn,
}: {
  lessonId: string;
  signedIn: boolean;
}) {
  const load = useCallback(
    () => learningApi.listLessonQuizzes(lessonId),
    [lessonId],
  );
  const resource = useRemoteResource(load, `lesson-quizzes:${lessonId}`);

  if (!signedIn) {
    return (
      <section
        className="lesson-quiz-panel"
        aria-labelledby="lesson-quiz-heading"
      >
        <p className="eyebrow">KIỂM TRA</p>
        <h2 id="lesson-quiz-heading">Ôn lại bài vừa học</h2>
        <p>Đăng nhập để làm quiz và lưu kết quả vào tiến độ học của bạn.</p>
        <Link className="button button--secondary" to="/login">
          Đăng nhập để làm quiz
        </Link>
      </section>
    );
  }
  if (resource.loading) return <LoadingState />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;
  if (!resource.data?.length)
    return <EmptyState>Bài này chưa có quiz.</EmptyState>;
  return (
    <section
      className="lesson-quiz-panel"
      aria-labelledby="lesson-quiz-heading"
    >
      <p className="eyebrow">KIỂM TRA</p>
      <h2 id="lesson-quiz-heading">Ôn lại bài vừa học</h2>
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
