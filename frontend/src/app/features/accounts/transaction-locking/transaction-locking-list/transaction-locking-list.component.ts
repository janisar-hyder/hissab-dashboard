import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LockModuleModalComponent } from '../components/lock-module-modal/lock-module-modal.component';

export interface LockingModule {
    id: string;
    name: string;
    isLocked: boolean;
    lockedDate: string;
    status: 'Locked' | 'Partially Locked' | 'Unlocked';
}

@Component({
    selector: 'app-transaction-locking-list',
    standalone: true,
    imports: [CommonModule, FormsModule, LockModuleModalComponent],
    templateUrl: './transaction-locking-list.component.html',
    styleUrl: './transaction-locking-list.component.scss'
})
export class TransactionLockingListComponent implements OnInit {
    modules: LockingModule[] = [
        { id: '1', name: 'Sales', isLocked: true, lockedDate: '01 Mar, 2026', status: 'Locked' },
        { id: '2', name: 'Purchase', isLocked: true, lockedDate: '06 Feb, 2026', status: 'Partially Locked' },
        { id: '3', name: 'Accounts', isLocked: false, lockedDate: '-', status: 'Unlocked' }
    ];

    selectedModuleIds = new Set<string>();
    openMenuId: string | null = null;
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';

    // Modal State
    isLockModalOpen = false;
    activeModule: LockingModule | null = null;
    modalMode: 'lock' | 'edit' | 'partial' = 'lock';
    modalTitle = '';
    initialDate = '';
    initialFromDate = '';
    initialToDate = '';

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    toggleLock(module: LockingModule): void {
        if (!module.isLocked) {
            // Opening for Locking action -> Show Modal
            this.activeModule = module;
            this.modalMode = 'lock';
            this.modalTitle = '';
            this.initialDate = '';
            this.isLockModalOpen = true;
        } else {
            // Opening for Unlocking action -> Instant Unlock (No Modal)
            module.isLocked = false;
            module.status = 'Unlocked';
            module.lockedDate = '-';
        }
    }

    openEditModal(module: LockingModule, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.activeModule = module;
        this.modalTitle = `Edit - ${module.name}`;
        
        if (module.status === 'Partially Locked') {
            this.modalMode = 'partial';
            const range = this.parseDateRange(module.lockedDate);
            this.initialFromDate = range.from;
            this.initialToDate = range.to;
            this.initialDate = '';
        } else {
            this.modalMode = 'edit';
            this.initialDate = this.getIsoDate(module.lockedDate);
            this.initialFromDate = '';
            this.initialToDate = '';
        }
        
        this.isLockModalOpen = true;
    }

    openPartialModal(module: LockingModule, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.activeModule = module;
        this.modalMode = 'partial';
        this.modalTitle = '';
        this.initialFromDate = '';
        this.initialToDate = '';
        this.isLockModalOpen = true;
    }

    private parseDateRange(rangeStr: string): { from: string, to: string } {
        if (!rangeStr || !rangeStr.includes('-')) return { from: '', to: '' };
        const parts = rangeStr.split(' - ');
        return {
            from: this.getIsoDate(parts[0]),
            to: this.getIsoDate(parts[1])
        };
    }

    private getIsoDate(formattedDate: string): string {
        if (!formattedDate || formattedDate === '-') return '';
        // Date format: "01 Mar, 2026"
        const parts = formattedDate.split(' ');
        if (parts.length < 3) return '';
        const day = parts[0].padStart(2, '0');
        const monthStr = parts[1].replace(',', '');
        const year = parts[2];
        const month = new Date(`${monthStr} 1, ${year}`).getMonth() + 1;
        return `${year}-${month.toString().padStart(2, '0')}-${day}`;
    }

    handleLockConfirm(result: { date?: string, from?: string, to?: string }): void {
        if (this.activeModule) {
            if (this.modalMode === 'partial') {
                this.activeModule.isLocked = true;
                this.activeModule.status = 'Partially Locked';
                this.activeModule.lockedDate = `${this.formatDate(result.from!)} - ${this.formatDate(result.to!)}`;
            } else {
                this.activeModule.isLocked = true;
                this.activeModule.status = 'Locked';
                this.activeModule.lockedDate = this.formatDate(result.date!);
            }
        }
        this.handleLockCancel();
    }

    private formatDate(dateStr: string): string {
        if (!dateStr) return '-';
        const dateObj = new Date(dateStr);
        return dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    handleLockCancel(): void {
        this.isLockModalOpen = false;
        this.activeModule = null;
    }

    // Sorting Logic
    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.modules.sort((a, b) => {
            const valA = (a as any)[columnId];
            const valB = (b as any)[columnId];

            if (columnId === 'lockedDate') {
                if (valA === '-' && valB === '-') return 0;
                if (valA === '-') return this.sortDirection === 'asc' ? 1 : -1;
                if (valB === '-') return this.sortDirection === 'asc' ? -1 : 1;
                return this.sortDirection === 'asc' 
                    ? new Date(valA).getTime() - new Date(valB).getTime()
                    : new Date(valB).getTime() - new Date(valA).getTime();
            }

            if (typeof valA === 'string' && typeof valB === 'string') {
                return this.sortDirection === 'asc'
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            } else {
                return this.sortDirection === 'asc'
                    ? (valA > valB ? 1 : -1)
                    : (valA < valB ? 1 : -1);
            }
        });
    }

    getSortIcon(columnId: string): string {
        if (this.sortColumn !== columnId) return 'la-sort';
        return this.sortDirection === 'asc' ? 'la-sort-up' : 'la-sort-down';
    }

    // Bulk Selection
    toggleAll(event: any): void {
        if (event.target.checked) {
            this.modules.forEach(m => this.selectedModuleIds.add(m.id));
        } else {
            this.selectedModuleIds.clear();
        }
    }

    toggleSelection(id: string): void {
        if (this.selectedModuleIds.has(id)) {
            this.selectedModuleIds.delete(id);
        } else {
            this.selectedModuleIds.add(id);
        }
    }

    isAllSelected(): boolean {
        return this.modules.length > 0 && this.selectedModuleIds.size === this.modules.length;
    }

    isPartiallySelected(): boolean {
        return this.selectedModuleIds.size > 0 && this.selectedModuleIds.size < this.modules.length;
    }

    // Action Menu
    toggleMenu(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = (this.openMenuId === id) ? null : id;
    }

    @HostListener('document:click')
    clickout() {
        this.openMenuId = null;
    }
}
