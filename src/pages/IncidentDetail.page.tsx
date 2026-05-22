import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Group, Modal, Select, Stack, Table, Tabs, Text, Textarea, Title, MultiSelect } from '@mantine/core';
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

const stubIncident = {
  id: '1',
  title: 'Ошибка авторизации',
  status: 'new',
  author: 'ivanov',
  created_at: '2026-05-10T10:00:00Z',
  description: 'При попытке войти в систему с правильными данными происходит перенаправление на страницу входа.',
  steps: '1. Открыть страницу входа\n2. Ввести логин и пароль\n3. Нажать "Войти"\n4. Наблюдать перенаправление обратно на страницу входа',
  priority: 'high',
  deadline: '2026-06-01',
  microservices: ['API Gateway'],
  developers: ['petrov', 'sidorov'],
};

const stubComments = [
  { id: '1', author: 'petrov', text: 'Проверяю, возможно проблема в сессионном middleware', time: '2026-05-11T09:00:00Z' },
  { id: '2', author: 'ivanov', text: 'Ок, дайте знать если нужна дополнительная информация', time: '2026-05-11T10:00:00Z' },
];

const stubHistory = [
  { id: '1', time: '2026-05-10T10:00:00Z', user: 'ivanov', field: 'Статус', old_value: '-', new_value: 'Новый' },
  { id: '2', time: '2026-05-11T09:00:00Z', user: 'moderator', field: 'Приоритет', old_value: '-', new_value: 'Высокий' },
];

const statuses = ['new', 'assigned', 'in_progress', 'fixed', 'closed'];

const priorityLabels: Record<string, string> = { low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический' };
const statusLabels: Record<string, string> = { new: 'Новый', assigned: 'Назначен', in_progress: 'В работе', fixed: 'Исправлен', closed: 'Закрыт' };

export function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const role = currentUser?.role || 'user';
  const isModerator = role === 'moderator' || role === 'lead';
  const isAuthor = true;

  const [status, setStatus] = useState(stubIncident.status);
  const [comments, setComments] = useState(stubComments);
  const [newComment, setNewComment] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedMs, setSelectedMs] = useState<string[]>([]);
  const [selectedDevs, setSelectedDevs] = useState<string[]>([]);

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: String(Date.now()),
      author: currentUser?.nickname || 'user',
      text: newComment,
      time: new Date().toISOString(),
    };
    setComments((prev) => [comment, ...prev]);
    setNewComment('');
    notifications.show({ title: 'Комментарий добавлен', message: '', color: 'green' });
  };

  const handleStatusChange = (val: string | null) => {
    if (val) {
      setStatus(val);
      notifications.show({ title: 'Статус изменён', message: `Новый статус: ${statusLabels[val] || val}`, color: 'green' });
    }
  };

  const handleDistribute = () => {
    close();
    notifications.show({ title: 'Успех', message: 'Инцидент распределён', color: 'green' });
  };

  const handleVerify = (action: 'accept' | 'reopen') => {
    const msg = action === 'accept' ? 'Исправление принято' : 'Инцидент возвращён в работу';
    notifications.show({ title: 'Успех', message: msg, color: 'green' });
    setStatus(action === 'accept' ? 'closed' : 'in_progress');
  };

  return (
    <Stack>
      <Group>
        <Title order={3}>{stubIncident.title}</Title>
        <Badge size="lg" color={status === 'new' ? 'blue' : status === 'fixed' ? 'yellow' : status === 'closed' ? 'green' : 'orange'}>
          {statusLabels[status] || status}
        </Badge>
        {isModerator && (
          <Select data={statuses.map((s) => ({ value: s, label: statusLabels[s] || s }))} value={status} onChange={handleStatusChange} w={160} />
        )}
      </Group>

      <Text size="sm" c="dimmed">Автор: {stubIncident.author} | Создан: {new Date(stubIncident.created_at).toLocaleDateString()}</Text>

      <Card withBorder p="md">
        <Text fw={600}>Описание</Text>
        <Text>{stubIncident.description}</Text>
      </Card>

      <Card withBorder p="md">
        <Text fw={600}>Шаги для воспроизведения</Text>
        <Text style={{ whiteSpace: 'pre-line' }}>{stubIncident.steps}</Text>
      </Card>

      {isModerator && (
        <Card withBorder p="md">
          <Group>
            <div>
              <Text fw={600}>Приоритет</Text>
              <Badge color={stubIncident.priority === 'high' ? 'red' : 'yellow'}>{priorityLabels[stubIncident.priority] || stubIncident.priority}</Badge>
            </div>
            <div>
              <Text fw={600}>Дедлайн</Text>
              <Text>{stubIncident.deadline}</Text>
            </div>
            <Button variant="outline" ml="auto">Изменить</Button>
          </Group>
        </Card>
      )}

      {isModerator && (
        <Card withBorder p="md">
          <Text fw={600} mb="sm">Связанные микросервисы</Text>
          {stubIncident.microservices.map((ms) => <Badge key={ms} mr="xs">{ms}</Badge>)}
          <Text fw={600} mt="sm" mb="sm">Назначенные разработчики</Text>
          {stubIncident.developers.map((d) => <Badge key={d} mr="xs" color="teal">{d}</Badge>)}
        </Card>
      )}

      {isModerator && status === 'new' && (
        <Group>
          <Button onClick={open}>Распределить</Button>
        </Group>
      )}

      {isAuthor && status === 'fixed' && (
        <Group>
          <Button color="green" onClick={() => handleVerify('accept')}>Принять исправление</Button>
          <Button color="orange" onClick={() => handleVerify('reopen')}>Вернуть в работу</Button>
        </Group>
      )}

      <Modal opened={opened} onClose={close} title="Распределение инцидента">
        <Stack>
          <MultiSelect label="Микросервисы" data={['API Gateway', 'User Service', 'Payment Service']} value={selectedMs} onChange={setSelectedMs} />
          <MultiSelect label="Разработчики" data={['petrov', 'sidorov', 'ivanova']} value={selectedDevs} onChange={setSelectedDevs} />
          <Button fullWidth onClick={handleDistribute}>Сохранить</Button>
        </Stack>
      </Modal>

      <Tabs defaultValue="comments">
        <Tabs.List>
          <Tabs.Tab value="comments">Комментарии</Tabs.Tab>
          <Tabs.Tab value="history">История изменений</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="comments" pt="md">
          <Group mb="md">
            <Textarea placeholder="Напишите комментарий..." value={newComment} onChange={(e) => setNewComment(e.currentTarget.value)} style={{ flex: 1 }} minRows={2} />
            <Button onClick={handleSendComment}>Отправить</Button>
          </Group>
          {comments.map((c) => (
            <Card key={c.id} withBorder p="sm" mb="sm">
              <Group>
                <Text fw={600} size="sm">{c.author}</Text>
                <Text size="xs" c="dimmed">{new Date(c.time).toLocaleString()}</Text>
              </Group>
              <Text size="sm" mt={4}>{c.text}</Text>
            </Card>
          ))}
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Дата</Table.Th>
                <Table.Th>Пользователь</Table.Th>
                <Table.Th>Поле</Table.Th>
                <Table.Th>Старое значение</Table.Th>
                <Table.Th>Новое значение</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {stubHistory.map((h) => (
                <Table.Tr key={h.id}>
                  <Table.Td>{new Date(h.time).toLocaleString()}</Table.Td>
                  <Table.Td>{h.user}</Table.Td>
                  <Table.Td>{h.field}</Table.Td>
                  <Table.Td>{h.old_value}</Table.Td>
                  <Table.Td>{h.new_value}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
