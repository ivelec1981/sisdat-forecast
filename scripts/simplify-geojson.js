const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/maps/company_areas_real.geojson');
const outputPath = path.join(__dirname, '../public/maps/company_areas_simplified.geojson');

try {
  console.log('Reading GeoJSON file...');
  const geoJsonData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  console.log(`Original features: ${geoJsonData.features.length}`);
  console.log(`Original file size: ${Math.round(fs.statSync(inputPath).size / 1024 / 1024)} MB`);
  
  // Simplify coordinates by reducing precision and removing some points
  const simplifiedFeatures = geoJsonData.features.map((feature, index) => {
    const simplifiedGeometry = simplifyGeometry(feature.geometry);
    
    return {
      ...feature,
      geometry: simplifiedGeometry
    };
  });
  
  const simplifiedGeoJson = {
    type: 'FeatureCollection',
    features: simplifiedFeatures
  };
  
  // Write the simplified GeoJSON
  fs.writeFileSync(outputPath, JSON.stringify(simplifiedGeoJson, null, 0)); // No indentation to save space
  
  const outputSize = Math.round(fs.statSync(outputPath).size / 1024 / 1024);
  console.log(`✅ Simplification completed!`);
  console.log(`📊 Simplified features: ${simplifiedGeoJson.features.length}`);
  console.log(`📁 New file size: ${outputSize} MB`);
  console.log(`🗜️ Size reduction: ${Math.round(((fs.statSync(inputPath).size - fs.statSync(outputPath).size) / fs.statSync(inputPath).size) * 100)}%`);
  
} catch (error) {
  console.error('❌ Error during simplification:', error.message);
}

function simplifyGeometry(geometry) {
  if (geometry.type === 'Polygon') {
    return {
      type: 'Polygon',
      coordinates: geometry.coordinates.map(ring => 
        simplifyCoordinateArray(ring)
      )
    };
  } else if (geometry.type === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geometry.coordinates.map(polygon =>
        polygon.map(ring => simplifyCoordinateArray(ring))
      )
    };
  }
  return geometry;
}

function simplifyCoordinateArray(coordinates) {
  // Keep every nth point to reduce complexity
  const keepRatio = 0.3; // Keep 30% of points
  const minPoints = 4; // Minimum points for a valid polygon
  
  if (coordinates.length <= minPoints) {
    return coordinates.map(coord => [
      Math.round(coord[0] * 10000) / 10000, // 4 decimal places
      Math.round(coord[1] * 10000) / 10000
    ]);
  }
  
  const step = Math.max(1, Math.floor(1 / keepRatio));
  const simplified = [];
  
  // Always keep first point
  simplified.push([
    Math.round(coordinates[0][0] * 10000) / 10000,
    Math.round(coordinates[0][1] * 10000) / 10000
  ]);
  
  // Keep every nth point
  for (let i = step; i < coordinates.length - 1; i += step) {
    simplified.push([
      Math.round(coordinates[i][0] * 10000) / 10000,
      Math.round(coordinates[i][1] * 10000) / 10000
    ]);
  }
  
  // Always keep last point (should be same as first for closed polygon)
  const lastIdx = coordinates.length - 1;
  simplified.push([
    Math.round(coordinates[lastIdx][0] * 10000) / 10000,
    Math.round(coordinates[lastIdx][1] * 10000) / 10000
  ]);
  
  return simplified;
}