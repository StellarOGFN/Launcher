"use client";

import React, { useState, useEffect, useCallback } from "react";
import GlassContainer from "../Global/GlassContainer";
import type { Tournament } from "./TournamentList";
import SessionLeaderboard from "./SessionLeaderboard";
import { useAuthStore } from "@/zustand/AuthStore";
import { Stellar } from "@/stellar";
import { useRoutingStore } from "@/zustand/RoutingStore";

interface TournamentEventWindowProps {
  tournament: Tournament;
  onBack: () => void;
}

interface ScoringValue {
  Value: number;
  Points: number;
  Multiply: boolean;
}

interface ScoringRule {
  Stat: string;
  Type: string;
  Value: ScoringValue[];
}

interface PayoutReward {
  [key: string]: string | number | boolean | undefined;
  value?: string;
  Value?: string;
  quantity?: number;
  Quantity?: number;
}

interface PayoutValue {
  Value: PayoutReward[];
  Threshold: number;
}

interface TournamentWindow {
  eventWindowId?: string;
  WindowId?: string;
  round?: number;
  Round?: number;
  beginTime?: string;
  Start?: string;
  endTime?: string;
  End?: string;
  isTBD?: boolean;
  TBD?: boolean;
  canLiveSpectate?: boolean;
  CanLiveSpectate?: boolean;
  payouts?: any[];
}

interface TournamentDetails {
  data: {
    id: string;
    type: string;
    status: string;
    schedule: {
      start: string;
      end: string;
      date: string;
      time: string;
    };
    display: {
      title: string;
      subtitle: string;
      image: string;
    };
    rules: {
      scoring: ScoringRule[];
      payout: {
        Value: PayoutValue[];
        ScoreId: string;
        ScoreType: string;
      };
    };
    windows?: TournamentWindow[];
  };
}

interface WindowStats {
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
    stats: WindowStats;
  };
}

interface FormattedPrize {
  place: string;
  prize: string;
  threshold: number;
}

interface FormattedScoringRule {
  placement: string;
  points: string;
}

type WindowStatus = "upcoming" | "live" | "ended";

const extractWindowNumber = (windowId: string | undefined): number => {
  if (!windowId) return 1;
  const match = windowId.match(/window[_-]?(\d+)/i);
  return match ? parseInt(match[1], 10) : 1;
};

const getWindowId = (window: TournamentWindow): string => {
  return window.eventWindowId || window.WindowId || "";
};

const getWindowRound = (window: TournamentWindow): number => {
  return window.round ?? window.Round ?? 1;
};

const getWindowStart = (window: TournamentWindow): string => {
  return window.beginTime || window.Start || "";
};

const getWindowEnd = (window: TournamentWindow): string => {
  return window.endTime || window.End || "";
};

const getLatestWindowNumber = (windows: TournamentWindow[]): number => {
  if (windows.length === 0) return 1;
  const windowNumbers = windows.map((w) => extractWindowNumber(getWindowId(w)));
  return Math.max(...windowNumbers);
};

const getWindowStatus = (window: TournamentWindow): WindowStatus => {
  const now = new Date();
  const start = new Date(getWindowStart(window));
  const end = new Date(getWindowEnd(window));

  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "live";
};

const formatWindowTime = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return `${formatTime(startDate)} - ${formatTime(endDate)}`;
};

const getActualValue = (obj: PayoutReward, key: string): any => {
  const lowerKey = key.toLowerCase();
  const upperKey = key.charAt(0).toUpperCase() + key.slice(1);

  return obj[lowerKey] ?? obj[upperKey];
};

const formatScoringRules = (rules: ScoringRule[]): FormattedScoringRule[] => {
  const formattedRules: FormattedScoringRule[] = [];

  rules.forEach((rule) => {
    if (rule.Stat === "PLACEMENT_STAT_INDEX") {
      rule.Value.forEach((val) => {
        const placement =
          val.Value === 1 ? "Victory Royale" : `Top ${val.Value}`;
        formattedRules.push({
          placement,
          points: `${val.Points} pts`,
        });
      });
    } else if (rule.Stat === "TEAM_ELIMS_STAT_INDEX") {
      rule.Value.forEach((val) => {
        if (val.Multiply) {
          formattedRules.push({
            placement: "Each Elimination",
            points: `${val.Points} pt`,
          });
        }
      });
    }
  });

  return formattedRules;
};

const formatPayout = async (payouts: any[]): Promise<FormattedPrize[]> => {
  const formattedPayouts = await Promise.all(
    payouts.map(async (payout, index) => {
      const rewardValue = payout.value || "";
      const rewardQuantity = payout.quantity || 0;
      const threshold = payout.pointsThreshold || index + 1;

      let displayName = "";

      const cosmeticPattern = /Athena\w*:(.+)/;
      const cosmeticMatch =
        typeof rewardValue === "string"
          ? rewardValue.match(cosmeticPattern)
          : null;

      if (cosmeticMatch?.[1]) {
        const cosmeticId = cosmeticMatch[1];
        try {
          const response = await fetch(
            `https://fortnite-api.com/v2/cosmetics/br/${cosmeticId}?responseFlags=6`,
          );
          if (response.ok) {
            const data = await response.json();
            displayName = data.data?.name || cosmeticId;
          } else {
            displayName = cosmeticId;
          }
        } catch {
          displayName = cosmeticId;
        }
      } else if (typeof rewardValue === "string" && rewardValue.includes(":")) {
        const parts = rewardValue.split(":");
        const currencyPart = parts[1];
        displayName = currencyPart === "MtxGiveaway" ? "V-Bucks" : currencyPart;
      } else if (rewardValue === "MtxGiveaway") {
        displayName = "V-Bucks";
      } else {
        displayName = "V-Bucks";
      }

      return {
        place: `Top ${threshold}`,
        prize: `${Number(rewardQuantity).toLocaleString()}x ${displayName}`,
        threshold: threshold,
      };
    }),
  );

  return formattedPayouts.sort((a, b) => a.threshold - b.threshold);
};

const TournamentEventWindow: React.FC<TournamentEventWindowProps> = ({
  tournament,
  onBack,
}) => {
  const auth = useAuthStore();
  const Routing = useRoutingStore();

  const [activeTab, setActiveTab] = useState<"details" | "leaderboard">(
    "details",
  );
  const [selectedWindow, setSelectedWindow] = useState<number>(1);
  const [details, setDetails] = useState<TournamentDetails | null>(null);
  const [windowStats, setWindowStats] = useState<Map<number, WindowStats>>(
    new Map(),
  );
  const [prizePool, setPrizePool] = useState<FormattedPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingWindow, setLoadingWindow] = useState(false);

  const fetchWindowStats = useCallback(
    async (windowNumber: number) => {
      if (!auth.jwt || !auth.account?.AccountID) return;

      const tournamentsRoute = Routing.Routes.get("tournaments")?.url;
      if (!tournamentsRoute) return;

      try {
        setLoadingWindow(true);

        const response = await Stellar.Requests.get<PlayerStatsResponse>(
          `${tournamentsRoute}/${tournament.id}/player/${auth.account.AccountID}?window=${windowNumber}`,
          { Authorization: `Bearer ${auth.jwt}` },
        );

        if (response.data?.data?.stats) {
          setWindowStats((prev) => {
            const newMap = new Map(prev);
            newMap.set(windowNumber, response.data.data.stats);
            return newMap;
          });
        }
      } catch (err) {
        console.error(`Failed to fetch window ${windowNumber} stats:`, err);
      } finally {
        setLoadingWindow(false);
      }
    },
    [auth.jwt, auth.account?.AccountID, tournament.id, Routing.Routes],
  );

  const fetchTournamentData = useCallback(async () => {
    if (!auth.jwt || !auth.account?.AccountID) return;

    const tournamentsRoute = Routing.Routes.get("tournaments")?.url;
    if (!tournamentsRoute) return;

    try {
      setLoading(true);

      const response = await Stellar.Requests.get<TournamentDetails>(
        `${tournamentsRoute}/${tournament.id}`,
        { Authorization: `Bearer ${auth.jwt}` },
      );

      const tournamentDetails = response.data as TournamentDetails;
      setDetails(tournamentDetails);

      const windows = tournamentDetails?.data?.windows || [];
      const latestWindow = getLatestWindowNumber(windows);
      setSelectedWindow(latestWindow);

      const currentWindow = windows.find(
        (w) => extractWindowNumber(getWindowId(w)) === latestWindow,
      );

      if (currentWindow?.payouts) {
        const formattedPrizes = await formatPayout(currentWindow.payouts);
        setPrizePool(formattedPrizes);
      } else if (tournamentDetails?.data?.rules?.payout) {
        const formattedPrizes = await formatPayout(
          tournamentDetails.data.rules.payout.Value.flatMap((v) => v.Value),
        );
        setPrizePool(formattedPrizes);
      }

      await fetchWindowStats(latestWindow);
    } catch (err) {
      console.error("Failed to fetch tournament data:", err);
    } finally {
      setLoading(false);
    }
  }, [
    auth.jwt,
    auth.account?.AccountID,
    tournament.id,
    Routing.Routes,
    fetchWindowStats,
  ]);

  useEffect(() => {
    fetchTournamentData();
  }, [fetchTournamentData]);

  useEffect(() => {
    if (!windowStats.has(selectedWindow)) {
      fetchWindowStats(selectedWindow);
    }

    if (details?.data?.windows) {
      const currentWindow = details.data.windows.find(
        (w) => extractWindowNumber(getWindowId(w)) === selectedWindow,
      );

      if (currentWindow?.payouts) {
        formatPayout(currentWindow.payouts).then(setPrizePool);
      } else if (details?.data?.rules?.payout) {
        formatPayout(
          details.data.rules.payout.Value.flatMap((v) => v.Value),
        ).then(setPrizePool);
      }
    }
  }, [selectedWindow, windowStats, fetchWindowStats, details]);

  if (activeTab === "leaderboard") {
    return (
      <SessionLeaderboard
        tournament={tournament}
        selectedWindow={selectedWindow}
        onBack={() => setActiveTab("details")}
      />
    );
  }

  if (loading || !details) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-white/40 text-sm">Loading tournament details...</p>
      </div>
    );
  }

  const windows = details.data.windows || [];
  const currentStats = windowStats.get(selectedWindow);
  const scoringRules = formatScoringRules(details.data.rules.scoring);
  const isUpcoming = details.data.status === "upcoming";
  const currentWindow = windows.find(
    (w) => extractWindowNumber(getWindowId(w)) === selectedWindow,
  );

  const isWindowUpcoming =
    currentWindow && getWindowStatus(currentWindow) === "upcoming";
  const shouldShowOverlay =
    isUpcoming || isWindowUpcoming || !currentStats || loadingWindow;

  return (
    <div className="w-full h-full flex flex-col p-4 pl-20 pt-8">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">
            {details.data.display.title}
          </h1>
          <p className="text-white/50 text-xs uppercase">{details.data.type}</p>
        </div>
        <div className="flex gap-2 relative z-50">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Leaderboard
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>

      {windows.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {windows
            .sort(
              (a, b) =>
                extractWindowNumber(getWindowId(a)) -
                extractWindowNumber(getWindowId(b)),
            )
            .map((window) => {
              const windowNum = extractWindowNumber(getWindowId(window));
              const status = getWindowStatus(window);
              const isActive = selectedWindow === windowNum;

              return (
                <button
                  key={getWindowId(window)}
                  onClick={() => setSelectedWindow(windowNum)}
                  className={`px-4 py-2 text-xs font-semibold transition-all border whitespace-nowrap ${
                    isActive
                      ? "bg-white/20 border-white/30 text-white"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>Window {windowNum}</span>
                    {status === "upcoming" && (
                      <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                    )}
                    {status === "ended" && (
                      <span className="w-2 h-2 bg-gray-500 rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
        </div>
      )}

      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        <div className="overflow-auto space-y-3">
          <GlassContainer
            className={`p-3 border border-white/10 relative ${
              shouldShowOverlay ? "opacity-40" : ""
            }`}
          >
            {isWindowUpcoming && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <p className="text-white/80 text-xs font-semibold">
                  Window Not Started
                </p>
              </div>
            )}
            {loadingWindow && !isUpcoming && !isWindowUpcoming && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <p className="text-white/80 text-xs font-semibold">
                  Loading...
                </p>
              </div>
            )}
            {isUpcoming && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <p className="text-white/80 text-xs font-semibold">
                  Tournament Not Started
                </p>
              </div>
            )}

            <div className="mb-3">
              <h3 className="text-white text-sm font-bold">
                Window {selectedWindow}
              </h3>
              <p className="text-white/40 text-[10px]">
                {currentWindow
                  ? formatWindowTime(
                      getWindowStart(currentWindow),
                      getWindowEnd(currentWindow),
                    )
                  : details.data.schedule.time}
              </p>
            </div>

            {currentStats && (
              <>
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">
                      Victory Royale
                    </span>
                    <span className="text-white text-xs font-semibold">
                      {currentStats.victoryRoyales}{" "}
                      <span className="text-white/30">pts</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">Eliminations</span>
                    <span className="text-white text-xs font-semibold">
                      {currentStats.eliminations}{" "}
                      <span className="text-white/30">pts</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">Placement</span>
                    <span className="text-white text-xs font-semibold">
                      {currentStats.placementPoints}{" "}
                      <span className="text-white/30">pts</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-6 pt-3 border-t border-white/10">
                  <div>
                    <p className="text-white/40 text-[9px] uppercase mb-1">
                      Matches
                    </p>
                    <p className="text-white text-lg font-bold">
                      {currentStats.matchesPlayed}
                      <span className="text-white/40 text-sm">
                        /{currentStats.matchLimit}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-[9px] uppercase mb-1">
                      Total Points
                    </p>
                    <p className="text-white text-lg font-bold">
                      {currentStats.points}
                    </p>
                  </div>
                  {currentStats.rank > 0 && (
                    <div>
                      <p className="text-white/40 text-[9px] uppercase mb-1">
                        Rank
                      </p>
                      <p className="text-white text-lg font-bold">
                        #{currentStats.rank}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </GlassContainer>

          <GlassContainer className="p-3 border border-white/10">
            <h3 className="text-white text-sm font-bold mb-3">Scoring</h3>
            <div className="grid grid-cols-2 gap-2">
              {scoringRules.map((score, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-white/5 border border-white/10"
                >
                  <span className="text-white/70 text-xs">
                    {score.placement}
                  </span>
                  <span className="text-white text-xs font-bold">
                    {score.points}
                  </span>
                </div>
              ))}
            </div>
          </GlassContainer>
        </div>

        <div className="overflow-auto">
          <GlassContainer className="p-3 border border-white/10">
            <h3 className="text-white text-sm font-bold mb-3">Prize Pool</h3>
            <div className="space-y-2">
              {prizePool.map((prize, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-1.5 px-2 bg-white/5 border border-white/10"
                >
                  <span className="text-white/70 text-xs font-semibold">
                    {prize.place}
                  </span>
                  <span className="text-white text-xs font-bold">
                    {prize.prize}
                  </span>
                </div>
              ))}
            </div>
          </GlassContainer>
        </div>
      </div>
    </div>
  );
};

export default TournamentEventWindow;
