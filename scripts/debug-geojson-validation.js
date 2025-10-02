const fs = require('fs');
const path = require('path');

// Import the validator functions
const { validateGeoJSONFeature, validateGeoJSON } = require('../src/utils/geoJsonValidator.ts');

const inputPath = path.join(__dirname, '../public/maps/company_areas_fixed.geojson');

try {
  console.log('Reading and testing GeoJSON file...');
  const geoJsonData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  console.log(`Total features: ${geoJsonData.features.length}`);
  
  // Test each feature individually
  geoJsonData.features.forEach((feature, idx) => {
    console.log(`\n--- Testing feature ${idx + 1}: ${feature.properties?.companyName || 'Unknown'} ---`);
    console.log('Properties:', Object.keys(feature.properties || {}));
    console.log('Geometry type:', feature.geometry?.type);
    
    // Check specific validation requirements
    const issues = [];
    
    // Check basic structure
    if (!feature || typeof feature !== 'object') issues.push('Not an object');
    if (feature.type !== 'Feature') issues.push(`Type is '${feature.type}', expected 'Feature'`);
    
    // Check properties
    if (!feature.properties || typeof feature.properties !== 'object') {
      issues.push('Missing or invalid properties object');
    } else {
      const props = feature.properties;
      if (!props.companyName || typeof props.companyName !== 'string') {
        issues.push(`Invalid companyName: '${props.companyName}' (${typeof props.companyName})`);
      }
      if (!props.id || typeof props.id !== 'string') {
        issues.push(`Invalid id: '${props.id}' (${typeof props.id})`);
      }
      if (!props.potencia || typeof props.potencia !== 'string') {
        issues.push(`Invalid potencia: '${props.potencia}' (${typeof props.potencia})`);
      }
      if (props.region && typeof props.region !== 'string') {
        issues.push(`Invalid region: '${props.region}' (${typeof props.region})`);
      }
      if (props.clientes && typeof props.clientes !== 'number') {
        issues.push(`Invalid clientes: '${props.clientes}' (${typeof props.clientes})`);
      }
    }
    
    // Check geometry
    if (!feature.geometry || typeof feature.geometry !== 'object') {
      issues.push('Missing or invalid geometry object');
    } else {
      const geom = feature.geometry;
      if (geom.type !== 'Polygon' && geom.type !== 'MultiPolygon') {
        issues.push(`Invalid geometry type: '${geom.type}'`);
      }
      if (!Array.isArray(geom.coordinates)) {
        issues.push('Coordinates is not an array');
      } else {
        // Basic coordinate validation
        if (geom.type === 'MultiPolygon') {
          if (!Array.isArray(geom.coordinates[0])) {
            issues.push('First level of MultiPolygon coordinates is not an array');
          } else if (!Array.isArray(geom.coordinates[0][0])) {
            issues.push('Second level of MultiPolygon coordinates is not an array');
          } else if (!Array.isArray(geom.coordinates[0][0][0])) {
            issues.push('Third level of MultiPolygon coordinates is not an array');
          } else {
            // Check first coordinate pair
            const coord = geom.coordinates[0][0][0];
            if (!Array.isArray(coord) || coord.length !== 2) {
              issues.push(`Invalid coordinate format: ${JSON.stringify(coord)}`);
            } else if (typeof coord[0] !== 'number' || typeof coord[1] !== 'number') {
              issues.push(`Coordinates are not numbers: [${typeof coord[0]}, ${typeof coord[1]}]`);
            } else {
              // Check if coordinates are in valid range for Ecuador
              if (coord[0] < -93 || coord[0] > -75 || coord[1] < -5 || coord[1] > 2) {
                issues.push(`Coordinates out of Ecuador range: [${coord[0]}, ${coord[1]}]`);
              }
            }
          }
        }
      }
    }
    
    if (issues.length > 0) {
      console.log('❌ VALIDATION ISSUES:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('✅ Feature appears valid');
    }
  });
  
} catch (error) {
  console.error('❌ Error during validation test:', error.message);
  console.error(error.stack);
}