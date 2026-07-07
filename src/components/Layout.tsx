import { Link, Outlet } from "react-router-dom";
import { authClient } from "../lib/auth-client";

export default function Layout() {
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-lg text-purple-600">
            Drop
          </Link>
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            Mis hábitos
          </Link>
          <Link
            to="/habitos/nuevo"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Nuevo hábito
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {session?.user?.name ?? session?.user?.email}
          </span>
          <button
            className="text-sm text-red-500 hover:text-red-700"
            onClick={() => authClient.signOut()}
          >
            Cerrar sesión
          </button>
        </div>
      </nav>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
