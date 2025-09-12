const fs = require('fs');
const path = require('path');
const { feature } = require('topojson-client');

const topoJsonPath = path.join(__dirname, '../areas.geojson.json');
const outputPath = path.join(__dirname, '../public/maps/company_areas_real.geojson');

try {
  console.log('Reading TopoJSON file...');
  const topoJsonData = JSON.parse(fs.readFileSync(topoJsonPath, 'utf8'));
  
  console.log('TopoJSON structure:', Object.keys(topoJsonData));
  if (topoJsonData.objects) {
    console.log('Objects in topology:', Object.keys(topoJsonData.objects));
  }
  
  // Find the main objects collection (usually the first or most relevant one)
  const objectKeys = Object.keys(topoJsonData.objects || {});
  if (objectKeys.length === 0) {
    throw new Error('No objects found in TopoJSON');
  }
  
  // Try the first object, which should contain the geographic features
  const mainObjectKey = objectKeys[0];
  console.log(`Converting object: ${mainObjectKey}`);
  
  const geoJsonData = feature(topoJsonData, topoJsonData.objects[mainObjectKey]);
  
  console.log(`Converted ${geoJsonData.features.length} features`);
  
  // Add some validation and enhancement for the features
  const enhancedFeatures = geoJsonData.features.map((feature, index) => {
    const props = feature.properties;
    
    // Use the "Empresa" field as the company name
    if (props.Empresa) {
      feature.properties.companyName = props.Empresa;
    } else if (props.NOMBRE) {
      feature.properties.companyName = props.NOMBRE;
    } else if (props.name) {
      feature.properties.companyName = props.name;
    } else {
      feature.properties.companyName = `Company ${index + 1}`;
    }
    
    // Create an ID from IDSISDAT or generate one
    if (props.IDSISDAT) {
      feature.properties.id = props.IDSISDAT.toString();
    } else if (feature.id) {
      feature.properties.id = feature.id;
    } else {
      feature.properties.id = `COMP${index + 1}`;
    }
    
    // Add region from Regional field if available
    if (props.Regional) {
      feature.properties.region = props.Regional;
    }
    
    // Add other required properties if missing
    if (!feature.properties.potencia) {
      feature.properties.potencia = 'N/A';
    }
    
    console.log(`Feature ${index}: ${feature.properties.companyName || 'Unknown'} (ID: ${feature.properties.id})`);
    if (feature.properties.region) {
      console.log(`  Region: ${feature.properties.region}`);
    }
    
    return feature;
  });
  
  const finalGeoJson = {
    type: 'FeatureCollection',
    features: enhancedFeatures
  };
  
  // Write the converted GeoJSON
  fs.writeFileSync(outputPath, JSON.stringify(finalGeoJson, null, 2));
  
  console.log(`✅ Conversion completed! GeoJSON saved to: ${outputPath}`);
  console.log(`📊 Total features: ${finalGeoJson.features.length}`);
  console.log(`📁 File size: ${Math.round(fs.statSync(outputPath).size / 1024)} KB`);
  
} catch (error) {
  console.error('❌ Error during conversion:', error.message);
  
  if (error.code === 'ENOENT') {
    console.error(`File not found: ${topoJsonPath}`);
    console.error('Please make sure the TopoJSON file exists at the specified path.');
  } else if (error.message.includes('Unexpected token')) {
    console.error('The file might not be valid JSON. Checking first 200 characters...');
    try {
      const content = fs.readFileSync(topoJsonPath, 'utf8');
      console.error('File start:', content.substring(0, 200));
    } catch (readError) {
      console.error('Could not read file for debugging:', readError.message);
    }
  }
}