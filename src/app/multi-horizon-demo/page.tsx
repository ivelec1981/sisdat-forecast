import MultiHorizonDemo from '@/components/projections/MultiHorizonDemo';

export default function MultiHorizonDemoPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Sistema Multi-Horizonte - Demostración
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Implementación de la metodología oficial ecuatoriana para proyecciones de demanda eléctrica
          </p>
        </div>
        
        <MultiHorizonDemo />
        
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Acceso al Sistema
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              <strong>Dashboard Principal:</strong> 
              <a href="/dashboard" className="text-blue-600 hover:text-blue-700 ml-1">
                Ir al Dashboard SISDAT →
              </a>
            </p>
            <p>
              <strong>Esta Demostración:</strong> 
              <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs ml-1">
                /multi-horizon-demo
              </code>
            </p>
            <p>
              <strong>Estado:</strong> 
              <span className="text-green-600 ml-1">✓ Sistema implementado y funcional</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}