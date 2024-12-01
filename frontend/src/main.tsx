import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import App from './App';
import DashboardLayout from './pages/dashboard-layout';
import Editor from './components/editor';
import { AuthProvider } from './hooks/use-auth';
import { ProtectedRoute } from './components/protected-route';
import { LoginPage } from './pages/login-page';
import './index.css';
import { useAuth } from './hooks/use-auth';

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
          path='/dashboard'
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Editor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
