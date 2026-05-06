import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
    selector: 'app-empty-state',
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    templateUrl: './empty-state.component.html',
    styleUrls: ['./empty-state.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
    @Input() icon: 'document' = 'document';
    @Input() title: string = 'No Items Found.';
    @Input() subtitle: string = 'It looks like you haven\'t added any items yet.';
    @Input() actionLabel: string = '';
    @Input() actionIconClass: string = 'las la-plus'; // e.g. for the LineAwesome plus icon

    @Output() actionClick = new EventEmitter<void>();

    onActionClick() {
        this.actionClick.emit();
    }
}
