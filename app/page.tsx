import { createClient } from '@/lib/supabase/server';

export default async function Instruments() {
  const supabase = await createClient();
  const { data: items, error } = await supabase.from("test").select();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 text-xl font-semibold mb-2">Error</h2>
            <p className="text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Database Records</h1>
            <p className="text-blue-100 mt-1">
              {items?.length || 0} {items?.length === 1 ? 'record' : 'records'} found
            </p>
          </div>
          
          <div className="p-6">
            {items && items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-2.5 py-0.5 rounded">
                            ID: {item.id}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-800 text-lg leading-relaxed">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-gray-900 text-lg font-semibold mb-1">No records found</h3>
                <p className="text-gray-500">The table appears to be empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}