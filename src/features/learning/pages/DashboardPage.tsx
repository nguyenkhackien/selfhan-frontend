import { BookOpenCheck, Flame, RotateCcw, Target } from "lucide-react";
import { useCallback } from "react";
import { Link } from "react-router";
import type { AuthState } from "@/features/auth";
import { ErrorState, LoadingState, PageFrame } from "@/shared/components";
import { useRemoteResource } from "@/shared/hooks/useRemoteResource";
import { learningApi } from "../api/learningApi";
import { AuthRequired } from "../components/AuthRequired";

export function DashboardPage({ auth }: { auth: AuthState }) {
  return (
    <PageFrame title="Không gian học của bạn" eyebrow="TIẾN ĐỘ HỌC">
      <AuthRequired signedIn={Boolean(auth.user)}>
        <DashboardContent />
      </AuthRequired>
    </PageFrame>
  );
}

function DashboardContent() {
  const load = useCallback(() => learningApi.dashboard(), []);
  const resource = useRemoteResource(load, "dashboard");
  const loadStatistics = useCallback(() => learningApi.statistics(), []);
  const statistics = useRemoteResource(loadStatistics, "learning-statistics");
  if (resource.loading || statistics.loading) return <LoadingState />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={resource.reload} />;
  if (statistics.error)
    return (
      <ErrorState message={statistics.error} onRetry={statistics.reload} />
    );
  const dashboard = resource.data;
  if (!dashboard || !statistics.data) return null;

  const cards = [
    {
      label: "Bài đã hoàn thành",
      value: dashboard.completedLessons,
      icon: BookOpenCheck,
    },
    { label: "Từ đã học", value: dashboard.learnedWords, icon: Target },
    {
      label: "Câu đã luyện",
      value: statistics.data.questionCount,
      icon: Target,
    },
    {
      label: "Đúng trung bình",
      value: `${statistics.data.accuracy}%`,
      icon: Target,
    },
    { label: "Chuỗi ngày học", value: dashboard.currentStreak, icon: Flame },
  ];

  return (
    <div className="learner-dashboard">
      <section
        className="dashboard-hero"
        aria-labelledby="dashboard-next-heading"
      >
        <div>
          <p className="eyebrow">BƯỚC TIẾP THEO</p>
          <h2 id="dashboard-next-heading">
            {dashboard.continueLesson
              ? `Tiếp tục ${dashboard.continueLesson.title}`
              : "Bắt đầu một bài học ngắn"}
          </h2>
          <p>
            {dashboard.continueLesson
              ? "Hoàn tất phần còn lại rồi làm quiz để ghi nhận tiến độ."
              : "Chọn một bài trong lộ trình để tạo nhịp học đầu tiên."}
          </p>
        </div>
        <Link
          className="button button--primary"
          to={
            dashboard.continueLesson
              ? `/lessons/${dashboard.continueLesson.slug}`
              : "/levels"
          }
        >
          {dashboard.continueLesson ? "Tiếp tục học" : "Xem lộ trình"}
        </Link>
      </section>

      <section className="dashboard-stat-grid" aria-label="Tổng quan tiến độ">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="dashboard-stat-card" key={card.label}>
              <Icon aria-hidden="true" size={20} />
              <strong>{card.value}</strong>
              <span>{card.label}</span>
            </article>
          );
        })}
      </section>

      <section
        className="dashboard-review-card"
        aria-labelledby="review-heading"
      >
        <div>
          <p className="eyebrow">ÔN TẬP CÁCH QUÃNG</p>
          <h2 id="review-heading">{dashboard.dueReviewCount} từ đang chờ ôn</h2>
          <p>Một lượt ôn ngắn giúp từ mới bám vào trí nhớ lâu hơn.</p>
        </div>
        <Link className="button button--secondary" to="/reviews">
          <RotateCcw aria-hidden="true" size={17} />
          Ôn ngay
        </Link>
      </section>
    </div>
  );
}
