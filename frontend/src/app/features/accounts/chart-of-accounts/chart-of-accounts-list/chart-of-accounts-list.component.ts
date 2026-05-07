import { Component, OnInit, ElementRef, HostListener, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BulkActionsComponent, BulkAction } from '../../../../shared/components/bulk-actions/bulk-actions.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';
import { CreateAccountModalComponent } from '../components/create-account-modal/create-account-modal.component';
import { SelectOption } from '../../../../shared/components/custom-select/custom-select.component';
import { ChartOfAccountsService, AccountNode } from '../services/chart-of-accounts.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ActionMenu, MenuAction } from '../../../../shared/components/action-menu/action-menu';


@Component({
    selector: 'app-chart-of-accounts-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonComponent,
        PaginationComponent,
        BulkActionsComponent,
        ManageColumnsComponent,
        CustomFilterComponent,
        EmptyStateComponent,
        BreadcrumbsComponent,
        CreateAccountModalComponent,
        ActionMenu,
        DeleteModalComponent
    ],
    templateUrl: './chart-of-accounts-list.component.html',
    styleUrl: './chart-of-accounts-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartOfAccountsListComponent implements OnInit {
    accounts = signal<AccountNode[]>([]);
    isLoading = signal(false);

    searchQuery = signal('');
    currentFilter = signal('All');
    isManageColumnsOpen = signal(false);
    isCreateModalOpen = signal(false);
    accountToDelete = signal<AccountNode | null>(null);
    accountToEdit = signal<AccountNode | null>(null);
    bulkDeletePending = signal(false);
    
    // Pagination (for the top level)
    currentPage = signal(1);
    itemsPerPage = signal<number | 'All'>(15);
    sortColumn = signal('');
    sortDirection = signal<'asc' | 'desc'>('asc');

    filterOptions: FilterOption[] = [
        { label: 'Active', value: 'Active', colorHex: '#10b981' },
        { label: 'Inactive', value: 'Inactive', colorHex: '#64748b' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'name', label: 'Account Name', visible: true },
        { id: 'type', label: 'Type', visible: true },
        { id: 'status', label: 'Status', visible: true }
    ];

    bulkActions: BulkAction[] = [
        { id: 'mark_active', label: 'Mark As Active', icon: 'las la-check-circle' },
        { id: 'mark_inactive', label: 'Mark As Inactive', icon: 'las la-times-circle' },
        { id: 'delete', label: 'Delete Accounts', colorClass: 'text-danger', icon: 'las la-trash' }
    ];

    // Bulk & Row Selection - converted to Signal for reactivity
    selectedAccountIds = signal<Set<string>>(new Set<string>());

    dynamicBulkActions = computed(() => {
        const selectedIds = this.selectedAccountIds();
        if (selectedIds.size === 0) return [];

        // Flatten all accounts to find statuses of selected IDs
        const allNodes: AccountNode[] = [];
        const flatten = (nodes: AccountNode[]) => {
            nodes.forEach(n => {
                allNodes.push(n);
                if (n.children) flatten(n.children);
            });
        };
        flatten(this.accounts());

        const selectedAccounts = allNodes.filter(a => selectedIds.has(a.id));
        const allActive = selectedAccounts.every(a => a.status === 'Active');
        const allInactive = selectedAccounts.every(a => a.status === 'Inactive');

        return this.bulkActions.filter(action => {
            if (action.id === 'mark_active') return !allActive;
            if (action.id === 'mark_inactive') return !allInactive;
            return true; // Always show delete
        });
    });

    trackById(index: number, node: AccountNode): string {
        return node.id;
    }

    constructor(
        private eRef: ElementRef, 
        private router: Router,
        private coaService: ChartOfAccountsService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadAccounts();
    }

    loadAccounts(): void {
        this.isLoading.set(true);
        this.coaService.getAccounts().subscribe({
            next: (res) => {
                const data = res.data || [];
                // Build tree if backend returns flat list, or just set if it's already a tree
                const tree = this.buildTree(data);
                this.accounts.set(tree);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading accounts:', err);
                this.notificationService.error('Failed to load chart of accounts');
                this.isLoading.set(false);
            }
        });
    }

    private buildTree(nodes: AccountNode[]): AccountNode[] {
        const map = new Map<string, AccountNode>();
        const tree: AccountNode[] = [];

        // First pass: Create map of all nodes
        nodes.forEach(node => {
            map.set(node.id, { ...node, children: [] });
        });

        // Second pass: Connect children to parents
        nodes.forEach(node => {
            const mappedNode = map.get(node.id)!;
            const parentId = node.parentId || (node as any).parent_id;
            
            if (parentId && map.has(parentId)) {
                const parent = map.get(parentId)!;
                parent.children = parent.children || [];
                parent.children.push(mappedNode);
            } else {
                tree.push(mappedNode);
            }
        });

        return tree;
    }

    // Hierarchy Expansion
    toggleExpand(node: AccountNode, event: Event): void {
        event.stopPropagation();
        node.isExpanded = !node.isExpanded;
    }

    // Filters & Search
    filteredAccounts = computed(() => {
        let list = this.accounts();
        const filterVal = this.currentFilter();
        const query = this.searchQuery().toLowerCase();

        if (filterVal !== 'All') {
            list = list.filter(a => a.status === filterVal);
        }
        if (query) {
            list = this.filterRecursively(list, query);
        }
        return list;
    });

    private filterRecursively(nodes: AccountNode[], query: string): AccountNode[] {
        return nodes.filter(node => {
            const matches = node.name.toLowerCase().includes(query) || node.type.toLowerCase().includes(query);
            const childrenMatch = node.children ? this.filterRecursively(node.children, query).length > 0 : false;
            return matches || childrenMatch;
        });
    }

    paginatedAccounts = computed(() => {
        const list = this.filteredAccounts();
        const perPage = this.itemsPerPage();
        if (perPage === 'All') return list;
        const start = (this.currentPage() - 1) * (perPage as number);
        return list.slice(start, start + (perPage as number));
    });

    setFilter(filter: string): void {
        this.currentFilter.set(filter);
        this.currentPage.set(1);
    }

    clearSearch(): void {
        this.searchQuery.set('');
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn() === columnId) {
            this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(columnId);
            this.sortDirection.set('asc');
        }

        const sortNodes = (nodes: AccountNode[]) => {
            const dir = this.sortDirection();
            nodes.sort((a, b) => {
                const valA = (a as any)[columnId === 'name' ? 'name' : columnId];
                const valB = (b as any)[columnId === 'name' ? 'name' : columnId];

                if (typeof valA === 'string' && typeof valB === 'string') {
                    return dir === 'asc'
                        ? valA.localeCompare(valB)
                        : valB.localeCompare(valA);
                } else {
                    return dir === 'asc'
                        ? (valA > valB ? 1 : -1)
                        : (valA < valB ? 1 : -1);
                }
            });
            nodes.forEach(node => {
                if (node.children) sortNodes(node.children);
            });
        };

        this.accounts.update(prev => {
            const newList = [...prev];
            sortNodes(newList);
            return newList;
        });
    }

    toggleSelection(node: AccountNode, event?: any): void {
        this.selectedAccountIds.update(set => {
            const newSet = new Set(set);
            if (newSet.has(node.id)) {
                newSet.delete(node.id);
                if (node.children) this.deselectChildrenInSet(node.children, newSet);
            } else {
                newSet.add(node.id);
                if (node.children) this.selectChildrenInSet(node.children, newSet);
            }
            return newSet;
        });
    }

    private selectChildrenInSet(children: AccountNode[], set: Set<string>) {
        children.forEach(child => {
            set.add(child.id);
            if (child.children) this.selectChildrenInSet(child.children, set);
        });
    }

    private deselectChildrenInSet(children: AccountNode[], set: Set<string>) {
        children.forEach(child => {
            set.delete(child.id);
            if (child.children) this.deselectChildrenInSet(child.children, set);
        });
    }

    isAllSelected = computed(() => {
        const list = this.paginatedAccounts();
        const selected = this.selectedAccountIds();
        return list.length > 0 && list.every(a => selected.has(a.id));
    });

    isPartiallySelected = computed(() => {
        const list = this.paginatedAccounts();
        const selected = this.selectedAccountIds();
        const selectedInPage = list.filter(a => selected.has(a.id)).length;
        return selectedInPage > 0 && selectedInPage < list.length;
    });

    toggleAll(event: any): void {
        const list = this.paginatedAccounts();
        if (this.isAllSelected()) {
            this.selectedAccountIds.update(set => {
                const newSet = new Set(set);
                list.forEach(a => {
                    newSet.delete(a.id);
                    if (a.children) this.deselectChildrenInSet(a.children, newSet);
                });
                return newSet;
            });
        } else {
            this.selectedAccountIds.update(set => {
                const newSet = new Set(set);
                list.forEach(a => {
                    newSet.add(a.id);
                    if (a.children) this.selectChildrenInSet(a.children, newSet);
                });
                return newSet;
            });
        }
    }

    getActions(node: AccountNode): MenuAction[] {
        const actions: MenuAction[] = [
            { label: 'Edit', action: 'edit' },
        ];

        if (node.status === 'Active') {
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
                this.openEditModal(node, new MouseEvent('click'));
                break;
            case 'mark_active':
                this.updateStatus(node.id, 'Active');
                break;
            case 'mark_inactive':
                this.updateStatus(node.id, 'Inactive');
                break;
            case 'delete':
                this.openDeleteModal(node, new MouseEvent('click'));
                break;
        }
    }

    toggleManageColumns(): void { this.isManageColumnsOpen.set(true); }
    closeManageColumns(): void { this.isManageColumnsOpen.set(false); }
    onColumnsChange(cols: ColumnDef[]): void { this.availableColumns = cols; }

    openDeleteModal(node: AccountNode, event: Event): void {
        event.stopPropagation();
        this.accountToDelete.set(node);
    }

    openEditModal(node: AccountNode, event: Event): void {
        event.stopPropagation();
        this.accountToEdit.set(node);
        this.isCreateModalOpen.set(true);
    }

    updateStatus(id: string, status: 'Active' | 'Inactive'): void {
        this.coaService.updateAccount(id, { status }).subscribe({
            next: (res) => {
                this.notificationService.success(`Account marked as ${status}`);
                this.updateAccountInSignal(id, res.data);
            },
            error: (err) => {
                console.error('Error updating status:', err);
                this.notificationService.error('Failed to update status');
            }
        });
    }

    private updateAccountInSignal(id: string, updatedNode: AccountNode) {
        this.accounts.update(prev => {
            const updateRecursive = (nodes: AccountNode[]): AccountNode[] => {
                return nodes.map(node => {
                    if (node.id === id) return { ...node, ...updatedNode };
                    if (node.children) return { ...node, children: updateRecursive(node.children) };
                    return node;
                });
            };
            return updateRecursive(prev);
        });
    }

    closeDeleteModal(): void {
        this.accountToDelete.set(null);
        this.bulkDeletePending.set(false);
    }

    confirmDelete(): void {
        const isBulk = this.bulkDeletePending();
        const toDelete = this.accountToDelete();

        if (isBulk) {
            const ids = Array.from(this.selectedAccountIds());
            this.coaService.deleteBulkAccounts(ids).subscribe({
                next: () => {
                    this.notificationService.success('Accounts deleted successfully');
                    this.accounts.update(prev => this.removeIdsFromTree(prev, ids));
                    this.selectedAccountIds.set(new Set<string>());
                },
                error: (err) => {
                    console.error('Error deleting accounts:', err);
                    this.notificationService.error('Failed to delete accounts');
                }
            });
        } else if (toDelete) {
            this.coaService.deleteAccount(toDelete.id).subscribe({
                next: () => {
                    this.notificationService.success('Account deleted successfully');
                    this.accounts.update(prev => this.removeIdsFromTree(prev, [toDelete.id]));
                },
                error: (err) => {
                    console.error('Error deleting account:', err);
                    this.notificationService.error('Failed to delete account');
                }
            });
        }
        this.closeDeleteModal();
    }

    private removeIdsFromTree(nodes: AccountNode[], ids: string[]): AccountNode[] {
        return nodes.filter(node => {
            if (ids.includes(node.id)) return false;
            if (node.children) node.children = this.removeIdsFromTree(node.children, ids);
            return true;
        });
    }


    handleBulkAction(action: string): void {
        if (action === 'delete') {
            this.bulkDeletePending.set(true);
        } else if (action === 'mark_active' || action === 'mark_inactive') {
            const status = action === 'mark_active' ? 'Active' : 'Inactive';
            const ids = Array.from(this.selectedAccountIds());
            this.coaService.updateBulkStatus(ids, status).subscribe({
                next: () => {
                    this.notificationService.success(`Status updated to ${status}`);
                    // Update local state instead of full load to avoid re-render
                    this.accounts.update(prev => {
                        const updateRecursive = (nodes: AccountNode[]): AccountNode[] => {
                            return nodes.map(node => {
                                let newNode = { ...node };
                                if (ids.includes(node.id)) {
                                    newNode.status = status;
                                }
                                if (node.children) {
                                    newNode.children = updateRecursive(node.children);
                                }
                                return newNode;
                            });
                        };
                        return updateRecursive(prev);
                    });
                    this.selectedAccountIds.set(new Set<string>());
                },
                error: (err) => {
                    console.error('Error updating status:', err);
                    this.notificationService.error('Failed to update status');
                }
            });
        }
    }

    onPageChange(page: number): void { this.currentPage.set(page); }
    onItemsPerPageChange(size: number | 'All'): void { this.itemsPerPage.set(size); this.currentPage.set(1); }

    // Create Modal Logic
    parentAccountOptions = computed(() => {
        const options: SelectOption[] = [];
        const toEdit = this.accountToEdit();
        const excludeId = toEdit?.id;

        const flatten = (nodes: AccountNode[]) => {
            nodes.forEach(node => {
                if (node.id !== excludeId) {
                    options.push({ label: node.name, value: node.id });
                    if (node.children) flatten(node.children);
                }
            });
        };
        flatten(this.accounts());
        return options;
    });

    openCreateModal(): void {
        this.isCreateModalOpen.set(true);
    }

    closeCreateModal(): void {
        this.isCreateModalOpen.set(false);
        this.accountToEdit.set(null);
    }

    saveAccount(data: any): void {
        const toEdit = this.accountToEdit();
        const payload = {
            ...data,
            parentId: data.addParent ? data.parentId : null,
            parent_id: data.addParent ? data.parentId : null 
        };

        if (toEdit) {
            this.coaService.updateAccount(toEdit.id, payload).subscribe({
                next: (res) => {
                    this.notificationService.success('Account updated successfully');
                    this.loadAccounts(); 
                    this.closeCreateModal();
                },
                error: (err) => {
                    console.error('Error updating account:', err);
                    this.notificationService.error('Failed to update account');
                }
            });
        } else {
            this.coaService.createAccount(payload).subscribe({
                next: (res) => {
                    this.notificationService.success('Account created successfully');
                    this.loadAccounts();
                    this.closeCreateModal();
                },
                error: (err) => {
                    console.error('Error creating account:', err);
                    this.notificationService.error('Failed to create account');
                }
            });
        }
    }


    // Navigation
    navigateToNew(): void {
        this.openCreateModal();
    }
}
