import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Group, Modal, Select, Stack, Table, Tabs, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const stubMicroservice = {
  id: 'stub-1',
  name: 'API Gateway',
  description: 'Основной шлюз для всех микросервисов',
  status: 'active' as const,
  created_at: '2026-01-15T00:00:00Z',
};

const stubMembers = [
  { id: 'm1', username: 'moderator1', role: 'moderator', added_at: '2026-02-01T00:00:00Z' },
  { id: 'm2', username: 'developer1', role: 'developer', added_at: '2026-02-10T00:00:00Z' },
];

const stubIncidents = [
  { id: '1', title: 'Ошибка авторизации', status: 'new', created_at: '2026-05-10T10:00:00Z' },
  { id: '2', title: 'Не загружается аватар', status: 'in_progress', created_at: '2026-05-12T14:30:00Z' },
];

export function MicroserviceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const role = currentUser?.role || 'user';
  const isLead = role === 'lead';

  const [members, setMembers] = useState(stubMembers);
  const [opened, { open, close }] = useDisclosure(false);
  const [newMemberUser, setNewMemberUser] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<string | null>('developer');

  const isStub = id?.startsWith('stub');
  const ms = isStub ? stubMicroservice : { ...stubMicroservice, id: id || '', name: `Микросервис ${id}`, description: 'Описание микросервиса' };

  const handleEdit = () => {
    notifications.show({ title: 'Успех', message: 'Данные микросервиса обновлены', color: 'green' });
  };

  const handleAddMember = () => {
    if (!newMemberUser || !newMemberRole) return;
    const member = {
      id: String(Date.now()),
      username: newMemberUser,
      role: newMemberRole,
      added_at: new Date().toISOString(),
    };
    setMembers((prev) => [...prev, member]);
    close();
    setNewMemberUser('');
    setNewMemberRole('developer');
    notifications.show({ title: 'Участник добавлен', message: '', color: 'green' });
  };

  const handleRemoveMember = (memberId: string, username: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    notifications.show({ title: 'Участник удалён', message: `«${username}» удалён из команды`, color: 'green' });
  };

  return (
    <Stack>
      <Card withBorder p="lg">
        <Group>
          <div>
            <Title order={3}>{ms.name}</Title>
            <Text size="sm" c="dimmed">Создан: {new Date(ms.created_at).toLocaleDateString()}</Text>
            <Badge mt="xs" color={ms.status === 'active' ? 'green' : 'gray'}>{ms.status === 'active' ? 'Активен' : 'Архивирован'}</Badge>
          </div>
          {isLead && (
            <Button ml="auto" onClick={handleEdit}>Изменить</Button>
          )}
        </Group>
        <Text mt="md">{ms.description}</Text>
      </Card>

      <Tabs defaultValue="team">
        <Tabs.List>
          <Tabs.Tab value="team">Команда</Tabs.Tab>
          <Tabs.Tab value="incidents">Инциденты</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="team" pt="md">
          {isLead && (
            <Button mb="md" onClick={open}>Добавить участника</Button>
          )}
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Логин</Table.Th>
                <Table.Th>Роль</Table.Th>
                <Table.Th>Дата добавления</Table.Th>
                {isLead && <Table.Th>Действия</Table.Th>}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {members.map((m) => (
                <Table.Tr key={m.id}>
                  <Table.Td>{m.username}</Table.Td>
                  <Table.Td><Badge>{m.role === 'moderator' ? 'Модератор' : 'Разработчик'}</Badge></Table.Td>
                  <Table.Td>{new Date(m.added_at).toLocaleDateString()}</Table.Td>
                  {isLead && (
                    <Table.Td>
                      <Button size="compact-xs" color="red" variant="outline" onClick={() => handleRemoveMember(m.id, m.username)}>Удалить</Button>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Modal opened={opened} onClose={close} title="Добавление участника">
            <Stack>
              <TextInput label="Пользователь" placeholder="Логин пользователя" value={newMemberUser} onChange={(e) => setNewMemberUser(e.currentTarget.value)} />
              <Select label="Роль" data={[{ value: 'moderator', label: 'Модератор' }, { value: 'developer', label: 'Разработчик' }]} value={newMemberRole} onChange={setNewMemberRole} />
              <Button fullWidth onClick={handleAddMember}>Добавить</Button>
            </Stack>
          </Modal>
        </Tabs.Panel>

        <Tabs.Panel value="incidents" pt="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Название</Table.Th>
                <Table.Th>Статус</Table.Th>
                <Table.Th>Дата создания</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {stubIncidents.map((inc) => (
                <Table.Tr key={inc.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/incidents/${inc.id}`)}>
                  <Table.Td>{inc.title}</Table.Td>
                  <Table.Td><Badge>{inc.status}</Badge></Table.Td>
                  <Table.Td>{new Date(inc.created_at).toLocaleDateString()}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
