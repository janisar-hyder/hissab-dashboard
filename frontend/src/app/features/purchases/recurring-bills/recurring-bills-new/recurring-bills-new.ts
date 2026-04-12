import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';

interface BillItem {
  id: number;
  name: string;
  description: string;
  rate: number;
  qty: number;
  discount: number;
  discountType: '%' | 'flat';
  vat: number | null;
  amount: number;
}

@Component({
  selector: 'app-recurring-bills-new',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BreadcrumbsComponent, AttachmentsModal, CustomSelectComponent],
  templateUrl: './recurring-bills-new.html',
  styleUrl: './recurring-bills-new.scss',
})
export class RecurringBillsNew implements OnInit {
  isAttachmentsModalOpen = false;

  billData = {
    vendor: '',
    profileName: '',
    paymentTerms: '',
    repeatEvery: 'Week',
    startsOn: '',
    endsOn: '',
    neverExpires: false,
    accountsPayable: '',
    discountAt: 'Line Item Level',
    transactionDiscount: null as any,
    transactionDiscountType: '%' as '%' | 'flat',
  };

  note = '';
  termsAndConditions = '';
  saveNoteForFuture = false;
  saveTermsForFuture = false;

  items: BillItem[] = [
    {
      id: 1,
      name: '',
      description: '',
      rate: null as any,
      qty: 1,
      discount: null as any,
      discountType: '%',
      vat: null,
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

  vendorOptions: SelectOption[] = [
    { label: 'ABCO HVACR Supply', value: 'ABCO HVACR Supply' },
    { label: 'APR Supply', value: 'APR Supply' }
  ];

  paymentTermsSelectOptions: SelectOption[] = [
    { label: 'Due on Receipt', value: 'Due on Receipt' },
    { label: 'Net 15', value: 'Net 15' },
    { label: 'Net 30', value: 'Net 30' },
    { label: 'Net 45', value: 'Net 45' },
    { label: 'Net 60', value: 'Net 60' },
    { label: 'Due end of the month', value: 'Due end of the month' },
    { label: 'due end of next month', value: 'due end of next month' },
    { label: 'Custom', value: 'Custom' }
  ];

  repeatEveryOptions: SelectOption[] = [
    { label: 'Week', value: 'Week' },
    { label: '2 Weeks', value: '2 Weeks' },
    { label: 'Month', value: 'Month' },
    { label: '2 Months', value: '2 Months' },
    { label: 'Quarter', value: 'Quarter' },
    { label: '6 Months', value: '6 Months' },
    { label: 'Year', value: 'Year' }
  ];

  accountsPayableOptions: SelectOption[] = [
    { label: 'Accounts Payable', value: 'ap1' },
    { label: 'Default Payable Account', value: 'ap2' }
  ];

  discountAtOptions: SelectOption[] = [
    { label: 'Line Item Level', value: 'Line Item Level' },
    { label: 'Transaction Level', value: 'Transaction Level' }
  ];

  vatSelectOptions: SelectOption[] = [
    { label: 'Select', value: null },
    { label: '5%', value: 5 },
    { label: '10%', value: 10 },
    { label: '15%', value: 15 },
    { label: '0%', value: 0 }
  ];

  discountTypeOptions: SelectOption[] = [
    { label: '%', value: '%' },
    { label: 'BHD', value: 'flat' }
  ];

  isBulkModalOpen = false;
  bulkSearchTerm = '';
  selectedBulkItems = new Set<string>();

  nextId = 2;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    this.billData.startsOn = today;
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.billData.endsOn = nextMonth.toISOString().split('T')[0];
  }

  onItemSelect(item: BillItem): void {
    const selected = this.dummyItems.find(i => i.name === item.name);
    if (selected) {
      item.description = selected.description;
      item.rate = Number(selected.rate) || 0;
      if (!item.qty) item.qty = 1;
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
    if (this.billData.discountAt === 'Transaction Level') {
      const discount = Number(this.billData.transactionDiscount) || 0;
      if (this.billData.transactionDiscountType === '%') {
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
    if (this.billData.discountAt === 'Transaction Level') {
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
    return this.items.some(item => !!item.name);
  }

  updateAmount(item: BillItem): void {
    const rate = Number(item.rate) || 0;
    const qty = Number(item.qty) || 0;
    const discount = this.billData.discountAt === 'Line Item Level' ? (Number(item.discount) || 0) : 0;
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
      vat: null,
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

      const newItem: BillItem = {
        id: this.nextId++,
        name: product.name,
        description: product.description,
        rate: product.rate,
        qty: 1,
        discount: null as any,
        discountType: '%',
        vat: null,
        amount: 0
      };
      this.updateAmount(newItem);
      this.items.push(newItem);
    });
    if (this.items.length === 0) this.addRow();
    this.closeBulkModal();
  }

  saveAsDraft(): void {
    console.log('Draft Recurring Bill:', this.billData);
    this.router.navigate(['/purchases/recurring-bills']);
  }

  save(): void {
    console.log('Saving Recurring Bill:', this.billData);
    this.router.navigate(['/purchases/recurring-bills']);
  }

  cancel(): void {
    this.router.navigate(['/purchases/recurring-bills']);
  }
}
