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
    <aside className="w-16 flex-none flex flex-col items-center py-6 gap-6 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] z-10">
      {/* Navigation Tools */}
      <div className="flex flex-col gap-2 w-full px-2">
        <button
          onClick={onZoomIn}
          className="group relative flex items-center justify-center size-10 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-brand hover:text-[var(--bg-primary)] transition-all shadow-sm mx-auto"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomOut}
          className="group relative flex items-center justify-center size-10 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all mx-auto"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          className="group relative flex items-center justify-center size-10 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all mx-auto"
          title="Pan Tool"
        >
          <Hand className="w-5 h-5" />
        </button>
        <button
          onClick={onReset}
          className="group relative flex items-center justify-center size-10 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all mx-auto"
          title="Reset View"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
      <div className="h-px w-8 bg-[var(--border-color)]"></div>

      {/* Analysis Tools */}
      <div className="flex flex-col gap-2 w-full px-2">
        <button
          className="group relative flex items-center justify-center size-10 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all mx-auto"
          title="Measurement"
        >
          <Ruler className="w-5 h-5" />
        </button>
        <button
          className="group relative flex items-center justify-center size-10 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all mx-auto"
          title="Brightness/Contrast"
        >
          <Sun className="w-5 h-5" />
        </button>
        <button
          className="group relative flex items-center justify-center size-10 rounded-lg bg-brand/20 text-brand border border-brand/30 transition-all mx-auto"
          title="Compare Previous"
        >
          <GitCompare className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-auto mb-4">
        <button
          className="group relative flex items-center justify-center size-10 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};

export default ToolsSidebar;
