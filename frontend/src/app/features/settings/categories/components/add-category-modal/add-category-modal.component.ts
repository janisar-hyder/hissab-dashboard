import { Component, EventEmitter, Output, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
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
export class AddCategoryModalComponent implements OnInit {
  @Input() categoryData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  isEditMode = signal(false);
  category = signal({
    name: '',
    description: ''
  });

  ngOnInit() {
    if (this.categoryData) {
      this.isEditMode.set(true);
      this.category.set({
        name: this.categoryData.name || '',
        description: this.categoryData.description || ''
      });
    }
  }

  updateCategoryField(field: string, value: any) {
    this.category.update(c => ({ ...c, [field]: value }));
  }

  onSave() {
    const data = this.category();
    if (data.name.trim()) {
      this.save.emit(data);
    }
  }

  onCancel() {
    this.close.emit();
  }
}
