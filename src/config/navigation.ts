import {
  BarChart3,
  BookOpen,
  Edit3,
  Home,
  NotebookPen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import { FlashcardsPage } from "../features/flashcards/FlashcardsPage";
import { HomePage } from "../features/home/HomePage";
import { NotesPage } from "../features/notes/NotesPage";
import { RecallPage } from "../features/recall/RecallPage";
import { StatsPage } from "../features/stats/StatsPage";
import { WritingPage } from "../features/writing/WritingPage";
import type { LearningHubPageProps, PageId } from "../types/learning";

export interface PageHeadingMetadata {
  eyebrow: string;
  title: string;
  copy: string;
}

interface PageNavigationMetadata {
  label: string;
  icon: LucideIcon;
}

export interface PageDefinition {
  id: PageId;
  path: string;
  navigation: PageNavigationMetadata;
  heading: PageHeadingMetadata;
  component: ComponentType<LearningHubPageProps>;
}

export const pageDefinitions: Record<PageId, PageDefinition> = {
  home: {
    id: "home",
    path: "/",
    navigation: { label: "Home", icon: Home },
    heading: {
      eyebrow: "YOUR LEARNING SPACE",
      title: "Chào buổi sáng, Kien",
      copy: "Tiếp tục hành trình ngôn ngữ của bạn trong sự tĩnh lặng.",
    },
    component: HomePage,
  },
  writing: {
    id: "writing",
    path: "/writing",
    navigation: { label: "Writing", icon: Edit3 },
    heading: {
      eyebrow: "DAILY WRITING",
      title: "Luyện viết",
      copy: "Biến từ mới thành suy nghĩ của riêng bạn.",
    },
    component: WritingPage,
  },
  flashcards: {
    id: "flashcards",
    path: "/flashcards",
    navigation: { label: "Flashcards", icon: BookOpen },
    heading: {
      eyebrow: "VOCABULARY GARDEN",
      title: "Flashcards",
      copy: "Ôn từ mới với nhịp độ nhẹ nhàng của riêng bạn.",
    },
    component: FlashcardsPage,
  },
  recall: {
    id: "recall",
    path: "/recall",
    navigation: { label: "Recall", icon: Sparkles },
    heading: {
      eyebrow: "ACTIVE RECALL",
      title: "Luyện nhớ",
      copy: "Gọi lại từ vựng thay vì chỉ nhìn lướt qua chúng.",
    },
    component: RecallPage,
  },
  notes: {
    id: "notes",
    path: "/notes",
    navigation: { label: "Notes", icon: NotebookPen },
    heading: {
      eyebrow: "PERSONAL LIBRARY",
      title: "Ghi chú",
      copy: "Lưu lại những ý tưởng đáng giữ trên hành trình học.",
    },
    component: NotesPage,
  },
  stats: {
    id: "stats",
    path: "/stats",
    navigation: { label: "Stats", icon: BarChart3 },
    heading: {
      eyebrow: "GENTLE PROGRESS",
      title: "Thống kê",
      copy: "Một cái nhìn bình tĩnh về nhịp học của bạn.",
    },
    component: StatsPage,
  },
};

export const navigationItems = Object.values(pageDefinitions).map(
  ({ id, navigation }) => ({ id, ...navigation }),
);

export function toPagePath(page: PageId): string {
  return pageDefinitions[page].path;
}

export function pageIdForPath(pathname: string): PageId | undefined {
  return Object.values(pageDefinitions).find(
    (definition) => definition.path === pathname,
  )?.id;
}

export function pageTitleForPath(pathname: string): string {
  const pageId = pageIdForPath(pathname);
  return pageId
    ? `${pageDefinitions[pageId].heading.title} | ZenLingo`
    : "Không tìm thấy trang | ZenLingo";
}
