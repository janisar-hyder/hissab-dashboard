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

export interface ContraJournal {
    id: string;
    contraNo: string;
    date: string;
    reference: string;
    amount: number;
    status: 'Published' | 'Draft' | string;
}

@Component({
    selector: 'app-contra-journals-list',
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
    templateUrl: './contra-journals-list.component.html',
    styleUrl: './contra-journals-list.component.scss'
})
export class ContraJournalsListComponent implements OnInit {
    journals: ContraJournal[] = [
        { id: '1', contraNo: 'CJ-004', date: '01 Apr, 2026', reference: 'TPE-001', amount: 1267.000, status: 'Draft' },
        { id: '2', contraNo: 'CJ-003', date: '16 Mar, 2026', reference: 'SGW-002', amount: 2800.000, status: 'Draft' },
        { id: '3', contraNo: 'CJ-002', date: '10 Mar, 2026', reference: 'HBC-003', amount: 550.000, status: 'Published' },
        { id: '4', contraNo: 'CJ-001', date: '04 Mar, 2026', reference: 'ABC-004', amount: 88.000, status: 'Draft' }
    ];

    selectedJournalIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    navigateToInfo(id: string): void {
        this.router.navigate(['/accounts/contra-journals/info', id]);
    }

    navigateToNew(): void {
        this.router.navigate(['/accounts/contra-journals/new']);
    }

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Journals', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    journalToDelete: ContraJournal | null = null;
    currentFilter: string = 'All';
    bulkDeletePending = false;

    // Sorting and Filter properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchQuery: string = '';

    filterOptions: FilterOption[] = [
        { label: 'Published', value: 'Published', colorHex: '#10b981' },
        { label: 'Draft', value: 'Draft', colorHex: '#64748b' }
    ];

    availableColumns: ColumnDef[] = [
        { id: 'contraNo', label: 'Contra Journals No.', visible: true },
        { id: 'date', label: 'Date', visible: true },
        { id: 'reference', label: 'Reference', visible: true },
        { id: 'amount', label: 'Amount', visible: true },
        { id: 'status', label: 'Status', visible: true },
    ];

    get filteredJournals(): ContraJournal[] {
        let filtered = this.journals;

        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(v => v.status === this.currentFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(v => 
                v.contraNo.toLowerCase().includes(query) ||
                v.reference.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedJournals(): ContraJournal[] {
        const filtered = this.filteredJournals;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + this.itemsPerPage);
    }

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.journals.sort((a, b) => {
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
        if (this.selectedJournalIds.has(id)) {
            this.selectedJournalIds.delete(id);
        } else {
            this.selectedJournalIds.add(id);
        }
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedJournals;
        return currentList.length > 0 && currentList.every(v => this.selectedJournalIds.has(v.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedJournals;
        const selectedInCurrent = currentList.filter(v => this.selectedJournalIds.has(v.id)).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(event?: any): void {
        const currentList = this.paginatedJournals;
        if (this.isAllSelected()) {
            currentList.forEach(v => this.selectedJournalIds.delete(v.id));
        } else {
            currentList.forEach(v => this.selectedJournalIds.add(v.id));
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

    openDeleteModal(journal: ContraJournal, event: Event): void {
        event.stopPropagation();
        this.journalToDelete = journal;
        this.openMenuId = null;
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        console.log('Navigate to edit', id);
        // this.router.navigate(['/accounts/contra-journals/edit', id]);
    }

    closeDeleteModal(): void {
        this.journalToDelete = null;
        this.bulkDeletePending = false;
    }

    confirmDelete(): void {
        const adjustPage = () => {
            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.journals.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) this.currentPage = maxPage;
            }
        };

        if (this.bulkDeletePending) {
            this.journals = this.journals.filter(v => !this.selectedJournalIds.has(v.id));
            this.selectedJournalIds.clear();
            this.bulkDeletePending = false;
            adjustPage();
        } else if (this.journalToDelete) {
            this.journals = this.journals.filter(v => v.id !== this.journalToDelete!.id);
            this.selectedJournalIds.delete(this.journalToDelete.id);
            this.journalToDelete = null;
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
}
