'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';

export default function CommandBar({ initialValue = '' }: { initialValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback((value: string) => {
    setIsSearching(true);
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('municipio', value);
    else params.delete('municipio');
    
    router.push(pathname + '?' + params.toString());
    
    // Simula delay de rede para UX
    setTimeout(() => setIsSearching(false), 500);
  }, [pathname, router, searchParams]);

  return (
    <div className="w-full max-w-lg relative flex items-center">
      <Search className="absolute left-3 w-4 h-4 text-zinc-500" />
      <input
        type="text"
        placeholder="Pesquisar por município... (Pressione Enter)"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch(term)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-1.5 pl-9 pr-10 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:bg-zinc-800/50 transition-colors"
      />
      
      <div className="absolute right-3 flex items-center">
        {isSearching ? (
          <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
        ) : (
          <span className="text-[10px] text-zinc-600 border border-zinc-800 bg-zinc-900 px-1.5 rounded uppercase font-semibold cursor-default">
            ↵
          </span>
        )}
      </div>
    </div>
  );
}
