'use client'

import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Zap, BarChart3, Settings, CheckCircle, Activity, Database, Brain, Target, Upload, Users, BookOpen, Cpu, Map, MapPin, Power, Factory, Building2, Gauge } from 'lucide-react';

import Sidebar from './Sidebar';
import Header from './Header';
import MetricCard from './MetricCard';
import OverviewTab from '../tabs/OverviewTab';
import ProjectionsTab from '../tabs/ProjectionsTab';
import TransmissionMapTab from '../tabs/TransmissionMapTab';
import SingleLineDiagramTab from '../tabs/SingleLineDiagramTab';
import DocumentationTab from '../tabs/DocumentationTab';

import { projectionData, transmissionData, singleLineData } from '@/lib/data';
import { ProjectionData } from '@/types/dashboard';

export default function SisdatForecastDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStation, setSelectedStation] = useState(null);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab projectionData={projectionData} />;
      case 'projections':
        return <ProjectionsTab projectionData={projectionData} />;
      case 'transmission-map':
        return <TransmissionMapTab transmissionData={transmissionData} selectedStation={selectedStation} setSelectedStation={setSelectedStation} />;
      case 'single-line-diagram':
        return <SingleLineDiagramTab />;
      case 'documentation':
        return <DocumentationTab />;
      default:
        return <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Sección en Desarrollo</h3>
          <p className="text-slate-600">Esta funcionalidad estará disponible próximamente.</p>
        </div>;
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