import { useCallback, useEffect, useRef, useState } from 'react';
import { getDetectionStyle } from '@/features/organisation/utils/screening-result.util';
import type {
  AnnotationMode,
  BoxCreatePayload,
  BoxUpdatePayload,
  DetectionBox,
  DetectionBoxLocation,
  ImageLayout,
} from '@/features/organisation/types/screening-result.types';

interface RetinalAnnotationLayerProps {
  boxes: DetectionBox[];
  imageLayout: ImageLayout;
  mode: AnnotationMode;
  isEditable: boolean;
  selectedBoxId: string | null;
  onBoxCreate: (payload: BoxCreatePayload) => void;
  onBoxUpdate: (payload: BoxUpdatePayload) => void;
  onBoxDelete: (id: string) => void;
  onBoxSelect: (id: string | null) => void;
  onBoxDoubleClick?: (id: string) => void;
}

type DragAction =
  | { type: 'draw'; startPct: { x: number; y: number } }
  | {
      type: 'move';
      boxId: string;
      startPct: { x: number; y: number };
      origLoc: DetectionBoxLocation;
    }
  | {
      type: 'resize';
      boxId: string;
      handle: ResizeHandle;
      origLoc: DetectionBoxLocation;
    };

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

const HANDLE_SIZE = 8;
const MIN_BOX_PCT = 2;

const HANDLE_CURSORS: Record<ResizeHandle, string> = {
  nw: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  se: 'nwse-resize',
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
};

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, v));
}

function toSvgPct(
  clientX: number,
  clientY: number,
  svgRect: DOMRect
): { x: number; y: number } {
  return {
    x: clampPct(((clientX - svgRect.left) / svgRect.width) * 100),
    y: clampPct(((clientY - svgRect.top) / svgRect.height) * 100),
  };
}

function normalizeRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): DetectionBoxLocation {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export function RetinalAnnotationLayer({
  boxes,
  imageLayout,
  mode,
  isEditable,
  selectedBoxId,
  onBoxCreate,
  onBoxUpdate,
  onBoxDelete,
  onBoxSelect,
  onBoxDoubleClick,
}: RetinalAnnotationLayerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragAction, setDragAction] = useState<DragAction | null>(null);
  const [drawPreview, setDrawPreview] = useState<DetectionBoxLocation | null>(
    null
  );

  const getSvgRect = useCallback(() => {
    return svgRef.current?.getBoundingClientRect() ?? null;
  }, []);

  // Keyboard delete
  useEffect(() => {
    if (!isEditable || !selectedBoxId) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        e.preventDefault();
        onBoxDelete(selectedBoxId);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isEditable, selectedBoxId, onBoxDelete]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isEditable) return;
      const rect = getSvgRect();
      if (!rect) return;

      const pct = toSvgPct(e.clientX, e.clientY, rect);

      if (mode === 'draw') {
        setDragAction({ type: 'draw', startPct: pct });
        setDrawPreview({ x: pct.x, y: pct.y, width: 0, height: 0 });
        onBoxSelect(null);
        (e.target as SVGElement).setPointerCapture(e.pointerId);
        return;
      }

      // In select mode, check if clicking on empty area
      onBoxSelect(null);
    },
    [isEditable, mode, getSvgRect, onBoxSelect]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dragAction) return;
      const rect = getSvgRect();
      if (!rect) return;

      const pct = toSvgPct(e.clientX, e.clientY, rect);

      if (dragAction.type === 'draw') {
        setDrawPreview(
          normalizeRect(
            dragAction.startPct.x,
            dragAction.startPct.y,
            pct.x,
            pct.y
          )
        );
        return;
      }

      if (dragAction.type === 'move') {
        const dx = pct.x - dragAction.startPct.x;
        const dy = pct.y - dragAction.startPct.y;
        const orig = dragAction.origLoc;
        const newX = clampPct(orig.x + dx);
        const newY = clampPct(orig.y + dy);
        onBoxUpdate({
          id: dragAction.boxId,
          location: {
            x: newX,
            y: newY,
            width: Math.min(orig.width, 100 - newX),
            height: Math.min(orig.height, 100 - newY),
          },
        });
        return;
      }

      if (dragAction.type === 'resize') {
        const orig = dragAction.origLoc;
        const h = dragAction.handle;
        let { x, y, width, height } = orig;

        if (h.includes('w')) {
          const newX = clampPct(pct.x);
          width = Math.max(MIN_BOX_PCT, orig.x + orig.width - newX);
          x = orig.x + orig.width - width;
        }
        if (h.includes('e')) {
          width = Math.max(MIN_BOX_PCT, clampPct(pct.x) - orig.x);
        }
        if (h.includes('n')) {
          const newY = clampPct(pct.y);
          height = Math.max(MIN_BOX_PCT, orig.y + orig.height - newY);
          y = orig.y + orig.height - height;
        }
        if (h.includes('s')) {
          height = Math.max(MIN_BOX_PCT, clampPct(pct.y) - orig.y);
        }

        onBoxUpdate({
          id: dragAction.boxId,
          location: { x, y, width, height },
        });
      }
    },
    [dragAction, getSvgRect, onBoxUpdate]
  );

  const handlePointerUp = useCallback(() => {
    if (!dragAction) return;

    if (dragAction.type === 'draw' && drawPreview) {
      if (
        drawPreview.width >= MIN_BOX_PCT &&
        drawPreview.height >= MIN_BOX_PCT
      ) {
        onBoxCreate({ location: drawPreview });
      }
      setDrawPreview(null);
    }

    setDragAction(null);
  }, [dragAction, drawPreview, onBoxCreate]);

  const handleBoxPointerDown = useCallback(
    (e: React.PointerEvent, box: DetectionBox) => {
      if (!isEditable || mode !== 'select') return;
      e.stopPropagation();

      const rect = getSvgRect();
      if (!rect) return;

      const pct = toSvgPct(e.clientX, e.clientY, rect);
      onBoxSelect(box.id);
      setDragAction({
        type: 'move',
        boxId: box.id,
        startPct: pct,
        origLoc: { ...box.location },
      });
      (e.target as SVGElement).setPointerCapture(e.pointerId);
    },
    [isEditable, mode, getSvgRect, onBoxSelect]
  );

  const handleHandlePointerDown = useCallback(
    (
      e: React.PointerEvent,
      boxId: string,
      handle: ResizeHandle,
      loc: DetectionBoxLocation
    ) => {
      if (!isEditable) return;
      e.stopPropagation();
      setDragAction({
        type: 'resize',
        boxId,
        handle,
        origLoc: { ...loc },
      });
      (e.target as SVGElement).setPointerCapture(e.pointerId);
    },
    [isEditable]
  );

  const resizeHandles: Array<{
    key: ResizeHandle;
    getPos: (loc: DetectionBoxLocation) => { cx: number; cy: number };
  }> = [
    { key: 'nw', getPos: (l) => ({ cx: l.x, cy: l.y }) },
    { key: 'ne', getPos: (l) => ({ cx: l.x + l.width, cy: l.y }) },
    { key: 'sw', getPos: (l) => ({ cx: l.x, cy: l.y + l.height }) },
    { key: 'se', getPos: (l) => ({ cx: l.x + l.width, cy: l.y + l.height }) },
    { key: 'n', getPos: (l) => ({ cx: l.x + l.width / 2, cy: l.y }) },
    {
      key: 's',
      getPos: (l) => ({ cx: l.x + l.width / 2, cy: l.y + l.height }),
    },
    { key: 'w', getPos: (l) => ({ cx: l.x, cy: l.y + l.height / 2 }) },
    {
      key: 'e',
      getPos: (l) => ({ cx: l.x + l.width, cy: l.y + l.height / 2 }),
    },
  ];

  const cursorStyle = (() => {
    if (dragAction?.type === 'resize') return HANDLE_CURSORS[dragAction.handle];
    if (dragAction?.type === 'move') return 'grabbing';
    if (mode === 'draw') return 'crosshair';
    return 'default';
  })();

  return (
    <svg
      ref={svgRef}
      className="absolute"
      style={{
        left: imageLayout.offsetX,
        top: imageLayout.offsetY,
        width: imageLayout.width,
        height: imageLayout.height,
        cursor: cursorStyle,
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {boxes.map((box) => {
        const style = getDetectionStyle(box.type);
        const isSelected = box.id === selectedBoxId;
        const isManual = box.source === 'manual';
        const rawLabel = box.localizedName
          ? `${box.localizedName}${isManual ? ' ✎' : ''}`
          : '';
        const labelY = Math.max(0, box.location.y - 3.2);
        const labelMaxWidthByImage = Math.max(8, 100 - box.location.x);
        const labelWidth = Math.min(
          rawLabel.length * 1.3 + 2,
          box.location.width + 8,
          labelMaxWidthByImage
        );
        const labelMaxChars = Math.max(4, Math.floor((labelWidth - 2) / 1.1));
        const renderedLabel =
          rawLabel.length > labelMaxChars
            ? `${rawLabel.slice(0, Math.max(3, labelMaxChars - 1))}…`
            : rawLabel;

        return (
          <g key={box.id}>
            {/* Box fill */}
            <rect
              x={box.location.x}
              y={box.location.y}
              width={box.location.width}
              height={box.location.height}
              fill={style.backgroundColor}
              stroke={isSelected ? '#3b82f6' : style.borderColor}
              strokeWidth={isSelected ? 0.6 : 0.4}
              strokeDasharray={isManual ? '1.2 0.6' : undefined}
              rx={0.3}
              style={{
                cursor: isEditable && mode === 'select' ? 'grab' : 'default',
                pointerEvents:
                  isEditable && mode === 'select' ? 'auto' : 'none',
              }}
              onPointerDown={(e) => handleBoxPointerDown(e, box)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (isEditable && onBoxDoubleClick) onBoxDoubleClick(box.id);
              }}
            />

            {/* Label display removed as per request */}

            {/* Resize handles for selected box */}
            {isSelected && isEditable && mode === 'select' && (
              <>
                {resizeHandles.map(({ key, getPos }) => {
                  const pos = getPos(box.location);
                  const halfPx = (HANDLE_SIZE / 2 / imageLayout.width) * 100;
                  return (
                    <rect
                      key={key}
                      x={pos.cx - halfPx}
                      y={pos.cy - halfPx}
                      width={halfPx * 2}
                      height={halfPx * 2}
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth={0.3}
                      rx={0.15}
                      style={{
                        cursor: HANDLE_CURSORS[key],
                        pointerEvents: 'auto',
                      }}
                      onPointerDown={(e) =>
                        handleHandlePointerDown(e, box.id, key, box.location)
                      }
                    />
                  );
                })}
              </>
            )}
          </g>
        );
      })}

      {/* Draw preview rectangle */}
      {drawPreview && (
        <rect
          x={drawPreview.x}
          y={drawPreview.y}
          width={drawPreview.width}
          height={drawPreview.height}
          fill="rgba(99, 102, 241, 0.15)"
          stroke="rgba(99, 102, 241, 0.8)"
          strokeWidth={0.4}
          strokeDasharray="1 0.5"
          rx={0.3}
          style={{ pointerEvents: 'none' }}
        />
      )}
    </svg>
  );
}
