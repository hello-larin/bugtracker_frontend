import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Title, Button, Modal, TextInput, Select, Group } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { createUserApiAdminUsersPost, deleteUserApiAdminUsersUserIdDelete } from '../client';
import { getRole, getUserId } from '../lib/auth';

export default function UsersPage() {
  const navigate = useNavigate();
  const userId = getUserId();
  const role = getRole();

  useEffect(() => {
    if (!userId || role !== 'lead') navigate('/profile');
  }, [userId, role, navigate]);

  const [createOpened, setCreateOpened] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [newRole, setNewRole] = useState<string | null>('developer');

  const createMutation = useMutation({
    mutationFn: () => createUserApiAdminUsersPost({
      body: { nickname: newNickname, password: 'changeme', role: newRole as 'developer' | 'moderator' },
      throwOnError: true,
    }),
    onSuccess: () => {
      notifications.show({ title: 'Успешно', message: 'Пользователь создан', color: 'green' });
      setCreateOpened(false);
      setNewNickname('');
    },
    onError: () => notifications.show({ title: 'Ошибка', message: 'Не удалось создать пользователя', color: 'red' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUserApiAdminUsersUserIdDelete({ path: { user_id: userId }, throwOnError: true }),
    onSuccess: () => notifications.show({ title: 'Успешно', message: 'Пользователь удалён', color: 'green' }),
    onError: () => notifications.show({ title: 'Ошибка', message: 'Не удалось удалить', color: 'red' }),
  });

  if (!userId || role !== 'lead') return null;

  return (
    <Container size="lg" py="xl">
      <Paper withBorder shadow="sm" p="xl" radius="md">
        <Group mb="md">
          <Title order={3}>Управление пользователями</Title>
          <Button ml="auto" onClick={() => setCreateOpened(true)}>Создать пользователя</Button>
        </Group>
      </Paper>

      <Modal opened={createOpened} onClose={() => setCreateOpened(false)} title="Создать пользователя">
        <TextInput label="Логин" placeholder="Введите логин" value={newNickname} onChange={(e) => setNewNickname(e.currentTarget.value)} required />
        <Select label="Роль" data={[{ value: 'developer', label: 'Developer' }, { value: 'moderator', label: 'Moderator' }]} value={newRole} onChange={setNewRole} mt="md" />
        <Button fullWidth mt="lg" onClick={() => createMutation.mutate()} loading={createMutation.isPending}>Создать</Button>
      </Modal>
    </Container>
  );
}
