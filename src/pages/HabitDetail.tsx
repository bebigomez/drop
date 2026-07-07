import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const habitId = id as any;

  const details = useQuery(api.habits.getHabitDetails, { habitId });

  if (details === undefined) {
    return <p className="text-gray-500">Cargando...</p>;
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

  return (
    <div className="max-w-2xl mx-auto mt-4">
      <Link to="/" className="text-sm text-purple-600 hover:underline">
        &larr; Volver
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-1">{details.habit.name}</h1>
      {details.habit.description && (
        <p className="text-gray-600 mb-4">{details.habit.description}</p>
      )}

      <div className="flex gap-6 mb-6">
        <div className="bg-gray-100 rounded p-3 text-center flex-1">
          <p className="text-2xl font-bold">{details.personalStreak}</p>
          <p className="text-sm text-gray-500">Racha personal</p>
        </div>
        <div className="bg-gray-100 rounded p-3 text-center flex-1">
          <p className="text-2xl font-bold">{details.groupStreak}</p>
          <p className="text-sm text-gray-500">Racha grupal</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Miembros ({details.members.length})</h2>
        <ul className="space-y-1">
          {details.members.map((member) => (
            <li key={member._id} className="text-sm text-gray-700">
              {member.userId}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Calendario</h2>
        <p className="text-sm text-gray-500">
          Calendario de contribuciones próximamente.
        </p>
      </div>
    </div>
  );
}
