import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-add-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './add-category-modal.component.html',
  styleUrls: ['./add-category-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddCategoryModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  category = {
    name: '',
    description: ''
  };

  onSave() {
    if (this.category.name.trim()) {
      this.save.emit(this.category);
      this.close.emit();
    }
  }

  onCancel() {
    this.close.emit();
  }
}
