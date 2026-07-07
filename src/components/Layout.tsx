import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Bell, BellRing, Droplet, LogOut, X } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { authClient } from "../lib/auth-client";
import { ToastProvider } from "../hooks/useToast";
import ToastContainer from "./Toast";

export default function Layout() {
  const { data: session } = authClient.useSession();
  const location = useLocation();

  const notifications = useQuery(api.habits.getUnreadNotifications);
  const markNotificationsRead = useMutation(api.habit_mutations.markNotificationsRead);

  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasOpenedRef = useRef(false);

  const unreadCount = notifications?.length ?? 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showNotifications && hasOpenedRef.current && notifications && notifications.length > 0) {
      markNotificationsRead({
        notificationIds: notifications.map((n) => n._id),
      });
    }
  }, [showNotifications, notifications, markNotificationsRead]);

  const handleToggleNotifications = () => {
    hasOpenedRef.current = true;
    setShowNotifications((prev) => !prev);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Mis hábitos" },
    { path: "/habitos/nuevo", label: "Nuevo hábito" },
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-primary text-white shadow-md">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight">
                <Droplet className="w-6 h-6 text-white/90" strokeWidth={2.5} />
                Drop
              </Link>
              <nav className="hidden sm:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleToggleNotifications}
                  className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Notificaciones"
                >
                  {unreadCount > 0 ? (
                    <BellRing className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <Bell className="w-5 h-5" strokeWidth={2} />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-surface rounded-2xl shadow-xl border border-on-surface/10 overflow-hidden z-50">
                    <div className="p-3 border-b border-on-surface/10 flex items-center justify-between">
                      <p className="text-sm font-semibold text-on-surface">Notificaciones</p>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1 text-on-surface/30 hover:text-on-surface rounded-lg hover:bg-on-surface/5 transition-colors"
                        aria-label="Cerrar notificaciones"
                      >
                        <X className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                    {notifications && notifications.length > 0 ? (
                      <ul className="max-h-64 overflow-y-auto">
                        {notifications.map((n) => (
                          <li
                            key={n._id}
                            className="px-4 py-3 text-sm text-on-surface/70 hover:bg-on-surface/5 transition-colors border-b border-on-surface/5 last:border-b-0"
                          >
                            {n.message}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-on-surface/30">
                        No hay notificaciones nuevas
                      </div>
                    )}
                  </div>
                )}
              </div>

              <span className="text-sm text-white/70 hidden sm:block truncate max-w-[160px]">
                {(() => {
                  const u = session?.user;
                  return u?.name ?? u?.email;
                })()}
              </span>
              <button
                onClick={() => authClient.signOut()}
                className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </ToastProvider>
  );
}
