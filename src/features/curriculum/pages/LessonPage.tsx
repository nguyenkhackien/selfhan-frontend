import { useCallback } from "react";
import { useLocation, useParams } from "react-router";
import {
  BackLink,
  EmptyState,
  ErrorState,
  LoadingState,
  PageFrame,
} from "@/shared/components";
import { useRemoteResource } from "@/shared/hooks/useRemoteResource";
import type { AuthState } from "@/features/auth";
import { LessonQuizPanel } from "@/features/learning/components/LessonQuizPanel";
import { LessonProgressPanel } from "@/features/learning/components/LessonProgressPanel";
import { curriculumApi } from "../api/curriculumApi";
import { AudioControl } from "../components/AudioControl";
import { WritingCanvas } from "../components/WritingCanvas";
import type { LessonDetail } from "../types/curriculum";

export function LessonPage({ auth }: { auth?: AuthState }) {
  const { slug = "" } = useParams();
  const location = useLocation();
  const load = useCallback(() => curriculumApi.getLesson(slug), [slug]);
  const resource = useRemoteResource<LessonDetail>(load, `lesson:${slug}`);
  const navigationState = location.state as { from?: unknown } | null;
  const parentPath =
    typeof navigationState?.from === "string" &&
    navigationState.from.startsWith("/")
      ? navigationState.from
      : "/levels";
  if (resource.loading) {
    return (
      <PageFrame title="Đang mở bài học">
        <LoadingState />
      </PageFrame>
    );
  }
  if (resource.error) {
    return (
      <PageFrame title="Không mở được bài học">
        <ErrorState message={resource.error} onRetry={resource.reload} />
      </PageFrame>
    );
  }
  const lesson = resource.data;
  if (!lesson) return null;
  return (
    <PageFrame title={lesson.title} eyebrow="LESSON">
      <BackLink to={parentPath}>
        {parentPath.startsWith("/units/")
          ? "Quay lại Unit"
          : "Quay lại lộ trình"}
      </BackLink>
      <p className="lead">{lesson.summary}</p>
      <section
        className="vocabulary-section"
        aria-labelledby="vocabulary-heading"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">TỪ VỰNG</p>
            <h2 id="vocabulary-heading">Học từng từ trong ngữ cảnh</h2>
          </div>
          <span className="count-pill">{lesson.vocabulary.length} từ</span>
        </div>
        {lesson.vocabulary.length ? (
          <div className="vocabulary-list">
            {lesson.vocabulary.map((word) => (
              <article className="vocabulary-card" key={word.id}>
                <div className="word-main">
                  <span className="hanzi">{word.hanzi}</span>
                  <div>
                    <h3>{word.meaningVi}</h3>
                    <p className="pinyin">{word.pinyin}</p>
                  </div>
                  {word.audioUrl && (
                    <AudioControl
                      src={word.audioUrl}
                      label={`Nghe cách đọc từ ${word.hanzi}`}
                    />
                  )}
                </div>
                {word.examples.map((example) => (
                  <div
                    className="example"
                    key={`${example.hanzi}-${example.sortOrder}`}
                  >
                    <strong>{example.hanzi}</strong>
                    <span>{example.pinyin}</span>
                    <p>{example.meaningVi}</p>
                    {example.audioUrl && (
                      <AudioControl
                        src={example.audioUrl}
                        label={`Nghe câu ví dụ ${example.hanzi}`}
                      />
                    )}
                  </div>
                ))}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState>Bài học này chưa có từ vựng.</EmptyState>
        )}
      </section>
      {lesson.grammarPoints.length ? (
        <section className="grammar-section" aria-labelledby="grammar-heading">
          <p className="eyebrow">NGỮ PHÁP CƠ BẢN</p>
          <h2 id="grammar-heading">Nhớ mẫu câu, không chỉ nhớ từng từ</h2>
          <div className="grammar-grid">
            {lesson.grammarPoints.map((point) => (
              <article key={point.id}>
                <h3>{point.title}</h3>
                <p>{point.explanationVi}</p>
                {point.examples.length > 0 && (
                  <ul>
                    {point.examples.map((example) => (
                      <li key={example}>{example}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {lesson.writingCharacter && (
        <WritingCanvas character={lesson.writingCharacter} />
      )}
      {auth?.user && <LessonProgressPanel lessonId={lesson.id} />}
      <LessonQuizPanel lessonId={lesson.id} signedIn={Boolean(auth?.user)} />
    </PageFrame>
  );
}
