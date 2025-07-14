import { forwardRef, TextareaHTMLAttributes, InputHTMLAttributes } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, required = false, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-lg font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, required = false, error, className = '', ...props }, ref) => {
    return (
      <FormField label={label} required={required} error={error}>
        <input
          ref={ref}
          className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-900 placeholder-blue-400 ${className}`}
          {...props}
        />
      </FormField>
    );
  }
);

FormInput.displayName = 'FormInput';

interface FormTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: string;
}

export const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  ({ label, required = false, error, className = '', ...props }, ref) => {
    return (
      <FormField label={label} required={required} error={error}>
        <textarea
          ref={ref}
          className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-900 placeholder-blue-400 resize-vertical ${className}`}
          {...props}
        />
      </FormField>
    );
  }
);

FormTextArea.displayName = 'FormTextArea';