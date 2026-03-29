import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
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

export interface AccountNode {
    id: string;
    name: string;
    type: string;
    status: 'Active' | 'Inactive';
    isExpanded: boolean;
    children?: AccountNode[];
    isSelected?: boolean;
}

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
        DeleteModalComponent,
        CustomFilterComponent,
        EmptyStateComponent,
        BreadcrumbsComponent
    ],
    templateUrl: './chart-of-accounts-list.component.html',
    styleUrl: './chart-of-accounts-list.component.scss'
})
export class ChartOfAccountsListComponent implements OnInit {
    accounts: AccountNode[] = [
        { id: '1', name: 'Accounts Payable', type: 'Accounts Payable', status: 'Active', isExpanded: false },
        { id: '2', name: 'Accounts Receivable', type: 'Accounts Receivable', status: 'Active', isExpanded: false },
        {
            id: '3', name: 'General & Admin Expenses', type: 'Expense', status: 'Active', isExpanded: true,
            children: [
                {
                    id: '3-1', name: 'Office Expenses', type: 'Expense', status: 'Active', isExpanded: true,
                    children: [
                        { id: '3-1-1', name: 'Office Rent', type: 'Expense', status: 'Active', isExpanded: false },
                        { id: '3-1-2', name: 'Electricity Expenses', type: 'Expense', status: 'Active', isExpanded: false }
                    ]
                },
                { id: '3-2', name: 'Office Stationery', type: 'Expense', status: 'Active', isExpanded: false }
            ]
        },
        {
            id: '4', name: 'Sales', type: 'Income', status: 'Active', isExpanded: false,
            children: [
                { id: '4-1', name: 'Service Income', type: 'Income', status: 'Active', isExpanded: false },
                { id: '4-2', name: 'Prodcut Income', type: 'Income', status: 'Active', isExpanded: false }
            ]
        },
        { id: '5', name: 'Shipping Charges', type: 'Income', status: 'Inactive', isExpanded: false },
        { id: '6', name: 'Travel Expense', type: 'Income', status: 'Inactive', isExpanded: false }
    ];

    searchQuery: string = '';
    currentFilter: string = 'All';
    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    accountToDelete: AccountNode | null = null;
    bulkDeletePending = false;
    
    // Pagination (for the top level)
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

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
        { id: 'delete', label: 'Delete Accounts', colorClass: 'text-danger' }
    ];

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    // Hierarchy Expansion
    toggleExpand(node: AccountNode, event: Event): void {
        event.stopPropagation();
        node.isExpanded = !node.isExpanded;
    }

    // Filters & Search
    get filteredAccounts(): AccountNode[] {
        let list = this.accounts;
        if (this.currentFilter !== 'All') {
            list = list.filter(a => a.status === this.currentFilter);
        }
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            list = this.filterRecursively(list, query);
        }
        return list;
    }

    private filterRecursively(nodes: AccountNode[], query: string): AccountNode[] {
        return nodes.filter(node => {
            const matches = node.name.toLowerCase().includes(query) || node.type.toLowerCase().includes(query);
            const childrenMatch = node.children ? this.filterRecursively(node.children, query).length > 0 : false;
            return matches || childrenMatch;
        });
    }

    get paginatedAccounts(): AccountNode[] {
        const list = this.filteredAccounts;
        if (this.itemsPerPage === 'All') return list;
        const start = (this.currentPage - 1) * (this.itemsPerPage as number);
        return list.slice(start, start + (this.itemsPerPage as number));
    }

    setFilter(filter: string): void {
        this.currentFilter = filter;
        this.currentPage = 1;
    }

    clearSearch(): void {
        this.searchQuery = '';
    }

    // Bulk & Row Selection
    selectedAccountIds = new Set<string>();

    toggleSelection(node: AccountNode, event?: any): void {
        if (this.selectedAccountIds.has(node.id)) {
            this.selectedAccountIds.delete(node.id);
            if (node.children) this.deselectChildren(node.children);
        } else {
            this.selectedAccountIds.add(node.id);
            if (node.children) this.selectChildren(node.children);
        }
    }

    private selectChildren(children: AccountNode[]) {
        children.forEach(child => {
            this.selectedAccountIds.add(child.id);
            if (child.children) this.selectChildren(child.children);
        });
    }

    private deselectChildren(children: AccountNode[]) {
        children.forEach(child => {
            this.selectedAccountIds.delete(child.id);
            if (child.children) this.deselectChildren(child.children);
        });
    }

    isAllSelected(): boolean {
        const list = this.paginatedAccounts;
        return list.length > 0 && list.every(a => this.selectedAccountIds.has(a.id));
    }

    isPartiallySelected(): boolean {
        const list = this.paginatedAccounts;
        const selected = list.filter(a => this.selectedAccountIds.has(a.id)).length;
        return selected > 0 && selected < list.length;
    }

    toggleAll(event: any): void {
        const list = this.paginatedAccounts;
        if (this.isAllSelected()) {
            list.forEach(a => {
                this.selectedAccountIds.delete(a.id);
                if (a.children) this.deselectChildren(a.children);
            });
        } else {
            list.forEach(a => {
                this.selectedAccountIds.add(a.id);
                if (a.children) this.selectChildren(a.children);
            });
        }
    }

    // Actions & Menus
    toggleMenu(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = (this.openMenuId === id) ? null : id;
    }

    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.openMenuId = null;
        }
    }

    toggleManageColumns(): void { this.isManageColumnsOpen = true; }
    closeManageColumns(): void { this.isManageColumnsOpen = false; }
    onColumnsChange(cols: ColumnDef[]): void { this.availableColumns = cols; }

    openDeleteModal(node: AccountNode, event: Event): void {
        event.stopPropagation();
        this.accountToDelete = node;
        this.openMenuId = null;
    }

    closeDeleteModal(): void {
        this.accountToDelete = null;
        this.bulkDeletePending = false;
    }

    confirmDelete(): void {
        // Logic to remove from list (mock)
        if (this.bulkDeletePending) {
            this.accounts = this.accounts.filter(a => !this.selectedAccountIds.has(a.id));
            this.selectedAccountIds.clear();
        } else if (this.accountToDelete) {
            this.accounts = this.deleteRecursively(this.accounts, this.accountToDelete.id);
            this.selectedAccountIds.delete(this.accountToDelete.id);
        }
        this.closeDeleteModal();
    }

    private deleteRecursively(nodes: AccountNode[], id: string): AccountNode[] {
        return nodes.filter(node => {
            if (node.id === id) return false;
            if (node.children) node.children = this.deleteRecursively(node.children, id);
            return true;
        });
    }

    handleBulkAction(action: string): void {
        if (action === 'delete') this.bulkDeletePending = true;
    }

    onPageChange(page: number): void { this.currentPage = page; }
    onItemsPerPageChange(size: number | 'All'): void { this.itemsPerPage = size; this.currentPage = 1; }

    // Navigation
    navigateToNew(): void {
        console.log('Navigate to New Account');
    }
}
