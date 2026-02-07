"use client";

import React, { useState, useEffect, useCallback } from "react";
import GlassContainer from "../Global/GlassContainer";
import type { Tournament } from "./TournamentList";
import { useAuthStore } from "@/zustand/AuthStore";
import { Stellar } from "@/stellar";
import { useRoutingStore } from "@/zustand/RoutingStore";

interface LeaderboardEntry {
  rank: number;
  accountId: string;
  username: string;
  avatar?: string;
  points: number;
  matchesPlayed: number;
  victoryRoyales: number;
  eliminations: number;
}

interface LeaderboardResponse {
  data: {
    entries: LeaderboardEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface PlayerStats {
  data: {
    stats: {
      rank: number;
      points: number;
      matchesPlayed: number;
      matchLimit: number;
      victoryRoyales: number;
      eliminations: number;
      placementPoints: number;
    };
  };
}

interface SessionLeaderboardProps {
  tournament: Tournament;
  onBack: () => void;
}

const SessionLeaderboard: React.FC<SessionLeaderboardProps> = ({
  tournament,
  onBack,
}) => {
  const auth = useAuthStore();
  const Routing = useRoutingStore();
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const entriesPerPage = 10;

  const fetchLeaderboard = useCallback(async () => {
    if (!auth.jwt || !auth.base) return;

    const tournamentsRoute = Routing.Routes.get("tournaments")?.url;
    if (!tournamentsRoute) return;

    try {
      setLoading(true);

      const leaderboardReq = Stellar.Requests.get<LeaderboardResponse>(
        `${tournamentsRoute}/${tournament.id}/leaderboard?window=1&page=${page}&limit=${entriesPerPage}`,
        { Authorization: `Bearer ${auth.jwt}` },
      );

      const statsReq = auth.account?.AccountID
        ? Stellar.Requests.get<PlayerStats>(
            `${tournamentsRoute}/${tournament.id}/player/${auth.account.AccountID}?window=1`,
            { Authorization: `Bearer ${auth.jwt}` },
          )
        : null;

      const [leaderboardRes, statsRes] = await Promise.all([
        leaderboardReq,
        statsReq,
      ]);

      const lbData = leaderboardRes.data as LeaderboardResponse;
      setEntries(lbData.data.entries || []);
      setTotalPages(lbData.data.pagination?.totalPages || 0);

      if (statsRes) {
        setPlayerStats(statsRes.data as PlayerStats);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [
    auth.jwt,
    auth.base,
    auth.account?.AccountID,
    tournament.id,
    page,
    Routing.Routes,
  ]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

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

  return (
    <div className="w-full h-full flex flex-col p-4 pl-20 pt-8">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">
            {tournament.display.title}
          </h1>
          <p className="text-white/50 text-xs uppercase">
            {tournament.type} - Session Leaderboard
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition-colors relative z-50"
        >
          Back
        </button>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        <GlassContainer className="border border-white/10 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-white/10">
            <h2 className="text-white text-sm font-bold">Top Players</h2>
          </div>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/40 text-sm">Loading...</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                {entries.map((entry) => (
                  <div
                    key={entry.accountId}
                    className={`flex items-center px-3 py-2 border-b border-white/5 ${
                      entry.rank <= 3 ? "bg-white/5" : "hover:bg-white/3"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold mr-3 ${getMedalColor(entry.rank)}`}
                    >
                      {entry.rank}
                    </div>
                    {entry.avatar ? (
                      <img
                        src={entry.avatar}
                        alt={entry.username}
                        className="w-6 h-6 rounded-full mr-3 object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full mr-3 bg-white/10 flex items-center justify-center text-white/60 text-[10px]">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="flex-1 text-white text-xs truncate">
                      {entry.username}
                    </span>
                    <span className="text-white text-xs font-bold">
                      {entry.points}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 p-2 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-white/40 text-xs">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </GlassContainer>

        <div className="overflow-auto">
          <GlassContainer className="border border-white/10 p-3">
            <h2 className="text-white text-sm font-bold mb-3">Your Stats</h2>
            {playerStats ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1.5 px-2 bg-white/5 border border-white/10">
                  <span className="text-white/60 text-xs">Rank</span>
                  <span className="text-white text-xs font-bold">
                    #{playerStats.data.stats.rank}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 bg-white/5 border border-white/10">
                  <span className="text-white/60 text-xs">Total Points</span>
                  <span className="text-white text-xs font-bold">
                    {playerStats.data.stats.points}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 bg-white/5 border border-white/10">
                  <span className="text-white/60 text-xs">Matches Played</span>
                  <span className="text-white text-xs font-bold">
                    {playerStats.data.stats.matchesPlayed}/
                    {playerStats.data.stats.matchLimit}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 bg-white/5 border border-white/10">
                  <span className="text-white/60 text-xs">Victory Royales</span>
                  <span className="text-white text-xs font-bold">
                    {playerStats.data.stats.victoryRoyales}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 bg-white/5 border border-white/10">
                  <span className="text-white/60 text-xs">Eliminations</span>
                  <span className="text-white text-xs font-bold">
                    {playerStats.data.stats.eliminations}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 bg-white/5 border border-white/10">
                  <span className="text-white/60 text-xs">
                    Placement Points
                  </span>
                  <span className="text-white text-xs font-bold">
                    {playerStats.data.stats.placementPoints}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-white/40 text-xs">Loading your stats...</p>
            )}
          </GlassContainer>
        </div>
      </div>
    </div>
  );
};

export default SessionLeaderboard;
