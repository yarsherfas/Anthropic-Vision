import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth";
import { Navbar } from "@/components/layout/Navbar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import Characters from "@/pages/characters";
import CreateCharacter from "@/pages/characters/new";
import CharacterProfile from "@/pages/characters/profile";
import Chats from "@/pages/chats";
import ChatDetail from "@/pages/chats/detail";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/auth" component={AuthPage} />

          <Route path="/characters" component={Characters} />
          <Route path="/characters/new" component={CreateCharacter} />
          <Route path="/characters/:id" component={CharacterProfile} />

          <Route path="/chats" component={Chats} />
          <Route path="/chats/:id" component={ChatDetail} />

          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
