'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
};

export default function Pagination({ currentPage, totalPages, totalRecords }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(pathname + '?' + params.toString());
  };

  if (totalRecords === 0) return null;

  return (
    <div className="flex justify-between items-center px-5 py-3 border-t border-zinc-800/80 bg-[#09090b] text-sm text-zinc-400">
      <div>
        <span>Mostrando página </span>
        <strong className="text-zinc-200">{currentPage}</strong>
        <span> de </span>
        <strong className="text-zinc-200">{totalPages}</strong>
        <span className="ml-2 hidden sm:inline">({totalRecords.toLocaleString('pt-BR')} medições)</span>
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => handlePage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => handlePage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
