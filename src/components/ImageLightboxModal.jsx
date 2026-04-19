import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export default function ImageLightboxModal({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Sync index when the modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setDirection(0);
      setScale(1);
    }
  }, [isOpen, initialIndex]);

  const resetZoom = () => setScale(1);

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      resetZoom();
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, images.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      resetZoom();
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Animation variants
  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  // Drag logic for swipe
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-base-100/95 backdrop-blur-sm group"
        >
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Controls Overlay */}
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-2 z-[210]">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-base-100/10 backdrop-blur-md rounded-full p-1 border border-base-content/10">
              <button
                onClick={zoomOut}
                disabled={scale <= 1}
                className="p-2 rounded-full text-base-content/60 hover:text-base-content hover:bg-base-content/10 transition-colors disabled:opacity-30"
                title="Zoom Out"
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-xs font-bold text-base-content/60 w-8 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={scale >= 4}
                className="p-2 rounded-full text-base-content/60 hover:text-base-content hover:bg-base-content/10 transition-colors disabled:opacity-30"
                title="Zoom In"
              >
                <ZoomIn size={20} />
              </button>
              <div className="w-[1px] h-4 bg-base-content/10 mx-1" />
              <button
                onClick={resetZoom}
                disabled={scale === 1}
                className="p-2 rounded-full text-base-content/60 hover:text-base-content hover:bg-base-content/10 transition-colors disabled:opacity-30"
                title="Reset Zoom"
              >
                <Maximize size={20} />
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-base-100/10 backdrop-blur-md text-base-content/60 hover:text-base-content hover:bg-base-content/10 transition-colors border border-base-content/10 focus:outline-none"
              aria-label="Close Lightbox"
            >
              <X size={24} />
            </button>
          </div>

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-base-content/60 z-[210] font-medium tracking-wide pointer-events-none">
            Image {currentIndex + 1} of {images.length}
          </div>

          {/* Previous Arrow */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-base-content/10 hover:bg-base-content/20 border border-base-content/10 flex items-center justify-center text-base-content z-[210] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-base-content/50"
              aria-label="Previous Image"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
          )}

          {/* Next Arrow */}
          {currentIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-base-content/10 hover:bg-base-content/20 border border-base-content/10 flex items-center justify-center text-base-content z-[210] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-base-content/50"
              aria-label="Next Image"
            >
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>
          )}

          {/* Image Display Area */}
          <div 
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center overflow-hidden z-[205] pointer-events-none"
          >
            <AnimatePresence initial={false} custom={direction}>
              <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                custom={direction}
                variants={variants}
                initial="enter"
                animate={{
                  ...variants.center,
                  scale: scale,
                }}
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  scale: { type: 'spring', stiffness: 200, damping: 25 },
                  opacity: { duration: 0.2 },
                }}
                className={`absolute max-w-[90vw] max-h-[85vh] object-contain rounded-lg pointer-events-auto select-none ${
                  scale > 1 ? 'cursor-move' : 'cursor-grab active:cursor-grabbing'
                }`}
                drag={scale > 1 ? true : 'x'}
                dragConstraints={scale > 1 ? undefined : { left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(e, { offset, velocity }) => {
                  if (scale > 1) return; // Ignore swipe navigation when zoomed in
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    handleNext();
                  } else if (swipe > swipeConfidenceThreshold) {
                    handlePrev();
                  }
                }}
                onClick={(e) => e.stopPropagation()} // Prevent bubbling to backdrop
                draggable={false} // Disable default image drag
                alt={`Lightbox image ${currentIndex + 1}`}
              />
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
