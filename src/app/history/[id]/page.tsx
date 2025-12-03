'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Copy, Download, FileText, Video, Calendar, Clock, ExternalLink, Loader2, Globe, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface HistoryDetail {
  request_id: string;
  user_id: string;
  type: 'text' | 'video' | 'webpage';
  content_preview: string;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_summary?: string;
  original_length?: number;
  summary_length?: number;
  source_url?: string;
}

export default function HistoryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [detailData, setDetailData] = useState<HistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Функция для загрузки результата напрямую из статуса задачи
  const loadResult = async (taskId: string) => {
    try {
      console.log('Загрузка результата для задачи:', taskId);
      const response = await fetch(`/api/summarize/${taskId}/status`);
      
      if (!response.ok) {
        console.error('Ошибка при загрузке статуса:', response.status);
        return null;
      }
      
      const data = await response.json();
      console.log('Получены данные статуса:', data);
      
      if (data.status === 'completed' && data.summary) {
        setResult(data);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Ошибка при загрузке результата:', error);
      return null;
    }
  };

  // Функция для обновления данных
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await loadResult(id);
      toast.success('Данные обновлены');
    } catch (error) {
      toast.error('Ошибка при обновлении данных');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        setResult(null);
        
        console.log('Загрузка деталей для ID:', id);
        
        // Параллельно загружаем результат и историю
        const [resultData, historyResponse] = await Promise.all([
          loadResult(id),
          fetch('/api/history')
        ]);
        
        // Если получили результат, устанавливаем его
        if (resultData) {
          setResult(resultData);
        }
        
        // Пробуем получить данные из истории
        if (historyResponse.ok) {
          const historyResult = await historyResponse.json();
          console.log('Данные истории:', historyResult);
          
          if (historyResult.success && historyResult.data) {
            const foundInHistory = historyResult.data.find((item: HistoryDetail) => item.request_id === id);
            if (foundInHistory) {
              console.log('Найдено в истории:', foundInHistory);
              setDetailData(foundInHistory);
              setLoading(false);
              return;
            }
          }
        }
        
        // Если не нашли в истории, создаем базовую структуру
        console.log('Не найдено в истории, создаем базовую структуру');
        setDetailData({
          request_id: id,
          user_id: 'anonymous',
          type: resultData?.type || 'text',
          content_preview: resultData?.summary?.substring(0, 100) + '...' || 'Нет предпросмотра',
          created_at: resultData?.created_at || new Date().toISOString(),
          status: resultData?.status || 'unknown',
          result_summary: resultData?.summary,
          original_length: resultData?.original_length,
          summary_length: resultData?.summary_length,
          source_url: resultData?.source_url,
        });
        
      } catch (error: any) {
        console.error('Ошибка при загрузке деталей:', error);
        setError(error.message || 'Ошибка при загрузке данных');
        toast.error('Не удалось загрузить данные задачи');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Загрузка данных задачи...</p>
        </div>
      </div>
    );
  }

  if (error || !detailData) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к истории
          </Link>
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Ошибка</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Не удалось загрузить данные задачи {id}</p>
            <p className="text-muted-foreground mt-2">{error || 'Задача не найдена'}</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/history">Вернуться к истории</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Используем результат если есть, иначе данные из истории
  const displayData = result || detailData;
  const summary = result?.summary || detailData.result_summary;
  const status = result?.status || detailData.status;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к истории
          </Link>
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              {detailData.type === 'text' ? 'Суммаризация текста' : 
               detailData.type === 'video' ? 'Суммаризация видео' : 'Суммаризация веб-страницы'}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                {detailData.type === 'video' ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span className="capitalize">
                  {detailData.type === 'webpage' ? 'Веб-страница' : detailData.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(detailData.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <Badge variant={
                status === 'completed' ? 'default' : 
                status === 'processing' ? 'secondary' : 
                status === 'pending' ? 'outline' : 'destructive'
              }>
                {status === 'completed' ? 'Завершено' : 
                 status === 'processing' ? 'В обработке' : 
                 status === 'pending' ? 'В очереди' : 'Ошибка'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={isRefreshing}
              size="sm"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            {summary && (
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(summary);
                toast.success('Текст скопирован в буфер');
              }}>
                <Copy className="mr-2 h-4 w-4" />
                Копировать
              </Button>
            )}
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Экспорт
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Информация о задаче */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Детали задачи</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {displayData.source_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Исходный URL</p>
                  <a
                    href={displayData.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {displayData.source_url.length > 30 ? displayData.source_url.substring(0, 30) + '...' : displayData.source_url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Исходный размер</p>
                  <p className="text-lg font-semibold">{displayData.original_length || 'Н/Д'} симв.</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Результат</p>
                  <p className="text-lg font-semibold">{displayData.summary_length || 'Н/Д'} симв.</p>
                </div>
              </div>
              {displayData.original_length && displayData.summary_length && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Сокращение</p>
                  <p className="text-lg font-semibold text-green-600">
                    {Math.round((1 - displayData.summary_length / displayData.original_length) * 100)}%
                  </p>
                </div>
              )}
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">ID задачи</p>
                <code className="text-sm bg-muted px-2 py-1 rounded font-mono break-all">{id}</code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/summarize">
                  Новая суммаризация
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/summarize?taskId=${id}`}>
                  {status === 'completed' ? 'Посмотреть результат' : 'Отслеживать прогресс'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Контент */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Содержание</CardTitle>
              <CardDescription>
                Просмотр оригинального контента и результата суммаризации
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary">Результат суммаризации</TabsTrigger>
                  <TabsTrigger value="original">Информация о задаче</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4 pt-4">
                  {summary ? (
                    <>
                      <div className="rounded-lg border p-6 bg-muted/50">
                        <p className="whitespace-pre-wrap">{summary}</p>
                      </div>
                      {displayData.summary_length && (
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{displayData.summary_length} символов</span>
                          <span>Чтение за {Math.ceil(displayData.summary_length / 1000)} мин</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-lg border p-12 bg-muted/50 flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        {status === 'completed' 
                          ? 'Результат суммаризации не найден' 
                          : `Результат еще не готов. Статус: ${status}`}
                      </p>
                      {status === 'processing' && (
                        <Button 
                          variant="outline" 
                          onClick={refreshData}
                          disabled={isRefreshing}
                          className="mt-4"
                        >
                          {isRefreshing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Обновить статус
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="original" className="space-y-4 pt-4">
                  <div className="rounded-lg border p-6 bg-muted/50">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Предпросмотр контента:</h3>
                        <p className="whitespace-pre-wrap">{detailData.content_preview || 'Нет предпросмотра'}</p>
                      </div>
                      {detailData.source_url && (
                        <div>
                          <h3 className="font-semibold mb-2">Источник:</h3>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <a 
                              href={detailData.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline break-all"
                            >
                              {detailData.source_url}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {detailData.original_length && (
                    <div className="text-sm text-muted-foreground">
                      {detailData.original_length} символов (оригинал)
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              {displayData.original_length && displayData.summary_length ? (
                <div className="text-sm text-muted-foreground">
                  Коэффициент сжатия: {(displayData.original_length / displayData.summary_length).toFixed(1)}:1
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Нет данных для расчета</div>
              )}
              <Button variant="outline" asChild>
                <Link href="/history">
                  К списку записей
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}