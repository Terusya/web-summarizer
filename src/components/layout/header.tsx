import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Логотип и название */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-bold text-primary-foreground">WS</span>
          </div>
          <Link href="/" className="font-bold text-xl">
            Web Summarizer
          </Link>
        </div>

        {/* Навигация */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Главная
          </Link>
          <Link href="/summarize" className="text-sm font-medium hover:text-primary transition-colors">
            Суммаризация
          </Link>
          <Link href="/history" className="text-sm font-medium hover:text-primary transition-colors">
            История
          </Link>
          <Link href="/api/get/all-results" className="text-sm font-medium hover:text-primary transition-colors">
            API
          </Link>
        </nav>

        {/* Кнопки действий */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            Войти
          </Button>
          <Button size="sm">
            Новая суммаризация
          </Button>
        </div>
      </div>
    </header>
  );
}