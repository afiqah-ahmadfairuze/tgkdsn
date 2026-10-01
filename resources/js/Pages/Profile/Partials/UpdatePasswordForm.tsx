import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Password strength state
    const [passwordStrength, setPasswordStrength] = useState<{
        score: number;
        label: string;
        color: string;
    }>({ score: 0, label: '', color: '#e0e0e0' });

    // Calculate password strength
    const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
        if (!password) return { score: 0, label: '', color: '#e0e0e0' };

        let score = 0;

        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;

        // Character variety checks
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++; // Mixed case
        if (/\d/.test(password)) score++; // Numbers
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++; // Special chars

        // Determine label and color
        if (score <= 1) return { score, label: 'Weak', color: '#e74c3c' };
        if (score <= 3) return { score, label: 'Medium', color: '#f39c12' };
        return { score, label: 'Strong', color: '#27ae60' };
    };

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setPasswordStrength({ score: 0, label: '', color: '#e0e0e0' });
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Update Password
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Ensure your account is using a long, random password to stay
                    secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Current Password"
                    />

                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                    />

                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" />

                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => {
                            setData('password', e.target.value);
                            setPasswordStrength(calculatePasswordStrength(e.target.value));
                        }}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />

                    {/* Password Strength Indicator */}
                    {data.password && (
                        <div style={{ marginTop: '8px' }}>
                            {/* Strength Bar */}
                            <div style={{
                                height: '4px',
                                background: '#e0e0e0',
                                borderRadius: '2px',
                                overflow: 'hidden',
                                marginBottom: '4px'
                            }}>
                                <div style={{
                                    width: `${(passwordStrength.score / 5) * 100}%`,
                                    height: '100%',
                                    background: passwordStrength.color,
                                    transition: 'all 0.3s ease'
                                }} />
                            </div>
                            {/* Strength Label */}
                            <div style={{
                                fontSize: '11px',
                                color: passwordStrength.color,
                                fontWeight: 600
                            }}>
                                {passwordStrength.label}
                                {passwordStrength.score < 3 && (
                                    <span style={{ color: '#666', fontWeight: 400, marginLeft: '8px' }}>
                                        (Use uppercase, lowercase, and numbers)
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
