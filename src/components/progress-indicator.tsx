'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Download, FileText, Globe, Loader2, Mic, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProgressIndicatorProps {
  taskId: string;
  type: 'video' | 'text' | 'webpage';
  onComplete?: () => void;
}

// Определяем этапы для каждого типа задачи
const STAGE_CONFIG = {
  video: [
    { id: 'waiting', label: 'В очереди', icon: Clock, description: 'Задача ожидает обработки' },
    { id: 'downloading', label: 'Скачивание видео', icon: Download, description: 'Скачиваем видеофайл' },
    { id: 'extracting', label: 'Извлечение аудио', icon: Mic, description: 'Извлекаем аудиодорожку' },
    { id: 'transcribing', label: 'Транскрибация', icon: FileText, description: 'Преобразуем речь в текст' },
    { id: 'summarizing', label: 'Суммаризация', icon: Zap, description: 'Создаем краткое содержание' },
    { id: 'completed', label: 'Завершено', icon: CheckCircle, description: 'Обработка завершена' }
  ],
  text: [
    { id: 'waiting', label: 'В очереди', icon: Clock, description: 'Задача ожидает обработки' },
    { id: 'processing', label: 'Обработка текста', icon: FileText, description: 'Анализируем текст' },
    { id: 'summarizing', label: 'Суммаризация', icon: Zap, description: 'Создаем краткое содержание' },
    { id: 'completed', label: 'Завершено', icon: CheckCircle, description: 'Обработка завершена' }
  ],
  webpage: [
    { id: 'waiting', label: 'В очереди', icon: Clock, description: 'Задача ожидает обработки' },
    { id: 'downloading', label: 'Загрузка страницы', icon: Globe, description: 'Скачиваем веб-страницу' },
    { id: 'extracting', label: 'Извлечение текста', icon: FileText, description: 'Извлекаем текст со страницы' },
    { id: 'summarizing', label: 'Суммаризация', icon: Zap, description: 'Создаем краткое содержание' },
    { id: 'completed', label: 'Завершено', icon: CheckCircle, description: 'Обработка завершена' }
  ]
};

export function ProgressIndicator({ taskId, type, onComplete }: ProgressIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('waiting');
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPolling, setIsPolling] = useState(true);

  const stages = STAGE_CONFIG[type];
  const currentStageIndex = stages.findIndex(s => s.id === currentStage);

  // Функция для опроса прогресса
  const pollProgress = async () => {
    if (!taskId || !isPolling) return;

    try {
      const response = await fetch(`/api/summarize/${taskId}/status`);
      if (response.ok) {
        const data = await response.json();
        
        // Обновляем прогресс и стадию
        if (data.progress !== undefined) {
          setProgress(data.progress);
        }
        if (data.current_stage && data.current_stage !== 'unknown') {
          setCurrentStage(data.current_stage);
        }

        // Если задача завершена, останавливаем опрос
        if (data.status === 'completed' || data.status === 'failed') {
          setIsPolling(false);
          if (data.status === 'completed' && onComplete) {
            onComplete();
          }
        }
      }
    } catch (error) {
      console.error('Ошибка при опросе прогресса:', error);
    }
  };

  // Запускаем интервал опроса
  useEffect(() => {
    if (!taskId) return;

    // Первый запрос сразу
    pollProgress();

    // Затем каждые 3 секунды
    const interval = setInterval(() => {
      if (isPolling) {
        pollProgress();
        setElapsedTime(prev => prev + 3); // Увеличиваем прошедшее время
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [taskId, isPolling]);

  // Рассчитываем оценочное время
  useEffect(() => {
    if (type === 'video') {
      if (progress < 30) {
        setEstimatedTime('≈ 3-5 минут');
      } else if (progress < 60) {
        setEstimatedTime('≈ 2-3 минуты');
      } else if (progress < 90) {
        setEstimatedTime('≈ 1-2 минуты');
      } else {
        setEstimatedTime('< 1 минуты');
      }
    } else {
      if (progress < 50) {
        setEstimatedTime('≈ 1-2 минуты');
      } else if (progress < 90) {
        setEstimatedTime('< 1 минуты');
      } else {
        setEstimatedTime('Завершается...');
      }
    }
  }, [progress, type]);

  // Форматируем время
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className={`h-5 w-5 ${isPolling ? 'animate-spin' : ''}`} />
          {type === 'video' ? 'Обработка видео' : 
           type === 'webpage' ? 'Анализ веб-страницы' : 'Обработка текста'}
        </CardTitle>
        <CardDescription>
          ID задачи: {taskId.substring(0, 8)}...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Прогресс-бар */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Прошло: {formatTime(elapsedTime)}</span>
            <span>Осталось: {estimatedTime}</span>
          </div>
        </div>

        {/* Этапы обработки */}
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const isActive = stage.id === currentStage;
            const isCompleted = index < currentStageIndex;
            const Icon = stage.icon;

            return (
              <div 
                key={stage.id} 
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isActive ? 'bg-blue-50 border-blue-200' :
                  isCompleted ? 'bg-green-50 border-green-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-blue-100 text-blue-600' :
                  isCompleted ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      isActive ? 'text-blue-700' :
                      isCompleted ? 'text-green-700' :
                      'text-gray-600'
                    }`}>
                      {stage.label}
                    </span>
                    {isActive && (
                      <Badge variant="outline" className="text-xs">
                        Сейчас
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stage.description}
                  </p>
                </div>
                {isCompleted && (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Информационное сообщение */}
        {type === 'video' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-800 mb-1">
              ⚠️ Обработка видео занимает больше времени
            </p>
            <p className="text-xs text-amber-700">
              Видео проходит несколько этапов обработки. Пожалуйста, не закрывайте эту страницу.
              Вы можете перейти в историю и вернуться позже.
            </p>
          </div>
        )}

        {/* Статус */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isPolling ? (
              <>Статус обновляется автоматически. Можно продолжать работу в других вкладках.</>
            ) : (
              <>Обработка завершена. Обновите страницу для просмотра результата.</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}