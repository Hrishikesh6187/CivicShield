/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                navy: '#1e293b',
                'brand-red': '#ef4444',
                'brand-amber': '#f59e0b',
                'brand-green': '#10b981',
            },
        },
    },
    plugins: [],
}
