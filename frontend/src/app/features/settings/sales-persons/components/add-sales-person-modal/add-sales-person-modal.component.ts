import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-sales-person-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-sales-person-modal.component.html',
  styleUrls: ['./add-sales-person-modal.component.scss']
})
export class AddSalesPersonModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  personName: string = '';
  description: string = '';

  onSave() {
    if (this.personName) {
      this.save.emit({
        name: this.personName,
        description: this.description || '-'
      });
      this.close.emit();
    }
  }
}
