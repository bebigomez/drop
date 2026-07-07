import { CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToast } from "../hooks/useToast";

const icons = {
  success: CheckCircle,
  info: Info,
  error: AlertTriangle,
};

const borderColors = {
  success: "border-green-200",
  info: "border-blue-200",
  error: "border-red-200",
};

const iconColors = {
  success: "text-green-600",
  info: "text-blue-600",
  error: "text-red-600",
};

const bgColors = {
  success: "bg-green-50",
  info: "bg-blue-50",
  error: "bg-red-50",
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg ${bgColors[toast.type]} ${borderColors[toast.type]}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[toast.type]}`} strokeWidth={2} />
            <p className="text-sm text-on-surface flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-on-surface/30 hover:text-on-surface/60 transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
