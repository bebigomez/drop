import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import HabitCard from "../components/HabitCard";

export default function Dashboard() {
  const habits = useQuery(api.habits.getUserHabits);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mis hábitos</h1>
      {habits === undefined && <p className="text-gray-500">Cargando...</p>}
      {habits?.length === 0 && (
        <p className="text-gray-500">
          Aún no tienes hábitos.{" "}
          <a href="/habitos/nuevo" className="text-purple-600 underline">
            Crea tu primer hábito
          </a>
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits?.map((habit) => (
          <HabitCard key={habit._id} habit={habit} />
        ))}
      </div>
    </div>
  );
}
