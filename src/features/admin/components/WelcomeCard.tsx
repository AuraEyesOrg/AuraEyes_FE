import { ArrowRight } from 'lucide-react';

interface WelcomeCardProps {
  userName: string;
}

export default function WelcomeCard({ userName }: WelcomeCardProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] dark:from-[#1e3a8a] dark:to-[#3b82f6] light:from-blue-500 light:to-blue-400 rounded-2xl p-6 shadow-lg">
      <div className="relative z-10 max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">
          Hello <span className="text-primary">{userName}</span>,
        </h2>
        <p className="text-blue-100 dark:text-blue-100 light:text-blue-50 text-sm mb-4">
          Have a nice day and don't forget to take care of your health!
        </p>
        <button className="flex items-center gap-2 text-white hover:text-primary transition-colors text-sm font-medium">
          Learn More
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="absolute right-0 bottom-0 w-72 h-full">
        <div className="absolute right-8 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute right-0 bottom-0 flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="w-48 h-48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="80" fill="#13ecec" opacity="0.2" />
            <circle cx="100" cy="100" r="60" fill="#13ecec" opacity="0.3" />
            <path
              d="M100 60C100 60 120 80 100 100C80 120 100 140 100 140"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="85" cy="85" r="3" fill="white" />
            <circle cx="115" cy="85" r="3" fill="white" />
          </svg>
        </div>
      </div>
    </div>
  );
}
