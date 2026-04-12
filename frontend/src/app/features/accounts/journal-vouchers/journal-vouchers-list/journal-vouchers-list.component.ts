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

export interface JournalVoucher {
    id: string;
    journalNo: string;
    date: string;
    reference: string;
    amount: number;
    status: 'Published' | 'Draft' | string;
}

@Component({
    selector: 'app-journal-vouchers-list',
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
    templateUrl: './journal-vouchers-list.component.html',
    styleUrl: './journal-vouchers-list.component.scss'
})
export class JournalVouchersListComponent implements OnInit {
    vouchers: JournalVoucher[] = [
        { id: '1', journalNo: 'JV-004', date: '01 Apr, 2026', reference: 'TPE-001', amount: 434.000, status: 'Draft' },
        { id: '2', journalNo: 'JV-003', date: '16 Mar, 2026', reference: 'SGW-002', amount: 550.000, status: 'Published' },
        { id: '3', journalNo: 'JV-002', date: '10 Mar, 2026', reference: 'HBC-003', amount: 2800.000, status: 'Draft' },
        { id: '4', journalNo: 'JV-001', date: '04 Mar, 2026', reference: '-', amount: 88.000, status: 'Draft' }
    ];

    selectedVoucherIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    navigateToInfo(id: string): void {
        this.router.navigate(['/accounts/journal-vouchers/info', id]);
    }

    navigateToNew(): void {
        this.router.navigate(['/accounts/journal-vouchers/new']);
    }

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Vouchers', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    voucherToDelete: JournalVoucher | null = null;
    currentFilter: string = 'All';
    bulkDeletePending = false;

    // Sorting and Filter properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchQuery: string = '';

    filterOptions: FilterOption[] = [
        { label: 'Published', value: 'Published', colorHex: '#10b981' },
        { label: 'Draft', value: 'Draft', colorHex: '#64748b' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'journalNo', label: 'Journal No.', visible: true },
        { id: 'date', label: 'Date', visible: true },
        { id: 'reference', label: 'Reference', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    get filteredVouchers(): JournalVoucher[] {
        let filtered = this.vouchers;

        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(v => v.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(v => 
                v.journalNo.toLowerCase().includes(query) ||
                v.reference.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedVouchers(): JournalVoucher[] {
        const filtered = this.filteredVouchers;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + this.itemsPerPage);
    }

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.vouchers.sort((a, b) => {
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
        if (this.selectedVoucherIds.has(id)) {
            this.selectedVoucherIds.delete(id);
        } else {
            this.selectedVoucherIds.add(id);
        }
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedVouchers;
        return currentList.length > 0 && currentList.every(v => this.selectedVoucherIds.has(v.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedVouchers;
        const selectedInCurrent = currentList.filter(v => this.selectedVoucherIds.has(v.id)).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(event?: any): void {
        const currentList = this.paginatedVouchers;
        if (this.isAllSelected()) {
            currentList.forEach(v => this.selectedVoucherIds.delete(v.id));
        } else {
            currentList.forEach(v => this.selectedVoucherIds.add(v.id));
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

    openDeleteModal(voucher: JournalVoucher, event: Event): void {
        event.stopPropagation();
        this.voucherToDelete = voucher;
        this.openMenuId = null;
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        console.log('Navigate to edit', id);
        // this.router.navigate(['/accounts/journal-vouchers/edit', id]);
    }

    closeDeleteModal(): void {
        this.voucherToDelete = null;
        this.bulkDeletePending = false;
    }

    confirmDelete(): void {
        const adjustPage = () => {
            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.vouchers.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) this.currentPage = maxPage;
            }
        };

        if (this.bulkDeletePending) {
            this.vouchers = this.vouchers.filter(v => !this.selectedVoucherIds.has(v.id));
            this.selectedVoucherIds.clear();
            this.bulkDeletePending = false;
            adjustPage();
        } else if (this.voucherToDelete) {
            this.vouchers = this.vouchers.filter(v => v.id !== this.voucherToDelete!.id);
            this.selectedVoucherIds.delete(this.voucherToDelete.id);
            this.voucherToDelete = null;
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
}
