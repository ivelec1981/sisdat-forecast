import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransmissionMapTab from '../TransmissionMapTab';

// Mock the map component since it requires Leaflet
jest.mock('@/components/map/EmpresasElectricasMapWithLeaflet', () => {
  return function MockMap({ onEmpresaSelect, onCargaSelect, showCargas }: any) {
    return (
      <div data-testid="mock-map">
        <button
          onClick={() => onEmpresaSelect?.({ id: 'QUI', nombre: 'E.E. QUITO', potencia: '671 MW' })}
          data-testid="select-empresa-qui"
        >
          Select E.E. QUITO
        </button>
        <button
          onClick={() => onCargaSelect?.({ 
            empresa: "E.E. Quito",
            id_cliente_ext: "NOVACERO",
            demanda_maxima: 211189.3,
            nivel_voltaje_kv: 138
          })}
          data-testid="select-carga-novacero"
        >
          Select NOVACERO
        </button>
        {showCargas && <div data-testid="cargas-visible">Cargas shown</div>}
      </div>
    );
  };
});

const mockTransmissionData = {
  stations: [],
  industrialLoads: []
};

describe('TransmissionMapTab', () => {
  it('renders the map and metrics correctly', () => {
    render(
      <TransmissionMapTab
        transmissionData={mockTransmissionData}
        selectedStation={null}
        setSelectedStation={() => {}}
      />
    );

    // Check if metrics are displayed
    expect(screen.getByText('Empresas Eléctricas')).toBeInTheDocument();
    expect(screen.getByText('Cargas Singulares')).toBeInTheDocument();
    expect(screen.getByText('Demanda Singular')).toBeInTheDocument();
    expect(screen.getByText('Capa Activa')).toBeInTheDocument();

    // Check if map is rendered
    expect(screen.getByTestId('mock-map')).toBeInTheDocument();
    expect(screen.getByTestId('cargas-visible')).toBeInTheDocument();
  });

  it('displays initial message when no selection', () => {
    render(
      <TransmissionMapTab
        transmissionData={mockTransmissionData}
        selectedStation={null}
        setSelectedStation={() => {}}
      />
    );

    expect(screen.getByText('Haz clic en el mapa para ver información detallada')).toBeInTheDocument();
    expect(screen.getByText(/20.*empresas distribuidoras/)).toBeInTheDocument();
    expect(screen.getByText(/10.*cargas singulares/)).toBeInTheDocument();
  });

  it('handles empresa selection correctly', async () => {
    render(
      <TransmissionMapTab
        transmissionData={mockTransmissionData}
        selectedStation={null}
        setSelectedStation={() => {}}
      />
    );

    // Click to select an empresa
    fireEvent.click(screen.getByTestId('select-empresa-qui'));

    await waitFor(() => {
      expect(screen.getByText('Información de Empresa')).toBeInTheDocument();
      expect(screen.getByText('E.E. QUITO')).toBeInTheDocument();
      expect(screen.getByText('671 MW')).toBeInTheDocument();
      expect(screen.getByText('QUI')).toBeInTheDocument();
    });

    // Check that active layer is updated
    expect(screen.getByText('Empresa')).toBeInTheDocument();
  });

  it('handles carga selection correctly', async () => {
    render(
      <TransmissionMapTab
        transmissionData={mockTransmissionData}
        selectedStation={null}
        setSelectedStation={() => {}}
      />
    );

    // Click to select a carga
    fireEvent.click(screen.getByTestId('select-carga-novacero'));

    await waitFor(() => {
      expect(screen.getByText('Información de Carga')).toBeInTheDocument();
      expect(screen.getByText('NOVACERO')).toBeInTheDocument();
      expect(screen.getByText('E.E. Quito')).toBeInTheDocument();
      expect(screen.getByText('138 kV')).toBeInTheDocument();
      expect(screen.getByText('211,189 MW')).toBeInTheDocument();
    });

    // Check that active layer is updated
    expect(screen.getByText('Carga')).toBeInTheDocument();
  });

  it('displays correct metrics calculations', () => {
    render(
      <TransmissionMapTab
        transmissionData={mockTransmissionData}
        selectedStation={null}
        setSelectedStation={() => {}}
      />
    );

    // The component should calculate and display totals
    expect(screen.getByText('20')).toBeInTheDocument(); // Total empresas
    expect(screen.getByText('10')).toBeInTheDocument(); // Total cargas
    
    // Should show calculated demand (total of all cargas in GW)
    const demandText = screen.getByText(/GW/);
    expect(demandText).toBeInTheDocument();
  });

  it('shows empresa details with correct structure', async () => {
    render(
      <TransmissionMapTab
        transmissionData={mockTransmissionData}
        selectedStation={null}
        setSelectedStation={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('select-empresa-qui'));

    await waitFor(() => {
      // Check empresa details structure
      expect(screen.getByText('Información de Empresa')).toBeInTheDocument();
      expect(screen.getByText('E.E. QUITO')).toBeInTheDocument();
      expect(screen.getByText('671 MW')).toBeInTheDocument();
    });
  });

  it('shows carga details with correct structure', async () => {
    render(
      <TransmissionMapTab
        transmissionData={mockTransmissionData}
        selectedStation={null}
        setSelectedStation={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('select-carga-novacero'));

    await waitFor(() => {
      // Check carga details structure
      expect(screen.getByText('Cliente')).toBeInTheDocument();
      expect(screen.getByText('Empresa Distribuidora')).toBeInTheDocument();
      expect(screen.getByText('Voltaje')).toBeInTheDocument();
      expect(screen.getByText('Tipo')).toBeInTheDocument();
      expect(screen.getByText('Demanda Máxima')).toBeInTheDocument();
      expect(screen.getByText('⚡ Carga Singular')).toBeInTheDocument();
      expect(screen.getByText('Participación en demanda singular:')).toBeInTheDocument();
    });
  });

  it('determines voltage type correctly', async () => {
    render(
      <TransmissionMapTab
        transmissionData={mockTransmissionData}
        selectedStation={null}
        setSelectedStation={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('select-carga-novacero'));

    await waitFor(() => {
      // NOVACERO has 138 kV, so it should be "Alta Tensión"
      expect(screen.getByText('Alta Tensión')).toBeInTheDocument();
    });
  });

  it('clears selection when switching between empresa and carga', async () => {
    render(
      <TransmissionMapTab
        transmissionData={mockTransmissionData}
        selectedStation={null}
        setSelectedStation={() => {}}
      />
    );

    // Select empresa first
    fireEvent.click(screen.getByTestId('select-empresa-qui'));
    await waitFor(() => {
      expect(screen.getByText('Información de Empresa')).toBeInTheDocument();
    });

    // Select carga - should clear empresa
    fireEvent.click(screen.getByTestId('select-carga-novacero'));
    await waitFor(() => {
      expect(screen.getByText('Información de Carga')).toBeInTheDocument();
      expect(screen.queryByText('Información de Empresa')).not.toBeInTheDocument();
    });
  });

  it('handles empty or missing data gracefully', () => {
    render(
      <TransmissionMapTab
        transmissionData={{ stations: [], industrialLoads: [] }}
        selectedStation={null}
        setSelectedStation={() => {}}
      />
    );

    // Should still render without errors
    expect(screen.getByTestId('mock-map')).toBeInTheDocument();
    expect(screen.getByText('Empresas Eléctricas')).toBeInTheDocument();
  });
});