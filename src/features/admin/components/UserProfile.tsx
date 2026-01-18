import type { UserProfile as UserProfileType } from '../types/admin.types';

interface UserProfileProps {
  user: UserProfileType;
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-white rounded-xl p-6 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mx-auto mb-4 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-16 h-16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="35" r="15" fill="white" />
          <path
            d="M25 75C25 60 35 55 50 55C65 55 75 60 75 75"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900 mb-1">
        {user.name}
      </h3>
      <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 mb-6">
        {user.age} years old • {user.location}
      </p>

      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500 mb-1">
            Blood
          </p>
          <p className="text-sm font-semibold text-white dark:text-white light:text-gray-900">
            {user.stats.blood}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500 mb-1">
            Height
          </p>
          <p className="text-sm font-semibold text-white dark:text-white light:text-gray-900">
            {user.stats.height}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500 mb-1">
            Weight
          </p>
          <p className="text-sm font-semibold text-white dark:text-white light:text-gray-900">
            {user.stats.weight}
          </p>
        </div>
      </div>
    </div>
  );
}
