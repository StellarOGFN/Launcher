import { motion } from "framer-motion";
import { HiX } from "react-icons/hi";
import GlassContainer from "@/components/Global/GlassContainer";
import { getBuildImage } from "@/utils/buildUtils";

interface BuildPreviewProps {
  buildVersion: string;
  buildRelease: string;
  onClose: () => void;
  isProcessing: boolean;
  status: string;
}

export const BuildPreview: React.FC<BuildPreviewProps> = ({
  buildVersion,
  buildRelease,
  onClose,
  isProcessing,
  status,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative w-full h-56 overflow-hidden flex"
  >
    <div className="absolute inset-0 flex">
      <div className="flex-1 bg-gradient-to-r from-black via-black/30 to-transparent absolute inset-0 z-10" />
      <img
        src={getBuildImage(buildVersion)}
        alt={`${buildVersion}`}
        className="w-full h-full object-cover object-right"
      />
    </div>

    {status !== "success" && (
      <div className="relative z-20 w-full h-full flex items-end justify-start p-4">
        <GlassContainer className="border border-white/20 px-3 py-2 rounded-md w-fit">
          <p className="font-semibold text-gray-300 leading-snug">
            Fortnite {buildVersion}
          </p>
          <p className="text-xs text-gray-400 font-mono leading-snug">
            ++Fortnite+Release-{buildRelease}
          </p>
        </GlassContainer>
      </div>
    )}

    <button
      onClick={onClose}
      disabled={isProcessing}
      className="absolute top-4 rounded-md right-4 p-1 bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-white/15 z-30"
    >
      <HiX className="w-5 h-5" />
    </button>
  </motion.div>
);
