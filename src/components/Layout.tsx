import { Link, Outlet, useLocation } from "react-router-dom";
import { Droplet, LogOut } from "lucide-react";
import { authClient } from "../lib/auth-client";

export default function Layout() {
  const { data: session } = authClient.useSession();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Mis hábitos" },
    { path: "/habitos/nuevo", label: "Nuevo hábito" },
  ];

  return (
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
            <span className="text-sm text-white/70 hidden sm:block truncate max-w-[160px]">
              {session?.user?.name ?? session?.user?.email}
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
  );
}
