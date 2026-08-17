import { BrowserRouter } from "react-router";
import { AppErrorBoundary } from "./app/AppErrorBoundary";
import { LearningHubShell } from "./app/LearningHubShell";

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <LearningHubShell />
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
