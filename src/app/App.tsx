import { useAuth } from "@/features/auth";
import { AppErrorBoundary } from "./AppErrorBoundary";
import { AppProviders } from "./providers/AppProviders";
import { AppRouter } from "./router/AppRouter";

export default function App() {
  const auth = useAuth();
  return (
    <AppErrorBoundary>
      <AppProviders>
        <AppRouter auth={auth} />
      </AppProviders>
    </AppErrorBoundary>
  );
}
