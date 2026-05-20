import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { ReceiptsService } from '../services/receipts.service';
import { DropdownService } from '../../../../shared/services/dropdown.service';
import { NotificationService } from '../../../../shared/services/notification.service';

export interface UnpaidInvoice {
  id: number;
  date: string;
  number: string;
  amount: number;
  due: number;
  paid: number;
  isFull: boolean;
}

@Component({
  selector: 'app-receipts-new',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BreadcrumbsComponent, CustomSelectComponent, AttachmentsModal],
  templateUrl: 'receipts-new.html',
  styleUrl: 'receipts-new.scss',
})
export class ReceiptsNew implements OnDestroy {
  isAttachmentsModalOpen = false;
  attachments: any[] = [];
  isEditMode = false;
  receiptId: string | null = null;

  receiptData = {
    receiptNumber: 'Auto Generated',
    customer: null as any,
    referenceNumber: '',
    amountReceived: null as any,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash',
    depositTo: null as any,
    bankCharges: 0.000,
    notes: ''
  };

  customerOptions: SelectOption[] = [];

  paymentModeOptions: SelectOption[] = [
    { label: 'Cash', value: 'Cash' },
    { label: 'Cheque', value: 'Cheque' },
    { label: 'Bank Transfer', value: 'Bank Transfer' },
    { label: 'Credit Card', value: 'Credit Card' }
  ];

  depositToOptions: SelectOption[] = [];

  unpaidInvoices: UnpaidInvoice[] = [];
  private dropdownSub: Subscription;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private dropdownService: DropdownService,
    private receiptsService: ReceiptsService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.dropdownSub = this.dropdownService.openDropdown$.subscribe(() => {
      // Logic for coordinating dropdowns if needed
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.receiptId = params['id'];
      }
      this.loadInitialData();
    });
  }

  loadInitialData(): void {
    // 1. Get Customers
    this.receiptsService.getCustomers().subscribe(res => {
      this.customerOptions = (res.data || []).map((c: any) => ({ label: c.name, value: c.id }));
      this.cdr.detectChanges();
    });

    // 2. Get Deposit Accounts (Chart of Accounts)
    this.receiptsService.getAccounts().subscribe(res => {
      this.depositToOptions = (res.data || [])
        .map((acc: any) => ({ label: acc.name, value: acc.id }));
      this.cdr.detectChanges();
    });

    // 3. Load Receipt if editing
    if (this.isEditMode) {
      this.loadReceiptForEdit();
    }
  }

  loadReceiptForEdit(): void {
    if (!this.receiptId) return;
    
    this.receiptsService.getReceiptById(this.receiptId).subscribe({
      next: (res) => {
        const data = res.data;
        this.receiptData = {
          receiptNumber: data.receipt_number,
          customer: data.customer_id,
          referenceNumber: data.reference_number || '',
          amountReceived: data.amount_received,
          paymentDate: new Date(data.receipt_date).toISOString().split('T')[0],
          paymentMode: data.payment_mode,
          depositTo: data.deposit_to_id,
          bankCharges: Number(data.bank_charges) || 0,
          notes: data.notes || ''
        };
        this.attachments = data.attachments || [];

        // Load invoices for this customer to show applications
        this.receiptsService.getInvoices(data.customer_id).subscribe(invRes => {
          const invoices = invRes.data || [];
          this.unpaidInvoices = invoices.map((inv: any) => {
            const application = (data.applications || []).find((a: any) => a.invoice_id === inv.id);
            return {
              id: inv.id,
              date: new Date(inv.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              number: inv.invoice_number,
              amount: Number(inv.grand_total),
              due: Number(inv.balance_due) + (application ? Number(application.amount_applied) : 0),
              paid: application ? Number(application.amount_applied) : 0,
              isFull: application ? (Number(application.amount_applied) >= Number(inv.balance_due)) : false
            };
          });
          this.cdr.detectChanges();
        });
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading receipt for edit:', err)
    });
  }



  onCustomerChange(): void {
    if (this.receiptData.customer) {
      this.receiptsService.getInvoices(this.receiptData.customer).subscribe(res => {
        this.unpaidInvoices = (res.data || []).map((inv: any) => ({
          id: inv.id,
          date: new Date(inv.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          number: inv.invoice_number,
          amount: Number(inv.grand_total),
          due: Number(inv.balance_due),
          paid: 0,
          isFull: false
        }));
        this.cdr.detectChanges();
      });
    } else {
      this.unpaidInvoices = [];
      this.cdr.detectChanges();
    }
  }

  toggleFullPayment(invoice: UnpaidInvoice): void {
    if (invoice.isFull) {
      invoice.paid = invoice.due;
    } else {
      invoice.paid = 0;
    }
  }

  onPaidAmountChange(invoice: UnpaidInvoice): void {
    invoice.isFull = invoice.paid >= invoice.due;
  }

  clearAppliedAmount(): void {
    this.unpaidInvoices.forEach(inv => {
      inv.paid = 0;
      inv.isFull = false;
    });
  }

  get totalApplied(): number {
    return this.unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.paid) || 0), 0);
  }

  get amountReceived(): number {
    return Number(this.receiptData.amountReceived) || 0;
  }

  get amountUsedForPayments(): number {
    return this.totalApplied;
  }

  get amountInExcess(): number {
    const excess = this.amountReceived - this.amountUsedForPayments;
    return excess > 0 ? excess : 0;
  }

  openAttachmentsModal(): void {
    this.isAttachmentsModalOpen = true;
  }

  closeAttachmentsModal(): void {
    this.isAttachmentsModalOpen = false;
  }

  save(): void {
    const payload = {
      receipt_number: this.receiptData.receiptNumber === 'Auto Generated' ? undefined : this.receiptData.receiptNumber,
      customer_id: Number(this.receiptData.customer),
      reference_number: this.receiptData.referenceNumber,
      amount_received: Number(this.receiptData.amountReceived),
      receipt_date: this.receiptData.paymentDate,
      payment_mode: this.receiptData.paymentMode,
      deposit_to_id: Number(this.receiptData.depositTo),
      bank_charges: Number(this.receiptData.bankCharges),
      notes: this.receiptData.notes,
      attachments: this.attachments,
      applications: this.unpaidInvoices
        .filter(inv => inv.paid > 0)
        .map(inv => ({
          invoice_id: inv.id,
          amount_applied: Number(inv.paid)
        }))
    };

    if (!payload.customer_id || !payload.amount_received || !payload.deposit_to_id) {
      this.notificationService.error('Please fill all required fields');
      return;
    }

    if (this.isEditMode && this.receiptId) {
      this.receiptsService.updateReceipt(this.receiptId, payload).subscribe({
        next: () => {
          this.notificationService.success('Receipt updated successfully');
          this.router.navigate(['/sales/receipts']);
        },
        error: (err: any) => {
          console.error('Error updating receipt:', err);
          this.notificationService.error('Error updating receipt');
        }
      });
    } else {
      this.receiptsService.createReceipt(payload).subscribe({
        next: () => {
          this.notificationService.success('Receipt created successfully');
          this.router.navigate(['/sales/receipts']);
        },
        error: (err: any) => {
          console.error('Error saving receipt:', err);
          this.notificationService.error('Error saving receipt');
        }
      });
    }
  }

  preventNegative(event: KeyboardEvent) {
    if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }

  cancel(): void {
    this.router.navigate(['/sales/receipts']);
  }

  ngOnDestroy(): void {
    if (this.dropdownSub) {
      this.dropdownSub.unsubscribe();
    }
  }
}
