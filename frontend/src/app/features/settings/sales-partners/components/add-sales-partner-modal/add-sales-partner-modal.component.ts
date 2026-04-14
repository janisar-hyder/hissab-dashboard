import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-sales-partner-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-sales-partner-modal.component.html',
  styleUrls: ['./add-sales-partner-modal.component.scss']
})
export class AddSalesPartnerModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  partnerName: string = '';
  commission: number | null = null;
  description: string = '';

  onSave() {
    if (this.partnerName && this.commission !== null && this.commission !== undefined) {
      this.save.emit({
        name: this.partnerName,
        commission: this.commission,
        description: this.description || '-'
      });
      this.close.emit();
    }
  }
}
