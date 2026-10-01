import { HTMLAttributes } from 'react';

/*
 * Displays validation error message below form inputs
 */
export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p
            {...props}
            className={'text-sm text-red-600 dark:text-red-400 ' + className}
        >
            {message}
        </p>
    ) : null;
}
