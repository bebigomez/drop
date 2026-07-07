import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { AlertCircle, Users } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useToast } from "../hooks/useToast";

export default function JoinHabit() {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const joinViaLink = useMutation(api.habit_mutations.joinViaLink);
  const { addToast } = useToast();

  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!codigo) return;
    setJoining(true);
    setError(null);

    try {
      const result = await joinViaLink({ inviteCode: codigo });
      addToast("success", "Te has unido al hábito");
      navigate(`/habitos/${result.habitId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al unirse");
      setJoining(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-surface rounded-2xl p-8 shadow-sm border border-on-surface/5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8 text-secondary-dark" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold text-on-surface mb-2">Unirse a un hábito</h1>
        <p className="text-on-surface/50 mb-6">
          Has sido invitado a unirte a un hábito grupal. ¡Comienza a construir una racha con el equipo!
        </p>
        {error && (
          <div className="flex items-center gap-2 text-sm text-error bg-error/5 rounded-lg px-3 py-2 mb-6 text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full bg-primary text-white font-semibold rounded-xl px-6 py-3 hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all duration-200 shadow-sm"
        >
          {joining ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Uniéndose...
            </span>
          ) : (
            "Unirse al hábito"
          )}
        </button>
      </div>
    </div>
  );
}
