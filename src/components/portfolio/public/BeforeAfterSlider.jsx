import { useState, useRef, useCallback } from 'react';
import { MoveHorizontal, ArrowLeftRight, Briefcase } from 'lucide-react';
import SafeImage from '../SafeImage';

/**
 * BeforeAfterSlider — Accessible interactive image comparison slider.
 * Supports mouse drag, touch drag (via Pointer Events), and keyboard arrows.
 */
export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  altPrefix = 'Clinical case',
}) {
  const [position, setPosition] = useState(50);
  const [swapped, setSwapped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const leftImage = swapped ? afterImage : beforeImage;
  const rightImage = swapped ? beforeImage : afterImage;

  const updatePositionFromClientX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore capture failure on synthetic/unsupported pointers
      }
    }
    updatePositionFromClientX(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    updatePositionFromClientX(e.clientX);
  };

  const handlePointerEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore release failure
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPosition((p) => Math.max(0, p - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPosition((p) => Math.min(100, p + 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setPosition(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setPosition(100);
    }
  };

  const roundedPosition = Math.round(position);

  return (
    <div className="max-w-3xl mx-auto w-full bg-base-200 border border-neutral-light rounded-2xl p-3 sm:p-4 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-base-content/70">
          Interactive {beforeLabel} / {afterLabel} Comparison
        </span>
        <button
          type="button"
          onClick={() => setSwapped((s) => !s)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-base-100 text-base-content/80 border border-neutral-light hover:border-primary hover:text-primary transition-colors cursor-pointer"
          title="Swap before and after images"
        >
          <ArrowLeftRight size={12} />
          Swap
        </button>
      </div>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className="relative aspect-[16/10] max-h-[380px] sm:max-h-[440px] w-full rounded-xl overflow-hidden bg-base-100 border border-neutral-light select-none touch-none cursor-ew-resize"
      >
        {/* Base layer: After image (right side) */}
        <div className="absolute inset-0 pointer-events-none">
          <SafeImage
            src={rightImage}
            alt={`${altPrefix} — ${afterLabel}`}
            className="w-full h-full object-cover"
            fallback={<Briefcase size={32} className="text-base-content/15" />}
            fallbackClassName="w-full h-full flex items-center justify-center bg-base-100"
          />
        </div>

        {/* Clipped overlay layer: Before image (left side) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <SafeImage
            src={leftImage}
            alt={`${altPrefix} — ${beforeLabel}`}
            className="w-full h-full object-cover"
            fallback={<Briefcase size={32} className="text-base-content/15" />}
            fallbackClassName="w-full h-full flex items-center justify-center bg-base-100"
          />
        </div>

        {/* Corner Labels */}
        <span className="pointer-events-none absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-base-200/90 text-base-content border border-neutral-light backdrop-blur-sm shadow-sm">
          {beforeLabel}
        </span>
        <span className="pointer-events-none absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-base-200/90 text-base-content border border-neutral-light backdrop-blur-sm shadow-sm">
          {afterLabel}
        </span>

        {/* Divider Line & Accessible Handle */}
        <div
          role="slider"
          tabIndex={0}
          aria-label={`${beforeLabel} and ${afterLabel} comparison slider`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={roundedPosition}
          onKeyDown={handleKeyDown}
          style={{ left: `${position}%` }}
          className="absolute inset-y-0 -translate-x-1/2 flex items-center justify-center focus:outline-none group touch-none"
        >
          <div className="w-0.5 h-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.45)]" />
          <div className="absolute w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-base-200 text-base-content border-2 border-primary shadow-lg flex items-center justify-center group-focus-visible:ring-4 group-focus-visible:ring-primary/30 transition-transform active:scale-95 cursor-ew-resize">
            <MoveHorizontal size={16} className="text-primary" />
          </div>
        </div>
      </div>

      <p className="text-[11px] text-base-content/60 text-center">
        Drag the slider or use left/right arrow keys to compare.
      </p>
    </div>
  );
}

