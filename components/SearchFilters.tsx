import { Search, RefreshCw } from 'lucide-react';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh: () => void;
}

export default function SearchFilters({ searchTerm, setSearchTerm, onRefresh }: SearchFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1 group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
          placeholder="Buscar por município..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <button
        onClick={onRefresh}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20"
      >
        <RefreshCw className="w-4 h-4" />
        Atualizar Dados
      </button>
    </div>
  );
}
