import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell, Group, Title, NavLink, Button, Text } from '@mantine/core';
import { getRole, getUsername, clearAuth } from '../lib/auth';

const links: Record<string, Array<{ label: string; path: string }>> = {
  user: [
    { label: 'Профиль', path: '/profile' },
    { label: 'Создать инцидент', path: '/incidents/new' },
  ],
  developer: [
    { label: 'Профиль', path: '/profile' },
    { label: 'Создать инцидент', path: '/incidents/new' },
  ],
  moderator: [
    { label: 'Профиль', path: '/profile' },
    { label: 'Новые инциденты', path: '/profile' },
    { label: 'Создать инцидент', path: '/incidents/new' },
  ],
  lead: [
    { label: 'Профиль', path: '/profile' },
    { label: 'Создать инцидент', path: '/incidents/new' },
    { label: 'Пользователи', path: '/users' },
  ],
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRole() || 'user';
  const username = getUsername();

  const navLinks = links[role] || links.user;

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: 0 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Title order={4}>BugTracker</Title>
            <Text size="sm" c="dimmed">{username} ({role})</Text>
          </Group>
          <Button variant="outline" size="sm" onClick={() => { clearAuth(); navigate('/login'); }}>
            Выйти
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            label={link.label}
            active={location.pathname === link.path}
            onClick={() => navigate(link.path)}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
