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

export interface RecurringExpense {
    id: string;
    profileName: string;
    expenseAccount: string;
    frequency: string;
    lastExpenseDate: string;
    nextExpenseDate: string;
    amount: number;
    status: 'Active' | 'Expired' | string;
}

@Component({
    selector: 'app-recurring-expenses-list',
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
    templateUrl: './recurring-expenses-list.component.html',
    styleUrl: './recurring-expenses-list.component.scss'
})
export class RecurringExpensesListComponent implements OnInit {
    recurringExpenses: RecurringExpense[] = [
        { id: '1', profileName: 'Office Rent', expenseAccount: 'Rent Expense', frequency: '1 Month', lastExpenseDate: '01 Mar, 2026', nextExpenseDate: '01 Apr, 2026', amount: 120.000, status: 'Active' },
        { id: '2', profileName: 'WIFI', expenseAccount: 'IT and Internet Expenses', frequency: '1 Months', lastExpenseDate: '12 Feb, 2026', nextExpenseDate: '14 March, 2026', amount: 20.000, status: 'Active' },
        { id: '3', profileName: 'Social Media Management', expenseAccount: 'Advertising And Marketing', frequency: '2 Month', lastExpenseDate: '01 March, 2026', nextExpenseDate: '', amount: 150.000, status: 'Expired' }
    ];

    selectedRecurringExpenseIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Recurring Expenses', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    expenseToDelete: RecurringExpense | null = null;
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
        { id: 'expenseAccount', label: 'Expense Account', visible: true },
        { id: 'frequency', label: 'Frequency', visible: true },
        { id: 'lastExpenseDate', label: 'Last Expense Date', visible: true },
        { id: 'nextExpenseDate', label: 'Next Expense Date', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    get filteredExpenses(): RecurringExpense[] {
        let filtered = this.recurringExpenses;

        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(re => re.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(re => 
                re.profileName.toLowerCase().includes(query) ||
                re.expenseAccount.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedExpenses(): RecurringExpense[] {
        const filtered = this.filteredExpenses;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + this.itemsPerPage);
    }

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    navigateToNew(): void {
        this.router.navigate(['/purchases/recurring-expenses/new']);
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.recurringExpenses.sort((a, b) => {
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
        if (this.selectedRecurringExpenseIds.has(id)) {
            this.selectedRecurringExpenseIds.delete(id);
        } else {
            this.selectedRecurringExpenseIds.add(id);
        }
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedExpenses;
        return currentList.length > 0 && currentList.every(re => this.selectedRecurringExpenseIds.has(re.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedExpenses;
        const selectedInCurrent = currentList.filter(re => this.selectedRecurringExpenseIds.has(re.id)).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(event?: any): void {
        const currentList = this.paginatedExpenses;
        if (this.isAllSelected()) {
            currentList.forEach(re => this.selectedRecurringExpenseIds.delete(re.id));
        } else {
            currentList.forEach(re => this.selectedRecurringExpenseIds.add(re.id));
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

    setFilter(filter: 'All' | 'Active' | 'Expired' | string): void {
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

    openDeleteModal(expense: RecurringExpense, event: Event): void {
        event.stopPropagation();
        this.expenseToDelete = expense;
        this.openMenuId = null;
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.router.navigate(['/purchases/recurring-expenses/edit', id]);
    }

    navigateToInfo(id: string): void {
        this.router.navigate(['/purchases/recurring-expenses/info', id]);
    }

    closeDeleteModal(): void {
        this.expenseToDelete = null;
    }

    confirmDelete(): void {
        if (this.expenseToDelete) {
            this.recurringExpenses = this.recurringExpenses.filter(re => re.id !== this.expenseToDelete!.id);
            this.selectedRecurringExpenseIds.delete(this.expenseToDelete.id);
            this.expenseToDelete = null;
            
            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.recurringExpenses.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) {
                    this.currentPage = maxPage;
                }
            }
        }
    }

    handleBulkAction(actionId: string): void {
        if (actionId === 'delete') {
            this.recurringExpenses = this.recurringExpenses.filter(re => !this.selectedRecurringExpenseIds.has(re.id));
            this.selectedRecurringExpenseIds.clear();
            
            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.recurringExpenses.length / this.itemsPerPage) || 1;
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
