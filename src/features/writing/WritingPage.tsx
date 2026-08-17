import { useState } from "react";
import { Check, CheckCircle2, ChevronRight, Lightbulb } from "lucide-react";
import { writingPrompts } from "../../data/learning";
import { getWordCount } from "../../lib/learning";
import type { LearningHubPageProps } from "../../types/learning";

export function WritingPage({ hub }: LearningHubPageProps) {
  const [promptId, setPromptId] = useState(1);
  const [text, setText] = useState(
    "This morning, I sit by a small window with a warm cup of tea. The city is quiet, and I can hear the rain softly touching the leaves.",
  );
  const prompt = writingPrompts.find((item) => item.id === promptId);
  const words = getWordCount(text);
  const isComplete = hub.state.goals.some((goal) => goal.id === 3 && goal.done);

  if (!prompt) return null;

  const finish = () => {
    hub.actions.completeWriting();
  };

  return (
    <div className="writing-layout">
      <label className="prompt-select">
        <span>Chọn prompt viết</span>
        <select
          aria-label="Chọn prompt viết"
          value={promptId}
          onChange={(event) => setPromptId(Number(event.target.value))}
        >
          {writingPrompts.map((item) => (
            <option key={item.id} value={item.id}>
              {item.tag} · {item.title}
            </option>
          ))}
        </select>
      </label>
      <aside className="prompt-rail card">
        <p className="eyebrow">CHỌN MỘT PROMPT</p>
        <div className="prompt-list">
          {writingPrompts.map((item) => (
            <button
              key={item.id}
              className={`prompt-choice ${item.id === promptId ? "prompt-choice--active" : ""}`}
              aria-pressed={item.id === promptId}
              onClick={() => {
                setPromptId(item.id);
              }}
            >
              <span>{item.tag}</span>
              <strong>{item.title}</strong>
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
        <div className="writing-tip">
          <Lightbulb size={18} />
          <p>
            <strong>Nhắc nhẹ</strong>Đừng cố viết hoàn hảo. Hãy viết thật trước.
          </p>
        </div>
      </aside>
      <section className="writing-editor card">
        <div className="writing-editor__head">
          <span className="soft-badge">{prompt.tag}</span>
          <span className="word-count">{words} từ</span>
        </div>
        <h2>{prompt.title}</h2>
        <p className="prompt-copy">{prompt.text}</p>
        <label className="sr-only" htmlFor="writing-field">
          Bài viết của bạn
        </label>
        <textarea
          id="writing-field"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
          }}
          placeholder="Bắt đầu một câu thật đơn giản…"
        />
        <div className="writing-editor__footer">
          <span>
            {isComplete ? (
              <>
                <CheckCircle2 size={17} /> Đã lưu vào hành trình hôm nay
              </>
            ) : (
              "Mẹo: thử dùng serenity, meander hoặc luminous."
            )}
          </span>
          <button
            className="button button--primary"
            onClick={finish}
            disabled={words < 3}
          >
            {isComplete ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}{" "}
            <Check size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}
