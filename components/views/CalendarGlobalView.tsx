import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const CalendarGlobalView: React.FC = () => {
  const { tasks, projects, setSelectedTaskId, setIsCreateTaskOpen } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month
  const firstDay = new Date(year, month, 1).getDay();
  // Days in month
  const totalDays = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build grid calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push(d);
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150 text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card dark:bg-brand-950/60 p-4 rounded-3xl border border-line dark:border-brand-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-brand-50 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-700/60 flex items-center justify-center text-brand-600 dark:text-brand-300">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink dark:text-[#EAECE9] tracking-tight font-display">
              {monthNames[month]} de {year}
            </h1>
            <p className="text-[11px] text-soft dark:text-brand-300/80">Planeamento mensal de entregas e prazos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-paper dark:bg-brand-900/60 p-1 rounded-xl border border-line dark:border-brand-800">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-card dark:hover:bg-brand-800 rounded-lg transition-colors text-soft dark:text-brand-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 font-semibold text-xs text-ink dark:text-[#EAECE9] hover:bg-card dark:hover:bg-brand-800 rounded-lg transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-card dark:hover:bg-brand-800 rounded-lg transition-colors text-soft dark:text-brand-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card dark:bg-brand-950/60 rounded-3xl border border-line dark:border-brand-800 shadow-xs overflow-hidden">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-line dark:border-brand-800 bg-paper/60 dark:bg-brand-900/30 text-center text-[11px] font-semibold text-faint py-3 uppercase tracking-wider">
          <div>Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div>Sáb</div>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-line/60 dark:divide-brand-800/60 auto-rows-fr">
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="bg-paper/30 dark:bg-brand-900/10 min-h-[110px]" />;
            }

            const dayString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
              2,
              "0"
            )}`;

            const dayTasks = tasks.filter((t) => t.dueDate === dayString);
            const isToday =
              new Date().toISOString().split("T")[0] === dayString;

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[110px] p-2 flex flex-col justify-between hover:bg-paper/40 dark:hover:bg-brand-900/20 transition-colors ${
                  isToday ? "bg-brand-50/40 dark:bg-brand-900/30" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      isToday
                        ? "bg-brand-500 text-white shadow-xs"
                        : "text-ink dark:text-[#EAECE9]"
                    }`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-medium text-faint">
                      {dayTasks.length} {dayTasks.length === 1 ? "tarefa" : "tarefas"}
                    </span>
                  )}
                </div>

                {/* Day Tasks List */}
                <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[75px]">
                  {dayTasks.map((t) => {
                    const p = projects.find((proj) => proj.id === t.projectId);
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTaskId(t.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium truncate cursor-pointer transition-all flex items-center gap-1 ${
                          t.isCompleted
                            ? "bg-brand-50 dark:bg-brand-900/40 text-brand-800 dark:text-brand-300 line-through"
                            : "bg-brand-50 dark:bg-brand-900/50 text-brand-900 dark:text-brand-200 hover:bg-brand-100"
                        }`}
                        title={t.title}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: p?.color || "#2E7D5B" }}
                        />
                        <span className="truncate">{t.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
