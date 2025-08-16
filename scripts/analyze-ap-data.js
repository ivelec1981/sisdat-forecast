const XLSX = require('xlsx');
const path = require('path');

// Read the Excel file
const filePath = path.join(__dirname, '..', 'data', 'ap_GLR.xlsx');
console.log('📁 Analyzing:', filePath);

try {
  const workbook = XLSX.readFile(filePath);
  
  // Get sheet names
  console.log('📋 Available sheets:', workbook.SheetNames);
  
  // Get the first sheet (usually the data sheet)
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON to analyze structure
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('📊 Total rows:', data.length);
  
  if (data.length > 0) {
    console.log('📋 Headers (first row):');
    console.log(data[0]);
    
    console.log('\n📄 Sample data (first 3 data rows):');
    for (let i = 1; i <= Math.min(3, data.length - 1); i++) {
      console.log(`Row ${i}:`, data[i]);
    }
    
    // Check for data patterns
    if (data.length > 1) {
      const headers = data[0];
      const sampleRow = data[1];
      
      console.log('\n🔍 Data analysis:');
      headers.forEach((header, index) => {
        if (header && sampleRow && sampleRow[index] !== undefined) {
          console.log(`  ${header}: ${typeof sampleRow[index]} - ${sampleRow[index]}`);
        }
      });
    }
  }
  
} catch (error) {
  console.error('❌ Error reading file:', error.message);
}