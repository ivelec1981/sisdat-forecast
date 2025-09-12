const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/maps/company_areas_simplified.geojson');
const outputPath = path.join(__dirname, '../public/maps/company_areas_fixed.geojson');

try {
  console.log('Reading GeoJSON file...');
  const geoJsonData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  console.log(`Original features: ${geoJsonData.features.length}`);
  
  // Fix features to match validator expectations
  const fixedFeatures = geoJsonData.features.map((feature, index) => {
    const props = feature.properties;
    
    // Create clean properties object with only expected fields
    const cleanProps = {
      companyName: props.Empresa || props.companyName || `Company ${index + 1}`,
      id: props.IDSISDAT ? props.IDSISDAT.toString() : (props.id || `COMP${index + 1}`),
      potencia: props.potencia || 'N/A',
      region: props.Regional || props.region || undefined,
      clientes: props.clientes || undefined
    };
    
    // Remove undefined values
    Object.keys(cleanProps).forEach(key => {
      if (cleanProps[key] === undefined) {
        delete cleanProps[key];
      }
    });
    
    return {
      type: 'Feature',
      properties: cleanProps,
      geometry: feature.geometry
    };
  });
  
  const fixedGeoJson = {
    type: 'FeatureCollection',
    features: fixedFeatures
  };
  
  // Write the fixed GeoJSON
  fs.writeFileSync(outputPath, JSON.stringify(fixedGeoJson, null, 0));
  
  console.log(`✅ Fixed GeoJSON created!`);
  console.log(`📊 Features: ${fixedGeoJson.features.length}`);
  
  // Show first few features for verification
  fixedFeatures.slice(0, 3).forEach((feature, idx) => {
    console.log(`Feature ${idx + 1}: ${feature.properties.companyName} (ID: ${feature.properties.id})`);
    console.log(`  Properties:`, Object.keys(feature.properties));
    console.log(`  Geometry type:`, feature.geometry.type);
  });
  
  const outputSize = Math.round(fs.statSync(outputPath).size / 1024 / 1024);
  console.log(`📁 File size: ${outputSize} MB`);
  
} catch (error) {
  console.error('❌ Error during fix:', error.message);
}