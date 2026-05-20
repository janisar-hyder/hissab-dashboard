import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';
import { InvoicesService } from '../services/invoices.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { SalesSettingsService } from '../../../settings/services/sales-settings.service';

interface InvoiceItem {
  id: number;
  item_id: number | null;
  description: string;
  rate: number;
  qty: number;
  discount: number;
  discountType: '%' | 'flat';
  vat_rate_id: number | null;
  amount: number;
}

@Component({
  selector: 'app-invoices-new',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BreadcrumbsComponent, AttachmentsModal, CustomSelectComponent],
  templateUrl: './invoices-new.html',
  styleUrl: './invoices-new.scss',
})
export class InvoicesNew implements OnInit {
  isAttachmentsModalOpen = false;
  activeTab: 'Invoice Information' | 'Commission' = 'Invoice Information';
  isEditMode = false;
  editId: number | null = null;
  isSaving = false;

  invoiceData = {
    customer_id: null as any,
    invoiceNumber: 'Auto Generated',
    invoiceDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    paymentTerms: '',
    dueDate: '',
    salesPersonId: null as any,
    discountAt: 'Line Item Level',
    transactionDiscount: null as any,
    transactionDiscountType: '%' as '%' | 'flat',
  };

  commissionData = {
    salesPartnerId: null as any,
    commissionPercentage: null as any,
    commissionAmount: null as any,
  };

  note = '';
  termsAndConditions = '';
  attachments: any[] = [];
  saveNoteForFuture = false;
  saveTermsForFuture = false;

  items: InvoiceItem[] = [
    {
      id: 1,
      item_id: null,
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
  rawCustomers: any[] = [];
  selectedCustomer: any = null;
  baseCurrencyId: number | null = null;
  itemOptions: any[] = [];
  itemSelectOptions: SelectOption[] = [];
  salesPersonOptions: SelectOption[] = [];
  salesPartnerOptions: SelectOption[] = [];
  vatOptions: any[] = [];
  vatSelectOptions: SelectOption[] = [];

  paymentTermsSelectOptions: SelectOption[] = [
    { label: 'Due on Receipt', value: '' },
    { label: 'Net 15', value: 'Net 15' },
    { label: 'Net 30', value: 'Net 30' },
    { label: 'Net 45', value: 'Net 45' },
    { label: 'Net 60', value: 'Net 60' },
    { label: 'Due end of the month', value: 'Due end of the month' },
    { label: 'Due end of next month', value: 'Due end of next month' },
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
  selectedBulkItems = new Set<string>();

  nextId = 2;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private invoicesService: InvoicesService,
    private notificationService: NotificationService,
    private salesSettingsService: SalesSettingsService
  ) {}

  ngOnInit(): void {
    this.loadDropdownData();
    this.checkEditMode();
  }

  checkEditMode(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.editId = parseInt(id);
      this.loadInvoiceDetails(this.editId);
    } else {
      this.loadDefaultSettings();
    }
  }

  loadDefaultSettings() {
    this.salesSettingsService.getSettings('invoice').subscribe({
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
    this.invoicesService.getCustomers().subscribe(res => {
      this.rawCustomers = res.data;
      this.customerOptions = res.data.map((c: any) => ({ label: c.name, value: c.id.toString() }));
      if (this.invoiceData.customer_id) {
        this.onCustomerChange();
      }
      this.cdr.detectChanges();
    });

    this.invoicesService.getItems().subscribe(res => {
      this.itemOptions = res.data;
      this.itemSelectOptions = res.data.map((i: any) => ({ label: i.name, value: i.id.toString() }));
      this.cdr.detectChanges();
    });

    this.invoicesService.getCurrencies().subscribe(res => {
      const currencies = res.data;
      // Find the base currency (is_base=true or code BHD)
      const baseCurrency = currencies.find((c: any) => c.is_base) || currencies.find((c: any) => c.code === 'BHD');
      if (baseCurrency) {
        this.baseCurrencyId = baseCurrency.id;
      } else if (currencies.length > 0) {
        this.baseCurrencyId = currencies[0].id;
      }
      this.cdr.detectChanges();
    });

    this.invoicesService.getSalesPersons().subscribe(res => {
      this.salesPersonOptions = res.data.map((s: any) => ({ label: s.name, value: s.id.toString() }));
      this.cdr.detectChanges();
    });

    this.invoicesService.getSalesPartners().subscribe(res => {
      this.salesPartnerOptions = res.data.map((s: any) => ({ label: s.name, value: s.id.toString() }));
      this.cdr.detectChanges();
    });

    this.invoicesService.getVatRates().subscribe(res => {
      this.vatOptions = res.data;
      this.vatSelectOptions = [
        { label: 'Select VAT', value: null },
        ...res.data.map((v: any) => ({ label: `${v.name} (${v.rate}%)`, value: v.id.toString() }))
      ];
      this.cdr.detectChanges();
    });
  }

  onCustomerChange(): void {
    const customerId = this.invoiceData.customer_id;
    if (customerId) {
      this.selectedCustomer = this.rawCustomers.find(c => c.id.toString() === customerId.toString()) || null;
    } else {
      this.selectedCustomer = null;
    }
  }

  loadInvoiceDetails(id: number) {
    this.invoicesService.getInvoiceById(id).subscribe({
      next: (res) => {
        const inv = res.data;
        this.invoiceData = {
          customer_id: inv.customer_id.toString(),
          invoiceNumber: inv.invoice_number,
          invoiceDate: inv.invoice_date.split('T')[0],
          referenceNumber: inv.reference_number || '',
          paymentTerms: inv.payment_terms || '',
          dueDate: inv.due_date ? inv.due_date.split('T')[0] : '',
          salesPersonId: inv.sales_person_id?.toString() || '',
          discountAt: inv.discount_level || 'Line Item Level',
          transactionDiscount: inv.discount_amount,
          transactionDiscountType: inv.discount_type as '%' | 'flat' || '%',
        };

        this.commissionData = {
          salesPartnerId: inv.sales_partner_id?.toString() || '',
          commissionPercentage: inv.commission_percentage ? Number(inv.commission_percentage) : null,
          commissionAmount: inv.commission_amount ? Number(inv.commission_amount) : null,
        };

        if (inv.currency_id) {
          this.baseCurrencyId = inv.currency_id;
        }

        this.onCustomerChange();

        this.note = inv.customer_notes || '';
        this.termsAndConditions = inv.terms_and_conditions || '';
        this.attachments = inv.attachments || [];

        if (inv.details && inv.details.length > 0) {
          this.items = inv.details.map((d: any, index: number) => {
            const item: InvoiceItem = {
              id: index + 1,
              item_id: d.item_id?.toString() || null,
              description: d.description || '',
              rate: Number(d.rate) || 0,
              qty: Number(d.quantity) || 0,
              discount: Number(d.discount_amount) || 0,
              discountType: '%',
              vat_rate_id: d.vat_rate_id?.toString() || null,
              amount: Number(d.line_total) || 0,
            };
            return item;
          });
          this.nextId = this.items.length + 1;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Failed to load invoice details');
        this.router.navigate(['/sales/invoices']);
      }
    });
  }

  setActiveTab(tab: 'Invoice Information' | 'Commission'): void {
    this.activeTab = tab;
  }

  onItemSelect(item: InvoiceItem): void {
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

  get grandTotal(): number {
    return this.subtotal - this.totalDiscount + this.totalVat;
  }

  get hasSelectedItems(): boolean {
    return this.items.some(item => item.item_id != null);
  }

  getVatRateById(vatRateId: any): number {
    if (!vatRateId) return 0;
    const vat = this.vatOptions.find(v => v.id.toString() === vatRateId.toString());
    return vat ? Number(vat.rate) : 0;
  }

  updateAmount(item: InvoiceItem): void {
    const rate = Number(item.rate) || 0;
    const qty = Number(item.qty) || 0;
    const discount = this.invoiceData.discountAt === 'Line Item Level' ? (Number(item.discount) || 0) : 0;
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

      const newItem: InvoiceItem = {
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

  save(status: string = 'Sent'): void {
    if (!this.invoiceData.customer_id) {
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
      invoice_number: this.invoiceData.invoiceNumber === 'Auto Generated' ? undefined : this.invoiceData.invoiceNumber,
      customer_id: parseInt(this.invoiceData.customer_id),
      invoice_date: this.invoiceData.invoiceDate,
      due_date: this.invoiceData.dueDate,
      reference_number: this.invoiceData.referenceNumber,
      sales_person_id: this.invoiceData.salesPersonId ? parseInt(this.invoiceData.salesPersonId) : undefined,
      currency_id: this.baseCurrencyId || undefined,
      sales_partner_id: this.commissionData.salesPartnerId ? parseInt(this.commissionData.salesPartnerId) : undefined,
      commission_percentage: this.commissionData.commissionPercentage,
      commission_amount: this.commissionData.commissionAmount,
      status: status,
      discount_level: this.invoiceData.discountAt,
      discount_amount: this.invoiceData.transactionDiscount,
      discount_type: this.invoiceData.transactionDiscountType,
      sub_total: this.subtotal,
      total_discount: this.totalDiscount,
      total_vat: this.totalVat,
      grand_total: this.grandTotal,
      customer_notes: this.note,
      terms_and_conditions: this.termsAndConditions,
      save_note_for_future: this.saveNoteForFuture,
      save_terms_for_future: this.saveTermsForFuture,
      attachments: this.attachments,
      details: validItems.map(item => ({
        item_id: item.item_id as number,
        description: item.description,
        quantity: item.qty,
        rate: item.rate,
        discount_amount: item.discountType === '%' ? (item.rate * item.qty * item.discount / 100) : item.discount,
        vat_rate_id: item.vat_rate_id || undefined,
        line_total: item.amount
      }))
    };

    const apiCall = this.isEditMode
      ? this.invoicesService.updateInvoice(this.editId!, payload)
      : this.invoicesService.createInvoice(payload);

    apiCall.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEditMode ? 'Invoice updated successfully' : 'Invoice created successfully'
        );
        this.isSaving = false;
        this.router.navigate(['/sales/invoices']);
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to save invoice');
        this.isSaving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/sales/invoices']);
  }
}
