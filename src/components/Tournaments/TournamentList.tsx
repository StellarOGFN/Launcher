"use client";

import React from "react";

export interface Tournament {
  id: string;
  type: string;
  status: "upcoming" | "live" | "ended";
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
}

interface TournamentListProps {
  tournaments: Tournament[];
  onSelect: (tournament: Tournament) => void;
}

const TournamentList: React.FC<TournamentListProps> = ({
  tournaments,
  onSelect,
}) => {
  const activeTournaments = tournaments.filter((t) => t.status === "live");
  const upcomingTournaments = tournaments.filter(
    (t) => t.status === "upcoming",
  );
  const endedTournaments = tournaments.filter((t) => t.status === "ended");

  console.log(upcomingTournaments);

  const TournamentCard = ({ tournament }: { tournament: Tournament }) => (
    <div
      onClick={() => onSelect(tournament)}
      className="flex-shrink-0 w-48 cursor-pointer transition-all hover:scale-[1.02] duration-200"
    >
      <div className="relative h-64 overflow-hidden rounded-md bg-gradient-to-br from-gray-900 to-black shadow-xl">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 8px,
              rgba(255,255,255,0.02) 8px,
              rgba(255,255,255,0.02) 16px
            )`,
          }}
        />
        <img
          src={tournament.display.image || "/placeholder.svg"}
          alt={tournament.display.title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white text-sm font-bold uppercase tracking-tight leading-tight">
            {tournament.display.title}
          </h3>
          {tournament.schedule.date && tournament.schedule.time && (
            <div className="flex items-center gap-1.5 text-white/50 text-[10px] mt-1.5">
              <span>{tournament.schedule.date}</span>
              <span className="text-white/30">•</span>
              <span>{tournament.schedule.time}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto space-y-5 py-2">
      {activeTournaments.length > 0 && (
        <div>
          <h2 className="text-white text-sm font-bold uppercase tracking-wide mb-3 px-1">
            Active Tournaments
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 px-1">
            {activeTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </div>
      )}

      {upcomingTournaments.length > 0 && (
        <div>
          <h2 className="text-white text-sm font-bold uppercase tracking-wide mb-3 px-1">
            Upcoming Events
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 px-1">
            {upcomingTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </div>
      )}

      {endedTournaments.length > 0 && (
        <div>
          <h2 className="text-white/50 text-sm font-bold uppercase tracking-wide mb-3 px-1">
            Past Tournaments
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 px-1">
            {endedTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </div>
      )}

      {tournaments.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-white/40 text-sm">No tournaments available</p>
        </div>
      )}
    </div>
  );
};

export default TournamentList;
