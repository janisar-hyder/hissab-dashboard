import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';

export interface ExpenseHistory {
    date: string;
    expenseAccount: string;
    paidThrough: string;
    amount: number;
}

export interface RecurringExpense {
    id: string;
    profileName: string;
    expenseAccount: string;
    frequency: string;
    lastExpenseDate: string;
    nextExpenseDate: string;
    amount: number;
    status: 'Active' | 'Expired' | string;
    history?: ExpenseHistory[];
}

@Component({
    selector: 'app-recurring-expenses-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, PaginationComponent, CustomFilterComponent, DeleteModalComponent],
    templateUrl: './recurring-expenses-info.component.html',
    styleUrls: ['./recurring-expenses-info.component.scss']
})
export class RecurringExpensesInfoComponent implements OnInit {
    recurringExpenses: RecurringExpense[] = [
        { 
            id: '1', 
            profileName: 'Office Rent', 
            expenseAccount: 'Rent Expense', 
            frequency: '1 Month', 
            lastExpenseDate: '01 Mar, 2026', 
            nextExpenseDate: '01 Apr, 2026', 
            amount: 120.000, 
            status: 'Active',
            history: [
                { date: '01 Mar, 2026', expenseAccount: 'Rent Expense', paidThrough: 'BBK', amount: 120.000 },
                { date: '01 Feb, 2026', expenseAccount: 'Rent Expense', paidThrough: 'BBK', amount: 120.000 }
            ]
        },
        { 
            id: '2', 
            profileName: 'WIFI', 
            expenseAccount: 'IT and Internet Expenses', 
            frequency: '1 Month', 
            lastExpenseDate: '12 Feb, 2026', 
            nextExpenseDate: '14 March, 2026', 
            amount: 20.000, 
            status: 'Active',
            history: [
                { date: '10 Mar, 2026', expenseAccount: 'IT and Internet Expenses', paidThrough: 'BBK', amount: 20.000 },
                { date: '10 Feb, 2026', expenseAccount: 'IT and Internet Expenses', paidThrough: 'BBK', amount: 20.000 }
            ]
        },
        { 
            id: '3', 
            profileName: 'Social Media Management', 
            expenseAccount: 'Advertising And Marketing', 
            frequency: '2 Month', 
            lastExpenseDate: '01 March, 2026', 
            nextExpenseDate: '', 
            amount: 150.000, 
            status: 'Expired',
            history: [
                { date: '01 Mar, 2026', expenseAccount: 'Advertising And Marketing', paidThrough: 'Petty Cash', amount: 150.000 }
            ]
        }
    ];

    selectedExpense: RecurringExpense | null = null;
    searchTerm: string = '';
    selectedStatus: string = 'All';

    filterOptions: FilterOption[] = [
        { label: 'Active', value: 'Active', colorHex: '#10b981' },
        { label: 'Expired', value: 'Expired', colorHex: '#64748b' }
    ];

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.selectExpense(id);
            } else if (this.recurringExpenses.length > 0) {
                this.selectExpense(this.recurringExpenses[0].id);
            }
        });
    }

    get filteredExpenses(): RecurringExpense[] {
        let filtered = this.recurringExpenses;

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(re => 
                re.profileName.toLowerCase().includes(term) || 
                re.expenseAccount.toLowerCase().includes(term)
            );
        }

        if (this.selectedStatus !== 'All') {
            filtered = filtered.filter(re => re.status === this.selectedStatus);
        }

        return filtered;
    }

    onFilterChange(status: string): void {
        this.selectedStatus = status;
        this.currentPage = 1;
    }

    get paginatedExpenses(): RecurringExpense[] {
        const filtered = this.filteredExpenses;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + Number(this.itemsPerPage));
    }

    selectExpense(id: string): void {
        const found = this.recurringExpenses.find(re => re.id === id);
        if (found) {
            this.selectedExpense = found;
        }
    }

    onExpenseClick(id: string): void {
        this.router.navigate(['/purchases/recurring-expenses/info', id]);
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    onItemsPerPageChange(size: number | 'All') {
        this.itemsPerPage = size;
        this.currentPage = 1;
    }

    closeInfo(): void {
        this.router.navigate(['/purchases/recurring-expenses']);
    }

    navigateToNew(): void {
        this.router.navigate(['/purchases/recurring-expenses/new']);
    }

    navigateToEdit(): void {
        if (this.selectedExpense) {
            this.router.navigate(['/purchases/recurring-expenses/edit', this.selectedExpense.id]);
        }
    }
}
