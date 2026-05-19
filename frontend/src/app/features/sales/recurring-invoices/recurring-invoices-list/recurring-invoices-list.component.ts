import { ColumnPreferencesService } from '../../../../shared/services/column-preferences.service';
import { inject } from '@angular/core';
import { Component, OnInit, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
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
import { RecurringInvoicesService } from '../services/recurring-invoices.service';

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
    private columnPreferencesService = inject(ColumnPreferencesService);

    recurringInvoices: any[] = [];
    isLoading = true;

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
    isBulkDeleteModalOpen = false;
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
        { id: 'profile_name', label: 'Profile Name', visible: true},
        { id: 'customer_name', label: 'Customer', visible: true },
        { id: 'repeat_every', label: 'Frequency', visible: true },
        { id: 'last_invoice_date', label: 'Last Invoice Date', visible: true },
        { id: 'next_invoice_date', label: 'Next Invoice Date', visible: true },
        { id: 'grand_total', label: 'Amount', visible: true },
        { id: 'receivable_account', label: 'Account', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    get filteredInvoices(): any[] {
        let filtered = this.recurringInvoices;

        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(i => i.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(i => 
                (i.profile_name || '').toLowerCase().includes(query) ||
                (i.customer?.name || '').toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedInvoices(): any[] {
        const filtered = this.filteredInvoices;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + Number(this.itemsPerPage));
    }

    constructor(
        private eRef: ElementRef, 
        private router: Router,
        private recurringInvoicesService: RecurringInvoicesService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadRecurringInvoices();
    
        this.columnPreferencesService.loadPreferences('recurring-invoices-list', this.availableColumns).subscribe(cols => {
            this.availableColumns = cols;
            this.cdr.detectChanges();
        });
    }

    loadRecurringInvoices(): void {
        this.isLoading = true;
        this.recurringInvoicesService.getRecurringInvoices().subscribe({
            next: (res) => {
                this.recurringInvoices = res.data || [];
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching recurring invoices:', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

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
            let valA = (a as any)[columnId];
            let valB = (b as any)[columnId];

            if (columnId === 'customer_name') {
                valA = a.customer?.name || '';
                valB = b.customer?.name || '';
            }

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

    toggleSelection(id: any): void {
        const idStr = id.toString();
        if (this.selectedIds.has(idStr)) {
            this.selectedIds.delete(idStr);
        } else {
            this.selectedIds.add(idStr);
        }
        this.cdr.detectChanges();
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedInvoices;
        return currentList.length > 0 && currentList.every(i => this.selectedIds.has(i.id.toString()));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedInvoices;
        const selectedInCurrent = currentList.filter(i => this.selectedIds.has(i.id.toString())).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(event?: any): void {
        const currentList = this.paginatedInvoices;
        if (this.isAllSelected()) {
            currentList.forEach(i => this.selectedIds.delete(i.id.toString()));
        } else {
            currentList.forEach(i => this.selectedIds.add(i.id.toString()));
        }
        this.cdr.detectChanges();
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

    openDeleteModal(profile: any, event: Event): void {
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
            this.recurringInvoicesService.deleteRecurringInvoice(this.profileToDelete.id).subscribe({
                next: () => {
                    this.recurringInvoices = this.recurringInvoices.filter(i => i.id !== this.profileToDelete!.id);
                    this.selectedIds.delete(this.profileToDelete!.id.toString());
                    this.profileToDelete = null;
                    this.cdr.detectChanges();
                    
                    if (this.itemsPerPage !== 'All') {
                        const maxPage = Math.ceil(this.recurringInvoices.length / Number(this.itemsPerPage)) || 1;
                        if (this.currentPage > maxPage) {
                            this.currentPage = maxPage;
                        }
                    }
                },
                error: (err) => {
                    console.error('Error deleting recurring invoice:', err);
                }
            });
        }
    }

    get availableBulkActions(): BulkAction[] {
        const selectedProfiles = this.recurringInvoices.filter(i => this.selectedIds.has(i.id.toString()));
        if (selectedProfiles.length === 0) return [];

        const hasActive = selectedProfiles.some(p => p.status === 'Active');
        const hasExpired = selectedProfiles.some(p => p.status === 'Expired' || p.status === 'Inactive');

        const actions: BulkAction[] = [
            { id: 'delete', label: 'Delete Profiles', colorClass: 'text-danger' }
        ];

        if (hasActive) {
            actions.push({ id: 'inactive', label: 'Mark as Inactive' });
        }
        if (hasExpired) {
            actions.push({ id: 'active', label: 'Mark as Active' });
        }

        return actions;
    }

    handleBulkAction(actionId: string): void {
        if (actionId === 'delete') {
            this.isBulkDeleteModalOpen = true;
        } else if (actionId === 'active' || actionId === 'inactive') {
            const status = actionId === 'active' ? 'Active' : 'Expired';
            const ids = Array.from(this.selectedIds);
            this.recurringInvoicesService.updateBulkStatus(ids, status).subscribe({
                next: () => {
                    this.loadRecurringInvoices();
                    this.selectedIds.clear();
                },
                error: (err) => console.error('Error updating bulk status:', err)
            });
        }
    }

    confirmBulkDelete(): void {
        const idsToDelete = Array.from(this.selectedIds);
        this.recurringInvoicesService.deleteBulkRecurringInvoices(idsToDelete).subscribe({
            next: () => {
                this.recurringInvoices = this.recurringInvoices.filter(i => !this.selectedIds.has(i.id.toString()));
                this.selectedIds.clear();
                this.isBulkDeleteModalOpen = false;
                
                if (this.itemsPerPage !== 'All') {
                    const maxPage = Math.ceil(this.recurringInvoices.length / Number(this.itemsPerPage)) || 1;
                    if (this.currentPage > maxPage) {
                        this.currentPage = maxPage;
                    }
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error bulk deleting recurring invoices:', err);
                this.isBulkDeleteModalOpen = false;
            }
        });
    }

    closeBulkDeleteModal(): void {
        this.isBulkDeleteModalOpen = false;
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    onItemsPerPageChange(size: number | 'All') {
        this.itemsPerPage = size;
        this.currentPage = 1;
    }
}
