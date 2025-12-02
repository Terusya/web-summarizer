import Link from 'next/link';

// Временные данные для истории
const mockHistory = [
  { id: 1, title: 'Статья о ИИ', date: '2024-01-01', length: 150 },
  { id: 2, title: 'Новости технологий', date: '2024-01-02', length: 200 },
  { id: 3, title: 'Научное исследование', date: '2024-01-03', length: 300 },
];

export default function HistoryPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">История суммаризаций</h1>
      
      <div className="mb-6">
        <Link 
          href="/" 
          className="text-blue-600 hover:text-blue-800"
        >
          ← На главную
        </Link>
        <Link 
          href="/summarize" 
          className="ml-4 text-blue-600 hover:text-blue-800"
        >
          К суммаризатору
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Название</th>
              <th className="p-4 text-left">Дата</th>
              <th className="p-4 text-left">Длина</th>
              <th className="p-4 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {mockHistory.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.title}</td>
                <td className="p-4">{item.date}</td>
                <td className="p-4">{item.length} симв.</td>
                <td className="p-4">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">
                    Просмотр
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Используйте API маршруты для работы с данными:
        </p>
        <div className="mt-2 space-x-4">
          <code className="bg-gray-100 p-2 rounded">GET /api/get/all-results</code>
          <code className="bg-gray-100 p-2 rounded">POST /api/post</code>
          <code className="bg-gray-100 p-2 rounded">DELETE /api/delete/[id]</code>
        </div>
      </div>
    </div>
  );
}