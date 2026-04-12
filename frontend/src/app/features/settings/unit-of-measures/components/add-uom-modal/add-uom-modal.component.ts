import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-add-uom-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './add-uom-modal.component.html',
  styleUrls: ['./add-uom-modal.component.scss']
})
export class AddUomModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  uom = {
    name: ''
  };

  onSave() {
    if (this.uom.name.trim()) {
      this.save.emit(this.uom);
      this.close.emit();
    }
  }

  onCancel() {
    this.close.emit();
  }
}
