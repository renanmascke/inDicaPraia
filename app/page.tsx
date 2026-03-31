'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import SearchFilters from '@/components/SearchFilters';
import BathingTable from '@/components/BathingTable';
import { Waves } from 'lucide-react';

export default function Home() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, proprio: 0, improprio: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = searchTerm 
        ? `/api/data?municipio=${encodeURIComponent(searchTerm)}&limit=100` 
        : '/api/data?limit=100';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'success') {
        const fetchedRecords = data.records || [];
        setRecords(fetchedRecords);
        
        // Calcular estatísticas básicas
        const proprio = fetchedRecords.filter((r: any) => 
          r.status.toLowerCase() === 'proprio' || r.status.toLowerCase() === 'próprio'
        ).length;
        
        setStats({
          total: fetchedRecords.length,
          proprio,
          improprio: fetchedRecords.length - proprio
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500); // Debounce de busca
    
    return () => clearTimeout(timer);
  }, [searchTerm, fetchData]);

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Background Decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-emerald-600/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header da Página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/20">
                <Waves className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white">
                inDica<span className="text-blue-400">Praia</span>
              </h1>
            </div>
            <p className="text-slate-400 text-lg">
              Monitoramento de Balneabilidade das Praias Catarinenses (IMA)
            </p>
          </div>
          
          <a 
            href="/docs" 
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            Acessar Documentação API
          </a>
        </div>

        {/* Dashboard Content */}
        <DashboardHeader 
          total={stats.total} 
          proprio={stats.proprio} 
          improprio={stats.improprio} 
        />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Registros Recentes
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-slate-400">
                Top 100
              </span>
            </h2>
          </div>
          
          <SearchFilters 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            onRefresh={fetchData} 
          />
          
          <BathingTable 
            records={records} 
            isLoading={loading} 
          />
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <p>© 2026 inDicaPraia - Dados fornecidos pelo IMA/SC</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Sistema Operacional
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
