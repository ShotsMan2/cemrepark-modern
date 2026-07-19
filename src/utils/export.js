/**
 * Generic CSV Export Utility
 * @param {Array<Object>} data - The array of objects to export
 * @param {string} filename - The name of the downloaded file (e.g., 'audit_logs.csv')
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) {
    console.warn("No data available to export");
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);

  // Map rows to CSV format
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        let cell = row[header] === null || row[header] === undefined ? '' : row[header];
        // Handle strings that might contain commas, quotes, or newlines
        if (typeof cell === 'string') {
          cell = cell.replace(/"/g, '""'); // escape quotes
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
        } else if (cell instanceof Date) {
          cell = cell.toLocaleString();
        }
        return cell;
      }).join(',')
    )
  ];

  // Combine rows with newline
  const csvContent = "\uFEFF" + csvRows.join('\n'); // Add BOM for Excel UTF-8 support

  // Create a blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
