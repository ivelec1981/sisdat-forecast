'use client'

import React, { useState } from 'react';

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="ml-64">
        <Header activeTab={activeTab} />
        <main className="p-6">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}