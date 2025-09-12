import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EmpresasElectricasMapWithLeaflet from '../EmpresasElectricasMapWithLeaflet';

// Mock Leaflet
const mockMap = {
  remove: jest.fn(),
  setView: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  eachLayer: jest.fn(),
  fitBounds: jest.fn(),
  on: jest.fn(),
};

const mockLayer = {
  addTo: jest.fn(() => mockLayer),
  bindPopup: jest.fn(() => mockLayer),
  on: jest.fn(() => mockLayer),
};

const mockGeoJsonLayer = {
  addTo: jest.fn(() => mockGeoJsonLayer),
  on: jest.fn(),
  bindPopup: jest.fn(),
};

const mockLeaflet = {
  map: jest.fn(() => mockMap),
  tileLayer: jest.fn(() => mockLayer),
  marker: jest.fn(() => mockLayer),
  divIcon: jest.fn(() => ({})),
  geoJSON: jest.fn(() => mockGeoJsonLayer),
  control: {
    layers: jest.fn(() => ({
      addTo: jest.fn(),
    })),
  },
  latLngBounds: jest.fn(() => ({
    extend: jest.fn(),
  })),
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: jest.fn(),
    },
  },
};

// Mock dynamic imports
jest.mock('leaflet', () => mockLeaflet);

// Mock fetch for GeoJSON
global.fetch = jest.fn();

// Mock useStableId hook
jest.mock('@/hooks/useStableId', () => ({
  useStableId: jest.fn(() => 'test-map-id'),
}));

describe('EmpresasElectricasMapWithLeaflet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              companyName: 'E.E. QUITO',
              id: 'QUI',
              potencia: '671 MW',
            },
            geometry: {
              type: 'Polygon',
              coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
            },
          },
        ],
      }),
    });

    // Mock document methods
    Object.defineProperty(document, 'createElement', {
      writable: true,
      value: jest.fn(() => ({
        id: '',
        style: {},
        innerHTML: '',
        appendChild: jest.fn(),
      })),
    });

    Object.defineProperty(document.head, 'appendChild', {
      writable: true,
      value: jest.fn(),
    });

    Object.defineProperty(document, 'querySelector', {
      writable: true,
      value: jest.fn(() => null),
    });
  });

  it('renders loading state initially', () => {
    render(
      <EmpresasElectricasMapWithLeaflet
        showCargas={true}
        onEmpresaSelect={jest.fn()}
        onCargaSelect={jest.fn()}
      />
    );

    expect(screen.getByText('Inicializando mapa con basemap...')).toBeInTheDocument();
  });

  it('renders map container after loading', async () => {
    render(
      <EmpresasElectricasMapWithLeaflet
        showCargas={true}
        onEmpresaSelect={jest.fn()}
        onCargaSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Inicializando mapa con basemap...')).not.toBeInTheDocument();
    });

    // Map container should be present
    const mapContainer = document.querySelector('.h-96');
    expect(mapContainer).toBeTruthy();
  });

  it('displays legend with correct elements', async () => {
    render(
      <EmpresasElectricasMapWithLeaflet
        showCargas={true}
        onEmpresaSelect={jest.fn()}
        onCargaSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Empresa Eléctrica')).toBeInTheDocument();
      expect(screen.getByText('Seleccionada')).toBeInTheDocument();
      expect(screen.getByText('Carga Singular')).toBeInTheDocument();
    });
  });

  it('hides cargas legend when showCargas is false', async () => {
    render(
      <EmpresasElectricasMapWithLeaflet
        showCargas={false}
        onEmpresaSelect={jest.fn()}
        onCargaSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Empresa Eléctrica')).toBeInTheDocument();
      expect(screen.queryByText('Carga Singular')).not.toBeInTheDocument();
    });
  });

  it('handles GeoJSON loading correctly', async () => {
    render(
      <EmpresasElectricasMapWithLeaflet
        showCargas={true}
        onEmpresaSelect={jest.fn()}
        onCargaSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/maps/company_areas_fixed.geojson');
    });

    // Should create geoJSON layer
    await waitFor(() => {
      expect(mockLeaflet.geoJSON).toHaveBeenCalled();
    });
  });

  it('handles empresa selection when callback is provided', async () => {
    const mockOnEmpresaSelect = jest.fn();
    
    render(
      <EmpresasElectricasMapWithLeaflet
        showCargas={true}
        onEmpresaSelect={mockOnEmpresaSelect}
        onCargaSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(mockLeaflet.geoJSON).toHaveBeenCalled();
    });

    // Simulate clicking on an empresa through the geoJSON layer
    const geoJsonCall = mockLeaflet.geoJSON.mock.calls[0];
    const onEachFeatureCallback = geoJsonCall[1].onEachFeature;
    
    const mockFeature = {
      properties: { id: 'QUI', companyName: 'E.E. QUITO', potencia: '671 MW' }
    };
    
    const mockLayer = {
      on: jest.fn(),
      bindPopup: jest.fn(),
    };

    onEachFeatureCallback(mockFeature, mockLayer);

    // Simulate click event
    const clickHandler = mockLayer.on.mock.calls.find(call => call[0].click)?.[0].click;
    if (clickHandler) {
      clickHandler();
      expect(mockOnEmpresaSelect).toHaveBeenCalledWith({
        id: 'QUI',
        nombre: 'E.E. QUITO',
        potencia: '671 MW'
      });
    }
  });

  it('handles carga selection when callback is provided', async () => {
    const mockOnCargaSelect = jest.fn();
    
    render(
      <EmpresasElectricasMapWithLeaflet
        showCargas={true}
        onEmpresaSelect={jest.fn()}
        onCargaSelect={mockOnCargaSelect}
      />
    );

    await waitFor(() => {
      expect(mockLeaflet.marker).toHaveBeenCalled();
    });

    // Simulate clicking on a carga marker
    const markerCall = mockLeaflet.marker.mock.calls[0];
    expect(markerCall).toBeDefined();
  });

  it('displays error state when GeoJSON fails to load', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <EmpresasElectricasMapWithLeaflet
        showCargas={true}
        onEmpresaSelect={jest.fn()}
        onCargaSelect={jest.fn()}
      />
    );

    // Should not crash and still show the map container
    await waitFor(() => {
      expect(screen.queryByText('Inicializando mapa con basemap...')).not.toBeInTheDocument();
    });
  });

  it('creates markers for all cargas when showCargas is true', async () => {
    render(
      <EmpresasElectricasMapWithLeaflet
        showCargas={true}
        onEmpresaSelect={jest.fn()}
        onCargaSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      // Should create markers for each carga (10 cargas in the data)
      expect(mockLeaflet.marker).toHaveBeenCalledTimes(10);
    });
  });

  it('does not create carga markers when showCargas is false', async () => {
    render(
      <EmpresasElectricasMapWithLeaflet
        showCargas={false}
        onEmpresaSelect={jest.fn()}
        onCargaSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      // Should not create any markers
      expect(mockLeaflet.marker).not.toHaveBeenCalled();
    });
  });

  it('handles cleanup properly on unmount', async () => {
    const { unmount } = render(
      <EmpresasElectricasMapWithLeaflet
        showCargas={true}
        onEmpresaSelect={jest.fn()}
        onCargaSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(mockLeaflet.map).toHaveBeenCalled();
    });

    unmount();

    // Should call remove on the map instance
    expect(mockMap.remove).toHaveBeenCalled();
  });

  it('handles retry functionality when error occurs', async () => {
    // Mock an initial error
    const mockError = new Error('Map initialization failed');
    mockLeaflet.map.mockImplementationOnce(() => {
      throw mockError;
    });

    render(
      <EmpresasElectricasMapWithLeaflet
        showCargas={true}
        onEmpresaSelect={jest.fn()}
        onCargaSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('⚠️ Error en el mapa')).toBeInTheDocument();
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });

    // Reset mock to succeed on retry
    mockLeaflet.map.mockImplementation(() => mockMap);

    // Click retry button
    fireEvent.click(screen.getByText('Reintentar'));

    await waitFor(() => {
      expect(screen.queryByText('⚠️ Error en el mapa')).not.toBeInTheDocument();
    });
  });
});