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
  const htmlPath = path.join(salesDir, comp.folder, comp.name, `${comp.name}.component.html`);

  if (fs.existsSync(tsPath)) {
    let tsContent = fs.readFileSync(tsPath, 'utf8');

    // 1. Import ColumnPreferencesService
    if (!tsContent.includes('ColumnPreferencesService')) {
      // Find the last import
      const lastImportIndex = tsContent.lastIndexOf('import');
      const endOfLastImport = tsContent.indexOf('\n', lastImportIndex) + 1;
      const importStatement = `import { ColumnPreferencesService } from '../../../../shared/services/column-preferences.service';\nimport { inject } from '@angular/core';\n`;
      tsContent = tsContent.slice(0, endOfLastImport) + importStatement + tsContent.slice(endOfLastImport);
    }

    // 2. Inject ColumnPreferencesService (using inject to avoid constructor modifications)
    if (!tsContent.includes('columnPreferencesService = inject(ColumnPreferencesService)')) {
      const classStart = tsContent.indexOf('export class');
      const firstBrace = tsContent.indexOf('{', classStart) + 1;
      const injection = `\n    private columnPreferencesService = inject(ColumnPreferencesService);\n`;
      tsContent = tsContent.slice(0, firstBrace) + injection + tsContent.slice(firstBrace);
    }

    // 3. Update ngOnInit to load preferences
    if (!tsContent.includes('this.columnPreferencesService.loadPreferences')) {
      const ngOnInitMatch = tsContent.match(/ngOnInit\(\):?\s*void\s*\{([\s\S]*?)\}/);
      if (ngOnInitMatch) {
        const ngOnInitBody = ngOnInitMatch[1];
        const newBody = `${ngOnInitBody}\n        this.columnPreferencesService.loadPreferences('${comp.name}', this.availableColumns).subscribe(cols => {\n            this.availableColumns = cols;\n            this.cdr.detectChanges();\n        });`;
        tsContent = tsContent.replace(ngOnInitMatch[0], `ngOnInit(): void {${newBody}\n    }`);
      }
    }

    // 4. Remove onColumnsChange method
    tsContent = tsContent.replace(/onColumnsChange\s*\([^)]*\)\s*:\s*void\s*\{[\s\S]*?this\.availableColumns\s*=\s*[^;]+;?\s*\}/, '');

    fs.writeFileSync(tsPath, tsContent);
    console.log(`Updated TS: ${comp.name}`);
  } else {
    console.warn(`File not found: ${tsPath}`);
  }

  if (fs.existsSync(htmlPath)) {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // 1. Remove (columnsChange)="onColumnsChange($event)"
    htmlContent = htmlContent.replace(/\(columnsChange\)="onColumnsChange\(\$event\)"/, '');
    
    // 2. Add pageId="page-name"
    if (!htmlContent.includes(`pageId="${comp.name}"`)) {
      htmlContent = htmlContent.replace(/<app-manage-columns\s+/, `<app-manage-columns pageId="${comp.name}" `);
    }

    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`Updated HTML: ${comp.name}`);
  } else {
    console.warn(`File not found: ${htmlPath}`);
  }
});
