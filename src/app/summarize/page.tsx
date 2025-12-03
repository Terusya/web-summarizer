'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Download, Save, Share2, Clock, FileText, Video, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner'; // Импортируем toast из sonner

// ... (остальные импорты остаются без изменений)

export default function SummarizePage() {
  const [activeTab, setActiveTab] = useState('text');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // ДОБАВЛЯЕМ: состояния для ввода данных
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [summaryResult, setSummaryResult] = useState<any>(null);
  
  // ДОБАВЛЯЕМ: функция обработки отправки формы
  const handleSubmit = async () => {
    if (activeTab === 'text' && !textInput.trim()) {
      toast.error('Введите текст для суммаризации');
      return;
    }
    
    if (activeTab === 'url' && !urlInput.trim()) {
      toast.error('Введите URL веб-страницы');
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    setSummaryResult(null);
    
    // Имитация прогресса
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);
    
    try {
      // ЗАГЛУШКА: В задании 6 пока используем мок-данные
      // В задании 7 здесь будет реальный запрос к API
      
      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Мок-результат в зависимости от типа контента
      const mockResult = {
        id: Date.now().toString(),
        title: activeTab === 'text' 
          ? 'Суммаризация текста' 
          : `Анализ веб-страницы: ${urlInput.substring(0, 30)}...`,
        summary: activeTab === 'text'
          ? `Сжатая версия вашего текста: "${textInput.substring(0, 100)}..."`
          : `Краткое содержание страницы ${urlInput}: Веб-страница содержит информацию о...`,
        originalLength: activeTab === 'text' ? textInput.length : 1200,
        summaryLength: activeTab === 'text' ? Math.min(200, textInput.length) : 350,
        type: activeTab === 'text' ? 'text' : 'webpage',
        date: new Date().toISOString(),
        status: 'completed',
        sourceUrl: activeTab === 'url' ? urlInput : undefined,
      };
      
      setSummaryResult(mockResult);
      setProgress(100);
      
      toast.success('Суммаризация завершена!');
      
    } catch (error) {
      toast.error('Ошибка при обработке запроса');
      console.error(error);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  // Остальная часть компонента остается похожей, но с использованием summaryResult
  // Вот ключевые изменения в JSX:

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Суммаризация контента</h1>
            <p className="text-muted-foreground mt-2">
              {summaryResult 
                ? `Результат суммаризации ${summaryResult.type === 'webpage' ? 'веб-страницы' : 'текста'}`
                : 'Вставьте текст или URL для создания краткого содержания'}
            </p>
          </div>
          <Button onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing ? 'Обработка...' : 'Создать суммаризацию'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка - Форма ввода (ОБНОВЛЯЕМ) */}
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Текст</TabsTrigger>
                  <TabsTrigger value="url">URL веб-страницы</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4">
                  <Label htmlFor="text-input">Текст для суммаризации</Label>
                  <Textarea 
                    id="text-input"
                    placeholder="Вставьте сюда текст, который нужно сократить..."
                    className="min-h-[200px]"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={isProcessing}
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
                    disabled={isProcessing}
                  />
                  <p className="text-sm text-muted-foreground">
                    Поддерживаются статьи, блоги, новостные сайты
                  </p>
                </TabsContent>
              </Tabs>

              <div className="space-y-4">
                <Label>Настройки суммаризации</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Длина</Label>
                    <Select defaultValue="medium" disabled={isProcessing}>
                      <SelectTrigger id="length">
                        <SelectValue placeholder="Выберите длину" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Короткая</SelectItem>
                        <SelectItem value="medium">Средняя</SelectItem>
                        <SelectItem value="long">Длинная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="format">Формат</Label>
                    <Select defaultValue="paragraph" disabled={isProcessing}>
                      <SelectTrigger id="format">
                        <SelectValue placeholder="Выберите формат" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paragraph">Абзац</SelectItem>
                        <SelectItem value="bullet">Список</SelectItem>
                        <SelectItem value="headlines">Заголовки</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? 'Обработка...' : 'Создать суммаризацию'}
              </Button>
            </CardFooter>
          </Card>

          {/* Блок прогресса (показывается только при обработке) */}
          {isProcessing && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Обработка</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="w-full" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{progress}% завершено</span>
                  <span>
                    {activeTab === 'text' ? 'Анализ текста...' : 'Загрузка страницы...'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Правая колонка - Результат (ОБНОВЛЯЕМ) */}
        <div className="lg:col-span-2">
          {isProcessing ? (
            // Скелетон загрузки
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ) : summaryResult ? (
            // Результат суммаризации
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{summaryResult.title}</CardTitle>
                      <CardDescription>
                        {summaryResult.type === 'webpage' ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Globe className="h-4 w-4" />
                            <a 
                              href={summaryResult.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {summaryResult.sourceUrl}
                            </a>
                          </div>
                        ) : (
                          `Суммаризация текста`
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {summaryResult.type === 'webpage' ? 'Веб-страница' : 'Текст'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border p-6 bg-muted/50">
                    <p className="whitespace-pre-wrap">{summaryResult.summary}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {summaryResult.summaryLength} символов
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Чтение за {Math.ceil(summaryResult.summaryLength / 1000)} мин
                      </span>
                    </div>
                    <Badge variant="outline">
                      Сокращено на {Math.round((1 - summaryResult.summaryLength / summaryResult.originalLength) * 100)}%
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigator.clipboard.writeText(summaryResult.summary);
                      toast.success('Текст скопирован в буфер');
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Копировать
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Save className="mr-2 h-4 w-4" />
                      Сохранить
                    </Button>
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Экспортировать
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Карточка со статистикой */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Статистика</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Исходный размер</p>
                      <p className="text-2xl font-bold">{summaryResult.originalLength}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Результат</p>
                      <p className="text-2xl font-bold">{summaryResult.summaryLength}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Экономия</p>
                      <p className="text-2xl font-bold text-green-600">
                        {summaryResult.originalLength - summaryResult.summaryLength}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Коэффициент</p>
                      <p className="text-2xl font-bold">
                        {(summaryResult.originalLength / summaryResult.summaryLength).toFixed(1)}:1
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            // Пустое состояние
            <Card>
              <CardHeader>
                <CardTitle>Результат суммаризации</CardTitle>
                <CardDescription>
                  Краткое содержание появится здесь
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-12 bg-muted/50 flex flex-col items-center justify-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Начните с ввода текста или URL и нажмите &quot;Создать суммаризацию&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}