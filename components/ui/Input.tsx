import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && <label className="text-sm font-medium">{label}</label>}
            <input
                className={`input ${className}`}
                {...props}
            />
            {error && <span className="text-sm text-error">{error}</span>}
        </div>
    );
};
