import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import NoteEditor from "./components/note-editor";
import { ProtectedRoute } from "./components/protected-route";
import { TooltipProvider } from "./components/ui/tooltip";
import "./index.css";
import { AuthProvider } from "./lib/context/auth-provider";
import { useAuth } from "./lib/hooks/use-auth";
import NotFoundPage from "./pages/404-page";
import HomePage from "./pages/home-page";
import { LoginPage } from "./pages/login-page";
import ReadNotePage from "./pages/read-note-page";
import SidebarLayout from "./pages/sidebar-layout";

function RootRoute() {
  const { user } = useAuth();
  return user ? <Navigate to="/home" replace /> : <App />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Routes>
            <Route path="/" element={<RootRoute />} />

            <Route path="/login" element={<LoginPage />} />

            <Route path="/home">
              <Route element={<ProtectedRoute />}>
                <Route element={<SidebarLayout />}>
                  <Route index element={<HomePage />} />
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
  );
}
