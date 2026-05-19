const fs = require('fs');
const path = require('path');

const salesDir = path.join(__dirname, 'frontend/src/app/features/sales');
const components = [
  { folder: 'invoices', name: 'invoices-list' },
  { folder: 'quotations', name: 'quotations-list' },
  { folder: 'customers', name: 'customers-list' },
  { folder: 'receipts', name: 'receipts-list' },
  { folder: 'credit-notes', name: 'credit-notes-list' },
  { folder: 'delivery-notes', name: 'delivery-notes-list' },
  { folder: 'recurring-invoices', name: 'recurring-invoices-list' }
];

components.forEach(comp => {
  const htmlPath = path.join(salesDir, comp.folder, comp.name, `${comp.name}.component.html`);

  if (fs.existsSync(htmlPath)) {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Add (columnsChange)="availableColumns = $event" if missing
    if (!htmlContent.includes('(columnsChange)')) {
      // Find the closing tag or the end of the opening tag of app-manage-columns
      htmlContent = htmlContent.replace(/(<app-manage-columns[^>]*?)(>)/, '$1 (columnsChange)="availableColumns = $event"$2');
      fs.writeFileSync(htmlPath, htmlContent);
      console.log(`Updated HTML: ${comp.name}`);
    }
  } else {
    console.warn(`File not found: ${htmlPath}`);
  }
});
