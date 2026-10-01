import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface PasswordConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string) => void;
    title: { en: string; bm: string };
    message?: { en: string; bm: string };
}

/*
 * Modal for confirming sensitive actions by requiring password entry
 * Used before account deletion or password changes
 */
export default function PasswordConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
}: PasswordConfirmationModalProps) {
    const { t } = useLanguage();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const passwordInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError('');
            setTimeout(() => passwordInput.current?.focus(), 100);
        }
    }, [isOpen]);

    /* Validates password field and triggers confirmation callback */
    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!password) {
            setError(t({ en: 'Password is required', bm: 'Kata laluan diperlukan' }));
            return;
        }

        onConfirm(password);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {t(title)}
                        </h3>
                        {message && (
                            <p className="mt-2 text-sm text-gray-600">
                                {t(message)}
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t({ en: 'Current Password', bm: 'Kata Laluan Semasa' })}
                            </label>
                            <input
                                ref={passwordInput}
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tgkdsn-blue focus:border-transparent"
                                placeholder={t({
                                    en: 'Enter your current password',
                                    bm: 'Masukkan kata laluan semasa anda',
                                })}
                            />
                            {error && (
                                <p className="mt-1 text-sm text-red-600">{error}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-150"
                            >
                                {t({ en: 'Cancel', bm: 'Batal' })}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-tgkdsn-blue hover:bg-tgkdsn-blue-dark rounded-md transition duration-150"
                            >
                                {t({ en: 'Confirm', bm: 'Sahkan' })}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
