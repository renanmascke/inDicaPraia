'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Filter, X, Search } from 'lucide-react';

type Props = {
  locationsTree: Record<string, string[]>;
  initialMunicipio: string;
  initialBalneario: string;
  initialStatus: string;
};

export default function TableFilters({ locationsTree, initialMunicipio, initialBalneario, initialStatus }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [municipio, setMunicipio] = useState(initialMunicipio);
  const [balneario, setBalneario] = useState(initialBalneario);
  const [status, setStatus] = useState(initialStatus);

  const municipiosDisponiveis = Object.keys(locationsTree);
  const balneariosDisponiveis = municipio && locationsTree[municipio] ? locationsTree[municipio] : [];

  const handleApplyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Zera a página ao aplicar novo filtro
    params.set('page', '1');

    if (municipio) params.set('municipio', municipio);
    else params.delete('municipio');

    if (balneario) params.set('balneario', balneario);
    else params.delete('balneario');

    if (status) params.set('status', status);
    else params.delete('status');

    router.push(pathname + '?' + params.toString());
  }, [municipio, balneario, status, pathname, router, searchParams]);

  const handleClear = () => {
    setMunicipio('');
    setBalneario('');
    setStatus('');
    router.push(pathname);
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-3 w-full animate-in fade-in duration-300">
      
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden text-sm w-full md:w-auto flex-1 md:flex-none">
        <select 
          value={municipio} 
          onChange={(e) => {
             setMunicipio(e.target.value);
             setBalneario(''); // Reseta cascata
          }}
          className="bg-transparent text-zinc-300 py-1.5 px-3 border-r border-zinc-800 focus:outline-none focus:bg-zinc-800 flex-1 cursor-pointer"
        >
          <option value="">Selecione a Cidade</option>
          {municipiosDisponiveis.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select 
          value={balneario} 
          disabled={!municipio || balneariosDisponiveis.length === 0}
          onChange={(e) => setBalneario(e.target.value)}
          className="bg-transparent text-zinc-300 py-1.5 px-3 border-r border-zinc-800 focus:outline-none focus:bg-zinc-800 flex-1 disabled:opacity-40 cursor-pointer"
        >
          <option value="">{municipio ? 'Todos os Balneários' : 'Bloqueado (Escolha a Cidade)'}</option>
          {balneariosDisponiveis.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          className="bg-transparent text-zinc-300 py-1.5 px-3 focus:outline-none focus:bg-zinc-800 w-32 cursor-pointer"
        >
          <option value="">Qualquer Status</option>
          <option value="propria">Própria</option>
          <option value="impropria">Imprópria</option>
        </select>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <button 
          onClick={handleApplyFilters}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 px-4 rounded-md text-sm font-medium transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filtrar
        </button>
        
        {(municipio || status || Object.keys(Object.fromEntries(searchParams)).length > 0) && (
          <button 
            onClick={handleClear}
            title="Limpar Filtros"
            className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white py-1.5 px-3 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
