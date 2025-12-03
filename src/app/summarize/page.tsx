'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Download, FileText, Video, Globe, Clock, Loader2, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSummarization } from '@/app/contexts/SummarizationContext';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SummarizePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const taskId = searchParams.get('taskId');
  const { tasks, startSummarization, isProcessing } = useSummarization();
  
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  
  const currentTask = taskId ? tasks[taskId] : null;

  // Функция для загрузки результата
  const loadResult = async (id: string) => {
    if (!id) return;
    
    try {
      setIsLoadingResult(true);
      const response = await fetch(`/api/summarize/${id}/status`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'completed' && data.summary) {
          setResult(data);
          toast.success('Результат загружен!');
        } else if (data.status === 'failed') {
          toast.error('Задача завершилась с ошибкой');
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке результата:', error);
    } finally {
      setIsLoadingResult(false);
    }
  };

  // Проверяем результат при загрузке страницы
  useEffect(() => {
    if (taskId) {
      loadResult(taskId);
      
      // Настраиваем интервал для проверки статуса, если задача еще не завершена
      const interval = setInterval(() => {
        fetch(`/api/summarize/${taskId}/status`)
          .then(res => res.json())
          .then(data => {
            if (data.status === 'completed' && data.summary) {
              setResult(data);
              clearInterval(interval);
              toast.success('Обработка завершена!');
            }
          })
          .catch(console.error);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [taskId]);

  const handleSubmit = async () => {
    try {
      setIsStarting(true);
      
      let content = '';
      let type: 'text' | 'video' | 'webpage' = 'text';
      
      if (activeTab === 'text') {
        if (!textInput.trim()) {
          toast.error('Введите текст для суммаризации');
          setIsStarting(false);
          return;
        }
        content = textInput;
        type = 'text';
      } else if (activeTab === 'url') {
        if (!urlInput.trim()) {
          toast.error('Введите URL веб-страницы');
          setIsStarting(false);
          return;
        }
        content = urlInput;
        type = 'webpage';
      } else if (activeTab === 'video') {
        if (!urlInput.trim()) {
          toast.error('Введите URL видео');
          setIsStarting(false);
          return;
        }
        content = urlInput;
        type = 'video';
      }
      
      toast.info('Создание задачи суммаризации...');
      const newTaskId = await startSummarization(type, content);
      
      // Перенаправляем на страницу с taskId
      router.push(`/summarize?taskId=${newTaskId}`);
      toast.success('Задача создана! Следите за прогрессом...');
      
    } catch (error: any) {
      toast.error(`Ошибка: ${error.message || 'Не удалось создать задачу'}`);
    } finally {
      setIsStarting(false);
    }
  };

  // Если есть результат, показываем его
  if (result) {
    return (
      <div className="container mx-auto py-8">
        <Button 
          variant="outline" 
          onClick={() => {
            setResult(null);
            router.push('/summarize');
          }}
          className="mb-6"
        >
          ← Новая суммаризация
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Результат суммаризации</CardTitle>
                <CardDescription>
                  {result.type === 'webpage' ? 'Веб-страница' : 
                   result.type === 'video' ? 'Видео' : 'Текст'}
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Завершено
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border p-6 bg-muted/50">
              <p className="whitespace-pre-wrap">{result.summary}</p>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {result.summary_length} символов
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Сокращено на {Math.round((1 - (result.summary_length || 0) / (result.original_length || 1)) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                navigator.clipboard.writeText(result.summary || '');
                toast.success('Текст скопирован в буфер');
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Копировать
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Экспортировать
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Если задача в процессе, показываем индикатор
  if (taskId && (currentTask?.status === 'processing' || currentTask?.status === 'pending')) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Обработка...
            </CardTitle>
            <CardDescription>
              {currentTask.type === 'video' ? 'Обработка видео' : 
               currentTask.type === 'webpage' ? 'Анализ веб-страницы' : 'Обработка текста'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={50} className="h-2" />
            <div className="text-center">
              <p className="text-muted-foreground">
                Пожалуйста, подождите. Это может занять несколько минут.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                ID задачи: {taskId.substring(0, 8)}...
              </p>
            </div>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => loadResult(taskId)}
                disabled={isLoadingResult}
              >
                {isLoadingResult ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Проверить статус</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Основная форма
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Суммаризация контента</h1>
            <p className="text-muted-foreground mt-2">
              Вставьте текст или URL для создания краткого содержания
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка - Форма ввода */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Исходный контент</CardTitle>
              <CardDescription>
                Выберите источник для суммаризации
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text">Текст</TabsTrigger>
                  <TabsTrigger value="url">Веб-страница</TabsTrigger>
                  <TabsTrigger value="video">Видео</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4">
                  <Label htmlFor="text-input">Текст для суммаризации</Label>
                  <Textarea 
                    id="text-input"
                    placeholder="Вставьте сюда текст, который нужно сократить..."
                    className="min-h-[200px]"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={isStarting || isProcessing}
                  />
                </TabsContent>
                
                <TabsContent value="url" className="space-y-4">
                  <Label htmlFor="url-input">Адрес веб-страницы</Label>
                  <Input 
                    id="url-input"
                    placeholder="https://example.com/article"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={isStarting || isProcessing}
                  />
                  <p className="text-sm text-muted-foreground">
                    Поддерживаются статьи, блоги, новостные сайты
                  </p>
                </TabsContent>
                
                <TabsContent value="video" className="space-y-4">
                  <Label htmlFor="video-input">URL видео</Label>
                  <Input 
                    id="video-input"
                    placeholder="https://youtube.com/watch?v=..."
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={isStarting || isProcessing}
                  />
                  <p className="text-sm text-muted-foreground">
                    Поддерживаются YouTube, Vimeo и другие платформы
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleSubmit}
                disabled={isStarting || isProcessing}
              >
                {isStarting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создание задачи...
                  </>
                ) : isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  'Создать суммаризацию'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Правая колонка - Инструкция */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Как это работает</CardTitle>
              <CardDescription>
                Процесс суммаризации состоит из нескольких этапов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">1. Ввод контента</h3>
                    <p className="text-sm text-muted-foreground">
                      Загрузите текст, URL веб-страницы или ссылку на видео
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Loader2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">2. Обработка ИИ</h3>
                    <p className="text-sm text-muted-foreground">
                      Наш ИИ анализирует контент и выделяет ключевые моменты.
                      Это может занять от нескольких секунд до нескольких минут.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">3. Получение результата</h3>
                    <p className="text-sm text-muted-foreground">
                      Получите краткое содержание в удобном формате.
                      Вы сможете скопировать или экспортировать результат.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  💡 Совет
                </p>
                <p className="text-xs text-blue-700">
                  После создания задачи не закрывайте страницу. Система автоматически обновит статус.
                  Вы также можете перейти в историю и вернуться к задаче позже.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}