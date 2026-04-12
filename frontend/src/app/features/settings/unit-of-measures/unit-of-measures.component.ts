import { Component } from '@angular/core';
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

export interface UOM {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
}

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
  styleUrls: ['./unit-of-measures.component.scss']
})
export class UnitOfMeasuresComponent {
  uoms: UOM[] = [
    { id: '1', name: 'Box', status: 'Active' },
    { id: '2', name: 'Unit', status: 'Active' },
    { id: '3', name: 'Pcs', status: 'Active' },
    { id: '4', name: 'Meter', status: 'Inactive' },
    { id: '5', name: 'Centimeter', status: 'Active' }
  ];

  selectedUomIds = new Set<string>();
  currentPage = 1;
  itemsPerPage = 15;
  isManageColumnsOpen = false;
  isAddModalOpen = false;
  searchQuery = '';
  currentFilter = 'All';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  uomToDelete: UOM | null = null;
  bulkDeletePending = false;

  availableColumns: ColumnDef[] = [
    { id: 'name', label: 'UOM Name', visible: true },
    { id: 'status', label: 'Status', visible: true }
  ];

  filterOptions: FilterOption[] = [
    { label: 'Active', value: 'Active', colorHex: '#10b981' },
    { label: 'Inactive', value: 'Inactive', colorHex: '#64748b' }
  ];

  bulkActions: BulkAction[] = [
    { id: 'delete', label: 'Delete Unit of Measures', colorClass: 'text-danger' }
  ];

  get filteredUoms(): UOM[] {
    let filtered = this.uoms;

    if (this.currentFilter !== 'All') {
      filtered = filtered.filter(u => u.status === this.currentFilter);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  get paginatedUoms(): UOM[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUoms.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSaveUom(data: any) {
    const newUom: UOM = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      status: 'Active'
    };
    this.uoms = [newUom, ...this.uoms];
    this.isAddModalOpen = false;
  }

  handleAction(event: { action: string, data: any }) {
    if (event.action === 'delete') {
      this.uomToDelete = event.data;
    } else if (event.action === 'mark_active') {
      event.data.status = 'Active';
    } else if (event.action === 'mark_inactive') {
      event.data.status = 'Inactive';
    }
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
    if (action === 'delete') {
      this.bulkDeletePending = true;
    }
  }

  confirmDelete() {
    if (this.bulkDeletePending) {
      this.uoms = this.uoms.filter(u => !this.selectedUomIds.has(u.id));
      this.selectedUomIds.clear();
      this.bulkDeletePending = false;
    } else if (this.uomToDelete) {
      this.uoms = this.uoms.filter(u => u.id !== this.uomToDelete!.id);
      this.uomToDelete = null;
    }
  }

  sort(columnId: string, event: Event): void {
    event.stopPropagation();
    if (this.sortColumn === columnId) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnId;
      this.sortDirection = 'asc';
    }

    const direction = this.sortDirection === 'asc' ? 1 : -1;
    this.uoms.sort((a, b) => {
      const valA = (a as any)[columnId];
      const valB = (b as any)[columnId];
      return valA.localeCompare(valB) * direction;
    });
  }

  // Common UI methods
  setFilter(f: string) { this.currentFilter = f; this.currentPage = 1; }
  toggleManageColumns() { this.isManageColumnsOpen = true; }
  closeManageColumns() { this.isManageColumnsOpen = false; }
  onColumnsChange(cols: ColumnDef[]) { this.availableColumns = cols; }
  onPageChange(p: number) { this.currentPage = p; }
  onItemsPerPageChange(n: number | 'All') { 
    this.itemsPerPage = n === 'All' ? this.uoms.length : n; 
    this.currentPage = 1; 
  }
  clearSearch() { this.searchQuery = ''; }
  toggleAll() {
    if (this.isAllSelected()) this.selectedUomIds.clear();
    else this.paginatedUoms.forEach(u => this.selectedUomIds.add(u.id));
  }
  toggleSelection(id: string) {
    if (this.selectedUomIds.has(id)) this.selectedUomIds.delete(id);
    else this.selectedUomIds.add(id);
  }
  isAllSelected(): boolean {
    return this.paginatedUoms.length > 0 && this.paginatedUoms.every(u => this.selectedUomIds.has(u.id));
  }
  isPartiallySelected(): boolean {
    const selectedCount = this.paginatedUoms.filter(u => this.selectedUomIds.has(u.id)).length;
    return selectedCount > 0 && selectedCount < this.paginatedUoms.length;
  }
}
