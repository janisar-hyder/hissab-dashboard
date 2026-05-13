import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';
import { DeliveryNotesService } from '../services/delivery-notes.service';

interface DeliveryNoteItem {
  id?: number;
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
  selector: 'app-delivery-notes-new',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BreadcrumbsComponent, AttachmentsModal, CustomSelectComponent],
  templateUrl: './delivery-notes-new.html',
  styleUrl: './delivery-notes-new.scss',
})
export class DeliveryNotesNewComponent implements OnInit {
  isAttachmentsModalOpen = false;
  isEditMode = false;
  deliveryNoteId: string | null = null;
  isLoading = false;

  deliveryNoteData = {
    customer: null as any,
    deliveryNoteNumber: '',
    deliveryNoteDate: '',
    referenceNumber: '',
    discountAt: 'Line Item Level',
    transactionDiscount: null as any,
    transactionDiscountType: '%' as '%' | 'flat',
  };

  note = '';
  termsAndConditions = '';
  saveNoteForFuture = false;
  saveTermsForFuture = false;

  items: DeliveryNoteItem[] = [
    {
      item_id: null,
      name: '',
      description: '',
      rate: null as any,
      qty: 1,
      discount: null as any,
      discountType: '%',
      vat_rate_id: null,
      amount: 0,
    }
  ];

  inventoryItems: any[] = [];
  itemSelectOptions: SelectOption[] = [];
  customerOptions: SelectOption[] = [];
  vatSelectOptions: SelectOption[] = [];

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

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private deliveryNotesService: DeliveryNotesService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.deliveryNoteId = params['id'];
        this.loadDeliveryNote(params['id']);
      } else {
        const today = new Date().toISOString().split('T')[0];
        this.deliveryNoteData.deliveryNoteDate = today;
        this.loadNextNumber();
      }
    });
  }

  loadInitialData(): void {
    this.deliveryNotesService.getCustomers().subscribe(res => {
      this.customerOptions = (res.data || []).map((c: any) => ({ label: c.name, value: c.id }));
    });

    this.deliveryNotesService.getItems().subscribe(res => {
      this.inventoryItems = res.data || [];
      this.itemSelectOptions = this.inventoryItems.map((item: any) => ({
        label: item.name,
        value: item.id
      }));
    });

    this.deliveryNotesService.getVatRates().subscribe(res => {
      this.vatSelectOptions = (res.data || []).map((v: any) => ({ 
        label: `${v.name} (${v.rate}%)`, 
        value: v.id,
        rate: v.rate 
      }));
    });

    this.deliveryNotesService.getSettings('delivery-notes').subscribe(res => {
      if (res.data) {
        if (!this.isEditMode) {
          this.note = res.data.default_note || '';
          this.termsAndConditions = res.data.default_terms || '';
        }
      }
    });
  }

  loadNextNumber(): void {
    this.deliveryNotesService.getDeliveryNotes().subscribe(res => {
      const notes = res.data || [];
      const nextNum = notes.length + 1;
      this.deliveryNoteData.deliveryNoteNumber = `DN-${nextNum.toString().padStart(3, '0')}`;
    });
  }

  loadDeliveryNote(id: string): void {
    this.isLoading = true;
    this.deliveryNotesService.getDeliveryNoteById(id).subscribe({
      next: (res) => {
        const data = res.data;
        this.deliveryNoteData = {
          customer: data.customer_id ? Number(data.customer_id) : null,
          deliveryNoteNumber: data.delivery_note_number,
          deliveryNoteDate: data.delivery_date ? data.delivery_date.split('T')[0] : new Date().toISOString().split('T')[0],
          referenceNumber: data.reference_number || '',
          discountAt: data.discount_level || 'Line Item Level',
          transactionDiscount: Number(data.discount_amount) || 0,
          transactionDiscountType: data.discount_type as any || '%',
        };
        this.note = data.notes || '';
        this.termsAndConditions = data.terms_and_conditions || '';
        
        this.items = (data.details || []).map((d: any) => ({
          id: d.id ? Number(d.id) : undefined,
          item_id: d.item_id ? Number(d.item_id) : null,
          name: d.item?.name || '',
          description: d.description || '',
          rate: Number(d.rate) || 0,
          qty: Number(d.quantity) || 0,
          discount: Number(d.discount_amount) || 0,
          discountType: d.discount_type || '%',
          vat_rate_id: d.vat_rate_id ? Number(d.vat_rate_id) : null,
          amount: Number(d.line_total) || 0
        }));
        
        if (this.items.length === 0) this.addRow();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading delivery note:', err);
        this.isLoading = false;
      }
    });
  }

  onItemSelect(item: DeliveryNoteItem): void {
    const selected = this.inventoryItems.find(i => i.id === item.item_id);
    if (selected) {
      item.name = selected.name;
      item.description = selected.description || '';
      item.rate = Number(selected.sales_rate) || 0;
      if (item.qty === 0) item.qty = 1;
    }
    this.updateAmount(item);
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + (Number(item.rate) || 0) * (Number(item.qty) || 0), 0);
  }

  get totalDiscount(): number {
    if (this.deliveryNoteData.discountAt === 'Transaction Level') {
      const discount = Number(this.deliveryNoteData.transactionDiscount) || 0;
      if (this.deliveryNoteData.transactionDiscountType === '%') {
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
      const vatRateObj = this.vatSelectOptions.find(v => v.value === item.vat_rate_id);
      const vatPercent = vatRateObj ? (vatRateObj as any).rate : 0;
      
      const rate = Number(item.rate) || 0;
      const qty = Number(item.qty) || 0;
      const base = rate * qty;
      
      let discounted = base;
      if (this.deliveryNoteData.discountAt === 'Transaction Level') {
        const totalDisc = this.totalDiscount;
        const sub = this.subtotal;
        const proportionalDisc = sub > 0 ? (base / sub * totalDisc) : 0;
        discounted = base - proportionalDisc;
      } else {
        const discount = Number(item.discount) || 0;
        const discAmt = item.discountType === '%' ? (base * discount / 100) : discount;
        discounted = base - discAmt;
      }
      
      return sum + (discounted * vatPercent / 100);
    }, 0);
  }

  get grandTotal(): number {
    return this.subtotal - this.totalDiscount + this.totalVat;
  }

  updateAmount(item: DeliveryNoteItem): void {
    const rate = Number(item.rate) || 0;
    const qty = Number(item.qty) || 0;
    const base = rate * qty;
    
    let discounted = base;
    if (this.deliveryNoteData.discountAt === 'Line Item Level') {
      const discount = Number(item.discount) || 0;
      const discAmt = item.discountType === '%' ? base * discount / 100 : discount;
      discounted = base - discAmt;
    }

    const vatRateObj = this.vatSelectOptions.find(v => v.value === item.vat_rate_id);
    const vatPercent = vatRateObj ? (vatRateObj as any).rate : 0;
    
    item.amount = discounted + (discounted * vatPercent / 100);
  }

  addRow(): void {
    this.items.push({
      item_id: null,
      name: '',
      description: '',
      rate: 0,
      qty: 1,
      discount: 0,
      discountType: '%',
      vat_rate_id: null,
      amount: 0,
    });
  }

  removeRow(index: number): void {
    if (this.items.length > 1) {
      this.items.splice(index, 1);
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
    if (!this.bulkSearchTerm) return this.inventoryItems;
    const term = this.bulkSearchTerm.toLowerCase();
    return this.inventoryItems.filter(item => item.name.toLowerCase().includes(term));
  }

  toggleBulkItem(id: number): void {
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
      const product = this.inventoryItems.find(p => p.id === id);
      if (!product) return;

      const newItem: DeliveryNoteItem = {
        item_id: product.id,
        name: product.name,
        description: product.description || '',
        rate: Number(product.sales_rate) || 0,
        qty: 1,
        discount: 0,
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

  getPayload(status: string) {
    return {
      customer_id: this.deliveryNoteData.customer,
      delivery_note_number: this.deliveryNoteData.deliveryNoteNumber,
      delivery_date: this.deliveryNoteData.deliveryNoteDate,
      reference_number: this.deliveryNoteData.referenceNumber,
      status: status,
      discount_level: this.deliveryNoteData.discountAt,
      discount_amount: this.deliveryNoteData.transactionDiscount,
      discount_type: this.deliveryNoteData.transactionDiscountType,
      sub_total: this.subtotal,
      total_vat: this.totalVat,
      grand_total: this.grandTotal,
      notes: this.note,
      terms_and_conditions: this.termsAndConditions,
      save_note: this.saveNoteForFuture,
      save_terms: this.saveTermsForFuture,
      details: this.items.filter(i => i.item_id).map(i => ({
        item_id: i.item_id,
        description: i.description,
        quantity: i.qty,
        rate: i.rate,
        discount_amount: i.discount,
        discount_type: i.discountType,
        vat_rate_id: i.vat_rate_id,
        line_total: i.amount
      }))
    };
  }

  saveAsDraft(): void {
    this.submit('Draft');
  }

  save(): void {
    this.submit('Sent');
  }

  submit(status: string): void {
    if (!this.deliveryNoteData.customer || !this.deliveryNoteData.deliveryNoteNumber || !this.deliveryNoteData.deliveryNoteDate) {
      alert('Please fill in all required fields.');
      return;
    }

    const payload = this.getPayload(status);
    
    if (this.isEditMode && this.deliveryNoteId) {
      this.deliveryNotesService.updateDeliveryNote(this.deliveryNoteId, payload).subscribe({
        next: () => this.router.navigate(['/sales/delivery-notes']),
        error: (err) => console.error('Error updating delivery note:', err)
      });
    } else {
      this.deliveryNotesService.createDeliveryNote(payload).subscribe({
        next: () => this.router.navigate(['/sales/delivery-notes']),
        error: (err) => console.error('Error creating delivery note:', err)
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/sales/delivery-notes']);
  }
}
