import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BulkActionsComponent, BulkAction } from '../../../../shared/components/bulk-actions/bulk-actions.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    date: string;
    customerName: string;
    dueDate: string;
    amount: number;
    balanceDue: number;
    status: 'Overdue' | 'Paid' | 'Partially Paid' | 'Due in 20 Days' | string;
}

@Component({
    selector: 'app-invoices-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, DecimalPipe, EmptyStateComponent, PaginationComponent, BulkActionsComponent, ManageColumnsComponent, DeleteModalComponent, CustomFilterComponent],
    templateUrl: './invoices-list.component.html',
    styleUrls: ['./invoices-list.component.scss']
})
export class InvoicesListComponent implements OnInit {
    invoices: Invoice[] = [
        { id: '1', invoiceNumber: 'INV-004', date: '11 Feb, 2026', customerName: 'Transpak Equipment', dueDate: '01 Mar, 2026', amount: 1267.000, balanceDue: 1267.000, status: 'Overdue' },
        { id: '2', invoiceNumber: 'INV-003', date: '06 Feb, 2026', customerName: 'Sigler Wholesale', dueDate: '06 Mar, 2026', amount: 2800.000, balanceDue: 0.000, status: 'Paid' },
        { id: '3', invoiceNumber: 'INV-002', date: '05 Feb, 2026', customerName: 'The Habegger Corp', dueDate: '10 Mar, 2026', amount: 550.000, balanceDue: 275.000, status: 'Partially Paid' },
        { id: '4', invoiceNumber: 'INV-001', date: '21 Jan, 2026', customerName: 'ABCO HVACR Supply', dueDate: '21 Feb, 2026', amount: 88.000, balanceDue: 88.000, status: 'Due in 20 Days' }
    ];

    selectedInvoiceIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Invoices', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    invoiceToDelete: Invoice | null = null;
    currentFilter: 'All' | 'Overdue' | 'Paid' | 'Partially Paid' | string = 'All';

    invoiceFilterOptions: FilterOption[] = [
        { label: 'Overdue', value: 'Overdue', colorHex: '#ef4444' },
        { label: 'Paid', value: 'Paid', colorHex: '#10b981' },
        { label: 'Partially Paid', value: 'Partially Paid', colorHex: '#f59e0b' },
        { label: 'Due in 20 Days', value: 'Due in 20 Days', colorHex: '#0ea5e9' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'invoiceNumber', label: 'Invoice Number', visible: true},
        { id: 'date', label: 'Date', visible: true },
        { id: 'customerName', label: 'Customer Name', visible: true },
        { id: 'dueDate', label: 'Due Date', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'balanceDue', label: 'Balance Due', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    get filteredInvoices(): Invoice[] {
        if (this.currentFilter === 'All') {
            return this.invoices;
        }
        return this.invoices.filter(i => i.status === this.currentFilter);
    }

    get paginatedInvoices(): Invoice[] {
        const filtered = this.filteredInvoices;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + this.itemsPerPage);
    }

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    navigateToNew(): void {
        this.router.navigate(['/sales/invoices/new']);
    }

    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.openMenuId = null;
        }
    }

    toggleSelection(id: string): void {
        if (this.selectedInvoiceIds.has(id)) {
            this.selectedInvoiceIds.delete(id);
        } else {
            this.selectedInvoiceIds.add(id);
        }
    }

    isAllSelected(): boolean {
        return this.selectedInvoiceIds.size === this.invoices.length && this.invoices.length > 0;
    }

    toggleAll(): void {
        if (this.isAllSelected()) {
            this.selectedInvoiceIds.clear();
        } else {
            this.invoices.forEach(i => this.selectedInvoiceIds.add(i.id));
        }
    }

    isColumnVisible(columnId: string): boolean {
        const col = this.availableColumns.find(c => c.id === columnId);
        return col ? col.visible : false;
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

    openDeleteModal(invoice: Invoice, event: Event): void {
        event.stopPropagation();
        this.invoiceToDelete = invoice;
        this.openMenuId = null;
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        console.log('Navigate to edit invoice', id);
    }

    navigateToInfo(id: string): void {
        this.router.navigate(['/sales/invoices/info', id]);
    }

    closeDeleteModal(): void {
        this.invoiceToDelete = null;
    }

    confirmDelete(): void {
        if (this.invoiceToDelete) {
            this.invoices = this.invoices.filter(i => i.id !== this.invoiceToDelete!.id);
            this.selectedInvoiceIds.delete(this.invoiceToDelete.id);
            this.invoiceToDelete = null;

            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.invoices.length / this.itemsPerPage) || 1;
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
            this.invoices = this.invoices.filter(i => !this.selectedInvoiceIds.has(i.id));
            this.selectedInvoiceIds.clear();

            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.invoices.length / this.itemsPerPage) || 1;
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
