import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BulkActionsComponent, BulkAction } from '../../../../shared/components/bulk-actions/bulk-actions.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';

export interface Adjustment {
    id: string;
    date: string;
    reason: string;
    type: 'Quantity' | 'Value' | string;
    modifiedBy: string;
    status: 'Adjusted' | 'Draft' | string;
}

@Component({
    selector: 'app-adjustments-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, EmptyStateComponent, PaginationComponent, BulkActionsComponent, ManageColumnsComponent, DeleteModalComponent, CustomFilterComponent],
    templateUrl: './adjustments-list.component.html',
    styleUrls: ['./adjustments-list.component.scss']
})
export class AdjustmentsListComponent implements OnInit {
    adjustments: Adjustment[] = [
        { id: '1', date: '14 Mar, 2026', reason: 'Stolen Goods', type: 'Quantity', modifiedBy: 'Ali Al-Mansoori', status: 'Adjusted' },
        { id: '2', date: '14 Mar, 2026', reason: 'Stock on Fire', type: 'Value', modifiedBy: 'Fatima Al-Hassan', status: 'Draft' },
        { id: '3', date: '10 Mar, 2026', reason: 'Inventory Revaluation', type: 'Quantity', modifiedBy: 'Omar Al-Sayed', status: 'Adjusted' },
        { id: '4', date: '10 Mar, 2026', reason: 'Stock Written Off', type: 'Quantity', modifiedBy: 'Layla Al-Khalifa', status: 'Adjusted' },
        { id: '5', date: '10 Mar, 2026', reason: 'Damaged Goods', type: 'Value', modifiedBy: 'Zainab Awadhi', status: 'Draft' }
    ];

    selectedAdjustmentIds = new Set<string>();

    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Adjustments', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    adjustmentToDelete: Adjustment | null = null;
    currentFilter: 'All' | 'Draft' | 'Adjusted' | string = 'All';

    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchQuery: string = '';

    adjustmentFilterOptions: FilterOption[] = [
        { label: 'Draft', value: 'Draft', colorHex: '#64748b' },
        { label: 'Adjusted', value: 'Adjusted', colorHex: '#10b981' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'date', label: 'Date', visible: true },
        { id: 'reason', label: 'Reason', visible: true },
        { id: 'type', label: 'Type', visible: true },
        { id: 'modifiedBy', label: 'Modified By', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    get filteredAdjustments(): Adjustment[] {
        let filtered = this.adjustments;

        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(i => i.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(i => 
                i.reason.toLowerCase().includes(query) ||
                i.modifiedBy.toLowerCase().includes(query) ||
                i.type.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedAdjustments(): Adjustment[] {
        const filtered = this.filteredAdjustments;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + this.itemsPerPage);
    }

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    navigateToNew(): void {
        this.router.navigate(['/inventory/adjustments/new']);
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.adjustments.sort((a, b) => {
            const valA = (a as any)[columnId];
            const valB = (b as any)[columnId];

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

    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.openMenuId = null;
        }
    }

    toggleSelection(id: string): void {
        if (this.selectedAdjustmentIds.has(id)) {
            this.selectedAdjustmentIds.delete(id);
        } else {
            this.selectedAdjustmentIds.add(id);
        }
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedAdjustments;
        return currentList.length > 0 && currentList.every(i => this.selectedAdjustmentIds.has(i.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedAdjustments;
        const selectedInCurrent = currentList.filter(i => this.selectedAdjustmentIds.has(i.id)).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(event?: any): void {
        const currentList = this.paginatedAdjustments;
        if (this.isAllSelected()) {
            currentList.forEach(i => this.selectedAdjustmentIds.delete(i.id));
        } else {
            currentList.forEach(i => this.selectedAdjustmentIds.add(i.id));
        }
    }

    clearSearch() {
        this.searchQuery = '';
        this.currentPage = 1;
    }

    isColumnVisible(columnId: string): boolean {
        const col = this.availableColumns.find(c => c.id === columnId);
        return col ? col.visible : false;
    }

    toggleManageColumns() {
        this.isManageColumnsOpen = true;
        this.openMenuId = null;
    }

    closeManageColumns() {
        this.isManageColumnsOpen = false;
    }

    onColumnsChange(updatedColumns: ColumnDef[]): void {
        this.availableColumns = updatedColumns;
    }

    setFilter(filter: string): void {
        this.currentFilter = filter;
        this.currentPage = 1;
    }

    toggleMenu(id: string, event: Event): void {
        event.stopPropagation();
        if (this.openMenuId === id) {
            this.openMenuId = null;
        } else {
            this.openMenuId = id;
        }
    }

    openDeleteModal(adjustment: Adjustment, event: Event): void {
        event.stopPropagation();
        this.adjustmentToDelete = adjustment;
        this.openMenuId = null;
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        console.log('Navigate to edit adjustment', id);
    }

    closeDeleteModal(): void {
        this.adjustmentToDelete = null;
    }

    confirmDelete(): void {
        if (this.adjustmentToDelete) {
            this.adjustments = this.adjustments.filter(i => i.id !== this.adjustmentToDelete!.id);
            this.selectedAdjustmentIds.delete(this.adjustmentToDelete.id);
            this.adjustmentToDelete = null;

            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.adjustments.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) {
                    this.currentPage = maxPage;
                }
            } else {
                this.currentPage = 1;
            }
        }
    }

    handleBulkAction(actionId: string): void {
        if (actionId === 'delete') {
            this.adjustments = this.adjustments.filter(i => !this.selectedAdjustmentIds.has(i.id));
            this.selectedAdjustmentIds.clear();

            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.adjustments.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) {
                    this.currentPage = maxPage;
                }
            } else {
                this.currentPage = 1;
            }
        }
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    onItemsPerPageChange(size: number | 'All') {
        this.itemsPerPage = size;
        this.currentPage = 1;
    }
}
