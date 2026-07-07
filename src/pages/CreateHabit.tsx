import { useState } from "react";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useToast } from "../hooks/useToast";

export default function CreateHabit() {
  const navigate = useNavigate();
  const createHabit = useMutation(api.habit_mutations.createHabit);
  const { addToast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const habitId = await createHabit({
        name,
        description: description || undefined,
      });
      addToast("success", "Hábito creado correctamente");
      navigate(`/habitos/${habitId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear hábito");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) => `
    peer w-full bg-transparent text-on-surface outline-none transition-all duration-200
    px-4 pt-5 pb-2
    border-2 rounded-xl
    ${error ? "border-error" : focusedField === field ? "border-primary" : "border-on-surface/20"}
    ${focusedField === field ? "ring-4 ring-primary/10" : "ring-0"}
  `;

  const labelClass = (field: string, value: string) => `
    absolute left-4 pointer-events-none transition-all duration-200 text-on-surface/40
    ${focusedField === field || value.length > 0
      ? "top-1.5 text-xs text-primary"
      : "top-1/2 -translate-y-1/2 text-base"
    }
    ${focusedField === field ? "text-primary" : ""}
  `;

  return (
    <div className="max-w-lg mx-auto mt-4">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1.5 text-sm text-on-surface/40 hover:text-on-surface transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        Volver
      </button>

      <div className="bg-surface rounded-2xl p-8 shadow-sm border border-on-surface/5">
        <h1 className="text-2xl font-bold text-on-surface mb-2">Crear nuevo hábito</h1>
        <p className="text-sm text-on-surface/40 mb-8">Define un hábito para compartir con tu grupo</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative">
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
              required
              className={inputClass("name")}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
            />
            <label htmlFor="name" className={labelClass("name", name)}>
              Nombre del hábito
            </label>
          </div>

          <div className="relative">
            <textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder=" "
              rows={3}
              className="peer w-full bg-transparent text-on-surface outline-none transition-all duration-200 px-4 pt-6 pb-3 border-2 rounded-xl border-on-surface/20 focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
              onFocus={() => setFocusedField("desc")}
              onBlur={() => setFocusedField(null)}
            />
            <label
              htmlFor="desc"
              className={`absolute left-4 pointer-events-none transition-all duration-200 ${
                focusedField === "desc" || description.length > 0
                  ? "top-1.5 text-xs text-primary"
                  : "top-4 text-base text-on-surface/40"
              }`}
            >
              Descripción (opcional)
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-error bg-error/5 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-primary text-white font-semibold rounded-xl px-6 py-3 hover:bg-primary-dark active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 transition-all duration-200 shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Creando...
              </span>
            ) : (
              "Crear hábito"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
