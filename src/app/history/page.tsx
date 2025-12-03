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
import { FileText, Video, MoreHorizontal, Search, Calendar, Filter, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface HistoryItem {
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

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/history');
      const result = await response.json();
      if (result.success && result.data) {
        setHistoryData(result.data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке истории:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = historyData.filter((item) => {
    const matchesSearch = item.content_preview?.toLowerCase().includes(search.toLowerCase());
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
      case 'pending':
        return <Badge variant="outline">В очереди</Badge>;
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
      case 'webpage':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
                placeholder="Поиск по содержанию..."
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
                  <SelectItem value="webpage">Веб-страница</SelectItem>
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
                  <SelectItem value="pending">В очереди</SelectItem>
                  <SelectItem value="failed">Ошибка</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchHistory} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Обновить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Все суммаризации</CardTitle>
          <CardDescription>
            {loading ? 'Загрузка...' : `${filteredHistory.length} из ${historyData.length} записей`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID задачи</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Содержание</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Нет записей истории
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((item) => (
                    <TableRow key={item.request_id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="font-mono text-sm">{item.request_id.substring(0, 8)}...</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <span className="capitalize">
                            {item.type === 'webpage' ? 'Веб-страница' : item.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(item.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {item.content_preview || 'Нет предпросмотра'}
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
                              <Link href={`/history/${item.request_id}`}>Просмотр</Link>
                            </DropdownMenuItem>
                            {item.result_summary && (
                              <DropdownMenuItem asChild>
                                <Link href={`/summarize?taskId=${item.request_id}`}>
                                  Посмотреть результат
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.request_id)}>
                              Копировать ID
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {loading ? 'Загрузка...' : 'Используйте таблицу для навигации по истории суммаризаций'}
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