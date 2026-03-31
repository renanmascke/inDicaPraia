import StatusBadge from './StatusBadge';
import { Map as MapIcon, Crosshair } from 'lucide-react';

interface Record {
  id: number;
  municipio: string;
  local: string;
  ponto: string;
  status: string;
  data_coleta: string;
}

interface BathingTableProps {
  records: Record[];
}

export default function BathingTable({ records }: BathingTableProps) {
  return (
    <div className="fade-up-enter stagger-4 relative">
      {/* Container Terminal Border */}
      <div className="absolute inset-0 bg-cyan-500/5 rounded-[2rem] blur-[2px] pointer-events-none"></div>
      
      <div className="glass-panel overflow-hidden relative z-10 border-t-cyan-500/20 shadow-[0_0_50px_-12px_rgba(34,211,238,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-black/40">
                <th className="px-8 py-6 text-[10px] font-mono text-cyan-500/60 uppercase tracking-[0.3em]">Sector / Região</th>
                <th className="px-8 py-6 text-[10px] font-mono text-cyan-500/60 uppercase tracking-[0.3em]">Coordenadas (Local)</th>
                <th className="px-8 py-6 text-[10px] font-mono text-cyan-500/60 uppercase tracking-[0.3em] w-48 text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-mono text-cyan-500/60 uppercase tracking-[0.3em] text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {records.map((record, index) => (
                <tr 
                  key={record.id} 
                  className="group hover:bg-cyan-950/20 transition-colors duration-500"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-black/50 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-all duration-500">
                          <MapIcon className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                        </div>
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-black rounded-full flex items-center justify-center">
                          <div className={`w-1.5 h-1.5 rounded-full ${record.status?.toLowerCase().includes('próprio') ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
                        </div>
                      </div>
                      <span className="text-base text-white font-semibold tracking-wide mix-blend-plus-lighter">{record.municipio}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-slate-300 font-medium leading-relaxed max-w-sm">{record.local}</div>
                    <div className="text-[10px] font-mono text-cyan-500/50 mt-1.5 flex items-center gap-1.5 uppercase tracking-widest">
                      <Crosshair className="w-3 h-3" />
                      PT_{record.ponto}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="text-[13px] font-mono text-slate-400 tracking-wider">
                      {record.data_coleta}
                    </div>
                  </td>
                </tr>
              ))}
              
              {records.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                      <Radar className="w-64 h-64 animate-spin-slow" />
                    </div>
                    <span className="text-cyan-500/50 font-mono text-sm tracking-[0.3em] uppercase relative z-10">
                      NULL_RESPONSE // Sem dados de telemetria nesta área.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
