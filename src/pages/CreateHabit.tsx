import { useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";

export default function CreateHabit() {
  const navigate = useNavigate();
  const createHabit = useMutation(api.habit_mutations.createHabit);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const habitId = await createHabit({
        name,
        description: description || undefined,
      });
      navigate(`/habitos/${habitId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear hábito");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Crear nuevo hábito</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Ej: Meditar 10 min"
          />
        </div>
        <div>
          <label htmlFor="desc" className="block text-sm font-medium mb-1">
            Descripción (opcional)
          </label>
          <textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={3}
            placeholder="Ej: Meditación diaria después de despertar"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-purple-600 text-white rounded px-4 py-2 hover:bg-purple-700"
        >
          Crear hábito
        </button>
      </form>
    </div>
  );
}
