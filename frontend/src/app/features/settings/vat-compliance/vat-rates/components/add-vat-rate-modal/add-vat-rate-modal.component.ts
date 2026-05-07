import { Component, EventEmitter, Output, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
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
export class AddVatRateModalComponent implements OnInit {
  @Input() rateData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  isEditMode = signal(false);
  vatRate = signal({
    name: '',
    rate: null as number | null
  });

  ngOnInit() {
    if (this.rateData) {
      this.isEditMode.set(true);
      this.vatRate.set({
        name: this.rateData.name || '',
        rate: this.rateData.rate || null
      });
    }
  }

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
