// Utility functions for validating GeoJSON data

export interface ValidatedFeature {
  type: 'Feature';
  properties: {
    companyName: string;
    id: string;
    potencia: string;
    region?: string;
    clientes?: number;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface ValidatedGeoJSON {
  type: 'FeatureCollection';
  features: ValidatedFeature[];
}

export function validateGeoJSONFeature(feature: any): feature is ValidatedFeature {
  // Check basic structure
  if (!feature || typeof feature !== 'object') {
    return false;
  }

  if (feature.type !== 'Feature') {
    return false;
  }

  // Check properties
  if (!feature.properties || typeof feature.properties !== 'object') {
    return false;
  }

  const { properties } = feature;
  
  // Required properties
  if (!properties.companyName || typeof properties.companyName !== 'string') {
    return false;
  }

  if (!properties.id || typeof properties.id !== 'string') {
    return false;
  }

  if (!properties.potencia || typeof properties.potencia !== 'string') {
    return false;
  }

  // Optional properties validation
  if (properties.region && typeof properties.region !== 'string') {
    return false;
  }

  if (properties.clientes && typeof properties.clientes !== 'number') {
    return false;
  }

  // Check geometry
  if (!feature.geometry || typeof feature.geometry !== 'object') {
    return false;
  }

  const { geometry } = feature;
  
  if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
    return false;
  }

  if (!Array.isArray(geometry.coordinates)) {
    return false;
  }

  // Basic coordinate validation
  try {
    if (geometry.type === 'Polygon') {
      if (!Array.isArray(geometry.coordinates[0])) {
        return false;
      }
      // Check if coordinates are valid numbers
      for (const ring of geometry.coordinates) {
        if (!Array.isArray(ring)) return false;
        for (const coord of ring) {
          if (!Array.isArray(coord) || coord.length !== 2) return false;
          if (typeof coord[0] !== 'number' || typeof coord[1] !== 'number') return false;
          // Basic longitude/latitude range check for Ecuador
          if (coord[0] < -93 || coord[0] > -75 || coord[1] < -5 || coord[1] > 2) return false;
        }
      }
    } else if (geometry.type === 'MultiPolygon') {
      if (!Array.isArray(geometry.coordinates)) {
        return false;
      }
      // Check each polygon in the MultiPolygon
      for (const polygon of geometry.coordinates) {
        if (!Array.isArray(polygon)) return false;
        for (const ring of polygon) {
          if (!Array.isArray(ring)) return false;
          for (const coord of ring) {
            if (!Array.isArray(coord) || coord.length !== 2) return false;
            if (typeof coord[0] !== 'number' || typeof coord[1] !== 'number') return false;
            // Basic longitude/latitude range check for Ecuador
            if (coord[0] < -93 || coord[0] > -75 || coord[1] < -5 || coord[1] > 2) return false;
          }
        }
      }
    }
  } catch (error) {
    return false;
  }

  return true;
}

export function validateGeoJSON(data: any): ValidatedGeoJSON | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  if (data.type !== 'FeatureCollection') {
    return null;
  }

  if (!Array.isArray(data.features)) {
    return null;
  }

  const validFeatures: ValidatedFeature[] = [];
  
  for (const feature of data.features) {
    if (validateGeoJSONFeature(feature)) {
      validFeatures.push(feature as ValidatedFeature);
    } else {
      console.warn('Invalid feature found in GeoJSON:', feature);
    }
  }

  // Return null if no valid features found
  if (validFeatures.length === 0) {
    return null;
  }

  return {
    type: 'FeatureCollection',
    features: validFeatures
  };
}

export function sanitizeGeoJSONProperties(feature: ValidatedFeature): ValidatedFeature {
  return {
    ...feature,
    properties: {
      companyName: feature.properties.companyName.trim(),
      id: feature.properties.id.trim().toUpperCase(),
      potencia: feature.properties.potencia.trim(),
      region: feature.properties.region?.trim(),
      clientes: feature.properties.clientes
    }
  };
}

export class GeoJSONError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'GeoJSONError';
  }
}

export async function fetchAndValidateGeoJSON(url: string): Promise<ValidatedGeoJSON> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new GeoJSONError(`Failed to fetch GeoJSON: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const validatedData = validateGeoJSON(data);

    if (!validatedData) {
      throw new GeoJSONError('Invalid or empty GeoJSON data', data);
    }

    // Sanitize and return validated data
    return {
      type: 'FeatureCollection',
      features: validatedData.features.map(sanitizeGeoJSONProperties)
    };

  } catch (error) {
    if (error instanceof GeoJSONError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new GeoJSONError('Network error while fetching GeoJSON', error);
    }

    throw new GeoJSONError('Unexpected error while processing GeoJSON', error);
  }
}