/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    container: false,
  },
  darkMode: "class",
  safelist: [
    'image',
    'gap-8',
    {
      pattern: /columns-(1|2|3)/,
      variants: ['sm', 'md'],
    }
  ],
  theme: {
    extend: {
      colors: {
        dark: "#18181A",
        light: "#ccc",
      },
      fontFamily: {
        primary: ["var(--font-outfit)", "serif"],
        secondary: ["var(--font-melodrama)", "serif"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require("tailwind-bootstrap-grid")({
      gridGutters: {
        0: 0,
        1: ".5rem",
        2: "1rem",
        3: "1.5rem",
        4: "2rem",
        5: "2.75rem",
        6: "3.25rem",
      },
    }),
  ],
};

export default config;