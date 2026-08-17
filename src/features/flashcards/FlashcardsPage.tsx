import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { flashcards } from "../../data/learning";
import type { LearningHubPageProps } from "../../types/learning";

export function FlashcardsPage({ hub }: LearningHubPageProps) {
  const { cardIndex, isFlashcardFlipped, knownCardRatings } = hub.state;
  const card = flashcards[cardIndex];
  const progress = ((cardIndex + 1) / flashcards.length) * 100;
  if (!card) return null;

  return (
    <div className="flashcards-layout">
      <section className="flashcards-top">
        <div>
          <span className="soft-badge">
            <BookOpen size={15} /> Mindful travel
          </span>
          <h2>
            {cardIndex + 1} <span>/ {flashcards.length}</span>
          </h2>
        </div>
        <div className="mini-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <button
          className="round-icon"
          onClick={hub.actions.resetFlashcards}
          aria-label="Bắt đầu lại"
        >
          <RotateCcw size={18} />
        </button>
      </section>
      <button
        className={`flashcard ${isFlashcardFlipped ? "flashcard--flipped" : ""}`}
        onClick={hub.actions.toggleFlashcard}
        aria-label={
          isFlashcardFlipped
            ? `Mặt nghĩa ${card.meaning}; lật về từ`
            : `Mặt từ ${card.term}; lật xem nghĩa`
        }
      >
        <div className="flashcard__inner">
          <div
            className="flashcard__face flashcard__front"
            aria-hidden={isFlashcardFlipped || undefined}
          >
            <span className="card-corner">ENGLISH</span>
            <span className="tap-note">Chạm để lật</span>
            <p className="flashcard__term">{card.term}</p>
            <p className="phonetic">{card.phonetic}</p>
            <span className="topic-chip">{card.topic}</span>
          </div>
          <div
            className="flashcard__face flashcard__back"
            aria-hidden={!isFlashcardFlipped || undefined}
          >
            <span className="card-corner">NGHĨA</span>
            <span className="tap-note">Chạm để lật lại</span>
            <p className="flashcard__meaning">{card.meaning}</p>
            <p className="example">“{card.example}”</p>
            <span className="topic-chip">Ví dụ</span>
          </div>
        </div>
      </button>
      <div className="flashcard-actions">
        <button
          className="rate-button rate-button--again"
          onClick={() => hub.actions.rateFlashcard(card.id, "again")}
          aria-pressed={knownCardRatings[card.id] === "again"}
        >
          <RotateCcw size={18} /> Cần ôn lại
        </button>
        <button
          className="rate-button rate-button--known"
          onClick={() => hub.actions.rateFlashcard(card.id, "known")}
          aria-pressed={knownCardRatings[card.id] === "known"}
        >
          <CheckCircle2 size={18} /> Đã biết
        </button>
      </div>
      <div className="flashcard-navigation">
        <button
          className="button button--ghost"
          onClick={() => hub.actions.moveFlashcard(-1)}
        >
          <ChevronLeft size={18} /> Trước
        </button>
        <div className="dot-row">
          {flashcards.map((item, index) => (
            <span
              key={item.id}
              className={index === cardIndex ? "dot dot--active" : "dot"}
            />
          ))}
        </div>
        <button
          className="button button--ghost"
          onClick={() => hub.actions.moveFlashcard(1)}
        >
          Tiếp <ChevronRight size={18} />
        </button>
      </div>
      <p className="flashcard-status" role="status" aria-live="polite">
        {knownCardRatings[card.id] === "known"
          ? "Đã đánh dấu: biết từ này rồi."
          : knownCardRatings[card.id] === "again"
            ? "Đã thêm vào danh sách ôn lại."
            : "Lật thẻ, rồi chọn cảm nhận của bạn."}
      </p>
    </div>
  );
}
