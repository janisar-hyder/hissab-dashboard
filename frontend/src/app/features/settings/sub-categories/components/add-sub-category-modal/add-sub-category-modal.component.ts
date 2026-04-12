import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { CustomSelectComponent, SelectOption } from '../../../../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-add-sub-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CustomSelectComponent],
  templateUrl: './add-sub-category-modal.component.html',
  styleUrls: ['./add-sub-category-modal.component.scss']
})
export class AddSubCategoryModalComponent {
  parentCategories: SelectOption[] = [
    { label: 'Storage', value: 'Storage' },
    { label: 'Networking', value: 'Networking' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Peripherals', value: 'Peripherals' }
  ];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  subCategory = {
    name: '',
    parentCategory: '',
    description: ''
  };

  onCancel() {
    this.close.emit();
  }

  onSave() {
    this.save.emit(this.subCategory);
    this.close.emit();
  }
}
