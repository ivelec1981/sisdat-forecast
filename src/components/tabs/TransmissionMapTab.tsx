'use client'

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load del mapa para optimizar el bundle
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export default function TransmissionMapTab({ transmissionData, selectedStation, setSelectedStation }) {
  return (
    <div className="space-y-6">
      {/* Métricas del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ... métricas ... */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <Suspense fallback={<LoadingSpinner />}>
            <LeafletMap 
              transmissionData={transmissionData}
              selectedStation={selectedStation}
              setSelectedStation={setSelectedStation}
            />
          </Suspense>
        </div>
        {/* ... resto del componente ... */}
      </div>
    </div>
  );
}