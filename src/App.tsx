import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import { client } from './client/client.gen';
import { getToken, isAuthenticated } from './lib/auth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import IncidentPage from './pages/IncidentPage';
import CreateIncidentPage from './pages/CreateIncidentPage';
import MicroservicePage from './pages/MicroservicePage';
import UsersPage from './pages/UsersPage';

client.setConfig({ baseUrl: 'http://localhost:8000' });

client.interceptors.request.use((request) => {
  const token = getToken();
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
  return request;
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <Notifications />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/incidents/new" element={<ProtectedRoute><CreateIncidentPage /></ProtectedRoute>} />
              <Route path="/incidents/:id" element={<ProtectedRoute><IncidentPage /></ProtectedRoute>} />
              <Route path="/microservices/:id" element={<ProtectedRoute><MicroservicePage /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ModalsProvider>
    </MantineProvider>
  );
}
