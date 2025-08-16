'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, Zap, Activity } from 'lucide-react';
import MetricCard from '../dashboard/MetricCard';

interface PredictionData {
  id: number;
  model: string;
  category: string;
  targetYear: number;
  predictedValue: number;
  actualValue: number | null;
  accuracy: number | null;
  predictionDate: string;
}

interface RealTimeMetricsProps {
  predictionHistory: PredictionData[];
  className?: string;
}

export default function RealTimeMetrics({ predictionHistory, className = '' }: RealTimeMetricsProps) {
  // Procesar datos para métricas (excluyendo 'hist')
  const processedMetrics = React.useMemo(() => {
    const recent = predictionHistory
      .filter(p => p.actualValue !== null && p.model !== 'hist')
      .slice(0, 50);
    
    // Agrupar por modelo y procesar últimos 12 meses
    const accuracyByModel = recent.reduce((acc, pred) => {
      if (!acc[pred.model]) {
        acc[pred.model] = [];
      }
      
      if (pred.actualValue && pred.predictedValue) {
        const error = Math.abs(pred.actualValue - pred.predictedValue) / pred.actualValue;
        const accuracy = (1 - error) * 100;
        const date = new Date(pred.predictionDate);
        
        acc[pred.model].push({
          date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
          fullDate: date,
          accuracy: Math.max(0, Math.min(100, accuracy)),
          model: pred.model,
          predicted: pred.predictedValue,
          actual: pred.actualValue
        });
      }
      
      return acc;
    }, {} as Record<string, any[]>);

    // Ordenar por fecha y tomar últimos 12 meses para cada modelo
    Object.keys(accuracyByModel).forEach(model => {
      accuracyByModel[model] = accuracyByModel[model]
        .sort((a, b) => b.fullDate.getTime() - a.fullDate.getTime())
        .slice(0, 30); // Últimos 30 puntos por modelo
    });

    // Calcular métricas generales
    const totalPredictions = recent.length;
    const avgAccuracy = recent.reduce((sum, pred) => {
      if (pred.actualValue && pred.predictedValue) {
        const error = Math.abs(pred.actualValue - pred.predictedValue) / pred.actualValue;
        return sum + (1 - error) * 100;
      }
      return sum;
    }, 0) / (totalPredictions || 1);

    const bestModel = Object.entries(accuracyByModel).reduce((best, [model, data]) => {
      if (data.length === 0) return best;
      const modelAvg = data.reduce((sum, d) => sum + d.accuracy, 0) / data.length;
      return modelAvg > best.accuracy ? { model, accuracy: modelAvg } : best;
    }, { model: 'N/A', accuracy: 0 });

    // Combinar todos los datos para el gráfico, ordenados cronológicamente
    const chartData = Object.values(accuracyByModel).flat()
      .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

    return {
      accuracyByModel,
      totalPredictions,
      avgAccuracy,
      bestModel,
      chartData
    };
  }, [predictionHistory]);

  const modelColors: Record<string, string> = {
    prophet: '#3B82F6',
    lstm: '#10B981',
    gru: '#F59E0B',
    wavenet: '#EF4444',
    gbr: '#8B5CF6',
    comb: '#6366F1'
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Métricas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Predicciones Evaluadas"
          value={processedMetrics.totalPredictions.toString()}
          change="Últimos 30 días"
          changeType="neutral"
          icon={Target}
          color="blue"
        />
        <MetricCard
          title="Precisión Promedio"
          value={`${processedMetrics.avgAccuracy.toFixed(1)}%`}
          change={processedMetrics.avgAccuracy > 90 ? "Excelente" : processedMetrics.avgAccuracy > 80 ? "Bueno" : "Mejorable"}
          changeType={processedMetrics.avgAccuracy > 90 ? "positive" : processedMetrics.avgAccuracy > 80 ? "neutral" : "negative"}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Mejor Modelo"
          value={processedMetrics.bestModel.model.toUpperCase()}
          change={`${processedMetrics.bestModel.accuracy.toFixed(1)}% precisión`}
          changeType="positive"
          icon={Zap}
          color="yellow"
        />
        <MetricCard
          title="Modelos Activos"
          value={Object.keys(processedMetrics.accuracyByModel).length.toString()}
          change="En evaluación"
          changeType="neutral"
          icon={Activity}
          color="blue"
        />
      </div>

      {/* Gráfico de precisión temporal */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Evolución de Precisión por Modelo
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={processedMetrics.chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
            <XAxis 
              dataKey="date" 
              className="text-slate-600 dark:text-slate-300"
            />
            <YAxis 
              className="text-slate-600 dark:text-slate-300"
              domain={[70, 100]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgb(248, 250, 252)',
                border: '1px solid rgb(226, 232, 240)',
                borderRadius: '8px'
              }}
              formatter={(value: any, name: string) => [
                `${Number(value).toFixed(2)}%`,
                'Precisión'
              ]}
            />
            {Object.keys(processedMetrics.accuracyByModel).map((model) => (
              <Line
                key={model}
                type="monotone"
                dataKey="accuracy"
                data={processedMetrics.accuracyByModel[model]}
                stroke={modelColors[model] || '#6B7280'}
                strokeWidth={2}
                dot={{ r: 4 }}
                name={model.toUpperCase()}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de predicciones recientes */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Predicciones Recientes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600">
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Fecha</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Modelo</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Categoría</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Predicho</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Real</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Error</th>
              </tr>
            </thead>
            <tbody>
              {predictionHistory
                .filter(pred => pred.model !== 'hist')
                .slice(0, 8)
                .map((pred) => {
                  const error = pred.actualValue && pred.predictedValue 
                    ? Math.abs(pred.actualValue - pred.predictedValue) / pred.actualValue * 100
                    : null;
                  
                  return (
                    <tr key={pred.id} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {new Date(pred.predictionDate).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium">
                        {pred.model.toUpperCase()}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 capitalize">
                        {pred.category}
                      </td>
                      <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-300">
                        {pred.predictedValue.toFixed(1)} MW
                      </td>
                      <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-300">
                        {pred.actualValue ? `${pred.actualValue.toFixed(1)} MW` : 'N/A'}
                      </td>
                      <td className="text-center py-3 px-4">
                        {error !== null ? (
                          <span className={`font-medium ${
                            error < 5 ? 'text-green-600 dark:text-green-400' : 
                            error < 10 ? 'text-yellow-600 dark:text-yellow-400' : 
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {error.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}