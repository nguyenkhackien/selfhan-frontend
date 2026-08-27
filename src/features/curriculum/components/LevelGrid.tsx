import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { EmptyState } from "@/shared/components";
import type { LevelSummary } from "../types/curriculum";

export function LevelGrid({
  levels,
  compact = false,
}: {
  levels: LevelSummary[];
  compact?: boolean;
}) {
  if (levels.length === 0) {
    return <EmptyState>Chưa có Level nào được xuất bản.</EmptyState>;
  }
  return (
    <section
      className={compact ? "section section--featured" : "page section"}
      aria-labelledby="levels-heading"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">LỘ TRÌNH CỦA BẠN</p>
          <h2 id="levels-heading">
            {compact ? "Bắt đầu từ đây" : "Các Level đang mở"}
          </h2>
        </div>
      </div>
      <div className="level-grid">
        {levels.map((level, index) => (
          <Link
            className="level-card"
            to={`/levels/${level.slug}`}
            key={level.id}
          >
            <span className="level-order">0{index + 1}</span>
            <h3>{level.title}</h3>
            <p>{level.description || "Khám phá những bài học đầu tiên."}</p>
            <span className="card-link">
              Mở Level <ArrowRight aria-hidden="true" size={16} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
