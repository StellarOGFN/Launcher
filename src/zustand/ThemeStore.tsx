import { create } from "zustand";
import { Stellar } from "@/stellar";

export interface ThemeGradient {
  c1: string;
  c2: string;
  c3: string;
  base: string;
  angle: number;
}

export interface Theme {
  gradient: ThemeGradient;
  accent: string;
}

const defaultTheme: Theme = {
  gradient: {
    c1: "rgba(114, 113, 223, 0.3)",
    c2: "rgba(145, 52, 69, 0.3)",
    c3: "rgba(10, 114, 158, 0.2)",
    base: "#0f0f1a",
    angle: 135,
  },
  accent: "#274799",
};

interface ThemeStore {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resetTheme: () => void;
  applyTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => {
  const stored = Stellar.Storage.get<Theme>("theme.current");
  const initial = stored ?? defaultTheme;

  return {
    theme: initial,
    setTheme: (t) => {
      Stellar.Storage.set("theme.current", t);
      set({ theme: t });
    },
    resetTheme: () => {
      Stellar.Storage.set("theme.current", defaultTheme);
      set({ theme: defaultTheme });
    },
    applyTheme: (t) => {
      const root = document.body;
      const { c1, c2, c3, base, angle } = t.gradient;
      root.style.background = `
        radial-gradient(circle at 20% 50%, ${c1}, transparent 50%),
        radial-gradient(circle at 80% 80%, ${c2}, transparent 50%),
        radial-gradient(circle at 40% 20%, ${c3}, transparent 50%),
        linear-gradient(${angle}deg, ${base}, #0f0f31)
      `;
      root.style.backgroundAttachment = "fixed";
      root.style.setProperty("--accent", t.accent);
    },
  };
});

export { defaultTheme };
