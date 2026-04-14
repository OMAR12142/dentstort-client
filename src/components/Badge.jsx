const colours = {
  Diabetic: 'bg-red-50 text-red-600 border-red-200',
  Hypertension: 'bg-orange-50 text-orange-600 border-orange-200',
  'Heart Disease': 'bg-rose-50 text-rose-600 border-rose-200',
  Smoker: 'bg-amber-50 text-amber-700 border-amber-200',
  default: 'bg-base-100 text-base-content/70 border-neutral-light',
};

const allergyPattern = /allergy|allergic/i;

export default function Badge({ label, size = 'md' }) {
  let scheme = colours[label] || colours.default;
  if (allergyPattern.test(label)) {
    scheme = 'bg-orange-50 text-orange-600 border-orange-200';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-block rounded-full font-semibold border break-words max-w-full ${sizeClasses[size]} ${scheme}`}
    >
      {label}
    </span>
  );
}
