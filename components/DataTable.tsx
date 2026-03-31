'use client';
import { CheckCircle2, XCircle, MapPin, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface Record {
  id: number;
  municipio: string;
  balneario: string;
  ponto_coleta: string;
  localizacao: string;
  status: string;
  data_coleta: string;
}

export default function DataTable({ records }: { records: Record[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'data';
  const currentOrder = searchParams.get('order') || 'desc';

  const handleSort = (column: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentSort === column) {
      params.set('order', currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('sort', column);
      params.set('order', 'asc');
    }
    params.set('page', '1');
    router.push(pathname + '?' + params.toString());
  };

  const renderSortIcon = (column: string) => {
    if (currentSort !== column) return <ArrowUpDown className="w-3 h-3 ml-1 inline-block text-zinc-700 group-hover:text-zinc-500 transition-colors" />;
    return currentOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 inline-block text-emerald-500" /> : <ArrowDown className="w-3 h-3 ml-1 inline-block text-emerald-500" />;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b border-zinc-800 bg-[#09090b]">
            <th onClick={() => handleSort('status')} className="px-5 py-3 font-medium text-zinc-500 w-[12%] cursor-pointer hover:text-white transition-colors group select-none">Status {renderSortIcon('status')}</th>
            <th onClick={() => handleSort('municipio')} className="px-5 py-3 font-medium text-zinc-500 w-[18%] cursor-pointer hover:text-white transition-colors group select-none">Município {renderSortIcon('municipio')}</th>
            <th onClick={() => handleSort('balneario')} className="px-5 py-3 font-medium text-zinc-500 w-[55%] cursor-pointer hover:text-white transition-colors group select-none">Origem da Coleta {renderSortIcon('balneario')}</th>
            <th onClick={() => handleSort('data')} className="px-5 py-3 font-medium text-zinc-500 text-right w-[15%] cursor-pointer hover:text-white transition-colors group select-none">
              <div className="flex items-center justify-end gap-1">
                Data do Laudo {renderSortIcon('data')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {records.map((r) => {
            const statusStr = r.status?.toLowerCase() || '';
            const isSafe = statusStr.includes('própri') && !statusStr.includes('imprópri');
            return (
              <tr key={r.id} className="hover:bg-zinc-900/40 transition-colors cursor-default group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {isSafe ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                    <span className={`text-xs font-semibold uppercase ${isSafe ? 'text-emerald-500/90' : 'text-rose-500/90'}`}>
                      {isSafe ? 'Própria' : 'Imprópria'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="font-medium text-zinc-200">{r.municipio}</span>
                </td>
                <td className="px-5 py-3 w-[50%] max-w-0">
                  <div className="flex flex-col gap-1 w-full relative">
                    <div className="flex items-center gap-1.5 w-full">
                      <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span className="text-zinc-200 font-medium truncate shrink-0" title={r.balneario}>{r.balneario}</span>
                    </div>
                    <div className="flex items-center gap-2 pl-5 overflow-hidden w-full">
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-[1px] rounded shrink-0 border border-zinc-700 font-mono tracking-wide shadow-sm">{r.ponto_coleta.toUpperCase().replace('PONTO ', '')}</span>
                      <span className="text-zinc-500 text-[11px] truncate flex-1" title={r.localizacao}>{r.localizacao}</span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-xs text-zinc-500">
                  {new Date(r.data_coleta + 'T00:00:00').toLocaleDateString('pt-BR')}
                </td>
              </tr>
            );
          })}

          {records.length === 0 && (
            <tr>
              <td colSpan={4} className="px-5 py-16 text-center text-zinc-500 text-sm">
                Nenhum dado de telemetria encontrado para este filtro.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
