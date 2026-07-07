import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function JoinHabit() {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const joinViaLink = useMutation(api.habit_mutations.joinViaLink);

  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!codigo) return;
    setJoining(true);
    setError(null);

    try {
      const result = await joinViaLink({ inviteCode: codigo });
      navigate(`/habitos/${result.habitId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al unirse");
      setJoining(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Unirse a un hábito</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <p className="text-gray-600 mb-6">
        Has sido invitado a unirte a un hábito grupal.
      </p>
      <button
        onClick={handleJoin}
        disabled={joining}
        className="bg-purple-600 text-white rounded px-6 py-2 hover:bg-purple-700 disabled:opacity-50"
      >
        {joining ? "Uniéndose..." : "Unirse al hábito"}
      </button>
    </div>
  );
}
