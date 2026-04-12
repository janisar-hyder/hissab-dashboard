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

export interface Expense {
    id: string;
    date: string;
    expenseAccount: string;
    paidThrough: string;
    amount: number;
    currency: string;
    [key: string]: any;
}

@Component({
    selector: 'app-expenses-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        DecimalPipe,
        ButtonComponent,
        EmptyStateComponent,
        PaginationComponent,
        BulkActionsComponent,
        ManageColumnsComponent,
        DeleteModalComponent
    ],
    templateUrl: './expenses-list.component.html',
    styleUrls: ['./expenses-list.component.scss']
})
export class ExpensesListComponent implements OnInit {
    expenses: Expense[] = [
        {
            id: 'EXP-001',
            date: '2026-03-16', // Using ISO for better sorting, display format in template
            expenseAccount: 'Employee Advance',
            paidThrough: 'Petty Cash',
            amount: 50.000,
            currency: 'BHD'
        },
        {
            id: 'EXP-002',
            date: '2026-03-10',
            expenseAccount: 'Advertising and Marketing',
            paidThrough: 'NBB',
            amount: 150.000,
            currency: 'BHD'
        },
        {
            id: 'EXP-003',
            date: '2026-02-26',
            expenseAccount: 'IT and Internet Expenses',
            paidThrough: 'BBK',
            amount: 20.000,
            currency: 'BHD'
        }
    ];

    selectedExpenseIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Expenses', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    expenseToDelete: Expense | null = null;
    bulkDeletePending = false;

    // Sorting and Filter properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchQuery: string = '';

    availableColumns: ColumnDef[] = [
        { id: 'date', label: 'Date', visible: true },
        { id: 'expenseAccount', label: 'Expense Account', visible: true },
        { id: 'paidThrough', label: 'Paid Through', visible: true },
        { id: 'amount', label: 'Amount', visible: true }
    ];

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    get filteredExpenses(): Expense[] {
        let filtered = this.expenses;

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(e => 
                e.expenseAccount.toLowerCase().includes(query) ||
                e.paidThrough.toLowerCase().includes(query) ||
                e.date.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedExpenses(): Expense[] {
        const filtered = this.filteredExpenses;
        if (this.itemsPerPage === 'All') return filtered;
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(start, start + this.itemsPerPage);
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.expenses.sort((a, b) => {
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
        if (this.selectedExpenseIds.has(id)) {
            this.selectedExpenseIds.delete(id);
        } else {
            this.selectedExpenseIds.add(id);
        }
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedExpenses;
        return currentList.length > 0 && currentList.every(e => this.selectedExpenseIds.has(e.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedExpenses;
        const selectedInCurrent = currentList.filter(e => this.selectedExpenseIds.has(e.id)).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(event?: any): void {
        const currentList = this.paginatedExpenses;
        if (this.isAllSelected()) {
            currentList.forEach(e => this.selectedExpenseIds.delete(e.id));
        } else {
            currentList.forEach(e => this.selectedExpenseIds.add(e.id));
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

    toggleMenu(id: string, event: Event): void {
        event.stopPropagation();
        if (this.openMenuId === id) {
            this.openMenuId = null;
        } else {
            this.openMenuId = id;
        }
    }

    openDeleteModal(expense: Expense, event: Event): void {
        event.stopPropagation();
        this.expenseToDelete = expense;
        this.openMenuId = null;
    }

    navigateToNew(): void {
        this.router.navigate(['/purchases/expenses/new']);
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.router.navigate(['/purchases/expenses/edit', id]);
    }

    closeDeleteModal(): void {
        this.expenseToDelete = null;
        this.bulkDeletePending = false;
    }

    confirmDelete(): void {
        const adjustPage = () => {
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.expenses.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) this.currentPage = maxPage;
            } else {
                this.currentPage = 1;
            }
        };

        if (this.bulkDeletePending) {
            this.expenses = this.expenses.filter(e => !this.selectedExpenseIds.has(e.id));
            this.selectedExpenseIds.clear();
            this.bulkDeletePending = false;
            adjustPage();
        } else if (this.expenseToDelete) {
            this.expenses = this.expenses.filter(e => e.id !== this.expenseToDelete!.id);
            this.selectedExpenseIds.delete(this.expenseToDelete.id);
            this.expenseToDelete = null;
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

    formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
}
