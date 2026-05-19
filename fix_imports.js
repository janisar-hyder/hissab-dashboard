const fs = require('fs');
const path = require('path');

const salesDir = path.join(__dirname, 'frontend/src/app/features/sales');
const components = [
  { folder: 'quotations', name: 'quotations-list' },
  { folder: 'customers', name: 'customers-list' },
  { folder: 'receipts', name: 'receipts-list' },
  { folder: 'credit-notes', name: 'credit-notes-list' },
  { folder: 'delivery-notes', name: 'delivery-notes-list' },
  { folder: 'recurring-invoices', name: 'recurring-invoices-list' }
];

components.forEach(comp => {
  const tsPath = path.join(salesDir, comp.folder, comp.name, `${comp.name}.component.ts`);
  
  if (fs.existsSync(tsPath)) {
    let tsContent = fs.readFileSync(tsPath, 'utf8');

    // Remove the improperly injected imports
    tsContent = tsContent.replace(/import \{ ColumnPreferencesService \} from '\.\.\/\.\.\/\.\.\/\.\.\/shared\/services\/column-preferences\.service';\r?\nimport \{ inject \} from '@angular\/core';\r?\n/, '');

    // Add them at the very top instead
    const correctImports = `import { ColumnPreferencesService } from '../../../../shared/services/column-preferences.service';\nimport { inject } from '@angular/core';\n`;
    tsContent = correctImports + tsContent;

    fs.writeFileSync(tsPath, tsContent);
    console.log(`Fixed TS: ${comp.name}`);
  }
});
