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

export interface Bill {
    id: string;
    billNumber: string;
    date: string;
    vendorName: string;
    dueDate: string;
    amount: number;
    balanceDue: number;
    status: 'Paid' | 'Partially Paid' | 'Overdue' | 'Due in 20 Days' | string;
}

@Component({
    selector: 'app-bills-list',
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
    templateUrl: './bills-list.component.html',
    styleUrl: './bills-list.component.scss'
})
export class BillsListComponent implements OnInit {
    bills: Bill[] = [
        { id: '1', billNumber: 'BL-004', date: '11 Feb, 2026', vendorName: 'Transpak Equipment', dueDate: '01 Mar, 2026', amount: 1267.000, balanceDue: 1267.000, status: 'Overdue' },
        { id: '2', billNumber: 'BL-003', date: '06 Feb, 2026', vendorName: 'Sigler Wholesale', dueDate: '06 Mar, 2026', amount: 2800.000, balanceDue: 0.000, status: 'Paid' },
        { id: '3', billNumber: 'BL-002', date: '05 Feb, 2026', vendorName: 'The Habegger Corp', dueDate: '10 Mar, 2026', amount: 550.000, balanceDue: 275.000, status: 'Partially Paid' },
        { id: '4', billNumber: 'BL-001', date: '21 Jan, 2026', vendorName: 'ABCO HVACR Supply', dueDate: '21 Feb, 2026', amount: 88.000, balanceDue: 8.000, status: 'Due in 20 Days' }
    ];

    selectedBillIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    navigateToInfo(id: string): void {
        this.router.navigate(['/purchases/bills/info', id]);
    }

    navigateToNew(): void {
        this.router.navigate(['/purchases/bills/new']);
    }

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Bills', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    billToDelete: Bill | null = null;
    currentFilter: string = 'All';
    bulkDeletePending = false;

    // Sorting and Filter properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchQuery: string = '';

    filterOptions: FilterOption[] = [
        { label: 'Paid', value: 'Paid', colorHex: '#10b981' },
        { label: 'Partially Paid', value: 'Partially Paid', colorHex: '#f59e0b' },
        { label: 'Overdue', value: 'Overdue', colorHex: '#ef4444' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'billNumber', label: 'Bill Number', visible: true },
        { id: 'date', label: 'Date', visible: true },
        { id: 'vendorName', label: 'Vendor Name', visible: true },
        { id: 'dueDate', label: 'Due Date', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'balanceDue', label: 'Balance Due', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    get filteredBills(): Bill[] {
        let filtered = this.bills;

        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(b => b.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(b => 
                b.billNumber.toLowerCase().includes(query) ||
                b.vendorName.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedBills(): Bill[] {
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

        this.bills.sort((a, b) => {
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

    toggleAll(event?: any): void {
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

    openDeleteModal(bill: Bill, event: Event): void {
        event.stopPropagation();
        this.billToDelete = bill;
        this.openMenuId = null;
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.router.navigate(['/purchases/bills/edit', id]);
    }

    closeDeleteModal(): void {
        this.billToDelete = null;
        this.bulkDeletePending = false;
    }

    confirmDelete(): void {
        const adjustPage = () => {
            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.bills.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) this.currentPage = maxPage;
            }
        };

        if (this.bulkDeletePending) {
            this.bills = this.bills.filter(b => !this.selectedBillIds.has(b.id));
            this.selectedBillIds.clear();
            this.bulkDeletePending = false;
            adjustPage();
        } else if (this.billToDelete) {
            this.bills = this.bills.filter(b => b.id !== this.billToDelete!.id);
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
}
