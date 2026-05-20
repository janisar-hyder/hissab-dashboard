import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';
import { RecurringInvoicesService } from '../services/recurring-invoices.service';
import { forkJoin } from 'rxjs';



@Component({
  selector: 'app-recurring-invoices-new',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonComponent, BreadcrumbsComponent, AttachmentsModal, CustomSelectComponent],
  templateUrl: './recurring-invoices-new.component.html',
  styleUrl: './recurring-invoices-new.component.scss',
})
export class RecurringInvoicesNewComponent implements OnInit {
  isAttachmentsModalOpen = false;
  attachments: any[] = [];

  formData = {
    customer: null as any,
    profileName: '',
    paymentTerms: 'Due on Receipt',
    repeatEvery: 'Month',
    startsOn: '',
    endsOn: '',
    neverExpires: false,
    accounts_receivable_id: null as any,
    discountAt: 'Line Item Level',
    transactionDiscount: null as any,
    transactionDiscountType: '%' as '%' | 'flat',
  };

  note = '';
  termsAndConditions = '';
  saveNoteForFuture = false;
  saveTermsForFuture = false;

  items: any[] = [
    {
      id: 1,
      item_id: null as any,
      name: '',
      description: '',
      rate: 0,
      qty: 1,
      discount: 0,
      discountType: '%',
      vat_rate_id: null as any,
      line_total: 0,
    }
  ];

  realItems: any[] = [];
  customers: any[] = [];
  vatRates: any[] = [];
  isEditMode = false;
  recurringInvoiceId: string | null = null;
  isLoading = false;



  itemSelectOptions: SelectOption[] = [];
  customerOptions: SelectOption[] = [];
  paymentTermsOptions: SelectOption[] = [
    { label: 'Due on Receipt', value: 'Due on Receipt' },
    { label: 'Net 15', value: 'Net 15' },
    { label: 'Net 30', value: 'Net 30' },
    { label: 'Net 45', value: 'Net 45' },
    { label: 'Net 60', value: 'Net 60' }
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

  accountsReceivableOptions: SelectOption[] = [];

  discountAtOptions: SelectOption[] = [
    { label: 'Line Item Level', value: 'Line Item Level' },
    { label: 'Transaction Level', value: 'Transaction Level' }
  ];

  vatSelectOptions: SelectOption[] = [];

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
    private recurringInvoicesService: RecurringInvoicesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    
    const dependencies = {
      customers: this.recurringInvoicesService.getCustomers(),
      items: this.recurringInvoicesService.getItems(),
      vatRates: this.recurringInvoicesService.getVatRates(),
      accounts: this.recurringInvoicesService.getChartOfAccounts(),
      settings: this.recurringInvoicesService.getSettings('recurring-invoice')
    };

    forkJoin(dependencies).subscribe({
      next: (results: any) => {
        // 1. Process Dropdown Data
        this.customers = results.customers.data;
        this.customerOptions = this.customers.map(c => ({ label: c.name, value: Number(c.id) }));

        this.realItems = results.items.data;
        this.itemSelectOptions = this.realItems.map(i => ({ label: i.name, value: Number(i.id) }));

        this.vatRates = results.vatRates.data;
        this.vatSelectOptions = [
          { label: 'Select', value: null },
          ...this.vatRates.map(v => ({ label: `${v.name} (${v.rate}%)`, value: Number(v.id) }))
        ];

        if (results.accounts.success) {
          this.accountsReceivableOptions = results.accounts.data.map((acc: any) => ({
            label: acc.name,
            value: Number(acc.id)
          }));
        }

        // 2. Process Settings
        if (results.settings.data) {
          this.note = results.settings.data.default_note || '';
          this.termsAndConditions = results.settings.data.default_terms || '';
        }

        // 3. Load Invoice if Edit Mode
        this.recurringInvoiceId = this.route.snapshot.paramMap.get('id');
        if (this.recurringInvoiceId) {
          this.isEditMode = true;
          this.loadRecurringInvoice(this.recurringInvoiceId);
        } else {
          // Set default dates and accounts
          const today = new Date().toISOString().split('T')[0];
          this.formData.startsOn = today;
          
          if (!this.formData.accounts_receivable_id && this.accountsReceivableOptions.length > 0) {
            const arAcc = results.accounts.data.find((a: any) => a.type === 'Accounts Receivable' || a.name.includes('Receivable'));
            if (arAcc) this.formData.accounts_receivable_id = Number(arAcc.id);
            else this.formData.accounts_receivable_id = Number(this.accountsReceivableOptions[0].value);
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRecurringInvoice(id: string): void {
    this.isLoading = true;
    this.recurringInvoicesService.getRecurringInvoiceById(id).subscribe({
      next: (res) => {
        const data = res.data;
        this.formData = {
          customer: data.customer_id ? Number(data.customer_id) : null,
          profileName: data.profile_name,
          paymentTerms: data.payment_terms || 'Due on Receipt',
          repeatEvery: data.repeat_every,
          startsOn: data.starts_on ? new Date(data.starts_on).toISOString().split('T')[0] : '',
          endsOn: data.ends_on ? new Date(data.ends_on).toISOString().split('T')[0] : '',
          neverExpires: data.never_expires,
          accounts_receivable_id: data.accounts_receivable_id ? Number(data.accounts_receivable_id) : null,
          discountAt: data.discount_level || 'Line Item Level',
          transactionDiscount: data.discount_amount,
          transactionDiscountType: data.discount_type === 'Percentage' ? '%' : 'flat',
        };

        this.note = data.customer_notes;
        this.termsAndConditions = data.terms_and_conditions;
        this.attachments = data.attachments || [];

        this.items = data.details.map((d: any) => ({
          id: this.nextId++,
          item_id: d.item_id ? Number(d.item_id) : null,
          name: d.item?.name,
          description: d.description,
          rate: Number(d.rate) || 0,
          qty: Number(d.quantity) || 0,
          discount: Number(d.discount_amount) || 0,
          discountType: 'flat',
          vat_rate_id: d.vat_rate_id ? Number(d.vat_rate_id) : null,
          line_total: Number(d.line_total) || 0
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading recurring invoice:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onItemSelect(item: any): void {
    const selected = this.realItems.find(i => i.id === item.item_id);
    if (selected) {
      item.name = selected.name;
      item.description = selected.description;
      item.rate = Number(selected.selling_price) || 0;
      if (item.qty === 0) item.qty = 1;
    } else {
      item.name = '';
      item.description = '';
      item.rate = 0;
    }
    this.updateAmount(item);
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + (Number(item.rate) || 0) * (Number(item.qty) || 0), 0);
  }

  get totalDiscount(): number {
    if (this.formData.discountAt === 'Transaction Level') {
      const discount = Number(this.formData.transactionDiscount) || 0;
      if (this.formData.transactionDiscountType === '%') {
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
    return this.items.reduce((sum, item) => {
      const rate = Number(item.rate) || 0;
      const qty = Number(item.qty) || 0;
      const discount = Number(item.discount) || 0;
      const vatRateObj = this.vatRates.find(v => v.id === item.vat_rate_id);
      const vatPercent = vatRateObj ? Number(vatRateObj.rate) : 0;
      
      const base = rate * qty;
      const discAmt = item.discountType === '%' ? (base * discount / 100) : discount;
      const discounted = base - discAmt;
      return sum + (discounted * vatPercent / 100);
    }, 0);
  }

  get grandTotal(): number {
    return this.subtotal - this.totalDiscount + this.totalVat;
  }

  updateAmount(item: any): void {
    const rate = Number(item.rate) || 0;
    const qty = Number(item.qty) || 0;
    const discount = this.formData.discountAt === 'Line Item Level' ? (Number(item.discount) || 0) : 0;
    
    const vatRateObj = this.vatRates.find(v => v.id === item.vat_rate_id);
    const vatPercent = vatRateObj ? Number(vatRateObj.rate) : 0;

    const base = rate * qty;
    const discAmt = item.discountType === '%' ? base * discount / 100 : discount;
    const discounted = base - discAmt;
    item.line_total = discounted + (discounted * vatPercent / 100);
  }

  addRow(): void {
    this.items.push({
      id: this.nextId++,
      item_id: null,
      name: '',
      description: '',
      rate: 0,
      qty: 1,
      discount: 0,
      discountType: '%',
      vat_rate_id: null,
      line_total: 0,
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
    if (!this.bulkSearchTerm) return this.realItems;
    const term = this.bulkSearchTerm.toLowerCase();
    return this.realItems.filter(item => item.name.toLowerCase().includes(term));
  }

  toggleBulkItem(id: any): void {
    if (this.selectedBulkItems.has(id)) this.selectedBulkItems.delete(id);
    else this.selectedBulkItems.add(id);
  }

  toggleSelectAllBulk(event: any): void {
    const isChecked = event.target.checked;
    const filtered = this.filteredBulkItems;
    if (isChecked) filtered.forEach(item => this.selectedBulkItems.add(item.id));
    else filtered.forEach(item => this.selectedBulkItems.delete(item.id));
  }

  isAllFilteredSelected(): boolean {
    const filtered = this.filteredBulkItems;
    if (filtered.length === 0) return false;
    return filtered.every(item => this.selectedBulkItems.has(item.id));
  }

  addBulkItems(): void {
    this.items = this.items.filter(item => !!item.item_id);

    this.selectedBulkItems.forEach(id => {
      const product = this.realItems.find(p => p.id === id);
      if (!product) return;

      const newItem: any = {
        id: this.nextId++,
        item_id: product.id,
        name: product.name,
        description: product.description,
        rate: product.selling_price,
        qty: 1,
        discount: 0,
        discountType: '%',
        vat_rate_id: null,
        line_total: 0
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

  save(status: string = 'Active'): void {
    if (!this.formData.customer || !this.formData.profileName || this.items.length === 0) {
      alert('Profile name, Customer and at least one item are required');
      return;
    }

    const payload = {
      profile_name: this.formData.profileName,
      customer_id: this.formData.customer,
      repeat_every: this.formData.repeatEvery,
      starts_on: this.formData.startsOn,
      ends_on: this.formData.neverExpires ? null : this.formData.endsOn,
      never_expires: this.formData.neverExpires,
      status: status,
      payment_terms: this.formData.paymentTerms,
      accounts_receivable_id: this.formData.accounts_receivable_id,
      discount_level: this.formData.discountAt,
      discount_amount: this.formData.discountAt === 'Transaction Level' ? (Number(this.formData.transactionDiscount) || 0) : 0,
      discount_type: this.formData.discountAt === 'Transaction Level' ? (this.formData.transactionDiscountType === '%' ? 'Percentage' : 'Fixed') : 'Fixed',
      sub_total: this.subtotal,
      total_discount: this.totalDiscount,
      total_vat: this.totalVat,
      grand_total: this.grandTotal,
      customer_notes: this.note,
      terms_and_conditions: this.termsAndConditions,
      save_note_for_future: this.saveNoteForFuture,
      save_terms_for_future: this.saveTermsForFuture,
      attachments: this.attachments,
      details: this.items.map(item => ({
        item_id: item.item_id,
        quantity: item.qty,
        rate: item.rate,
        discount_amount: item.discount || 0,
        vat_rate_id: item.vat_rate_id,
        line_total: item.line_total,
        description: item.description
      }))
    };

    if (this.isEditMode && this.recurringInvoiceId) {
      this.recurringInvoicesService.updateRecurringInvoice(this.recurringInvoiceId, payload).subscribe({
        next: () => this.router.navigate(['/sales/recurring-invoices']),
        error: (err) => console.error('Error updating recurring invoice:', err)
      });
    } else {
      this.recurringInvoicesService.createRecurringInvoice(payload).subscribe({
        next: () => this.router.navigate(['/sales/recurring-invoices']),
        error: (err) => console.error('Error creating recurring invoice:', err)
      });
    }
  }

  preventNegative(event: KeyboardEvent) {
    if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }

  cancel(): void {
    this.router.navigate(['/sales/recurring-invoices']);
  }
}
