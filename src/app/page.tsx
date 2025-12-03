'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Video, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSummarization } from '@/app/contexts/SummarizationContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [activeTab, setActiveTab] = useState('video');
  const [videoUrl, setVideoUrl] = useState('');
  const [textInput, setTextInput] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const { startSummarization, isProcessing } = useSummarization();
  const router = useRouter();

  const handleSubmit = async () => {
  try {
    let content = '';
    let type: 'video' | 'text' | 'webpage' = 'video';
    
    if (activeTab === 'video') {
      if (!videoUrl.trim()) {
        toast.error('Введите URL видео');
        return;
      }
      content = videoUrl;
      type = 'video';
    } else if (activeTab === 'text') {
      if (!textInput.trim()) {
        toast.error('Введите текст для суммаризации');
        return;
      }
      content = textInput;
      type = 'text';
    } else if (activeTab === 'url') {
      if (!webUrl.trim()) {
        toast.error('Введите URL веб-страницы');
        return;
      }
      content = webUrl;
      type = 'webpage';
    }
    
    // Разные сообщения для разных типов
    const loadingMessages = {
      video: 'Создание задачи суммаризации видео... (это может занять несколько минут)',
      text: 'Создание задачи суммаризации текста...',
      webpage: 'Создание задачи суммаризации веб-страницы...'
    };
    
    toast.info(loadingMessages[type]);
    const taskId = await startSummarization(type, content);
    
    // Перенаправляем на страницу отслеживания
    router.push(`/summarize?taskId=${taskId}`);
    toast.success('Задача создана! Отслеживайте прогресс на следующей странице');
    
  } catch (error: any) {
    toast.error(`Ошибка: ${error.message || 'Не удалось создать задачу'}`);
  }
};

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Web Summarizer
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Суммаризируйте текст, веб-страницы и видео с помощью искусственного интеллекта
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Форма для ввода */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Создать новую суммаризацию</CardTitle>
            <CardDescription>
              Выберите тип контента и введите данные для обработки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Видео
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Текст
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Веб-страница
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="video" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="video-url">URL видео (YouTube, Vimeo, etc.)</Label>
                  <Input
                    id="video-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Поддерживаются основные видеоплатформы. Обработка может занять несколько минут.
                </p>
              </TabsContent>
              
              <TabsContent value="text" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="text-input">Введите текст для суммаризации</Label>
                  <Textarea
                    id="text-input"
                    placeholder="Вставьте сюда текст, который нужно сократить..."
                    className="min-h-[200px]"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="url" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="web-url">URL веб-страницы</Label>
                  <Input
                    id="web-url"
                    placeholder="https://example.com/article"
                    type="url"
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Поддерживаются статьи, блоги, новостные сайты и другие веб-страницы
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/history">
                Смотреть историю
              </Link>
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание задачи...
                </>
              ) : (
                <>
                  Создать суммаризацию
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Блоки с информацией */}
        <Card>
          <CardHeader>
            <CardTitle>Как это работает</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">1. Ввод контента</h3>
              <p className="text-sm text-muted-foreground">
                Загрузите текст, URL веб-страницы или ссылку на видео
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">2. Обработка ИИ</h3>
              <p className="text-sm text-muted-foreground">
                Наш ИИ анализирует контент и выделяет ключевые моменты
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">3. Получение результата</h3>
              <p className="text-sm text-muted-foreground">
                Получите краткое содержание в удобном формате
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Возможности</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Суммаризация видео</h3>
                <p className="text-sm text-muted-foreground">
                  Автоматическая транскрибация и сокращение видеоконтента
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Анализ текста</h3>
                <p className="text-sm text-muted-foreground">
                  Выделение главных мыслей из длинных текстов
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Веб-страницы</h3>
                <p className="text-sm text-muted-foreground">
                  Суммаризация статей и новостей с любых сайтов
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}