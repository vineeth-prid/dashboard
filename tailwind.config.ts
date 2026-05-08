import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        amet: { DEFAULT: "#0ea5e9", soft: "#e0f2fe" },
        rihal: { DEFAULT: "#8b5cf6", soft: "#ede9fe" },
        prid: { DEFAULT: "#10b981", soft: "#d1fae5" },
        bg: "#0b1020",
        panel: "#11172b",
        panel2: "#161d36",
        edge: "#1f2746",
        ink: "#e5e9f5",
        muted: "#8a93b2",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial"],
      },
    },
  },
  plugins: [],
};

export default config;
