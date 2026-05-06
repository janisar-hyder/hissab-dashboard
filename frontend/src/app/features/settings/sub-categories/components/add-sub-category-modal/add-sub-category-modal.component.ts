import { Component, EventEmitter, Output, Input, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { CustomSelectComponent, SelectOption } from '../../../../../shared/components/custom-select/custom-select.component';
import { CategoryService } from '../../../categories/services/category.service';

@Component({
  selector: 'app-add-sub-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CustomSelectComponent],
  templateUrl: './add-sub-category-modal.component.html',
  styleUrls: ['./add-sub-category-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddSubCategoryModalComponent implements OnInit {
  private categoryService = inject(CategoryService);

  parentCategories = signal<SelectOption[]>([]);
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  subCategory = signal({
    name: '',
    category_id: null as number | null,
    description: ''
  });

  ngOnInit() {
    this.loadParentCategories();
  }

  loadParentCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        const options = res.data.map((c: any) => ({
          label: c.name,
          value: c.id
        }));
        this.parentCategories.set(options);
      }
    });
  }

  updateSubCategoryField(field: string, value: any) {
    this.subCategory.update(s => ({ ...s, [field]: value }));
  }

  onCancel() {
    this.close.emit();
  }

  onSave() {
    const data = this.subCategory();
    if (!data.name || !data.category_id) return;
    
    this.save.emit(data);
  }
}
