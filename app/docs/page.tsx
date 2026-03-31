'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { Terminal, ArrowLeft } from 'lucide-react';

// Forçamos o SwaggerUI a renderizar apenas no cliente e tentamos isolar problemas de ciclo de vida
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Carregando Documentação...</p>
    </div>
  )
});

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Mini Header para o Swagger */}
      <div className="bg-slate-900 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">API Reference</h1>
        </div>
        <a 
          href="/" 
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </a>
      </div>

      <div className="swagger-container">
        <style jsx global>{`
          .swagger-ui .topbar { display: none; }
          .swagger-ui .info { margin: 40px 0; }
          .swagger-ui .info .title { color: #0f172a; font-weight: 800; font-family: Inter, sans-serif; }
          .swagger-ui .btn.authorize { color: #2563eb; border-color: #2563eb; }
          .swagger-ui .btn.authorize svg { fill: #2563eb; }
        `}</style>
        <SwaggerUI 
          url="/api/docs/swagger.json" 
          docExpansion="list"
          defaultModelExpandDepth={2}
        />
      </div>
    </div>
  );
}
