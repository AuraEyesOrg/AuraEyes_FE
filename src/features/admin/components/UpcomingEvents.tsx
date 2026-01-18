import type { UpcomingEvent } from '../types/admin.types';

interface UpcomingEventsProps {
  events: UpcomingEvent[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
        Upcoming
      </h3>
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-start gap-3 p-3 rounded-lg bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-gray-50 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${event.color}20` }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: event.color }}
            ></div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white dark:text-white light:text-gray-900 mb-1">
              {event.title}
            </h4>
            {event.subtitle && (
              <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
                {event.subtitle}
              </p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500 mt-1">
              {event.date} - {event.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
