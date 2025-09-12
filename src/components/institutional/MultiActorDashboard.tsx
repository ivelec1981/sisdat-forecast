'use client'

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Building2, 
  TrendingUp, 
  MapPin, 
  Settings, 
  Download, 
  Eye,
  Shield,
  Users,
  BarChart3,
  Globe,
  Zap,
  FileText,
  Filter,
  RefreshCw
} from 'lucide-react';

export enum InstitutionalActor {
  ARCONEL = 'ARCONEL',           // Agencia de Regulación y Control de Electricidad
  MEM = 'MEM',                   // Ministerio de Energía y Minas
  CELEC = 'CELEC',               // Corporación Eléctrica del Ecuador
  CENACE = 'CENACE',             // Centro Nacional de Control de Energía
  CNEL = 'CNEL',                 // Corporación Nacional de Electricidad
  EMPRESA_ELECTRICA = 'EMPRESA_ELECTRICA' // Empresas Eléctricas Distribuidoras
}

export interface ActorPermissions {
  canViewNationalData: boolean;
  canViewRegionalData: boolean;
  canViewCompanyData: boolean;
  canViewTechnicalLosses: boolean;
  canViewProjections: boolean;
  canExportData: boolean;
  canModifyParameters: boolean;
  canViewSensitiveMetrics: boolean;
  allowedCompanies?: string[];
  allowedRegions?: string[];
  maxDataRetention: number; // días
}

export interface ActorConfiguration {
  actor: InstitutionalActor;
  displayName: string;
  permissions: ActorPermissions;
  theme: {
    primaryColor: string;
    logoUrl?: string;
    brandName: string;
  };
  dashboardLayout: {
    showNationalOverview: boolean;
    showRegionalBreakdown: boolean;
    showCompanyDetails: boolean;
    showTechnicalIndicators: boolean;
    showRegulatoryMetrics: boolean;
    prioritySections: string[];
  };
}

interface MultiActorDashboardProps {
  currentActor: InstitutionalActor;
  configuration: ActorConfiguration;
  onActorChange?: (actor: InstitutionalActor) => void;
}

const DEFAULT_CONFIGURATIONS: Record<InstitutionalActor, ActorConfiguration> = {
  [InstitutionalActor.ARCONEL]: {
    actor: InstitutionalActor.ARCONEL,
    displayName: 'ARCONEL - Regulación y Control',
    permissions: {
      canViewNationalData: true,
      canViewRegionalData: true,
      canViewCompanyData: true,
      canViewTechnicalLosses: true,
      canViewProjections: true,
      canExportData: true,
      canModifyParameters: true,
      canViewSensitiveMetrics: true,
      maxDataRetention: 3650 // 10 años
    },
    theme: {
      primaryColor: '#1e40af',
      brandName: 'ARCONEL',
      logoUrl: '/logos/arconel.png'
    },
    dashboardLayout: {
      showNationalOverview: true,
      showRegionalBreakdown: true,
      showCompanyDetails: true,
      showTechnicalIndicators: true,
      showRegulatoryMetrics: true,
      prioritySections: ['regulatory-metrics', 'technical-losses', 'company-performance']
    }
  },
  [InstitutionalActor.MEM]: {
    actor: InstitutionalActor.MEM,
    displayName: 'Ministerio de Energía y Minas',
    permissions: {
      canViewNationalData: true,
      canViewRegionalData: true,
      canViewCompanyData: true,
      canViewTechnicalLosses: false,
      canViewProjections: true,
      canExportData: true,
      canModifyParameters: false,
      canViewSensitiveMetrics: true,
      maxDataRetention: 1825 // 5 años
    },
    theme: {
      primaryColor: '#dc2626',
      brandName: 'MEM',
      logoUrl: '/logos/mem.png'
    },
    dashboardLayout: {
      showNationalOverview: true,
      showRegionalBreakdown: true,
      showCompanyDetails: false,
      showTechnicalIndicators: false,
      showRegulatoryMetrics: false,
      prioritySections: ['national-overview', 'energy-policy', 'long-term-planning']
    }
  },
  [InstitutionalActor.CELEC]: {
    actor: InstitutionalActor.CELEC,
    displayName: 'CELEC EP',
    permissions: {
      canViewNationalData: false,
      canViewRegionalData: true,
      canViewCompanyData: true,
      canViewTechnicalLosses: true,
      canViewProjections: true,
      canExportData: true,
      canModifyParameters: false,
      canViewSensitiveMetrics: false,
      allowedCompanies: ['CELEC EP'],
      allowedRegions: ['Nacional'],
      maxDataRetention: 1095 // 3 años
    },
    theme: {
      primaryColor: '#059669',
      brandName: 'CELEC EP',
      logoUrl: '/logos/celec.png'
    },
    dashboardLayout: {
      showNationalOverview: false,
      showRegionalBreakdown: true,
      showCompanyDetails: true,
      showTechnicalIndicators: true,
      showRegulatoryMetrics: false,
      prioritySections: ['generation-planning', 'transmission-analysis', 'technical-performance']
    }
  },
  [InstitutionalActor.CENACE]: {
    actor: InstitutionalActor.CENACE,
    displayName: 'CENACE',
    permissions: {
      canViewNationalData: true,
      canViewRegionalData: true,
      canViewCompanyData: true,
      canViewTechnicalLosses: true,
      canViewProjections: true,
      canExportData: true,
      canModifyParameters: false,
      canViewSensitiveMetrics: true,
      maxDataRetention: 2555 // 7 años
    },
    theme: {
      primaryColor: '#7c3aed',
      brandName: 'CENACE',
      logoUrl: '/logos/cenace.png'
    },
    dashboardLayout: {
      showNationalOverview: true,
      showRegionalBreakdown: true,
      showCompanyDetails: true,
      showTechnicalIndicators: true,
      showRegulatoryMetrics: true,
      prioritySections: ['system-operation', 'load-dispatch', 'real-time-monitoring']
    }
  },
  [InstitutionalActor.CNEL]: {
    actor: InstitutionalActor.CNEL,
    displayName: 'CNEL EP',
    permissions: {
      canViewNationalData: false,
      canViewRegionalData: true,
      canViewCompanyData: true,
      canViewTechnicalLosses: true,
      canViewProjections: true,
      canExportData: true,
      canModifyParameters: false,
      canViewSensitiveMetrics: false,
      allowedCompanies: ['CNEL EP Esmeraldas', 'CNEL EP Guayaquil', 'CNEL EP Los Ríos', 'CNEL EP Manabí', 'CNEL EP Santa Elena'],
      allowedRegions: ['Costa'],
      maxDataRetention: 1095 // 3 años
    },
    theme: {
      primaryColor: '#ea580c',
      brandName: 'CNEL EP',
      logoUrl: '/logos/cnel.png'
    },
    dashboardLayout: {
      showNationalOverview: false,
      showRegionalBreakdown: true,
      showCompanyDetails: true,
      showTechnicalIndicators: true,
      showRegulatoryMetrics: false,
      prioritySections: ['distribution-management', 'customer-service', 'network-optimization']
    }
  },
  [InstitutionalActor.EMPRESA_ELECTRICA]: {
    actor: InstitutionalActor.EMPRESA_ELECTRICA,
    displayName: 'Empresa Eléctrica',
    permissions: {
      canViewNationalData: false,
      canViewRegionalData: false,
      canViewCompanyData: true,
      canViewTechnicalLosses: true,
      canViewProjections: true,
      canExportData: true,
      canModifyParameters: false,
      canViewSensitiveMetrics: false,
      maxDataRetention: 730 // 2 años
    },
    theme: {
      primaryColor: '#0891b2',
      brandName: 'Empresa Eléctrica',
      logoUrl: '/logos/generic-electric.png'
    },
    dashboardLayout: {
      showNationalOverview: false,
      showRegionalBreakdown: false,
      showCompanyDetails: true,
      showTechnicalIndicators: true,
      showRegulatoryMetrics: false,
      prioritySections: ['company-performance', 'customer-analysis', 'operational-metrics']
    }
  }
};

export default function MultiActorDashboard({ 
  currentActor, 
  configuration, 
  onActorChange 
}: MultiActorDashboardProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [dataFilters, setDataFilters] = useState({
    timeRange: '12m',
    sector: 'all',
    region: 'all',
    company: 'all'
  });
  const [isLoading, setIsLoading] = useState(false);

  const config = useMemo(() => 
    configuration || DEFAULT_CONFIGURATIONS[currentActor], 
    [currentActor, configuration]
  );

  const availableSections = useMemo(() => {
    const sections = [];
    
    if (config.dashboardLayout.showNationalOverview && config.permissions.canViewNationalData) {
      sections.push({ id: 'overview', label: 'Vista Nacional', icon: Globe });
    }
    
    if (config.dashboardLayout.showRegionalBreakdown && config.permissions.canViewRegionalData) {
      sections.push({ id: 'regional', label: 'Análisis Regional', icon: MapPin });
    }
    
    if (config.dashboardLayout.showCompanyDetails && config.permissions.canViewCompanyData) {
      sections.push({ id: 'companies', label: 'Empresas', icon: Building2 });
    }
    
    if (config.dashboardLayout.showTechnicalIndicators && config.permissions.canViewTechnicalLosses) {
      sections.push({ id: 'technical', label: 'Indicadores Técnicos', icon: Zap });
    }
    
    if (config.permissions.canViewProjections) {
      sections.push({ id: 'projections', label: 'Proyecciones', icon: TrendingUp });
    }
    
    if (config.dashboardLayout.showRegulatoryMetrics && config.permissions.canViewSensitiveMetrics) {
      sections.push({ id: 'regulatory', label: 'Métricas Regulatorias', icon: Shield });
    }

    return sections;
  }, [config]);

  const handleDataRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simular llamada a API para actualizar datos
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExportData = useCallback(() => {
    if (!config.permissions.canExportData) {
      alert('No tiene permisos para exportar datos');
      return;
    }
    
    // Implementar lógica de exportación
    console.log('Exportando datos para:', currentActor);
  }, [config.permissions.canExportData, currentActor]);

  const renderSectionContent = useCallback(() => {
    switch (activeSection) {
      case 'overview':
        return <NationalOverviewSection config={config} filters={dataFilters} />;
      case 'regional':
        return <RegionalAnalysisSection config={config} filters={dataFilters} />;
      case 'companies':
        return <CompanyDetailsSection config={config} filters={dataFilters} />;
      case 'technical':
        return <TechnicalIndicatorsSection config={config} filters={dataFilters} />;
      case 'projections':
        return <ProjectionsSection config={config} filters={dataFilters} />;
      case 'regulatory':
        return <RegulatoryMetricsSection config={config} filters={dataFilters} />;
      default:
        return <div className="p-6 text-center text-slate-500">Sección no disponible</div>;
    }
  }, [activeSection, config, dataFilters]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header institucional */}
      <div 
        className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"
        style={{ borderTopColor: config.theme.primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {config.theme.logoUrl && (
                <img 
                  src={config.theme.logoUrl} 
                  alt={config.theme.brandName}
                  className="h-8 w-auto"
                />
              )}
              <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {config.displayName}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Sistema de Proyección de Demanda Eléctrica
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDataRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </Button>
              
              {config.permissions.canExportData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </Button>
              )}
              
              {config.permissions.canModifyParameters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Configurar</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de navegación */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Secciones Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {availableSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {section.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DataFilters 
                  filters={dataFilters}
                  onFiltersChange={setDataFilters}
                  permissions={config.permissions}
                />
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderSectionContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes de sección específicos
function NationalOverviewSection({ config, filters }: { config: ActorConfiguration; filters: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vista Nacional de Demanda Eléctrica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">15,234 GWh</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Demanda Total Anual</div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">+3.2%</div>
              <div className="text-sm text-green-600 dark:text-green-400">Crecimiento Anual</div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">2,841 MW</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Demanda Máxima</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RegionalAnalysisSection({ config, filters }: { config: ActorConfiguration; filters: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análisis Regional</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Análisis detallado por regiones del Ecuador
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function CompanyDetailsSection({ config, filters }: { config: ActorConfiguration; filters: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalles por Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Información específica de empresas eléctricas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function TechnicalIndicatorsSection({ config, filters }: { config: ActorConfiguration; filters: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Indicadores Técnicos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Métricas técnicas y pérdidas del sistema
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectionsSection({ config, filters }: { config: ActorConfiguration; filters: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proyecciones de Demanda</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Proyecciones multi-horizonte de demanda eléctrica
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function RegulatoryMetricsSection({ config, filters }: { config: ActorConfiguration; filters: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Métricas Regulatorias</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Indicadores para supervisión regulatoria
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DataFilters({ 
  filters, 
  onFiltersChange, 
  permissions 
}: { 
  filters: any; 
  onFiltersChange: (filters: any) => void; 
  permissions: ActorPermissions;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Período
        </label>
        <select 
          value={filters.timeRange}
          onChange={(e) => onFiltersChange({ ...filters, timeRange: e.target.value })}
          className="w-full mt-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1"
        >
          <option value="3m">Últimos 3 meses</option>
          <option value="6m">Últimos 6 meses</option>
          <option value="12m">Último año</option>
          <option value="24m">Últimos 2 años</option>
        </select>
      </div>
      
      <div>
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Sector
        </label>
        <select 
          value={filters.sector}
          onChange={(e) => onFiltersChange({ ...filters, sector: e.target.value })}
          className="w-full mt-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1"
        >
          <option value="all">Todos</option>
          <option value="residential">Residencial</option>
          <option value="commercial">Comercial</option>
          <option value="industrial">Industrial</option>
          <option value="public">Alumbrado Público</option>
        </select>
      </div>
    </div>
  );
}