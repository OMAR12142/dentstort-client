import { useState } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * SafeImage — Renders an <img> with a graceful themed fallback if src is missing or fails to load.
 */
export default function SafeImage({
  src,
  alt = '',
  className = 'w-full h-full object-cover',
  fallback = null,
  fallbackClassName = 'w-full h-full flex items-center justify-center bg-base-100 text-base-content/25',
  onClick,
}) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div className={fallbackClassName} onClick={onClick} role="img" aria-label={alt || 'Image unavailable'}>
        {fallback || <ImageOff size={28} />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setFailedSrc(src)}
    />
  );
}

