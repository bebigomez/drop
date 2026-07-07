import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Activity, ChartColumnIncreasing, Droplet, LoaderCircle, Trophy } from "lucide-react";
import AuthForm from "./components/AuthForm";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CreateHabit from "./pages/CreateHabit";
import HabitDetail from "./pages/HabitDetail";
import JoinHabit from "./pages/JoinHabit";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "habitos/nuevo", element: <CreateHabit /> },
      { path: "habitos/:id", element: <HabitDetail /> },
      { path: "unirse/:codigo", element: <JoinHabit /> },
    ],
  },
]);

function App() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Droplet className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <LoaderCircle className="w-6 h-6 text-primary animate-spin" />
          </div>
        </div>
      </AuthLoading>

      <Authenticated>
        <RouterProvider router={router} />
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen bg-background flex flex-col lg:flex-row">
          <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="max-w-lg mx-auto lg:mx-0">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-8 shadow-xl shadow-primary/30">
                <Droplet className="w-8 h-8 text-white" strokeWidth={2} />
              </div>

              <h1 className="text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-none">
                Drop
              </h1>
              <p className="text-xl lg:text-2xl text-on-surface/50 mt-3 leading-relaxed font-semibold">
                Hábitos que florecen<br />en grupo.
              </p>

              <div className="mt-10 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">Progreso compartido</p>
                    <p className="text-sm text-on-surface/50">Cada día, todos marcan su progreso. El grupo avanza junto.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChartColumnIncreasing className="w-5 h-5 text-secondary-dark" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">Rachas grupales</p>
                    <p className="text-sm text-on-surface/50">La racha cuenta cuando todos cumplen. Trabajo en equipo.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Trophy className="w-5 h-5 text-tertiary-dark" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">Logros y gamificación</p>
                    <p className="text-sm text-on-surface/50">Desbloquea logros al alcanzar metas personales y grupales.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
            <AuthForm />
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}

export default App;
