import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Avatar, Tabs, Table, Button, Group, Text, Title,
  Badge, ActionIcon, Loader, Modal, TextInput,
} from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  getNewIncidentsForModerationApiModeratorIncidentsGet,
  searchMicroservicesApiMicroservicesGet,
  createMicroserviceApiMicroservicesPost,
  deleteMicroserviceApiMicroservicesMicroserviceIdDelete,
  updateMicroserviceApiMicroservicesMicroserviceIdPatch,
  addToFavoritesApiMicroservicesMicroserviceIdFavoritePost,
  removeFromFavoritesApiMicroservicesMicroserviceIdFavoriteDelete,
} from '../client';
import type { IncidentSearchResponse, MicroserviceSearchResponse, IncidentListResponse, MicroserviceListResponse } from '../client/types.gen';
import { clearAuth, getUserId, getUsername, getRole } from '../lib/auth';

export default function ProfilePage() {
  const navigate = useNavigate();
  const userId = getUserId();
  const username = getUsername();
  const role = getRole();

  useEffect(() => {
    if (!userId) navigate('/login');
  }, [userId, navigate]);

  const [createOpen, setCreateOpen] = useState(false);
  const [microserviceName, setMicroserviceName] = useState('');
  const [microserviceDesc, setMicroserviceDesc] = useState('');
  const [editModal, setEditModal] = useState<{ id: string; name: string; description: string } | null>(null);

  const newIncidentsQuery = useQuery({
    queryKey: ['newIncidents'],
    queryFn: () => getNewIncidentsForModerationApiModeratorIncidentsGet({ throwOnError: true }).then((r) => r.data),
    enabled: role === 'moderator',
  });

  const microservicesQuery = useQuery({
    queryKey: ['microservices'],
    queryFn: () => searchMicroservicesApiMicroservicesGet({ throwOnError: true }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => createMicroserviceApiMicroservicesPost({
      body: { name: microserviceName, description: microserviceDesc || null },
      throwOnError: true,
    }),
    onSuccess: () => {
      notifications.show({ title: 'Успешно', message: 'Микросервис создан', color: 'green' });
      setCreateOpen(false);
      setMicroserviceName('');
      setMicroserviceDesc('');
      microservicesQuery.refetch();
    },
    onError: () => notifications.show({ title: 'Ошибка', message: 'Не удалось создать микросервис', color: 'red' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMicroserviceApiMicroservicesMicroserviceIdDelete({ path: { microservice_id: id }, throwOnError: true }),
    onSuccess: () => {
      notifications.show({ title: 'Успешно', message: 'Микросервис удалён', color: 'green' });
      microservicesQuery.refetch();
    },
    onError: () => notifications.show({ title: 'Ошибка', message: 'Не удалось удалить', color: 'red' }),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editModal) throw new Error('Нет данных');
      return updateMicroserviceApiMicroservicesMicroserviceIdPatch({
        path: { microservice_id: editModal.id },
        body: { name: editModal.name, description: editModal.description || null },
        throwOnError: true,
      });
    },
    onSuccess: () => {
      notifications.show({ title: 'Успешно', message: 'Микросервис обновлён', color: 'green' });
      setEditModal(null);
      microservicesQuery.refetch();
    },
    onError: () => notifications.show({ title: 'Ошибка', message: 'Не удалось обновить', color: 'red' }),
  });

  const favMutation = useMutation({
    mutationFn: async ({ id, isFav }: { id: string; isFav: boolean }) => {
      if (isFav) {
        await removeFromFavoritesApiMicroservicesMicroserviceIdFavoriteDelete({ path: { microservice_id: id }, throwOnError: true });
      } else {
        await addToFavoritesApiMicroservicesMicroserviceIdFavoritePost({ path: { microservice_id: id }, throwOnError: true });
      }
    },
    onSuccess: () => microservicesQuery.refetch(),
    onError: () => notifications.show({ title: 'Ошибка', message: 'Не удалось', color: 'red' }),
  });

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (!userId) return null;

  const incidents = newIncidentsQuery.data as IncidentListResponse | undefined;
  const microservices = microservicesQuery.data as MicroserviceListResponse | undefined;

  return (
    <Container size="lg" py="xl">
      <Paper withBorder shadow="sm" p="xl" radius="md" mb="lg">
        <Group>
          <Avatar size={80} radius={80} color="blue">{username?.[0]?.toUpperCase()}</Avatar>
          <div>
            <Title order={3}>{username}</Title>
            <Text size="sm" c="dimmed">Роль: {role}</Text>
          </div>
          <Group ml="auto">
            {role === 'lead' && <Button onClick={() => setCreateOpen(true)}>Создать микросервис</Button>}
            <Button variant="outline" onClick={handleLogout}>Выйти</Button>
          </Group>
        </Group>
      </Paper>

      <Tabs defaultValue={role === 'moderator' ? 'new-incidents' : 'microservices'}>
        <Tabs.List>
          {role === 'moderator' && <Tabs.Tab value="new-incidents">Новые инциденты</Tabs.Tab>}
          {(role === 'developer' || role === 'lead') && <Tabs.Tab value="microservices">Мои микросервисы</Tabs.Tab>}
        </Tabs.List>

        {role === 'moderator' && (
          <Tabs.Panel value="new-incidents" pt="md">
            {newIncidentsQuery.isLoading ? <Loader /> : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Название</Table.Th>
                    <Table.Th>Статус</Table.Th>
                    <Table.Th>Дата создания</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {incidents?.items?.map((inc) => (
                    <Table.Tr key={inc.incident_id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/incidents/${inc.incident_id}`)}>
                      <Table.Td>{inc.title}</Table.Td>
                      <Table.Td><Badge>{inc.status}</Badge></Table.Td>
                      <Table.Td>{new Date(inc.created_at).toLocaleDateString()}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>
        )}

        {(role === 'developer' || role === 'lead') && (
          <Tabs.Panel value="microservices" pt="md">
            {microservicesQuery.isLoading ? <Loader /> : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Название</Table.Th>
                    <Table.Th>Статус</Table.Th>
                    <Table.Th>Избранное</Table.Th>
                    {role === 'lead' && <Table.Th>Действия</Table.Th>}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {microservices?.microservices?.map((ms) => (
                    <Table.Tr key={ms.microservice_id}>
                      <Table.Td style={{ cursor: 'pointer' }} onClick={() => navigate(`/microservices/${ms.microservice_id}`)}>
                        {ms.name}
                      </Table.Td>
                      <Table.Td><Badge color={ms.status === 'active' ? 'green' : 'gray'}>{ms.status}</Badge></Table.Td>
                      <Table.Td>
                        <ActionIcon variant="transparent" color="yellow" onClick={() => favMutation.mutate({ id: ms.microservice_id, isFav: false })}>☆</ActionIcon>
                      </Table.Td>
                      {role === 'lead' && (
                        <Table.Td>
                          <Group gap="xs">
                            <Button size="xs" variant="outline" onClick={() => setEditModal({ id: ms.microservice_id, name: ms.name, description: ms.description || '' })}>Изменить</Button>
                            <Button size="xs" color="red" onClick={() => deleteMutation.mutate(ms.microservice_id)}>Удалить</Button>
                          </Group>
                        </Table.Td>
                      )}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>
        )}
      </Tabs>

      <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="Создать микросервис">
        <TextInput label="Название" value={microserviceName} onChange={(e) => setMicroserviceName(e.currentTarget.value)} required />
        <TextInput label="Описание" value={microserviceDesc} onChange={(e) => setMicroserviceDesc(e.currentTarget.value)} mt="md" />
        <Button fullWidth mt="lg" onClick={() => createMutation.mutate()} loading={createMutation.isPending}>Создать</Button>
      </Modal>

      <Modal opened={!!editModal} onClose={() => setEditModal(null)} title="Изменить микросервис">
        <TextInput label="Название" value={editModal?.name || ''} onChange={(e) => setEditModal((p) => p ? { ...p, name: e.currentTarget.value } : null)} required />
        <TextInput label="Описание" value={editModal?.description || ''} onChange={(e) => setEditModal((p) => p ? { ...p, description: e.currentTarget.value } : null)} mt="md" />
        <Button fullWidth mt="lg" onClick={() => updateMutation.mutate()} loading={updateMutation.isPending}>Сохранить</Button>
      </Modal>
    </Container>
  );
}
