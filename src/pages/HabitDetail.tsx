import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChartColumnIncreasing, ChevronLeft, Link as LinkIcon, Users } from "lucide-react";
import ContributionCalendar from "../components/ContributionCalendar";

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const habitId = id as any;
  const [copied, setCopied] = useState(false);

  const details = useQuery(api.habits.getHabitDetails, { habitId });

  if (details === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-on-surface mb-2">Hábito no encontrado</h2>
        <Link to="/" className="text-primary font-semibold hover:underline">
          Volver al dashboard
        </Link>
      </div>
    );
  }

  const inviteUrl = `${window.location.origin}/unirse/${details.habit.inviteCode}`;

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-on-surface/40 hover:text-on-surface transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        Volver al dashboard
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-on-surface truncate">{details.habit.name}</h1>
          {details.habit.description && (
            <p className="text-on-surface/50 mt-1">{details.habit.description}</p>
          )}
        </div>
        <button
          onClick={copyInvite}
          className="flex items-center gap-2 bg-primary text-white font-semibold rounded-xl px-4 py-2.5 hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 shadow-sm flex-shrink-0"
        >
          <LinkIcon className="w-4 h-4" strokeWidth={2.5} />
          {copied ? "¡Copiado!" : "Invitar"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-on-surface/5">
          <div className="flex items-center gap-2 mb-1">
            <ChartColumnIncreasing className="w-4 h-4 text-secondary-dark" strokeWidth={2} />
            <p className="text-sm text-on-surface/40 font-medium">Racha personal</p>
          </div>
          <p className="text-3xl font-bold text-on-surface">
            {details.personalStreak > 0 ? `${details.personalStreak}` : "—"}
          </p>
          <p className="text-sm text-on-surface/40 mt-0.5">
            {details.personalStreak === 1
              ? "1 día consecutivo"
              : details.personalStreak > 0
                ? `${details.personalStreak} días consecutivos`
                : "Sin racha activa"}
          </p>
        </div>
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-on-surface/5">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary" strokeWidth={2} />
            <p className="text-sm text-on-surface/40 font-medium">Racha grupal</p>
          </div>
          <p className="text-3xl font-bold text-primary">
            {details.groupStreak > 0 ? `${details.groupStreak}` : "—"}
          </p>
          <p className="text-sm text-on-surface/40 mt-0.5">
            {details.groupStreak > 0
              ? `${details.groupStreak} días todos completaron`
              : "Sin racha activa"}
          </p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-5 shadow-sm border border-on-surface/5 mb-6">
        <ContributionCalendar habitId={id!} logs={details.logs} />
      </div>

      <div className="bg-surface rounded-2xl p-5 shadow-sm border border-on-surface/5">
        <h2 className="font-bold text-on-surface mb-4">Miembros ({details.members.length})</h2>
        <ul className="space-y-2">
          {details.members.map((member) => (
            <li key={member._id} className="flex items-center gap-3 text-sm">
              {member.image ? (
                <img
                  src={member.image}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {member.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <span className="text-on-surface font-medium truncate">
                {member.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
