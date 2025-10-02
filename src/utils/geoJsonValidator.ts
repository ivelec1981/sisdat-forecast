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

interface ValidationError {
  field: string;
  reason: string;
  value?: any;
}

export function validateGeoJSONFeature(feature: any, logErrors = false): feature is ValidatedFeature {
  const errors: ValidationError[] = [];

  // Check basic structure
  if (!feature || typeof feature !== 'object') {
    if (logErrors) console.error('❌ GeoJSON validation: Feature is not an object', { received: typeof feature });
    return false;
  }

  if (feature.type !== 'Feature') {
    if (logErrors) console.error('❌ GeoJSON validation: Invalid type', { expected: 'Feature', received: feature.type });
    return false;
  }

  // Check properties
  if (!feature.properties || typeof feature.properties !== 'object') {
    if (logErrors) console.error('❌ GeoJSON validation: Missing or invalid properties', { properties: feature.properties });
    return false;
  }

  const { properties } = feature;

  // Required properties
  if (!properties.companyName || typeof properties.companyName !== 'string') {
    errors.push({ field: 'companyName', reason: 'Missing or not a string', value: properties.companyName });
  }

  if (!properties.id || (typeof properties.id !== 'string' && typeof properties.id !== 'number')) {
    errors.push({ field: 'id', reason: 'Missing or not a string/number', value: properties.id });
  }

  if (!properties.potencia || typeof properties.potencia !== 'string') {
    errors.push({ field: 'potencia', reason: 'Missing or not a string', value: properties.potencia });
  }

  // Optional properties validation
  if (properties.region && typeof properties.region !== 'string') {
    errors.push({ field: 'region', reason: 'Not a string', value: properties.region });
  }

  if (properties.clientes && typeof properties.clientes !== 'number') {
    errors.push({ field: 'clientes', reason: 'Not a number', value: properties.clientes });
  }

  // Check geometry
  if (!feature.geometry || typeof feature.geometry !== 'object') {
    if (logErrors) console.error('❌ GeoJSON validation: Missing or invalid geometry', { geometry: feature.geometry });
    return false;
  }

  const { geometry } = feature;

  if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
    if (logErrors) console.error('❌ GeoJSON validation: Invalid geometry type', { expected: 'Polygon or MultiPolygon', received: geometry.type });
    return false;
  }

  if (!Array.isArray(geometry.coordinates)) {
    if (logErrors) console.error('❌ GeoJSON validation: Coordinates is not an array', { coordinates: geometry.coordinates });
    return false;
  }

  // Basic coordinate validation
  try {
    if (geometry.type === 'Polygon') {
      if (!Array.isArray(geometry.coordinates[0])) {
        if (logErrors) console.error('❌ GeoJSON validation: Invalid Polygon coordinates structure');
        return false;
      }
      // Check if coordinates are valid numbers
      for (const ring of geometry.coordinates) {
        if (!Array.isArray(ring)) {
          if (logErrors) console.error('❌ GeoJSON validation: Ring is not an array');
          return false;
        }
        for (const coord of ring) {
          if (!Array.isArray(coord) || coord.length !== 2) {
            if (logErrors) console.error('❌ GeoJSON validation: Invalid coordinate format', { coord });
            return false;
          }
          if (typeof coord[0] !== 'number' || typeof coord[1] !== 'number') {
            if (logErrors) console.error('❌ GeoJSON validation: Coordinate values are not numbers', { coord });
            return false;
          }
          // Basic longitude/latitude range check for Ecuador
          // Ecuador continental: ~-82° to -75° longitude, ~-5° to 2° latitude
          // Galapagos: ~-92° to -89° longitude
          // Using permissive bounds to allow all valid Ecuador coordinates
          if (coord[0] < -95 || coord[0] > -74 || coord[1] < -7 || coord[1] > 3) {
            // Only warn, don't fail - some polygons may extend slightly beyond strict bounds
            if (logErrors) console.warn('⚠️ GeoJSON: Coordinate outside typical Ecuador bounds', {
              coord,
              id: properties?.id,
              note: 'This may be valid for border areas or Galapagos'
            });
            // Don't return false - allow the coordinate
          }
        }
      }
    } else if (geometry.type === 'MultiPolygon') {
      if (!Array.isArray(geometry.coordinates)) {
        if (logErrors) console.error('❌ GeoJSON validation: Invalid MultiPolygon coordinates');
        return false;
      }
      // Check each polygon in the MultiPolygon
      for (const polygon of geometry.coordinates) {
        if (!Array.isArray(polygon)) {
          if (logErrors) console.error('❌ GeoJSON validation: Polygon in MultiPolygon is not an array');
          return false;
        }
        for (const ring of polygon) {
          if (!Array.isArray(ring)) {
            if (logErrors) console.error('❌ GeoJSON validation: Ring in MultiPolygon is not an array');
            return false;
          }
          for (const coord of ring) {
            if (!Array.isArray(coord) || coord.length !== 2) {
              if (logErrors) console.error('❌ GeoJSON validation: Invalid coordinate format in MultiPolygon', { coord });
              return false;
            }
            if (typeof coord[0] !== 'number' || typeof coord[1] !== 'number') {
              if (logErrors) console.error('❌ GeoJSON validation: Coordinate values are not numbers in MultiPolygon', { coord });
              return false;
            }
            // Basic longitude/latitude range check for Ecuador
            if (coord[0] < -93 || coord[0] > -75 || coord[1] < -5 || coord[1] > 2) {
              if (logErrors) console.error('❌ GeoJSON validation: Coordinates out of range for Ecuador in MultiPolygon', { coord, id: properties.id });
              return false;
            }
          }
        }
      }
    }
  } catch (error) {
    if (logErrors) console.error('❌ GeoJSON validation: Exception during coordinate validation', { error, id: properties.id });
    return false;
  }

  // Log property errors if any
  if (errors.length > 0) {
    if (logErrors) {
      console.error('❌ GeoJSON validation: Property validation failed', {
        featureId: properties.id || 'unknown',
        errors,
        availableProperties: Object.keys(properties)
      });
    }
    return false;
  }

  return true;
}

export function validateGeoJSON(data: any, options = { logFirstError: false }): ValidatedGeoJSON | null {
  if (!data || typeof data !== 'object') {
    console.error('❌ GeoJSON validation: Data is not an object');
    return null;
  }

  if (data.type !== 'FeatureCollection') {
    console.error('❌ GeoJSON validation: Invalid type', { expected: 'FeatureCollection', received: data.type });
    return null;
  }

  if (!Array.isArray(data.features)) {
    console.error('❌ GeoJSON validation: Features is not an array');
    return null;
  }

  const validFeatures: ValidatedFeature[] = [];
  let invalidCount = 0;
  let loggedFirstError = false;

  for (const feature of data.features) {
    // Log detailed errors only for the first invalid feature in development
    const shouldLogError = options.logFirstError && !loggedFirstError && process.env.NODE_ENV === 'development';

    if (validateGeoJSONFeature(feature, shouldLogError)) {
      validFeatures.push(feature as ValidatedFeature);
    } else {
      invalidCount++;
      if (shouldLogError) {
        loggedFirstError = true;
      }
    }
  }

  // Summary logging
  if (invalidCount > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ GeoJSON validation: ${invalidCount} invalid feature(s) skipped, ${validFeatures.length} valid feature(s) found`);
    } else {
      console.warn(`${invalidCount} invalid GeoJSON features skipped`);
    }
  }

  // Return null if no valid features found
  if (validFeatures.length === 0) {
    console.error('❌ GeoJSON validation: No valid features found');
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
      id: String(feature.properties.id).trim().toUpperCase(),
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

export async function fetchAndValidateGeoJSON(url: string, options = { logFirstError: true }): Promise<ValidatedGeoJSON> {
  try {
    console.log(`📡 Fetching GeoJSON from: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new GeoJSONError(`Failed to fetch GeoJSON: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`📦 GeoJSON data received, validating...`);

    const validatedData = validateGeoJSON(data, options);

    if (!validatedData) {
      throw new GeoJSONError('Invalid or empty GeoJSON data', data);
    }

    console.log(`✅ Validation complete: ${validatedData.features.length} valid features`);

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