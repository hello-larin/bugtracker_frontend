import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Title, Text, Badge, Button, Group, Tabs,
  Table, Modal, TextInput,
} from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  updateMicroserviceApiMicroservicesMicroserviceIdPatch,
  createMemberApiMembersPost,
  removeMemberApiMembersMemberIdDelete,
} from '../client';
import { getRole, getUserId } from '../lib/auth';

export default function MicroservicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = getRole();
  const userId = getUserId();
  const isLead = role === 'lead';

  useEffect(() => {
    if (!userId) navigate('/login');
  }, [userId, navigate]);

  const [editOpened, setEditOpened] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [addMemberOpened, setAddMemberOpened] = useState(false);
  const [memberUserId, setMemberUserId] = useState('');

  const updateMutation = useMutation({
    mutationFn: () => updateMicroserviceApiMicroservicesMicroserviceIdPatch({
      path: { microservice_id: id! },
      body: { name: editName, description: editDesc || null },
      throwOnError: true,
    }),
    onSuccess: () => {
      notifications.show({ title: 'Успешно', message: 'Микросервис обновлён', color: 'green' });
      setEditOpened(false);
    },
    onError: () => notifications.show({ title: 'Ошибка', message: 'Не удалось обновить', color: 'red' }),
  });

  const addMemberMutation = useMutation({
    mutationFn: () => createMemberApiMembersPost({
      body: { user_id: memberUserId, microservice_id: id! },
      throwOnError: true,
    }),
    onSuccess: () => {
      notifications.show({ title: 'Успешно', message: 'Участник добавлен', color: 'green' });
      setAddMemberOpened(false);
      setMemberUserId('');
    },
    onError: () => notifications.show({ title: 'Ошибка', message: 'Не удалось добавить участника', color: 'red' }),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeMemberApiMembersMemberIdDelete({
      path: { member_id: memberId },
      throwOnError: true,
    }),
    onSuccess: () => notifications.show({ title: 'Успешно', message: 'Участник удалён', color: 'green' }),
    onError: () => notifications.show({ title: 'Ошибка', message: 'Не удалось удалить', color: 'red' }),
  });

  if (!userId) return null;

  return (
    <Container size="lg" py="xl">
      <Paper withBorder shadow="sm" p="xl" radius="md" mb="lg">
        <Group mb="md">
          <div>
            <Title order={3}>Микросервис</Title>
            <Text size="sm" c="dimmed">ID: {id}</Text>
          </div>
          {isLead && <Button ml="auto" onClick={() => { setEditName(''); setEditDesc(''); setEditOpened(true); }}>Изменить</Button>}
        </Group>
      </Paper>

      <Tabs defaultValue="team">
        <Tabs.List>
          <Tabs.Tab value="team">Команда</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="team" pt="md">
          {isLead && <Button mb="md" onClick={() => setAddMemberOpened(true)}>Добавить участника</Button>}
          <Text c="dimmed">Список участников доступен через API /api/members</Text>
        </Tabs.Panel>
      </Tabs>

      <Modal opened={editOpened} onClose={() => setEditOpened(false)} title="Изменить микросервис">
        <TextInput label="Название" value={editName} onChange={(e) => setEditName(e.currentTarget.value)} required />
        <TextInput label="Описание" value={editDesc} onChange={(e) => setEditDesc(e.currentTarget.value)} mt="md" />
        <Button fullWidth mt="lg" onClick={() => updateMutation.mutate()} loading={updateMutation.isPending}>Сохранить</Button>
      </Modal>

      <Modal opened={addMemberOpened} onClose={() => setAddMemberOpened(false)} title="Добавить участника">
        <TextInput label="ID пользователя" placeholder="Введите ID пользователя" value={memberUserId} onChange={(e) => setMemberUserId(e.currentTarget.value)} />
        <Button fullWidth mt="lg" onClick={() => addMemberMutation.mutate()} loading={addMemberMutation.isPending}>Добавить</Button>
      </Modal>
    </Container>
  );
}
