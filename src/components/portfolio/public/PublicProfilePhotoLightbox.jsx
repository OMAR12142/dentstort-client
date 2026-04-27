import React from 'react';
import { X } from 'lucide-react';

/**
 * PublicProfilePhotoLightbox — A fullscreen lightbox for the clinician's profile photo.
 */
export default function PublicProfilePhotoLightbox({ isOpen, photoUrl, dentistName, onClose }) {
  if (!isOpen || !photoUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
        <X size={32} />
      </button>
      <img
        src={photoUrl}
        alt={dentistName}
        className="max-w-[95vw] max-h-[85vh] object-contain rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
