import { useState } from "react";
import { motion } from "framer-motion";
import GlassContainer from "@/components/Global/GlassContainer";
import { Pipette, RotateCcw } from "lucide-react";
import { useThemeStore, defaultTheme, Theme } from "@/zustand/ThemeStore";
import { ColorStop, GradientModal } from "../modal/GradientModal";

const presets: Array<{ name: string; theme: Theme }> = [
  { name: "Default", theme: defaultTheme },
  {
    name: "Void",
    theme: {
      gradient: {
        c1: "rgba(58,58,110,0.4)",
        c2: "rgba(26,26,62,0.4)",
        c3: "rgba(42,42,94,0.3)",
        base: "#0a0a1a",
        angle: 180,
      },
      accent: "#5050b3",
    },
  },
  {
    name: "Ember",
    theme: {
      gradient: {
        c1: "rgba(224,90,0,0.35)",
        c2: "rgba(160,16,16,0.35)",
        c3: "rgba(112,48,0,0.25)",
        base: "#1a0800",
        angle: 120,
      },
      accent: "#e07030",
    },
  },
  {
    name: "Frost",
    theme: {
      gradient: {
        c1: "rgba(74,168,200,0.35)",
        c2: "rgba(32,96,160,0.35)",
        c3: "rgba(48,80,128,0.25)",
        base: "#0a1828",
        angle: 200,
      },
      accent: "#60c0e8",
    },
  },
  {
    name: "Jade",
    theme: {
      gradient: {
        c1: "rgba(30,122,90,0.35)",
        c2: "rgba(15,64,48,0.35)",
        c3: "rgba(42,144,96,0.25)",
        base: "#081810",
        angle: 145,
      },
      accent: "#30b878",
    },
  },
];

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const rgbaToHex = (rgba: string): string => {
  const m = rgba.match(/[\d.]+/g);
  if (!m) return "#000000";
  return `#${[0, 1, 2].map((i) => parseInt(m[i]).toString(16).padStart(2, "0")).join("")}`;
};

const presetGradient = (t: Theme) =>
  `linear-gradient(${t.gradient.angle}deg, ${t.gradient.c1}, ${t.gradient.c2}, ${t.gradient.c3}, ${t.gradient.base})`;

export const ThemePage = () => {
  const { theme, setTheme, resetTheme, applyTheme } = useThemeStore();
  const [gradientOpen, setGradientOpen] = useState(false);
  const [accent, setAccent] = useState(theme.accent);
  const [activePreset, setActivePreset] = useState("Default");

  const [gradientStops, setGradientStops] = useState<ColorStop>({
    c1: rgbaToHex(theme.gradient.c1),
    c2: rgbaToHex(theme.gradient.c2),
    c3: rgbaToHex(theme.gradient.c3),
    base: theme.gradient.base,
  });
  const [gradientAngle, setGradientAngle] = useState(theme.gradient.angle);

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setActivePreset(p.name);
    const t = p.theme;
    setGradientStops({
      c1: rgbaToHex(t.gradient.c1),
      c2: rgbaToHex(t.gradient.c2),
      c3: rgbaToHex(t.gradient.c3),
      base: t.gradient.base,
    });
    setGradientAngle(t.gradient.angle);
    setAccent(t.accent);
  };

  const handleSave = () => {
    const t: Theme = {
      gradient: {
        c1: hexToRgba(gradientStops.c1, 0.3),
        c2: hexToRgba(gradientStops.c2, 0.3),
        c3: hexToRgba(gradientStops.c3, 0.2),
        base: gradientStops.base,
        angle: gradientAngle,
      },
      accent,
    };
    setTheme(t);
    applyTheme(t);
  };

  const handleReset = () => {
    resetTheme();
    applyTheme(defaultTheme);
    handleApplyPreset({ name: "Default", theme: defaultTheme });
  };

  return (
    <>
      <GradientModal
        open={gradientOpen}
        onClose={() => setGradientOpen(false)}
        initialStops={gradientStops}
        initialAngle={gradientAngle}
        onApply={(stops, angle) => {
          setGradientStops(stops);
          setGradientAngle(angle);
          setActivePreset("Custom");
        }}
      />

      <div className="flex flex-col gap-6 text-white/80">
        <div>
          <h2 className="text-lg font-semibold text-white">Theme</h2>
          <p className="text-xs text-white/50">
            Customize the look of your launcher.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Presets</h3>
          <div className="grid grid-cols-5 gap-2">
            {presets.map((p) => (
              <motion.button
                key={p.name}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleApplyPreset(p)}
                className={`rounded-md border p-2 transition-all duration-200 ${
                  activePreset === p.name
                    ? "border-white/40 bg-white/10"
                    : "border-white/10 bg-white/5 hover:border-white/25"
                }`}
              >
                <div
                  className="h-14 rounded-md mb-2"
                  style={{ background: presetGradient(p.theme) }}
                />
                <p className="text-[11px] text-white/50 text-center">
                  {p.name}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        <GlassContainer className="rounded-lg divide-y divide-white/10">
          <div className="flex items-center justify-between py-3 px-3">
            <div>
              <p className="text-sm text-white/80">Background gradient</p>
              <p className="text-xs text-white/35 mt-0.5">
                Click to edit stops and angle
              </p>
            </div>
            <button
              onClick={() => setGradientOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
            >
              <div
                className="w-16 h-5 rounded"
                style={{
                  background: presetGradient({
                    gradient: { ...gradientStops, angle: gradientAngle },
                    accent,
                  }),
                }}
              />
              <Pipette size={12} className="text-white/40" />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 px-3">
            <p className="text-sm text-white/80">Accent color</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-white/30 font-mono">{accent}</p>
              <div
                className="relative w-8 h-8 rounded-lg border border-white/15 overflow-hidden"
                style={{ background: accent }}
              >
                <input
                  type="color"
                  value={accent}
                  onChange={(e) => {
                    setAccent(e.target.value);
                    setActivePreset("Custom");
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </GlassContainer>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-white/50 hover:text-white bg-white/5 hover:bg-white/8 border border-white/10 rounded-lg transition-all"
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-all"
          >
            Save theme
          </button>
        </div>
      </div>
    </>
  );
};
