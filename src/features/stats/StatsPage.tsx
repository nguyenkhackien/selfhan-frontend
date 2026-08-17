import {
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  Star,
  type LucideIcon,
} from "lucide-react";
import { weeklyActivity } from "../../data/learning";
import { getCompletedGoalCount } from "../../lib/learning";
import type { LearningHubPageProps } from "../../types/learning";

export function StatsPage({ hub }: LearningHubPageProps) {
  const maxMinutes = Math.max(...weeklyActivity.map((item) => item.minutes));
  const completeGoals = getCompletedGoalCount(hub.state.goals);
  const knownCount = Object.values(hub.state.knownCardRatings).filter(
    (value) => value === "known",
  ).length;

  return (
    <div className="stats-layout">
      <section className="metric-row">
        <Metric
          icon={Clock3}
          tone="blue"
          label="Thời gian tuần này"
          value="3h 37m"
          detail="↑ 18% so với tuần trước"
        />
        <Metric
          icon={BookOpen}
          tone="gold"
          label="Từ đang học"
          value={`${48 + knownCount}`}
          detail="12 từ đã vững vàng"
        />
        <Metric
          icon={Flame}
          tone="rose"
          label="Chuỗi học"
          value="7 ngày"
          detail="Thành tích tốt nhất: 12 ngày"
        />
        <Metric
          icon={CheckCircle2}
          tone="sage"
          label="Mục tiêu hôm nay"
          value={`${completeGoals}/3`}
          detail="Chỉ một nhịp nữa thôi"
        />
      </section>
      <section className="activity-card card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">LAST SEVEN DAYS</p>
            <h2>Nhịp học trong tuần</h2>
          </div>
          <span className="soft-badge">217 phút</span>
        </div>
        <div
          className="bar-chart"
          aria-label="Biểu đồ thời gian học trong tuần"
        >
          {weeklyActivity.map((item) => (
            <div className="bar-column" key={item.day}>
              <span className="bar-value">{item.minutes}m</span>
              <div className="bar-well">
                <i
                  style={{ height: `${(item.minutes / maxMinutes) * 100}%` }}
                />
              </div>
              <b>{item.day}</b>
            </div>
          ))}
        </div>
      </section>
      <section className="stats-bottom">
        <div className="topic-progress card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">BY TOPIC</p>
              <h2>Không gian đang nở rộ</h2>
            </div>
          </div>
          <ProgressRow label="Travel & places" value={78} tone="sage" />
          <ProgressRow label="Daily conversations" value={61} tone="blue" />
          <ProgressRow label="Nature & feelings" value={46} tone="gold" />
        </div>
        <div className="streak-panel card">
          <span className="streak-panel__sun">
            <Star size={24} fill="currentColor" />
          </span>
          <p className="eyebrow">A GENTLE STREAK</p>
          <h2>7 ngày có mặt</h2>
          <p>
            Mỗi buổi học ngắn là một lời hứa nhỏ bạn đang giữ với chính mình.
          </p>
          <div className="week-dots">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
              <span
                key={day}
                className={
                  day === "CN" ? "week-dot week-dot--today" : "week-dot"
                }
              >
                <i>
                  <Check size={12} />
                </i>
                {day}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

interface MetricProps {
  icon: LucideIcon;
  tone: string;
  label: string;
  value: string;
  detail: string;
}
function Metric({ icon: Icon, tone, label, value, detail }: MetricProps) {
  return (
    <article className="metric card">
      <span className={`icon-tile icon-tile--${tone}`}>
        <Icon size={19} />
      </span>
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
        <small>{detail}</small>
      </div>
    </article>
  );
}
function ProgressRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="topic-row">
      <div>
        <span>{label}</span>
        <b>{value}%</b>
      </div>
      <i className={`topic-line topic-line--${tone}`}>
        <em style={{ width: `${value}%` }} />
      </i>
    </div>
  );
}
