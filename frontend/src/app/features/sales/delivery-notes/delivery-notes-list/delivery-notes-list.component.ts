import { Component, OnInit, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
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
import { DeliveryNotesService } from '../services/delivery-notes.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
    selector: 'app-delivery-notes-list',
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
    templateUrl: './delivery-notes-list.component.html',
    styleUrls: ['./delivery-notes-list.component.scss']
})
export class DeliveryNotesListComponent implements OnInit {
    deliveryNotes: any[] = [];
    isLoading = true;

    selectedIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    noteToDelete: any | null = null;
    isBulkDeleteModalOpen = false;
    currentFilter: 'All' | 'Draft' | 'Sent' | 'Delivered' | string = 'All';

    // Sorting and Filter properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchQuery: string = '';

    filterOptions: FilterOption[] = [
        { label: 'Draft', value: 'Draft', colorHex: '#6b7280' },
        { label: 'Sent', value: 'Sent', colorHex: '#0ea5e9' },
        { label: 'Delivered', value: 'Delivered', colorHex: '#10b981' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'delivery_note_number', label: 'Delivery Note No.', visible: true},
        { id: 'delivery_date', label: 'Date', visible: true },
        { id: 'customer_name', label: 'Customer', visible: true },
        { id: 'grand_total', label: 'Amount', visible: true },
        { id: 'status', label: 'Status', visible: true },
        { id: 'invoice_status', label: 'Invoice Status', visible: true },
    ];

    get filteredNotes(): any[] {
        let filtered = this.deliveryNotes;
        
        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(n => n.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(n => 
                (n.delivery_note_number || '').toLowerCase().includes(query) ||
                (n.customer?.name || '').toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedNotes(): any[] {
        const filtered = this.filteredNotes;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + Number(this.itemsPerPage));
    }

    constructor(
        private eRef: ElementRef, 
        private router: Router,
        private deliveryNotesService: DeliveryNotesService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadDeliveryNotes();
    }

    loadDeliveryNotes(): void {
        this.isLoading = true;
        this.deliveryNotesService.getDeliveryNotes().subscribe({
            next: (res) => {
                this.deliveryNotes = res.data || [];
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching delivery notes:', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    navigateToNew(): void {
        this.router.navigate(['/sales/delivery-notes/new']);
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.deliveryNotes.sort((a, b) => {
            let valA = (a as any)[columnId];
            let valB = (b as any)[columnId];

            if (columnId === 'customer_name') {
                valA = a.customer?.name || '';
                valB = b.customer?.name || '';
            }

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

    toggleSelection(id: any): void {
        const idStr = id.toString();
        if (this.selectedIds.has(idStr)) {
            this.selectedIds.delete(idStr);
        } else {
            this.selectedIds.add(idStr);
        }
        this.cdr.detectChanges();
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedNotes;
        return currentList.length > 0 && currentList.every(n => this.selectedIds.has(n.id.toString()));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedNotes;
        const selectedInCurrent = currentList.filter(n => this.selectedIds.has(n.id.toString())).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(event?: any): void {
        const currentList = this.paginatedNotes;
        if (this.isAllSelected()) {
            currentList.forEach(n => this.selectedIds.delete(n.id.toString()));
        } else {
            currentList.forEach(n => this.selectedIds.add(n.id.toString()));
        }
        this.cdr.detectChanges();
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

    openDeleteModal(note: any, event: Event): void {
        event.stopPropagation();
        this.noteToDelete = note;
        this.openMenuId = null;
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.router.navigate(['/sales/delivery-notes/edit', id]);
    }

    navigateToInfo(id: string): void {
        this.router.navigate(['/sales/delivery-notes/info', id]);
    }

    closeDeleteModal(): void {
        this.noteToDelete = null;
    }

    confirmDelete(): void {
        if (this.noteToDelete) {
            this.deliveryNotesService.deleteDeliveryNote(this.noteToDelete.id).subscribe({
                next: () => {
                    this.deliveryNotes = this.deliveryNotes.filter(n => n.id !== this.noteToDelete!.id);
                    this.selectedIds.delete(this.noteToDelete!.id.toString());
                    this.noteToDelete = null;
                    this.notificationService.success('Delivery note deleted successfully');
                    this.cdr.detectChanges();
                    
                    if (this.itemsPerPage !== 'All') {
                        const maxPage = Math.ceil(this.deliveryNotes.length / Number(this.itemsPerPage)) || 1;
                        if (this.currentPage > maxPage) {
                            this.currentPage = maxPage;
                        }
                    }
                },
                error: (err: any) => {
                    console.error('Error deleting delivery note:', err);
                    this.notificationService.error('Error deleting delivery note');
                }
            });
        }
    }

    get availableBulkActions(): BulkAction[] {
        const selectedNotes = this.deliveryNotes.filter(n => this.selectedIds.has(n.id.toString()));
        if (selectedNotes.length === 0) return [];

        const allDelivered = selectedNotes.every(n => n.status === 'Delivered');
        const allCancelled = selectedNotes.every(n => n.status === 'Cancelled');
        const allDraftOrSent = selectedNotes.every(n => n.status === 'Draft' || n.status === 'Sent');

        const actions: BulkAction[] = [
            { id: 'delete', label: 'Delete Delivery Notes', colorClass: 'text-danger' }
        ];

        if (allDelivered) {
            actions.push({ id: 'cancelled', label: 'Mark as Cancelled' });
            actions.push({ id: 'sent', label: 'Mark as Sent' });
        } else if (allCancelled) {
            actions.push({ id: 'delivered', label: 'Mark as Delivered' });
            actions.push({ id: 'sent', label: 'Mark as Sent' });
        } else if (allDraftOrSent) {
            actions.push({ id: 'delivered', label: 'Mark as Delivered' });
            actions.push({ id: 'cancelled', label: 'Mark as Cancelled' });
        } else {
            // Mixed
            actions.push({ id: 'delivered', label: 'Mark as Delivered' });
            actions.push({ id: 'sent', label: 'Mark as Sent' });
            actions.push({ id: 'cancelled', label: 'Mark as Cancelled' });
        }

        return actions;
    }

    handleBulkAction(actionId: string): void {
        if (actionId === 'delete') {
            this.isBulkDeleteModalOpen = true;
        } else {
            let status = 'Sent';
            if (actionId === 'delivered') status = 'Delivered';
            else if (actionId === 'cancelled') status = 'Cancelled';
            
            const ids = Array.from(this.selectedIds);
            this.deliveryNotesService.updateBulkStatus(ids, status).subscribe({
                next: () => {
                    this.loadDeliveryNotes();
                    this.selectedIds.clear();
                    this.notificationService.success(`Successfully updated ${ids.length} delivery notes`);
                },
                error: (err: any) => {
                    console.error('Error updating bulk status:', err);
                    this.notificationService.error('Error updating delivery notes');
                }
            });
        }
    }

    confirmBulkDelete(): void {
        const ids = Array.from(this.selectedIds);
        this.deliveryNotesService.deleteBulkDeliveryNotes(ids).subscribe({
            next: () => {
                this.loadDeliveryNotes();
                this.selectedIds.clear();
                this.isBulkDeleteModalOpen = false;
                this.notificationService.success('Successfully deleted delivery notes');
            },
            error: (err: any) => {
                console.error('Error bulk deleting delivery notes:', err);
                this.isBulkDeleteModalOpen = false;
                this.notificationService.error('Error deleting delivery notes');
            }
        });
    }

    closeBulkDeleteModal(): void {
        this.isBulkDeleteModalOpen = false;
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    onItemsPerPageChange(size: number | 'All') {
        this.itemsPerPage = size;
        this.currentPage = 1;
    }
}

