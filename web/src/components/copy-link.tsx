"use client";
import { useState } from "react";

// El enlace da acceso a la cuenta: solo lo ve el entrenador y no se guarda.
export function CopyLink({ link, message }: { link: string; message?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div role="status" className="flex flex-col gap-2">
      {message && <p className="text-sm">{message}</p>}
      <input readOnly value={link} aria-label="Enlace de acceso" className="input input-sm w-full" onFocus={(e) => e.target.select()} />
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => navigator.clipboard.writeText(link).then(() => setCopied(true))}
      >
        {copied ? "Enlace copiado" : "Copiar enlace"}
      </button>
    </div>
  );
}
