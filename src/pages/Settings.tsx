import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { LoaderCircle, Upload, Trash2 } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { authClient } from "../lib/auth-client";
import { useToast } from "../hooks/useToast";

const MAX_SIZE = 1024 * 1024;

export default function Settings() {
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user;
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfilePhoto = useMutation(api.users.updateProfilePhoto);
  const { addToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      addToast("error", "La imagen no puede superar 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) throw new Error("Upload failed");
      const { storageId } = await response.json();
      await updateProfilePhoto({ storageId });
      addToast("success", "Foto de perfil actualizada");
      refetch();
    } catch {
      setPreview(null);
      addToast("error", "Error al subir la imagen");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      await authClient.updateUser({ image: null });
      setPreview(null);
      addToast("success", "Foto de perfil eliminada");
      refetch();
    } catch {
      addToast("error", "Error al eliminar la foto");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-on-surface mb-8">Configuración</h1>

      <section className="bg-surface rounded-2xl p-6 shadow-sm border border-on-surface/5">
        <h2 className="text-lg font-semibold text-on-surface mb-6">Foto de perfil</h2>

        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center ring-4 ring-primary/20">
              {(preview || user?.image) && !uploading ? (
                <img
                  src={preview ?? user?.image ?? ""}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-primary/40">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-surface/80 flex items-center justify-center rounded-full">
                  <LoaderCircle className="w-8 h-8 text-primary animate-spin" />
                </div>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />

          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" strokeWidth={2} />
              Subir foto
            </button>
            {(user?.image || preview) && (
              <button
                onClick={handleRemove}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error rounded-xl text-sm font-medium hover:bg-error/20 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
                Eliminar
              </button>
            )}
          </div>

          <p className="text-xs text-on-surface/40 text-center">
            Formatos: JPG, PNG, WebP. Máximo 1MB.
          </p>
        </div>
      </section>

      <section className="bg-surface rounded-2xl p-6 shadow-sm border border-on-surface/5 mt-6">
        <h2 className="text-lg font-semibold text-on-surface mb-4">Información de la cuenta</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-on-surface/5">
            <span className="text-on-surface/50">Nombre</span>
            <span className="text-on-surface font-medium">{user?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-on-surface/5">
            <span className="text-on-surface/50">Email</span>
            <span className="text-on-surface font-medium">{user?.email ?? "—"}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
