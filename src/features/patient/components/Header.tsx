import React from 'react';
import { Bell, HelpCircle, Eye } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-[#283939] bg-[#182626] px-6 py-3 z-20">
      <div className="flex items-center gap-4 text-white">
        {/* Logo Icon */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#13ecec]/20 flex items-center justify-center">
            <Eye className="w-5 h-5 text-[#13ecec]" />
          </div>
          <h2 className="text-white text-lg font-bold tracking-tight">AURA</h2>
        </div>
        <div className="h-6 w-px bg-[#283939] mx-2"></div>
        <nav className="hidden md:flex gap-6">
          <a
            href="#"
            className="text-[#9db9b9] hover:text-white text-sm font-medium transition-colors"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="text-white text-sm font-medium transition-colors"
          >
            Patients
          </a>
          <a
            href="#"
            className="text-[#9db9b9] hover:text-white text-sm font-medium transition-colors"
          >
            Analysis
          </a>
          <a
            href="#"
            className="text-[#9db9b9] hover:text-white text-sm font-medium transition-colors"
          >
            Settings
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-[#102222] rounded-md border border-[#283939]">
          <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-medium text-[#9db9b9]">
            System Active
          </span>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center justify-center size-9 rounded-lg hover:bg-[#283939] text-[#9db9b9] transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center size-9 rounded-lg hover:bg-[#283939] text-[#9db9b9] transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        <div
          className="bg-center bg-no-repeat bg-cover rounded-full size-9 border border-[#283939]"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCfn-lSrn5JIJ3zX29gjnV-OQjXTLGkgdVHHhdJ45umRUh3TJ4R5D6q8ed-WQhi4coYw3Nnz9VOFCWJb2rbE9-Ns1EorQJaRddAusYdX4P29G0vJoG__9KPSwvAJDBt_JdOcj0uK2mL513NeE-YvlSpB44Wd546olorH-KcUy0LPSo2fppXsU6Jk8-g4BlGN9NZZ3N9sqVhe9B6SZ6yO-1CLR7Lg7YVMPq9Fwj3tKEHPWwhjHowRqhBuxou6o668IMVIhfYjVSmmDmN")',
          }}
          role="img"
          aria-label="Doctor Profile"
        ></div>
      </div>
    </header>
  );
};

export default Header;
