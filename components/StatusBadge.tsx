import { CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isProprio = status.toLowerCase() === 'proprio' || status.toLowerCase() === 'próprio';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isProprio
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
      }`}
    >
      {isProprio ? (
        <CheckCircle className="w-3.5 h-3.5" />
      ) : (
        <XCircle className="w-3.5 h-3.5" />
      )}
      {isProprio ? 'Próprio' : 'Impróprio'}
    </span>
  );
}
