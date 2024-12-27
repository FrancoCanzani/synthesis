import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import NoteEditor from "./components/note-editor";
import NoteSelector from "./components/note-selector";
import { ProtectedRoute } from "./components/protected-route";
import { TooltipProvider } from "./components/ui/tooltip";
import "./index.css";
import { AuthProvider } from "./lib/context/auth-provider";
import { useAuth } from "./lib/hooks/use-auth";
import NotFoundPage from "./pages/404-page";
import App from "./pages/landing-page";
import { LoginPage } from "./pages/login-page";
import NotesLayout from "./pages/notes-layout";

const root = document.getElementById("root");

if (!root) throw new Error("Root element not found");

function RootRoute() {
  const { user } = useAuth();
  return user ? <Navigate to="/notes" replace /> : <App />;
}

ReactDOM.createRoot(root).render(
  <AuthProvider>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<NoteSelector />} />
            <Route path=":id" element={<NoteEditor />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>,
);
