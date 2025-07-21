'use client'

import React, { useEffect, useState } from 'react';

import Sidebar from './Sidebar';
import Header from './Header';
import OverviewTab from '../tabs/OverviewTab';
import ProjectionsTab from '../tabs/ProjectionsTab';
import TransmissionMapTab from '../tabs/TransmissionMapTab';
import SingleLineDiagramTab from '../tabs/SingleLineDiagramTab';
import DocumentationTab from '../tabs/DocumentationTab';

import { projectionData, transmissionData } from '@/lib/data';
import { Station } from '@/types/dashboard';

export default function SisdatForecastDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab projectionData={projectionData} />;
      case 'projections':
        return <ProjectionsTab projectionData={projectionData} />;
      case 'transmission-map':
        return (
          <TransmissionMapTab
            transmissionData={transmissionData}
            selectedStation={selectedStation}
            setSelectedStation={setSelectedStation}
          />
        );
      case 'single-line-diagram':
        return <SingleLineDiagramTab />;
      case 'documentation':
        return <DocumentationTab />;
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Sección en Desarrollo</h3>
            <p className="text-slate-600">Esta funcionalidad estará disponible próximamente.</p>
          </div>
        );
    }
  };

  const className = "bg-white text-black";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
       
        <div className="md:block hidden">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-40 flex">
            <div className="bg-white w-64 h-full shadow-lg">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setSidebarOpen(false);
                }}
                mobile
              />
            </div>
            <div
              className="flex-1"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
            />
          </div>
        )}
        <div className="flex-1 md:ml-64">
          <div className="md:hidden flex items-center px-4 py-2 gap-2 bg-white rounded-lg shadow-sm">
            <button
              className="p-1 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h14M3 10h14M3 14h14"/>
              </svg>
            </button>
            <span
              className="text-lg font-semibold text-slate-900 truncate overflow-hidden whitespace-nowrap flex-1"
              title={activeTab === 'overview' ? 'Proyecciones de Demanda' : activeTab === 'projections' ? 'Proyecciones de Demanda' : activeTab === 'transmission-map' ? 'Mapa de Transmisión' : activeTab === 'single-line-diagram' ? 'Diagrama Unifilar' : activeTab === 'documentation' ? 'Documentación' : 'Sección en Desarrollo'}
            >
              {activeTab === 'overview' && 'Proyecciones de Demanda'}
              {activeTab === 'projections' && 'Proyecciones de Demanda'}
              {activeTab === 'transmission-map' && 'Mapa de Transmisión'}
              {activeTab === 'single-line-diagram' && 'Diagrama Unifilar'}
              {activeTab === 'documentation' && 'Documentación'}
            </span>
          </div>
          <div className="hidden md:block">
            <Header activeTab={activeTab} />
          </div>
          <main className="p-2 md:p-6">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
}