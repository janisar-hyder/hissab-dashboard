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

export interface Receipt {
    id: string;
    receiptNumber: string;
    date: string;
    customerName: string;
    invoiceNo: string;
    paymentMode: string;
    amount: number;
    status: 'Draft' | 'Paid' | string;
}

@Component({
    selector: 'app-receipts-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, DecimalPipe, EmptyStateComponent, PaginationComponent, BulkActionsComponent, ManageColumnsComponent, DeleteModalComponent, CustomFilterComponent],
    templateUrl: './receipts-list.component.html',
    styleUrls: ['./receipts-list.component.scss']
})
export class ReceiptsListComponent implements OnInit {
    receipts: Receipt[] = [
        { id: '1', receiptNumber: 'RC-002', date: '14 Mar, 2026', customerName: 'The Habegger Corp', invoiceNo: 'INV-001, INV-004', paymentMode: 'Bank Transfer', amount: 275.000, status: 'Draft' },
        { id: '2', receiptNumber: 'RC-001', date: '10 Mar, 2026', customerName: 'Sigler Wholesale', invoiceNo: 'INV-003', paymentMode: 'Cheque', amount: 2800.000, status: 'Paid' }
    ];

    selectedReceiptIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Receipts', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    receiptToDelete: Receipt | null = null;
    currentFilter: 'All' | 'Draft' | 'Paid' | string = 'All';

    // Sorting and Filter properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchQuery: string = '';

    receiptFilterOptions: FilterOption[] = [
        { label: 'Draft', value: 'Draft', colorHex: '#64748b' },
        { label: 'Paid', value: 'Paid', colorHex: '#10b981' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'receiptNumber', label: 'Receipt Number', visible: true},
        { id: 'date', label: 'Date', visible: true },
        { id: 'customerName', label: 'Customer Name', visible: true },
        { id: 'invoiceNo', label: 'Invoice No', visible: true },
        { id: 'paymentMode', label: 'Payment Mode', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    get filteredReceipts(): Receipt[] {
        let filtered = this.receipts;

        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(i => i.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(i => 
                i.receiptNumber.toLowerCase().includes(query) ||
                i.customerName.toLowerCase().includes(query) ||
                i.invoiceNo.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedReceipts(): Receipt[] {
        const filtered = this.filteredReceipts;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + this.itemsPerPage);
    }

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    navigateToNew(): void {
        this.router.navigate(['/sales/receipts/new']);
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.receipts.sort((a, b) => {
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
        if (this.selectedReceiptIds.has(id)) {
            this.selectedReceiptIds.delete(id);
        } else {
            this.selectedReceiptIds.add(id);
        }
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedReceipts;
        return currentList.length > 0 && currentList.every(i => this.selectedReceiptIds.has(i.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedReceipts;
        const selectedInCurrent = currentList.filter(i => this.selectedReceiptIds.has(i.id)).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(event?: any): void {
        const currentList = this.paginatedReceipts;
        if (this.isAllSelected()) {
            currentList.forEach(i => this.selectedReceiptIds.delete(i.id));
        } else {
            currentList.forEach(i => this.selectedReceiptIds.add(i.id));
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

    openDeleteModal(receipt: Receipt, event: Event): void {
        event.stopPropagation();
        this.receiptToDelete = receipt;
        this.openMenuId = null;
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        console.log('Navigate to edit receipt', id);
    }

    navigateToInfo(id: string): void {
        this.router.navigate(['/sales/receipts/info', id]);
    }

    closeDeleteModal(): void {
        this.receiptToDelete = null;
    }

    confirmDelete(): void {
        if (this.receiptToDelete) {
            this.receipts = this.receipts.filter(i => i.id !== this.receiptToDelete!.id);
            this.selectedReceiptIds.delete(this.receiptToDelete.id);
            this.receiptToDelete = null;

            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.receipts.length / this.itemsPerPage) || 1;
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
            this.receipts = this.receipts.filter(i => !this.selectedReceiptIds.has(i.id));
            this.selectedReceiptIds.clear();

            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.receipts.length / this.itemsPerPage) || 1;
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
