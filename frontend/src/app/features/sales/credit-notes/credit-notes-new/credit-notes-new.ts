import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';
import { CreditNotesService } from '../services/credit-notes.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ChangeDetectorRef } from '@angular/core';

interface CreditNoteItem {
  id: number;
  item_id: string | null; // Changed to string for custom-select
  description: string;
  rate: number;
  qty: number;
  discount: number;
  discountType: '%' | 'flat';
  vat_rate_id: string | null; // Changed to string for custom-select
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
  attachments: any[] = [];

  creditNoteData = {
    customer: '',
    creditNoteNumber: 'Auto Generated',
    creditNoteDate: '',
    referenceNumber: '',
    accountsReceivable: 'Accounts Receivable',
    discountAt: 'Line Item Level',
    transactionDiscount: null as any,
    transactionDiscountType: '%' as '%' | 'flat',
  };

  note = '';
  termsAndConditions = '';
  saveNoteForFuture = false;
  saveTermsForFuture = false;

  items: CreditNoteItem[] = [
    {
      id: 1,
      item_id: null,
      description: '',
      rate: 0,
      qty: 1,
      discount: 0,
      discountType: '%',
      vat_rate_id: null,
      amount: 0,
    }
  ];

  customerOptions: SelectOption[] = [];
  itemOptions: any[] = [];
  itemSelectOptions: SelectOption[] = [];
  accountsReceivableOptions: SelectOption[] = [];
  vatOptions: any[] = [];
  vatSelectOptions: SelectOption[] = [];
  
  discountAtOptions: SelectOption[] = [
    { label: 'Line Item Level', value: 'Line Item Level' },
    { label: 'Transaction Level', value: 'Transaction Level' }
  ];

  baseCurrencyId: number | null = null;
  isSaving = false;

  discountTypeOptions: SelectOption[] = [
    { label: '%', value: '%' },
    { label: 'BHD', value: 'flat' }
  ];

  isBulkModalOpen = false;
  bulkSearchTerm = '';
  selectedBulkItems = new Set<string>();

  nextId = 2;
  isEditMode = false;
  editId: number | null = null;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private creditNotesService: CreditNotesService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadDefaultSettings();
    this.checkEditMode();
    
    // Auto-generate a placeholder or handle fetching
    if (!this.isEditMode) {
      this.creditNoteData.creditNoteDate = new Date().toISOString().split('T')[0];
    }
  }

  checkEditMode(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.editId = parseInt(id);
      this.loadCreditNoteDetails(this.editId);
    }
  }

  loadCreditNoteDetails(id: number) {
    this.creditNotesService.getCreditNoteById(id).subscribe({
      next: (res) => {
        const cn = res.data;
        this.creditNoteData = {
          customer: cn.customer_id.toString(),
          creditNoteNumber: cn.credit_note_number,
          creditNoteDate: cn.credit_note_date.split('T')[0],
          referenceNumber: cn.reference_number || '',
          accountsReceivable: 'Accounts Receivable', // Default for now
          discountAt: 'Line Item Level', // Default for now
          transactionDiscount: null,
          transactionDiscountType: '%',
        };

        this.note = cn.customer_notes || '';
        this.termsAndConditions = cn.terms_and_conditions || '';
        this.attachments = cn.attachments || [];

        if (cn.details && cn.details.length > 0) {
          this.items = cn.details.map((d: any, index: number) => ({
            id: index + 1,
            item_id: d.item_id.toString(),
            description: d.description || '',
            rate: Number(d.rate),
            qty: Number(d.quantity),
            discount: Number(d.discount_amount),
            discountType: '%',
            vat_rate_id: d.vat_rate_id?.toString() || null,
            amount: Number(d.line_total)
          }));
          this.nextId = this.items.length + 1;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Failed to load credit note details');
        this.router.navigate(['/sales/credit-notes']);
      }
    });
  }

  loadDefaultSettings() {
    this.creditNotesService.getSettings('credit-note').subscribe({
      next: (res) => {
        if (res.data) {
          this.note = res.data.default_note || '';
          this.termsAndConditions = res.data.default_terms || '';
          this.cdr.detectChanges();
        }
      }
    });
  }

  loadDropdownData() {
    this.creditNotesService.getCustomers().subscribe(res => {
      this.customerOptions = res.data.map((c: any) => ({ label: c.name, value: c.id.toString() }));
      this.cdr.detectChanges();
    });

    this.creditNotesService.getItems().subscribe(res => {
      this.itemOptions = res.data;
      this.itemSelectOptions = res.data.map((i: any) => ({ label: i.name, value: i.id.toString() }));
      this.cdr.detectChanges();
    });

    this.creditNotesService.getAccounts().subscribe(res => {
      this.accountsReceivableOptions = res.data.map((a: any) => ({ label: a.name, value: a.id.toString() }));
      this.cdr.detectChanges();
    });

    this.creditNotesService.getVatRates().subscribe(res => {
      this.vatOptions = res.data;
      this.vatSelectOptions = [
        { label: 'Select VAT', value: null },
        ...res.data.map((v: any) => ({ label: `${v.name} (${v.rate}%)`, value: v.id.toString() }))
      ];
      this.cdr.detectChanges();
    });

    this.creditNotesService.getCurrencies().subscribe(res => {
      const currencies = res.data;
      const baseCurrency = currencies.find((c: any) => c.is_base) || currencies.find((c: any) => c.code === 'BHD');
      if (baseCurrency) this.baseCurrencyId = baseCurrency.id;
      this.cdr.detectChanges();
    });
  }

  onItemSelect(item: CreditNoteItem): void {
    const selected = this.itemOptions.find(i => i.id.toString() === item.item_id?.toString());
    if (selected) {
      item.description = selected.description || '';
      item.rate = Number(selected.selling_price) || Number(selected.rate) || 0;
      if (!item.qty || item.qty === 0) item.qty = 1;
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
        const vatRate = this.getVatRateById(item.vat_rate_id);
        const base = rate * qty;
        
        const proportionalDisc = sub > 0 ? (base / sub * totalDisc) : 0;
        const discounted = base - proportionalDisc;
        
        return sum + (discounted * vatRate / 100);
      }, 0);
    }

    return this.items.reduce((sum, item) => {
      const rate = Number(item.rate) || 0;
      const qty = Number(item.qty) || 0;
      const discount = Number(item.discount) || 0;
      const vatRate = this.getVatRateById(item.vat_rate_id);
      const base = rate * qty;
      const discAmt = item.discountType === '%' ? (base * discount / 100) : discount;
      const discounted = base - discAmt;
      return sum + (discounted * vatRate / 100);
    }, 0);
  }

  getVatRateById(vatRateId: any): number {
    if (!vatRateId) return 0;
    const vat = this.vatOptions.find(v => v.id.toString() === vatRateId.toString());
    return vat ? Number(vat.rate) : 0;
  }

  get grandTotal(): number {
    return this.subtotal - this.totalDiscount + this.totalVat;
  }

  updateAmount(item: CreditNoteItem): void {
    const rate = Number(item.rate) || 0;
    const qty = Number(item.qty) || 0;
    const discount = this.creditNoteData.discountAt === 'Line Item Level' ? (Number(item.discount) || 0) : 0;
    const vatRate = this.getVatRateById(item.vat_rate_id);

    const base = rate * qty;
    const discAmt = item.discountType === '%' ? base * discount / 100 : discount;
    const discounted = base - discAmt;
    item.amount = discounted + (discounted * vatRate / 100);
  }

  addRow(): void {
    this.items.push({
      id: this.nextId++,
      item_id: null,
      description: '',
      rate: 0,
      qty: 1,
      discount: 0,
      discountType: '%',
      vat_rate_id: null,
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
    if (!this.bulkSearchTerm) return this.itemOptions;
    const term = this.bulkSearchTerm.toLowerCase();
    return this.itemOptions.filter((item: any) => item.name.toLowerCase().includes(term));
  }

  toggleBulkItem(id: string): void {
    if (this.selectedBulkItems.has(id)) this.selectedBulkItems.delete(id);
    else this.selectedBulkItems.add(id);
  }

  toggleSelectAllBulk(event: any): void {
    const isChecked = event.target.checked;
    const filtered = this.filteredBulkItems;
    if (isChecked) filtered.forEach((item: any) => this.selectedBulkItems.add(item.id.toString()));
    else filtered.forEach((item: any) => this.selectedBulkItems.delete(item.id.toString()));
  }

  isAllFilteredSelected(): boolean {
    const filtered = this.filteredBulkItems;
    if (filtered.length === 0) return false;
    return filtered.every((item: any) => this.selectedBulkItems.has(item.id.toString()));
  }

  addBulkItems(): void {
    this.items = this.items.filter(item => item.item_id != null);

    this.selectedBulkItems.forEach(itemId => {
      const product = this.itemOptions.find((p: any) => p.id.toString() === itemId);
      if (!product) return;

      const newItem: CreditNoteItem = {
        id: this.nextId++,
        item_id: product.id,
        description: product.description || '',
        rate: Number(product.selling_price) || Number(product.rate) || 0,
        qty: 1,
        discount: null as any,
        discountType: '%',
        vat_rate_id: null,
        amount: 0
      };
      this.updateAmount(newItem);
      this.items.push(newItem);
    });

    if (this.items.length === 0) this.addRow();
    this.closeBulkModal();
  }

  saveAsDraft(): void {
    this.save('Draft');
  }

  save(status: string = 'Open'): void {
    if (!this.creditNoteData.customer) {
      this.notificationService.error('Please select a customer');
      return;
    }

    const validItems = this.items.filter(i => i.item_id);
    if (validItems.length === 0) {
      this.notificationService.error('Please add at least one item');
      return;
    }

    this.isSaving = true;
    const payload = {
      credit_note_number: this.creditNoteData.creditNoteNumber === 'Auto Generated' ? undefined : this.creditNoteData.creditNoteNumber,
      customer_id: parseInt(this.creditNoteData.customer),
      credit_note_date: this.creditNoteData.creditNoteDate,
      reference_number: this.creditNoteData.referenceNumber,
      status: status,
      currency_id: this.baseCurrencyId || undefined,
      sub_total: this.subtotal,
      total_vat: this.totalVat,
      grand_total: this.grandTotal,
      customer_notes: this.note,
      terms_and_conditions: this.termsAndConditions,
      save_note_for_future: this.saveNoteForFuture,
      save_terms_for_future: this.saveTermsForFuture,
      attachments: this.attachments,
      details: validItems.map(item => ({
        item_id: Number(item.item_id),
        description: item.description,
        quantity: item.qty,
        rate: item.rate,
        vat_rate_id: item.vat_rate_id ? Number(item.vat_rate_id) : undefined,
        line_total: item.amount
      }))
    };

    const apiCall = this.isEditMode 
      ? this.creditNotesService.updateCreditNote(this.editId!, payload)
      : this.creditNotesService.createCreditNote(payload);

    apiCall.subscribe({
      next: () => {
        this.notificationService.success(this.isEditMode ? 'Credit note updated successfully' : 'Credit note created successfully');
        this.isSaving = false;
        this.router.navigate(['/sales/credit-notes']);
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to save credit note');
        this.isSaving = false;
      }
    });
  }

  preventNegative(event: KeyboardEvent) {
    if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }

  cancel(): void {
    this.router.navigate(['/sales/credit-notes']);
  }
}
