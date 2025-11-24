import React from "react";
import GlassContainer from "../Global/GlassContainer";

interface UserStats {
  kills: number;
  wins: number;
  playtime: string;
}

const Stats: React.FC = () => {
  const stats: UserStats = {
    kills: 55,
    wins: 23,
    playtime: "12h 34m",
  };

  return (
    <GlassContainer className="bg-glass-noise relative min-w-[300px] w-fit border border-white/20 p-6 rounded-lg text-white/90">
      <h2 className="text-xl font-bold tracking-wide mb-3">STATS</h2>

      <div>
        <div className="flex flex-col gap-2">
          <p className="font-normal flex flex-row justify-between items-center gap-2 opacity-90">
            Kills:
            <p className="border border-white/30 bg-stone-800/20 rounded-lg px-2 py-0.5 font-normal max-w-fit">
              {stats.kills}
            </p>
          </p>

          <p className="font-normal flex flex-row justify-between items-center gap-2 opacity-90">
            Wins:
            <p className="border border-white/30 bg-stone-800/20 rounded-lg px-2 py-0.5 font-normal max-w-fit">
              {stats.wins}
            </p>
          </p>

          <p className="font-normal flex flex-row justify-between items-center gap-2 opacity-90">
            Playtime:
            <p className="border border-white/30 bg-stone-800/20 rounded-lg px-2 py-0.5 font-normal max-w-fit">
              {stats.playtime}
            </p>
          </p>
        </div>
      </div>
    </GlassContainer>
  );
};

export default Stats;
