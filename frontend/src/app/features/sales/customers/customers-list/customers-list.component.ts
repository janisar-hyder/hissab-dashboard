import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BulkActionsComponent, BulkAction } from '../../../../shared/components/bulk-actions/bulk-actions.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { ActionMenu, MenuAction } from '../../../../shared/components/action-menu/action-menu';
import { CustomersService, Customer } from '../services/customers.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
    selector: 'app-customers-list',
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
        ActionMenu
    ],
    templateUrl: './customers-list.component.html',
    styleUrls: ['./customers-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersListComponent implements OnInit {
    private coaService = inject(CustomersService);
    private notificationService = inject(NotificationService);
    private router = inject(Router);

    customers = signal<Customer[]>([]);
    isLoading = signal(false);

    selectedCustomerIds = signal<Set<number>>(new Set<number>());

    // Pagination properties
    currentPage = signal(1);
    itemsPerPage = signal<number | 'All'>(15);

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'mark_active', label: 'Mark As Active', icon: 'las la-check-circle' },
        { id: 'mark_inactive', label: 'Mark As Inactive', icon: 'las la-times-circle' },
        { id: 'delete', label: 'Delete Customers', colorClass: 'text-danger', icon: 'las la-trash' }
    ];

    dynamicBulkActions = computed(() => {
        const selectedIds = this.selectedCustomerIds();
        if (selectedIds.size === 0) return [];

        const selectedList = this.customers().filter(c => selectedIds.has(c.id));
        const allActive = selectedList.every(c => c.is_active);
        const allInactive = selectedList.every(c => !c.is_active);

        return this.bulkActions.filter(action => {
            if (action.id === 'mark_active') return !allActive;
            if (action.id === 'mark_inactive') return !allInactive;
            return true;
        });
    });

    isManageColumnsOpen = signal(false);
    customerToDelete = signal<Customer | null>(null);
    bulkDeletePending = signal(false);

    // Sorting and Filter properties
    sortColumn = signal('');
    sortDirection = signal<'asc' | 'desc'>('asc');
    searchQuery = signal('');

    availableColumns: ColumnDef[] = [
        { id: 'name', label: 'Display Name', visible: true },
        { id: 'email', label: 'Email', visible: true },
        { id: 'phone', label: 'Phone', visible: true },
        { id: 'receivables', label: 'Receivables', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    filteredCustomers = computed(() => {
        let filtered = this.customers();
        const query = this.searchQuery().toLowerCase();

        if (query) {
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(query) ||
                (c.email && c.email.toLowerCase().includes(query)) ||
                (c.phone && c.phone.toLowerCase().includes(query))
            );
        }

        const col = this.sortColumn();
        const dir = this.sortDirection();
        if (col) {
            filtered = [...filtered].sort((a, b) => {
                const valA = (a as any)[col] || '';
                const valB = (b as any)[col] || '';
                return dir === 'asc' 
                    ? String(valA).localeCompare(String(valB))
                    : String(valB).localeCompare(String(valA));
            });
        }

        return filtered;
    });

    paginatedCustomers = computed(() => {
        const filtered = this.filteredCustomers();
        const size = this.itemsPerPage();
        if (size === 'All') return filtered;
        const start = (this.currentPage() - 1) * size;
        return filtered.slice(start, start + size);
    });

    ngOnInit(): void {
        this.loadCustomers();
    }

    loadCustomers(): void {
        this.isLoading.set(true);
        this.coaService.getCustomers().subscribe({
            next: (res) => {
                this.customers.set(res.data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading customers:', err);
                this.notificationService.error('Failed to load customers');
                this.isLoading.set(false);
            }
        });
    }

    navigateToNew(): void {
        this.router.navigate(['/sales/customers/new']);
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn() === columnId) {
            this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(columnId);
            this.sortDirection.set('asc');
        }
    }

    toggleSelection(id: number): void {
        this.selectedCustomerIds.update(set => {
            const newSet = new Set(set);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    }

    isAllSelected = computed(() => {
        const list = this.paginatedCustomers();
        const selected = this.selectedCustomerIds();
        return list.length > 0 && list.every(c => selected.has(c.id));
    });

    isPartiallySelected = computed(() => {
        const list = this.paginatedCustomers();
        const selected = this.selectedCustomerIds();
        const selectedInPage = list.filter(c => selected.has(c.id)).length;
        return selectedInPage > 0 && selectedInPage < list.length;
    });

    toggleAll(event?: any): void {
        const list = this.paginatedCustomers();
        this.selectedCustomerIds.update(set => {
            const newSet = new Set(set);
            if (this.isAllSelected()) {
                list.forEach(c => newSet.delete(c.id));
            } else {
                list.forEach(c => newSet.add(c.id));
            }
            return newSet;
        });
    }

    trackById(index: number, item: Customer): number {
        return item.id;
    }

    clearSearch() {
        this.searchQuery.set('');
        this.currentPage.set(1);
    }

    toggleManageColumns() {
        this.isManageColumnsOpen.set(true);
    }

    closeManageColumns() {
        this.isManageColumnsOpen.set(false);
    }

    onColumnsChange(updatedColumns: ColumnDef[]): void {
        this.availableColumns = updatedColumns;
    }

    getActions(node: Customer): MenuAction[] {
        const actions: MenuAction[] = [
            { label: 'Edit', action: 'edit' },
        ];

        if (node.is_active) {
            actions.push({ label: 'Mark As Inactive', action: 'mark_inactive' });
        } else {
            actions.push({ label: 'Mark As Active', action: 'mark_active' });
        }

        actions.push({ label: 'Delete', action: 'delete', customClass: 'delete-btn' });
        return actions;
    }

    handleAction(event: { action: string, data: any }): void {
        const { action, data: node } = event;
        switch (action) {
            case 'edit':
                this.router.navigate(['/sales/customers/edit', node.id]);
                break;
            case 'mark_active':
                this.updateStatus(node.id, true);
                break;
            case 'mark_inactive':
                this.updateStatus(node.id, false);
                break;
            case 'delete':
                this.customerToDelete.set(node);
                break;
        }
    }

    updateStatus(id: number, isActive: boolean): void {
        this.coaService.updateCustomer(id, { is_active: isActive }).subscribe({
            next: () => {
                this.notificationService.success(`Customer marked as ${isActive ? 'Active' : 'Inactive'}`);
                this.customers.update(prev => prev.map(c => c.id === id ? { ...c, is_active: isActive } : c));
            },
            error: () => this.notificationService.error('Failed to update status')
        });
    }

    closeDeleteModal(): void {
        this.customerToDelete.set(null);
        this.bulkDeletePending.set(false);
    }

    confirmDelete(): void {
        const isBulk = this.bulkDeletePending();
        const toDelete = this.customerToDelete();

        if (isBulk) {
            const ids = Array.from(this.selectedCustomerIds());
            this.coaService.deleteBulkCustomers(ids).subscribe({
                next: () => {
                    this.notificationService.success('Customers deleted successfully');
                    this.customers.update(prev => prev.filter(c => !ids.includes(c.id)));
                    this.selectedCustomerIds.set(new Set<number>());
                    this.closeDeleteModal();
                },
                error: () => this.notificationService.error('Failed to delete customers')
            });
        } else if (toDelete) {
            this.coaService.deleteCustomer(toDelete.id).subscribe({
                next: () => {
                    this.notificationService.success('Customer deleted successfully');
                    this.customers.update(prev => prev.filter(c => c.id !== toDelete.id));
                    this.selectedCustomerIds.update(set => {
                        const newSet = new Set(set);
                        newSet.delete(toDelete.id);
                        return newSet;
                    });
                    this.closeDeleteModal();
                },
                error: () => this.notificationService.error('Failed to delete customer')
            });
        }
    }

    handleBulkAction(actionId: string): void {
        if (actionId === 'delete') {
            this.bulkDeletePending.set(true);
        } else if (actionId === 'mark_active' || actionId === 'mark_inactive') {
            const isActive = actionId === 'mark_active';
            const ids = Array.from(this.selectedCustomerIds());
            this.coaService.updateBulkStatus(ids, isActive).subscribe({
                next: () => {
                    this.notificationService.success(`Status updated for ${ids.length} customers`);
                    this.customers.update(prev => prev.map(c => ids.includes(c.id) ? { ...c, is_active: isActive } : c));
                    this.selectedCustomerIds.set(new Set<number>());
                },
                error: () => this.notificationService.error('Failed to update status')
            });
        }
    }

    onPageChange(page: number) { this.currentPage.set(page); }
    onItemsPerPageChange(size: number | 'All') { this.itemsPerPage.set(size); this.currentPage.set(1); }
}
