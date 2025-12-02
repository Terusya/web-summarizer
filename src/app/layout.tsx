import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Web Summarizer',
  description: 'Суммаризация текста и веб-страниц',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <header className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Web Summarizer
            </Link>
            <nav>
              <Link href="/" className="mr-4 hover:text-gray-300">
                Главная
              </Link>
              <Link href="/summarize" className="mr-4 hover:text-gray-300">
                Суммаризация
              </Link>
              <Link href="/history" className="hover:text-gray-300">
                История
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-gray-100 p-4 mt-8">
          <div className="container mx-auto text-center text-gray-800">
            © 2025 Web Summarizer. Все права защищены.
          </div>
        </footer>
      </body>
    </html>
  );
}