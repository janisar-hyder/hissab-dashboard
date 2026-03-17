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

export interface CreditNote {
    id: string;
    creditNoteNumber: string;
    date: string;
    customerName: string;
    invoiceNo: string;
    amount: number;
    balance: number;
    status: 'Open' | 'Closed' | 'Draft' | string;
}

@Component({
    selector: 'app-credit-notes-list',
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
    templateUrl: './credit-notes-list.component.html',
    styleUrl: './credit-notes-list.component.scss'
})
export class CreditNotesListComponent implements OnInit {
    creditNotes: CreditNote[] = [
        { id: '1', creditNoteNumber: 'CN-003', date: '14 Mar, 2026', customerName: 'Sigler Wholesale', invoiceNo: '-', amount: 300.000, balance: 300.000, status: 'Draft' },
        { id: '2', creditNoteNumber: 'CN-002', date: '14 Mar, 2026', customerName: 'Sigler Wholesale', invoiceNo: '-', amount: 200.000, balance: 200.000, status: 'Open' },
        { id: '3', creditNoteNumber: 'CN-001', date: '10 Mar, 2026', customerName: 'The Habegger Corp', invoiceNo: 'INV-004, INV-003', amount: 275.000, balance: 0.000, status: 'Closed' }
    ];

    selectedCreditNoteIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Credit Notes', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    creditNoteToDelete: CreditNote | null = null;
    currentFilter: 'All' | 'Open' | 'Closed' | 'Draft' | string = 'All';

    // Sorting and Filter properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchQuery: string = '';

    creditNoteFilterOptions: FilterOption[] = [
        { label: 'Open', value: 'Open', colorHex: '#10b981' },
        { label: 'Closed', value: 'Closed', colorHex: '#ef4444' },
        { label: 'Draft', value: 'Draft', colorHex: '#64748b' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'creditNoteNumber', label: 'Credit Note No.', visible: true},
        { id: 'date', label: 'Date', visible: true },
        { id: 'customerName', label: 'Customer Name', visible: true },
        { id: 'invoiceNo', label: 'Invoice No', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'balance', label: 'Balance', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    get filteredCreditNotes(): CreditNote[] {
        let filtered = this.creditNotes;

        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(cn => cn.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(cn => 
                cn.creditNoteNumber.toLowerCase().includes(query) ||
                cn.customerName.toLowerCase().includes(query) ||
                cn.invoiceNo.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedCreditNotes(): CreditNote[] {
        const filtered = this.filteredCreditNotes;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + this.itemsPerPage);
    }

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    navigateToNew(): void {
        this.router.navigate(['/sales/credit-notes/new']);
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.creditNotes.sort((a, b) => {
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
        if (this.selectedCreditNoteIds.has(id)) {
            this.selectedCreditNoteIds.delete(id);
        } else {
            this.selectedCreditNoteIds.add(id);
        }
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedCreditNotes;
        return currentList.length > 0 && currentList.every(cn => this.selectedCreditNoteIds.has(cn.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedCreditNotes;
        const selectedInCurrent = currentList.filter(cn => this.selectedCreditNoteIds.has(cn.id)).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(event?: any): void {
        const currentList = this.paginatedCreditNotes;
        if (this.isAllSelected()) {
            currentList.forEach(cn => this.selectedCreditNoteIds.delete(cn.id));
        } else {
            currentList.forEach(cn => this.selectedCreditNoteIds.add(cn.id));
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

    setFilter(filter: 'All' | 'Open' | 'Closed' | 'Draft' | string): void {
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

    openDeleteModal(creditNote: CreditNote, event: Event): void {
        event.stopPropagation();
        this.creditNoteToDelete = creditNote;
        this.openMenuId = null;
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.router.navigate(['/sales/credit-notes/edit', id]);
    }

    navigateToInfo(id: string): void {
        this.router.navigate(['/sales/credit-notes/info', id]);
    }

    closeDeleteModal(): void {
        this.creditNoteToDelete = null;
    }

    confirmDelete(): void {
        if (this.creditNoteToDelete) {
            this.creditNotes = this.creditNotes.filter(cn => cn.id !== this.creditNoteToDelete!.id);
            this.selectedCreditNoteIds.delete(this.creditNoteToDelete.id);
            this.creditNoteToDelete = null;
            
            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.creditNotes.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) {
                    this.currentPage = maxPage;
                }
            }
        }
    }

    handleBulkAction(actionId: string): void {
        if (actionId === 'delete') {
            this.creditNotes = this.creditNotes.filter(cn => !this.selectedCreditNoteIds.has(cn.id));
            this.selectedCreditNoteIds.clear();
            
            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.creditNotes.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) {
                    this.currentPage = maxPage;
                }
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
