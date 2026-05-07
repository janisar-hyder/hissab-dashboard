import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ActionMenu, MenuAction } from '../../../../shared/components/action-menu/action-menu';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { BulkActionsComponent, BulkAction } from '../../../../shared/components/bulk-actions/bulk-actions.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';

import { AddVatRateModalComponent } from './components/add-vat-rate-modal/add-vat-rate-modal.component';
import { VatRate, VatRateService } from './services/vat-rate.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-vat-rates',
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
    AddVatRateModalComponent
  ],
  templateUrl: './vat-rates.component.html',
  styleUrls: ['./vat-rates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VatRatesComponent implements OnInit {
  private vatRateService = inject(VatRateService);
  private notificationService = inject(NotificationService);

  vatRates = signal<VatRate[]>([]);
  isLoading = signal(false);

  selectedRateIds = signal<Set<number>>(new Set<number>());
  currentPage = signal(1);
  itemsPerPage = signal(15);
  isManageColumnsOpen = signal(false);
  isAddModalOpen = signal(false);
  searchQuery = signal('');
  currentFilter = signal('All');
  sortColumn = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  rateToDelete = signal<VatRate | null>(null);
  rateToEdit = signal<VatRate | null>(null);
  bulkDeletePending = signal(false);

  availableColumns = signal<ColumnDef[]>([
    { id: 'name', label: 'VAT Name', visible: true },
    { id: 'rate', label: 'Rate', visible: true },
    { id: 'status', label: 'Status', visible: true }
  ]);

  filterOptions: FilterOption[] = [
    { label: 'Active', value: 'Active', colorHex: '#10b981' },
    { label: 'Inactive', value: 'Inactive', colorHex: '#64748b' }
  ];

  bulkActions: BulkAction[] = [
    { id: 'mark_active', label: 'Mark as Active', icon: 'las la-check-circle' },
    { id: 'mark_inactive', label: 'Mark as Inactive', icon: 'las la-times-circle' },
    { id: 'delete', label: 'Delete VAT Rates', colorClass: 'text-danger', icon: 'las la-trash' }
  ];

  dynamicBulkActions = computed(() => {
    const selectedIds = this.selectedRateIds();
    if (selectedIds.size === 0) return [];

    const selected = this.vatRates().filter(v => selectedIds.has(v.id));
    const allActive = selected.every(v => v.status === 'Active');
    const allInactive = selected.every(v => v.status === 'Inactive');

    return this.bulkActions.filter(action => {
      if (action.id === 'mark_active') return !allActive;
      if (action.id === 'mark_inactive') return !allInactive;
      return true;
    });
  });

  ngOnInit() {
    this.loadVatRates();
  }

  loadVatRates() {
    this.isLoading.set(true);
    this.vatRateService.getVatRates().subscribe({
      next: (res) => {
        this.vatRates.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading VAT rates:', err);
        this.isLoading.set(false);
        this.notificationService.error('Error loading VAT rates');
      }
    });
  }

  filteredRates = computed(() => {
    let filtered = this.vatRates();
    const filterValue = this.currentFilter();
    const query = this.searchQuery().toLowerCase();
    const col = this.sortColumn();
    const dir = this.sortDirection();

    if (filterValue !== 'All') {
      filtered = filtered.filter(v => v.status === filterValue);
    }

    if (query) {
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(query) ||
        v.rate.toString().includes(query)
      );
    }

    if (col) {
      filtered = [...filtered].sort((a, b) => {
        const valA = (a as any)[col];
        const valB = (b as any)[col];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return dir === 'asc' ? valA - valB : valB - valA;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return dir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        }
      });
    }

    return filtered;
  });

  paginatedRates = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredRates().slice(startIndex, startIndex + this.itemsPerPage());
  });

  onSaveRate(data: any) {
    const toEdit = this.rateToEdit();
    if (toEdit) {
      this.vatRateService.updateVatRate(toEdit.id, data).subscribe({
        next: (res) => {
          this.vatRates.update(prev => prev.map(v => v.id === toEdit.id ? res.data : v));
          this.isAddModalOpen.set(false);
          this.rateToEdit.set(null);
          this.notificationService.success('VAT rate updated successfully');
        },
        error: (err) => {
          console.error('Error updating VAT rate:', err);
          this.notificationService.error(err.error?.message || 'Error updating VAT rate');
        }
      });
    } else {
      this.vatRateService.createVatRate(data).subscribe({
        next: (res) => {
          this.vatRates.update(prev => [res.data, ...prev]);
          this.isAddModalOpen.set(false);
          this.notificationService.success('VAT rate created successfully');
        },
        error: (err) => {
          console.error('Error creating VAT rate:', err);
          this.notificationService.error(err.error?.message || 'Error creating VAT rate');
        }
      });
    }
  }

  handleAction(event: { action: string, data: VatRate }) {
    if (event.action === 'delete') {
      this.rateToDelete.set(event.data);
    } else if (event.action === 'edit') {
      this.rateToEdit.set(event.data);
      this.isAddModalOpen.set(true);
    } else if (event.action === 'mark_active') {
      this.updateStatus(event.data.id, 'Active');
    } else if (event.action === 'mark_inactive') {
      this.updateStatus(event.data.id, 'Inactive');
    }
  }

  updateStatus(id: number, status: 'Active' | 'Inactive') {
    this.vatRateService.updateVatRate(id, { status }).subscribe({
      next: (res) => {
        this.vatRates.update(prev => prev.map(v => v.id === id ? res.data : v));
        this.notificationService.success(`VAT rate marked as ${status}`);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.notificationService.error('Error updating status');
      }
    });
  }

  getActions(rate: VatRate): MenuAction[] {
    return [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' },
      rate.status === 'Active'
        ? { label: 'Mark As Inactive', action: 'mark_inactive', iconClass: 'la-times-circle', customClass: 'edit-btn' }
        : { label: 'Mark As Active', action: 'mark_active', iconClass: 'la-check-circle', customClass: 'edit-btn' },
      { label: 'Delete', action: 'delete', svgIconPath: '/icons/delete.svg', customClass: 'delete-btn' }
    ];
  }

  handleBulkAction(action: string) {
    const selectedIds = Array.from(this.selectedRateIds());
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      this.bulkDeletePending.set(true);
    } else if (action === 'mark_active' || action === 'mark_inactive') {
      const status = action === 'mark_active' ? 'Active' : 'Inactive';
      this.vatRateService.updateBulkStatus(selectedIds, status).subscribe({
        next: () => {
          this.vatRates.update(prev => prev.map(v => 
            selectedIds.includes(v.id) ? { ...v, status } : v
          ));
          this.selectedRateIds.set(new Set());
          this.notificationService.success(`Successfully updated ${selectedIds.length} VAT rates`);
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
    const toDelete = this.rateToDelete();
    const selectedIds = this.selectedRateIds();

    const idsToDelete = isBulk 
      ? Array.from(selectedIds) 
      : (toDelete ? [toDelete.id] : []);

    if (idsToDelete.length === 0) return;

    this.vatRateService.deleteVatRates(idsToDelete).subscribe({
      next: () => {
        this.vatRates.update(prev => prev.filter(v => !idsToDelete.includes(v.id)));
        this.selectedRateIds.update(set => {
          const newSet = new Set(set);
          idsToDelete.forEach(id => newSet.delete(id));
          return newSet;
        });
        this.rateToDelete.set(null);
        this.bulkDeletePending.set(false);
        this.notificationService.success(isBulk ? 'VAT rates deleted' : 'VAT rate deleted');
      },
      error: (err) => {
        console.error('Error deleting VAT rates:', err);
        this.notificationService.error(err.error?.message || 'Error deleting VAT rate(s)');
        this.rateToDelete.set(null);
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
    this.itemsPerPage.set(n === 'All' ? this.vatRates().length : n); 
    this.currentPage.set(1); 
  }
  clearSearch() { this.searchQuery.set(''); }
  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedRateIds.update(set => {
        const newSet = new Set(set);
        this.paginatedRates().forEach(v => newSet.delete(v.id));
        return newSet;
      });
    } else {
      this.selectedRateIds.update(set => {
        const newSet = new Set(set);
        this.paginatedRates().forEach(v => newSet.add(v.id));
        return newSet;
      });
    }
  }
  toggleSelection(id: number) {
    this.selectedRateIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }
  isAllSelected = computed(() => {
    const paginated = this.paginatedRates();
    const selected = this.selectedRateIds();
    return paginated.length > 0 && paginated.every(v => selected.has(v.id));
  });
  isPartiallySelected = computed(() => {
    const paginated = this.paginatedRates();
    const selected = this.selectedRateIds();
    const selectedInPage = paginated.filter(v => selected.has(v.id)).length;
    return selectedInPage > 0 && selectedInPage < paginated.length;
  });

  trackByRateId(index: number, item: VatRate) {
    return item.id;
  }

  trackByColumnId(index: number, column: ColumnDef) {
    return column.id;
  }
}
