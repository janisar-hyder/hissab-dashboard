import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { QuotationsService, Quotation, QuotationDetail } from '../services/quotations.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { SalesSettingsService } from '../../../settings/services/sales-settings.service';
import { VatSettingsService } from '../../../settings/vat-compliance/vat-settings/services/vat-settings.service';

interface QuotationItem {
  id: number; // Local ID for tracking rows
  item_id: number | null;
  name: string;
  description: string;
  rate: number;
  qty: number;
  discount: number;
  discountType: '%' | 'flat';
  vat_rate_id: number | null;
  amount: number;
}

@Component({
  selector: 'app-quotations-new',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BreadcrumbsComponent, CustomSelectComponent, AttachmentsModal],
  templateUrl: './quotations-new.html',
  styleUrl: './quotations-new.scss',
})
export class QuotationsNew implements OnInit {
  private quotationsService = inject(QuotationsService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private salesSettingsService = inject(SalesSettingsService);
  private vatSettingsService = inject(VatSettingsService);

  get isVatRegistered(): boolean { return this.vatSettingsService.isVatRegistered; }

  isAttachmentsModalOpen = false;
  isEditMode = false;
  editId: number | null = null;
  isSaving = false;

  quotationData = {
    customer_id: null as any,
    quotationNumber: 'Auto Generated',
    quotationDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    referenceNumber: '',
    salesPersonId: null as any,
    discountAt: 'Line Item Level',
    transactionDiscount: null as any,
    transactionDiscountType: '%' as '%' | 'flat',
  };

  note = '';
  termsAndConditions = '';
  attachments: any[] = [];
  saveNoteForFuture = false;
  saveTermsForFuture = false;

  items: QuotationItem[] = [
    {
      id: 1,
      item_id: null,
      name: '',
      description: '',
      rate: null as any,
      qty: null as any,
      discount: null as any,
      discountType: '%',
      vat_rate_id: null,
      amount: 0,
    }
  ];

  // Dropdown Options
  customerOptions: SelectOption[] = [];
  rawCustomers: any[] = []; // Store full customer objects for address lookup
  selectedCustomer: any = null; // Currently selected customer
  baseCurrencyId: number | null = null; // Resolved from client's base_currency
  itemOptions: any[] = []; // Store raw items for lookup
  itemSelectOptions: SelectOption[] = [];
  salesPersonOptions: SelectOption[] = [];
  vatOptions: any[] = []; // Store raw VAT rates
  vatSelectOptions: SelectOption[] = [];

  paymentTermsSelectOptions: SelectOption[] = [
    { label: 'Due on Receipt', value: '0' },
    { label: 'Net 15', value: '15' },
    { label: 'Net 30', value: '30' },
    { label: 'Net 45', value: '45' },
    { label: 'Net 60', value: '60' },
    { label: 'Due end of the month', value: 'EOM' },
    { label: 'Custom', value: 'Custom' }
  ];

  discountAtOptions: SelectOption[] = [
    { label: 'Line Item Level', value: 'Line Item Level' },
    { label: 'Transaction Level', value: 'Transaction Level' }
  ];
  
  discountTypeOptions: SelectOption[] = [
    { label: '%', value: '%' },
    { label: 'BHD', value: 'flat' }
  ];

  isBulkModalOpen = false;
  bulkSearchTerm = '';
  selectedBulkItems = new Set<number>();

  nextId = 2;

  ngOnInit() {
    this.loadDropdownData();
    this.checkEditMode();
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.editId = Number(id);
      this.loadQuotationDetails(this.editId);
    } else {
      this.loadDefaultSettings();
    }
  }

  loadDefaultSettings() {
    this.salesSettingsService.getSettings('quotation').subscribe({
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
    this.quotationsService.getCustomers().subscribe(res => {
      this.rawCustomers = res.data;
      this.customerOptions = res.data.map((c: any) => ({ label: c.name, value: c.id.toString() }));
      // If editing and customer_id is already set, resolve the selected customer
      if (this.quotationData.customer_id) {
        this.onCustomerChange();
      }
      this.cdr.detectChanges();
    });

    this.quotationsService.getItems().subscribe(res => {
      this.itemOptions = res.data;
      this.itemSelectOptions = res.data.map((i: any) => ({ label: i.name, value: i.id.toString() }));
      this.cdr.detectChanges();
    });

    // Fetch currencies to resolve baseCurrencyId from client's base_currency code
    this.quotationsService.getCurrencies().subscribe(res => {
      const currencies = res.data;
      // Also fetch client info to get base_currency code
      this.quotationsService.getClientInfo().subscribe(profile => {
        // Profile doesn't have base_currency, it's on the Client model.
        // The client's base_currency defaults to 'BHD'. Find matching currency ID.
        const baseCurrencyCode = 'BHD'; // Default from Client model
        const match = currencies.find((c: any) => c.code === baseCurrencyCode);
        if (match) {
          this.baseCurrencyId = match.id;
        } else if (currencies.length > 0) {
          this.baseCurrencyId = currencies[0].id;
        }
        this.cdr.detectChanges();
      });
    });

    this.quotationsService.getSalesPersons().subscribe(res => {
      this.salesPersonOptions = res.data.map((s: any) => ({ label: s.name, value: s.id.toString() }));
      this.cdr.detectChanges();
    });

    this.quotationsService.getVatRates().subscribe(res => {
      this.vatOptions = res.data;
      this.vatSelectOptions = [
        { label: 'Select VAT', value: null },
        ...res.data.map((v: any) => ({ label: `${v.name} (${v.rate}%)`, value: v.id.toString() }))
      ];
      this.cdr.detectChanges();
    });
  }

  onCustomerChange(): void {
    const customerId = this.quotationData.customer_id;
    if (customerId) {
      this.selectedCustomer = this.rawCustomers.find(c => c.id.toString() === customerId.toString()) || null;
    } else {
      this.selectedCustomer = null;
    }
  }

  loadQuotationDetails(id: number) {
    this.quotationsService.getQuotationById(id).subscribe({
      next: (res) => {
        const q = res.data;
        this.quotationData = {
          customer_id: q.customer_id.toString(),
          quotationNumber: q.quotation_number,
          quotationDate: q.quotation_date.split('T')[0],
          expiryDate: q.expiry_date ? q.expiry_date.split('T')[0] : '',
          referenceNumber: q.reference_number || '',
          salesPersonId: q.sales_person_id?.toString() || '',
          discountAt: q.discount_level,
          transactionDiscount: q.discount_amount,
          transactionDiscountType: q.discount_type as '%' | 'flat',
        };
        // Use the quotation's existing currency_id as override
        if (q.currency_id) {
          this.baseCurrencyId = q.currency_id;
        }
        // Resolve selected customer for address display
        this.onCustomerChange();

        this.note = q.customer_notes || '';
        this.termsAndConditions = q.terms_and_conditions || '';
        this.attachments = q.attachments || [];

        this.items = q.details.map((d: any, index: number) => {
          const item: QuotationItem = {
            id: index + 1,
            item_id: d.item_id,
            name: d.item_id.toString(),
            description: d.description || '',
            rate: Number(d.rate),
            qty: Number(d.quantity),
            discount: Number(d.discount_amount),
            discountType: 'flat', // Backend stores amount, we might need type if we want to toggle
            vat_rate_id: d.vat_rate_id,
            amount: Number(d.line_total)
          };
          this.updateAmount(item);
          return item;
        });
        this.nextId = this.items.length + 1;
        this.cdr.detectChanges();
      },
      error: () => this.notificationService.error('Failed to load quotation details')
    });
  }

  onItemSelect(item: QuotationItem): void {
    const selected = this.itemOptions.find(i => i.id.toString() === item.name);
    if (selected) {
      item.item_id = selected.id;
      item.description = selected.description || '';
      item.rate = Number(selected.sales_rate) || 0;
      if (item.qty === 0 || !item.qty) {
        item.qty = 1;
      }
      // Auto-select VAT if item has one
      item.vat_rate_id = selected.vat_rate_id ? Number(selected.vat_rate_id) : null;
    } else {
      item.item_id = null;
      item.description = '';
      item.rate = 0;
      item.vat_rate_id = null;
    }
    this.updateAmount(item);
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + (Number(item.rate) || 0) * (Number(item.qty) || 0), 0);
  }

  get totalDiscount(): number {
    if (this.quotationData.discountAt === 'Transaction Level') {
      const discount = Number(this.quotationData.transactionDiscount) || 0;
      if (this.quotationData.transactionDiscountType === '%') {
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
    const sub = this.subtotal;
    const totalDisc = this.totalDiscount;

    return this.items.reduce((sum, item) => {
      const rate = Number(item.rate) || 0;
      const qty = Number(item.qty) || 0;
      const base = rate * qty;
      
      const vatRateObj = this.vatOptions.find(v => v.id === Number(item.vat_rate_id));
      const vatPercent = vatRateObj ? Number(vatRateObj.rate) : 0;

      let taxableAmount = base;

      if (this.quotationData.discountAt === 'Transaction Level') {
        const proportionalDisc = sub > 0 ? (base / sub * totalDisc) : 0;
        taxableAmount = base - proportionalDisc;
      } else {
        const discAmt = item.discountType === '%' ? (base * (Number(item.discount) || 0) / 100) : (Number(item.discount) || 0);
        taxableAmount = base - discAmt;
      }

      return sum + (taxableAmount * vatPercent / 100);
    }, 0);
  }

  get grandTotal(): number {
    return this.subtotal - this.totalDiscount + this.totalVat;
  }

  updateAmount(item: QuotationItem): void {
    const rate = Number(item.rate) || 0;
    const qty = Number(item.qty) || 0;
    const base = rate * qty;
    
    let discAmt = 0;
    if (this.quotationData.discountAt === 'Line Item Level') {
      discAmt = item.discountType === '%' ? (base * (Number(item.discount) || 0) / 100) : (Number(item.discount) || 0);
    }
    
    const taxableAmount = base - discAmt;
    const vatRateObj = this.vatOptions.find(v => v.id === Number(item.vat_rate_id));
    const vatPercent = vatRateObj ? Number(vatRateObj.rate) : 0;
    
    item.amount = taxableAmount + (taxableAmount * vatPercent / 100);
  }

  addRow(): void {
    this.items.push({
      id: this.nextId++,
      item_id: null,
      name: '',
      description: '',
      rate: 0,
      qty: 0,
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

  // --- Bulk Add ---
  openBulkModal(): void {
    this.isBulkModalOpen = true;
    this.bulkSearchTerm = '';
    this.selectedBulkItems.clear();
  }

  closeBulkModal(): void {
    this.isBulkModalOpen = false;
  }

  get filteredBulkItems() {
    if (!this.bulkSearchTerm) return this.itemOptions;
    const term = this.bulkSearchTerm.toLowerCase();
    return this.itemOptions.filter(item => 
      item.name.toLowerCase().includes(term) || (item.item_code || '').toLowerCase().includes(term)
    );
  }

  toggleBulkItem(id: number): void {
    if (this.selectedBulkItems.has(id)) {
      this.selectedBulkItems.delete(id);
    } else {
      this.selectedBulkItems.add(id);
    }
  }

  addBulkItems(): void {
    this.items = this.items.filter(item => !!item.item_id);
    this.selectedBulkItems.forEach(id => {
      const product = this.itemOptions.find(p => p.id === id);
      if (!product) return;

      const newItem: QuotationItem = {
        id: this.nextId++,
        item_id: product.id,
        name: product.id.toString(),
        description: product.description || '',
        rate: Number(product.sales_rate) || 0,
        qty: 1,
        discount: 0,
        discountType: '%',
        vat_rate_id: product.vat_rate_id ? Number(product.vat_rate_id) : null,
        amount: 0
      };
      this.updateAmount(newItem);
      this.items.push(newItem);
    });

    if (this.items.length === 0) this.addRow();
    this.closeBulkModal();
  }

  openAttachmentsModal(): void {
    this.isAttachmentsModalOpen = true;
  }

  closeAttachmentsModal(): void {
    this.isAttachmentsModalOpen = false;
  }

  saveAsDraft(): void {
    this.save('Draft');
  }

  save(status: string = 'Sent'): void {
    if (!this.quotationData.customer_id) {
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
      quotation_number: this.quotationData.quotationNumber === 'Auto Generated' ? undefined : this.quotationData.quotationNumber,
      customer_id: Number(this.quotationData.customer_id),
      quotation_date: this.quotationData.quotationDate,
      expiry_date: this.quotationData.expiryDate || undefined,
      reference_number: this.quotationData.referenceNumber,
      sales_person_id: this.quotationData.salesPersonId ? Number(this.quotationData.salesPersonId) : undefined,
      currency_id: this.baseCurrencyId || undefined,
      status: status,
      discount_level: this.quotationData.discountAt,
      discount_amount: Number(this.quotationData.transactionDiscount) || 0,
      discount_type: this.quotationData.transactionDiscountType,
      sub_total: this.subtotal,
      total_discount: this.totalDiscount,
      total_vat: this.totalVat,
      grand_total: this.grandTotal,
      customer_notes: this.note,
      terms_and_conditions: this.termsAndConditions,
      save_note_for_future: this.saveNoteForFuture,
      save_terms_for_future: this.saveTermsForFuture,
      attachments: this.attachments,
      details: validItems.map(i => ({
          item_id: i.item_id as number,
          description: i.description,
          quantity: i.qty,
          rate: i.rate,
          discount_amount: i.discountType === '%' ? (i.rate * i.qty * i.discount / 100) : i.discount,
          vat_rate_id: i.vat_rate_id || undefined,
          line_total: i.amount
        }))
    };

    const action = this.isEditMode && this.editId 
      ? this.quotationsService.updateQuotation(this.editId, payload)
      : this.quotationsService.createQuotation(payload);

    action.subscribe({
      next: () => {
        this.notificationService.success(`Quotation ${this.isEditMode ? 'updated' : 'created'} successfully`);
        this.router.navigate(['/sales/quotations']);
      },
      error: () => {
        this.notificationService.error(`Failed to ${this.isEditMode ? 'update' : 'create'} quotation`);
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  preventNegative(event: KeyboardEvent) {
    if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }

  cancel(): void {
    this.router.navigate(['/sales/quotations']);
  }
}
