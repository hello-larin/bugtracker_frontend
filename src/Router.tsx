import { Navigate, Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell, Burger, Group, NavLink, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AuthPage } from './pages/Auth.page';
import { ProfilePage } from './pages/Profile.page';
import { IncidentDetailPage } from './pages/IncidentDetail.page';
import { CreateIncidentPage } from './pages/CreateIncident.page';
import { MicroserviceDetailPage } from './pages/MicroserviceDetail.page';
import { AdminUsersPage } from './pages/AdminUsers.page';

function AppLayout() {
  const [opened, { toggle }] = useDisclosure();
  const currentUser = getCurrentUser();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text fw={700} size="lg">BugTracker</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          label="Профиль"
          component="a"
          href="/profile"
          onClick={toggle}
          active={window.location.pathname === '/profile'}
        />
        <NavLink
          label="Создать инцидент"
          component="a"
          href="/incidents/new"
          onClick={toggle}
          active={window.location.pathname === '/incidents/new'}
        />
        {currentUser?.role === 'admin' && (
          <NavLink
            label="Пользователи"
            component="a"
            href="/admin/users"
            onClick={toggle}
            active={window.location.pathname === '/admin/users'}
          />
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Navigate to="/profile" replace /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/incidents/new', element: <CreateIncidentPage /> },
      { path: '/incidents/:id', element: <IncidentDetailPage /> },
      { path: '/microservices/:id', element: <MicroserviceDetailPage /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
