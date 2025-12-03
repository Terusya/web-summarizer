'use client';

import { useEffect, useState, useCallback } from 'react';

interface ProgressData {
  request_id: string;
  progress: number;
  stage: string;
  status: string;
  elapsed_time?: number;
  estimated_time_remaining?: number;
}

export function useProgressPolling(taskId: string | null, interval: number = 3000) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!taskId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/summarize/${taskId}/status`);
      
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
        setError(null);
      } else {
        setError('Не удалось получить прогресс задачи');
      }
    } catch (err) {
      console.error('Ошибка при опросе прогресса:', err);
      setError('Ошибка подключения к серверу');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  // Автоматический опрос
  useEffect(() => {
    if (!taskId) return;

    // Первый запрос сразу
    fetchProgress();

    // Затем по интервалу
    const intervalId = setInterval(fetchProgress, interval);

    return () => clearInterval(intervalId);
  }, [taskId, interval, fetchProgress]);

  return {
    progressData,
    isLoading,
    error,
    refetch: fetchProgress
  };
}