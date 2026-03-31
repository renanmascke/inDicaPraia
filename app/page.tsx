import { Activity, Database, LayoutDashboard, Server, User, ShieldCheck, AlertTriangle, Droplets, MapPin, Filter, Bell } from 'lucide-react';
import TableFilters from '@/components/TableFilters';
import Pagination from '@/components/Pagination';
import DataTable from '@/components/DataTable';
import { BathingRepository } from '@/repositories/BathingRepository';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export default async function Home({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const municipio = typeof resolvedSearchParams.municipio === 'string' ? resolvedSearchParams.municipio : '';
  const balneario = typeof resolvedSearchParams.balneario === 'string' ? resolvedSearchParams.balneario : '';
  const statusFilter = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : '';
  const currentPage = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page, 10) : 1;
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'data';
  const order = typeof resolvedSearchParams.order === 'string' ? resolvedSearchParams.order : 'desc';
  const limit = 30; // 30 por página para ficar robusto sem travar
  const offset = (currentPage - 1) * limit;
  
  let records: any[] = [];
  let insights = { scope: 'Estado', total: 0, safe: 0, danger: 0, topSafe: [] as any[], topDanger: [] as any[] };
  let locationsTree = {};
  let totalRecords = 0;
  
  try {
    const repo = new BathingRepository();
    const [fetchedRecords, insightsData, locTree, count] = await Promise.all([
      repo.findRecords(municipio, balneario, statusFilter, limit, offset, sort, order),
      repo.getDashboardInsights(municipio, balneario),
      repo.getLocationsTree(),
      repo.countRecords(municipio, balneario, statusFilter)
    ]);
    records = fetchedRecords;
    insights = insightsData;
    locationsTree = locTree;
    totalRecords = count;
  } catch (error) {
    console.error('Erro ao buscar dados (SSR):', error);
  }

  const totalPages = Math.ceil(totalRecords / limit);
  const percentageSafe = insights.total === 0 ? 0 : Math.round((insights.safe / insights.total) * 100);

  return (
    <div className="flex h-screen bg-black text-zinc-100 font-sans selection:bg-zinc-800">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-800 bg-[#09090b] flex-shrink-0 flex-col hidden lg:flex">
        <div className="h-14 flex items-center px-6 border-b border-zinc-800">
          <div className="flex items-center gap-2.5 w-full">
            <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center text-black">
              <Activity className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="font-semibold tracking-tight text-sm">inDicaPraia SC</span>
            <span className="ml-auto text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-medium">BETA</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Visão Geral</div>
          <a href="#" className="flex items-center gap-3 px-3 py-2 bg-zinc-800/80 text-zinc-100 rounded-md text-sm font-medium transition-colors">
            <LayoutDashboard className="w-4 h-4 text-zinc-400" />
            Análises (BI)
          </a>
          <a href="/docs" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md text-sm font-medium transition-colors">
            <Database className="w-4 h-4 text-zinc-500" />
            API Swagger
          </a>
          
          <div className="px-3 mt-8 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Sistema Interno</div>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md text-sm font-medium transition-colors">
            <Server className="w-4 h-4 text-zinc-500" />
            Sincronização IMA
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md text-sm font-medium transition-colors">
            <User className="w-4 h-4 text-zinc-500" />
            Configurações
          </a>
        </nav>
        
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Subtle Backdrop Glow */}
        <div className="absolute top-[-30%] left-[20%] w-[50%] h-[50%] bg-zinc-800/20 blur-[150px] mix-blend-screen pointer-events-none rounded-full"></div>

          <div className="flex flex-col lg:flex-row items-center justify-between px-6 bg-black/80 backdrop-blur-md z-10 sticky top-0 border-b border-zinc-800 py-3 gap-4">
            {/* Coluna 1: Breadcrumb (25%) */}
            <div className="flex items-center gap-2 text-sm w-full lg:w-1/4">
              <span className="text-zinc-600 font-medium whitespace-nowrap hidden lg:block">Painel / Análises de Balneabilidade</span>
            </div>
            
            {/* Coluna 2: Filters (50%) */}
            <div className="w-full lg:w-2/4 flex justify-center">
              <TableFilters 
                locationsTree={locationsTree} 
                initialMunicipio={municipio} 
                initialBalneario={balneario}
                initialStatus={statusFilter}
              />
            </div>

            {/* Coluna 3: User Profile & Actions (25%) */}
            <div className="flex items-center justify-end gap-5 w-full lg:w-1/4">
              <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-black"></span>
              </button>
              <div className="flex items-center gap-3 border-l border-zinc-800 pl-5">
                <div className="flex flex-col text-right hidden lg:flex">
                  <span className="text-sm font-medium text-zinc-200">Administrador</span>
                  <span className="text-[10px] text-zinc-500">Sistema Online</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-sm">
                  <span className="text-zinc-400 text-xs font-bold">AD</span>
                </div>
              </div>
            </div>
          </div>

        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Inteligência Ambiental</h1>
              <p className="text-sm text-zinc-400">Monitoramento geográfico consolidando o status atual de {insights.total.toLocaleString('pt-BR')} pontos de coleta independentes mapeados em {insights.scope === 'Estado' ? 'Santa Catarina' : insights.scope === 'Balneário' ? municipio : balneario}.</p>
            </div>

            {/* Metrics Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Widget 1: Saúde Costeira Global */}
              <div className="bento-card p-5 group hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-zinc-400 tracking-tight flex-1 line-clamp-1 mr-2" title={`Situação Atual ${insights.scope === 'Estado' ? '(SC)' : insights.scope === 'Balneário' ? `(${municipio})` : `(${balneario})`}`}>
                    Situação Atual {insights.scope === 'Estado' ? '(SC)' : insights.scope === 'Balneário' ? `(${municipio})` : `(${balneario})`}
                  </h3>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_theme(colors.emerald.500/0.5)]"></div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tighter text-white">{percentageSafe}%</span>
                  <span className="text-xs text-zinc-500 font-medium">Pontos Seguros Hoje</span>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: `${percentageSafe}%` }}></div>
                    <div className="h-full bg-rose-500" style={{ width: `${100 - percentageSafe}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider">
                    <span className="text-emerald-500">Seguro: {insights.safe.toLocaleString('pt-BR')}</span>
                    <span className="text-rose-500">Risco: {insights.danger.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Widget 2: Ranking Cidades Próprias */}
              <div className="bento-card p-5 group hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-zinc-400 tracking-tight">Melhores {insights.scope === 'Estado' ? 'Destinos' : insights.scope === 'Balneário' ? 'Balneários' : 'Pontos'} (Ativos)</h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="space-y-3 mt-2 flex-1 flex flex-col justify-center">
                  {insights.topSafe.length > 0 ? insights.topSafe.map((city: any, idx: number) => (
                    <div key={city.label} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-zinc-200 truncate w-[60%] hover:text-white" title={city.label}>{idx + 1}. {city.label}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {insights.scope === 'Ponto' ? (
                            <span className="text-xs font-bold text-emerald-400">Próprio</span>
                          ) : (
                            <>
                              <span className="text-xs font-bold text-emerald-400">{city.pct}% Segura</span>
                              <span className="text-[10px] text-zinc-500">({city.count}/{city.total}pts)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : null}
                  {insights.topSafe.length === 0 && <p className="text-xs text-zinc-500">Dados insuficientes.</p>}
                </div>
              </div>

              {/* Widget 3: Zonas Críticas */}
              <div className="bento-card p-5 group hover:border-zinc-700 transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl pointer-events-none rounded-full"></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h3 className="text-sm font-medium text-zinc-400 tracking-tight flex-1 line-clamp-1 mr-2" title={`Interdições / Alertas ${insights.scope === 'Estado' ? '(SC)' : insights.scope === 'Balneário' ? `(${municipio})` : `(${balneario})`}`}>
                    Interdições / Alertas {insights.scope === 'Estado' ? '(SC)' : insights.scope === 'Balneário' ? `(${municipio})` : `(${balneario})`}
                  </h3>
                  <AlertTriangle className="w-4 h-4 text-rose-500/80" />
                </div>
                <div className="space-y-3 mt-2 relative z-10 flex-1 flex flex-col justify-center">
                  {insights.topDanger.length > 0 ? insights.topDanger.map((city: any, idx: number) => (
                    <div key={city.label} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-zinc-200 truncate w-[60%] hover:text-white" title={city.label}>{idx + 1}. {city.label}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {insights.scope === 'Ponto' ? (
                            <span className="text-xs font-bold text-rose-400">Impróprio</span>
                          ) : (
                            <>
                              <span className="text-xs font-bold text-rose-400">{city.pct}% Risco</span>
                              <span className="text-[10px] text-zinc-500">({city.count}/{city.total}pts)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : null}
                  {insights.topDanger.length === 0 && <p className="text-xs text-zinc-500">Nenhum risco detectado.</p>}
                </div>
              </div>

            </div>

            {/* Telemetry Data Grid */}
            <div className="bento-card border-zinc-800/80">
              <div className="px-5 py-4 border-b border-zinc-800/80 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#09090b] gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                  Amostragens da Malha 
                  {(municipio || balneario || statusFilter) && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">FILTRADO</span>}
                </h2>
                <div className="flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                    Feed Dinâmico ({totalRecords.toLocaleString('pt-BR')} registros)
                  </span>
                </div>
              </div>
              <DataTable records={records} />
              <Pagination currentPage={currentPage} totalPages={totalPages} totalRecords={totalRecords} />
            </div>
            
            {/* Minimal Footer */}
            <div className="pt-8 pb-4 border-t border-zinc-800/50 flex justify-between items-center">
               <div className="flex items-center gap-2 opacity-50">
                 <MapPin className="w-4 h-4 text-zinc-500" />
                 <span className="text-xs text-zinc-500 font-medium">Dados validados pelo Instituto do Meio Ambiente (SC).</span>
               </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
