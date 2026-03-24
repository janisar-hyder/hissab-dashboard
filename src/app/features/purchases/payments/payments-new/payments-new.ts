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

export interface UnpaidBill {
  date: string;
  number: string;
  amount: number;
  due: number;
  paid: number;
  isFull: boolean;
}

@Component({
  selector: 'app-payments-new',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BreadcrumbsComponent, CustomSelectComponent, AttachmentsModal],
  templateUrl: 'payments-new.html',
  styleUrl: 'payments-new.scss',
})
export class PaymentsNew implements OnDestroy {
  isAttachmentsModalOpen = false;

  paymentData = {
    paymentNumber: '001',
    vendor: '',
    referenceNumber: '',
    amountPaid: null as any,
    paymentDate: '',
    paymentMode: '',
    paidThrough: '',
    notes: ''
  };

  vendorOptions: SelectOption[] = [
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

  paidThroughOptions: SelectOption[] = [
    { label: 'Petty Cash', value: 'Petty Cash' },
    { label: 'Undeposited Funds', value: 'Undeposited Funds' },
    { label: 'Standard Chartered Bank', value: 'Standard Chartered Bank' }
  ];

  unpaidBills: UnpaidBill[] = [];
  private dropdownSub: Subscription;

  constructor(private router: Router, private dropdownService: DropdownService) {
    this.dropdownSub = this.dropdownService.openDropdown$.subscribe(() => {
    });
  }

  onVendorChange(): void {
    if (this.paymentData.vendor === 'The Habegger Corp') {
      this.unpaidBills = [
        { date: '17 Jan 2026', number: 'BL-005', amount: 1000.000, due: 1000.000, paid: 0, isFull: false },
        { date: '04 Jan 2026', number: 'BL-002', amount: 250.000, due: 250.000, paid: 0, isFull: false }
      ];
    } else if (this.paymentData.vendor) {
      this.unpaidBills = [
        { date: '10 Feb 2026', number: 'BL-010', amount: 500.000, due: 500.000, paid: 0, isFull: false }
      ];
    } else {
      this.unpaidBills = [];
    }
  }

  toggleFullPayment(bill: UnpaidBill): void {
    if (bill.isFull) {
      bill.paid = bill.due;
    } else {
      bill.paid = 0;
    }
  }

  onPaidAmountChange(bill: UnpaidBill): void {
    bill.isFull = bill.paid >= bill.due;
  }

  clearAppliedAmount(): void {
    this.unpaidBills.forEach(bill => {
      bill.paid = 0;
      bill.isFull = false;
    });
  }

  get totalApplied(): number {
    return this.unpaidBills.reduce((sum, bill) => sum + (Number(bill.paid) || 0), 0);
  }

  get amountPaid(): number {
    return Number(this.paymentData.amountPaid) || 0;
  }

  get amountUsedForPayments(): number {
    return this.totalApplied;
  }

  get amountInExcess(): number {
    const excess = this.amountPaid - this.amountUsedForPayments;
    return excess > 0 ? excess : 0;
  }

  openAttachmentsModal(): void {
    this.isAttachmentsModalOpen = true;
  }

  closeAttachmentsModal(): void {
    this.isAttachmentsModalOpen = false;
  }

  save(): void {
    console.log('Saving payment...', this.paymentData, this.unpaidBills);
    this.router.navigate(['/purchases/payments']);
  }

  cancel(): void {
    this.router.navigate(['/purchases/payments']);
  }

  ngOnDestroy(): void {
    if (this.dropdownSub) {
      this.dropdownSub.unsubscribe();
    }
  }
}
