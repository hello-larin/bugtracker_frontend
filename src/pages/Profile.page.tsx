import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Card, Group, Stack, Table, Tabs, Text, Title, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation } from '@tanstack/react-query';
import { searchMicroservicesApiMicroservicesGetQueryKey, searchMicroservicesApiMicroservicesGetOptions, addToFavoritesApiMicroservicesMicroserviceIdFavoritePostMutation, removeFromFavoritesApiMicroservicesMicroserviceIdFavoriteDeleteMutation, deleteMicroserviceApiMicroservicesMicroserviceIdDeleteMutation, updateMicroserviceApiMicroservicesMicroserviceIdPatchMutation } from '../client/@tanstack/react-query.gen';

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const stubMyIncidents = [
  { id: '1', title: 'Ошибка авторизации', status: 'new', created_at: '2026-05-10T10:00:00Z' },
  { id: '2', title: 'Не загружается аватар', status: 'in_progress', created_at: '2026-05-12T14:30:00Z' },
  { id: '3', title: 'Сломан поиск', status: 'fixed', created_at: '2026-05-15T09:00:00Z' },
];

const stubNewIncidents = [
  { id: '4', title: 'Баг в ленте новостей', author: 'ivanov', created_at: '2026-05-18T08:00:00Z' },
  { id: '5', title: 'Не работает кнопка отправки', author: 'petrov', created_at: '2026-05-19T12:00:00Z' },
];

const stubNotifications = [
  { id: '1', text: 'Инцидент #3 переведён в статус "Исправлен"', time: '2026-05-20T10:00:00Z', incident_id: '3', read: false },
  { id: '2', text: 'Вас назначили на инцидент #2', time: '2026-05-19T15:00:00Z', incident_id: '2', read: false },
  { id: '3', text: 'Инцидент #1 закрыт', time: '2026-05-18T09:00:00Z', incident_id: '1', read: true },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const role = currentUser?.role || 'user';

  const { data: microservicesData } = useQuery(searchMicroservicesApiMicroservicesGetOptions());

  const addFavorite = useMutation(addToFavoritesApiMicroservicesMicroserviceIdFavoritePostMutation());
  const removeFavorite = useMutation(removeFromFavoritesApiMicroservicesMicroserviceIdFavoriteDeleteMutation());
  const deleteMs = useMutation(deleteMicroserviceApiMicroservicesMicroserviceIdDeleteMutation());
  const archiveMs = useMutation(updateMicroserviceApiMicroservicesMicroserviceIdPatchMutation());

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
    navigate('/auth');
  };

  const handleDeleteAccount = () =>
    modals.openConfirmModal({
      title: 'Удаление аккаунта',
      children: <Text size="sm">Вы уверены, что хотите удалить аккаунт? Это действие необратимо.</Text>,
      labels: { confirm: 'Удалить', cancel: 'Отмена' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        notifications.show({ title: 'Аккаунт удалён', message: 'До свидания', color: 'red' });
        handleLogout();
      },
    });

  const handleDeleteMicroservice = (id: string, name: string) =>
    modals.openConfirmModal({
      title: 'Удаление микросервиса',
      children: <Text size="sm">Удалить микросервис «{name}»?</Text>,
      labels: { confirm: 'Удалить', cancel: 'Отмена' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteMs.mutate({ path: { microservice_id: id } });
        notifications.show({ title: 'Микросервис удалён', message: `«${name}» удалён`, color: 'green' });
      },
    });

  const handleArchiveMicroservice = (id: string, name: string) => {
    archiveMs.mutate({ path: { microservice_id: id }, body: { status: 'inactive' } });
    notifications.show({ title: 'Микросервис архивирован', message: `«${name}» архивирован`, color: 'green' });
  };

  const isLead = role === 'lead';
  const isModerator = role === 'moderator' || role === 'lead';
  const isDevOrAdmin = role === 'developer' || role === 'admin' || role === 'lead';

  const handleMarkAllRead = () => {
    notifications.show({ title: 'Успех', message: 'Все уведомления отмечены прочитанными', color: 'green' });
  };

  const microservices = microservicesData?.microservices ?? [];

  const tabs = useMemo(() => {
    const items = [
      { value: 'my-incidents', label: 'Мои инциденты' },
    ];
    if (isModerator) items.push({ value: 'new-incidents', label: 'Новые инциденты' });
    if (isDevOrAdmin) items.push({ value: 'my-microservices', label: 'Мои микросервисы' });
    items.push({ value: 'notifications', label: 'Уведомления' });
    return items;
  }, [isModerator, isDevOrAdmin]);

  return (
    <Stack>
      <Card withBorder p="lg">
        <Group>
          <Avatar size={80} color="blue">{currentUser?.nickname?.[0]?.toUpperCase() || 'U'}</Avatar>
          <Stack gap={5}>
            <Text fw={700} size="xl">{currentUser?.nickname || 'Пользователь'}</Text>
            <Badge>{role === 'lead' ? 'Руководитель' : role === 'developer' ? 'Разработчик' : role === 'moderator' ? 'Модератор' : 'Пользователь'}</Badge>
            <Text size="sm" c="dimmed">Зарегистрирован: 01.01.2026</Text>
          </Stack>
          <Group ml="auto">
            <Button color="red" variant="outline" onClick={handleDeleteAccount}>Удалить аккаунт</Button>
            <Button variant="default" onClick={handleLogout}>Выйти</Button>
          </Group>
        </Group>
      </Card>

      <Tabs defaultValue="my-incidents">
        <Tabs.List>
          {tabs.map((t) => <Tabs.Tab key={t.value} value={t.value}>{t.label}</Tabs.Tab>)}
        </Tabs.List>

        <Tabs.Panel value="my-incidents" pt="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Название</Table.Th>
                <Table.Th>Статус</Table.Th>
                <Table.Th>Дата создания</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {stubMyIncidents.map((inc) => (
                <Table.Tr key={inc.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/incidents/${inc.id}`)}>
                  <Table.Td>{inc.title}</Table.Td>
                  <Table.Td><Badge>{inc.status}</Badge></Table.Td>
                  <Table.Td>{new Date(inc.created_at).toLocaleDateString()}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        {isModerator && (
          <Tabs.Panel value="new-incidents" pt="md">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Название</Table.Th>
                  <Table.Th>Автор</Table.Th>
                  <Table.Th>Дата создания</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {stubNewIncidents.map((inc) => (
                  <Table.Tr key={inc.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/incidents/${inc.id}`)}>
                    <Table.Td>{inc.title}</Table.Td>
                    <Table.Td>{inc.author}</Table.Td>
                    <Table.Td>{new Date(inc.created_at).toLocaleDateString()}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Tabs.Panel>
        )}

        {isDevOrAdmin && (
          <Tabs.Panel value="my-microservices" pt="md">
            {isLead && (
              <Button component={Link} to="/incidents/new" mb="md">
                Создать микросервис
              </Button>
            )}
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Название</Table.Th>
                  <Table.Th>Статус</Table.Th>
                  <Table.Th>Избранное</Table.Th>
                  {isLead && <Table.Th>Действия</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {microservices.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={isLead ? 4 : 3}>
                      <Text c="dimmed" ta="center" py="md">Нет микросервисов. Используется заглушка.</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : microservices.map((ms) => (
                  <Table.Tr key={ms.microservice_id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/microservices/${ms.microservice_id}`)}>
                    <Table.Td>{ms.name}</Table.Td>
                    <Table.Td><Badge color={ms.status === 'active' ? 'green' : 'gray'}>{ms.status === 'active' ? 'Активен' : 'Архивирован'}</Badge></Table.Td>
                    <Table.Td>
                      <Tooltip label="Добавить в избранное">
                        <Button
                          size="compact-xs"
                          variant="subtle"
                          onClick={(e) => { e.stopPropagation(); addFavorite.mutate({ path: { microservice_id: ms.microservice_id } }); }}
                        >
                          ★
                        </Button>
                      </Tooltip>
                    </Table.Td>
                    {isLead && (
                      <Table.Td>
                        <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                          <Button size="compact-xs" variant="outline" onClick={() => handleArchiveMicroservice(ms.microservice_id, ms.name)}>
                            {ms.status === 'active' ? 'Архивировать' : 'Активировать'}
                          </Button>
                          <Button size="compact-xs" color="red" variant="outline" onClick={() => handleDeleteMicroservice(ms.microservice_id, ms.name)}>
                            Удалить
                          </Button>
                        </Group>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
                {/* stub microservice for demo */}
                <Table.Tr style={{ cursor: 'pointer' }} onClick={() => navigate('/microservices/stub-1')}>
                  <Table.Td>API Gateway</Table.Td>
                  <Table.Td><Badge color="green">Активен</Badge></Table.Td>
                  <Table.Td>
                    <Button size="compact-xs" variant="subtle" onClick={(e) => { e.stopPropagation(); notifications.show({ title: 'Избранное', message: 'Добавлено в избранное', color: 'green' }); }}>★</Button>
                  </Table.Td>
                  {isLead && (
                    <Table.Td>
                      <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                        <Button size="compact-xs" variant="outline">Архивировать</Button>
                        <Button size="compact-xs" color="red" variant="outline">Удалить</Button>
                      </Group>
                    </Table.Td>
                  )}
                </Table.Tr>
                <Table.Tr style={{ cursor: 'pointer' }} onClick={() => navigate('/microservices/stub-2')}>
                  <Table.Td>User Service</Table.Td>
                  <Table.Td><Badge color="gray">Архивирован</Badge></Table.Td>
                  <Table.Td>
                    <Button size="compact-xs" variant="subtle">★</Button>
                  </Table.Td>
                  {isLead && (
                    <Table.Td>
                      <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                        <Button size="compact-xs" variant="outline">Активировать</Button>
                        <Button size="compact-xs" color="red" variant="outline">Удалить</Button>
                      </Group>
                    </Table.Td>
                  )}
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Tabs.Panel>
        )}

        <Tabs.Panel value="notifications" pt="md">
          <Group mb="md">
            <Button onClick={handleMarkAllRead}>Отметить все прочитанными</Button>
          </Group>
          <Stack>
            {stubNotifications
              .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
              .map((n) => (
                <Card
                  key={n.id}
                  withBorder
                  p="sm"
                  component={Link}
                  to={`/incidents/${n.incident_id}`}
                  style={{ textDecoration: 'none', fontWeight: n.read ? 'normal' : 'bold' }}
                >
                  <Text style={{ fontWeight: n.read ? 'normal' : 'bold' }}>{n.text}</Text>
                  <Text size="xs" c="dimmed">{new Date(n.time).toLocaleString()}</Text>
                </Card>
              ))}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
