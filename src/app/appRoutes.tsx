import { Route, Routes } from "react-router";
import { PageHeading } from "../components/layout/PageHeading";
import { pageDefinitions, type PageDefinition } from "../config/navigation";
import type {
  LearningHubController,
  LearningHubPageProps,
} from "../types/learning";
import { NotFoundPage } from "./NotFoundPage";

interface AppRoutesProps {
  hub: LearningHubController;
  onNavigate: LearningHubPageProps["onNavigate"];
}

function RoutedPage({
  definition,
  hub,
  onNavigate,
}: AppRoutesProps & { definition: PageDefinition }) {
  const Page = definition.component;

  return (
    <>
      <PageHeading heading={definition.heading} />
      <Page hub={hub} onNavigate={onNavigate} />
    </>
  );
}

export function AppRoutes({ hub, onNavigate }: AppRoutesProps) {
  return (
    <Routes>
      {Object.values(pageDefinitions).map((definition) => (
        <Route
          key={definition.id}
          path={definition.path}
          element={
            <RoutedPage
              definition={definition}
              hub={hub}
              onNavigate={onNavigate}
            />
          }
        />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
