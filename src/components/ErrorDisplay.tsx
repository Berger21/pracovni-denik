interface ErrorDisplayProps {
  errors: string[];
}

export default function ErrorDisplay({ errors }: ErrorDisplayProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <h3 className="font-semibold text-red-800 mb-2">⚠️ Opravte následující chyby:</h3>
      <ul className="list-disc list-inside text-red-700">
        {errors.map((chyba, index) => (
          <li key={index}>{chyba}</li>
        ))}
      </ul>
    </div>
  );
}