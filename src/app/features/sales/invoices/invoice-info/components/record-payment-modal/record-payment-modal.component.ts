import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-record-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './record-payment-modal.component.html',
  styleUrl: './record-payment-modal.component.scss'
})
export class RecordPaymentModalComponent implements OnInit {
  @Input() customerName: string = '';
  @Input() totalAmount: number = 0;
  @Input() invoiceNumber: string = '';
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  formData = {
    customerName: '',
    receiptNumber: 'RC-003',
    amountReceived: 0,
    bankCharges: '',
    paymentDate: '',
    paymentMode: '',
    depositTo: '',
    reference: '',
    notes: '',
    attachFile: null as File | null
  };

  paymentModes = ['Cash', 'Bank Transfer', 'Cheque'];
  accounts = ['Select Account', 'Main Account', 'Savings Account', 'Petty Cash'];

  ngOnInit() {
    this.formData.customerName = this.customerName;
    this.formData.amountReceived = this.totalAmount;
    // Set today's date in YYYY-MM-DD format
    const today = new Date();
    this.formData.paymentDate = today.toISOString().split('T')[0];
  }

  closeModal() {
    this.close.emit();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.formData.attachFile = file;
    }
  }

  onSave() {
    // Basic validation
    if (this.formData.amountReceived > 0 && this.formData.paymentMode && this.formData.depositTo) {
      this.save.emit(this.formData);
    }
  }
}
