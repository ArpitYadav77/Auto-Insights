const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const XLSX = require('xlsx');

/**
 * Parse a CSV file and extract metadata + sample data.
 * @param {string} filePath - Absolute path to the CSV file
 * @returns {Promise<Object>} { rows, columns, columnNames, columnTypes, sampleData }
 */
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    let columnNames = [];

    fs.createReadStream(filePath)
      .on('error', (err) => reject(new Error(`Failed to read CSV file: ${err.message}`)))
      .pipe(csvParser())
      .on('headers', (headers) => {
        columnNames = headers.map((h) => h.trim());
      })
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => {
        const rows = results.length;
        const columns = columnNames.length;
        // Take first 100 rows as sample for type detection
        const sampleData = results.slice(0, 100);
        const columnTypes = detectColumnTypes(sampleData, columnNames);

        resolve({
          rows,
          columns,
          columnNames,
          columnTypes,
          sampleData,
        });
      })
      .on('error', (err) => reject(new Error(`CSV parsing error: ${err.message}`)));
  });
};

/**
 * Parse an XLSX file and extract metadata + sample data.
 * @param {string} filePath - Absolute path to the XLSX file
 * @returns {Object} { rows, columns, columnNames, columnTypes, sampleData }
 */
const parseXLSX = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error('Workbook has no sheets.');
    }

    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (jsonData.length === 0) {
      return {
        rows: 0,
        columns: 0,
        columnNames: [],
        columnTypes: {},
        sampleData: [],
      };
    }

    const columnNames = Object.keys(jsonData[0]);
    const rows = jsonData.length;
    const columns = columnNames.length;
    const sampleData = jsonData.slice(0, 100);
    const columnTypes = detectColumnTypes(sampleData, columnNames);

    return {
      rows,
      columns,
      columnNames,
      columnTypes,
      sampleData,
    };
  } catch (error) {
    throw new Error(`Failed to parse XLSX file: ${error.message}`);
  }
};

/**
 * Detect column data types by analyzing sample data.
 * Categories: numeric, categorical, datetime, boolean, empty
 *
 * @param {Array<Object>} sampleData - Array of row objects
 * @param {Array<string>} columnNames - Column name list
 * @returns {Object} Mapping of column names to detected types
 */
const detectColumnTypes = (sampleData, columnNames) => {
  const types = {};

  if (!sampleData || sampleData.length === 0) {
    columnNames.forEach((col) => {
      types[col] = 'unknown';
    });
    return types;
  }

  // Common date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,                       // 2024-01-15
    /^\d{2}\/\d{2}\/\d{4}$/,                      // 01/15/2024
    /^\d{2}-\d{2}-\d{4}$/,                        // 01-15-2024
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,      // ISO 8601
    /^\d{4}\/\d{2}\/\d{2}$/,                      // 2024/01/15
    /^\w{3}\s+\d{1,2},?\s+\d{4}$/,               // Jan 15, 2024
    /^\d{1,2}\s+\w{3}\s+\d{4}$/,                 // 15 Jan 2024
  ];

  columnNames.forEach((col) => {
    let numericCount = 0;
    let dateCount = 0;
    let boolCount = 0;
    let emptyCount = 0;
    let totalChecked = 0;

    for (const row of sampleData) {
      const value = row[col];
      const strVal = String(value).trim();

      if (strVal === '' || strVal === 'null' || strVal === 'undefined' || value === null || value === undefined) {
        emptyCount++;
        continue;
      }

      totalChecked++;

      // Check boolean
      if (['true', 'false', '0', '1', 'yes', 'no'].includes(strVal.toLowerCase())) {
        boolCount++;
      }

      // Check numeric
      if (!isNaN(Number(strVal)) && strVal !== '') {
        numericCount++;
      }

      // Check date
      const isDate = datePatterns.some((pattern) => pattern.test(strVal));
      if (isDate || (!isNaN(Date.parse(strVal)) && isNaN(Number(strVal)) && strVal.length > 5)) {
        dateCount++;
      }
    }

    // All empty
    if (totalChecked === 0) {
      types[col] = 'empty';
      return;
    }

    const threshold = 0.7; // 70% of non-empty values should match

    if (numericCount / totalChecked >= threshold) {
      types[col] = 'numeric';
    } else if (dateCount / totalChecked >= threshold) {
      types[col] = 'datetime';
    } else if (boolCount / totalChecked >= threshold && totalChecked > 0) {
      types[col] = 'boolean';
    } else {
      types[col] = 'categorical';
    }
  });

  return types;
};

module.exports = {
  parseCSV,
  parseXLSX,
  detectColumnTypes,
};
