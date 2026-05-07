import { Component, EventEmitter, Output, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-add-uom-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './add-uom-modal.component.html',
  styleUrls: ['./add-uom-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddUomModalComponent implements OnInit {
  @Input() uomData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  isEditMode = signal(false);
  uom = signal({
    name: ''
  });

  ngOnInit() {
    if (this.uomData) {
      this.isEditMode.set(true);
      this.uom.set({
        name: this.uomData.name || ''
      });
    }
  }

  updateUomField(field: string, value: any) {
    this.uom.update(s => ({ ...s, [field]: value }));
  }

  onSave() {
    const data = this.uom();
    if (data.name.trim()) {
      this.save.emit(data);
    }
  }

  onCancel() {
    this.close.emit();
  }
}
