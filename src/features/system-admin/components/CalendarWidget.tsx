import { Plus } from 'lucide-react';
import type { Calendar } from '../types/admin.types';

interface CalendarWidgetProps {
  calendar: Calendar;
}

export default function CalendarWidget({ calendar }: CalendarWidgetProps) {
  return (
    <div className="bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-white rounded-xl p-6 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
          {calendar.currentMonth}
        </h3>
        <button className="text-primary hover:text-primary/80 transition-colors text-sm flex items-center gap-1">
          <Plus size={16} />
          Add reminder
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendar.dates.map((date) => (
          <div key={date.date} className="text-center">
            <div className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500 mb-2">
              {date.day}
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                date.active
                  ? 'bg-primary text-white'
                  : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:bg-[#2d4a6f] dark:hover:bg-[#2d4a6f] light:hover:bg-gray-100'
              }`}
            >
              {date.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
