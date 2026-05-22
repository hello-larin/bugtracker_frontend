import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Paper, PasswordInput, Stack, Tabs, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { loginApiAuthLoginPostMutation, registerApiAuthRegisterPostMutation } from '../client/@tanstack/react-query.gen';

export function AuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string | null>('login');

  const [loginNickname, setLoginNickname] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regNickname, setRegNickname] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const loginMutation = useMutation(loginApiAuthLoginPostMutation());
  const registerMutation = useMutation(registerApiAuthRegisterPostMutation());

  const handleLogin = () => {
    loginMutation.mutate(
      { body: { nickname: loginNickname, password: loginPassword } },
      {
        onSuccess: (data) => {
          localStorage.setItem('userId', data.user_id);
          localStorage.setItem('currentUser', JSON.stringify({ id: data.user_id, nickname: loginNickname, role: 'lead' }));
          notifications.show({ title: 'Успех', message: data.message || 'Вход выполнен', color: 'green' });
          navigate('/profile');
        },
        onError: () => {
          notifications.show({ title: 'Ошибка', message: 'Неверный логин или пароль', color: 'red' });
        },
      }
    );
  };

  const handleRegister = () => {
    if (regPassword !== regConfirmPassword) {
      notifications.show({ title: 'Ошибка', message: 'Пароли не совпадают', color: 'red' });
      return;
    }
    registerMutation.mutate(
      { body: { nickname: regNickname, password: regPassword } },
      {
        onSuccess: (data) => {
          localStorage.setItem('userId', data.user_id);
          localStorage.setItem('currentUser', JSON.stringify({ id: data.user_id, nickname: data.username, role: 'user' }));
          notifications.show({ title: 'Успех', message: 'Регистрация выполнена', color: 'green' });
          navigate('/profile');
        },
        onError: () => {
          notifications.show({ title: 'Ошибка', message: 'Ошибка регистрации', color: 'red' });
        },
      }
    );
  };

  return (
    <Container size={420} my={80}>
      <Title ta="center" mb="lg">BugTracker</Title>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List grow>
            <Tabs.Tab value="login">Вход</Tabs.Tab>
            <Tabs.Tab value="register">Регистрация</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="login" pt="xl">
            <Stack>
              <TextInput label="Логин" placeholder="Ваш логин" value={loginNickname} onChange={(e) => setLoginNickname(e.currentTarget.value)} required />
              <PasswordInput label="Пароль" placeholder="Ваш пароль" value={loginPassword} onChange={(e) => setLoginPassword(e.currentTarget.value)} required />
              <Button fullWidth onClick={handleLogin} loading={loginMutation.isPending}>Войти</Button>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="register" pt="xl">
            <Stack>
              <TextInput label="Логин" placeholder="Придумайте логин" value={regNickname} onChange={(e) => setRegNickname(e.currentTarget.value)} required />
              <PasswordInput label="Пароль" placeholder="Придумайте пароль" value={regPassword} onChange={(e) => setRegPassword(e.currentTarget.value)} required />
              <PasswordInput label="Подтверждение пароля" placeholder="Повторите пароль" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.currentTarget.value)} required />
              <Button fullWidth onClick={handleRegister} loading={registerMutation.isPending}>Зарегистрироваться</Button>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
}
