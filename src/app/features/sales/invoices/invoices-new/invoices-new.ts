import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';

interface InvoiceItem {
  id: number;
  name: string;
  description: string;
  rate: number;
  qty: number;
  discount: number;
  discountType: '%' | 'flat';
  vat: number;
  amount: number;
}

@Component({
  selector: 'app-invoices-new',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BreadcrumbsComponent, AttachmentsModal],
  templateUrl: './invoices-new.html',
  styleUrl: './invoices-new.scss',
})
export class InvoicesNew implements OnInit {
  isAttachmentsModalOpen = false;
  activeTab: 'Invoice Information' | 'Commission' = 'Invoice Information';

  invoiceData = {
    customer: '',
    invoiceNumber: 'INV-001',
    invoiceDate: '',
    referenceNumber: '',
    paymentTerms: '',
    dueDate: '',
    salesPerson: '',
    discountAt: 'Line Item Level',
    transactionDiscount: 0,
    transactionDiscountType: '%' as '%' | 'flat',
  };

  commissionData = {
    salesPartner: '',
    commissionPercentage: 0,
    commissionAmount: 0,
  };

  note = '';
  termsAndConditions = '';
  saveNoteForFuture = false;
  saveTermsForFuture = false;

  items: InvoiceItem[] = [
    {
      id: 1,
      name: '',
      description: '',
      rate: null as any,
      qty: null as any,
      discount: null as any,
      discountType: '%',
      vat: 0,
      amount: 0,
    }
  ];

  dummyItems = [
    { name: 'Wordpress Website Development', description: 'The project includes the design and development of a basic, responsive website.', rate: 100 },
    { name: 'Mobile App Support', description: 'Annual maintenance and support for the mobile application.', rate: 250 },
    { name: 'SEO Optimization', description: 'On-page and off-page SEO optimization.', rate: 150 },
    { name: 'Dell Latitude 5440', description: 'Business Laptop (Intel Core i5, 16GB RAM, 512GB SSD)', rate: 450 },
    { name: 'Samsung 32" 4K Monitor', description: 'Ultra HD LED Display with HDR support', rate: 120 },
    { name: 'On Site Support', description: 'Professional on-site technical assistance', rate: 50 }
  ];

  paymentTermsOptions = [
    'Net 15', 'Net 30', 'Net 45', 'Net 60', 
    'Due end of the month', 'due end of next month', 
    'Due on Receipt', 'Custom'
  ];

  isBulkModalOpen = false;
  bulkSearchTerm = '';
  selectedBulkItems = new Set<string>();

  dummyBillingAddress = {
    name: 'Khalid Al-Jabri',
    details: 'Shop No. 6, Building 5277, Road 1239, Block Block 812\nIsa Town, Bahrain'
  };
  dummyShipmentAddress = {
    name: '',
    details: ''
  };

  nextId = 2;
  vatOptions = [5, 10, 15, 0];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Initial dates left empty to match Quotation module behavior and show placeholders
  }

  setActiveTab(tab: 'Invoice Information' | 'Commission'): void {
    this.activeTab = tab;
  }

  onItemSelect(item: InvoiceItem): void {
    const selected = this.dummyItems.find(i => i.name === item.name);
    if (selected) {
      item.description = selected.description;
      item.rate = Number(selected.rate) || 0;
      if (item.qty === 0) item.qty = 1;
    } else {
      item.description = '';
      item.rate = 0;
    }
    this.updateAmount(item);
  }

  getAvailableItems(currentItemName: string): any[] {
    const selectedNames = this.items
      .map(item => item.name)
      .filter(name => name && name !== '' && name !== currentItemName);
    return this.dummyItems.filter(item => !selectedNames.includes(item.name));
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + (Number(item.rate) || 0) * (Number(item.qty) || 0), 0);
  }

  get totalDiscount(): number {
    if (this.invoiceData.discountAt === 'Transaction Level') {
      const discount = Number(this.invoiceData.transactionDiscount) || 0;
      if (this.invoiceData.transactionDiscountType === '%') {
        return (this.subtotal * discount / 100);
      }
      return discount;
    }

    return this.items.reduce((sum, item) => {
      const rate = Number(item.rate) || 0;
      const qty = Number(item.qty) || 0;
      const discount = Number(item.discount) || 0;
      const base = rate * qty;
      if (item.discountType === '%') {
        return sum + (base * discount / 100);
      }
      return sum + discount;
    }, 0);
  }

  get totalVat(): number {
    if (this.invoiceData.discountAt === 'Transaction Level') {
      const totalDisc = this.totalDiscount;
      const sub = this.subtotal;
      
      return this.items.reduce((sum, item) => {
        const rate = Number(item.rate) || 0;
        const qty = Number(item.qty) || 0;
        const vat = Number(item.vat) || 0;
        const base = rate * qty;
        
        const proportionalDisc = sub > 0 ? (base / sub * totalDisc) : 0;
        const discounted = base - proportionalDisc;
        
        return sum + (discounted * vat / 100);
      }, 0);
    }

    return this.items.reduce((sum, item) => {
      const rate = Number(item.rate) || 0;
      const qty = Number(item.qty) || 0;
      const discount = Number(item.discount) || 0;
      const vat = Number(item.vat) || 0;
      const base = rate * qty;
      const discAmt = item.discountType === '%' ? (base * discount / 100) : discount;
      const discounted = base - discAmt;
      return sum + (discounted * vat / 100);
    }, 0);
  }

  get grandTotal(): number {
    return this.subtotal - this.totalDiscount + this.totalVat;
  }

  get hasSelectedItems(): boolean {
    return this.items.some(item => item.name && item.name !== '');
  }

  updateAmount(item: InvoiceItem): void {
    const rate = Number(item.rate) || 0;
    const qty = Number(item.qty) || 0;
    const discount = this.invoiceData.discountAt === 'Line Item Level' ? (Number(item.discount) || 0) : 0;
    const vat = Number(item.vat) || 0;

    const base = rate * qty;
    const discAmt = item.discountType === '%' ? base * discount / 100 : discount;
    const discounted = base - discAmt;
    item.amount = discounted + (discounted * vat / 100);
  }

  addRow(): void {
    this.items.push({
      id: this.nextId++,
      name: '',
      description: '',
      rate: 0,
      qty: 1,
      discount: 0,
      discountType: '%',
      vat: 0,
      amount: 0,
    });
  }

  removeRow(id: number): void {
    if (this.items.length > 1) {
      this.items = this.items.filter(i => i.id !== id);
    }
  }

  openAttachmentsModal(): void { this.isAttachmentsModalOpen = true; }
  closeAttachmentsModal(): void { this.isAttachmentsModalOpen = false; }

  // --- Bulk Add ---
  openBulkModal(): void {
    this.isBulkModalOpen = true;
    this.bulkSearchTerm = '';
    this.selectedBulkItems.clear();
    this.items.forEach(item => {
      if (item.name) this.selectedBulkItems.add(item.name);
    });
  }
  closeBulkModal(): void { this.isBulkModalOpen = false; }

  get filteredBulkItems() {
    if (!this.bulkSearchTerm) return this.dummyItems;
    const term = this.bulkSearchTerm.toLowerCase();
    return this.dummyItems.filter(item => item.name.toLowerCase().includes(term));
  }

  toggleBulkItem(name: string): void {
    if (this.selectedBulkItems.has(name)) this.selectedBulkItems.delete(name);
    else this.selectedBulkItems.add(name);
  }

  toggleSelectAllBulk(event: any): void {
    const isChecked = event.target.checked;
    const filtered = this.filteredBulkItems;
    if (isChecked) filtered.forEach(item => this.selectedBulkItems.add(item.name));
    else filtered.forEach(item => this.selectedBulkItems.delete(item.name));
  }

  isAllFilteredSelected(): boolean {
    const filtered = this.filteredBulkItems;
    if (filtered.length === 0) return false;
    return filtered.every(item => this.selectedBulkItems.has(item.name));
  }

  addBulkItems(): void {
    this.items = this.items.filter(item => !item.name || this.selectedBulkItems.has(item.name));
    const currentNames = new Set(this.items.map(i => i.name).filter(n => !!n));
    const namesToAdd = Array.from(this.selectedBulkItems).filter(name => !currentNames.has(name));
    let firstEmptyRow = this.items.find(i => !i.name);

    namesToAdd.forEach((name, index) => {
      const product = this.dummyItems.find(p => p.name === name);
      if (!product) return;

      if (index === 0 && firstEmptyRow) {
        firstEmptyRow.name = product.name;
        firstEmptyRow.description = product.description;
        firstEmptyRow.rate = product.rate;
        firstEmptyRow.qty = 1;
        this.updateAmount(firstEmptyRow);
      } else {
        const newItem: InvoiceItem = {
          id: this.nextId++,
          name: product.name,
          description: product.description,
          rate: product.rate,
          qty: 1,
          discount: 0,
          discountType: '%',
          vat: 0,
          amount: 0
        };
        this.updateAmount(newItem);
        this.items.push(newItem);
      }
    });

    if (this.items.length === 0) this.addRow();
    this.closeBulkModal();
  }

  saveAsDraft(): void {
    console.log('Draft Invoice:', this.invoiceData);
    this.router.navigate(['/sales/invoices']);
  }

  save(): void {
    console.log('Saving Invoice:', this.invoiceData);
    this.router.navigate(['/sales/invoices']);
  }

  cancel(): void {
    this.router.navigate(['/sales/invoices']);
  }
}
