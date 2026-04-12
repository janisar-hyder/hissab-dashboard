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

export interface Payment {
    id: string;
    paymentNumber: string;
    date: string;
    vendorName: string;
    billNo: string;
    paymentMode: string;
    amount: number;
    status: 'Paid' | 'Draft' | string;
}

@Component({
    selector: 'app-payments-list',
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
    templateUrl: './payments-list.component.html',
    styleUrl: './payments-list.component.scss'
})
export class PaymentsListComponent implements OnInit {
    payments: Payment[] = [
        { id: '1', paymentNumber: '002', date: '14 Mar, 2026', vendorName: 'The Habegger Corp', billNo: 'BL-001, BL-004', paymentMode: 'Bank Transfer', amount: 275.000, status: 'Draft' },
        { id: '2', paymentNumber: '001', date: '10 Mar, 2026', vendorName: 'Sigler Wholesale', billNo: 'BL-003', paymentMode: 'Cheque', amount: 2800.000, status: 'Paid' }
    ];

    selectedPaymentIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Payments', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    paymentToDelete: Payment | null = null;
    currentFilter: string = 'All';
    searchQuery: string = '';
    bulkDeletePending = false;

    // Sorting properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';

    filterOptions: FilterOption[] = [
        { label: 'Paid', value: 'Paid', colorHex: '#10b981' },
        { label: 'Draft', value: 'Draft', colorHex: '#6b7280' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'paymentNumber', label: 'Payment Number', visible: true },
        { id: 'date', label: 'Date', visible: true },
        { id: 'vendorName', label: 'Vendor Name', visible: true },
        { id: 'billNo', label: 'Bill No', visible: true },
        { id: 'paymentMode', label: 'Payment Mode', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    get filteredPayments(): Payment[] {
        let filtered = [...this.payments];

        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(p => p.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.paymentNumber.toLowerCase().includes(query) ||
                p.vendorName.toLowerCase().includes(query) ||
                p.billNo.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedPayments(): Payment[] {
        const filtered = this.filteredPayments;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + this.itemsPerPage);
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.payments.sort((a, b) => {
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

    navigateToNew(): void {
        this.router.navigate(['/purchases/payments/new']);
    }

    navigateToInfo(id: string): void {
        this.router.navigate(['/purchases/payments/info', id]);
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.router.navigate(['/purchases/payments/edit', id]);
    }

    toggleSelection(id: string): void {
        if (this.selectedPaymentIds.has(id)) {
            this.selectedPaymentIds.delete(id);
        } else {
            this.selectedPaymentIds.add(id);
        }
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedPayments;
        return currentList.length > 0 && currentList.every(p => this.selectedPaymentIds.has(p.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedPayments;
        const selectedInCurrent = currentList.filter(p => this.selectedPaymentIds.has(p.id)).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(): void {
        const currentList = this.paginatedPayments;
        if (this.isAllSelected()) {
            currentList.forEach(p => this.selectedPaymentIds.delete(p.id));
        } else {
            currentList.forEach(p => this.selectedPaymentIds.add(p.id));
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

    toggleMenu(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = this.openMenuId === id ? null : id;
    }

    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.openMenuId = null;
        }
    }

    openDeleteModal(payment: Payment, event: Event): void {
        event.stopPropagation();
        this.paymentToDelete = payment;
        this.openMenuId = null;
    }

    closeDeleteModal(): void {
        this.paymentToDelete = null;
        this.bulkDeletePending = false;
    }

    confirmDelete(): void {
        const adjustPage = () => {
            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.payments.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) this.currentPage = maxPage;
            }
        };

        if (this.bulkDeletePending) {
            this.payments = this.payments.filter(p => !this.selectedPaymentIds.has(p.id));
            this.selectedPaymentIds.clear();
            this.bulkDeletePending = false;
            adjustPage();
        } else if (this.paymentToDelete) {
            this.payments = this.payments.filter(p => p.id !== this.paymentToDelete!.id);
            this.selectedPaymentIds.delete(this.paymentToDelete.id);
            this.paymentToDelete = null;
            adjustPage();
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

    onColumnsChange(updatedColumns: ColumnDef[]): void {
        this.availableColumns = updatedColumns;
    }

    setFilter(filter: string): void {
        this.currentFilter = filter;
        this.currentPage = 1;
    }
}
