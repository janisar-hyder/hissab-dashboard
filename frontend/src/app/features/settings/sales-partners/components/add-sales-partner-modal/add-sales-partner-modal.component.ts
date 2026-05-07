import { Component, EventEmitter, Output, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
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
export class AddSalesPartnerModalComponent implements OnInit {
  @Input() partnerData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  isEditMode = signal(false);
  partner = signal({
    name: '',
    commission: null as number | null,
    description: ''
  });

  ngOnInit() {
    if (this.partnerData) {
      this.isEditMode.set(true);
      this.partner.set({
        name: this.partnerData.name || '',
        commission: this.partnerData.commission || null,
        description: this.partnerData.description || ''
      });
    }
  }

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
