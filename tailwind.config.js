import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                tgkdsn: {
                    dark: '#2d2d2d',
                    'dark-lighter': '#3a3a3a',
                    blue: '#4a90e2',
                    'blue-dark': '#357abd',
                    yellow: '#f0b429',
                    'yellow-dark': '#d49d1f',
                    'blue-gradient-start': '#5a9fd4',
                    'blue-gradient-end': '#89b5d8',
                },
            },
        },
    },

    plugins: [forms],
};
