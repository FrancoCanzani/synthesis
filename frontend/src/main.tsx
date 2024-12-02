import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import App from './App';
import NotesLayout from './pages/notes-layout';
import { ProtectedRoute } from './components/protected-route';
import { LoginPage } from './pages/login-page';
import './index.css';
import { useAuth } from './lib/hooks/use-auth';
import { AuthProvider } from './lib/context/auth-provider';

const root = document.getElementById('root');

if (!root) throw new Error('Root element not found');

function RootRoute() {
  const { user } = useAuth();
  return user ? <Navigate to='/dashboard' replace /> : <App />;
}

ReactDOM.createRoot(root).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<RootRoute />} />
        <Route path='/login' element={<LoginPage />} />
        <Route
          path='/notes/:id'
          element={
            <ProtectedRoute>
              <NotesLayout />
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
