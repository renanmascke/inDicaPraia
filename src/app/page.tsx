export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950 text-white">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">inDicaPraia API</h1>
      <p className="text-lg text-slate-400 mb-8 text-center max-w-md">
        Módulo de sincronização e consulta de balneabilidade do IMA.
      </p>
      <div className="grid grid-cols-1 gap-4 w-full max-w-2xl">
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Endpoints Integrados:</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            <li><code className="text-pink-400">POST /v1/sync</code> - Sincroniza dados históricos por ano</li>
            <li><code className="text-pink-400">GET /v1/data</code> - Consulta registros de balneabilidade</li>
          </ul>
        </div>
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2 text-yellow-400">Segurança:</h2>
          <p className="text-slate-300">Todas as requisições API requerem o header <code className="text-pink-400">x-api-key</code>.</p>
        </div>
      </div>
    </main>
  );
}
