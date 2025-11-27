import { motion } from "framer-motion";
import { BsCheckCircleFill } from "react-icons/bs";
import { BiError } from "react-icons/bi";

interface StatusOverlayProps {
  status: string;
  error: string;
  buildVersion: string;
  onRetry: () => void;
}

export const StatusOverlay: React.FC<StatusOverlayProps> = ({
  status,
  error,
  buildVersion,
  onRetry,
}) => {
  if (!["scanning", "importing", "success", "error"].includes(status))
    return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur-lg"
    >
      {["scanning", "importing"].includes(status) && (
        <>
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-600/20 rounded-full" />
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-white/60 rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-300 mt-4 font-medium">
            {status === "scanning" ? "Finding version..." : "Importing..."}
          </p>
        </>
      )}
      {status === "success" && (
        <div className="flex flex-col items-center">
          <BsCheckCircleFill className="w-14 h-14 text-green-400" />
          <p className="text-sm text-gray-300 mt-3 font-medium">
            Imported {buildVersion}
          </p>
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center">
          <BiError className="w-14 h-14 text-red-400" />
          <p className="text-sm text-gray-300 mt-3 font-medium">{error}</p>
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all font-medium"
          >
            Try Again
          </button>
        </div>
      )}
    </motion.div>
  );
};
