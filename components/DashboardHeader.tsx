import { Activity, Droplets, ShieldAlert } from 'lucide-react';

interface DashboardHeaderProps {
  total: number;
  proprio: number;
  improprio: number;
}

export default function DashboardHeader({ total, proprio, improprio }: DashboardHeaderProps) {
  const percentProprio = total === 0 ? 0 : Math.round((proprio / total) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 w-full mb-16">
      {/* Total Card */}
      <div className="glass-panel p-8 fade-up-enter stagger-1 group hover:-translate-y-2 transition-all duration-500 border-l-[3px] border-l-cyan-400">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-cyan-400/10 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform duration-500">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase bg-black/20 px-3 py-1 rounded-full">
            NET_IO // SC
          </span>
        </div>
        <div>
          <h3 className="text-[56px] leading-[0.9] font-black text-white tracking-tighter mix-blend-plus-lighter text-glow mb-2">
            {total}
          </h3>
          <p className="text-sm text-cyan-200/60 font-medium tracking-wide">
            Pontos Verificados
          </p>
        </div>
      </div>

      {/* Proprio Card */}
      <div className="glass-panel p-8 fade-up-enter stagger-2 group hover:-translate-y-2 transition-all duration-500 border-l-[3px] border-l-emerald-400">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-emerald-400/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform duration-500">
            <Droplets className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-500/50 uppercase bg-emerald-500/5 px-3 py-1 rounded-full">
            SAFE_ZONE
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-3 mb-2">
            <h3 className="text-[56px] leading-[0.9] font-black text-white tracking-tighter mix-blend-plus-lighter text-shadow">
              {percentProprio}<span className="text-3xl text-emerald-400">%</span>
            </h3>
          </div>
          <p className="text-sm text-emerald-200/60 font-medium tracking-wide flex justify-between items-center w-full">
            <span>Balneabilidade Pura</span>
            <span className="font-mono text-emerald-400">{proprio} Locais</span>
          </p>
        </div>
        {/* Decorative Glow */}
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none group-hover:bg-emerald-500/30 transition-colors duration-700"></div>
      </div>

      {/* Improprio Card */}
      <div className="glass-panel p-8 fade-up-enter stagger-3 group hover:-translate-y-2 transition-all duration-500 border-l-[3px] border-l-rose-500">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">
            <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-xs font-mono font-bold tracking-widest text-rose-500/50 uppercase bg-rose-500/5 px-3 py-1 rounded-full">
            BIO_HAZARD
          </span>
        </div>
        <div>
          <h3 className="text-[56px] leading-[0.9] font-black text-white tracking-tighter mix-blend-plus-lighter text-glow-danger mb-2">
            {improprio}
          </h3>
          <p className="text-sm text-rose-200/60 font-medium tracking-wide">
            Não Recomendados
          </p>
        </div>
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-rose-500/20 transition-colors duration-700"></div>
      </div>
    </div>
  );
}
