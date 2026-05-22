import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Title, TextInput, Textarea, Button, Group } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { createIncidentApiIncidentsPost } from '../client';

export default function CreateIncidentPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await createIncidentApiIncidentsPost({
        body: { title, description: description || null, reproduction_steps: reproductionSteps || null },
        throwOnError: false,
      });
      if (error) throw new Error((error as { detail?: string }).detail || 'Ошибка создания');
      return data!;
    },
    onSuccess: (data) => {
      notifications.show({ title: 'Успешно', message: 'Инцидент создан', color: 'green' });
      navigate(`/incidents/${data.incident_id}`);
    },
    onError: (err: Error) => {
      notifications.show({ title: 'Ошибка', message: err.message, color: 'red' });
    },
  });

  return (
    <Container size={600} py="xl">
      <Paper withBorder shadow="sm" p="xl" radius="md">
        <Title order={3} mb="lg">Создание инцидента</Title>
        <TextInput
          label="Название"
          placeholder="Введите название инцидента"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />
        <Textarea
          label="Описание"
          placeholder="Опишите проблему"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          mt="md"
          minRows={3}
        />
        <Textarea
          label="Шаги для воспроизведения"
          placeholder="Опишите шаги для воспроизведения"
          value={reproductionSteps}
          onChange={(e) => setReproductionSteps(e.currentTarget.value)}
          mt="md"
          minRows={3}
        />
        <Group mt="xl">
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
            Создать
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Отмена
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}
