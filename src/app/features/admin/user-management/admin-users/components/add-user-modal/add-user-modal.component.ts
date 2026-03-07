import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-add-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './add-user-modal.component.html',
  styleUrl: './add-user-modal.component.scss'
})
export class AddUserModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  formData = {
    name: '',
    role: '',
    email: '',
    password: ''
  };

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  closeModal() {
    this.close.emit();
  }

  onSave() {
    if (this.formData.name && this.formData.role && this.formData.email && this.formData.password) {
      this.save.emit(this.formData);
      this.closeModal();
    }
  }
}
