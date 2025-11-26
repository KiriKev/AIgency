import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Gallery from "@/pages/Gallery";
import Editor from "@/pages/Editor";
import Generator from "@/pages/Generator";
import Showcase from "@/pages/Showcase";
import MyGallery from "@/pages/MyGallery";
import ArtistProfile from "@/pages/ArtistProfile";
import ArtworkDetail from "@/pages/ArtworkDetail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Gallery} />
      <Route path="/editor" component={Editor} />
      <Route path="/generator/:id" component={Generator} />
      <Route path="/showcase" component={Showcase} />
      <Route path="/my-gallery" component={MyGallery} />
      <Route path="/artist/:id" component={ArtistProfile} />
      <Route path="/artwork/:id" component={ArtworkDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
