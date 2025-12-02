import Link from 'next/link';

export default function SummarizePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-300">Суммаризатор текста</h1>
      
      <div className="mb-6">
        <Link 
          href="/" 
          className="text-blue-600 hover:text-blue-800"
        >
          ← На главную
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Форма для ввода */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Введите текст или URL</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2">URL веб-страницы:</label>
              <input 
                type="text" 
                placeholder="https://example.com/article"
                className="w-full p-3 border rounded"
              />
            </div>
            
            <div>
              <label className="block mb-2">Или введите текст:</label>
              <textarea 
                placeholder="Вставьте текст для суммаризации..."
                className="w-full p-3 border rounded h-40"
              />
            </div>
            
            <div>
              <label className="block mb-2">Длина суммаризации:</label>
              <select className="w-full p-3 border rounded">
                <option value="short">Короткая (1-2 предложения)</option>
                <option value="medium">Средняя (3-5 предложений)</option>
                <option value="long">Длинная (6-10 предложений)</option>
              </select>
            </div>
            
            <button className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
              Суммаризировать
            </button>
          </div>
        </div>

        {/* Область результата */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Результат суммаризации</h2>
          <div className="p-4 bg-gray-50 rounded min-h-[300px]">
            <p className="text-gray-500">Здесь появится краткое содержание...</p>
          </div>
          
          <div className="mt-4 flex gap-4">
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Сохранить
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Копировать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}