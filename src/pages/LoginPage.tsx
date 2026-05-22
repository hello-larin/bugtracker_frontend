import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Tabs, TextInput, PasswordInput, Button, Title } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { setToken, setUserId, setUsername, setRole } from '../lib/auth';

const BASE = 'http://localhost:8000';

function extractToken(res: Response): string | null {
  const auth = res.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return res.headers.get('X-Access-Token') || null;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string | null>('login');

  const [loginNickname, setLoginNickname] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regNickname, setRegNickname] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: loginNickname, password: loginPassword }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Ошибка входа');
      }
      const token = extractToken(res);
      if (token) setToken(token);
      const data = await res.json();
      if (data.user_id) setUserId(data.user_id);
      if (data.username) setUsername(data.username);
      if (data.role) setRole(data.role);
    },
    onSuccess: () => {
      notifications.show({ title: 'Успешно', message: 'Вход выполнен', color: 'green' });
      navigate('/profile');
    },
    onError: (err: Error) => {
      notifications.show({ title: 'Ошибка', message: err.message, color: 'red' });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (regPassword !== regConfirm) throw new Error('Пароли не совпадают');
      const res = await fetch(`${BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: regNickname, password: regPassword }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Ошибка регистрации');
      }
      const token = extractToken(res);
      if (token) setToken(token);
      const data = await res.json();
      if (data.user_id) setUserId(data.user_id);
      if (data.username) setUsername(data.username);
      if (data.role) setRole(data.role);
    },
    onSuccess: () => {
      notifications.show({ title: 'Успешно', message: 'Регистрация выполнена', color: 'green' });
      navigate('/profile');
    },
    onError: (err: Error) => {
      notifications.show({ title: 'Ошибка', message: err.message, color: 'red' });
    },
  });

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="lg">BugTracker</Title>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List grow mb="md">
            <Tabs.Tab value="login">Вход</Tabs.Tab>
            <Tabs.Tab value="register">Регистрация</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="login">
            <TextInput
              label="Логин"
              placeholder="Введите логин"
              value={loginNickname}
              onChange={(e) => setLoginNickname(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Пароль"
              placeholder="Введите пароль"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.currentTarget.value)}
              required
              mt="md"
            />
            <Button fullWidth mt="xl" onClick={() => loginMutation.mutate()} loading={loginMutation.isPending}>
              Войти
            </Button>
          </Tabs.Panel>

          <Tabs.Panel value="register">
            <TextInput
              label="Логин"
              placeholder="Введите логин"
              value={regNickname}
              onChange={(e) => setRegNickname(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Пароль"
              placeholder="Введите пароль"
              value={regPassword}
              onChange={(e) => setRegPassword(e.currentTarget.value)}
              required
              mt="md"
            />
            <PasswordInput
              label="Подтверждение пароля"
              placeholder="Повторите пароль"
              value={regConfirm}
              onChange={(e) => setRegConfirm(e.currentTarget.value)}
              required
              mt="md"
            />
            <Button fullWidth mt="xl" onClick={() => registerMutation.mutate()} loading={registerMutation.isPending}>
              Зарегистрироваться
            </Button>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
}
