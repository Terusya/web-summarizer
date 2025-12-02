export function Footer() {
  return (
    <footer className="mt-auto border-t py-6 md:py-0">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-6">
        {/* Лого и копирайт */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="h-6 w-6 rounded-md bg-primary"></div>
          <p className="text-sm text-muted-foreground">
            © 2025 Web Summarizer. Все права защищены.
          </p>
        </div>

        {/* Ссылки */}
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Документация
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
            GitHub
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Контакты
          </a>
        </div>
      </div>
    </footer>
  );
}