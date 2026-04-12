import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-add-vat-rate-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './add-vat-rate-modal.component.html',
  styleUrls: ['./add-vat-rate-modal.component.scss']
})
export class AddVatRateModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  vatRate = {
    name: '',
    rate: null
  };

  onSave() {
    if (this.vatRate.name.trim() && this.vatRate.rate !== null) {
      this.save.emit(this.vatRate);
      this.close.emit();
    }
  }

  onCancel() {
    this.close.emit();
  }
}
