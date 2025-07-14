import { ReactNode } from 'react';

interface StepWrapperProps {
  stepNumber: number;
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export default function StepWrapper({ 
  stepNumber, 
  title, 
  children, 
  maxWidth = '2xl' 
}: StepWrapperProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-8 ${maxWidthClasses[maxWidth]} mx-auto`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Krok {stepNumber}: {title}
      </h2>
      {children}
    </div>
  );
}