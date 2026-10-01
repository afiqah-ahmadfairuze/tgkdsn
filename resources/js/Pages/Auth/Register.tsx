import { Head, Link, usePage } from '@inertiajs/react';
import { FormEventHandler, useState, useRef } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { props } = usePage();

    // Get CSRF token from props, fallback to meta tag
    const getCsrfToken = () => {
        const propsToken = (props as any).csrf_token;
        if (propsToken) return propsToken;

        // Fallback to reading from meta tag
        const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        return metaToken || '';
    };

    const csrfToken = getCsrfToken();

    // Form field states for two-way binding and validation
    const [formValues, setFormValues] = useState({
        name: '',
        birthday: '',
        gender: '',
        age: '',
        guardian_fullname: '',
        guardian_phone: '',
        guardian_email: '',
        email: '',
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

    const handleFieldChange = (field: string, value: string) => {
        setFormValues(prev => ({ ...prev, [field]: value }));
        // Auto-calculate age if birthday changed
        if (field === 'birthday') {
            calculateAge(value);
        }
    };

    // Parse DD-MM-YYYY to Date object
    const parseBirthday = (dateStr: string): Date | null => {
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        return new Date(year, month, day);
    };

    // Auto-calculate age from birthday (DD-MM-YYYY format)
    const calculateAge = (birthdayString: string) => {
        if (!birthdayString) {
            setFormValues(prev => ({ ...prev, age: '' }));
            return;
        }
        const birthDate = parseBirthday(birthdayString);
        if (!birthDate || isNaN(birthDate.getTime())) {
            setFormValues(prev => ({ ...prev, age: '' }));
            return;
        }
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
        }
        setFormValues(prev => ({ ...prev, age: calculatedAge.toString() }));
    };

    // Format and validate birthday input
    const handleBirthdayChange = (value: string) => {
        // Remove all non-digit characters
        let cleaned = value.replace(/\D/g, '');

        // Auto-format as DD-MM-YYYY
        if (cleaned.length >= 2) {
            cleaned = cleaned.substring(0, 2) + '-' + cleaned.substring(2);
        }
        if (cleaned.length >= 5) {
            cleaned = cleaned.substring(0, 5) + '-' + cleaned.substring(5);
        }
        // Limit to 10 characters (DD-MM-YYYY)
        cleaned = cleaned.substring(0, 10);

        handleFieldChange('birthday', cleaned);
    };

    const validateStep1 = (): boolean => {
        if (!formValues.name || !formValues.birthday || !formValues.gender) {
            return false;
        }
        // Validate age is between 7-12
        const age = parseInt(formValues.age, 10);
        if (isNaN(age) || age < 7 || age > 12) {
            return false;
        }
        // Validate birthday format is complete (DD-MM-YYYY)
        if (formValues.birthday.length !== 10) {
            return false;
        }
        return true;
    };

    const validateStep2 = (): boolean => {
        return !!(formValues.guardian_fullname && formValues.guardian_phone && formValues.guardian_email);
    };

    const validateStep3 = (): boolean => {
        return !!(formValues.email && formValues.password && formValues.password_confirmation && formValues.password === formValues.password_confirmation);
    };

    const handleNextStep = (e: React.MouseEvent) => {
        e.preventDefault();
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        } else if (currentStep === 2 && validateStep2()) {
            setCurrentStep(3);
        }
    };

    const handlePreviousStep = (e: React.MouseEvent) => {
        e.preventDefault();
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (validateStep3()) {
            // Check if CSRF token is available
            if (!csrfToken) {
                return;
            }

            setIsSubmitting(true);
            // Traditional form submission - will POST to /register naturally
            // Page reload ensures CSRF token is refreshed from server
            formRef.current?.submit();
        }
    };

    return (
        <>
            <Head title="Sign Up" />
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
                    animation: slideInFromLeft 0.6s ease-out forwards;
                    transform: translateX(-50px);
                    opacity: 0;
                }

                @keyframes slideInFromLeft {
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
                    order: -1;
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

                .step-indicator {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 12px;
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

                .input-field[type="date"] {
                    padding-left: 44px;
                }

                .select-field {
                    width: 100%;
                    padding: 10px 14px;
                    font-size: 14px;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    transition: border-color 0.3s ease;
                    background: white;
                    color: #000;
                    cursor: pointer;
                }

                .select-field:focus {
                    outline: none;
                    border-color: #ff9933;
                    box-shadow: 0 0 0 3px rgba(255, 153, 51, 0.1);
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

                .button-group {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }

                .btn-primary, .btn-secondary {
                    flex: 1;
                    font-weight: 600;
                    border: none;
                    border-radius: 6px;
                    padding: 11px 16px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-primary {
                    background: rgba(163, 230, 53, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(217, 249, 157, 0.5);
                    color: #000;
                }

                .btn-primary:hover:not(:disabled) {
                    background: rgba(163, 230, 53, 0.8);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(163, 230, 53, 0.4);
                }

                .btn-secondary {
                    background: #f0f0f0;
                    color: #000;
                    border: 1px solid #e0e0e0;
                }

                .btn-secondary:hover:not(:disabled) {
                    background: #e8e8e8;
                }

                .btn-primary:disabled, .btn-secondary:disabled {
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
                }

                .form-footer a:hover {
                    color: #cc3300;
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
                        order: -1;
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

    .form-title {
        font-size: 22px;
        text-align: center;
    }

    .step-indicator {
        text-align: center;
        font-size: 11px;
    }

    .button-group {
        flex-direction: column;
    }

    .btn-primary,
    .btn-secondary {
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
                        <h1 className="form-title">Sign Up</h1>
                        <div className="step-indicator">Step {currentStep} of 3</div>

                        <form method="POST" action={route('register')} ref={formRef} onSubmit={handleSubmit}>
                            {/* CSRF Token - Laravel's @csrf equivalent */}
                            <input type="hidden" name="_token" value={csrfToken} />

                            {/* Step 1: Demographics */}
                            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <div className="icon-input">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="Your full name"
                                                name="name"
                                                value={formValues.name}
                                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Birthday (DD-MM-YYYY)</label>
                                        <div className="icon-input">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <input
                                                type="text"
                                                className="input-field"
                                                name="birthday"
                                                value={formValues.birthday}
                                                onChange={(e) => handleBirthdayChange(e.target.value)}
                                                placeholder="DD-MM-YYYY"
                                                required
                                                disabled={isSubmitting}
                                                maxLength={10}
                                            />
                                        </div>
                                        {formValues.age && (
                                            <div style={{
                                                fontSize: '11px',
                                                marginTop: '4px',
                                                color: parseInt(formValues.age, 10) >= 7 && parseInt(formValues.age, 10) <= 12 ? '#059669' : '#dc2626'
                                            }}>
                                                {parseInt(formValues.age, 10) >= 7 && parseInt(formValues.age, 10) <= 12
                                                    ? `Age: ${formValues.age} years old ✓`
                                                    : `Age must be between 7-12 years old (Year 1-6). Current age: ${formValues.age}`
                                                }
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Gender</label>
                                        <select
                                            className="select-field"
                                            name="gender"
                                            value={formValues.gender}
                                            onChange={(e) => handleFieldChange('gender', e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                </>
                            </div>

                            {/* Step 2: Guardian Info */}
                            <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Guardian's Full Name</label>
                                        <div className="icon-input">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="Guardian's name"
                                                name="guardian_fullname"
                                                value={formValues.guardian_fullname}
                                                onChange={(e) => handleFieldChange('guardian_fullname', e.target.value)}
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Guardian's Phone</label>
                                        <div className="icon-input">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                />
                                            </svg>
                                            <input
                                                type="tel"
                                                className="input-field"
                                                placeholder="Guardian's phone"
                                                name="guardian_phone"
                                                value={formValues.guardian_phone}
                                                onChange={(e) => handleFieldChange('guardian_phone', e.target.value)}
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Guardian's Email</label>
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
                                                type="email"
                                                className="input-field"
                                                placeholder="Guardian's email"
                                                name="guardian_email"
                                                value={formValues.guardian_email}
                                                onChange={(e) => handleFieldChange('guardian_email', e.target.value)}
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>
                                </>
                            </div>

                            {/* Step 3: Credentials */}
                            <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
                                <>
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
                                                type="email"
                                                className="input-field"
                                                placeholder="your@email.com"
                                                name="email"
                                                value={formValues.email}
                                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                                required
                                                autoComplete="email"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>

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
                                                type={showPassword ? 'text' : 'password'}
                                                className="input-field"
                                                placeholder="••••••••"
                                                name="password"
                                                value={formValues.password}
                                                onChange={(e) => {
                                                    handleFieldChange('password', e.target.value);
                                                    setPasswordStrength(calculatePasswordStrength(e.target.value));
                                                }}
                                                required
                                                autoComplete="new-password"
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
                                        {/* Password Strength Indicator */}
                                        {formValues.password && (
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
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Confirm Password</label>
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
                                                type={showPasswordConfirmation ? 'text' : 'password'}
                                                className="input-field"
                                                placeholder="••••••••"
                                                name="password_confirmation"
                                                value={formValues.password_confirmation}
                                                onChange={(e) => handleFieldChange('password_confirmation', e.target.value)}
                                                required
                                                autoComplete="new-password"
                                                disabled={isSubmitting}
                                            />
                                            <button
                                                type="button"
                                                className="icon-button"
                                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                disabled={isSubmitting}
                                                title={showPasswordConfirmation ? "Hide password" : "Show password"}
                                            >
                                                {showPasswordConfirmation ? (
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
                                </>
                            </div>

                            {/* Button Group */}
                            <div className="button-group">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={handlePreviousStep}
                                        disabled={isSubmitting}
                                    >
                                        Back
                                    </button>
                                )}
                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={handleNextStep}
                                        disabled={isSubmitting}
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Footer Link */}
                        <div className="form-footer">
                            Already have an account? <Link href={route('login')}>Log in</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
