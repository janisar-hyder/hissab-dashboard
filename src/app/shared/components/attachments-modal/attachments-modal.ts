import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attachments-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attachments-modal.component.html',
  styleUrl: './attachments-modal.component.scss',
})
export class AttachmentsModal {
  @Input() isAttachmentsModalOpen: boolean = false;
  @Input() isEditMode: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  closeAttachmentsModal(): void {
    this.closeModal.emit();
  }
}
