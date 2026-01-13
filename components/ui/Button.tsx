import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = ({
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    ...props
}: ButtonProps) => {
    const baseStyles = 'btn';
    const variantStyles = {
        primary: 'btn-primary',
        outline: 'btn-outline',
        ghost: '',
    };

    // Size classes could be added to globals.css or inline styles handled here if needed
    // For now using default padding in .btn

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? '...' : children}
        </button>
    );
};
