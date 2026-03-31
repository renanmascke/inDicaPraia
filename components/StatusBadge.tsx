interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isProprio = status?.toLowerCase() === 'proprio' || status?.toLowerCase() === 'próprio';

  if (isProprio) {
    return (
      <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-[0.2em] shadow-[0_0_15px_-5px_theme(colors.emerald.500/0.3)] min-w-[120px]">
        SAFE
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-rose-950/30 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-[0.2em] shadow-[0_0_15px_-5px_theme(colors.rose.500/0.3)] min-w-[120px]">
      HAZARD
    </div>
  );
}
