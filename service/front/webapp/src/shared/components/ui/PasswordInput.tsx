import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, label, error, ...props }, ref) => {
        const [visible, setVisible] = useState(false);

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                )}
                <div className="relative">
                    <input
                        type={visible ? 'text' : 'password'}
                        className={cn(
                            'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
                            error && 'border-red-500 focus:ring-red-500',
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    <button
                        type="button"
                        onClick={() => setVisible(v => !v)}
                        tabIndex={-1}
                        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-700"
                    >
                        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
