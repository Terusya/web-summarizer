'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Copy, Download, FileText, Video, Calendar, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type SummarizationType = 'video' | 'text' | 'url' | 'webpage';

// Mock данные для конкретной записи
const mockDetailData = {
  id: '1',
  title: 'Анализ видео о золотом сечении',
  type: 'video' as SummarizationType, // ИЗМЕНЕНО: убрано as const
  originalUrl: 'https://www.youtube.com/watch?v=example',
  date: '2024-01-15T10:30:00Z',
  processingTime: '2 мин 45 сек',
  originalContent: 'Золотое сечение — это математическое соотношение, которое часто встречается в природе, искусстве и архитектуре. Оно равно примерно 1.618 и считается эстетически приятным. Многие известные произведения искусства, такие как Мона Лиза Леонардо да Винчи, используют золотое сечение для создания гармоничных композиций. В архитектуре золотое сечение можно увидеть в Парфеноне в Афинах и в работах Ле Корбюзье. В природе золотое сечение проявляется в спиралях раковин, расположении лепестков цветов и даже в пропорциях человеческого тела.',
  summary: 'Золотое сечение — это математическое соотношение, которое встречается в природе, искусстве и архитектуре. Оно равно 1.618 и считается эстетически приятным. Многие известные произведения искусства, такие как Мона Лиза Леонардо да Винчи, используют его для создания гармоничных композиций. В архитектуре золотое семчение можно увидеть в Парфеноне, Афинах и работах Ле Корбюзье, где оно проявляется в спиралях раковин, расположении лепестков цветов и пропорциях человеческого тела.',
  originalLength: 532,
  summaryLength: 478,
  status: 'completed' as const,
};

export default function HistoryDetailPage() {
  const params = useParams();
  const id = params.id;

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
              {mockDetailData.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                {mockDetailData.type === 'video' ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span className="capitalize">
                  {mockDetailData.type === 'url' ? 'Веб-страница' : mockDetailData.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(mockDetailData.date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {mockDetailData.processingTime}
              </div>
              <Badge variant={mockDetailData.status === 'completed' ? 'default' : 'secondary'}>
                {mockDetailData.status === 'completed' ? 'Завершено' : 'В обработке'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(mockDetailData.summary)}>
              <Copy className="mr-2 h-4 w-4" />
              Копировать
            </Button>
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
              {mockDetailData.originalUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Исходный URL</p>
                  <a
                    href={mockDetailData.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {mockDetailData.originalUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Исходный размер</p>
                  <p className="text-lg font-semibold">{mockDetailData.originalLength} симв.</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Результат</p>
                  <p className="text-lg font-semibold">{mockDetailData.summaryLength} симв.</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Сокращение</p>
                <p className="text-lg font-semibold text-green-600">
                  {Math.round((1 - mockDetailData.summaryLength / mockDetailData.originalLength) * 100)}%
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">ID задачи</p>
                <code className="text-sm bg-muted px-2 py-1 rounded">{id}</code>
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
                  Повторить суммаризацию
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Редактировать результат
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                Удалить запись
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
                  <TabsTrigger value="original">Оригинальный контент</TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className="space-y-4 pt-4">
                  <div className="rounded-lg border p-6 bg-muted/50">
                    <p className="whitespace-pre-wrap">{mockDetailData.summary}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{mockDetailData.summaryLength} символов</span>
                    <span>Чтение за {Math.ceil(mockDetailData.summaryLength / 1000)} мин</span>
                  </div>
                </TabsContent>
                <TabsContent value="original" className="space-y-4 pt-4">
                  <div className="rounded-lg border p-6 bg-muted/50">
                    <p className="whitespace-pre-wrap">{mockDetailData.originalContent}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {mockDetailData.originalLength} символов
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Коэффициент сжатия: {(mockDetailData.originalLength / mockDetailData.summaryLength).toFixed(1)}:1
              </div>
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