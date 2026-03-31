import StatusBadge from './StatusBadge';

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
  isLoading: boolean;
}

export default function BathingTable({ records, isLoading }: BathingTableProps) {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center border border-white/10 rounded-2xl bg-white/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Município</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Local/Ponto</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Data Coleta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 text-sm text-white font-medium">{record.municipio}</td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-300 font-medium">{record.local}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{record.ponto}</div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={record.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-400 text-right font-mono">
                  {record.data_coleta}
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                  Nenhum registro encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
