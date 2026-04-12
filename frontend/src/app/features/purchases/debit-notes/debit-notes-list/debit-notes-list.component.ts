import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BulkActionsComponent, BulkAction } from '../../../../shared/components/bulk-actions/bulk-actions.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';

export interface DebitNote {
    id: string;
    debitNoteNo: string;
    date: string;
    vendorName: string;
    billNo: string;
    amount: number;
    balance: number;
    status: 'Draft' | 'Open' | 'Closed' | string;
}

@Component({
    selector: 'app-debit-notes-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonComponent,
        DecimalPipe,
        EmptyStateComponent,
        PaginationComponent,
        BulkActionsComponent,
        ManageColumnsComponent,
        DeleteModalComponent,
        CustomFilterComponent
    ],
    templateUrl: './debit-notes-list.component.html',
    styleUrl: './debit-notes-list.component.scss'
})
export class DebitNotesListComponent implements OnInit {
    debitNotes: DebitNote[] = [
        { id: '1', debitNoteNo: 'CN-003', date: '14 Mar, 2026', vendorName: 'Sigler Wholesale', billNo: '-', amount: 300.000, balance: 300.000, status: 'Draft' },
        { id: '2', debitNoteNo: 'CN-002', date: '14 Mar, 2026', vendorName: 'Sigler Wholesale', billNo: '-', amount: 200.000, balance: 200.000, status: 'Open' },
        { id: '3', debitNoteNo: 'CN-001', date: '10 Mar, 2026', vendorName: 'The Habegger Corp', billNo: 'INV-004, INV-003', amount: 275.000, balance: 0.000, status: 'Closed' }
    ];

    selectedNoteIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Debit Notes', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    noteToDelete: DebitNote | null = null;
    currentFilter: string = 'All';
    bulkDeletePending = false;

    // Sorting and Filter properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchQuery: string = '';

    filterOptions: FilterOption[] = [
        { label: 'Draft', value: 'Draft', colorHex: '#64748b' },
        { label: 'Open', value: 'Open', colorHex: '#10b981' },
        { label: 'Closed', value: 'Closed', colorHex: '#f43f5e' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'debitNoteNo', label: 'Debit Note No.', visible: true },
        { id: 'date', label: 'Date', visible: true },
        { id: 'vendorName', label: 'Vendor Name', visible: true },
        { id: 'billNo', label: 'Bill No', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'balance', label: 'Balance', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    get filteredNotes(): DebitNote[] {
        let filtered = this.debitNotes;

        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(n => n.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(n => 
                n.debitNoteNo.toLowerCase().includes(query) ||
                n.vendorName.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedNotes(): DebitNote[] {
        const filtered = this.filteredNotes;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + Number(this.itemsPerPage));
    }

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    navigateToInfo(id: string): void {
        this.router.navigate(['/purchases/debit-notes/info', id]);
    }

    navigateToNew(): void {
        this.router.navigate(['/purchases/debit-notes/new']);
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.debitNotes.sort((a, b) => {
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

    openDeleteModal(note: DebitNote, event: Event): void {
        event.stopPropagation();
        this.noteToDelete = note;
        this.openMenuId = null;
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.router.navigate(['/purchases/debit-notes/edit', id]);
    }

    closeDeleteModal(): void {
        this.noteToDelete = null;
        this.bulkDeletePending = false;
    }

    confirmDelete(): void {
        if (this.bulkDeletePending) {
            this.debitNotes = this.debitNotes.filter(n => !this.selectedNoteIds.has(n.id));
            this.selectedNoteIds.clear();
            this.bulkDeletePending = false;
        } else if (this.noteToDelete) {
            this.debitNotes = this.debitNotes.filter(n => n.id !== this.noteToDelete!.id);
            this.selectedNoteIds.delete(this.noteToDelete.id);
            this.noteToDelete = null;
        }
    }

    handleBulkAction(actionId: string): void {
        if (actionId === 'delete') {
            this.bulkDeletePending = true;
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
