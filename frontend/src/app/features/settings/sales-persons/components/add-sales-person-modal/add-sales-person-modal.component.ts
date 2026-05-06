import { Component, EventEmitter, Output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-sales-person-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-sales-person-modal.component.html',
  styleUrls: ['./add-sales-person-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddSalesPersonModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  person = signal({
    name: '',
    description: ''
  });

  updateField(field: string, value: any) {
    this.person.update(p => ({ ...p, [field]: value }));
  }

  onSave() {
    const data = this.person();
    if (data.name) {
      this.save.emit(data);
    }
  }
}
