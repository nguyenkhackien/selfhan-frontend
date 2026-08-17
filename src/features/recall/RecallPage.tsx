import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { flashcards } from "../../data/learning";
import { isRecallAnswerCorrect } from "../../lib/learning";
import type { LearningHubPageProps } from "../../types/learning";

export function RecallPage({ hub }: LearningHubPageProps) {
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<"correct" | "retry" | null>(null);
  const card = flashcards[hub.state.recallIndex];
  if (!card) return null;

  const checkAnswer = () =>
    setResult(isRecallAnswerCorrect(answer, card.term) ? "correct" : "retry");
  const next = () => {
    hub.actions.advanceRecall();
    setAnswer("");
    setResult(null);
    setShowHint(false);
  };

  return (
    <div className="recall-layout">
      <div className="recall-progress">
        <span>Phiên hôm nay</span>
        <b>
          {hub.state.recallIndex + 1} / {flashcards.length}
        </b>
        <div>
          <i
            style={{
              width: `${((hub.state.recallIndex + 1) / flashcards.length) * 100}%`,
            }}
          />
        </div>
      </div>
      <section className="recall-card card">
        <span className="recall-icon">
          <Sparkles size={25} />
        </span>
        <p className="eyebrow">NGHĨA CỦA TỪ</p>
        <h2>{card.meaning}</h2>
        <p>Hít một nhịp thật chậm, rồi gọi lại từ tiếng Anh phù hợp.</p>
        {showHint && (
          <div className="hint">
            Gợi ý: bắt đầu bằng chữ{" "}
            <strong>{card.term[0]?.toUpperCase()}</strong> · {card.term.length}{" "}
            ký tự
          </div>
        )}
        <div className="recall-input">
          <label className="sr-only" htmlFor="recall-answer">
            Từ tiếng Anh
          </label>
          <input
            id="recall-answer"
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              setResult(null);
            }}
            onKeyDown={(event) => event.key === "Enter" && checkAnswer()}
            placeholder="Nhập từ của bạn..."
            autoComplete="off"
          />
          <button onClick={checkAnswer} disabled={!answer.trim()}>
            Kiểm tra <ArrowRight size={17} />
          </button>
        </div>
        {result && (
          <p
            className={`recall-result recall-result--${result}`}
            role="status"
            aria-live="polite"
          >
            {result === "correct" ? (
              <>
                <CheckCircle2 size={18} /> Chính xác! Bạn đã nhớ rất tốt.
              </>
            ) : (
              <>
                <CircleHelp size={18} /> Chưa đúng — thử nghĩ về cảm giác bình
                yên nhé.
              </>
            )}
          </p>
        )}
        <div className="recall-card__actions">
          <button
            className="text-button"
            onClick={() => setShowHint(!showHint)}
          >
            <Lightbulb size={17} /> {showHint ? "Ẩn gợi ý" : "Gợi ý"}
          </button>
          {result === "correct" && (
            <button className="text-button" onClick={next}>
              Từ tiếp theo <ArrowRight size={17} />
            </button>
          )}
        </div>
      </section>
      <p className="recall-note">
        Active recall giúp từ vựng ở lại lâu hơn — mỗi lần nhớ lại đều có ý
        nghĩa.
      </p>
    </div>
  );
}
