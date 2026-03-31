import { Database, MapPin, Activity } from 'lucide-react';

interface DashboardHeaderProps {
  total: number;
  proprio: number;
  improprio: number;
}

export default function DashboardHeader({ total, proprio, improprio }: DashboardHeaderProps) {
  const stats = [
    { label: 'Total de Registros', value: total, icon: Database, color: 'text-blue-400' },
    { label: 'Pontos Próprios', value: proprio, icon: MapPin, color: 'text-emerald-400' },
    { label: 'Pontos Impróprios', value: improprio, icon: Activity, color: 'text-rose-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
          <div className="text-3xl font-bold text-white">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
