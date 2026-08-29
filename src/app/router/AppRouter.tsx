import { Route, Routes } from "react-router";
import { AuthPage, type AuthState } from "@/features/auth";
import {
  HomePage,
  LevelPage,
  LevelsPage,
  LessonPage,
  NotFoundPage,
  UnitPage,
} from "@/features/curriculum";
import { AppLayout } from "@/layouts/AppLayout";
import { HskPage, HskVocabularyPage } from "@/features/hsk";
import { DashboardPage, QuizPage, ReviewPage } from "@/features/learning";
import { AdminContentPage } from "@/features/admin";
import { SettingsPage } from "@/features/settings";

export function AppRouter({ auth }: { auth: AuthState }) {
  return (
    <Routes>
      <Route element={<AppLayout auth={auth} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/levels" element={<LevelsPage />} />
        <Route path="/levels/:slug" element={<LevelPage />} />
        <Route path="/units/:slug" element={<UnitPage auth={auth} />} />
        <Route path="/lessons/:slug" element={<LessonPage auth={auth} />} />
        <Route path="/hsk" element={<HskPage />} />
        <Route path="/hsk/vocabulary/:id" element={<HskVocabularyPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/dashboard" element={<DashboardPage auth={auth} />} />
        <Route path="/reviews" element={<ReviewPage auth={auth} />} />
        <Route path="/quizzes/:id" element={<QuizPage auth={auth} />} />
        <Route
          path="/admin/content"
          element={<AdminContentPage auth={auth} />}
        />
        <Route path="/login" element={<AuthPage auth={auth} mode="login" />} />
        <Route
          path="/register"
          element={<AuthPage auth={auth} mode="register" />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
