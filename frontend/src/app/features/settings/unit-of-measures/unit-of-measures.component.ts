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
import { AddUomModalComponent } from './components/add-uom-modal/add-uom-modal.component';
import { UOM, UomService } from './services/uom.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-unit-of-measures',
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
    AddUomModalComponent
  ],
  templateUrl: './unit-of-measures.component.html',
  styleUrls: ['./unit-of-measures.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitOfMeasuresComponent implements OnInit {
  private uomService = inject(UomService);
  private notificationService = inject(NotificationService);

  uoms = signal<UOM[]>([]);
  isLoading = signal(false);

  selectedUomIds = signal<Set<number>>(new Set<number>());
  currentPage = signal(1);
  itemsPerPage = signal(15);
  isManageColumnsOpen = signal(false);
  isAddModalOpen = signal(false);
  searchQuery = signal('');
  currentFilter = signal('All');
  sortColumn = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  uomToDelete = signal<UOM | null>(null);
  bulkDeletePending = signal(false);

  availableColumns = signal<ColumnDef[]>([
    { id: 'name', label: 'UOM Name', visible: true },
    { id: 'status', label: 'Status', visible: true }
  ]);

  filterOptions: FilterOption[] = [
    { label: 'Active', value: 'Active', colorHex: '#10b981' },
    { label: 'Inactive', value: 'Inactive', colorHex: '#64748b' }
  ];

  bulkActions: BulkAction[] = [
    { id: 'mark_active', label: 'Mark as Active', icon: 'las la-check-circle' },
    { id: 'mark_inactive', label: 'Mark as Inactive', icon: 'las la-times-circle' },
    { id: 'delete', label: 'Delete Unit of Measures', colorClass: 'text-danger', icon: 'las la-trash' }
  ];

  dynamicBulkActions = computed(() => {
    const selectedIds = this.selectedUomIds();
    if (selectedIds.size === 0) return [];

    const selected = this.uoms().filter(u => selectedIds.has(u.id));
    const allActive = selected.every(u => u.status === 'Active');
    const allInactive = selected.every(u => u.status === 'Inactive');

    return this.bulkActions.filter(action => {
      if (action.id === 'mark_active') return !allActive;
      if (action.id === 'mark_inactive') return !allInactive;
      return true;
    });
  });

  ngOnInit() {
    this.loadUnits();
  }

  loadUnits() {
    this.isLoading.set(true);
    this.uomService.getUnits().subscribe({
      next: (res) => {
        this.uoms.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading units:', err);
        this.isLoading.set(false);
        this.notificationService.error('Error loading units of measure');
      }
    });
  }

  filteredUoms = computed(() => {
    let filtered = this.uoms();
    const filterValue = this.currentFilter();
    const query = this.searchQuery().toLowerCase();
    const col = this.sortColumn();
    const dir = this.sortDirection();

    if (filterValue !== 'All') {
      filtered = filtered.filter(u => u.status === filterValue);
    }

    if (query) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(query)
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

  paginatedUoms = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredUoms().slice(startIndex, startIndex + this.itemsPerPage());
  });

  onSaveUom(data: any) {
    this.uomService.createUnit(data).subscribe({
      next: (res) => {
        this.uoms.update(prev => [res.data, ...prev]);
        this.isAddModalOpen.set(false);
        this.notificationService.success('Unit of measure created');
      },
      error: (err) => {
        console.error('Error creating unit:', err);
        this.notificationService.error(err.error?.message || 'Error creating unit');
      }
    });
  }

  handleAction(event: { action: string, data: UOM }) {
    if (event.action === 'delete') {
      this.uomToDelete.set(event.data);
    } else if (event.action === 'mark_active') {
      this.updateStatus(event.data.id, 'Active');
    } else if (event.action === 'mark_inactive') {
      this.updateStatus(event.data.id, 'Inactive');
    }
  }

  updateStatus(id: number, status: 'Active' | 'Inactive') {
    this.uomService.updateUnit(id, { status }).subscribe({
      next: (res) => {
        this.uoms.update(prev => prev.map(u => u.id === id ? res.data : u));
        this.notificationService.success(`Unit marked as ${status}`);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.notificationService.error('Error updating status');
      }
    });
  }

  getActions(uom: UOM): MenuAction[] {
    return [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' },
      uom.status === 'Active'
        ? { label: 'Mark As Inactive', action: 'mark_inactive', iconClass: 'la-times-circle', customClass: 'edit-btn' }
        : { label: 'Mark As Active', action: 'mark_active', iconClass: 'la-check-circle', customClass: 'edit-btn' },
      { label: 'Delete', action: 'delete', svgIconPath: '/icons/delete.svg', customClass: 'delete-btn' }
    ];
  }

  handleBulkAction(action: string) {
    const selectedIds = Array.from(this.selectedUomIds());
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      this.bulkDeletePending.set(true);
    } else if (action === 'mark_active' || action === 'mark_inactive') {
      const status = action === 'mark_active' ? 'Active' : 'Inactive';
      this.uomService.updateBulkStatus(selectedIds, status).subscribe({
        next: () => {
          this.uoms.update(prev => prev.map(u => 
            selectedIds.includes(u.id) ? { ...u, status } : u
          ));
          this.selectedUomIds.set(new Set());
          this.notificationService.success(`Successfully updated ${selectedIds.length} units`);
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
    const toDelete = this.uomToDelete();
    const selectedIds = this.selectedUomIds();

    const idsToDelete = isBulk 
      ? Array.from(selectedIds) 
      : (toDelete ? [toDelete.id] : []);

    if (idsToDelete.length === 0) return;

    this.uomService.deleteUnits(idsToDelete).subscribe({
      next: () => {
        this.uoms.update(prev => prev.filter(u => !idsToDelete.includes(u.id)));
        this.selectedUomIds.update(set => {
          const newSet = new Set(set);
          idsToDelete.forEach(id => newSet.delete(id));
          return newSet;
        });
        this.uomToDelete.set(null);
        this.bulkDeletePending.set(false);
        this.notificationService.success(isBulk ? 'Units deleted' : 'Unit deleted');
      },
      error: (err) => {
        console.error('Error deleting units:', err);
        this.notificationService.error(err.error?.message || 'Error deleting unit(s)');
        this.uomToDelete.set(null);
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

  // Common UI methods
  setFilter(f: string) { this.currentFilter.set(f); this.currentPage.set(1); }
  toggleManageColumns() { this.isManageColumnsOpen.set(true); }
  closeManageColumns() { this.isManageColumnsOpen.set(false); }
  onColumnsChange(cols: ColumnDef[]) { this.availableColumns.set(cols); }
  onPageChange(p: number) { this.currentPage.set(p); }
  onItemsPerPageChange(n: number | 'All') { 
    this.itemsPerPage.set(n === 'All' ? this.uoms().length : n); 
    this.currentPage.set(1); 
  }
  clearSearch() { this.searchQuery.set(''); }
  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedUomIds.update(set => {
        const newSet = new Set(set);
        this.paginatedUoms().forEach(u => newSet.delete(u.id));
        return newSet;
      });
    } else {
      this.selectedUomIds.update(set => {
        const newSet = new Set(set);
        this.paginatedUoms().forEach(u => newSet.add(u.id));
        return newSet;
      });
    }
  }
  toggleSelection(id: number) {
    this.selectedUomIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }
  isAllSelected = computed(() => {
    const paginated = this.paginatedUoms();
    const selected = this.selectedUomIds();
    return paginated.length > 0 && paginated.every(u => selected.has(u.id));
  });
  isPartiallySelected = computed(() => {
    const paginated = this.paginatedUoms();
    const selected = this.selectedUomIds();
    const selectedInPage = paginated.filter(u => selected.has(u.id)).length;
    return selectedInPage > 0 && selectedInPage < paginated.length;
  });

  trackByUomId(index: number, item: UOM) {
    return item.id;
  }

  trackByColumnId(index: number, column: ColumnDef) {
    return column.id;
  }
}
