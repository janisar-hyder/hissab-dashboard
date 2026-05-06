import { Component, EventEmitter, Output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-add-vat-rate-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './add-vat-rate-modal.component.html',
  styleUrls: ['./add-vat-rate-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddVatRateModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  vatRate = signal({
    name: '',
    rate: null
  });

  updateVatField(field: string, value: any) {
    this.vatRate.update(s => ({ ...s, [field]: value }));
  }

  onSave() {
    const data = this.vatRate();
    if (data.name.trim() && data.rate !== null) {
      this.save.emit(data);
    }
  }

  onCancel() {
    this.close.emit();
  }
}
