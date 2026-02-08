"use client";

import React, { useState, useEffect, useCallback } from "react";
import GlassContainer from "../Global/GlassContainer";
import type { Tournament } from "./TournamentList";
import { useAuthStore } from "@/zustand/AuthStore";
import { Stellar } from "@/stellar";
import { useRoutingStore } from "@/zustand/RoutingStore";

interface SessionLeaderboardProps {
  tournament: Tournament;
  selectedWindow: number;
  onBack: () => void;
}

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
    eventId: string;
    window: number;
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
  rank: number;
  points: number;
  matchesPlayed: number;
  matchLimit: number;
  victoryRoyales: number;
  eliminations: number;
  placementPoints: number;
}

interface PlayerStatsResponse {
  data: {
    stats: PlayerStats;
  };
}

const getMedalColor = (rank: number): string => {
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

const SessionLeaderboard: React.FC<SessionLeaderboardProps> = ({
  tournament,
  selectedWindow,
  onBack,
}) => {
  const auth = useAuthStore();
  const Routing = useRoutingStore();

  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const ENTRIES_PER_PAGE = 50;

  const fetchLeaderboard = useCallback(async () => {
    if (!auth.jwt) return;

    const tournamentsRoute = Routing.Routes.get("tournaments")?.url;
    if (!tournamentsRoute) return;

    try {
      setLoading(true);

      const leaderboardPromise = Stellar.Requests.get<LeaderboardResponse>(
        `${tournamentsRoute}/${tournament.id}/leaderboard?window=${selectedWindow}&page=${page}&limit=${ENTRIES_PER_PAGE}`,
        { Authorization: `Bearer ${auth.jwt}` },
      );

      const statsPromise = auth.account?.AccountID
        ? Stellar.Requests.get<PlayerStatsResponse>(
            `${tournamentsRoute}/${tournament.id}/player/${auth.account.AccountID}?window=${selectedWindow}`,
            { Authorization: `Bearer ${auth.jwt}` },
          )
        : null;

      const [leaderboardRes, statsRes] = await Promise.all([
        leaderboardPromise,
        statsPromise,
      ]);

      const lbData = leaderboardRes.data as LeaderboardResponse;
      setEntries(lbData.data.entries || []);
      setTotalPages(lbData.data.pagination?.totalPages || 1);

      if (statsRes?.data) {
        setPlayerStats((statsRes.data as PlayerStatsResponse).data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setEntries([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [
    auth.jwt,
    auth.account?.AccountID,
    tournament.id,
    selectedWindow,
    page,
    Routing.Routes,
  ]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    setPage(1);
  }, [selectedWindow]);

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="w-full h-full flex flex-col p-4 pl-20 pt-8">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">
            {tournament.display.title}
          </h1>
          <p className="text-white/50 text-xs uppercase">
            {tournament.type} - Window {selectedWindow} Leaderboard
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
              <p className="text-white/40 text-sm">Loading leaderboard...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/40 text-sm">No entries yet</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                {entries.map((entry) => (
                  <div
                    key={entry.accountId}
                    className={`flex items-center px-3 py-2 border-b border-white/5 ${
                      entry.rank <= 3 ? "bg-white/5" : "hover:bg-white/3"
                    } transition-colors`}
                  >
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold mr-3 flex-shrink-0 ${getMedalColor(entry.rank)}`}
                    >
                      {entry.rank}
                    </div>

                    {entry.avatar ? (
                      <img
                        src={entry.avatar}
                        alt={entry.username}
                        className="w-7 h-7 rounded-full mr-3 object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full mr-3 bg-white/10 flex items-center justify-center text-white/60 text-[10px] flex-shrink-0">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <span className="flex-1 text-white text-xs truncate">
                      {entry.username}
                    </span>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-white/40 text-[9px] uppercase">
                          Matches
                        </p>
                        <p className="text-white text-xs font-semibold">
                          {entry.matchesPlayed}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/40 text-[9px] uppercase">
                          Points
                        </p>
                        <p className="text-white text-xs font-bold">
                          {entry.points}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 p-2 flex items-center justify-between">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-white/40 text-xs">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
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

            {loading ? (
              <p className="text-white/40 text-xs">Loading your stats...</p>
            ) : playerStats ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1.5 px-2 bg-white/5 border border-white/10">
                  <span className="text-white/60 text-xs">Rank</span>
                  <span className="text-white text-xs font-bold">
                    {playerStats.rank > 0 ? `#${playerStats.rank}` : "Unranked"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 bg-white/5 border border-white/10">
                  <span className="text-white/60 text-xs">Total Points</span>
                  <span className="text-white text-xs font-bold">
                    {playerStats.points}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 bg-white/5 border border-white/10">
                  <span className="text-white/60 text-xs">Matches Played</span>
                  <span className="text-white text-xs font-bold">
                    {playerStats.matchesPlayed}/{playerStats.matchLimit}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 bg-white/5 border border-white/10">
                  <span className="text-white/60 text-xs">Victory Royales</span>
                  <span className="text-white text-xs font-bold">
                    {playerStats.victoryRoyales}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 bg-white/5 border border-white/10">
                  <span className="text-white/60 text-xs">Eliminations</span>
                  <span className="text-white text-xs font-bold">
                    {playerStats.eliminations}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 bg-white/5 border border-white/10">
                  <span className="text-white/60 text-xs">
                    Placement Points
                  </span>
                  <span className="text-white text-xs font-bold">
                    {playerStats.placementPoints}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-white/40 text-xs">
                No stats available for this window
              </p>
            )}
          </GlassContainer>
        </div>
      </div>
    </div>
  );
};

export default SessionLeaderboard;
