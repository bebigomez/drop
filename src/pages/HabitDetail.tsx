import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ContributionCalendar from "../components/ContributionCalendar";

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const habitId = id as any;
  const [copied, setCopied] = useState(false);

  const details = useQuery(api.habits.getHabitDetails, { habitId });

  if (details === undefined) {
    return <p className="text-gray-500 mt-8 text-center">Cargando...</p>;
  }

  if (!details) {
    return (
      <div className="text-center mt-8">
        <p className="text-gray-500">Hábito no encontrado</p>
        <Link to="/" className="text-purple-600 underline mt-2 inline-block">
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
    <div className="max-w-2xl mx-auto mt-4">
      <Link to="/" className="text-sm text-purple-600 hover:underline">
        &larr; Volver
      </Link>

      <div className="flex items-start justify-between mt-2 mb-1">
        <div>
          <h1 className="text-2xl font-bold">{details.habit.name}</h1>
          {details.habit.description && (
            <p className="text-gray-600 mt-1">{details.habit.description}</p>
          )}
        </div>
        <button
          onClick={copyInvite}
          className="text-sm bg-purple-600 text-white rounded px-3 py-1.5 hover:bg-purple-700 whitespace-nowrap"
        >
          {copied ? "¡Copiado!" : "Invitar"}
        </button>
      </div>

      <div className="flex gap-6 my-6">
        <div className="bg-gray-100 rounded p-3 text-center flex-1">
          <p className="text-2xl font-bold">{details.personalStreak}</p>
          <p className="text-sm text-gray-500">Racha personal</p>
        </div>
        <div className="bg-gray-100 rounded p-3 text-center flex-1">
          <p className="text-2xl font-bold">
            {details.groupStreak > 0 ? `🔥 ${details.groupStreak}` : "Sin racha activa"}
          </p>
          <p className="text-sm text-gray-500">Racha grupal</p>
        </div>
      </div>

      <div className="mb-6">
        <ContributionCalendar
          habitId={id!}
          logs={details.logs}
        />
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Miembros ({details.members.length})</h2>
        <ul className="space-y-1">
          {details.members.map((member) => (
            <li key={member._id} className="text-sm text-gray-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-semibold">
                {member.userId.slice(0, 2).toUpperCase()}
              </span>
              {member.userId}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
