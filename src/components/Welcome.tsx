import reactLogo from "../assets/react.svg";
import viteLogo from "../assets/vite.svg";
import betterAuthLogo from "../assets/better-auth.svg";
import convexLogo from "../assets/convex.svg";
import heroImg from "../assets/hero.png";
import { authClient } from "../lib/auth-client";

export default function Welcome() {
  const { data: session } = authClient.useSession();
  const name = session?.user?.name;
  const email = session?.user?.email;

  return (
    <div id="welcome-layout">
      <section id="welcome-center">
        <div className="hero-group">
          <div className="hero">
            <img
              src={heroImg}
              className="base"
              width="170"
              height="179"
              alt=""
            />
            <img src={reactLogo} className="framework" alt="React logo" />
            <img src={viteLogo} className="vite" alt="Vite logo" />
          </div>
          <div className="hero">
            <img
              src={heroImg}
              className="base"
              width="170"
              height="179"
              alt=""
            />
            <img
              src={betterAuthLogo}
              className="framework"
              alt="Better Auth logo"
            />
            <img src={convexLogo} className="vite" alt="Convex logo" />
          </div>
        </div>

        <div className="welcome-content">
          <h1>Welcome{name ? `, ${name}` : " back"}!</h1>
          <p className="welcome-subtitle">
            You're signed in{email ? ` as ${email}` : ""}.
          </p>
          <p>You're all set up and ready to build. Start customizing your app!</p>
          <button
            className="auth-form-submit welcome-signout"
            onClick={() => authClient.signOut()}
          >
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}
