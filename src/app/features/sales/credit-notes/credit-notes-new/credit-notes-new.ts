import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';

interface CreditNoteItem {
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
  selector: 'app-credit-notes-new',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BreadcrumbsComponent, AttachmentsModal, CustomSelectComponent],
  templateUrl: './credit-notes-new.html',
  styleUrl: './credit-notes-new.scss',
})
export class CreditNotesNew implements OnInit {
  isAttachmentsModalOpen = false;

  creditNoteData = {
    customer: '',
    creditNoteNumber: 'CN-001',
    creditNoteDate: '',
    referenceNumber: '',
    accountsReceivable: 'Accounts Receivable',
    discountAt: 'Line Item Level',
    transactionDiscount: null as any,
    transactionDiscountType: '%' as '%' | 'flat',
  };

  note = '';
  termsAndConditions = '';

  items: CreditNoteItem[] = [
    {
      id: 1,
      name: '',
      description: '',
      rate: null as any,
      qty: 1,
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

  itemSelectOptions: SelectOption[] = this.dummyItems.map(item => ({
    label: item.name,
    value: item.name
  }));

  customerOptions: SelectOption[] = [
    { label: 'ABCO HVACR Supply', value: 'ABCO HVACR Supply' }
  ];

  accountsReceivableOptions: SelectOption[] = [
    { label: 'Accounts Receivable', value: 'Accounts Receivable' },
    { label: 'Other Income', value: 'Other Income' }
  ];

  discountAtOptions: SelectOption[] = [
    { label: 'Line Item Level', value: 'Line Item Level' },
    { label: 'Transaction Level', value: 'Transaction Level' }
  ];

  vatSelectOptions: SelectOption[] = [
    { label: 'Select', value: 0 },
    { label: '5%', value: 5 },
    { label: '10%', value: 10 },
    { label: '15%', value: 15 },
    { label: '0%', value: 0 }
  ];

  isBulkModalOpen = false;
  bulkSearchTerm = '';
  selectedBulkItems = new Set<string>();

  nextId = 2;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
  }

  onItemSelect(item: CreditNoteItem): void {
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

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + (Number(item.rate) || 0) * (Number(item.qty) || 0), 0);
  }

  get totalDiscount(): number {
    if (this.creditNoteData.discountAt === 'Transaction Level') {
      const discount = Number(this.creditNoteData.transactionDiscount) || 0;
      if (this.creditNoteData.transactionDiscountType === '%') {
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
    // Current requirement image shows VAT is not explicitly listed in summary but we keep calculations for parity
    if (this.creditNoteData.discountAt === 'Transaction Level') {
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

  updateAmount(item: CreditNoteItem): void {
    const rate = Number(item.rate) || 0;
    const qty = Number(item.qty) || 0;
    const discount = this.creditNoteData.discountAt === 'Line Item Level' ? (Number(item.discount) || 0) : 0;
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
    this.items = this.items.filter(item => !!item.name);

    this.selectedBulkItems.forEach(name => {
      const product = this.dummyItems.find(p => p.name === name);
      if (!product) return;

      const newItem: CreditNoteItem = {
        id: this.nextId++,
        name: product.name,
        description: product.description,
        rate: product.rate,
        qty: 1,
        discount: null as any,
        discountType: '%',
        vat: 0,
        amount: 0
      };
      this.updateAmount(newItem);
      this.items.push(newItem);
    });

    if (this.items.length === 0) this.addRow();
    this.closeBulkModal();
  }

  saveAsDraft(): void {
    this.router.navigate(['/sales/credit-notes']);
  }

  save(): void {
    this.router.navigate(['/sales/credit-notes']);
  }

  cancel(): void {
    this.router.navigate(['/sales/credit-notes']);
  }
}
