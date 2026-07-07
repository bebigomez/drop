import { Link } from "react-router-dom";

type HabitCardProps = {
  habit: {
    _id: string;
    name: string;
    description?: string;
    frequency: string;
    memberCount: number;
    personalStreak: number;
  };
};

export default function HabitCard({ habit }: HabitCardProps) {
  return (
    <Link
      to={`/habitos/${habit._id}`}
      className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <h3 className="font-semibold text-lg mb-1">{habit.name}</h3>
      {habit.description && (
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
          {habit.description}
        </p>
      )}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>🔥 {habit.personalStreak} días</span>
        <span>👥 {habit.memberCount} miembros</span>
        <span className="capitalize">{habit.frequency}</span>
      </div>
    </Link>
  );
}
