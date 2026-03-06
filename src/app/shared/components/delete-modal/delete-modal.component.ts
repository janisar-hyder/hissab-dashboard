import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
    selector: 'app-delete-modal',
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    templateUrl: './delete-modal.component.html',
    styleUrls: ['./delete-modal.component.scss']
})
export class DeleteModalComponent {
    @Input() isOpen: boolean = false;
    @Input() title: string = 'Delete Item';
    @Input() message: string = 'Are you sure you want to delete this item? This action cannot be undone.';

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onCancel(): void {
        this.cancel.emit();
    }

    onConfirm(): void {
        this.confirm.emit();
    }
}
