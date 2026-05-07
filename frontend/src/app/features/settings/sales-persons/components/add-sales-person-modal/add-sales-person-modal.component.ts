import { Component, EventEmitter, Output, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
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
export class AddSalesPersonModalComponent implements OnInit {
  @Input() personData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  isEditMode = signal(false);
  person = signal({
    name: '',
    description: ''
  });

  ngOnInit() {
    if (this.personData) {
      this.isEditMode.set(true);
      this.person.set({
        name: this.personData.name || '',
        description: this.personData.description || ''
      });
    }
  }

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
