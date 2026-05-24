import { jsPDF } from 'jspdf';

export interface PdfColumn {
  header: string;
  width: number;
  align: 'left' | 'right' | 'center';
  key: string;
}

export interface PdfRow {
  [key: string]: any;
  itemName?: string;
  itemDesc?: string;
}

export interface PdfMetadata {
  label: string;
  value: string;
}

export interface PdfCustomerInfo {
  name: string;
  email?: string;
  phone?: string;
  addressLines?: string[];
}

export interface PdfSummaryRow {
  label: string;
  value: string;
  isTotal?: boolean;
  isDanger?: boolean;
}

export interface PdfOptions {
  docType: string;
  docNumber: string;
  customerInfo: PdfCustomerInfo;
  metadata: PdfMetadata[];
  columns: PdfColumn[];
  rows: PdfRow[];
  summary: PdfSummaryRow[];
  notes?: string;
  terms?: string;
  showSignature?: boolean;
  companyTRN?: string;
}

// ---------------------------------------------------------------------------
// Header  (logo + company address)
// Web CSS: .company-address { font-size: 11.5px; color: #64748b }
// ---------------------------------------------------------------------------
function drawHeader(doc: jsPDF, currentY: number, logoPngData?: string, companyTRN?: string): number {
  if (logoPngData) {
    doc.addImage(logoPngData, 'PNG', 15, currentY, 47.16, 10.8);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor('#2563eb');
    doc.text('Tamezy', 15, currentY + 8.8);
  }

  // Company address — 11.5px → 8.6pt, color #64748b
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.6);
  doc.setTextColor('#64748b');
  doc.text('Flat 10, Building 1234 Road 123, Block 123', 195, currentY + 1.5, { align: 'right' });
  doc.text('Manama North Sehla, Bahrain',               195, currentY + 5.5, { align: 'right' });
  const trn = companyTRN || '235334556400002';
  doc.text('TRN: ' + trn,                               195, currentY + 9.5, { align: 'right' });

  return currentY + 22;
}

// ---------------------------------------------------------------------------
// Table header row
// Web CSS: .table-header { font-size: 13.5px; font-weight: 500; bg: #2563eb; color: #fff }
// ---------------------------------------------------------------------------
function drawTableHeader(doc: jsPDF, currentY: number, columns: PdfColumn[]): number {
  doc.setFillColor('#2563eb');
  doc.roundedRect(15, currentY, 180, 9, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.1); // 13.5px × 0.75
  doc.setTextColor('#ffffff');

  let colX = 15;
  for (const col of columns) {
    let textX = colX + 2;
    if (col.align === 'center') textX = colX + col.width / 2;
    else if (col.align === 'right') textX = colX + col.width - 2;
    doc.text(col.header, textX, currentY + 6, { align: col.align });
    colX += col.width;
  }

  return currentY + 9;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function exportToSelectablePdf(options: PdfOptions, filename: string): void {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  const renderPdf = (logoPngData?: string) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    let currentY = 15;

    // ── 1. Page-1 header ────────────────────────────────────────────────────
    currentY = drawHeader(doc, currentY, logoPngData, options.companyTRN);

    // ── 2. Customer info (left) + doc meta (right) ───────────────────────────
    const metaStartY = currentY;

    // "Customer Info" label — 11px → 8.25pt, color #94a3b8
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.25);
    doc.setTextColor('#94a3b8');
    doc.text('Customer Info', 15, currentY);
    currentY += 5;

    // Customer name — 16px → 12pt, font-weight 500 (bold), color #1e293b
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor('#1e293b');
    doc.text(options.customerInfo.name, 15, currentY);
    currentY += 6;

    // Address details — 12.5px → 9.4pt, color #64748b
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.4);
    doc.setTextColor('#64748b');
    if (options.customerInfo.email) {
      doc.text(options.customerInfo.email, 15, currentY);
      currentY += 5;
    }
    if (options.customerInfo.phone) {
      doc.text(options.customerInfo.phone, 15, currentY);
      currentY += 5;
    }
    if (options.customerInfo.addressLines) {
      for (const line of options.customerInfo.addressLines) {
        if (line && line.trim()) {
          doc.text(line, 15, currentY);
          currentY += 5;
        }
      }
    }
    const customerEndY = currentY;

    // Right column ────────────────────────────────────────────────────────────
    let metaY = metaStartY;

    // Doc-type heading — 24px → 18pt, color #2563eb, uppercase
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#2563eb');
    doc.text(options.docType.toUpperCase(), 195, metaY + 4, { align: 'right' });
    metaY += 10;

    // Doc number — 12.5px → 9.4pt, color #64748b
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.4);
    doc.setTextColor('#64748b');
    doc.text('# ' + options.docNumber, 195, metaY, { align: 'right' });
    metaY += 7;

    // Meta rows — 12.5px → 9.4pt
    // label: color #94a3b8 (span:first-child)
    // value: color #1e293b, font-weight 500 (span:last-child)
    for (const item of options.metadata) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.4);
      doc.setTextColor('#94a3b8');
      doc.text(item.label, 130, metaY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.4);
      doc.setTextColor('#1e293b');
      doc.text(item.value, 195, metaY, { align: 'right' });
      metaY += 5;
    }
    const metaEndY = metaY;

    currentY = Math.max(customerEndY, metaEndY) + 9;

    // ── 3. Table header ──────────────────────────────────────────────────────
    currentY = drawTableHeader(doc, currentY, options.columns);

    // ── 4. Table rows ────────────────────────────────────────────────────────
    // Web CSS: .table-row { padding: 14px; font-size: 12.5px; color: #1e293b }
    options.rows.forEach((row, rowIndex) => {
      let itemColWidth = 80;
      const itemColDef = options.columns.find(c => c.key === 'item');
      if (itemColDef) itemColWidth = itemColDef.width;

      const descLines = row.itemDesc ? doc.splitTextToSize(row.itemDesc, itemColWidth - 4) : [];
      // Base row height mirrors the web padding + line height
      const rowHeight = 9 + (row.itemDesc ? descLines.length * 4.5 + 1.5 : 0);

      if (currentY + rowHeight > 272) {
        doc.setDrawColor('#e2e8f0');
        doc.setLineWidth(0.2);
        doc.line(15, currentY, 195, currentY);

        doc.addPage();
        currentY = 15;
        currentY = drawHeader(doc, currentY, logoPngData, options.companyTRN);
        currentY = drawTableHeader(doc, currentY, options.columns);
      }

      let colX = 15;
      options.columns.forEach(col => {
        let textX = colX + 2;
        if (col.align === 'center') textX = colX + col.width / 2;
        else if (col.align === 'right') textX = colX + col.width - 2;

        if (col.key === 'item') {
          // .item-name: font-size 12.5px → 9.4pt, font-weight 500, color #1e293b
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.4);
          doc.setTextColor('#1e293b');
          doc.text(row.itemName || '', textX, currentY + 5.5);

          // .item-desc: font-size 11px → 8.25pt, color #94a3b8
          if (row.itemDesc && descLines.length > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.25);
            doc.setTextColor('#94a3b8');
            descLines.forEach((line: string, i: number) => {
              doc.text(line, textX, currentY + 9.5 + i * 4.5);
            });
          }
        } else {
          // Normal column — 12.5px → 9.4pt, color #1e293b
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.4);
          doc.setTextColor('#1e293b');
          const val = col.key === 'hash' ? String(rowIndex + 1) : String(row[col.key] ?? '');
          doc.text(val, textX, currentY + 5.5, { align: col.align });
        }

        colX += col.width;
      });

      // Row divider — border-bottom: 1px solid #f1f5f9
      doc.setDrawColor('#f1f5f9');
      doc.setLineWidth(0.2);
      doc.line(15, currentY + rowHeight, 195, currentY + rowHeight);

      currentY += rowHeight;
    });

    // End-of-table line
    doc.setDrawColor('#e2e8f0');
    doc.setLineWidth(0.3);
    doc.line(15, currentY, 195, currentY);
    currentY += 9;

    // ── 5. Summary section ───────────────────────────────────────────────────
    // Web CSS: .summary-row { font-size: 14px; color: #64748b }
    //          .summary-total { font-size: 16px; font-weight: 500; color: #1e293b; bg: #f8fafc }
    const summaryHeight = options.summary.length * 7 + 6;
    if (currentY + summaryHeight > 272) {
      doc.addPage();
      currentY = 15;
      currentY = drawHeader(doc, currentY, logoPngData, options.companyTRN);
      currentY += 5;
    }

    options.summary.forEach(sumRow => {
      if (sumRow.isTotal) {
        currentY += 2;
        doc.setFillColor('#f8fafc');
        doc.roundedRect(125, currentY, 70, 9, 1, 1, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12); // 16px → 12pt
        doc.setTextColor('#1e293b');
        doc.text(sumRow.label, 128, currentY + 6.2);
        doc.text(sumRow.value, 192, currentY + 6.2, { align: 'right' });

        currentY += 14;
      } else {
        // Label — 14px → 10.5pt, color #64748b (or #ef4444 if danger)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(sumRow.isDanger ? '#ef4444' : '#64748b');
        doc.text(sumRow.label, 125, currentY);

        // Value — font-weight 500, color #1e293b (or #ef4444 if danger)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(sumRow.isDanger ? '#ef4444' : '#1e293b');
        doc.text(sumRow.value, 195, currentY, { align: 'right' });
        currentY += 6.5;
      }
    });

    currentY += 4;

    // ── 6. Notes & Terms ─────────────────────────────────────────────────────
    // Web CSS: .notes-section label { font-size:14px; font-weight:500; color:#475569 }
    //          .notes-section p    { font-size:13.5px; color:#64748b }
    const drawNotesSection = (title: string, text: string) => {
      const textLines = doc.splitTextToSize(text, 180);
      const heightNeeded = 6 + textLines.length * 5 + 4;

      if (currentY + heightNeeded > 272) {
        doc.addPage();
        currentY = 15;
        currentY = drawHeader(doc, currentY, logoPngData, options.companyTRN);
        currentY += 5;
      }

      // Section label — 14px → 10.5pt, font-weight 500, color #475569
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor('#475569');
      doc.text(title, 15, currentY);
      currentY += 5.5;

      // Body text — 13.5px → 10.1pt, color #64748b
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.1);
      doc.setTextColor('#64748b');
      textLines.forEach((line: string) => {
        doc.text(line, 15, currentY);
        currentY += 5;
      });
      currentY += 6;
    };

    if (options.notes && options.notes.trim()) {
      drawNotesSection('Notes', options.notes);
    }
    if (options.terms && options.terms.trim()) {
      drawNotesSection('Terms & Conditions', options.terms);
    }

    // ── 7. Signature (Delivery Notes only) ───────────────────────────────────
    if (options.showSignature) {
      if (currentY + 20 > 272) {
        doc.addPage();
        currentY = 15;
        currentY = drawHeader(doc, currentY, logoPngData, options.companyTRN);
        currentY += 15;
      } else {
        currentY += 10;
      }

      doc.setDrawColor('#94a3b8');
      doc.setLineWidth(0.3);
      doc.line(140, currentY, 195, currentY);
      currentY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.25); // 11px → 8.25pt
      doc.setTextColor('#64748b');
      doc.text('Authorized Signature', 167.5, currentY, { align: 'center' });
    }

    // ── 8. Page numbers — "Page X of Y" centred at the bottom ───────────────
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.25); // 11px → 8.25pt, matches small UI text
      doc.setTextColor('#94a3b8');
      doc.text(`Page ${p} of ${totalPages}`, 105, 290, { align: 'center' });
    }

    // ── 9. Save ──────────────────────────────────────────────────────────────
    doc.save(filename);
  };

  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 131 * 3;
      canvas.height = 30 * 3;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, 131 * 3, 30 * 3);
        renderPdf(canvas.toDataURL('image/png'));
      } else {
        renderPdf(undefined);
      }
    } catch (e) {
      renderPdf(undefined);
    }
  };

  img.onerror = () => renderPdf(undefined);

  img.src = '/icons/tamezy-logo.svg';
}
