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

import { AddSalesPartnerModalComponent } from './components/add-sales-partner-modal/add-sales-partner-modal.component';
import { SalesPartner, SalesPartnerService } from './services/sales-partner.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-sales-partners',
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
    AddSalesPartnerModalComponent
  ],
  templateUrl: './sales-partners.component.html',
  styleUrls: ['./sales-partners.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesPartnersComponent implements OnInit {
  private salesPartnerService = inject(SalesPartnerService);
  private notificationService = inject(NotificationService);

  salesPartners = signal<SalesPartner[]>([]);
  isLoading = signal(false);

  selectedSalesPartnerIds = signal<Set<number>>(new Set<number>());
  currentPage = signal(1);
  itemsPerPage = signal(15);
  isManageColumnsOpen = signal(false);
  isAddModalOpen = signal(false);
  searchQuery = signal('');
  currentFilter = signal('All');
  sortColumn = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  partnerToDelete = signal<SalesPartner | null>(null);
  bulkDeletePending = signal(false);

  availableColumns = signal<ColumnDef[]>([
    { id: 'name', label: 'Name', visible: true },
    { id: 'commission', label: 'Commission (%)', visible: true },
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
    { id: 'delete', label: 'Delete Sales Partners', colorClass: 'text-danger', icon: 'las la-trash' }
  ];

  dynamicBulkActions = computed(() => {
    const selectedIds = this.selectedSalesPartnerIds();
    if (selectedIds.size === 0) return [];

    const selected = this.salesPartners().filter(p => selectedIds.has(p.id));
    const allActive = selected.every(p => p.status === 'Active');
    const allInactive = selected.every(p => p.status === 'Inactive');

    return this.bulkActions.filter(action => {
      if (action.id === 'mark_active') return !allActive;
      if (action.id === 'mark_inactive') return !allInactive;
      return true;
    });
  });

  ngOnInit() {
    this.loadSalesPartners();
  }

  loadSalesPartners() {
    this.isLoading.set(true);
    this.salesPartnerService.getSalesPartners().subscribe({
      next: (res) => {
        this.salesPartners.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading sales partners:', err);
        this.isLoading.set(false);
        this.notificationService.error('Error loading sales partners');
      }
    });
  }

  filteredSalesPartners = computed(() => {
    let filtered = this.salesPartners();
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
        (p.description && p.description.toLowerCase().includes(query)) ||
        p.commission.toString().includes(query)
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

  paginatedSalesPartners = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredSalesPartners().slice(startIndex, startIndex + this.itemsPerPage());
  });

  onSaveSalesPartner(data: any) {
    this.salesPartnerService.createSalesPartner(data).subscribe({
      next: (res) => {
        this.salesPartners.update(prev => [res.data, ...prev]);
        this.isAddModalOpen.set(false);
        this.notificationService.success('Sales partner created successfully');
      },
      error: (err) => {
        console.error('Error creating sales partner:', err);
        this.notificationService.error(err.error?.message || 'Error creating sales partner');
      }
    });
  }

  handleAction(event: { action: string, data: SalesPartner }) {
    if (event.action === 'delete') {
      this.partnerToDelete.set(event.data);
    } else if (event.action === 'mark_active') {
      this.updateStatus(event.data.id, 'Active');
    } else if (event.action === 'mark_inactive') {
      this.updateStatus(event.data.id, 'Inactive');
    }
  }

  updateStatus(id: number, status: 'Active' | 'Inactive') {
    this.salesPartnerService.updateSalesPartner(id, { status }).subscribe({
      next: (res) => {
        this.salesPartners.update(prev => prev.map(p => p.id === id ? res.data : p));
        this.notificationService.success(`Sales partner marked as ${status}`);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.notificationService.error('Error updating status');
      }
    });
  }

  getActions(partner: SalesPartner): MenuAction[] {
    return [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' },
      partner.status === 'Active'
        ? { label: 'Mark As Inactive', action: 'mark_inactive', iconClass: 'la-times-circle', customClass: 'edit-btn' }
        : { label: 'Mark As Active', action: 'mark_active', iconClass: 'la-check-circle', customClass: 'edit-btn' },
      { label: 'Delete', action: 'delete', svgIconPath: '/icons/delete.svg', customClass: 'delete-btn' }
    ];
  }

  handleBulkAction(action: string) {
    const selectedIds = Array.from(this.selectedSalesPartnerIds());
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      this.bulkDeletePending.set(true);
    } else if (action === 'mark_active' || action === 'mark_inactive') {
      const status = action === 'mark_active' ? 'Active' : 'Inactive';
      this.salesPartnerService.updateBulkStatus(selectedIds, status).subscribe({
        next: () => {
          this.salesPartners.update(prev => prev.map(p => 
            selectedIds.includes(p.id) ? { ...p, status } : p
          ));
          this.selectedSalesPartnerIds.set(new Set());
          this.notificationService.success(`Successfully updated ${selectedIds.length} sales partners`);
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
    const toDelete = this.partnerToDelete();
    const selectedIds = this.selectedSalesPartnerIds();

    const idsToDelete = isBulk 
      ? Array.from(selectedIds) 
      : (toDelete ? [toDelete.id] : []);

    if (idsToDelete.length === 0) return;

    this.salesPartnerService.deleteSalesPartners(idsToDelete).subscribe({
      next: () => {
        this.salesPartners.update(prev => prev.filter(p => !idsToDelete.includes(p.id)));
        this.selectedSalesPartnerIds.update(set => {
          const newSet = new Set(set);
          idsToDelete.forEach(id => newSet.delete(id));
          return newSet;
        });
        this.partnerToDelete.set(null);
        this.bulkDeletePending.set(false);
        this.notificationService.success(isBulk ? 'Sales partners deleted' : 'Sales partner deleted');
      },
      error: (err) => {
        console.error('Error deleting sales partners:', err);
        this.notificationService.error(err.error?.message || 'Error deleting sales partner(s)');
        this.partnerToDelete.set(null);
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

  // Common UI methods
  setFilter(f: string) { this.currentFilter.set(f); this.currentPage.set(1); }
  toggleManageColumns() { this.isManageColumnsOpen.set(true); }
  closeManageColumns() { this.isManageColumnsOpen.set(false); }
  onColumnsChange(cols: ColumnDef[]) { this.availableColumns.set(cols); }
  onPageChange(p: number) { this.currentPage.set(p); }
  onItemsPerPageChange(n: number | 'All') { 
    this.itemsPerPage.set(n === 'All' ? this.salesPartners().length : n); 
    this.currentPage.set(1); 
  }
  clearSearch() { this.searchQuery.set(''); }
  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedSalesPartnerIds.update(set => {
        const newSet = new Set(set);
        this.paginatedSalesPartners().forEach(p => newSet.delete(p.id));
        return newSet;
      });
    } else {
      this.selectedSalesPartnerIds.update(set => {
        const newSet = new Set(set);
        this.paginatedSalesPartners().forEach(p => newSet.add(p.id));
        return newSet;
      });
    }
  }
  toggleSelection(id: number) {
    this.selectedSalesPartnerIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }
  isAllSelected = computed(() => {
    const paginated = this.paginatedSalesPartners();
    const selected = this.selectedSalesPartnerIds();
    return paginated.length > 0 && paginated.every(p => selected.has(p.id));
  });
  isPartiallySelected = computed(() => {
    const paginated = this.paginatedSalesPartners();
    const selected = this.selectedSalesPartnerIds();
    const selectedInPage = paginated.filter(p => selected.has(p.id)).length;
    return selectedInPage > 0 && selectedInPage < paginated.length;
  });

  trackByPartnerId(index: number, item: SalesPartner) {
    return item.id;
  }

  trackByColumnId(index: number, column: ColumnDef) {
    return column.id;
  }
}
