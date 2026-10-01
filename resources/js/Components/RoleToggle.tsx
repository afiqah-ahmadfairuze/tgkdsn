interface RoleToggleProps {
    value: string;
    onChange: (role: string) => void;
}

/*
 * Toggle button for selecting user role (User or Administrator)
 * Used in registration and user management forms
 */
export default function RoleToggle({ value, onChange }: RoleToggleProps) {
    return (
        <div className="flex gap-3">
            <button
                type="button"
                onClick={() => onChange('user')}
                className={`flex-1 px-6 py-3 rounded-md font-medium transition duration-150 ${
                    value === 'user'
                        ? 'bg-tgkdsn-yellow text-gray-800'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
            >
                User
            </button>
            <button
                type="button"
                onClick={() => onChange('administrator')}
                className={`flex-1 px-6 py-3 rounded-md font-medium transition duration-150 ${
                    value === 'administrator'
                        ? 'bg-tgkdsn-yellow text-gray-800'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
            >
                Administrator
            </button>
        </div>
    );
}
