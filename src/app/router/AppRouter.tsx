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

export function AppRouter({ auth }: { auth: AuthState }) {
  return (
    <Routes>
      <Route element={<AppLayout auth={auth} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/levels" element={<LevelsPage />} />
        <Route path="/levels/:slug" element={<LevelPage />} />
        <Route path="/units/:slug" element={<UnitPage />} />
        <Route path="/lessons/:slug" element={<LessonPage />} />
        <Route path="/hsk" element={<HskPage />} />
        <Route path="/hsk/vocabulary/:id" element={<HskVocabularyPage />} />
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
