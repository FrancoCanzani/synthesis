import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import App from './pages/landing-page';
import NotesLayout from './pages/notes-layout';
import { ProtectedRoute } from './components/protected-route';
import { LoginPage } from './pages/login-page';
import './index.css';
import { useAuth } from './lib/hooks/use-auth';
import { AuthProvider } from './lib/context/auth-provider';
import NoteEditor from './components/note-editor';
import NoteSelector from './components/note-selector';
import { Toaster } from 'sonner';

const root = document.getElementById('root');

if (!root) throw new Error('Root element not found');

function RootRoute() {
  const { user } = useAuth();
  return user ? <Navigate to='/notes' replace /> : <App />;
}

ReactDOM.createRoot(root).render(
  <AuthProvider>
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path='/' element={<RootRoute />} />
        <Route path='/login' element={<LoginPage />} />
        <Route
          path='/notes'
          element={
            <ProtectedRoute>
              <NotesLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<NoteSelector />} />
          <Route path=':id' element={<NoteEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
