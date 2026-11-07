/**
 * Exports an array of transactions to a CSV file and triggers download
 * @param {Array} transactions
 * @param {string} filename
 */
export function exportTransactionsToCSV(transactions, filename = 'transactions.csv') {
  if (!transactions || transactions.length === 0) {
    alert('No transactions available to export');
    return;
  }

  const headers = ['Date', 'Title', 'Type', 'Category', 'Amount (INR)', 'Description'];

  const rows = transactions.map((t) => [
    `"${new Date(t.date).toISOString().split('T')[0]}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${t.type}"`,
    `"${t.category}"`,
    t.amount,
    `"${(t.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

