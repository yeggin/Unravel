import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { IntakePage } from "@/pages/intake";
import { AmbientBackground } from "@/components/AmbientBackground";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={IntakePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AmbientBackground />
          <main className="relative min-h-screen w-full flex items-start justify-center">
            <Router />
          </main>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
