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
  [key: string]: string | number | undefined;
  value?: string;
  Value?: string;
  quantity?: number;
  Quantity?: number;
  rewardMode?: string;
  RewardMode?: string;
  rewardType?: string;
  RewardType?: string;
}

interface PayoutValue {
  Value: PayoutReward[];
  Threshold: number;
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

const TournamentEventWindow: React.FC<TournamentEventWindowProps> = ({
  tournament,
  onBack,
}) => {
  const auth = useAuthStore();
  const Routing = useRoutingStore();
  const [activeTab, setActiveTab] = useState<"details" | "leaderboard">(
    "details",
  );
  const [details, setDetails] = useState<TournamentDetails | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [prizePool, setPrizePool] = useState<
    Array<{ place: string; prize: string; threshold: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  const getActualValue = (obj: PayoutReward, key: string): any => {
    const lowerKey = key.toLowerCase();
    const upperKey = key.charAt(0).toUpperCase() + key.slice(1);

    if (obj[lowerKey] !== undefined) return obj[lowerKey];
    if (obj[upperKey] !== undefined) return obj[upperKey];
    return undefined;
  };

  const formatScoringRules = (rules: ScoringRule[]) => {
    const formattedRules: Array<{ placement: string; points: string }> = [];

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

  const formatPayout = async (
    payout: TournamentDetails["data"]["rules"]["payout"],
  ) => {
    const formattedPayouts = await Promise.all(
      payout.Value.map(async (payoutValue) => {
        const reward = payoutValue.Value[0];
        const rewardValue = getActualValue(reward, "value") || "";
        const rewardQuantity = getActualValue(reward, "quantity") || 0;

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
        } else if (
          typeof rewardValue === "string" &&
          rewardValue.includes(":")
        ) {
          const parts = rewardValue.split(":");
          const currencyPart = parts[1];
          displayName =
            currencyPart === "MtxGiveaway" ? "V-Bucks" : currencyPart;
        } else {
          displayName = "V-Bucks";
        }

        return {
          place: `Top ${payoutValue.Threshold}`,
          prize: `${Number(rewardQuantity).toLocaleString()}x ${displayName}`,
          threshold: payoutValue.Threshold,
        };
      }),
    );

    return formattedPayouts.sort((a, b) => a.threshold - b.threshold);
  };

  const fetchTournamentData = useCallback(async () => {
    if (!auth.jwt || !auth.base || !auth.account?.AccountID) return;

    const tournamentsRoute = Routing.Routes.get("tournaments")?.url;
    if (!tournamentsRoute) return;

    try {
      setLoading(true);

      const [detailsRes, statsRes] = await Promise.all([
        Stellar.Requests.get<TournamentDetails>(
          `${tournamentsRoute}/${tournament.id}`,
          { Authorization: `Bearer ${auth.jwt}` },
        ),
        Stellar.Requests.get<PlayerStats>(
          `${tournamentsRoute}/${tournament.id}/player/${auth.account.AccountID}?window=1`,
          { Authorization: `Bearer ${auth.jwt}` },
        ),
      ]);

      setDetails(detailsRes.data as TournamentDetails);
      setPlayerStats(statsRes.data as PlayerStats);

      if (detailsRes.data?.data?.rules?.payout) {
        const formattedPrizes = await formatPayout(
          detailsRes.data.data.rules.payout,
        );
        setPrizePool(formattedPrizes);
      }
    } catch (err) {
      console.error("Failed to fetch tournament data:", err);
    } finally {
      setLoading(false);
    }
  }, [
    auth.jwt,
    auth.base,
    auth.account?.AccountID,
    tournament.id,
    Routing.Routes,
  ]);

  useEffect(() => {
    fetchTournamentData();
  }, [fetchTournamentData]);

  if (activeTab === "leaderboard") {
    return (
      <SessionLeaderboard
        tournament={tournament}
        onBack={() => setActiveTab("details")}
      />
    );
  }

  if (loading || !details || !playerStats) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    );
  }

  const stats = playerStats.data.stats;
  const scoringRules = formatScoringRules(details.data.rules.scoring);

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

      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        <div className="overflow-auto space-y-3">
          <GlassContainer className="p-3 border border-white/10">
            <div className="mb-3">
              <h3 className="text-white text-sm font-bold">Session 1</h3>
              <p className="text-white/40 text-[10px]">
                {details.data.schedule.time}
              </p>
            </div>

            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-xs">Victory Royale</span>
                <span className="text-white text-xs font-semibold">
                  {stats.victoryRoyales}{" "}
                  <span className="text-white/30">pts</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-xs">Eliminations</span>
                <span className="text-white text-xs font-semibold">
                  {stats.eliminations}{" "}
                  <span className="text-white/30">pts</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-xs">Placement</span>
                <span className="text-white text-xs font-semibold">
                  {stats.placementPoints}{" "}
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
                  {stats.matchesPlayed}
                  <span className="text-white/40 text-sm">
                    /{stats.matchLimit}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-white/40 text-[9px] uppercase mb-1">
                  Total Points
                </p>
                <p className="text-white text-lg font-bold">{stats.points}</p>
              </div>
            </div>
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
