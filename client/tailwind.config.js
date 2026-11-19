import { createThemes } from 'tw-colors';

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {

        colors: {
            'header': '#041625',
            'dark': '#031525',
            'light': '#F9F9FB',
            'border': '#0D2136',
            'border2': '#0D2130',
            'white': '#FFFFFF',
            'text': '#D3E3FD',
            'black': '#242424',
            'grey': '#F3F3F3',
            'dark-grey': '#6B6B6B',
            'red': '#d01313',
            'Red': ' #FF4E4E',
            'transparent': 'transparent',
            'twitter': '#1DA1F2',
            'purple': '#8B46FF',
            'green': '#3DE15A',
            'primary': "#58E6D9",
            'emoji': '#FDD76A'
        },

        fontSize: {
            'sm': '12px',
            'base': '14px',
            'xl': '16px',
            '2xl': '20px',
            '3xl': '28px',
            '4xl': '38px',
            '5xl': '50px',
        },

        extend: {
            fontFamily: {
                inter: ["'Inter'", "sans-serif"],
                gelasio: ["'Gelasio'", "serif"],
                emoji: ["'Segoe UI Emoji'", "Arial", "sans-serif"],
                montserrat: ["'Montserrat'", "serif"]
            },
        },

    },
    plugins: [],
};
