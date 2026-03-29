import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { CustomSelectComponent, SelectOption } from '../../../../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-create-account-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CustomSelectComponent],
  templateUrl: './create-account-modal.component.html',
  styleUrl: './create-account-modal.component.scss'
})
export class CreateAccountModalComponent {
  @Input() parentAccounts: SelectOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  formData = {
    type: '',
    name: '',
    addParent: false,
    parentId: '',
    description: ''
  };

  accountTypeOptions: SelectOption[] = [
    { label: 'Other Asset', value: 'Other Asset' },
    { label: 'Other Current Asset', value: 'Other Current Asset' },
    { label: 'Cash', value: 'Cash' },
    { label: 'Bank', value: 'Bank' },
    { label: 'Fixed Asset', value: 'Fixed Asset' },
    { label: 'Stock', value: 'Stock' },
    { label: 'Payment Clearing', value: 'Payment Clearing' },
    { label: 'Other Current Liability', value: 'Other Current Liability' },
    { label: 'Credit Card', value: 'Credit Card' },
    { label: 'Long Term Liability', value: 'Long Term Liability' },
    { label: 'Other Liability', value: 'Other Liability' },
    { label: 'Overseas Tax Payable', value: 'Overseas Tax Payable' },
    { label: 'Equity', value: 'Equity' },
    { label: 'Income', value: 'Income' },
    { label: 'Other Income', value: 'Other Income' },
    { label: 'Expense', value: 'Expense' },
    { label: 'Cost of Goods Sold', value: 'Cost of Goods Sold' },
    { label: 'Other Expense', value: 'Other Expense' }
  ];

  closeModal(event?: Event) {
    if (event && event.target !== event.currentTarget) return;
    this.close.emit();
  }

  onSave() {
    if (this.formData.type && this.formData.name) {
      this.save.emit(this.formData);
      this.closeModal();
    }
  }
}
