import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import App from './App';
import DashboardLayout from './pages/dashboard-layout';
import Editor from './components/editor';

const root = document.getElementById('root');

if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />} />
      <Route path='/dashboard' element={<DashboardLayout />}>
        <Route index element={<Editor />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
