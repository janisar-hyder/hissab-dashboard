import { Component, EventEmitter, Output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-sales-partner-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-sales-partner-modal.component.html',
  styleUrls: ['./add-sales-partner-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddSalesPartnerModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  partner = signal({
    name: '',
    commission: null as number | null,
    description: ''
  });

  updateField(field: string, value: any) {
    this.partner.update(p => ({ ...p, [field]: value }));
  }

  onSave() {
    const data = this.partner();
    if (data.name && data.commission !== null) {
      this.save.emit(data);
    }
  }
}
