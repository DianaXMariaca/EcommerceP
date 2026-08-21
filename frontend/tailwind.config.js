/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-neutral": "#F2F3F5",
        "text-primary": "#1E293B",
        "accent-blue": "#2563EB",
        "cta-green": "#10B981",
      },
    },
  },
  plugins: [],
};
