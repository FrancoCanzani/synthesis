import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import NoteEditor from "./components/note-editor";
import { ProtectedRoute } from "./components/protected-route";
import { TooltipProvider } from "./components/ui/tooltip";
import "./index.css";
import { AuthProvider } from "./lib/context/auth-provider";
import NotFoundPage from "./pages/404-page";
import ArticlesPage from "./pages/articles-page";
import FeedsPage from "./pages/feeds-page";
import HomePage from "./pages/home-page";
import LandingPage from "./pages/landing-page";
import { LoginPage } from "./pages/login-page";
import ReadArticlePage from "./pages/read-article-page";
import ReadNotePage from "./pages/read-note-page";
import SidebarLayout from "./pages/sidebar-layout";

export default function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<LandingPage />} />

              <Route path="/login" element={<LoginPage />} />

              <Route path="/home">
                <Route element={<ProtectedRoute />}>
                  <Route element={<SidebarLayout />}>
                    <Route index element={<HomePage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="/articles">
                <Route element={<ProtectedRoute />}>
                  <Route element={<SidebarLayout />}>
                    <Route index element={<ArticlesPage />} />
                    <Route path=":id" element={<ReadArticlePage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="/feeds">
                <Route element={<ProtectedRoute />}>
                  <Route element={<SidebarLayout />}>
                    <Route index element={<FeedsPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="/notes">
                <Route element={<ProtectedRoute />}>
                  <Route element={<SidebarLayout />}>
                    <Route
                      index
                      element={
                        <div className="m-auto flex h-screen w-full items-center justify-center text-balance">
                          <p className="text-center text-foreground">
                            Select a note to view or edit.
                          </p>
                        </div>
                      }
                    />
                    <Route path=":id" element={<NoteEditor />} />
                  </Route>
                </Route>
              </Route>

              <Route path="/read">
                <Route element={<SidebarLayout />}>
                  <Route path=":id" element={<ReadNotePage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
