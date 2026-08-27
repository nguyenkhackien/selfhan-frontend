import { ArrowRight, BookOpen, PenLine, Sparkles, Volume2 } from "lucide-react";
import { Link } from "react-router";
import type { LevelSummary } from "../types/curriculum";

export function Hero({ levels }: { levels: LevelSummary[] }) {
  const featured = levels[0];
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <Sparkles aria-hidden="true" size={14} /> HỌC TIẾNG TRUNG CÓ LỘ
            TRÌNH
          </p>
          <h1>Bắt đầu từ một chữ. Đi tiếp bằng sự hiểu biết.</h1>
          <p>
            SelfHan giúp bạn học từ vựng, Pinyin và ngữ pháp cơ bản theo từng
            bài ngắn, rõ ràng và có nhịp điệu.
          </p>
          <div className="hero-actions">
            <Link
              className="button button--primary"
              to={featured ? `/levels/${featured.slug}` : "/levels"}
            >
              Xem lộ trình <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="button button--secondary" to="/register">
              Tạo tài khoản
            </Link>
          </div>
        </div>
        <div className="hanzi-display" aria-label="Chữ Hán: 你好">
          <span>你</span>
          <span>好</span>
          <p>nǐ hǎo · xin chào</p>
        </div>
      </section>
      <section
        className="principles"
        id="how-it-works"
        aria-label="Cách SelfHan giúp bạn học"
      >
        <article>
          <BookOpen aria-hidden="true" />
          <h2>Học theo bài</h2>
          <p>Đi từ Level đến Unit và Lesson để không mất phương hướng.</p>
        </article>
        <article>
          <Volume2 aria-hidden="true" />
          <h2>Nghe trong ngữ cảnh</h2>
          <p>Âm thanh và ví dụ nằm cạnh từ mới khi nội dung có sẵn.</p>
        </article>
        <article>
          <PenLine aria-hidden="true" />
          <h2>Tự tay viết</h2>
          <p>
            Luyện nét ngay trên trình duyệt, không chấm điểm hay lưu nét viết.
          </p>
        </article>
      </section>
    </>
  );
}
