import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Mail, Users } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { authClient } from "../lib/auth-client";

type AuthFormProps = {
  inviteCode?: string | null;
};

export default function AuthForm({ inviteCode }: AuthFormProps) {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const habitInfo = useQuery(
    api.habits.getHabitByInviteCode,
    inviteCode ? { inviteCode } : "skip",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signIn") {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) {
          if (err.code === "EMAIL_NOT_VERIFIED" || err.message?.toLowerCase().includes("verify")) {
            setVerifiedEmail(email);
          } else {
            setError(err.message ?? "Error al iniciar sesión");
          }
        }
      } else {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: `${firstName} ${lastName}`,
        }, {
          disableSignal: true,
        });
        if (err && err.code !== "EMAIL_NOT_VERIFIED") {
          setError(err.message ?? "Error al registrarse");
        } else {
          setVerifiedEmail(email);
        }
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Error de conexión. Intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!verifiedEmail) return;
    setResending(true);
    setError(null);
    try {
      await authClient.sendVerificationEmail({ email: verifiedEmail });
    } catch {
      setError("Error al reenviar el correo");
    } finally {
      setResending(false);
    }
  };

  const handleBackToSignIn = () => {
    setVerifiedEmail(null);
    setMode("signIn");
    setError(null);
  };

  if (verifiedEmail) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-2xl p-8 shadow-sm border border-on-surface/5 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-success" strokeWidth={2} />
          </div>

          <h2 className="text-2xl font-bold text-on-surface mb-2">Revisa tu email</h2>
          <p className="text-sm text-on-surface/50 mb-6 leading-relaxed">
            Te enviamos un link de verificación a<br />
            <strong className="text-on-surface">{verifiedEmail}</strong>
          </p>

          <p className="text-xs text-on-surface/40 mb-6">
            Haz clic en el link del correo para verificar tu cuenta.
            Luego podrás iniciar sesión.
          </p>

          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full bg-primary text-white font-semibold rounded-xl px-6 py-3 hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 transition-all duration-200 shadow-sm mb-3"
          >
            {resending ? "Reenviando..." : "Reenviar correo"}
          </button>

          <button
            onClick={handleBackToSignIn}
            className="text-sm text-primary font-semibold hover:text-primary-dark transition-colors"
          >
            Volver a iniciar sesión
          </button>

          {error && (
            <div className="flex items-center gap-2 text-sm text-error bg-error/5 rounded-lg px-3 py-2 mt-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

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

        {inviteCode && habitInfo === undefined && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <span className="text-sm text-on-surface/40">Buscando hábito...</span>
          </div>
        )}

        {inviteCode && habitInfo === null && (
          <div className="flex items-center gap-2 text-sm text-error bg-error/5 rounded-lg px-3 py-2 mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            El link de invitación no es válido
          </div>
        )}

        {inviteCode && habitInfo && (
          <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm font-semibold text-primary mb-0.5">
              Has sido invitado a <strong>{habitInfo.name}</strong>
            </p>
            <p className="text-xs text-on-surface/40 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" strokeWidth={2} />
              {habitInfo.memberCount} miembro{habitInfo.memberCount !== 1 ? "s" : ""}
              {habitInfo.description && ` · ${habitInfo.description}`}
            </p>
            <p className="text-xs text-on-surface/30 mt-1.5">
              Inicia sesión o regístrate para aceptar la invitación
            </p>
          </div>
        )}

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
