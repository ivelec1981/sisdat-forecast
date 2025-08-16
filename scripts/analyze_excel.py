#!/usr/bin/env python3

import pandas as pd
import sys
import json

def analyze_excel_file(file_path):
    try:
        # Read the Excel file
        excel_file = pd.ExcelFile(file_path)
        
        print(f"Sheet names in the file: {excel_file.sheet_names}")
        
        # Read the Residential sheet
        if 'Residential' in excel_file.sheet_names:
            df = pd.read_excel(file_path, sheet_name='Residential')
            
            print(f"\nResidential sheet analysis:")
            print(f"Shape: {df.shape}")
            print(f"Columns: {list(df.columns)}")
            print(f"\nFirst 5 rows:")
            print(df.head())
            print(f"\nData types:")
            print(df.dtypes)
            print(f"\nBasic statistics:")
            print(df.describe())
            
            # Check for null values
            print(f"\nNull values per column:")
            print(df.isnull().sum())
            
            # Save sample data to JSON for analysis
            sample_data = df.head(10).to_dict('records')
            with open('/home/ivelec/sisdat-forecast/scripts/residential_sample.json', 'w') as f:
                json.dump(sample_data, f, indent=2, default=str)
                
            print(f"\nSample data saved to residential_sample.json")
            
        else:
            print("Residential sheet not found!")
            
    except Exception as e:
        print(f"Error reading Excel file: {e}")

if __name__ == "__main__":
    file_path = "/mnt/c/Documentos/DTEII/Ecuacier/Residencial_GLR.xlsx"
    analyze_excel_file(file_path)