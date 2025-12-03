'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SummarizationTask {
  request_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type?: 'text' | 'video' | 'webpage';
  summary?: string;
  original_length?: number;
  summary_length?: number;
  source_url?: string;
  created_at?: string;
  message?: string;
  error?: string;
  processing_time?: number; // время обработки в секундах
  started_at?: string; // когда началась обработка
}

interface SummarizationContextType {
  tasks: Record<string, SummarizationTask>;
  currentTaskId: string | null;
  isProcessing: boolean;
  
  startSummarization: (
    type: 'text' | 'video' | 'webpage', 
    content: string, 
    userId?: string
  ) => Promise<string>;
  
  getTaskStatus: (taskId: string) => SummarizationTask | undefined;
  clearTask: (taskId: string) => void;
  clearAllTasks: () => void;
}

const SummarizationContext = createContext<SummarizationContextType | undefined>(undefined);

export const useSummarization = () => {
  const context = useContext(SummarizationContext);
  if (!context) {
    throw new Error('useSummarization must be used within SummarizationProvider');
  }
  return context;
};

interface SummarizationProviderProps {
  children: ReactNode;
}

export const SummarizationProvider: React.FC<SummarizationProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Record<string, SummarizationTask>>({});
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const pollingIntervalsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const router = useRouter();

  // Функция для запуска суммаризации
  const startSummarization = useCallback(async (
    type: 'text' | 'video' | 'webpage',
    content: string,
    userId: string = 'anonymous'
  ): Promise<string> => {
    try {
      console.log('Отправка запроса на суммаризацию:', { type, content: content.substring(0, 50) + '...' });
      
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          [type === 'text' ? 'text' : 'url']: content,
          user_id: userId
        }),
      });

      console.log('Получен ответ:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { detail: `HTTP error! status: ${response.status}` };
        }
        
        // Создаем задачу с ошибкой
        const errorTaskId = `error-${Date.now()}`;
        const errorTask: SummarizationTask = {
          request_id: errorTaskId,
          status: 'failed',
          type,
          error: errorData.detail || errorData.error || `HTTP error! status: ${response.status}`,
          message: 'Ошибка при создании задачи'
        };
        
        setTasks(prev => ({ ...prev, [errorTaskId]: errorTask }));
        setCurrentTaskId(errorTaskId);
        
        throw new Error(errorTask.error);
      }

      const data = await response.json();
      console.log('Данные ответа:', data);
      
      const newTask: SummarizationTask = {
        request_id: data.request_id,
        status: 'pending',
        type,
        message: data.message || 'Задача создана'
      };

      // Сохраняем задачу
      setTasks(prev => ({ ...prev, [data.request_id]: newTask }));
      setCurrentTaskId(data.request_id);

      // Начинаем опрос статуса
      startPolling(data.request_id);

      return data.request_id;

    } catch (error: any) {
      console.error('Error starting summarization:', error);
      throw error;
    }
  }, []);

  // Функция для опроса статуса
const pollTaskStatus = useCallback(async (taskId: string) => {
  try {
    console.log('Проверка статуса задачи:', taskId);
    
    const response = await fetch(`/api/summarize/${taskId}/status`);
    
    if (!response.ok) {
      console.warn('Ошибка при проверке статуса:', response.status);
      return;
    }

    const data = await response.json();
    
    // Рассчитываем время обработки
    const now = new Date();
    const task = tasks[taskId];
    let processing_time = 0;
    
    if (task && task.started_at) {
      const started = new Date(task.started_at);
      processing_time = Math.round((now.getTime() - started.getTime()) / 1000);
    }
    
    setTasks(prev => ({
      ...prev,
      [taskId]: { 
        ...prev[taskId], 
        ...data,
        processing_time: processing_time || data.processing_time || 0
      }
    }));

    // Если задача завершена, перенаправляем
    if (data.status === 'completed' && currentTaskId === taskId) {
      stopPolling(taskId);
      router.push(`/summarize?taskId=${taskId}`);
    }

    if (data.status === 'failed') {
      stopPolling(taskId);
    }

  } catch (error) {
    console.error('Error polling task status:', error);
  }
}, [currentTaskId, router, tasks]);

  // Запуск периодического опроса
const startPolling = useCallback((taskId: string) => {
  // Останавливаем предыдущий интервал, если есть
  if (pollingIntervalsRef.current[taskId]) {
    clearInterval(pollingIntervalsRef.current[taskId]);
    delete pollingIntervalsRef.current[taskId];
  }

    // Опрос каждые 5 секунд (как указано в задании)
    const interval = setInterval(() => pollTaskStatus(taskId), 5000);
    
    // Первый запрос сразу
    pollTaskStatus(taskId);
    
    pollingIntervalsRef.current[taskId] = interval;
  }, [pollTaskStatus]);

  // Остановка опроса
  const stopPolling = useCallback((taskId: string) => {
    if (pollingIntervalsRef.current[taskId]) {
      clearInterval(pollingIntervalsRef.current[taskId]);
      delete pollingIntervalsRef.current[taskId];
    }
  }, []);

  // Получение статуса задачи
  const getTaskStatus = useCallback((taskId: string) => {
    return tasks[taskId];
  }, [tasks]);

  // Очистка задачи
  const clearTask = useCallback((taskId: string) => {
    stopPolling(taskId);
    setTasks(prev => {
      const newTasks = { ...prev };
      delete newTasks[taskId];
      return newTasks;
    });
    if (currentTaskId === taskId) {
      setCurrentTaskId(null);
    }
  }, [currentTaskId, stopPolling]);

  // Очистка всех задач
  const clearAllTasks = useCallback(() => {
    Object.keys(pollingIntervalsRef.current).forEach(stopPolling);
    setTasks({});
    setCurrentTaskId(null);
  }, [stopPolling]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      clearAllTasks();
    };
  }, [clearAllTasks]);

  const value: SummarizationContextType = {
    tasks,
    currentTaskId,
    isProcessing: currentTaskId !== null && tasks[currentTaskId]?.status === 'processing',
    startSummarization,
    getTaskStatus,
    clearTask,
    clearAllTasks
  };

  return (
    <SummarizationContext.Provider value={value}>
      {children}
    </SummarizationContext.Provider>
  );
};