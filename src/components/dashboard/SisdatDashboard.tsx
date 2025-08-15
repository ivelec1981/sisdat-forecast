'use client'

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleSidebarToggleCollapse = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const renderTabContent = useCallback(() => {
    const content = (() => {
      switch (activeTab) {
        case 'overview':
          return <OverviewTab projectionData={projectionData} />;
        case 'projections':
          return <ProjectionsTab />;
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
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Sección en Desarrollo</h3>
              <p className="text-slate-600 dark:text-slate-300">Esta funcionalidad estará disponible próximamente.</p>
            </motion.div>
          );
      }
    })();

    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {content}
      </motion.div>
    );
  }, [activeTab, selectedStation, projectionData, transmissionData]);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row">
       
        <div className="md:block hidden">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={handleSidebarToggleCollapse}
          />
        </div>
        
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-40 flex">
            <div className="bg-white dark:bg-slate-900 w-64 h-full shadow-lg">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  handleSidebarClose();
                }}
                mobile
              />
            </div>
            <div
              className="flex-1"
              onClick={handleSidebarClose}
              aria-label="Cerrar menú"
            />
          </div>
        )}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}>
          <div className="md:hidden flex items-center px-4 py-2 gap-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <button
              className="p-1 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-100 focus:outline-none"
              onClick={handleSidebarToggle}
              aria-label="Abrir menú"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h14M3 10h14M3 14h14"/>
              </svg>
            </button>
            <span
              className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate overflow-hidden whitespace-nowrap flex-1"
              title={activeTab === 'overview' ? 'Proyecciones de Demanda' : activeTab === 'projections' ? 'Proyecciones de Demanda' : activeTab === 'transmission-map' ? 'Cargas Singulares' : activeTab === 'single-line-diagram' ? 'Diagrama Unifilar' : activeTab === 'documentation' ? 'Documentación' : 'Sección en Desarrollo'}
            >
              {activeTab === 'overview' && 'Proyecciones de Demanda'}
              {activeTab === 'projections' && 'Proyecciones de Demanda'}
              {activeTab === 'transmission-map' && 'Cargas Singulares'}
              {activeTab === 'single-line-diagram' && 'Diagrama Unifilar'}
              {activeTab === 'documentation' && 'Documentación'}
            </span>
          </div>
          <div className="hidden md:block">
            <Header activeTab={activeTab} />
          </div>
          <main className="p-2 md:p-6">
            <AnimatePresence mode="wait">
              {renderTabContent()}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}