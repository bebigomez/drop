import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
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
        <div className="auth-loading">
          <div className="auth-loading-spinner" />
        </div>
      </AuthLoading>

      <Authenticated>
        <RouterProvider router={router} />
      </Authenticated>

      <Unauthenticated>
        <div id="layout">
          <div id="column-left">
            <section id="center">
              <div className="hero-group">
                <div className="hero">
                  <img
                    src="./assets/hero.png"
                    className="base"
                    width="170"
                    height="179"
                    alt=""
                  />
                  <img src="./assets/react.svg" className="framework" alt="React logo" />
                  <img src="./assets/vite.svg" className="vite" alt="Vite logo" />
                </div>
                <div className="hero">
                  <img
                    src="./assets/hero.png"
                    className="base"
                    width="170"
                    height="179"
                    alt=""
                  />
                  <img
                    src="./assets/better-auth.svg"
                    className="framework"
                    alt="Better Auth logo"
                  />
                  <img src="./assets/convex.svg" className="vite" alt="Convex logo" />
                </div>
              </div>
              <div>
                <div className="intro-text">
                  <h1 style={{ textAlign: "left" }}>Get started</h1>
                  <p>
                    This is a starter template for building full-stack apps
                    quickly.
                  </p>
                  <p>
                    It includes an initial setup with Vite, React, Convex, and
                    Better Auth for authentication and authorization using
                    email/password and Google Sign-In. Everything else is up to
                    you to build.
                  </p>
                </div>
              </div>
            </section>
          </div>
          <div id="column-right">
            <AuthForm />
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}

export default App;
