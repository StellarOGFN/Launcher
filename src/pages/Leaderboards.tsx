import React, { useState, useCallback, useEffect } from "react";
import GlassContainer from "../components/Global/GlassContainer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/zustand/AuthStore";
import { Stellar } from "@/stellar";
import { useRoutingStore } from "@/zustand/RoutingStore";

interface LeaderboardEntry {
  rank: number;
  accountId: string;
  username: string;
  avatar?: string;
  wins: number;
  matchesPlayed: number;
  hype: number;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  sortBy: string;
}

const Leaderboards: React.FC = () => {
  const auth = useAuthStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [page, setPage] = useState(1);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageInput, setPageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(false);
  const Routing = useRoutingStore();

  const page_limit = 7;

  const goToUserRankPage = () => {
    if (!userRank || userRank.rank <= 0) return;

    const targetPage = Math.ceil(userRank.rank / page_limit);

    if (targetPage >= 1 && targetPage <= totalPages) {
      setPage(targetPage);
    }
  };

  const fetchLeaderboard = useCallback(async () => {
    if (!auth.jwt || !auth.base) return;

    const leaderboardRoute = Routing.Routes.get("leaderboards")?.url;
    if (!leaderboardRoute) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);
      const req = await Stellar.Requests.get<LeaderboardResponse>(
        `${leaderboardRoute}?page=${page}&limit=${page_limit}`,
        { Authorization: `Bearer ${auth.jwt}` },
      );

      const res = req.data as LeaderboardResponse;
      console.log(req.data);
      setEntries(res.entries || []);
      setTotalPages(res.pagination?.totalPages || 0);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setEntries([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, auth.jwt, auth.base, Routing.Routes]);

  const confirmPageChange = () => {
    const value = Number(pageInput);

    if (!Number.isNaN(value)) {
      const clamped = Math.min(
        Math.max(1, value),
        totalPages || 1,
      );
      setPage(clamped);
    }

    setIsEditingPage(false);
  };

  const fetchUserRank = useCallback(async () => {
    if (!auth.jwt || !auth.base || !auth.account?.AccountID) return;

    try {
      const req = await Stellar.Requests.get<LeaderboardEntry>(
        `https://prod-api-v1.stellarfn.dev/stellar/launcher/v1/leaderboards/rank/${auth.account.AccountID}`,
        { Authorization: `Bearer ${auth.jwt}` },
      );

      const res = req.data as LeaderboardEntry;
      setUserRank(res);
    } catch (err) {
      console.error("Failed to fetch user rank:", err);
    }
  }, [auth.jwt, auth.base, auth.account?.AccountID, Routing.Routes]);

  useEffect(() => {
    fetchLeaderboard();
    fetchUserRank();
  }, [fetchLeaderboard, fetchUserRank]);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/20 text-yellow-400";
      case 2:
        return "bg-gray-400/20 text-gray-300";
      case 3:
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-white/5 text-white/40";
    }
  };

  if (error) {
    return (
      <div className="w-full h-full p-6 flex flex-col relative">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full relative z-10">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-1">Leaderboards</h1>
            <p className="text-white/40 text-sm">Global hype rankings</p>
          </div>

          <GlassContainer className="flex-1 border border-white/10 rounded-md flex items-center justify-center">
            <div className="text-center px-6 py-12">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Unable to Load Leaderboards
              </h2>
              <p className="text-white/60 text-sm mb-6">
                We couldn't connect to the leaderboard service. Please restart
                your launcher to try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Reload
              </button>
            </div>
          </GlassContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 flex flex-col relative">
      {userRank && userRank.rank > 0 && (
        <GlassContainer className="absolute top-6 right-6 p-2 mt-4 border border-white/10 rounded-md w-48 h-auto z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {userRank.avatar && (
                <img
                  src={userRank.avatar}
                  alt={userRank.username}
                  className="w-8 h-8 rounded-md object-cover rounded-md"
                />
              )}
              <div className="flex flex-col">
                <p className="text-white text-sm font-medium">
                  {userRank.username}
                </p>
                <button
                  onClick={goToUserRankPage}
                  className="text-white/40 text-xs hover:text-white transition-colors"
                  title="Go to your position in the leaderboard"
                >
                  Rank #{userRank.rank.toLocaleString()}
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white text-sm font-semibold">
                {userRank.hype.toLocaleString()}
              </p>
              <p className="text-white/40 text-xs">Hype</p>
            </div>
          </div>
        </GlassContainer>
      )}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Leaderboards</h1>
          <p className="text-white/40 text-sm">Global hype rankings</p>
        </div>

        <GlassContainer className="flex-1 border border-white/10 rounded-md overflow-hidden w-full min-w-5xl mx-auto flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/40 text-sm">Loading...</p>
            </div>
          ) : (
            <>
              <div className="flex-1 divide-y divide-white/5 overflow-y-auto">
                {entries.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-white/40 text-sm">No entries found</p>
                  </div>
                ) : (
                  entries.map((entry) => {
                    const isCurrentUser =
                      entry.accountId === auth.account?.AccountID;

                    return (
                      <div
                        key={entry.accountId}
                        className={`p-3 flex items-center justify-between transition-colors ${
                          isCurrentUser ? "bg-white/8" : "hover:bg-white/3"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {entry.avatar && (
                            <img
                              src={entry.avatar}
                              alt={entry.username}
                              className="w-7 h-7 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div
                            className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${getMedalColor(
                              entry.rank,
                            )}`}
                          >
                            {entry.rank}
                          </div>
                          <p
                            className={`text-sm font-medium truncate ${
                              isCurrentUser ? "text-white" : "text-white/70"
                            }`}
                          >
                            {entry.username}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                          {/* <div className="text-center">
                            <p
                              className={`text-sm font-semibold ${isCurrentUser ? "text-white" : "text-white/60"}`}
                            >
                              {entry.wins.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-white/40 mt-0.5">
                              Wins
                            </p>
                          </div>
                          <div className="w-px h-8 bg-white/10"></div>
                          <div className="text-center">
                            <p
                              className={`text-sm font-semibold ${isCurrentUser ? "text-white" : "text-white/60"}`}
                            >
                              {entry.matchesPlayed.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-white/40 mt-0.5">
                              Matches
                            </p>
                          </div>
                          <div className="w-px h-8 bg-white/10"></div> */}
                          <div className="text-center">
                            <p
                              className={`text-sm font-semibold ${isCurrentUser ? "text-white" : "text-white/60"}`}
                            >
                              {entry.hype.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-white/40 mt-0.5">
                              Hype
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-white/5 p-3 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                >
                  <ChevronLeft size={16} className="text-white/60" />
                </button>
                {isEditingPage ? (
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <span>Page</span>
                    <input
                      autoFocus
                      type="number"
                      min={1}
                      max={totalPages}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      onBlur={confirmPageChange}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => {
                        if (
                          ["e", "E", "+", "-", "."].includes(e.key)
                        ) {
                          e.preventDefault();
                        }
                        if (e.key === "Enter") confirmPageChange();
                        if (e.key === "Escape") setIsEditingPage(false);
                      }}
                      className="w-12 bg-white/10 border border-white/20 rounded px-1 py-0.5 text-white text-xs text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span>of {totalPages}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setPageInput(String(page));
                      setIsEditingPage(true);
                    }}
                    className="text-xs text-white/40 hover:text-white transition-colors"
                  >
                    Page {page} of {totalPages}
                  </button>
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                >
                  <ChevronRight size={16} className="text-white/60" />
                </button>
              </div>
            </>
          )}
        </GlassContainer>
      </div>
    </div>
  );
};

export default Leaderboards;
