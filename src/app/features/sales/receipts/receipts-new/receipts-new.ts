import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { DropdownService } from '../../../../shared/services/dropdown.service';

export interface UnpaidInvoice {
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

  receiptData = {
    receiptNumber: 'RC-001',
    customer: '',
    referenceNumber: '',
    amountReceived: null as any,
    paymentDate: '',
    paymentMode: '',
    depositTo: '',
    bankCharges: 0.000,
    notes: ''
  };

  customerOptions: SelectOption[] = [
    { label: 'ABCO HVACR Supply', value: 'ABCO HVACR Supply' },
    { label: 'The Habegger Corp', value: 'The Habegger Corp' },
    { label: 'Sigler Wholesale', value: 'Sigler Wholesale' }
  ];

  paymentModeOptions: SelectOption[] = [
    { label: 'Cash', value: 'Cash' },
    { label: 'Cheque', value: 'Cheque' },
    { label: 'Bank Transfer', value: 'Bank Transfer' },
    { label: 'Credit Card', value: 'Credit Card' }
  ];

  depositToOptions: SelectOption[] = [
    { label: 'Petty Cash', value: 'Petty Cash' },
    { label: 'Undeposited Funds', value: 'Undeposited Funds' },
    { label: 'Standard Chartered Bank', value: 'Standard Chartered Bank' }
  ];

  unpaidInvoices: UnpaidInvoice[] = [];
  private dropdownSub: Subscription;

  constructor(private router: Router, private dropdownService: DropdownService) {
    this.dropdownSub = this.dropdownService.openDropdown$.subscribe(() => {
      // Logic for coordinating dropdowns if needed, handled in component
    });
  }

  onCustomerChange(): void {
    if (this.receiptData.customer === 'The Habegger Corp') {
      this.unpaidInvoices = [
        { date: '17 Jan 2026', number: 'INV-005', amount: 1000.000, due: 1000.000, paid: 0, isFull: false },
        { date: '04 Jan 2026', number: 'INV-002', amount: 250.000, due: 250.000, paid: 0, isFull: false }
      ];
    } else if (this.receiptData.customer) {
      this.unpaidInvoices = [
        { date: '10 Feb 2026', number: 'INV-010', amount: 500.000, due: 500.000, paid: 0, isFull: false }
      ];
    } else {
      this.unpaidInvoices = [];
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
    console.log('Saving receipt...', this.receiptData, this.unpaidInvoices);
    this.router.navigate(['/sales/receipts']);
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
