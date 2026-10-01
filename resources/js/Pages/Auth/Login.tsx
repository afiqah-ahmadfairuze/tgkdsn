import { Head, Link, usePage } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';

interface LoginProps {
    readonly status?: string;
    readonly canResetPassword: boolean;
    readonly errors?: {
        readonly email?: string[];
        readonly password?: string[];
    };
}

export default function Login({ status, canResetPassword, errors }: Readonly<LoginProps>) {
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const { props } = usePage();

    // Show error modal when errors exist
    useEffect(() => {
        if (errors?.email || errors?.password) {
            setShowErrorModal(true);
        }
    }, [errors]);

    // Get CSRF token from props, fallback to meta tag
    const getCsrfToken = () => {
        const propsToken = (props as any).csrf_token;
        if (propsToken) return propsToken;

        // Fallback to reading from meta tag
        const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        return metaToken || '';
    };

    const csrfToken = getCsrfToken();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Check if CSRF token is available
        if (!csrfToken) {
            return;
        }

        setIsSubmitting(true);
        // Traditional form submission - will POST to /login naturally
        // Page reload ensures CSRF token is refreshed from server
        (e.target as HTMLFormElement).submit();
    };

    return (
        <>
            <Head title="Login" />
            <style>{`
                * {
                    font-family: 'Montserrat', sans-serif;
                }

                .auth-container {
                    background: url('/images/LoginSignup.jpg') center/cover no-repeat;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                }

                .auth-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    display: flex;
                    overflow: hidden;
                    width: 100%;
                    max-width: 420px;
                    min-height: 450px;
                    animation: slideInFromRight 0.6s ease-out forwards;
                    transform: translateX(50px);
                    opacity: 0;
                }

                @keyframes slideInFromRight {
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .form-section {
                    flex: 1;
                    padding: 40px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    background: white;
                }

                .gold-panel {
                    flex: 0 0 35%;
                    min-width: 280px;
                    background: radial-gradient(circle, #ff9933 0%, #cc3300 50%, #330000 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                }

                .gold-panel-text {
                    color: white;
                    font-size: 24px;
                    font-weight: 700;
                    text-align: center;
                    line-height: 1.4;
                }

                .form-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #000;
                    margin-bottom: 24px;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: #000;
                    margin-bottom: 6px;
                }

                .icon-input {
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 100%;
                }

                .icon-input svg {
                    position: absolute;
                    left: 12px;
                    width: 18px;
                    height: 18px;
                    color: #bdbdbd;
                    pointer-events: none;
                }

                .input-field {
                    width: 100%;
                    padding: 10px 14px 10px 44px;
                    font-size: 14px;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    transition: border-color 0.3s ease;
                    background: white;
                    color: #000;
                }

                .input-field:focus {
                    outline: none;
                    border-color: #ff9933;
                    box-shadow: 0 0 0 3px rgba(255, 153, 51, 0.1);
                }

                .input-field::placeholder {
                    color: #666;
                }

                .input-field[type="password"] {
                    padding-right: 46px;
                }

                .icon-button {
                    position: absolute;
                    right: 18px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #bdbdbd;
                    transition: color 0.3s ease;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 20px;
                    height: 20px;
                }

                .icon-button:hover {
                    color: #ff9933;
                }

                .icon-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .checkbox-group {
                    display: flex;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .checkbox-input {
                    width: 18px;
                    height: 18px;
                    margin-right: 8px;
                    cursor: pointer;
                    accent-color: #ff9933;
                }

                .checkbox-input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .checkbox-label {
                    font-size: 12px;
                    color: #666;
                    cursor: pointer;
                }

                .btn-primary {
                    width: 100%;
                    background: rgba(163, 230, 53, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(217, 249, 157, 0.5);
                    color: #000;
                    font-weight: 600;
                    border-radius: 6px;
                    padding: 11px 16px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 20px;
                }

                .btn-primary:hover:not(:disabled) {
                    background: rgba(163, 230, 53, 0.8);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(163, 230, 53, 0.4);
                }

                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .form-footer {
                    margin-top: 16px;
                    text-align: center;
                    font-size: 12px;
                }

                .form-footer a {
                    color: #8B0000;
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.3s ease;
                    display: inline-block;
                }

                .form-footer a:hover {
                    color: #cc3300;
                }

                .form-footer-separator {
                    margin: 0 8px;
                    color: #ccc;
                }

                .status-message {
                    background: #d4edda;
                    color: #155724;
                    padding: 14px 18px;
                    border-radius: 8px;
                    font-size: 13px;
                    margin-bottom: 20px;
                    border-left: 4px solid #28a745;
                    font-weight: 600;
                    animation: slideDown 0.4s ease-out;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 20px;
                    animation: fadeIn 0.2s ease-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .modal-content {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    max-width: 400px;
                    width: 100%;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease-out;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .modal-header {
                    margin-bottom: 24px;
                    text-align: center;
                    width: 100%;
                }

                .modal-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #000;
                    margin: 0 0 12px 0;
                }

                .modal-message {
                    font-size: 14px;
                    color: #000;
                    line-height: 1.6;
                    margin: 0;
                    text-align: center;
                    white-space: normal;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    width: 100%;
                    display: block;
                }

                .modal-button {
                    width: 100%;
                    background: rgba(163, 230, 53, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(217, 249, 157, 0.5);
                    color: #000;
                    font-weight: 600;
                    border-radius: 6px;
                    padding: 11px 16px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .modal-button:hover {
                    background: rgba(163, 230, 53, 0.8);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(163, 230, 53, 0.4);
                }

                .back-button {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background: rgba(255, 255, 255, 0.95);
                    border: none;
                    border-radius: 50%;
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                    color: #333;
                }

                .back-button:hover {
                    background: white;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    transform: scale(1.05);
                }

                .back-button svg {
                    width: 24px;
                    height: 24px;
                }

@media (max-width: 768px) {
    .auth-card {
        flex-direction: column;
        min-height: auto;
    }

    .gold-panel {
        flex: 1;
        min-width: auto;
        min-height: 120px;
        padding: 20px;
    }

    .form-section {
        padding: 30px 20px;
    }

    .gold-panel-text {
        font-size: 20px;
    }

    .form-title {
        font-size: 24px;
    }
}

@media (max-width: 480px) {
    .auth-container {
        padding: 12px;
    }

    .auth-card {
        border-radius: 10px;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
    }

    .form-section {
        padding: 24px 16px;
    }

    .gold-panel {
        min-height: 100px;
        padding: 16px;
    }

    .form-title {
        font-size: 22px;
        text-align: center;
    }

    .btn-primary {
        padding: 14px;
        font-size: 14px;
    }

    .back-button {
        top: 12px;
        left: 12px;
        width: 40px;
        height: 40px;
    }
}

@media (max-width: 400px) {
    .gold-panel {
        display: none;
    }
}

            `}</style>

            <div className="auth-container">
                <Link href={route('home')} className="back-button" title="Back to home">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div className="auth-card">
                    {/* Form Section */}
                    <div className="form-section">
                        <h1 className="form-title">Log In</h1>

                        {status && <div className="status-message">{status}</div>}

                        <form method="POST" action={route('login')} onSubmit={submit}>
                            {/* CSRF Token - Laravel's @csrf equivalent */}
                            <input type="hidden" name="_token" value={csrfToken} />

                            {/* Email Field */}
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <div className="icon-input">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        className="input-field"
                                        placeholder="your@email.com"
                                        required
                                        autoComplete="email"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="icon-input">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className="input-field"
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        className="icon-button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isSubmitting}
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        ) : (
                                            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="checkbox-group">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    name="remember"
                                    className="checkbox-input"
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="remember" className="checkbox-label">
                                    Remember me
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Logging in...' : 'Log In'}
                            </button>
                        </form>

                        {/* Footer Links */}
                        <div className="form-footer">
                            {canResetPassword && (
                                <>
                                    <Link href={route('password.request')}>Forgot password?</Link>
                                    <span className="form-footer-separator">•</span>
                                </>
                            )}
                            <Link href={route('register')}>Create account</Link>
                        </div>
                    </div>

                </div>

                {/* Error Modal */}
                {showErrorModal && (errors?.email || errors?.password) && (
                    <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">These credentials do not match our records.</h2>
                            </div>
                            <button
                                className="modal-button"
                                onClick={() => setShowErrorModal(false)}
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
