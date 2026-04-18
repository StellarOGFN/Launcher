import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface ColorStop {
  c1: string;
  c2: string;
  c3: string;
  base: string;
}

export interface GradientModalProps {
  open: boolean;
  onClose: () => void;
  initialStops: ColorStop;
  initialAngle: number;
  onApply: (stops: ColorStop, angle: number) => void;
}

const Angle: React.FC<{
  angle: number;
  onChange: (a: number) => void;
}> = ({ angle, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const getAngleFromEvent = (e: MouseEvent | React.MouseEvent) => {
    if (!ref.current) return 0;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = Math.atan2(e.clientY - cy, e.clientX - cx);
    return Math.round(((rad * 180) / Math.PI + 90 + 360) % 360);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    onChange(getAngleFromEvent(e));
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dragging.current) onChange(getAngleFromEvent(e));
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  const rad = ((angle - 90) * Math.PI) / 180;
  const r = 18;
  const dotX = 24 + r * Math.cos(rad);
  const dotY = 24 + r * Math.sin(rad);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-[11px] text-white/40">Angle</p>
      <div
        ref={ref}
        onMouseDown={handleMouseDown}
        className="relative w-12 h-12 rounded-full cursor-pointer select-none"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <svg width="48" height="48" className="absolute inset-0">
          <line
            x1="24"
            y1="24"
            x2={dotX}
            y2={dotY}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
          />
          <circle cx={dotX} cy={dotY} r="3.5" fill="white" fillOpacity="0.9" />
          <circle cx="24" cy="24" r="2" fill="rgba(255,255,255,0.3)" />
        </svg>
      </div>
      <p className="text-[11px] text-white/40 font-mono tabular-nums">
        {angle}°
      </p>
    </div>
  );
};

const Stop: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  active: boolean;
  onClick: () => void;
}> = ({ label, value, onChange, active, onClick }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[11px] text-white/40">{label}</p>
      <button
        onClick={() => {
          onClick();
          inputRef.current?.click();
        }}
        className="relative w-14 h-14 rounded-xl transition-all duration-200"
        style={{
          background: value,
          border: active
            ? "2px solid rgba(255,255,255,0.6)"
            : "1.5px solid rgba(255,255,255,0.15)",
          boxShadow: active ? `0 0 16px ${value}60` : "none",
        }}
      >
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </button>
      <p className="text-[10px] text-white/25 font-mono">{value}</p>
    </div>
  );
};

export const GradientModal: React.FC<GradientModalProps> = ({
  open,
  onClose,
  initialStops,
  initialAngle,
  onApply,
}) => {
  const [stops, setStops] = useState(initialStops);
  const [angle, setAngle] = useState(initialAngle);
  const [activeStop, setActiveStop] = useState<keyof ColorStop | null>(null);

  useEffect(() => {
    if (open) {
      setStops(initialStops);
      setAngle(initialAngle);
      setActiveStop(null);
    }
  }, [open]);

  const preview = `linear-gradient(${angle}deg, ${stops.c1}, ${stops.c2}, ${stops.c3}, ${stops.base})`;

  const stopFields: Array<{ key: keyof ColorStop; label: string }> = [
    { key: "c1", label: "Stop 1" },
    { key: "c2", label: "Stop 2" },
    { key: "c3", label: "Stop 3" },
    { key: "base", label: "Base" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[400px] rounded-lg overflow-hidden shadow-lg"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.08) 100%)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)",
              }}
            />

            <div className="relative h-20 w-full overflow-hidden">
              <div
                className="absolute inset-0 transition-all duration-500"
                style={{ background: preview }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              <div className="absolute top-3 left-4 right-4 flex items-end justify-between">
                <p className="text-sm text-white/40 font-semibold text-white drop-shadow-md">
                  Editor
                </p>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:text-white transition-colors"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            <div className="relative p-5 flex flex-col gap-5">
              <div className="flex items-end justify-between">
                {stopFields.map(({ key, label }) => (
                  <Stop
                    key={key}
                    label={label}
                    value={stops[key]}
                    onChange={(v) =>
                      setStops((prev) => ({ ...prev, [key]: v }))
                    }
                    active={activeStop === key}
                    onClick={() => setActiveStop(key)}
                  />
                ))}
                <Angle angle={angle} onChange={setAngle} />
              </div>

              <div
                className="w-full h-2.5 rounded-full overflow-hidden relative"
                style={{
                  background: preview,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  className="absolute inset-y-0 w-0.5 bg-white/80"
                  style={{ left: `${(angle / 360) * 100}%` }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 text-sm text-white/50 hover:text-white transition-all rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.09)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.05)")
                  }
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onApply(stops, angle);
                    onClose();
                  }}
                  className="flex-1 py-2 text-sm text-white transition-all rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.18)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.12)")
                  }
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
