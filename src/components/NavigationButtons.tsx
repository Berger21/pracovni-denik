interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextColor?: 'blue' | 'green';
  showNext?: boolean;
  nextDisabled?: boolean;
}

export default function NavigationButtons({
  onBack,
  onNext,
  nextLabel = 'Pokračovat →',
  nextColor = 'blue',
  showNext = true,
  nextDisabled = false
}: NavigationButtonsProps) {
  const nextColorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <div className="flex gap-4 mt-8">
      <button
        onClick={onBack}
        className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
      >
        ← Zpět
      </button>
      {showNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={`${nextColorClasses[nextColor]} text-white px-8 py-3 rounded-lg font-semibold transition-colors ${
            nextDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}