import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Hand,
  RotateCcw,
  Ruler,
  Sun,
  GitCompare,
  Keyboard,
} from 'lucide-react';

interface ToolsSidebarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
}) => {
  return (
    <aside className="w-16 flex-none flex flex-col items-center py-6 gap-6 bg-white dark:bg-[#0a1f44] border-r border-gray-200 dark:border-[#2d4a6f] z-10">
      {/* Navigation Tools */}
      <div className="flex flex-col gap-2 w-full px-2">
        <button
          onClick={onZoomIn}
          className="group relative flex items-center justify-center size-10 rounded-lg bg-gray-100 dark:bg-[#1e3a5f] text-gray-900 dark:text-white hover:bg-[#13ecec] hover:text-[#102222] transition-all shadow-sm mx-auto"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomOut}
          className="group relative flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e3a5f] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all mx-auto"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          className="group relative flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e3a5f] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all mx-auto"
          title="Pan Tool"
        >
          <Hand className="w-5 h-5" />
        </button>
        <button
          onClick={onReset}
          className="group relative flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e3a5f] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all mx-auto"
          title="Reset View"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
      <div className="h-px w-8 bg-[#283939]"></div>

      {/* Analysis Tools */}
      <div className="flex flex-col gap-2 w-full px-2">
        <button
          className="group relative flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e3a5f] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all mx-auto"
          title="Measurement"
        >
          <Ruler className="w-5 h-5" />
        </button>
        <button
          className="group relative flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e3a5f] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all mx-auto"
          title="Brightness/Contrast"
        >
          <Sun className="w-5 h-5" />
        </button>
        <button
          className="group relative flex items-center justify-center size-10 rounded-lg bg-[#13ecec]/20 text-[#13ecec] border border-[#13ecec]/30 transition-all mx-auto"
          title="Compare Previous"
        >
          <GitCompare className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-auto mb-4">
        <button
          className="group relative flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e3a5f] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};

export default ToolsSidebar;
