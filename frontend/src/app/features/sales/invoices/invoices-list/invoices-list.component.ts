import { Component, OnInit, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
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
import { InvoicesService } from '../services/invoices.service';
import { NotificationService } from '../../../../shared/services/notification.service';

export interface Invoice {
    id: number;
    invoiceNumber: string;
    date: string;
    customerName: string;
    dueDate: string;
    amount: number;
    balanceDue: number;
    status: string;
}

@Component({
    selector: 'app-invoices-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, DecimalPipe, EmptyStateComponent, PaginationComponent, BulkActionsComponent, ManageColumnsComponent, DeleteModalComponent, CustomFilterComponent],
    templateUrl: './invoices-list.component.html',
    styleUrls: ['./invoices-list.component.scss']
})
export class InvoicesListComponent implements OnInit {
    invoices: Invoice[] = [];
    isLoading = true;

    selectedInvoiceIds = new Set<number>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions — dynamic based on selection
    get bulkActions(): BulkAction[] {
        const actions: BulkAction[] = [];
        const selectedInvoices = this.invoices.filter(i => this.selectedInvoiceIds.has(i.id));

        const allDraft = selectedInvoices.every(i => i.status === 'Draft');
        const allSent = selectedInvoices.every(i => i.status === 'Sent');
        const allPaid = selectedInvoices.every(i => i.status === 'Paid');

        if (!allDraft) actions.push({ id: 'draft', label: 'Mark as Draft', colorClass: 'text-muted' });
        if (!allSent) actions.push({ id: 'sent', label: 'Mark as Sent', colorClass: 'text-primary' });
        if (!allPaid) actions.push({ id: 'paid', label: 'Mark as Paid', colorClass: 'text-success' });

        actions.push({ id: 'delete', label: 'Delete Invoices', colorClass: 'text-danger' });

        return actions;
    }

    isManageColumnsOpen = false;
    openMenuId: number | null = null;
    invoiceToDelete: Invoice | null = null;
    bulkDeletePending = false;
    currentFilter: string = 'All';

    // Sorting and Filter properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchQuery: string = '';

    invoiceFilterOptions: FilterOption[] = [
        { label: 'Draft', value: 'Draft', colorHex: '#6b7280' },
        { label: 'Sent', value: 'Sent', colorHex: '#0ea5e9' },
        { label: 'Paid', value: 'Paid', colorHex: '#10b981' },
    ];

    availableColumns: ColumnDef[] = [
        { id: 'invoiceNumber', label: 'Invoice Number', visible: true },
        { id: 'date', label: 'Date', visible: true },
        { id: 'customerName', label: 'Customer Name', visible: true },
        { id: 'dueDate', label: 'Due Date', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'balanceDue', label: 'Balance Due', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    get filteredInvoices(): Invoice[] {
        let filtered = this.invoices;

        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(i => i.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(i =>
                i.invoiceNumber.toLowerCase().includes(query) ||
                i.customerName.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedInvoices(): Invoice[] {
        const filtered = this.filteredInvoices;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + this.itemsPerPage);
    }

    constructor(
        private eRef: ElementRef,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private invoicesService: InvoicesService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadInvoices();
    }

    loadInvoices(): void {
        this.isLoading = true;
        this.invoicesService.getInvoices().subscribe({
            next: (res) => {
                this.invoices = (res.data || []).map((inv: any) => ({
                    id: inv.id,
                    invoiceNumber: inv.invoice_number,
                    date: inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
                    customerName: inv.customer?.name || 'Unknown',
                    dueDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
                    amount: Number(inv.grand_total) || 0,
                    balanceDue: Number(inv.balance_due) || 0,
                    status: inv.status || 'Draft'
                }));
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.notificationService.error('Failed to load invoices');
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    navigateToNew(): void {
        this.router.navigate(['/sales/invoices/new']);
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.invoices.sort((a, b) => {
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

    toggleSelection(id: number): void {
        if (this.selectedInvoiceIds.has(id)) {
            this.selectedInvoiceIds.delete(id);
        } else {
            this.selectedInvoiceIds.add(id);
        }
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedInvoices;
        return currentList.length > 0 && currentList.every(i => this.selectedInvoiceIds.has(i.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedInvoices;
        const selectedInCurrent = currentList.filter(i => this.selectedInvoiceIds.has(i.id)).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(event?: any): void {
        const currentList = this.paginatedInvoices;
        if (this.isAllSelected()) {
            currentList.forEach(i => this.selectedInvoiceIds.delete(i.id));
        } else {
            currentList.forEach(i => this.selectedInvoiceIds.add(i.id));
        }
    }

    clearSearch() {
        this.searchQuery = '';
        this.currentPage = 1;
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

    toggleMenu(id: number, event: Event): void {
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

    navigateToEdit(id: number, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.router.navigate(['/sales/invoices/edit', id]);
    }

    navigateToInfo(id: number): void {
        this.router.navigate(['/sales/invoices/info', id]);
    }

    closeDeleteModal(): void {
        this.invoiceToDelete = null;
        this.bulkDeletePending = false;
    }

    confirmDelete(): void {
        if (this.bulkDeletePending) {
            const ids = Array.from(this.selectedInvoiceIds);
            this.invoicesService.deleteBulkInvoices(ids).subscribe({
                next: () => {
                    this.notificationService.success(`Deleted ${ids.length} invoices`);
                    this.selectedInvoiceIds.clear();
                    this.closeDeleteModal();
                    this.loadInvoices();
                },
                error: () => {
                    this.notificationService.error('Failed to delete invoices');
                    this.closeDeleteModal();
                }
            });
        } else if (this.invoiceToDelete) {
            this.invoicesService.deleteInvoice(this.invoiceToDelete.id).subscribe({
                next: () => {
                    this.notificationService.success('Invoice deleted successfully');
                    this.closeDeleteModal();
                    this.loadInvoices();
                },
                error: () => {
                    this.notificationService.error('Failed to delete invoice');
                    this.closeDeleteModal();
                }
            });
        }
    }

    handleBulkAction(actionId: string): void {
        const ids = Array.from(this.selectedInvoiceIds);
        if (ids.length === 0) return;

        if (actionId === 'delete') {
            this.bulkDeletePending = true;
            this.invoiceToDelete = {} as Invoice; // Trigger the modal
        } else {
            const statusMap: Record<string, string> = {
                'draft': 'Draft',
                'sent': 'Sent',
                'paid': 'Paid'
            };
            const status = statusMap[actionId];
            if (status) {
                this.invoicesService.updateBulkStatus(ids, status).subscribe({
                    next: () => {
                        this.notificationService.success(`Updated ${ids.length} invoices to ${status}`);
                        this.selectedInvoiceIds.clear();
                        this.loadInvoices();
                    },
                    error: () => this.notificationService.error('Failed to update status')
                });
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
