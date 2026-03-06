import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BulkActionsComponent, BulkAction } from '../../../../shared/components/bulk-actions/bulk-actions.component';
import { ManageColumnsComponent, ColumnDefinition } from '../../../../shared/components/manage-columns/manage-columns.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';

export interface Quotation {
    id: string;
    quotationNumber: string;
    date: string;
    customerName: string;
    amount: number;
    status: 'Sent' | 'Invoiced' | 'Draft';
}

@Component({
    selector: 'app-quotations-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, DecimalPipe, EmptyStateComponent, PaginationComponent, BulkActionsComponent, ManageColumnsComponent, DeleteModalComponent],
    templateUrl: './quotations-list.component.html',
    styleUrls: ['./quotations-list.component.scss']
})
export class QuotationsListComponent implements OnInit {
    quotations: Quotation[] = [
        { id: '1', quotationNumber: 'Q-004', date: '01 Apr, 2026', customerName: 'Transpak Equipment', amount: 1267.000, status: 'Sent' },
        { id: '2', quotationNumber: 'Q-003', date: '16 Mar, 2026', customerName: 'Sigler Wholesale', amount: 9847.000, status: 'Invoiced' },
        { id: '3', quotationNumber: 'Q-002', date: '10 Mar, 2026', customerName: 'The Habegger Corp', amount: 550.000, status: 'Draft' },
        { id: '4', quotationNumber: 'Q-001', date: '04 Mar, 2026', customerName: 'ABCO HVACR Supply', amount: 88.000, status: 'Sent' }
    ];

    selectedQuotationIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Quotations', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    quotationToDelete: Quotation | null = null;
    isFilterMenuOpen = false;
    currentFilter: 'All' | 'Sent' | 'Invoiced' | 'Draft' = 'All';

    availableColumns: ColumnDefinition[] = [
        { id: 'quotationNumber', label: 'Quotation Number', checked: true },
        { id: 'date', label: 'Date', checked: true },
        { id: 'customerName', label: 'Customer Name', checked: true },
        { id: 'amount', label: 'Amount', checked: true },
        { id: 'status', label: 'Status', checked: true }
    ];

    get filteredQuotations(): Quotation[] {
        if (this.currentFilter === 'All') {
            return this.quotations;
        }
        return this.quotations.filter(q => q.status === this.currentFilter);
    }

    get paginatedQuotations(): Quotation[] {
        const filtered = this.filteredQuotations;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + this.itemsPerPage);
    }

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    navigateToNew(): void {
        this.router.navigate(['/sales/quotations/new']);
    }

    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.openMenuId = null;
            this.isFilterMenuOpen = false;
        }
    }

    toggleSelection(id: string): void {
        if (this.selectedQuotationIds.has(id)) {
            this.selectedQuotationIds.delete(id);
        } else {
            this.selectedQuotationIds.add(id);
        }
    }

    isAllSelected(): boolean {
        return this.selectedQuotationIds.size === this.quotations.length && this.quotations.length > 0;
    }

    toggleAll(): void {
        if (this.isAllSelected()) {
            this.selectedQuotationIds.clear();
        } else {
            this.quotations.forEach(q => this.selectedQuotationIds.add(q.id));
        }
    }

    toggleManageColumns(): void {
        this.isManageColumnsOpen = !this.isManageColumnsOpen;
    }

    closeManageColumns(): void {
        this.isManageColumnsOpen = false;
    }

    onColumnsChange(newColumns: ColumnDefinition[]): void {
        this.availableColumns = newColumns;
    }

    toggleFilterMenu(event: Event): void {
        event.stopPropagation();
        this.isFilterMenuOpen = !this.isFilterMenuOpen;
        this.openMenuId = null; // Close action menus if open
    }

    setFilter(filter: 'All' | 'Sent' | 'Invoiced' | 'Draft', event: Event): void {
        event.stopPropagation();
        this.currentFilter = filter;
        this.isFilterMenuOpen = false;
        this.currentPage = 1; // Reset to first page on filter change
    }

    toggleMenu(id: string, event: Event): void {
        event.stopPropagation();
        this.isFilterMenuOpen = false;
        if (this.openMenuId === id) {
            this.openMenuId = null;
        } else {
            this.openMenuId = id;
        }
    }

    openDeleteModal(quotation: Quotation, event: Event): void {
        event.stopPropagation();
        this.quotationToDelete = quotation;
        this.openMenuId = null;
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        console.log('Navigate to edit quotation', id);
    }

    closeDeleteModal(): void {
        this.quotationToDelete = null;
    }

    confirmDelete(): void {
        if (this.quotationToDelete) {
            this.quotations = this.quotations.filter(q => q.id !== this.quotationToDelete!.id);
            this.selectedQuotationIds.delete(this.quotationToDelete.id);
            this.quotationToDelete = null;

            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.quotations.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) {
                    this.currentPage = maxPage;
                }
            } else {
                this.currentPage = 1;
            }
        }
    }

    handleBulkAction(actionId: string): void {
        if (actionId === 'delete') {
            this.quotations = this.quotations.filter(q => !this.selectedQuotationIds.has(q.id));
            this.selectedQuotationIds.clear();

            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.quotations.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) {
                    this.currentPage = maxPage;
                }
            } else {
                this.currentPage = 1;
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
