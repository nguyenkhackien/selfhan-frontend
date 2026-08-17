import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Edit3,
  GraduationCap,
  NotebookPen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { getCompletedGoalCount } from "../../lib/learning";
import type { LearningHubPageProps } from "../../types/learning";

export function HomePage({ hub, onNavigate }: LearningHubPageProps) {
  const { goals } = hub.state;
  const completedCount = getCompletedGoalCount(goals);
  const minutes = 10 + completedCount * 10;
  const progress = Math.min((minutes / 40) * 100, 100);

  return (
    <div className="page-grid home-grid">
      <section className="hero-card card">
        <div className="hero-card__copy">
          <span className="soft-badge">
            <Sparkles size={15} /> Nhịp học hôm nay
          </span>
          <h2>Mỗi từ mới là một nơi chốn để ghé qua.</h2>
          <p>
            Hôm nay bạn đã tạo một khoảng lặng thật đẹp cho việc học. Cứ tiếp
            tục thật chậm rãi nhé.
          </p>
          <button
            className="button button--primary"
            onClick={() => onNavigate("flashcards")}
          >
            Tiếp tục học <ArrowRight size={17} />
          </button>
        </div>
        <div className="hero-orb" aria-hidden="true">
          <span>bonjour</span>
          <i>ciao</i>
          <b>hello</b>
        </div>
      </section>
      <section className="progress-card card">
        <div className="section-label">
          <span>Tiến độ hôm nay</span>
          <span>{minutes} / 40 phút</span>
        </div>
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-card__detail">
          <Clock3 size={17} />
          <p>
            <strong>
              {40 - minutes > 0
                ? `${40 - minutes} phút nữa`
                : "Hoàn thành rồi!"}
            </strong>
            <span>
              {40 - minutes > 0
                ? "để chạm mục tiêu nhẹ nhàng của bạn"
                : "Hãy tự thưởng một tách trà nhé"}
            </span>
          </p>
        </div>
      </section>
      <section className="next-card card">
        <div className="next-card__top">
          <span className="icon-tile icon-tile--coral">
            <GraduationCap size={21} />
          </span>
          <span className="pill">Bài học tiếp theo</span>
        </div>
        <div>
          <p className="topic">Từ vựng Du lịch</p>
          <h3>Những chuyến đi thong thả</h3>
          <p>15 từ mới được chọn để bạn tự tin hơn trên hành trình kế tiếp.</p>
        </div>
        <div className="next-card__footer">
          <span>
            <b>40%</b> hoàn thành
          </span>
          <button
            onClick={() => onNavigate("flashcards")}
            aria-label="Mở bài học du lịch"
          >
            <ArrowRight size={19} />
          </button>
        </div>
      </section>
      <section className="goals-card card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">TODAY'S RHYTHM</p>
            <h2>Mục tiêu hôm nay</h2>
          </div>
          <span className="count-badge">
            {completedCount} / {goals.length}
          </span>
        </div>
        <div className="goal-list">
          {goals.map((goal) => (
            <button
              className={`goal ${goal.done ? "goal--done" : ""}`}
              key={goal.id}
              onClick={() => hub.actions.toggleGoal(goal.id)}
              aria-pressed={goal.done}
            >
              <span className="goal__check">
                {goal.done && <Check size={15} />}
              </span>
              <span className="goal__copy">
                <strong>{goal.label}</strong>
                <small>{goal.detail}</small>
              </span>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
        <p className="goal-summary">
          Hoàn thành {completedCount} / {goals.length} mục tiêu
        </p>
      </section>
      <section className="quick-card card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">MAKE IT YOURS</p>
            <h2>Truy cập nhanh</h2>
          </div>
        </div>
        <div className="quick-list">
          <QuickAction
            icon={Edit3}
            tone="blue"
            label="Luyện viết"
            caption="Một prompt thật nhỏ"
            onClick={() => onNavigate("writing")}
          />
          <QuickAction
            icon={BookOpen}
            tone="gold"
            label="Flashcards"
            caption="20 thẻ cần ôn"
            onClick={() => onNavigate("flashcards")}
          />
          <QuickAction
            icon={Sparkles}
            tone="sage"
            label="Luyện nhớ"
            caption="Tự gọi lại từ vựng"
            onClick={() => onNavigate("recall")}
          />
          <QuickAction
            icon={NotebookPen}
            tone="rose"
            label="Ghi chú"
            caption="Lưu một điều vừa học"
            onClick={() => onNavigate("notes")}
          />
        </div>
      </section>
    </div>
  );
}

interface QuickActionProps {
  icon: LucideIcon;
  tone: string;
  label: string;
  caption: string;
  onClick(): void;
}

function QuickAction({
  icon: Icon,
  tone,
  label,
  caption,
  onClick,
}: QuickActionProps) {
  return (
    <button className="quick-action" onClick={onClick}>
      <span className={`icon-tile icon-tile--${tone}`}>
        <Icon size={19} />
      </span>
      <span>
        <strong>{label}</strong>
        <small>{caption}</small>
      </span>
      <ArrowRight size={17} />
    </button>
  );
}
