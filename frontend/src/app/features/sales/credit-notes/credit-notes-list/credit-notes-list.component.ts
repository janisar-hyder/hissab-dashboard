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
import { CreditNotesService } from '../services/credit-notes.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ChangeDetectorRef } from '@angular/core';

export interface CreditNote {
    id: string;
    creditNoteNumber: string;
    date: string;
    customerName: string;
    invoiceNo: string;
    amount: number;
    balance: number;
    status: 'Open' | 'Closed' | 'Draft' | string;
}

@Component({
    selector: 'app-credit-notes-list',
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
    templateUrl: './credit-notes-list.component.html',
    styleUrl: './credit-notes-list.component.scss'
})
export class CreditNotesListComponent implements OnInit {
    creditNotes: any[] = [];
    isLoading = true;

    selectedCreditNoteIds = new Set<string>();
    isBulkDeleteModalOpen = false;

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'mark_as_open', label: 'Mark as Open', icon: 'las la-door-open' },
        { id: 'mark_as_draft', label: 'Mark as Draft', icon: 'las la-file-alt' },
        { id: 'delete', label: 'Delete Credit Notes', colorClass: 'text-danger', icon: 'las la-trash' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    creditNoteToDelete: CreditNote | null = null;
    currentFilter: 'All' | 'Open' | 'Closed' | 'Draft' | string = 'All';

    // Sorting and Filter properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchQuery: string = '';

    creditNoteFilterOptions: FilterOption[] = [
        { label: 'Open', value: 'Open', colorHex: '#10b981' },
        { label: 'Closed', value: 'Closed', colorHex: '#ef4444' },
        { label: 'Draft', value: 'Draft', colorHex: '#64748b' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'creditNoteNumber', label: 'Credit Note No.', visible: true},
        { id: 'date', label: 'Date', visible: true },
        { id: 'customerName', label: 'Customer Name', visible: true },
        { id: 'invoiceNo', label: 'Invoice No', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'balance', label: 'Balance', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    get filteredCreditNotes(): CreditNote[] {
        let filtered = this.creditNotes;

        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(cn => cn.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(cn => 
                cn.creditNoteNumber.toLowerCase().includes(query) ||
                cn.customerName.toLowerCase().includes(query) ||
                cn.invoiceNo.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedCreditNotes(): CreditNote[] {
        const filtered = this.filteredCreditNotes;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + this.itemsPerPage);
    }

    constructor(
        private eRef: ElementRef, 
        private router: Router,
        private creditNotesService: CreditNotesService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadCreditNotes();
    }

    loadCreditNotes(): void {
        this.isLoading = true;
        this.creditNotesService.getCreditNotes().subscribe({
            next: (res) => {
                const rawData = res.data || [];
                this.creditNotes = rawData.map((cn: any) => ({
                    id: cn.id,
                    creditNoteNumber: cn.credit_note_number,
                    date: new Date(cn.credit_note_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    customerName: cn.customer?.name || '',
                    invoiceNo: cn.applications?.length > 0 
                        ? cn.applications.map((a: any) => a.invoice?.invoice_number).filter(Boolean).join(', ') 
                        : 'N/A',
                    amount: Number(cn.grand_total),
                    balance: Number(cn.balance),
                    status: cn.status || 'Open'
                }));
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading credit notes:', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    navigateToNew(): void {
        this.router.navigate(['/sales/credit-notes/new']);
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.creditNotes.sort((a, b) => {
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
        if (this.selectedCreditNoteIds.has(id)) {
            this.selectedCreditNoteIds.delete(id);
        } else {
            this.selectedCreditNoteIds.add(id);
        }
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedCreditNotes;
        return currentList.length > 0 && currentList.every(cn => this.selectedCreditNoteIds.has(cn.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedCreditNotes;
        const selectedInCurrent = currentList.filter(cn => this.selectedCreditNoteIds.has(cn.id)).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(event?: any): void {
        const currentList = this.paginatedCreditNotes;
        if (this.isAllSelected()) {
            currentList.forEach(cn => this.selectedCreditNoteIds.delete(cn.id));
        } else {
            currentList.forEach(cn => this.selectedCreditNoteIds.add(cn.id));
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

    setFilter(filter: 'All' | 'Open' | 'Closed' | 'Draft' | string): void {
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

    openDeleteModal(creditNote: CreditNote, event: Event): void {
        event.stopPropagation();
        this.creditNoteToDelete = creditNote;
        this.openMenuId = null;
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.router.navigate(['/sales/credit-notes/edit', id]);
    }

    navigateToInfo(id: string): void {
        this.router.navigate(['/sales/credit-notes/info', id]);
    }

    closeDeleteModal(): void {
        this.creditNoteToDelete = null;
    }

    confirmDelete(): void {
        if (this.creditNoteToDelete) {
            this.creditNotesService.deleteCreditNote(this.creditNoteToDelete.id).subscribe({
                next: () => {
                    this.loadCreditNotes();
                    this.selectedCreditNoteIds.delete(this.creditNoteToDelete!.id.toString());
                    this.creditNoteToDelete = null;
                    this.notificationService.success('Credit note deleted successfully');
                },
                error: (err: any) => {
                    console.error('Error deleting credit note:', err);
                    this.notificationService.error('Error deleting credit note');
                }
            });
        }
    }

    handleBulkAction(actionId: string): void {
        if (actionId === 'delete') {
            this.isBulkDeleteModalOpen = true;
        } else if (actionId === 'mark_as_open' || actionId === 'mark_as_draft') {
            const status = actionId === 'mark_as_open' ? 'Open' : 'Draft';
            const ids = Array.from(this.selectedCreditNoteIds).map(id => Number(id));
            
            this.creditNotesService.bulkStatusUpdate(ids, status).subscribe({
                next: () => {
                    this.loadCreditNotes();
                    this.selectedCreditNoteIds.clear();
                    this.notificationService.success(`Successfully updated ${ids.length} credit notes`);
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.error('Error bulk updating status:', err);
                    this.notificationService.error('Error updating credit notes');
                }
            });
        }
    }

    closeBulkDeleteModal(): void {
        this.isBulkDeleteModalOpen = false;
    }

    confirmBulkDelete(): void {
        const ids = Array.from(this.selectedCreditNoteIds);
        this.creditNotesService.deleteBulkCreditNotes(ids).subscribe({
            next: () => {
                this.loadCreditNotes();
                this.selectedCreditNoteIds.clear();
                this.isBulkDeleteModalOpen = false;
                this.notificationService.success('Successfully deleted credit notes');
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error bulk deleting credit notes:', err);
                this.isBulkDeleteModalOpen = false;
                this.notificationService.error('Error deleting credit notes');
            }
        });
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    onItemsPerPageChange(size: number | 'All') {
        this.itemsPerPage = size;
        this.currentPage = 1;
    }
}
