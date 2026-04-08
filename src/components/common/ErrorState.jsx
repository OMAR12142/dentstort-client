import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ error, refetch }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-base-100/50 rounded-xl border border-neutral-light text-center min-h-[300px]">
      <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
        <AlertTriangle size={48} className="text-error" />
      </div>
      <h3 className="text-lg font-bold text-base-content mb-1">Something went wrong</h3>
      <p className="text-sm text-base-content/60 mb-6 max-w-sm">
        {error?.message || 'An unexpected error occurred while loading this data.'}
      </p>
      {refetch && (
        <button
          onClick={refetch}
          className="btn btn-primary text-white border-0 shadow-none px-6 rounded-lg font-semibold"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
