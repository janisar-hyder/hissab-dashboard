import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-record-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './record-payment-modal.component.html',
  styleUrl: './record-payment-modal.component.scss'
})
export class RecordPaymentModalComponent implements OnInit {
  @Input() vendorName: string = '';
  @Input() totalAmount: number = 0;
  @Input() billNumber: string = '';
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  formData = {
    vendorName: '',
    paymentNumber: '003',
    paymentMade: 0,
    bankCharges: '',
    paymentDate: '',
    paymentMode: '',
    paidThrough: '',
    reference: '',
    notes: '',
    attachFile: null as File | null
  };

  paymentModes = ['Cash', 'Bank Transfer', 'Cheque'];
  accounts = ['Select Account', 'Main Account', 'Savings Account', 'Petty Cash'];

  ngOnInit() {
    this.formData.vendorName = this.vendorName;
    this.formData.paymentMade = this.totalAmount;
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
    if (this.formData.paymentMade > 0 && this.formData.paymentMode && this.formData.paidThrough) {
      this.save.emit(this.formData);
    }
  }
}
