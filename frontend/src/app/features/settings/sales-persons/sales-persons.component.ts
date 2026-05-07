import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ManageColumnsComponent, ColumnDef } from '../../../shared/components/manage-columns/manage-columns.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ActionMenu, MenuAction } from '../../../shared/components/action-menu/action-menu';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { BulkActionsComponent, BulkAction } from '../../../shared/components/bulk-actions/bulk-actions.component';
import { CustomFilterComponent, FilterOption } from '../../../shared/components/custom-filter/custom-filter';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs.component';

import { AddSalesPersonModalComponent } from './components/add-sales-person-modal/add-sales-person-modal.component';
import { SalesPerson, SalesPersonService } from './services/sales-person.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-sales-persons',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    ButtonComponent, 
    EmptyStateComponent, 
    PaginationComponent, 
    ManageColumnsComponent, 
    PageHeaderComponent, 
    ActionMenu, 
    DeleteModalComponent, 
    CustomFilterComponent,
    BulkActionsComponent,
    BreadcrumbsComponent,
    AddSalesPersonModalComponent
  ],
  templateUrl: './sales-persons.component.html',
  styleUrls: ['./sales-persons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesPersonsComponent implements OnInit {
  private salesPersonService = inject(SalesPersonService);
  private notificationService = inject(NotificationService);

  salesPersons = signal<SalesPerson[]>([]);
  isLoading = signal(false);

  selectedSalesPersonIds = signal<Set<number>>(new Set<number>());
  currentPage = signal(1);
  itemsPerPage = signal(15);
  isManageColumnsOpen = signal(false);
  isAddModalOpen = signal(false);
  searchQuery = signal('');
  currentFilter = signal('All');
  sortColumn = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  personToDelete = signal<SalesPerson | null>(null);
  personToEdit = signal<SalesPerson | null>(null);
  bulkDeletePending = signal(false);

  availableColumns = signal<ColumnDef[]>([
    { id: 'name', label: 'Name', visible: true },
    { id: 'description', label: 'Description', visible: true },
    { id: 'status', label: 'Status', visible: true }
  ]);

  filterOptions: FilterOption[] = [
    { label: 'Active', value: 'Active', colorHex: '#10b981' },
    { label: 'Inactive', value: 'Inactive', colorHex: '#64748b' }
  ];

  bulkActions: BulkAction[] = [
    { id: 'mark_active', label: 'Mark as Active', icon: 'las la-check-circle' },
    { id: 'mark_inactive', label: 'Mark as Inactive', icon: 'las la-times-circle' },
    { id: 'delete', label: 'Delete Sales Persons', colorClass: 'text-danger', icon: 'las la-trash' }
  ];

  dynamicBulkActions = computed(() => {
    const selectedIds = this.selectedSalesPersonIds();
    if (selectedIds.size === 0) return [];

    const selected = this.salesPersons().filter(p => selectedIds.has(p.id));
    const allActive = selected.every(p => p.status === 'Active');
    const allInactive = selected.every(p => p.status === 'Inactive');

    return this.bulkActions.filter(action => {
      if (action.id === 'mark_active') return !allActive;
      if (action.id === 'mark_inactive') return !allInactive;
      return true;
    });
  });

  ngOnInit() {
    this.loadSalesPersons();
  }

  loadSalesPersons() {
    this.isLoading.set(true);
    this.salesPersonService.getSalesPersons().subscribe({
      next: (res) => {
        this.salesPersons.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading sales persons:', err);
        this.isLoading.set(false);
        this.notificationService.error('Error loading sales persons');
      }
    });
  }

  filteredSalesPersons = computed(() => {
    let filtered = this.salesPersons();
    const filterValue = this.currentFilter();
    const query = this.searchQuery().toLowerCase();
    const col = this.sortColumn();
    const dir = this.sortDirection();

    if (filterValue !== 'All') {
      filtered = filtered.filter(p => p.status === filterValue);
    }

    if (query) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    if (col) {
      filtered = [...filtered].sort((a, b) => {
        const valA = (a as any)[col];
        const valB = (b as any)[col];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return dir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        }
      });
    }

    return filtered;
  });

  paginatedSalesPersons = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredSalesPersons().slice(startIndex, startIndex + this.itemsPerPage());
  });

  onSaveSalesPerson(data: any) {
    const toEdit = this.personToEdit();
    if (toEdit) {
      this.salesPersonService.updateSalesPerson(toEdit.id, data).subscribe({
        next: (res) => {
          this.salesPersons.update(prev => prev.map(p => p.id === toEdit.id ? res.data : p));
          this.isAddModalOpen.set(false);
          this.personToEdit.set(null);
          this.notificationService.success('Sales person updated successfully');
        },
        error: (err) => {
          console.error('Error updating sales person:', err);
          this.notificationService.error(err.error?.message || 'Error updating sales person');
        }
      });
    } else {
      this.salesPersonService.createSalesPerson(data).subscribe({
        next: (res) => {
          this.salesPersons.update(prev => [res.data, ...prev]);
          this.isAddModalOpen.set(false);
          this.notificationService.success('Sales person created successfully');
        },
        error: (err) => {
          console.error('Error creating sales person:', err);
          this.notificationService.error(err.error?.message || 'Error creating sales person');
        }
      });
    }
  }

  handleAction(event: { action: string, data: SalesPerson }) {
    if (event.action === 'delete') {
      this.personToDelete.set(event.data);
    } else if (event.action === 'edit') {
      this.personToEdit.set(event.data);
      this.isAddModalOpen.set(true);
    } else if (event.action === 'mark_active') {
      this.updateStatus(event.data.id, 'Active');
    } else if (event.action === 'mark_inactive') {
      this.updateStatus(event.data.id, 'Inactive');
    }
  }

  updateStatus(id: number, status: 'Active' | 'Inactive') {
    this.salesPersonService.updateSalesPerson(id, { status }).subscribe({
      next: (res) => {
        this.salesPersons.update(prev => prev.map(p => p.id === id ? res.data : p));
        this.notificationService.success(`Sales person marked as ${status}`);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.notificationService.error('Error updating status');
      }
    });
  }

  getActions(person: SalesPerson): MenuAction[] {
    return [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' },
      person.status === 'Active'
        ? { label: 'Mark As Inactive', action: 'mark_inactive', iconClass: 'la-times-circle', customClass: 'edit-btn' }
        : { label: 'Mark As Active', action: 'mark_active', iconClass: 'la-check-circle', customClass: 'edit-btn' },
      { label: 'Delete', action: 'delete', svgIconPath: '/icons/delete.svg', customClass: 'delete-btn' }
    ];
  }

  handleBulkAction(action: string) {
    const selectedIds = Array.from(this.selectedSalesPersonIds());
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      this.bulkDeletePending.set(true);
    } else if (action === 'mark_active' || action === 'mark_inactive') {
      const status = action === 'mark_active' ? 'Active' : 'Inactive';
      this.salesPersonService.updateBulkStatus(selectedIds, status).subscribe({
        next: () => {
          this.salesPersons.update(prev => prev.map(p => 
            selectedIds.includes(p.id) ? { ...p, status } : p
          ));
          this.selectedSalesPersonIds.set(new Set());
          this.notificationService.success(`Successfully updated ${selectedIds.length} sales persons`);
        },
        error: (err) => {
          console.error('Error updating bulk status:', err);
          this.notificationService.error('Error updating bulk status');
        }
      });
    }
  }

  confirmDelete() {
    const isBulk = this.bulkDeletePending();
    const toDelete = this.personToDelete();
    const selectedIds = this.selectedSalesPersonIds();

    const idsToDelete = isBulk 
      ? Array.from(selectedIds) 
      : (toDelete ? [toDelete.id] : []);

    if (idsToDelete.length === 0) return;

    this.salesPersonService.deleteSalesPersons(idsToDelete).subscribe({
      next: () => {
        this.salesPersons.update(prev => prev.filter(p => !idsToDelete.includes(p.id)));
        this.selectedSalesPersonIds.update(set => {
          const newSet = new Set(set);
          idsToDelete.forEach(id => newSet.delete(id));
          return newSet;
        });
        this.personToDelete.set(null);
        this.bulkDeletePending.set(false);
        this.notificationService.success(isBulk ? 'Sales persons deleted' : 'Sales person deleted');
      },
      error: (err) => {
        console.error('Error deleting sales persons:', err);
        this.notificationService.error(err.error?.message || 'Error deleting sales person(s)');
        this.personToDelete.set(null);
        this.bulkDeletePending.set(false);
      }
    });
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

  onImport() {}
  onExport() {}

  // Common UI methods (matching categories pattern)
  setFilter(f: string) { this.currentFilter.set(f); this.currentPage.set(1); }
  toggleManageColumns() { this.isManageColumnsOpen.set(true); }
  closeManageColumns() { this.isManageColumnsOpen.set(false); }
  onColumnsChange(cols: ColumnDef[]) { this.availableColumns.set(cols); }
  onPageChange(p: number) { this.currentPage.set(p); }
  onItemsPerPageChange(n: number | 'All') { 
    this.itemsPerPage.set(n === 'All' ? this.salesPersons().length : n); 
    this.currentPage.set(1); 
  }
  clearSearch() { this.searchQuery.set(''); }
  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedSalesPersonIds.update(set => {
        const newSet = new Set(set);
        this.paginatedSalesPersons().forEach(p => newSet.delete(p.id));
        return newSet;
      });
    } else {
      this.selectedSalesPersonIds.update(set => {
        const newSet = new Set(set);
        this.paginatedSalesPersons().forEach(p => newSet.add(p.id));
        return newSet;
      });
    }
  }
  toggleSelection(id: number) {
    this.selectedSalesPersonIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }
  isAllSelected = computed(() => {
    const paginated = this.paginatedSalesPersons();
    const selected = this.selectedSalesPersonIds();
    return paginated.length > 0 && paginated.every(p => selected.has(p.id));
  });
  isPartiallySelected = computed(() => {
    const paginated = this.paginatedSalesPersons();
    const selected = this.selectedSalesPersonIds();
    const selectedInPage = paginated.filter(p => selected.has(p.id)).length;
    return selectedInPage > 0 && selectedInPage < paginated.length;
  });

  trackByPersonId(index: number, item: SalesPerson) {
    return item.id;
  }

  trackByColumnId(index: number, column: ColumnDef) {
    return column.id;
  }
}
