import { useState } from 'react';
import { Badge, Button, Group, Modal, Select, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

const stubUsers = [
  { id: '1', username: 'ivanov', role: 'user', registered_at: '2026-01-10T00:00:00Z' },
  { id: '2', username: 'petrov', role: 'developer', registered_at: '2026-02-15T00:00:00Z' },
  { id: '3', username: 'sidorov', role: 'moderator', registered_at: '2026-03-01T00:00:00Z' },
  { id: '4', username: 'admin', role: 'admin', registered_at: '2025-12-01T00:00:00Z' },
];

const roleLabels: Record<string, string> = {
  user: 'Пользователь',
  developer: 'Разработчик',
  moderator: 'Модератор',
  admin: 'Администратор',
};

export function AdminUsersPage() {
  const [users, setUsers] = useState(stubUsers);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [newLogin, setNewLogin] = useState('');
  const [newRole, setNewRole] = useState<string | null>('developer');

  const filtered = roleFilter ? users.filter((u) => u.role === roleFilter) : users;

  const handleCreateUser = () => {
    if (!newLogin.trim() || !newRole) return;
    const generatedPassword = Math.random().toString(36).slice(-8);
    const user = {
      id: String(Date.now()),
      username: newLogin,
      role: newRole,
      registered_at: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, user]);
    close();
    setNewLogin('');
    setNewRole('developer');
    notifications.show({
      title: 'Пользователь создан',
      message: `Логин: ${newLogin}, Пароль: ${generatedPassword}`,
      color: 'green',
    });
  };

  const handleDeleteUser = (id: string, username: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    notifications.show({ title: 'Пользователь удалён', message: `«${username}» удалён`, color: 'red' });
  };

  return (
    <Stack>
      <Group>
        <Title order={3}>Пользователи</Title>
        <Select
          placeholder="Фильтр по роли"
          data={[
            { value: '', label: 'Все' },
            { value: 'user', label: 'Пользователь' },
            { value: 'developer', label: 'Разработчик' },
            { value: 'moderator', label: 'Модератор' },
            { value: 'admin', label: 'Администратор' },
          ]}
          value={roleFilter}
          onChange={(val) => setRoleFilter(val || null)}
          clearable
          w={200}
          ml="auto"
        />
        <Button onClick={open}>Создать пользователя</Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Логин</Table.Th>
            <Table.Th>Роль</Table.Th>
            <Table.Th>Дата регистрации</Table.Th>
            <Table.Th>Действия</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filtered.map((u) => (
            <Table.Tr key={u.id}>
              <Table.Td>{u.username}</Table.Td>
              <Table.Td><Badge>{roleLabels[u.role] || u.role}</Badge></Table.Td>
              <Table.Td>{new Date(u.registered_at).toLocaleDateString()}</Table.Td>
              <Table.Td>
                <Button size="compact-xs" color="red" variant="outline" onClick={() => handleDeleteUser(u.id, u.username)}>Удалить</Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={close} title="Создание пользователя">
        <Stack>
          <TextInput label="Логин" placeholder="Логин пользователя" value={newLogin} onChange={(e) => setNewLogin(e.currentTarget.value)} required />
          <Select label="Роль" data={[{ value: 'moderator', label: 'Модератор' }, { value: 'developer', label: 'Разработчик' }]} value={newRole} onChange={setNewRole} />
          <Text size="xs" c="dimmed">Пароль будет сгенерирован автоматически</Text>
          <Button fullWidth onClick={handleCreateUser}>Создать</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
