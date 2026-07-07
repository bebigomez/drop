import { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { authClient } from "../lib/auth-client";

export default function AuthForm() {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signIn") {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) setError(err.message ?? "Error al iniciar sesión");
      } else {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: `${firstName} ${lastName}`,
        });
        if (err) setError(err.message ?? "Error al registrarse");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error: err } = await authClient.signIn.social({ provider: "google", callbackURL: "/" });
      if (err) setError(err.message ?? "Error al iniciar con Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputClass = (field: string) => `
    peer w-full bg-transparent text-on-surface outline-none transition-all duration-200
    px-4 pt-5 pb-2
    border-2 rounded-xl
    ${error ? "border-error" : focusedField === field ? "border-primary" : "border-on-surface/20"}
    ${focusedField === field ? "ring-4 ring-primary/10" : "ring-0"}
  `;

  const labelClass = (field: string, value: string) => `
    absolute left-4 pointer-events-none transition-all duration-200
    ${focusedField === field || value.length > 0
      ? "top-1.5 text-xs text-primary"
      : "top-1/2 -translate-y-1/2 text-base text-on-surface/40"
    }
    ${focusedField === field ? "text-primary" : ""}
    ${error ? "text-error" : ""}
  `;

  return (
    <div className="w-full max-w-sm">
      <div className="bg-surface rounded-2xl p-8 shadow-sm border border-on-surface/5">
        <h2 className="text-2xl font-bold text-on-surface text-center mb-2">
          {mode === "signIn" ? "Bienvenido de vuelta" : "Crear cuenta"}
        </h2>
        <p className="text-sm text-on-surface/40 text-center mb-8">
          {mode === "signIn" ? "Ingresa a tu cuenta para continuar" : "Regístrate para empezar"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {mode === "signUp" && (
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder=" "
                  required
                  className={inputClass("firstName")}
                  onFocus={() => setFocusedField("firstName")}
                  onBlur={() => setFocusedField(null)}
                />
                <label htmlFor="firstName" className={labelClass("firstName", firstName)}>
                  Nombre
                </label>
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder=" "
                  required
                  className={inputClass("lastName")}
                  onFocus={() => setFocusedField("lastName")}
                  onBlur={() => setFocusedField(null)}
                />
                <label htmlFor="lastName" className={labelClass("lastName", lastName)}>
                  Apellido
                </label>
              </div>
            </div>
          )}

          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
              className={inputClass("email")}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
            <label htmlFor="email" className={labelClass("email", email)}>
              Correo electrónico
            </label>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
              minLength={8}
              className={inputClass("password")}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
            <label htmlFor="password" className={labelClass("password", password)}>
              Contraseña
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface/30 hover:text-on-surface/60 transition-colors p-1"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-error bg-error/5 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-semibold rounded-xl px-6 py-3 hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 transition-all duration-200 shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {mode === "signIn" ? "Ingresando..." : "Registrando..."}
              </span>
            ) : (
              mode === "signIn" ? "Ingresar" : "Registrarse"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-on-surface/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface px-4 text-sm text-on-surface/30">o continúa con</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 border-2 border-on-surface/10 rounded-xl px-6 py-3 text-on-surface font-medium hover:bg-on-surface/5 active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
        >
          {googleLoading ? (
            <span className="w-5 h-5 rounded-full border-2 border-on-surface/20 border-t-primary animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Google
        </button>

        <p className="text-center text-sm text-on-surface/40 mt-6">
          {mode === "signIn" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
          <button
            type="button"
            className="ml-1.5 text-primary font-semibold hover:text-primary-dark transition-colors"
            onClick={() => {
              setMode(mode === "signIn" ? "signUp" : "signIn");
              setError(null);
              setPassword("");
              setShowPassword(false);
            }}
          >
            {mode === "signIn" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
