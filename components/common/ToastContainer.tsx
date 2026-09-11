import React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-2xl shadow-s border flex items-start gap-3 text-xs animate-in slide-in-from-bottom-2 duration-150 ${
            toast.type === "success"
              ? "bg-card dark:bg-brand-950 border-brand-200 dark:border-brand-800 text-ink dark:text-[#EAECE9]"
              : toast.type === "error"
              ? "bg-card dark:bg-brand-950 border-danger/30 text-ink dark:text-[#EAECE9]"
              : "bg-card dark:bg-brand-950 border-line dark:border-brand-800 text-ink dark:text-[#EAECE9]"
          }`}
        >
          {toast.type === "success" && (
            <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
          )}
          {toast.type === "error" && (
            <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          )}
          {toast.type === "info" && (
            <Info className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <h5 className="font-bold text-xs">{toast.title}</h5>
            {toast.description && (
              <p className="text-[11px] text-soft dark:text-brand-300 mt-0.5 leading-snug">{toast.description}</p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-faint hover:text-ink dark:hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
