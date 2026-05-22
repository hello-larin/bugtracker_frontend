import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Title, Text, Badge, Button, Group, Stack, Modal, MultiSelect, Select,
} from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  updateIncidentApiIncidentsIncidentIdPatch,
  assignIncidentApiIncidentsIncidentIdAssignPost,
  updatePriorityComplexityApiIncidentsIncidentIdPriorityPatch,
} from '../client';
import type {
  IncidentStatusEnum, IncidentPriorityEnum, IncidentComplexityEnum,
} from '../client';
import { getRole, getUserId } from '../lib/auth';

export default function IncidentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = getRole();
  const userId = getUserId();

  const [assignModal, setAssignModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDevelopers, setSelectedDevelopers] = useState<string[]>([]);
  const [newStatus, setNewStatus] = useState<string | null>(null);

  if (!userId) {
    navigate('/login');
    return null;
  }

  const updateMutation = useMutation({
    mutationFn: (status: IncidentStatusEnum) => updateIncidentApiIncidentsIncidentIdPatch({
      path: { incident_id: id! },
      body: {},
      throwOnError: true,
    }),
    onSuccess: () => notifications.show({ title: 'Успешно', message: 'Инцидент обновлён', color: 'green' }),
    onError: () => notifications.show({ title: 'Ошибка', message: 'Не удалось обновить', color: 'red' }),
  });

  const priorityMutation = useMutation({
    mutationFn: (data: { priority?: IncidentPriorityEnum | null; complexity?: IncidentComplexityEnum | null }) => updatePriorityComplexityApiIncidentsIncidentIdPriorityPatch({
      path: { incident_id: id! },
      body: data,
      throwOnError: true,
    }),
    onSuccess: () => notifications.show({ title: 'Успешно', message: 'Приоритет изменён', color: 'green' }),
    onError: () => notifications.show({ title: 'Ошибка', message: 'Не удалось изменить приоритет', color: 'red' }),
  });

  const assignMutation = useMutation({
    mutationFn: () => assignIncidentApiIncidentsIncidentIdAssignPost({
      path: { incident_id: id! },
      body: { microservice_ids: selectedServices, developer_ids: selectedDevelopers },
      throwOnError: true,
    }),
    onSuccess: () => {
      notifications.show({ title: 'Успешно', message: 'Инцидент распределён', color: 'green' });
      setAssignModal(false);
    },
    onError: () => notifications.show({ title: 'Ошибка', message: 'Не удалось распределить', color: 'red' }),
  });

  const isModerator = role === 'moderator';

  return (
    <Container size="lg" py="xl">
      <Paper withBorder shadow="sm" p="xl" radius="md" mb="lg">
        <Stack gap="sm">
          <Group>
            <Title order={3}>Инцидент #{id?.slice(0, 8)}</Title>
            <Badge size="lg">new</Badge>
          </Group>
          <Text size="sm" c="dimmed">ID: {id}</Text>

          {isModerator && (
            <>
              <Select
                label="Статус"
                data={['new', 'in_progress', 'resolved', 'closed', 'reopened']}
                value={newStatus}
                onChange={(v) => {
                  if (v) {
                    setNewStatus(v);
                    updateMutation.mutate(v as IncidentStatusEnum);
                  }
                }}
                w={200}
              />
              <Group>
                <Select
                  label="Приоритет"
                  data={['low', 'medium', 'high', 'critical']}
                  onChange={(v) => priorityMutation.mutate({ priority: v as IncidentPriorityEnum | null })}
                  w={160}
                />
                <Select
                  label="Сложность"
                  data={['easy', 'medium', 'hard']}
                  onChange={(v) => priorityMutation.mutate({ complexity: v as IncidentComplexityEnum | null })}
                  w={160}
                />
              </Group>
              <Button onClick={() => setAssignModal(true)}>Распределить</Button>
            </>
          )}
        </Stack>
      </Paper>

      <Modal opened={assignModal} onClose={() => setAssignModal(false)} title="Распределение инцидента" size="lg">
        <MultiSelect
          label="Микросервисы (ID)"
          data={[]}
          value={selectedServices}
          onChange={setSelectedServices}
          searchable
        />
        <MultiSelect
          label="Разработчики (ID)"
          data={[]}
          value={selectedDevelopers}
          onChange={setSelectedDevelopers}
          searchable
          mt="md"
        />
        <Button fullWidth mt="lg" onClick={() => assignMutation.mutate()} loading={assignMutation.isPending}>
          Сохранить
        </Button>
      </Modal>
    </Container>
  );
}
