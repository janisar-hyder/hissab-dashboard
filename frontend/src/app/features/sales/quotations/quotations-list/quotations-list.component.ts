import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BulkActionsComponent, BulkAction } from '../../../../shared/components/bulk-actions/bulk-actions.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';
import { QuotationsService, Quotation } from '../services/quotations.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ColumnPreferencesService } from '../../../../shared/services/column-preferences.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-quotations-list',
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule, 
        ButtonComponent, 
        DecimalPipe, 
        EmptyStateComponent, 
        PaginationComponent, 
        BulkActionsComponent, 
        ManageColumnsComponent, 
        DeleteModalComponent, 
        CustomFilterComponent
    ],
    templateUrl: './quotations-list.component.html',
    styleUrls: ['./quotations-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuotationsListComponent implements OnInit {
    private quotationsService = inject(QuotationsService);
    private notificationService = inject(NotificationService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private columnPreferencesService = inject(ColumnPreferencesService);
    private cdr = inject(ChangeDetectorRef);

    searchQuery = signal('');
    currentFilter = signal('All');
    isLoading = signal(false);

    quotationFilterOptions: FilterOption[] = [
        { label: 'Sent', value: 'Sent', colorHex: '#0ea5e9' },
        { label: 'Invoiced', value: 'Invoiced', colorHex: '#10b981' },
        { label: 'Draft', value: 'Draft', colorHex: '#6b7280' }
    ];

    quotations = signal<Quotation[]>([]);
    selectedQuotationIds = signal<Set<number>>(new Set<number>());
    currentPage = signal(1);
    itemsPerPage = signal<number | 'All'>(15);

    isManageColumnsOpen = signal(false);
    openMenuId = signal<number | null>(null);
    quotationToDelete = signal<Quotation | null>(null);
    bulkDeletePending = signal(false);

    // Sorting properties
    sortColumn = signal<string>('');
    sortDirection = signal<'asc' | 'desc'>('asc');

    bulkActions = computed<BulkAction[]>(() => {
        const selectedIds = this.selectedQuotationIds();
        const allQuotations = this.quotations();
        const selectedQuotations = allQuotations.filter(q => selectedIds.has(q.id));
        
        const actions: BulkAction[] = [
            { id: 'delete', label: 'Delete Quotations', colorClass: 'text-danger' }
        ];

        if (selectedQuotations.length === 0) return actions;

        const hasNotDraft = selectedQuotations.some(q => q.status !== 'Draft');
        const hasNotSent = selectedQuotations.some(q => q.status !== 'Sent');
        const hasNotInvoiced = selectedQuotations.some(q => q.status !== 'Invoiced');

        // Only show a status option if at least one selected item is NOT already in that status
        if (hasNotDraft) {
            actions.unshift({ id: 'mark_draft', label: 'Mark as Draft' });
        }
        if (hasNotSent) {
            actions.unshift({ id: 'mark_sent', label: 'Mark as Sent' });
        }
        if (hasNotInvoiced) {
            actions.unshift({ id: 'mark_invoiced', label: 'Mark as Invoiced' });
        }
        
        return actions;
    });

    availableColumns: ColumnDef[] = [
        { id: 'quotationNumber', label: 'Quotation Number', visible: true},
        { id: 'date', label: 'Date', visible: true },
        { id: 'customerName', label: 'Customer Name', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    ngOnInit(): void {
        this.loadQuotations();
        this.columnPreferencesService.loadPreferences('quotations-list', this.availableColumns).subscribe(cols => {
            this.availableColumns = cols;
            this.cdr.detectChanges();
        });
    }

    loadQuotations() {
        this.isLoading.set(true);
        this.quotationsService.getQuotations().subscribe({
            next: (res) => {
                this.quotations.set(res.data);
                this.isLoading.set(false);
            },
            error: () => {
                this.notificationService.error('Failed to load quotations');
                this.isLoading.set(false);
            }
        });
    }

    filteredQuotations = computed(() => {
        let filtered = [...this.quotations()];
        const filter = this.currentFilter();
        const query = this.searchQuery().toLowerCase();
        const sortCol = this.sortColumn();
        const sortDir = this.sortDirection();

        if (filter !== 'All') {
            filtered = filtered.filter(q => q.status === filter);
        }

        if (query) {
            filtered = filtered.filter(q => 
                q.quotation_number.toLowerCase().includes(query) ||
                (q.customer?.name || '').toLowerCase().includes(query)
            );
        }

        if (sortCol) {
            filtered.sort((a, b) => {
                let valA: any = (a as any)[sortCol];
                let valB: any = (b as any)[sortCol];

                // Map backend fields to frontend column IDs if necessary
                if (sortCol === 'quotationNumber') { valA = a.quotation_number; valB = b.quotation_number; }
                if (sortCol === 'date') { valA = a.quotation_date; valB = b.quotation_date; }
                if (sortCol === 'customerName') { valA = a.customer?.name; valB = b.customer?.name; }
                if (sortCol === 'amount') { valA = a.grand_total; valB = b.grand_total; }

                if (valA === null || valA === undefined) return 1;
                if (valB === null || valB === undefined) return -1;

                if (typeof valA === 'string' && typeof valB === 'string') {
                    return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                } else {
                    return sortDir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
                }
            });
        }

        return filtered;
    });

    paginatedQuotations = computed(() => {
        const filtered = this.filteredQuotations();
        const perPage = this.itemsPerPage();
        if (perPage === 'All' || perPage === -1) return filtered;
        const startIndex = (this.currentPage() - 1) * (perPage as number);
        return filtered.slice(startIndex, startIndex + (perPage as number));
    });

    navigateToNew(): void {
        this.router.navigate(['new'], { relativeTo: this.route });
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn() === columnId) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(columnId);
            this.sortDirection.set('asc');
        }
    }

    toggleSelection(id: number): void {
        const newSet = new Set(this.selectedQuotationIds());
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        this.selectedQuotationIds.set(newSet);
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedQuotations();
        return currentList.length > 0 && currentList.every(q => this.selectedQuotationIds().has(q.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedQuotations();
        const selectedCount = currentList.filter(q => this.selectedQuotationIds().has(q.id)).length;
        return selectedCount > 0 && selectedCount < currentList.length;
    }

    toggleAll(event: any): void {
        const currentList = this.paginatedQuotations();
        const newSet = new Set(this.selectedQuotationIds());
        if (event.target.checked) {
            currentList.forEach(q => newSet.add(q.id));
        } else {
            currentList.forEach(q => newSet.delete(q.id));
        }
        this.selectedQuotationIds.set(newSet);
    }

    clearSearch() {
        this.searchQuery.set('');
        this.currentPage.set(1);
    }

    isColumnVisible(columnId: string): boolean {
        const col = this.availableColumns.find(c => c.id === columnId);
        return col ? col.visible : false;
    }

    toggleManageColumns() {
        this.isManageColumnsOpen.set(true);
    }

    closeManageColumns() {
        this.isManageColumnsOpen.set(false);
    }

    setFilter(filter: string): void {
        this.currentFilter.set(filter);
        this.currentPage.set(1);
    }

    toggleMenu(id: number, event: Event): void {
        event.stopPropagation();
        if (this.openMenuId() === id) {
            this.openMenuId.set(null);
        } else {
            this.openMenuId.set(id);
        }
    }

    openDeleteModal(quotation: Quotation, event: Event): void {
        event.stopPropagation();
        this.quotationToDelete.set(quotation);
        this.openMenuId.set(null);
    }

    navigateToEdit(id: number, event: Event): void {
        event.stopPropagation();
        this.router.navigate(['edit', id], { relativeTo: this.route });
    }

    navigateToInfo(id: number): void {
        this.router.navigate(['info', id], { relativeTo: this.route });
    }

    closeDeleteModal(): void {
        this.quotationToDelete.set(null);
        this.bulkDeletePending.set(false);
    }

    confirmDelete(): void {
        const isBulk = this.bulkDeletePending();
        const toDelete = this.quotationToDelete();

        const adjustPage = () => {
            const perPage = this.itemsPerPage();
            if (typeof perPage === 'number' && perPage !== -1) {
                const maxPage = Math.ceil(this.quotations().length / perPage) || 1;
                if (this.currentPage() > maxPage) this.currentPage.set(maxPage);
            }
        };

        if (isBulk) {
            const ids = Array.from(this.selectedQuotationIds());
            this.quotationsService.deleteBulkQuotations(ids).subscribe({
                next: () => {
                    this.notificationService.success('Quotations deleted successfully');
                    this.quotations.update(prev => prev.filter(q => !ids.includes(q.id)));
                    this.selectedQuotationIds.set(new Set<number>());
                    this.closeDeleteModal();
                    adjustPage();
                },
                error: () => this.notificationService.error('Failed to delete quotations')
            });
        } else if (toDelete) {
            this.quotationsService.deleteQuotation(toDelete.id).subscribe({
                next: () => {
                    this.notificationService.success('Quotation deleted successfully');
                    this.quotations.update(prev => prev.filter(q => q.id !== toDelete.id));
                    const newSet = new Set(this.selectedQuotationIds());
                    newSet.delete(toDelete.id);
                    this.selectedQuotationIds.set(newSet);
                    this.closeDeleteModal();
                    adjustPage();
                },
                error: () => this.notificationService.error('Failed to delete quotation')
            });
        }
    }

    handleBulkAction(actionId: string): void {
        if (actionId === 'delete') {
            this.bulkDeletePending.set(true);
            this.quotationToDelete.set({} as Quotation); // Just to trigger modal
        } else if (actionId.startsWith('mark_')) {
            const statusMap: Record<string, string> = {
                'mark_sent': 'Sent',
                'mark_invoiced': 'Invoiced',
                'mark_draft': 'Draft'
            };
            const status = statusMap[actionId];
            if (!status) return;
            const ids = Array.from(this.selectedQuotationIds());
            this.quotationsService.updateBulkStatus(ids, status).subscribe({
                next: () => {
                    this.notificationService.success(`Quotations marked as ${status}`);
                    this.quotations.update(prev => prev.map(q => ids.includes(q.id) ? { ...q, status } : q));
                    this.selectedQuotationIds.set(new Set<number>());
                },
                error: () => this.notificationService.error('Failed to update status')
            });
        }
    }

    onPageChange(page: number) {
        this.currentPage.set(page);
    }

    onItemsPerPageChange(size: number | 'All') {
        if (size === 'All') {
            this.itemsPerPage.set(-1);
        } else {
            this.itemsPerPage.set(size);
        }
        this.currentPage.set(1);
    }
}
