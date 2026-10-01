import { ButtonHTMLAttributes } from 'react';

/*
 * Yellow-themed button used for primary actions
 * Consistent with the TanganakDusun brand colors
 */
export default function YellowButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-6 py-3 text-black font-semibold transition ease-in-out duration-150 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            style={{
                background: '#FFD700',
                borderRadius: '0',
                opacity: disabled ? 0.25 : 1
            }}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
