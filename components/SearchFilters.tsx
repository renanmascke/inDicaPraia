'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Radar, X } from 'lucide-react';

interface SearchFiltersProps {
  initialSearch?: string;
}

export default function SearchFilters({ initialSearch = '' }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const applySearch = useCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('municipio', term);
    } else {
      params.delete('municipio');
    }
    router.push(pathname + '?' + params.toString());
  }, [pathname, router, searchParams]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applySearch(searchTerm);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    applySearch('');
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-16 fade-up-enter stagger-4">
      <div className="relative flex-1 group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
          <Search className="h-5 w-5 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors duration-500" />
        </div>
        
        {/* Glowing border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-blue-500/0 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-700 pointer-events-none"></div>
        
        <input
          type="text"
          className="relative block w-full pl-14 pr-16 py-5 bg-white/[0.02] border border-white/[0.05] rounded-3xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/50 focus:bg-white/[0.04] transition-all duration-500 font-mono text-sm tracking-widest uppercase shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]"
          placeholder="TARGET_LOCATION..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-4 pr-4 flex items-center text-slate-500 hover:text-rose-400 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <button
        onClick={() => applySearch(searchTerm)}
        className="group relative inline-flex flex-shrink-0 items-center justify-center gap-3 px-10 py-5 bg-cyan-950/40 border border-cyan-500/20 hover:bg-cyan-900/40 hover:border-cyan-400/50 text-cyan-400 font-mono text-xs font-bold tracking-[0.2em] rounded-3xl transition-all duration-500 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
        <Radar className="w-5 h-5 group-hover:animate-spin-slow duration-[3000ms]" />
        SCAN
      </button>
    </div>
  );
}
