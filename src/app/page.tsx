import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto p-6 text-center">
      <h1 className="text-4xl font-bold mb-6">Web Summarizer</h1>
      <p className="text-lg mb-8">
        Веб-приложение для суммаризации текста и веб-страниц
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Link 
          href="/summarize"
          className="p-6 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition"
        >
          <h2 className="text-2xl font-semibold mb-2">Суммаризация</h2>
          <p>Создайте краткое содержание текста или веб-страницы</p>
        </Link>
        
        <Link 
          href="/history"
          className="p-6 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition"
        >
          <h2 className="text-2xl font-semibold mb-2">История</h2>
          <p>Просмотрите предыдущие суммаризации</p>
        </Link>
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Доступные API маршруты:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-medium">GET запросы</h4>
            <code className="block mt-2">/api/get/all-results</code>
            <code className="block mt-1">/api/get/[id]</code>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-medium">Другие методы</h4>
            <code className="block mt-2">POST /api/post</code>
            <code className="block mt-1">DELETE /api/delete/[id]</code>
            <code className="block mt-1">PUT /api/update/[id]</code>
          </div>
        </div>
      </div>
    </div>
  );
}