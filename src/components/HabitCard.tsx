import { ChartColumnIncreasing, Users } from "lucide-react";
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
      className="block bg-surface rounded-2xl p-5 shadow-sm hover:shadow-md active:shadow-sm border border-on-surface/5 transition-all duration-200 group"
    >
      <h3 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
        {habit.name}
      </h3>
      {habit.description && (
        <p className="text-sm text-on-surface/40 mt-1 line-clamp-2 leading-relaxed">
          {habit.description}
        </p>
      )}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-on-surface/5 text-sm">
        <span className="flex items-center gap-1.5 text-on-surface/50">
          <ChartColumnIncreasing className="w-4 h-4" strokeWidth={2} />
          <span className="font-semibold text-on-surface">{habit.personalStreak}</span>
          <span>{habit.personalStreak === 1 ? "día" : "días"}</span>
        </span>
        <span className="flex items-center gap-1.5 text-on-surface/50">
          <Users className="w-4 h-4" strokeWidth={2} />
          {habit.memberCount} {habit.memberCount === 1 ? "miembro" : "miembros"}
        </span>
      </div>
    </Link>
  );
}
