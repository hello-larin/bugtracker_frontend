// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 секунд данные считаются свежими
      retry: 1,             // 1 повтор при ошибке
      refetchOnWindowFocus: false, // Не обновлять при возврате в окно
    },
  },
});