/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
    future: {
        hoverOnlyWhenSupported: true,
    },
    content: [
        './index.html',
        './components/**/*.{vue,js,ts,jsx,tsx}',
        './pages/**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: colors.zinc,
                'primary-dark': colors.neutral,
                background: colors.white,
                'background-dark': colors.neutral,
                accent: colors.blue,
                'accent-dark': colors.blue,
                // accent: '#0e7490AA',
                borderColor: colors.zinc,
                'borderColor-dark': colors.neutral,
                // primary: '#000000'
            },
        },
    },
    plugins: [require('@tailwindcss/forms')],
};
