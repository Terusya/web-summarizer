import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SummarizePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Суммаризация контента</h1>
        <p className="text-muted-foreground mt-2">
          Вставьте текст или URL для создания краткого содержания
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - Форма ввода */}
        <Card>
          <CardHeader>
            <CardTitle>Исходный контент</CardTitle>
            <CardDescription>
              Выберите источник для суммаризации
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="text" className="w-full">
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
                />
              </TabsContent>
              
              <TabsContent value="url" className="space-y-4">
                <Label htmlFor="url-input">Адрес веб-страницы</Label>
                <Input 
                  id="url-input"
                  placeholder="https://example.com/article"
                  type="url"
                />
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <Label>Настройки суммаризации</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Длина</Label>
                  <Select defaultValue="medium">
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
                  <Select defaultValue="paragraph">
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
            <Button className="w-full" size="lg">
              <span className="mr-2"></span>
              Создать суммаризацию
            </Button>
          </CardFooter>
        </Card>

        {/* Правая колонка - Результат */}
        <Card>
          <CardHeader>
            <CardTitle>Результат суммаризации</CardTitle>
            <CardDescription>
              Краткое содержание появится здесь
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-6 min-h-[300px] bg-muted/50">
              <p className="text-muted-foreground text-center py-12">
                Начните с ввода текста или URL и нажмите &quot;Создать суммаризацию&quot;
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" disabled>
              Копировать
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                Сохранить черновик
              </Button>
              <Button>
                Экспортировать
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Дополнительная информация */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Советы по эффективной суммаризации</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Чистый текст</h4>
            <p className="text-sm text-muted-foreground">
              Удалите лишние форматирование для лучшего результата
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Быстрая обработка</h4>
            <p className="text-sm text-muted-foreground">
              Короткие тексты обрабатываются быстрее
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Точность</h4>
            <p className="text-sm text-muted-foreground">
              Выберите подходящую длину для ваших нужд
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}