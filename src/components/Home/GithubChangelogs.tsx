import React, { useEffect, useState } from "react";
import GlassContainer from "../Global/GlassContainer";
import { openUrl } from "@tauri-apps/plugin-opener";
import { GrGithub } from "react-icons/gr";
import { Stellar } from "@/stellar";
import { useRoutingStore } from "@/zustand/RoutingStore";

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author?: {
    login: string;
  };
}

const GithubChangelogs: React.FC<{
  className?: string;
  onClick?: () => void;
}> = ({ className = "", onClick }) => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const Routing = useRoutingStore();

  useEffect(() => {
    const publicRoute = Routing.Routes.get("public");
    if (!publicRoute) {
      setError("error: route not found");
      setLoading(false);
      return;
    }

    Stellar.Requests.get<any[]>(`${publicRoute.url}/github`)
      .then((res) => {
        if (res.ok && res.data) {
          setCommits(res.data);
        } else {
          setError("failed to fetch commits");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [Routing]);

  if (loading)
    return (
      <GlassContainer
        className={`p-6 text-white flex items-center justify-center rounded-lg space-y-4 max-h-[200px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent ${className} bg-glass-noise`}
        onClick={onClick}
      >
        Loading commits...
      </GlassContainer>
    );

  if (error)
    return (
      <GlassContainer
        className={`p-6 rounded-lg text-white space-y-4 max-h-[200px] flex items-center justify-center w-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent ${className} bg-glass-noise`}
        onClick={onClick}
      >
        Failed to load: {error}
      </GlassContainer>
    );

  return (
    <GlassContainer
      className={`p-6 rounded-lg space-y-4 max-h-[200px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent ${className} bg-glass-noise`}
      onClick={onClick}
      style={{ minWidth: 300 }}
    >
      <h2 className="flex flex-row gap-2 items-center justify-start text-white">
        <GrGithub className="w-5 h-5" /> Launcher Updates
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {commits.map(({ sha, commit, author }) => (
          <div
            key={sha}
            className="p-4 rounded-md bg-white/10 hover:bg-white/20 transition-colors select-none"
            title={commit.message}
          >
            <p className="text-xs text-gray-300 mb-1">
              {new Date(commit.author.date).toLocaleString()}
            </p>
            <h4 className="text-white font-semibold mt-1 line-clamp-2">
              {commit.message}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              by{" "}
              {author?.login ? (
                <a
                  onClick={() => openUrl(`https://github.com/${author.login}`)}
                  className="text-gray-400 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  {commit.author.name}
                </a>
              ) : (
                <span>{commit.author.name}</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </GlassContainer>
  );
};

export default GithubChangelogs;
