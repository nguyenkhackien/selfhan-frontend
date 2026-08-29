import { ArrowLeft, BrainCircuit } from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router";
import type { AuthState } from "@/features/auth";
import { ErrorState, LoadingState, PageFrame } from "@/shared/components";
import { useRemoteResource } from "@/shared/hooks/useRemoteResource";
import { learningApi } from "../api/learningApi";
import { AuthRequired } from "../components/AuthRequired";
import type { ReviewRating } from "../types/learning";

const RATING_LABELS: Array<{
  rating: ReviewRating;
  label: string;
  note: string;
}> = [
  { rating: "again", label: "Chưa nhớ", note: "1 ngày" },
  { rating: "hard", label: "Khó", note: "3 ngày" },
  { rating: "good", label: "Ổn", note: "7 ngày" },
  { rating: "easy", label: "Dễ", note: "14+ ngày" },
];

export function ReviewPage({ auth }: { auth: AuthState }) {
  return (
    <PageFrame title="Ôn tập hôm nay" eyebrow="SRS — NHẮC LẠI ĐÚNG LÚC">
      <AuthRequired signedIn={Boolean(auth.user)}>
        <ReviewContent />
      </AuthRequired>
    </PageFrame>
  );
}

function ReviewContent() {
  const load = useCallback(() => learningApi.dueReviews(), []);
  const resource = useRemoteResource(load, "due-reviews");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [tagMessage, setTagMessage] = useState<string | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);
  if (resource.loading) return <LoadingState />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;
  const cards = resource.data?.items ?? [];
  const word = cards[index];
  if (!word) {
    return (
      <section className="review-finished">
        <BrainCircuit aria-hidden="true" size={42} />
        <h2>Đã ôn xong</h2>
        <p>
          Hiện không còn từ nào cần ôn. Hãy học thêm một bài mới hoặc quay lại
          vào lần sau.
        </p>
        <Link className="button button--primary" to="/dashboard">
          Về không gian học
        </Link>
      </section>
    );
  }
  const rate = async (rating: ReviewRating) => {
    if (saving) return;
    setReviewError(null);
    setSaving(true);
    try {
      await learningApi.review(word.vocabularyId, rating);
      setIndex((current) => current + 1);
      setRevealed(false);
      setTagMessage(null);
    } catch (caught) {
      setReviewError(
        caught instanceof Error
          ? caught.message
          : "Chưa thể lưu đánh giá. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };
  const markTag = async (tag: "favorite" | "difficult") => {
    setTagError(null);
    setTagMessage(null);
    try {
      await learningApi.tag(word.vocabularyId, tag);
      setTagMessage(
        tag === "favorite"
          ? "Đã đánh dấu yêu thích."
          : "Đã đánh dấu cần ôn kỹ.",
      );
    } catch (error) {
      setTagError(
        error instanceof Error ? error.message : "Chưa thể lưu nhãn này.",
      );
    }
  };
  return (
    <section
      className="review-shell"
      aria-labelledby="review-card-heading"
      aria-busy={saving}
    >
      <Link className="back-link" to="/dashboard">
        <ArrowLeft aria-hidden="true" size={17} />
        Về không gian học
      </Link>
      <p className="review-counter">
        Từ {index + 1} / {cards.length}
      </p>
      <article className={revealed ? "review-card is-revealed" : "review-card"}>
        <p className="eyebrow">HÃY NHỚ LẠI NGHĨA</p>
        <h2 id="review-card-heading">{word.hanzi}</h2>
        {revealed ? (
          <div className="review-answer">
            <p className="pinyin">{word.pinyin}</p>
            <strong>{word.meaningVi}</strong>
          </div>
        ) : (
          <button
            className="button button--secondary"
            onClick={() => setRevealed(true)}
            type="button"
          >
            Hiện đáp án
          </button>
        )}
      </article>
      {revealed && (
        <>
          <div className="review-tag-row" aria-label="Nhãn từ vựng">
            <button onClick={() => void markTag("favorite")} type="button">
              Yêu thích
            </button>
            <button onClick={() => void markTag("difficult")} type="button">
              Cần ôn kỹ
            </button>
          </div>
          {tagMessage && (
            <p className="review-tag-message" role="status" aria-live="polite">
              {tagMessage}
            </p>
          )}
          {tagError && (
            <p className="form-error" role="alert">
              {tagError}
            </p>
          )}
          {reviewError && (
            <p className="form-error" role="alert">
              {reviewError}
            </p>
          )}
          {saving && (
            <p role="status" aria-live="polite">
              Đang lưu đánh giá…
            </p>
          )}
          <div className="review-rating-row" aria-label="Mức độ ghi nhớ">
            {RATING_LABELS.map((item) => (
              <button
                className="review-rating"
                disabled={saving}
                key={item.rating}
                onClick={() => void rate(item.rating)}
                type="button"
              >
                <strong>{item.label}</strong>
                <span>{item.note}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
