'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Video, MoreHorizontal, Search, Calendar, Filter, Download } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Mock данные
const mockHistory = [
  {
    id: '1',
    title: 'Анализ видео о золотом сечении',
    type: 'video' as const,
    date: '2024-01-15T10:30:00Z',
    length: 478,
    originalLength: 532,
    status: 'completed' as const,
  },
  {
    id: '2',
    title: 'Суммаризация статьи об ИИ',
    type: 'text' as const,
    date: '2024-01-14T15:45:00Z',
    length: 320,
    originalLength: 850,
    status: 'completed' as const,
  },
  {
    id: '3',
    title: 'Новости технологий за неделю',
    type: 'url' as const,
    date: '2024-01-13T09:20:00Z',
    length: 450,
    originalLength: 1200,
    status: 'completed' as const,
  },
  {
    id: '4',
    title: 'Документальный фильм о космосе',
    type: 'video' as const,
    date: '2024-01-12T14:10:00Z',
    length: 560,
    originalLength: 1500,
    status: 'processing' as const,
  },
];

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredHistory = mockHistory.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Завершено</Badge>;
      case 'processing':
        return <Badge variant="secondary">В обработке</Badge>;
      case 'failed':
        return <Badge variant="destructive">Ошибка</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'text':
      case 'url':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">История суммаризаций</h1>
        <p className="text-muted-foreground mt-2">
          Просмотр и управление всеми вашими суммаризациями
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Фильтры и поиск</CardTitle>
          <CardDescription>
            Найдите нужную суммаризацию по названию, типу или статусу
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Тип контента" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="video">Видео</SelectItem>
                  <SelectItem value="text">Текст</SelectItem>
                  <SelectItem value="url">Веб-страница</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="completed">Завершено</SelectItem>
                  <SelectItem value="processing">В обработке</SelectItem>
                  <SelectItem value="failed">Ошибка</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Экспорт истории
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Все суммаризации</CardTitle>
          <CardDescription>
            {filteredHistory.length} из {mockHistory.length} записей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Размер</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">{item.title}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <span className="capitalize">
                        {item.type === 'url' ? 'Веб-страница' : item.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(item.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{item.length} симв.</div>
                      <div className="text-xs text-muted-foreground">
                        из {item.originalLength} симв.
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Открыть меню</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/history/${item.id}`}>Просмотр</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Копировать ссылку</DropdownMenuItem>
                        <DropdownMenuItem>Экспортировать</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Используйте таблицу для навигации по истории суммаризаций
        </div>
        <Button asChild>
          <Link href="/">
            Новая суммаризация
          </Link>
        </Button>
      </div>
    </div>
  );
}