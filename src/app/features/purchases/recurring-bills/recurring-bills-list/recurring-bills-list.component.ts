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

export interface RecurringBill {
    id: string;
    profileName: string;
    vendorName: string;
    frequency: string;
    lastBillDate: string;
    nextBillDate: string;
    amount: number;
    status: 'Active' | 'Expired' | string;
}

@Component({
    selector: 'app-recurring-bills-list',
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
    templateUrl: './recurring-bills-list.component.html',
    styleUrl: './recurring-bills-list.component.scss'
})
export class RecurringBillsListComponent implements OnInit {
    recurringBills: RecurringBill[] = [
        { id: '1', profileName: 'Biweekly Audit', vendorName: 'Transpak Equipment', frequency: '2 Weeks', lastBillDate: '26 Feb, 2026', nextBillDate: '12 March, 2026', amount: 434.000, status: 'Active' },
        { id: '2', profileName: 'Web Maintenance', vendorName: 'The Habegger Corp', frequency: '1 Month', lastBillDate: '12 Feb, 2026', nextBillDate: '14 March, 2026', amount: 2800.000, status: 'Active' },
        { id: '3', profileName: 'Stationery', vendorName: 'Sigler Wholesale', frequency: '2 Months', lastBillDate: '1 March, 2026', nextBillDate: '', amount: 550.000, status: 'Expired' }
    ];

    selectedBillIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Recurring Bills', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    billToDelete: RecurringBill | null = null;
    currentFilter: string = 'All';
    searchQuery: string = '';
    bulkDeletePending = false;

    // Sorting properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';

    filterOptions: FilterOption[] = [
        { label: 'Active', value: 'Active', colorHex: '#10b981' },
        { label: 'Expired', value: 'Expired', colorHex: '#6b7280' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'profileName', label: 'Profile Name', visible: true },
        { id: 'vendorName', label: 'Vendor', visible: true },
        { id: 'frequency', label: 'Frequency', visible: true },
        { id: 'lastBillDate', label: 'Last Bill Date', visible: true },
        { id: 'nextBillDate', label: 'Next Bill Date', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    get filteredBills(): RecurringBill[] {
        let filtered = [...this.recurringBills];

        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(b => b.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(b => 
                b.profileName.toLowerCase().includes(query) ||
                b.vendorName.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedBills(): RecurringBill[] {
        const filtered = this.filteredBills;
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

        this.recurringBills.sort((a, b) => {
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
        this.router.navigate(['/purchases/recurring-bills/new']);
    }

    navigateToInfo(id: string): void {
        this.router.navigate(['/purchases/recurring-bills/info', id]);
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.router.navigate(['/purchases/recurring-bills/edit', id]);
    }

    toggleSelection(id: string): void {
        if (this.selectedBillIds.has(id)) {
            this.selectedBillIds.delete(id);
        } else {
            this.selectedBillIds.add(id);
        }
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedBills;
        return currentList.length > 0 && currentList.every(b => this.selectedBillIds.has(b.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedBills;
        const selectedInCurrent = currentList.filter(b => this.selectedBillIds.has(b.id)).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(): void {
        const currentList = this.paginatedBills;
        if (this.isAllSelected()) {
            currentList.forEach(b => this.selectedBillIds.delete(b.id));
        } else {
            currentList.forEach(b => this.selectedBillIds.add(b.id));
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

    openDeleteModal(bill: RecurringBill, event: Event): void {
        event.stopPropagation();
        this.billToDelete = bill;
        this.openMenuId = null;
    }

    closeDeleteModal(): void {
        this.billToDelete = null;
        this.bulkDeletePending = false;
    }

    confirmDelete(): void {
        const adjustPage = () => {
            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.recurringBills.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) this.currentPage = maxPage;
            }
        };

        if (this.bulkDeletePending) {
            this.recurringBills = this.recurringBills.filter(b => !this.selectedBillIds.has(b.id));
            this.selectedBillIds.clear();
            this.bulkDeletePending = false;
            adjustPage();
        } else if (this.billToDelete) {
            this.recurringBills = this.recurringBills.filter(b => b.id !== this.billToDelete!.id);
            this.selectedBillIds.delete(this.billToDelete.id);
            this.billToDelete = null;
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
