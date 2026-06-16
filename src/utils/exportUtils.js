import * as XLSX from 'xlsx';

/**
 * Utility to export JSON data to CSV
 * @param {Array} data - Array of objects
 * @param {string} filename - Name of the file to be downloaded
 */
export const exportToCSV = (data, filename = 'report') => {
  if (!data || !data.length) {
    alert('No data available to export');
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [];
  csvRows.push(headers.join(',')); // Add header row

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      // Handle objects (like user.name)
      if (typeof val === 'object' && val !== null) {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }
      // Escape quotes and wrap in quotes if string contains comma
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  // Create Blob and download
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Utility to export JSON data to Excel (.xlsx) with auto column sizing
 * @param {Array} data - Array of objects
 * @param {string} filename - Name of the file to be downloaded
 */
export const exportToExcel = (data, filename = 'report') => {
  if (!data || !data.length) {
    alert('No data available to export');
    return;
  }

  // Flatten simple nested objects so they look clean in Excel
  const processedData = data.map(row => {
    const newRow = {};
    for (const key of Object.keys(row)) {
      const val = row[key];
      if (typeof val === 'object' && val !== null) {
        newRow[key] = val.name || val.label || JSON.stringify(val);
      } else {
        newRow[key] = val;
      }
    }
    return newRow;
  });

  // Convert JSON to worksheet
  const worksheet = XLSX.utils.json_to_sheet(processedData);

  // Auto-fit columns
  const cols = [];
  if (processedData.length > 0) {
    const keys = Object.keys(processedData[0]);
    keys.forEach(key => {
      let maxLen = key.length;
      processedData.forEach(row => {
        const cellVal = String(row[key] ?? '');
        if (cellVal.length > maxLen) {
          maxLen = cellVal.length;
        }
      });
      cols.push({ wch: maxLen + 4 }); // add margin
    });
    worksheet['!cols'] = cols;
  }

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Write Excel file to browser download stream
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

