import { Component, Input, Output, EventEmitter, ElementRef, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BulkAction {
    id: string;
    label: string;
    icon?: string;
    colorClass?: string;
}

@Component({
    selector: 'app-bulk-actions',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './bulk-actions.component.html',
    styleUrls: ['./bulk-actions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BulkActionsComponent {
    @Input() actions: BulkAction[] = [];
    @Input() selectedCount: number = 0;
    @Output() actionSelected = new EventEmitter<string>();

    isOpen = false;

    constructor(private eRef: ElementRef) { }

    toggleDropdown(event: Event): void {
        event.stopPropagation();
        this.isOpen = !this.isOpen;
    }

    selectAction(actionId: string, event: Event): void {
        event.stopPropagation();
        this.actionSelected.emit(actionId);
        this.isOpen = false;
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event): void {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.isOpen = false;
        }
    }
}
