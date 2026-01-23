/**
 * Data Table Component
 * Generic reusable table for displaying paginated data
 */

import { ReactNode } from 'react';

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  width?: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export const DataTable = <T,>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  isEmpty = data.length === 0,
  emptyMessage = 'No data available',
  onRowClick,
  className = '',
}: DataTableProps<T>) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-r-primary"></div>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Loading data...
          </p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 ${className}`}
    >
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={idx}
                className={`px-6 py-4 font-semibold ${column.width || ''}`}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((column, idx) => {
                const value =
                  typeof column.accessor === 'function'
                    ? column.accessor(row)
                    : row[column.accessor];
                const rendered = column.render
                  ? column.render(value, row)
                  : value;

                return (
                  <td
                    key={idx}
                    className="px-6 py-4 text-slate-700 dark:text-slate-300"
                  >
                    {rendered as React.ReactNode}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
