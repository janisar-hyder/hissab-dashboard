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

export interface RecurringInvoice {
    id: string;
    profileName: string;
    customerName: string;
    frequency: string;
    lastInvoiceDate: string;
    nextInvoiceDate: string;
    amount: number;
    status: 'Active' | 'Expired' | string;
}

@Component({
    selector: 'app-recurring-invoices-list',
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
    templateUrl: './recurring-invoices-list.component.html',
    styleUrls: ['./recurring-invoices-list.component.scss']
})
export class RecurringInvoicesListComponent implements OnInit {
    recurringInvoices: RecurringInvoice[] = [
        { id: '1', profileName: 'Biweekly Audit', customerName: 'Transpak Equipment', frequency: '2 Weeks', lastInvoiceDate: '26 Feb, 2026', nextInvoiceDate: '12 March, 2026', amount: 434.000, status: 'Active' },
        { id: '2', profileName: 'Web Maintenance', customerName: 'The Habegger Corp', frequency: '1 Month', lastInvoiceDate: '12 Feb, 2026', nextInvoiceDate: '14 March, 2026', amount: 2800.000, status: 'Active' },
        { id: '3', profileName: 'Profile 3', customerName: 'Sigler Wholesale', frequency: '2 Months', lastInvoiceDate: '1 March, 2026', nextInvoiceDate: '', amount: 550.000, status: 'Expired' }
    ];

    selectedIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Profiles', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    profileToDelete: RecurringInvoice | null = null;
    currentFilter: 'All' | 'Active' | 'Expired' | string = 'All';

    // Sorting and Filter properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchQuery: string = '';

    filterOptions: FilterOption[] = [
        { label: 'Active', value: 'Active', colorHex: '#10b981' },
        { label: 'Expired', value: 'Expired', colorHex: '#64748b' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'profileName', label: 'Profile Name', visible: true},
        { id: 'customerName', label: 'Customer', visible: true },
        { id: 'frequency', label: 'Frequency', visible: true },
        { id: 'lastInvoiceDate', label: 'Last Invoice Date', visible: true },
        { id: 'nextInvoiceDate', label: 'Next Invoice Date', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    get filteredInvoices(): RecurringInvoice[] {
        let filtered = this.recurringInvoices;

        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(i => i.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(i => 
                i.profileName.toLowerCase().includes(query) ||
                i.customerName.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedInvoices(): RecurringInvoice[] {
        const filtered = this.filteredInvoices;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + Number(this.itemsPerPage));
    }

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    navigateToNew(): void {
        this.router.navigate(['/sales/recurring-invoices/new']);
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.recurringInvoices.sort((a, b) => {
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
        if (this.selectedIds.has(id)) {
            this.selectedIds.delete(id);
        } else {
            this.selectedIds.add(id);
        }
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedInvoices;
        return currentList.length > 0 && currentList.every(i => this.selectedIds.has(i.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedInvoices;
        const selectedInCurrent = currentList.filter(i => this.selectedIds.has(i.id)).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(event?: any): void {
        const currentList = this.paginatedInvoices;
        if (this.isAllSelected()) {
            currentList.forEach(i => this.selectedIds.delete(i.id));
        } else {
            currentList.forEach(i => this.selectedIds.add(i.id));
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

    openDeleteModal(profile: RecurringInvoice, event: Event): void {
        event.stopPropagation();
        this.profileToDelete = profile;
        this.openMenuId = null;
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.router.navigate(['/sales/recurring-invoices/edit', id]);
    }

    navigateToInfo(id: string): void {
        this.router.navigate(['/sales/recurring-invoices/info', id]);
    }

    closeDeleteModal(): void {
        this.profileToDelete = null;
    }

    confirmDelete(): void {
        if (this.profileToDelete) {
            this.recurringInvoices = this.recurringInvoices.filter(i => i.id !== this.profileToDelete!.id);
            this.selectedIds.delete(this.profileToDelete.id);
            this.profileToDelete = null;
            
            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.recurringInvoices.length / Number(this.itemsPerPage)) || 1;
                if (this.currentPage > maxPage) {
                    this.currentPage = maxPage;
                }
            }
        }
    }

    handleBulkAction(actionId: string): void {
        if (actionId === 'delete') {
            this.recurringInvoices = this.recurringInvoices.filter(i => !this.selectedIds.has(i.id));
            this.selectedIds.clear();
            
            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.recurringInvoices.length / Number(this.itemsPerPage)) || 1;
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
