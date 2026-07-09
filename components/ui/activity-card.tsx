"use client";

import { Activity, ArrowUpRight, Plus, Target, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Metric {
  label: string;
  value: string;
  trend: number;
  unit?: string;
}

export interface Goal {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface ActivityCardProps {
  category?: string;
  title?: string;
  metrics?: Metric[];
  dailyGoals?: Goal[];
  onAddGoal?: () => void;
  onToggleGoal?: (goalId: string) => void;
  onViewDetails?: () => void;
  className?: string;
}

const METRIC_COLORS: Record<string, string> = {
  Disputas: "#7A1E2C",
  Score:    "#4F9A5C",
  Docs:     "#B8862E",
};

export function ActivityCard({
  category = "Crédito",
  title = "Progreso de tu caso",
  metrics = [],
  dailyGoals = [],
  onAddGoal,
  onToggleGoal,
  onViewDetails,
  className,
}: ActivityCardProps) {
  const [isHovering, setIsHovering] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "relative h-full rounded-2xl p-5",
        "bg-white border border-[#E7E2E1] shadow-sm",
        "hover:border-[#D4C0C3]",
        "transition-all duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-full bg-[#F5E4E6]">
          <Activity className="w-4 h-4 text-[#7A1E2C]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#241014]">{title}</h3>
          <p className="text-xs text-[#9C9492]">{category}</p>
        </div>
      </div>

      {/* Metric Rings */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="relative flex flex-col items-center"
            onMouseEnter={() => setIsHovering(metric.label)}
            onMouseLeave={() => setIsHovering(null)}
          >
            <div className="relative w-[72px] h-[72px]">
              {/* Track ring */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="30" fill="none" stroke="#E7E2E1" strokeWidth="10" />
                <circle
                  cx="40" cy="40" r="30" fill="none"
                  stroke={METRIC_COLORS[metric.label] ?? "#7A1E2C"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 30}`}
                  strokeDashoffset={`${2 * Math.PI * 30 * (1 - metric.trend / 100)}`}
                  className={cn("transition-all duration-700", isHovering === metric.label && "opacity-85")}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-extrabold text-[#241014] leading-none tracking-tight">{metric.value}</span>
                {metric.unit && <span className="text-[9px] text-[#9C9492] mt-0.5">{metric.unit}</span>}
              </div>
            </div>
            <span className="mt-1.5 text-[11px] font-semibold text-[#57504E]">{metric.label}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#F7F5F4] mb-4" />

      {/* Goals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold text-[#241014]">
            <Target className="w-3.5 h-3.5 text-[#7A1E2C]" />
            Próximas acciones
          </h4>
          <button
            type="button"
            onClick={onAddGoal}
            className="p-1 rounded-full hover:bg-[#F5E4E6] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#9C9492]" />
          </button>
        </div>

        <div className="space-y-1.5">
          {dailyGoals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => onToggleGoal?.(goal.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-left",
                "bg-[#F7F5F4] border border-transparent",
                "hover:bg-white hover:border-[#241014] hover:shadow-sm",
                "transition-all duration-150"
              )}
            >
              <CheckCircle2
                className={cn(
                  "w-4 h-4 shrink-0",
                  goal.isCompleted ? "text-[#4F9A5C]" : "text-[#C4BEBC]"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  goal.isCompleted
                    ? "text-[#9C9492] line-through"
                    : "text-[#241014]"
                )}
              >
                {goal.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-[#F7F5F4]">
        <button
          onClick={onViewDetails}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1E2C] hover:underline transition-colors"
        >
          Ver mi progreso completo
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
