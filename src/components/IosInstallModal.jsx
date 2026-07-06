import React from 'react';
import Modal from './Modal';
import { Share, PlusSquare } from 'lucide-react';

export default function IosInstallModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Install on iPhone/iPad" size="sm">
      <div className="text-center py-2">
        <div className="bg-base-200/50 p-5 rounded-2xl border border-neutral-light/50 mb-6">
          <p className="text-base-content/80 text-sm font-medium mb-5">
            To install DentStory as a native app on your iOS device, follow these quick steps:
          </p>
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-3 bg-base-100 p-3 rounded-xl border border-neutral-light shadow-sm">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</span>
              <p className="text-sm font-medium">Tap the <Share className="inline w-5 h-5 mx-1 text-primary" /> <strong>Share</strong> button at the bottom of Safari.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-base-100 p-3 rounded-xl border border-neutral-light shadow-sm">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</span>
              <p className="text-sm font-medium">Scroll down and tap <PlusSquare className="inline w-5 h-5 mx-1 text-primary" /> <strong>Add to Home Screen</strong>.</p>
            </div>
          </div>
        </div>
        
        <button onClick={onClose} className="btn btn-primary w-full rounded-xl">
          Got it!
        </button>
      </div>
    </Modal>
  );
}
