import type { Config } from "tailwindcss";

// Design tokens — "instrument panel" system
// Paper background, graphite ink, amber status-light accent (available),
// signal-red (booked), teal (in-use/active). Mono for data, grotesk for UI.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F5F1",
        graph: "#E7E4DB",     // graph-paper rule lines
        ink: "#1C1E1B",
        "ink-soft": "#5B5D57",
        amber: "#E2A33B",     // available / signal light
        teal: "#2B6E68",      // active / in-use
        signal: "#C1503C",    // booked / conflict
        line: "#D8D5C9",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      backgroundImage: {
        "graph-paper":
          "linear-gradient(to right, #E7E4DB 1px, transparent 1px), linear-gradient(to bottom, #E7E4DB 1px, transparent 1px)",
      },
      backgroundSize: {
        graph: "24px 24px",
      },
    },
  },
  plugins: [],
};
export default config;
