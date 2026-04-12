import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BulkActionsComponent, BulkAction } from '../../../../shared/components/bulk-actions/bulk-actions.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';

export interface DeliveryNote {
    id: string;
    deliveryNoteNo: string;
    date: string;
    customerName: string;
    amount: number;
    status: 'Draft' | 'Open' | 'Delivered';
    invoiceStatus: 'Invoiced' | 'Not Invoiced' | '-';
}

@Component({
    selector: 'app-delivery-notes-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, DecimalPipe, EmptyStateComponent, PaginationComponent, BulkActionsComponent, ManageColumnsComponent, DeleteModalComponent, CustomFilterComponent],
    templateUrl: './delivery-notes-list.component.html',
    styleUrls: ['./delivery-notes-list.component.scss']
})
export class DeliveryNotesListComponent implements OnInit {
    deliveryNotes: DeliveryNote[] = [
        { id: '1', deliveryNoteNo: 'DN-003', date: '14 Mar, 2026', customerName: 'ABCO HVACR Supply', amount: 100.000, status: 'Draft', invoiceStatus: '-' },
        { id: '2', deliveryNoteNo: 'DN-003', date: '14 Mar, 2026', customerName: 'Transpak Equipment', amount: 100.000, status: 'Open', invoiceStatus: 'Not Invoiced' },
        { id: '3', deliveryNoteNo: 'DN-002', date: '12 Mar, 2026', customerName: 'Sigler Wholesale', amount: 200.000, status: 'Delivered', invoiceStatus: 'Not Invoiced' },
        { id: '4', deliveryNoteNo: 'DN-001', date: '10 Mar, 2026', customerName: 'The Habegger Corp', amount: 275.000, status: 'Delivered', invoiceStatus: 'Invoiced' }
    ];

    selectedNoteIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Delivery Notes', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    noteToDelete: DeliveryNote | null = null;
    currentFilter: 'All' | 'Draft' | 'Open' | 'Delivered' = 'All';

    // Sorting and Filter properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchQuery: string = '';

    filterOptions: FilterOption[] = [
        { label: 'Draft', value: 'Draft', colorHex: '#6b7280' },
        { label: 'Open', value: 'Open', colorHex: '#0ea5e9' },
        { label: 'Delivered', value: 'Delivered', colorHex: '#10b981' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'deliveryNoteNo', label: 'Delivery Note No.', visible: true},
        { id: 'date', label: 'Date', visible: true },
        { id: 'customerName', label: 'Customer Name', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'status', label: 'Status', visible: true },
        { id: 'invoiceStatus', label: 'Invoice Status', visible: true },
    ];

    get filteredNotes(): DeliveryNote[] {
        let filtered = this.deliveryNotes;
        
        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(n => n.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(n => 
                n.deliveryNoteNo.toLowerCase().includes(query) ||
                n.customerName.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedNotes(): DeliveryNote[] {
        const filtered = this.filteredNotes;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + this.itemsPerPage);
    }

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    navigateToNew(): void {
        this.router.navigate(['/sales/delivery-notes/new']);
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.deliveryNotes.sort((a, b) => {
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
        if (this.selectedNoteIds.has(id)) {
            this.selectedNoteIds.delete(id);
        } else {
            this.selectedNoteIds.add(id);
        }
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedNotes;
        return currentList.length > 0 && currentList.every(n => this.selectedNoteIds.has(n.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedNotes;
        const selectedInCurrent = currentList.filter(n => this.selectedNoteIds.has(n.id)).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(event?: any): void {
        const currentList = this.paginatedNotes;
        if (this.isAllSelected()) {
            currentList.forEach(n => this.selectedNoteIds.delete(n.id));
        } else {
            currentList.forEach(n => this.selectedNoteIds.add(n.id));
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

    setFilter(filter: 'All' | 'Draft' | 'Open' | 'Delivered' | string): void {
        this.currentFilter = filter as 'All' | 'Draft' | 'Open' | 'Delivered';
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

    openDeleteModal(note: DeliveryNote, event: Event): void {
        event.stopPropagation();
        this.noteToDelete = note;
        this.openMenuId = null;
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.router.navigate(['/sales/delivery-notes/edit', id]);
    }

    navigateToInfo(id: string): void {
        this.router.navigate(['/sales/delivery-notes/info', id]);
    }

    closeDeleteModal(): void {
        this.noteToDelete = null;
    }

    confirmDelete(): void {
        if (this.noteToDelete) {
            this.deliveryNotes = this.deliveryNotes.filter(n => n.id !== this.noteToDelete!.id);
            this.selectedNoteIds.delete(this.noteToDelete.id);
            this.noteToDelete = null;
            this.updatePagination();
        }
    }

    handleBulkAction(actionId: string): void {
        if (actionId === 'delete') {
            this.deliveryNotes = this.deliveryNotes.filter(n => !this.selectedNoteIds.has(n.id));
            this.selectedNoteIds.clear();
            this.updatePagination();
        }
    }

    private updatePagination(): void {
        const Math = window.Math;
        if (this.itemsPerPage !== 'All') {
            const maxPage = Math.ceil(this.deliveryNotes.length / this.itemsPerPage) || 1;
            if (this.currentPage > maxPage) {
                this.currentPage = maxPage;
            }
        } else {
            this.currentPage = 1;
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
