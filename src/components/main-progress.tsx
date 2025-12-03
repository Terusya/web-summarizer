'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Video, FileText, Globe, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MainProgressProps {
  taskId: string | null;
  type: 'video' | 'text' | 'webpage' | null;
}

export function MainProgress({ taskId, type }: MainProgressProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Ожидание');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Опрос прогресса
  useEffect(() => {
    if (!taskId) return;

    const pollProgress = async () => {
      try {
        // Сначала пробуем получить прогресс
        const progressResponse = await fetch(`/api/summarize/${taskId}/progress`);
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setProgress(progressData.progress || 0);
          setStage(progressData.stage || 'Обработка');
          
          // Если задача завершена, останавливаем таймер
          if (progressData.status === 'completed' || progressData.status === 'failed') {
            return true;
          }
        }
        
        // Также проверяем статус
        const statusResponse = await fetch(`/api/summarize/${taskId}/status`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.status === 'completed' || statusData.status === 'failed') {
            return true;
          }
        }
        
        return false;
      } catch (error) {
        console.error('Ошибка при опросе:', error);
        return false;
      }
    };

    // Первый запрос
    pollProgress();

    // Интервал опроса
    const interval = setInterval(async () => {
      const shouldStop = await pollProgress();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 2000);

    // Таймер
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [taskId]);

  if (!taskId || !type) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'text':
        return <FileText className="h-5 w-5" />;
      case 'webpage':
        return <Globe className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeName = () => {
    switch (type) {
      case 'video':
        return 'видео';
      case 'text':
        return 'текста';
      case 'webpage':
        return 'веб-страницы';
      default:
        return 'контента';
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Обработка {getTypeName()}
        </CardTitle>
        <CardDescription>
          Следите за прогрессом обработки
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Тип и время */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-md">
              {getTypeIcon()}
            </div>
            <span className="font-medium capitalize">
              {type === 'webpage' ? 'Веб-страница' : type}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatTime(elapsedTime)}
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">{stage}</p>
        </div>

        {/* Индикаторы этапов */}
        <div className="grid grid-cols-5 gap-2">
          {[0, 25, 50, 75, 100].map((value) => (
            <div
              key={value}
              className={`h-1 rounded-full ${
                progress >= value ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Сообщения в зависимости от типа */}
        {type === 'video' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-800 mb-1">
              🎥 Обработка видео
            </p>
            <p className="text-xs text-amber-700">
              Видео проходит несколько этапов: скачивание, извлечение аудио, транскрибация и суммаризация.
              Это может занять несколько минут в зависимости от длительности видео.
            </p>
          </div>
        )}

        {/* Информация */}
        <div className="text-center text-sm text-muted-foreground">
          <p>ID задачи: {taskId.substring(0, 8)}...</p>
          <p className="mt-1">
            {type === 'video' 
              ? 'Вы будете перенаправлены на страницу результата после завершения обработки.'
              : 'Не закрывайте эту страницу. Результат появится здесь автоматически.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}