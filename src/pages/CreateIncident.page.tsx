import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Group, Stack, TextInput, Textarea, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export function CreateIncidentPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      notifications.show({ title: 'Ошибка', message: 'Название обязательно', color: 'red' });
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    notifications.show({ title: 'Успех', message: 'Инцидент создан', color: 'green' });
    setSubmitting(false);
    navigate('/profile');
  };

  return (
    <Stack maw={600}>
      <Title order={3}>Создание инцидента</Title>
      <TextInput label="Название" placeholder="Краткое описание проблемы" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required />
      <Textarea label="Описание" placeholder="Подробное описание" value={description} onChange={(e) => setDescription(e.currentTarget.value)} minRows={4} />
      <Textarea label="Шаги для воспроизведения" placeholder="1.\n2.\n3." value={steps} onChange={(e) => setSteps(e.currentTarget.value)} minRows={4} />
      <Group>
        <Button onClick={handleCreate} loading={submitting}>Создать</Button>
        <Button variant="default" onClick={() => navigate('/profile')}>Отмена</Button>
      </Group>
    </Stack>
  );
}
