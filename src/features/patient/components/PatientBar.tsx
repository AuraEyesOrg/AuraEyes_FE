import React from 'react';
import { Calendar, Eye } from 'lucide-react';

const PatientBar: React.FC = () => {
  return (
    <div className="flex-none flex flex-wrap items-center justify-between gap-4 border-b border-[#283939] bg-[#0f1515] px-6 py-3 shadow-md z-10">
      <div className="flex items-center gap-2 text-sm">
        <a href="#" className="text-[#9db9b9] hover:text-white">
          Patients
        </a>
        <span className="text-[#283939]">/</span>
        <span className="text-white font-medium">Sarah Jenkins</span>
        <span className="text-[#283939] mx-2">|</span>
        <span className="text-[#9db9b9]">ID: #99281-A</span>
        <span className="text-[#283939] mx-2">|</span>
        <span className="text-[#9db9b9]">DOB: 12 Apr 1958</span>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#13ecec]" />
          <span className="text-white">Oct 24, 2023</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#13ecec]" />
          <span className="text-white font-bold">Left Eye (OS)</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-bold uppercase tracking-wider">
          Attention Needed
        </div>
      </div>
    </div>
  );
};

export default PatientBar;
