import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Droplet, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import HabitCard from "../components/HabitCard";

export default function Dashboard() {
  const habits = useQuery(api.habits.getUserHabits);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Mis hábitos</h1>
        <Link
          to="/habitos/nuevo"
          className="hidden sm:inline-flex items-center gap-2 bg-primary text-white font-semibold rounded-xl px-5 py-2.5 hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 shadow-sm"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Nuevo hábito
        </Link>
      </div>

      {habits === undefined && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}

      {habits?.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Droplet className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">Aún no tienes hábitos</h2>
          <p className="text-on-surface/50 mb-6 max-w-sm mx-auto">
            Crea tu primer hábito grupal y empieza a construir una racha con tu equipo.
          </p>
          <Link
            to="/habitos/nuevo"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold rounded-xl px-6 py-3 hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            Crear primer hábito
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits?.map((habit) => (
          <HabitCard key={habit._id} habit={habit} />
        ))}
      </div>
    </div>
  );
}
