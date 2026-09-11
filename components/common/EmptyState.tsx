import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}) => {
  const ActionIcon = action?.icon;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-line dark:border-brand-800/80 bg-card/40 dark:bg-brand-900/20 max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/50 border border-brand-100 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 shadow-xs">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-ink dark:text-[#EAECE9] font-display mb-1.5">
        {title}
      </h3>

      <p className="text-xs text-soft dark:text-brand-300 max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs transition-all border border-brand-400/30"
            >
              {ActionIcon && <ActionIcon className="w-4 h-4 stroke-[2.5]" />}
              <span>{action.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-soft dark:text-brand-300 hover:text-ink dark:hover:text-white hover:bg-paper dark:hover:bg-brand-800/50 rounded-xl transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
