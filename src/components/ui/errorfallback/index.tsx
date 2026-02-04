import { FallbackProps } from 'react-error-boundary';

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-800 p-4">
      <div className="max-w-md text-center shadow-lg p-8 bg-white rounded-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Đã có lỗi xảy ra! 😭
        </h2>
        <p className="text-gray-500 mb-4">
          Hệ thống gặp sự cố không mong muốn. Đội ngũ kỹ thuật đã được thông
          báo.
        </p>

        {/* Chỉ hiện chi tiết lỗi ở môi trường DEV để debug, Production thì ẩn đi */}
        {import.meta.env.DEV && (
          <pre className="text-left bg-gray-100 p-3 rounded text-xs text-red-500 overflow-auto mb-4 max-h-40">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        )}

        <button
          onClick={resetErrorBoundary}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md"
        >
          Thử lại ngay
        </button>
      </div>
    </div>
  );
};
